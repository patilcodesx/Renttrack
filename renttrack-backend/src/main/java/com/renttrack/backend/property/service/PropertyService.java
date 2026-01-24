package com.renttrack.backend.property.service;

import com.renttrack.backend.property.dto.PropertyRequest;
import com.renttrack.backend.property.entity.Property;
import com.renttrack.backend.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository repository;

    public Property create(PropertyRequest req) {
        Property p = Property.builder()
                .title(req.getTitle())
                .address(req.getAddress())
                .price(req.getPrice())
                .bhk(req.getBhk())
                .available(true)
                .tags(req.getTags())
                .images(req.getImages())
                .build();

        return repository.save(p);
    }

    public List<Property> findAll() {
        return repository.findAll();
    }

    public Property findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));
    }

    public Property update(UUID id, PropertyRequest req) {
        Property p = findById(id);

        p.setTitle(req.getTitle());
        p.setAddress(req.getAddress());
        p.setPrice(req.getPrice());
        p.setBhk(req.getBhk());
        p.setTags(req.getTags());
        p.setImages(req.getImages());

        return repository.save(p);
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
