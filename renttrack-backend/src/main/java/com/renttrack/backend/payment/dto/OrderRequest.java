package com.renttrack.backend.payment.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class OrderRequest {

    
    private BigDecimal amount;
    private String currency;       // default INR
    private String description;
    private LocalDate dueDate;
}