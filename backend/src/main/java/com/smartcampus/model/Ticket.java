package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    private String resourceId;

    @NotNull(message = "User id is required")
    private String userId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String category;

    private String location;

    private Priority priority;

    private Status status;

    private String assignedTo;

    private String resolutionNotes;

    private String contactDetails;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED,
        REJECTED
    }
}
