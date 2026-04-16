package com.smartcampus.repository;

import com.smartcampus.model.UserDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * MongoDB repository for UserDocument (Member 4).
 */
@Repository
public interface UserDocumentRepository extends MongoRepository<UserDocument, String> {

    Optional<UserDocument> findByEmail(String email);

    Optional<UserDocument> findByOauthProviderAndOauthId(String provider, String oauthId);

    boolean existsByEmail(String email);
}
