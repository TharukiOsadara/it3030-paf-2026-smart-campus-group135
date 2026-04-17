package com.smartcampus.controller;

import com.smartcampus.dto.RoleUpdateDTO;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.dto.UserUpdateDTO;
import com.smartcampus.service.UserDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST controller for user management (Member 4).
 * All endpoints require ADMIN role (configured in SecurityConfig).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserDocumentService userDocumentService;

    public UserController(UserDocumentService userDocumentService) {
        this.userDocumentService = userDocumentService;
    }

    /**
     * GET /api/users — Get all users (ADMIN only).
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userDocumentService.getAllUsers());
    }

    /**
     * GET /api/users/{id} — Get a single user by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userDocumentService.getUserById(id));
    }

    /**
     * PUT /api/users/{id} — Update user profile.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateDTO dto) {
        return ResponseEntity.ok(userDocumentService.updateUser(id, dto));
    }

    /**
     * DELETE /api/users/{id} — Delete a user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userDocumentService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/users/{id}/role — Change user role by ID.
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserDTO> changeRole(
            @PathVariable String id,
            @Valid @RequestBody RoleUpdateDTO dto) {
        return ResponseEntity.ok(userDocumentService.changeRole(id, dto));
    }

    /**
     * PATCH /api/users/email/{email}/role — Change user role by email (ADMIN only).
     */
    @PatchMapping("/email/{email}/role")
    public ResponseEntity<UserDTO> changeRoleByEmail(
            @PathVariable String email,
            @Valid @RequestBody RoleUpdateDTO dto) {
        return ResponseEntity.ok(userDocumentService.changeRoleByEmail(email, dto));
    }

    /**
     * PATCH /api/users/email-preferences — Update email preferences for the authenticated user.
     */
    @PatchMapping("/email-preferences")
    public ResponseEntity<?> updateEmailPreferences(
            @RequestBody Map<String, Boolean> preferences,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        return ResponseEntity.ok(userDocumentService.updateEmailPreferences(principal.getName(), preferences));
    }

    /**
     * DELETE /api/users/account — Delete the authenticated user's account.
     */
    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        userDocumentService.deleteUserByEmail(principal.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
