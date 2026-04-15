package com.smartcampus.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document for authenticated users (Member 4).
 * Supports both OAuth2 (Google) and local email/password registration.
 * Stored in the "users" collection.
 */
@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDocument {

    @Id
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Indexed(unique = true)
    private String email;

    /** Hashed password — null for OAuth2-only users. */
    private String password;

    private String picture;

    private Role role = Role.USER;

    /** "google" for OAuth2 users, "local" for email/password users. */
    private String oauthProvider;

    private String oauthId;

    private LocalDateTime createdAt;

    private Boolean emailNotifications = true;

    private Boolean weeklyDigest = true;

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }

    /**
     * Convenience factory for creating a new user from OAuth2 attributes.
     */
    public static UserDocument fromOAuth2(String name, String email, String picture,
                                          String provider, String oauthId) {
        UserDocument user = new UserDocument();
        user.setName(name);
        user.setEmail(email);
        user.setPicture(picture);
        user.setOauthProvider(provider);
        user.setOauthId(oauthId);
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    /**
     * Convenience factory for local (email/password) registration.
     */
    public static UserDocument fromLocal(String name, String email, String hashedPassword) {
        UserDocument user = new UserDocument();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setOauthProvider("local");
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }
}
