package com.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.smartcampus.model.UserDocument;

/**
 * DTO for changing a user's role (USER / ADMIN).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateDTO {

    @NotNull(message = "Role is required")
    private UserDocument.Role role;
}
