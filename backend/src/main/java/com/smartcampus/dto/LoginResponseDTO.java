package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for login response containing user info and JWT token.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

    private String id;
    private String name;
    private String email;
    private String role;
    private String accessToken;
    private String tokenType = "Bearer";
    private Long expiresIn;  // in seconds

}
