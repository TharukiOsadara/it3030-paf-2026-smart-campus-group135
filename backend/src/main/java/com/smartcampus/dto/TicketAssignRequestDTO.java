package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketAssignRequestDTO {

    @NotBlank(message = "Technician id is required")
    private String technicianId;
}
