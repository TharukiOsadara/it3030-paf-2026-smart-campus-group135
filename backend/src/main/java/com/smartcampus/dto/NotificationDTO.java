package com.smartcampus.dto;

import com.smartcampus.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning notification data in API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private String userId;
    private String message;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationDTO fromDocument(Notification doc) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(doc.getId());
        dto.setUserId(doc.getUserId());
        dto.setMessage(doc.getMessage());
        dto.setType(doc.getType().name());
        dto.setRead(doc.isRead());
        dto.setCreatedAt(doc.getCreatedAt());
        return dto;
    }
}
