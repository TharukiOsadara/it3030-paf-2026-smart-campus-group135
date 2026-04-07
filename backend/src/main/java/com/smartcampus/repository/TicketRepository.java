package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT t FROM Ticket t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:category IS NULL OR LOWER(t.category) = LOWER(:category)) AND " +
            "(:assignedTo IS NULL OR t.assignedTo = :assignedTo) AND " +
            "(:userId IS NULL OR t.userId = :userId) AND " +
            "(:resourceId IS NULL OR t.resourceId = :resourceId) AND " +
            "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Ticket> findByFilters(
            @Param("status") Ticket.Status status,
            @Param("priority") Ticket.Priority priority,
            @Param("category") String category,
            @Param("assignedTo") Long assignedTo,
            @Param("userId") Long userId,
            @Param("resourceId") Long resourceId,
            @Param("search") String search
    );
}
