package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String userId;
    private String name;
    private String email;
    private Ticket.UserRole role;
}
