package com.renttrack.backend.ocr.controller;

import com.renttrack.backend.common.response.ApiResponse;
import com.renttrack.backend.ocr.dto.OcrResult;
import com.renttrack.backend.ocr.service.OcrService;
import com.renttrack.backend.ocr.service.PoiExtractionService;
import com.renttrack.backend.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@CrossOrigin
public class OcrController {

    private final OcrService ocrService;
    private final PoiExtractionService poiExtractionService;
    private final TenantService tenantService;

    /* =====================================================
       EXTRACT — upload doc, get back pre-filled fields
       Used by: Upload.tsx → OcrPreview.tsx
    ===================================================== */
    @PostMapping(
            value = "/extract",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<OcrResult>> extract(
            @RequestParam("file") MultipartFile file) throws Exception {

        String contentType = file.getContentType();
        OcrResult result;

        if (contentType != null && contentType.startsWith("image/")) {
            // Image → Tesseract OCR
            result = ocrService.extractFromImage(file);
        } else if (contentType != null && (
                contentType.contains("wordprocessingml") ||
                contentType.contains("msword") ||
                file.getOriginalFilename().endsWith(".docx")
        )) {
            // Word document → Apache POI
            result = poiExtractionService.extractFromDocx(file);
        } else {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(
                            "Unsupported file type. Upload image (jpg/png) or .docx"
                    )
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success("Extraction complete", result)
        );
    }

    /* =====================================================
       SAVE OCR RESULT TO TENANT
       Called after user reviews and confirms OCR preview
       Used by: OcrPreview.tsx → confirm button
    ===================================================== */
    @PostMapping("/save-to-tenant/{tenantId}")
    public ResponseEntity<ApiResponse<Void>> saveToTenant(
            @PathVariable UUID tenantId,
            @RequestBody OcrResult ocrResult) {

        tenantService.updateOcrFields(
                tenantId,
                ocrResult.getSavedFilePath(),
                ocrResult.getIdNumber(),
                ocrResult.getAddress(),
                ocrResult.getDateOfBirth()
        );

        return ResponseEntity.ok(
                ApiResponse.success("OCR data saved to tenant", null)
        );
    }
}