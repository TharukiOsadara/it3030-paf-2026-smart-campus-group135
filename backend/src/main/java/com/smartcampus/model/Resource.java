package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;

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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private Long createdBy;

    public enum ResourceStatus {
        ACTIVE, OUT_OF_SERVICE
    }
}
