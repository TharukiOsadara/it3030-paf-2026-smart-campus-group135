package com.smartcampus.controller;

import com.smartcampus.dto.LoginDTO;
import com.smartcampus.dto.RegisterDTO;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.model.UserDocument;
import com.smartcampus.repository.UserDocumentRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for authentication-related endpoints (Member 4).
 * Supports both OAuth2 Google login and local email/password signup/login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserDocumentRepository userDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserDocumentRepository userDocumentRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.userDocumentRepository = userDocumentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    /**
     * POST /api/auth/register — Register a new user with email/password.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        // Check if email already exists
        if (userDocumentRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists"));
        }

        // Create and save new local user
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        UserDocument newUser = UserDocument.fromLocal(dto.getName(), dto.getEmail(), hashedPassword);
        UserDocument saved = userDocumentRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromDocument(saved));
    }

    /**
     * POST /api/auth/login — Login with email/password.
     * Creates a session on success.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            // Return user info
            Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(dto.getEmail());
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(UserDTO.fromDocument(userOpt.get()));
            }

            return ResponseEntity.ok(Map.of("message", "Login successful"));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
    }

    /**
     * GET /api/auth/me — Get the currently authenticated user's info.
     * Works for both OAuth2 and local (email/password) users.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Principal principal,
                                                   @AuthenticationPrincipal OAuth2User oAuth2User) {
        // Try OAuth2 user first
        if (oAuth2User != null) {
            String dbId = oAuth2User.getAttribute("dbId");
            if (dbId != null) {
                Optional<UserDocument> userOpt = userDocumentRepository.findById(dbId);
                if (userOpt.isPresent()) {
                    return ResponseEntity.ok(UserDTO.fromDocument(userOpt.get()));
                }
            }
            String email = oAuth2User.getAttribute("email");
            Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(UserDTO.fromDocument(userOpt.get()));
            }
        }

        // Try local (form-login) user
        if (principal != null) {
            String email = principal.getName();
            Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(UserDTO.fromDocument(userOpt.get()));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    /**
     * POST /api/auth/logout — Logout the current user.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        try {
            SecurityContextHolder.clearContext();
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * PATCH /api/auth/admin/promote/{email} — Non-protected endpoint to promote a user to ADMIN.
     * Requires X-Admin-Key header: admin123 (for development/testing only).
     * In production, use the protected /api/users endpoints instead.
     */
    @PatchMapping("/admin/promote/{email}")
    public ResponseEntity<?> promoteToAdmin(
            @PathVariable String email,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {
        
        // Simple API key check (for development only)
        if (!("admin123".equals(adminKey))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Invalid or missing X-Admin-Key header"));
        }

        Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found with email: " + email));
        }

        UserDocument user = userOpt.get();
        user.setRole(UserDocument.Role.ADMIN);
        UserDocument updated = userDocumentRepository.save(user);

        return ResponseEntity.ok(UserDTO.fromDocument(updated));
    }

    /**
     * PATCH /api/auth/admin/make-technician/{email} — Non-protected endpoint to promote a user to TECHNICIAN.
     * Requires X-Admin-Key header: admin123 (for development/testing only).
     */
    @PatchMapping("/admin/make-technician/{email}")
    public ResponseEntity<?> promoteToTechnician(
            @PathVariable String email,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {
        
        // Simple API key check (for development only)
        if (!("admin123".equals(adminKey))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Invalid or missing X-Admin-Key header"));
        }

        Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found with email: " + email));
        }

        UserDocument user = userOpt.get();
        user.setRole(UserDocument.Role.TECHNICIAN);
        UserDocument updated = userDocumentRepository.save(user);

        return ResponseEntity.ok(UserDTO.fromDocument(updated));
    }

    /**
     * PATCH /api/auth/change-password — Change password for local (email/password) users.
     * OAuth2 users cannot use this endpoint.
     */
    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        String email = principal.getName();
        Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        UserDocument user = userOpt.get();

        // Check if user is OAuth2-only (no password)
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "OAuth2 users cannot change password"));
        }

        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || oldPassword.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Old password and new password are required"));
        }

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Old password is incorrect"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userDocumentRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    /**
     * PATCH /api/auth/change-email — Change email for authenticated users.
     * Local users must provide currentPassword, OAuth2 users are allowed without it.
     * Session is invalidated after success so the user can re-authenticate with the new email.
     */
    @PatchMapping("/change-email")
    public ResponseEntity<?> changeEmail(
            @RequestBody Map<String, String> request,
            Principal principal,
            HttpServletRequest httpServletRequest) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        String currentEmail = principal.getName();
        Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(currentEmail);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        UserDocument user = userOpt.get();
        String newEmail = request.get("newEmail");
        String currentPassword = request.get("currentPassword");

        if (newEmail == null || newEmail.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New email is required"));
        }

        String normalizedNewEmail = newEmail.trim();
        if (normalizedNewEmail.equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "New email must be different from current email"));
        }

        if (userDocumentRepository.existsByEmail(normalizedNewEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists"));
        }

        // Require password verification for local users.
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            if (currentPassword == null || currentPassword.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Current password is required"));
            }
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Current password is incorrect"));
            }
        }

        user.setEmail(normalizedNewEmail);
        userDocumentRepository.save(user);

        SecurityContextHolder.clearContext();
        HttpSession session = httpServletRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(Map.of(
                "message", "Email changed successfully. Please log in again with your new email."
        ));
    }
}
