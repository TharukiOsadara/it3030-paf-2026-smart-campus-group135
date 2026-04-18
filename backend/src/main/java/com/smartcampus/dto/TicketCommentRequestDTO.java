package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentRequestDTO {

    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    private String content;
}