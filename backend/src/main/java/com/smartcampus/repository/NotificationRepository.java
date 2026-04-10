package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for Notification documents (Member 4).
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserId(String userId, Sort sort);

    List<Notification> findByUserIdAndIsRead(String userId, boolean isRead, Sort sort);

    long countByUserIdAndIsRead(String userId, boolean isRead);
}
