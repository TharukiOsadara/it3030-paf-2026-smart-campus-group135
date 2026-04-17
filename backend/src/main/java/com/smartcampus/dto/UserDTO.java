package com.smartcampus.dto;

import com.smartcampus.model.UserDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning user data in API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String picture;
    private String role;
    private LocalDateTime createdAt;

    public static UserDTO fromDocument(UserDocument doc) {
        return new UserDTO(
                doc.getId(),
                doc.getName(),
                doc.getEmail(),
                doc.getPicture(),
                doc.getRole().name(),
                doc.getCreatedAt()
        );
    }
}
