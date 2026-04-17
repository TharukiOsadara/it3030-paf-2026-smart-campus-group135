package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private String rejectionReason;

    private LocalDateTime firstResponseAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<Attachment> attachments = new ArrayList<>();

    private List<Comment> comments = new ArrayList<>();

    private List<Activity> activities = new ArrayList<>();

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

    public enum UserRole {
        USER,
        STAFF,
        TECHNICIAN,
        ADMIN
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attachment {
        private String id;
        private String originalFileName;
        private String storedFileName;
        private String contentType;
        private long sizeBytes;
        private String uploadedBy;
        private LocalDateTime uploadedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Comment {
        private String id;
        private String userId;
        private UserRole userRole;
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Activity {
        private String id;
        private String type;
        private String actorId;
        private UserRole actorRole;
        private String content;
        private LocalDateTime createdAt;
    }
}
