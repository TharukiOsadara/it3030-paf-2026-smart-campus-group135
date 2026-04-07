package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String title;

    @NotBlank(message = "Ticket description is required")
    private String description;

    private String category;

    @NotNull(message = "Priority is required")
    private Ticket.Priority priority;

    private String contactDetails;

    @NotNull(message = "User id is required")
    private Long userId;

    private Long resourceId; // Optional - if incident is for a specific resource

    private String location;
    private Ticket.Status status;
    private Long assignedTo;
    private String resolutionNotes;
}
