package com.renttrack.backend.property.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    private String address;
    private int bhk;
    private double price;

    @Builder.Default
    private boolean available = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "property_images",
            joinColumns = @JoinColumn(name = "property_id")
    )
    @Column(name = "images")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "property_tags",
            joinColumns = @JoinColumn(name = "property_id")
    )
    @Column(name = "tags")
    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
