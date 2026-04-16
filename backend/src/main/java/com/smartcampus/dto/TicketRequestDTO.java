package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MODULE C: Ticket Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {
    @NotBlank(message = "Ticket title is required")
    @Size(max = 120, message = "Title must be at most 120 characters")
    private String title;

    @NotBlank(message = "Ticket description is required")
    @Size(max = 2000, message = "Description must be at most 2000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 80, message = "Category must be at most 80 characters")
    private String category;

    @NotNull(message = "Priority is required")
    private Ticket.Priority priority;

    @Size(max = 250, message = "Contact details must be at most 250 characters")
    private String contactDetails;

    @NotNull(message = "User id is required")
    @Size(max = 120, message = "User id must be at most 120 characters")
    private String userId;

    private String resourceId; // Optional - if incident is for a specific resource

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must be at most 200 characters")
    private String location;

    private Ticket.Status status;
    private String assignedTo;

    @Size(max = 2000, message = "Resolution notes must be at most 2000 characters")
    private String resolutionNotes;

    @Size(max = 2000, message = "Rejection reason must be at most 2000 characters")
    private String rejectionReason;

    @Email(message = "Preferred email must be valid")
    private String preferredEmail;

    @Pattern(regexp = "^$|^[0-9+()\\-\\s]{7,20}$", message = "Preferred phone must be a valid phone number")
    private String preferredPhone;
}
