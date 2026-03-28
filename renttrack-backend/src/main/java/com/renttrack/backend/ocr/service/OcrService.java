package com.renttrack.backend.ocr.service;

import com.renttrack.backend.ocr.dto.OcrResult;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OcrService {

    @Value("${tesseract.datapath}")
    private String tessDataPath;

    @Value("${tesseract.language}")
    private String language;

    @Value("${tesseract.oem:1}")
    private int oem;

    @Value("${tesseract.psm:3}")
    private int psm;

    @Value("${ocr.upload.dir:/app/uploads/ocr}")
    private String ocrUploadDir;

    /* =====================================================
       MAIN ENTRY — process uploaded image
    ===================================================== */
    public OcrResult extractFromImage(MultipartFile file) throws Exception {

        // 1. Save file to disk
        String savedPath = saveFile(file);

        // 2. Load original image
        BufferedImage original = ImageIO.read(file.getInputStream());

        // 3. Crop and save face region (top-left of Aadhaar card)
        String profileImageUrl = cropAndSaveFace(original, file.getOriginalFilename());

        // 4. Preprocess for OCR
        BufferedImage processed = preprocessImage(original);

        // 5. Run Tesseract
        ITesseract tesseract = buildTesseract();
        String rawText = tesseract.doOCR(processed);

        // 6. Parse extracted text
        OcrResult result = parseText(rawText);
        result.setRawText(rawText);
        result.setDocumentType("IMAGE");
        result.setSavedFilePath(savedPath);
        result.setConfidence(calculateConfidence(result));

        // 7. Set cropped profile image URL
        if (profileImageUrl != null) {
            result.setProfileImageUrl(profileImageUrl);
        }

        return result;
    }

    /* =====================================================
       FACE CROP — crops top-left region of Aadhaar card
       Aadhaar layout: photo is always at ~x:40,y:180 size 120x150
       We calculate proportional crop so it works at any image size
    ===================================================== */
    private String cropAndSaveFace(BufferedImage original, String originalFilename) {
        try {
            int w = original.getWidth();
            int h = original.getHeight();

            // Aadhaar card is 856x540 → photo at x:40,y:180 size:120x150
            // Calculate proportional crop region
            int cropX      = (int) (w * 0.04);   // ~4% from left
            int cropY      = (int) (h * 0.30);   // ~30% from top
            int cropWidth  = (int) (w * 0.16);   // ~16% of width
            int cropHeight = (int) (h * 0.32);   // ~32% of height

            // Clamp to image bounds
            cropX      = Math.max(0, Math.min(cropX, w - 10));
            cropY      = Math.max(0, Math.min(cropY, h - 10));
            cropWidth  = Math.min(cropWidth,  w - cropX);
            cropHeight = Math.min(cropHeight, h - cropY);

            if (cropWidth <= 0 || cropHeight <= 0) return null;

            // Crop the face region
            BufferedImage face = original.getSubimage(cropX, cropY, cropWidth, cropHeight);

            // Resize to standard profile photo size 200x200
            BufferedImage resized = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = resized.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2d.drawImage(face, 0, 0, 200, 200, null);
            g2d.dispose();

            // Save to uploads/ocr/profile_<uuid>.jpg
            Path dir = Paths.get(ocrUploadDir);
            Files.createDirectories(dir);
            String filename = "profile_" + UUID.randomUUID() + ".jpg";
            File outFile = dir.resolve(filename).toFile();
            ImageIO.write(resized, "jpg", outFile);

            // Return URL path frontend can use
            return "/uploads/ocr/" + filename;

        } catch (Exception e) {
            System.err.println("Face crop failed: " + e.getMessage());
            return null;
        }
    }

    /* =====================================================
       IMAGE PREPROCESSING — better image = better OCR
    ===================================================== */
    private BufferedImage preprocessImage(BufferedImage original) {

        int scaledWidth  = original.getWidth()  * 2;
        int scaledHeight = original.getHeight() * 2;

        BufferedImage scaled = new BufferedImage(scaledWidth, scaledHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = scaled.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.drawImage(original, 0, 0, scaledWidth, scaledHeight, null);
        g2d.dispose();

        BufferedImage gray = new BufferedImage(scaledWidth, scaledHeight, BufferedImage.TYPE_BYTE_GRAY);
        Graphics grayG = gray.getGraphics();
        grayG.drawImage(scaled, 0, 0, null);
        grayG.dispose();

        return increaseContrast(gray);
    }

    private BufferedImage increaseContrast(BufferedImage image) {
        BufferedImage result = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int pixel = image.getRGB(x, y) & 0xFF;
                int newPixel = pixel < 128 ? 0 : 255;
                int rgb = (newPixel << 16) | (newPixel << 8) | newPixel;
                result.setRGB(x, y, rgb);
            }
        }
        return result;
    }

    /* =====================================================
       TESSERACT SETUP
    ===================================================== */
    private ITesseract buildTesseract() {
        ITesseract instance = new Tesseract();
        instance.setDatapath(tessDataPath);
        instance.setLanguage(language);
        instance.setOcrEngineMode(oem);
        instance.setPageSegMode(psm);
        instance.setTessVariable("tessedit_char_whitelist",
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,/-:@");
        return instance;
    }

    /* =====================================================
       TEXT PARSING — regex extraction
    ===================================================== */
    private OcrResult parseText(String text) {

        OcrResult result = new OcrResult();

        // Full Name
        result.setFullName(extract(text,
                "(?i)(name|full\\s*name|tenant\\s*name)\\s*[:\\-]?\\s*([A-Za-z][A-Za-z\\s]{2,40})", 2));

        // Email
        result.setEmail(extract(text,
                "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", 0));

        // Phone
        result.setPhone(extract(text,
                "(?i)(phone|mobile)[:\\s]*(\\+?\\d[\\d\\s\\-]{8,14}\\d)", 2));
        if (result.getPhone() == null || result.getPhone().isEmpty()) {
            result.setPhone(extract(text, "(\\+?91[-\\s]?\\d{10}|\\b\\d{10}\\b)", 1));
        }

        // Aadhaar / Govt ID — digits only e.g. "1234 5678 4521"
        result.setIdNumber(extract(text,
                "(\\d{4}\\s\\d{4}\\s\\d{4})", 1));

        // Date of Birth
        result.setDateOfBirth(extract(text,
                "(?i)(dob|date\\s*of\\s*birth|born)\\s*[:\\-]?\\s*(\\d{1,2}[/\\-.]\\d{1,2}[/\\-.]\\d{2,4})", 2));

        // Address
        result.setAddress(extract(text,
                "(?i)(address|addr|residence)\\s*[:\\-]?\\s*(.{10,100})", 2));

        // Monthly Rent
        result.setMonthlyRent(extract(text,
                "(?i)(rent|monthly\\s*rent|amount)\\s*[:\\-]?\\s*([\\$₹]?\\s*[\\d,]+\\.?\\d*)", 2));

        // Lease Dates
        result.setLeaseStart(extract(text,
                "(?i)(lease\\s*start|start\\s*date|from)\\s*[:\\-]?\\s*(\\d{1,2}[/\\-.]\\d{1,2}[/\\-.]\\d{2,4})", 2));
        result.setLeaseEnd(extract(text,
                "(?i)(lease\\s*end|end\\s*date|to|until)\\s*[:\\-]?\\s*(\\d{1,2}[/\\-.]\\d{1,2}[/\\-.]\\d{2,4})", 2));

        // Unit Number
        result.setUnitNumber(extract(text,
                "(?i)(unit|flat|apt|apartment|room)\\s*[:\\-#]?\\s*([A-Z0-9\\-]{1,10})", 2));

        return result;
    }

    /* =====================================================
       REGEX HELPER
    ===================================================== */
    private String extract(String text, String regex, int group) {
        try {
            Pattern p = Pattern.compile(regex);
            Matcher m = p.matcher(text);
            if (m.find()) {
                String val = group == 0 ? m.group() : m.group(group);
                return val != null ? val.trim() : null;
            }
        } catch (Exception ignored) {}
        return null;
    }

    /* =====================================================
       FILE SAVE
    ===================================================== */
    private String saveFile(MultipartFile file) throws IOException {
        Path dir = Paths.get(ocrUploadDir);
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return dest.toString();
    }

    /* =====================================================
       CONFIDENCE SCORE
    ===================================================== */
    private double calculateConfidence(OcrResult result) {
        int filled = 0, total = 6;
        if (result.getFullName()    != null && !result.getFullName().isEmpty())    filled++;
        if (result.getEmail()       != null && !result.getEmail().isEmpty())       filled++;
        if (result.getPhone()       != null && !result.getPhone().isEmpty())       filled++;
        if (result.getIdNumber()    != null && !result.getIdNumber().isEmpty())    filled++;
        if (result.getDateOfBirth() != null && !result.getDateOfBirth().isEmpty()) filled++;
        if (result.getAddress()     != null && !result.getAddress().isEmpty())     filled++;
        return (double) filled / total * 100.0;
    }
}
