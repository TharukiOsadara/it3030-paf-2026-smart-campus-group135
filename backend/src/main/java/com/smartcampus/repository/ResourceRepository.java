package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB Repository for Resource documents
 * Handles resource data access operations
 */
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

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
    List<Resource> findByStatusAndTypeAndCapacityGreaterThanEqual(
            Resource.ResourceStatus status, String type, Integer capacity);

    /**
     * Find resources with capacity greater than or equal to specified value and status
     */
    List<Resource> findByCapacityGreaterThanEqualAndStatus(Integer capacity, Resource.ResourceStatus status);

    /**
     * Find active resources by type and location
     */
    List<Resource> findByTypeAndLocationAndStatus(String type, String location, Resource.ResourceStatus status);

    /**
     * Search resources by name, location, or description
     */
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'location': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    List<Resource> searchResources(String search);

    /**
     * Find by status and type
     */
    List<Resource> findByStatusAndType(Resource.ResourceStatus status, String type);

    /**
     * Count resources by type
     */
    Long countByType(String type);

    /**
     * Count active resources
     */
    Long countByStatus(Resource.ResourceStatus status);
}
