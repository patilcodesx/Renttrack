package com.renttrack.backend.property.repository;

import com.renttrack.backend.property.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {

    @Query("SELECT p FROM Property p LEFT JOIN FETCH p.landlord WHERE p.landlord.id = :landlordId")
    List<Property> findByLandlordId(UUID landlordId);

    @Query("SELECT p FROM Property p LEFT JOIN FETCH p.landlord")
    List<Property> findAllWithLandlord();
}