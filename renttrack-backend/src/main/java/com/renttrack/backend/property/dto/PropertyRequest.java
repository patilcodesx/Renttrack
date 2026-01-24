package com.renttrack.backend.property.dto;

import lombok.Data;

import java.util.List;

@Data
public class PropertyRequest {

    private String title;
    private String address;
    private int bhk;
    private double price;
    private boolean available;
    private List<String> images;
    private List<String> tags;
}
