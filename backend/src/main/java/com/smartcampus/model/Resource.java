package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * MongoDB Document for Resource management
 * Represents facilities and assets in the Smart Campus system
 */
@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;  // MongoDB ObjectId as String

    @NotBlank(message = "Resource name is required")
    private String name;

    private String description;

    @NotBlank(message = "Resource type is required")
    private String type; // e.g., LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    @NotBlank(message = "Resource location is required")
    private String location;

    @PositiveOrZero(message = "Capacity must be zero or positive")
    private Integer capacity;

    private ResourceStatus status; // ACTIVE, OUT_OF_SERVICE

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;  // User ID (String for MongoDB)

    /**
     * Constructor for creating new resources
     */
    public static Resource create(String name, String description, String type, 
                                   String location, Integer capacity, 
                                   ResourceStatus status, LocalTime start, LocalTime end) {
        Resource resource = new Resource();
        resource.setName(name);
        resource.setDescription(description);
        resource.setType(type);
        resource.setLocation(location);
        resource.setCapacity(capacity);
        resource.setStatus(status);
        resource.setAvailabilityStart(start);
        resource.setAvailabilityEnd(end);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        return resource;
    }

    public enum ResourceStatus {
        ACTIVE, OUT_OF_SERVICE
    }
}
