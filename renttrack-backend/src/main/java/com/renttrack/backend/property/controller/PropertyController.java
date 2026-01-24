package com.renttrack.backend.property.controller;

import com.renttrack.backend.property.dto.PropertyRequest;
import com.renttrack.backend.property.entity.Property;
import com.renttrack.backend.property.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin
public class PropertyController {

    private final PropertyService service;

    @PostMapping
    public Property create(@RequestBody PropertyRequest req) {
        return service.create(req);
    }

    @GetMapping
    public List<Property> getAll() {
        return service.findAll();
    }

    // ✅ SINGLE PROPERTY DETAILS
    @GetMapping("/{id}")
    public Property getById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public Property update(
            @PathVariable UUID id,
            @RequestBody PropertyRequest req
    ) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
