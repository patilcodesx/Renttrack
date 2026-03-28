package com.renttrack.backend.property.controller;

import com.renttrack.backend.property.dto.PropertyRequest;
import com.renttrack.backend.property.dto.PropertyResponse;
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
    public PropertyResponse create(@RequestBody PropertyRequest req) {
        return PropertyService.toResponse(service.create(req));
    }

    @GetMapping
public List<PropertyResponse> getAll() {
    return service.findAll(); // service now returns List<PropertyResponse>
}

    @GetMapping("/{id}")
    public PropertyResponse getById(@PathVariable UUID id) {
        return PropertyService.toResponse(service.findById(id));
    }

    @PutMapping("/{id}")
    public PropertyResponse update(
            @PathVariable UUID id,
            @RequestBody PropertyRequest req
    ) {
        return PropertyService.toResponse(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}