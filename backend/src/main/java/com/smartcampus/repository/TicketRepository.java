package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    @Query("{ $and: [" +
            "{ $or: [{ status: ?0 }, { status: { $exists: false } }] }, " +
            "{ $or: [{ priority: ?1 }, { priority: { $exists: false } }] }, " +
            "{ $or: [{ category: ?2 }, { category: { $exists: false } }] }, " +
            "{ $or: [{ assignedTo: ?3 }, { assignedTo: { $exists: false } }] }, " +
            "{ $or: [{ userId: ?4 }, { userId: { $exists: false } }] }, " +
            "{ $or: [{ resourceId: ?5 }, { resourceId: { $exists: false } }] }, " +
            "{ $or: [{ title: { $regex: ?6, $options: 'i' } }, { description: { $regex: ?6, $options: 'i' } }, { $expr: { $eq: [?6, null] } }] }" +
            "]}")
    List<Ticket> findByFilters(
            @Param("status") Ticket.Status status,
            @Param("priority") Ticket.Priority priority,
            @Param("category") String category,
            @Param("assignedTo") String assignedTo,
            @Param("userId") String userId,
            @Param("resourceId") String resourceId,
            @Param("search") String search
    );
}
