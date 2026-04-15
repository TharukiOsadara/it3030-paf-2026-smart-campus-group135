package com.smartcampus.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String email;

    private String name;

    private String picture;

    private UserRole role; // USER, ADMIN, TECHNICIAN

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // OAuth2 fields
    private String oauthProvider; // e.g., "google"
    private String oauthId;

    public enum UserRole {
        USER, ADMIN, TECHNICIAN, MANAGER
    }
}
