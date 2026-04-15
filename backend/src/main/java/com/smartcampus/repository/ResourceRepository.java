package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    // MODULE A: Facilities & Assets Catalogue

    /**
     * Find resources by type
     */
    List<Resource> findByType(String type);

    /**
     * Find resources by location
     */
    List<Resource> findByLocation(String location);

    /**
     * Find resources by status
     */
    List<Resource> findByStatus(Resource.ResourceStatus status);

    /**
     * Find active resources by type and capacity
     */
    List<Resource> findByStatusAndTypeAndCapacityGreaterThanEqual(Resource.ResourceStatus status, String type, Integer capacity);

    /**
     * Find resources with capacity greater than or equal to specified value
     */
    List<Resource> findByCapacityGreaterThanEqualAndStatus(Integer capacity, Resource.ResourceStatus status);

    /**
     * Find active resources by type and location
     */
    List<Resource> findByTypeAndLocationAndStatus(String type, String location, Resource.ResourceStatus status);

    /**
     * Search resources by name or description (like)
     */
        List<Resource> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name,
            String location,
            String description);

    /**
     * Find by status and type
     */
    List<Resource> findByStatusAndType(Resource.ResourceStatus status, String type);

    /**
     * Count resources by type
     */
    long countByType(String type);

    /**
     * Count active resources
     */
    long countByStatus(Resource.ResourceStatus status);
}
