package com.renttrack.backend.property.service;
import com.renttrack.backend.property.dto.PropertyRequest;
import com.renttrack.backend.property.dto.PropertyResponse;
import com.renttrack.backend.property.entity.Property;
import com.renttrack.backend.property.repository.PropertyRepository;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;

import com.renttrack.backend.common.enums.Role;
@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository repository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;  // ✅ inject tenant repo
    @Transactional
   public Property create(PropertyRequest req) {

    User currentUser = getCurrentUser();

  if (currentUser.getRole() != Role.LANDLORD &&
    currentUser.getRole() != Role.ADMIN) {
        throw new RuntimeException("Only landlord can create property");
    }

    Property p = Property.builder()
            .title(req.getTitle())
            .address(req.getAddress())
            .price(req.getPrice())
            .bhk(req.getBhk())
            .available(true)
            .landlord(currentUser)   // 🔥 CRITICAL
            .tags(req.getTags() != null ? req.getTags() : new ArrayList<>())
            .images(req.getImages() != null ? req.getImages() : new ArrayList<>())
            .build();

    return repository.save(p);
}
   @Transactional(readOnly = true)
public List<PropertyResponse> findAll() {
    User currentUser = getCurrentUser();
    List<Property> properties;
    
    if (currentUser.getRole() == Role.ADMIN) {
        properties = repository.findAll();
    } else if (currentUser.getRole() == Role.LANDLORD) {
        properties = repository.findByLandlordId(currentUser.getId());
    } else {
        throw new RuntimeException("Access denied");
    }
    
    // Map INSIDE the transaction so session is still open
    return properties.stream()
            .map(PropertyService::toResponse)
            .toList();
}
   @Transactional(readOnly = true)
   public Property findById(UUID id) {

    Property property = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Property not found"));

    User currentUser = getCurrentUser();

    if (currentUser.getRole() == Role.ADMIN) {
        return property;
    }

    if (!property.getLandlord().getId()
            .equals(currentUser.getId())) {
        throw new RuntimeException("Access denied");
    }

    return property;
}
   @Transactional
 public Property update(UUID id, PropertyRequest req) {

    Property p = findById(id); // already ownership validated

    p.setTitle(req.getTitle());
    p.setAddress(req.getAddress());
    p.setPrice(req.getPrice());
    p.setBhk(req.getBhk());
    p.setTags(req.getTags() != null ? req.getTags() : new ArrayList<>());
    p.setImages(req.getImages() != null ? req.getImages() : new ArrayList<>());

    return repository.save(p);
}

  @Transactional
public void delete(UUID id) {

    Property property = findById(id); // already ownership validated

    List<Tenant> tenants = tenantRepository.findByPropertyId(id);
    for (Tenant t : tenants) {
        t.setProperty(null);
    }

    repository.delete(property);
}

    private User getCurrentUser() {
    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
}

public static PropertyResponse toResponse(Property p) {
    return PropertyResponse.builder()
            .id(p.getId())
            .title(p.getTitle())
            .address(p.getAddress())
            .bhk(p.getBhk())
            .price(p.getPrice())
            .available(p.isAvailable())
            .images(p.getImages())
            .tags(p.getTags())
            .landlordId(p.getLandlord() != null ? p.getLandlord().getId() : null)
            .landlordName(p.getLandlord() != null ? p.getLandlord().getName() : null)
            .landlordEmail(p.getLandlord() != null ? p.getLandlord().getEmail() : null)
            .build();
}
}
