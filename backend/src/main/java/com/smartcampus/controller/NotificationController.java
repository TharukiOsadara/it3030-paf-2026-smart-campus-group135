package com.smartcampus.controller;

import com.smartcampus.dto.NotificationCreateDTO;
import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.model.UserDocument;
import com.smartcampus.repository.UserDocumentRepository;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for notification operations (Member 4).
 * All endpoints require authenticated user.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserDocumentRepository userDocumentRepository;

    public NotificationController(NotificationService notificationService,
                                  UserDocumentRepository userDocumentRepository) {
        this.notificationService = notificationService;
        this.userDocumentRepository = userDocumentRepository;
    }

    /**
     * GET /api/notifications — Get current user's notifications.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(
            Principal principal,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        String userId = resolveCurrentUserId(principal, oAuth2User);
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    /**
     * GET /api/notifications/unread-count — Get unread count for current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Principal principal,
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        String userId = resolveCurrentUserId(principal, oAuth2User);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * POST /api/notifications — Create a new notification.
     */
    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(
            @Valid @RequestBody NotificationCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(dto));
    }

    /**
     * PATCH /api/notifications/{id}/read — Mark notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    private String resolveCurrentUserId(Principal principal, OAuth2User oAuth2User) {
        if (oAuth2User != null) {
            String dbId = oAuth2User.getAttribute("dbId");
            if (dbId != null && !dbId.isBlank()) {
                return dbId;
            }

            String email = oAuth2User.getAttribute("email");
            if (email != null && !email.isBlank()) {
                Optional<UserDocument> userByEmail = userDocumentRepository.findByEmail(email);
                if (userByEmail.isPresent()) {
                    return userByEmail.get().getId();
                }
            }
        }

        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            Optional<UserDocument> userByEmail = userDocumentRepository.findByEmail(principal.getName());
            if (userByEmail.isPresent()) {
                return userByEmail.get().getId();
            }
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }
}
