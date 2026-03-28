package com.renttrack.backend.ocr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrResult {

    private String fullName;
    private String email;
    private String phone;
    private String idNumber;
    private String dateOfBirth;
    private String address;

    private String unitNumber;
    private String monthlyRent;
    private String leaseStart;
    private String leaseEnd;

    private String rawText;
    private String documentType;
    private double confidence;
    private String savedFilePath;
    private String profileImageUrl;
}
