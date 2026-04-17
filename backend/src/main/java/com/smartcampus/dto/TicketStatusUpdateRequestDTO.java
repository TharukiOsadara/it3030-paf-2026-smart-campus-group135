package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatusUpdateRequestDTO {

    @NotNull(message = "Status is required")
    private Ticket.Status status;

    private String resolutionNotes;

    private String rejectionReason;
}
