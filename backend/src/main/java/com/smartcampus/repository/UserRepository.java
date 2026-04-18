package com.smartcampus.repository;

import com.smartcampus.model.User;
import com.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Ticket.UserRole role);
}
