package com.renttrack.backend.property.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PropertyResponse {
    private UUID id;
    private String title;
    private String address;
    private int bhk;
    private double price;
    private boolean available;
    private List<String> images;
    private List<String> tags;
    private UUID landlordId;
    private String landlordName;
    private String landlordEmail;
}