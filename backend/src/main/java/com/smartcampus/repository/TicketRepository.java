package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

        List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);

        long countByStatus(Ticket.Status status);
}
