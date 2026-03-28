package com.renttrack.backend.ocr.service;

import com.renttrack.backend.ocr.dto.OcrResult;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class PoiExtractionService {

    /* =====================================================
       MAIN ENTRY — extract from .docx form
    ===================================================== */
    public OcrResult extractFromDocx(MultipartFile file) throws Exception {

        OcrResult result = new OcrResult();
        result.setDocumentType("DOCX");

        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {

            // Strategy 1: Extract from tables (most common form format)
            extractFromTables(doc, result);

            // Strategy 2: Extract from paragraphs (label: value format)
            if (isEmpty(result)) {
                extractFromParagraphs(doc, result);
            }

            // Strategy 3: raw text fallback
            if (isEmpty(result)) {
                String raw = extractRawText(doc);
                result.setRawText(raw);
            }
        }

        result.setConfidence(calculateConfidence(result));
        return result;
    }

    /* =====================================================
       STRATEGY 1 — Table extraction
       Handles forms like:
       | Name     | John Doe    |
       | Email    | john@...    |
    ===================================================== */
    private void extractFromTables(XWPFDocument doc, OcrResult result) {

        for (XWPFTable table : doc.getTables()) {
            for (XWPFTableRow row : table.getRows()) {

                List<XWPFTableCell> cells = row.getTableCells();
                if (cells.size() < 2) continue;

                String label = cells.get(0).getText()
                        .trim().toLowerCase();
                String value = cells.get(1).getText().trim();

                if (value.isEmpty()) continue;

                mapLabelToField(label, value, result);
            }
        }
    }

    /* =====================================================
       STRATEGY 2 — Paragraph extraction
       Handles forms like:
       Name: John Doe
       Email: john@example.com
    ===================================================== */
    private void extractFromParagraphs(XWPFDocument doc, OcrResult result) {

        for (XWPFParagraph para : doc.getParagraphs()) {
            String line = para.getText().trim();
            if (!line.contains(":")) continue;

            String[] parts = line.split(":", 2);
            if (parts.length < 2) continue;

            String label = parts[0].trim().toLowerCase();
            String value = parts[1].trim();

            if (value.isEmpty()) continue;

            mapLabelToField(label, value, result);
        }
    }

    /* =====================================================
       LABEL → FIELD MAPPING
    ===================================================== */
    private void mapLabelToField(String label, String value, OcrResult result) {

        if (matches(label, "name", "full name", "tenant name")) {
            result.setFullName(value);

        } else if (matches(label, "email", "e-mail", "email address")) {
            result.setEmail(value);

        } else if (matches(label, "phone", "mobile", "contact", "phone number")) {
            result.setPhone(value);

        } else if (matches(label, "id", "id no", "id number",
                "passport", "aadhar", "pan", "national id")) {
            result.setIdNumber(value);

        } else if (matches(label, "dob", "date of birth", "birth date", "born")) {
            result.setDateOfBirth(value);

        } else if (matches(label, "address", "addr",
                "residence", "home address")) {
            result.setAddress(value);

        } else if (matches(label, "rent", "monthly rent",
                "amount", "rental amount")) {
            result.setMonthlyRent(value);

        } else if (matches(label, "unit", "flat", "apt",
                "apartment", "room", "unit no")) {
            result.setUnitNumber(value);

        } else if (matches(label, "lease start", "start date",
                "from", "commencement")) {
            result.setLeaseStart(value);

        } else if (matches(label, "lease end", "end date",
                "to", "until", "expiry")) {
            result.setLeaseEnd(value);
        }
    }

    /* =====================================================
       HELPERS
    ===================================================== */
    private boolean matches(String label, String... keywords) {
        for (String keyword : keywords) {
            if (label.contains(keyword)) return true;
        }
        return false;
    }

    private String extractRawText(XWPFDocument doc) {
        StringBuilder sb = new StringBuilder();
        for (XWPFParagraph p : doc.getParagraphs()) {
            sb.append(p.getText()).append("\n");
        }
        return sb.toString();
    }

    private boolean isEmpty(OcrResult result) {
        return result.getFullName() == null
                && result.getEmail() == null
                && result.getPhone() == null;
    }

    private double calculateConfidence(OcrResult result) {
        int total = 8, found = 0;
        if (result.getFullName()    != null) found++;
        if (result.getEmail()       != null) found++;
        if (result.getPhone()       != null) found++;
        if (result.getIdNumber()    != null) found++;
        if (result.getDateOfBirth() != null) found++;
        if (result.getAddress()     != null) found++;
        if (result.getMonthlyRent() != null) found++;
        if (result.getLeaseStart()  != null) found++;
        return (double) found / total;
    }
}