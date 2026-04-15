package com.smartcampus.repository;

import com.smartcampus.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find user by email (OAuth identifier)
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by OAuth provider and OAuth ID
     */
    Optional<User> findByOauthProviderAndOauthId(String provider, String oauthId);

    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);
}
