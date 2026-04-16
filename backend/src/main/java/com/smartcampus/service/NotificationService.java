package com.smartcampus.service;

import com.smartcampus.dto.NotificationCreateDTO;
import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for notification operations (Member 4).
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Get all notifications for a user, sorted by createdAt DESC.
     */
    public List<NotificationDTO> getNotificationsByUserId(String userId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        return notificationRepository.findByUserId(userId, sort)
                .stream()
                .map(NotificationDTO::fromDocument)
                .collect(Collectors.toList());
    }

    /**
     * Create a new notification.
     */
    public NotificationDTO createNotification(NotificationCreateDTO dto) {
        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return NotificationDTO.fromDocument(notificationRepository.save(notification));
    }

    /**
     * Mark a notification as read.
     */
    public NotificationDTO markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setRead(true);
        return NotificationDTO.fromDocument(notificationRepository.save(notification));
    }

    /**
     * Get count of unread notifications for a user.
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
}
