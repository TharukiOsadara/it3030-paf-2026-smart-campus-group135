package com.smartcampus.controller;

import com.smartcampus.dto.NotificationCreateDTO;
import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for notification operations (Member 4).
 * All endpoints require authenticated user.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/notifications — Get current user's notifications.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("dbId");
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    /**
     * GET /api/notifications/unread-count — Get unread count for current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getAttribute("dbId");
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
}
