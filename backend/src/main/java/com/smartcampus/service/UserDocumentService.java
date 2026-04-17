package com.smartcampus.service;

import com.smartcampus.dto.RoleUpdateDTO;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.dto.UserUpdateDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.UserDocument;
import com.smartcampus.repository.UserDocumentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service layer for MongoDB user operations (Member 4).
 */
@Service
public class UserDocumentService {

    private final UserDocumentRepository userDocumentRepository;

    public UserDocumentService(UserDocumentRepository userDocumentRepository) {
        this.userDocumentRepository = userDocumentRepository;
    }

    /**
     * Get all users.
     */
    public List<UserDTO> getAllUsers() {
        return userDocumentRepository.findAll()
                .stream()
                .map(UserDTO::fromDocument)
                .collect(Collectors.toList());
    }

    /**
     * Get a single user by ID.
     */
    public UserDTO getUserById(String id) {
        UserDocument user = userDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDTO.fromDocument(user);
    }

    /**
     * Update user profile (name, email).
     */
    public UserDTO updateUser(String id, UserUpdateDTO dto) {
        UserDocument user = userDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        return UserDTO.fromDocument(userDocumentRepository.save(user));
    }

    /**
     * Delete a user by ID.
     */
    public void deleteUser(String id) {
        if (!userDocumentRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userDocumentRepository.deleteById(id);
    }

    /**
     * Change user role (USER / ADMIN).
     */
    public UserDTO changeRole(String id, RoleUpdateDTO dto) {
        UserDocument user = userDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setRole(dto.getRole());
        return UserDTO.fromDocument(userDocumentRepository.save(user));
    }

    /**
     * Change user role by email.
     */
    public UserDTO changeRoleByEmail(String email, RoleUpdateDTO dto) {
        UserDocument user = userDocumentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setRole(dto.getRole());
        return UserDTO.fromDocument(userDocumentRepository.save(user));
    }

    /**
     * Update email preferences for a user by email.
     */
    public UserDTO updateEmailPreferences(String email, Map<String, Boolean> preferences) {
        UserDocument user = userDocumentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        if (preferences.containsKey("emailNotifications")) {
            user.setEmailNotifications(preferences.get("emailNotifications"));
        }
        if (preferences.containsKey("weeklyDigest")) {
            user.setWeeklyDigest(preferences.get("weeklyDigest"));
        }
        
        return UserDTO.fromDocument(userDocumentRepository.save(user));
    }

    /**
     * Delete a user by email.
     */
    public void deleteUserByEmail(String email) {
        UserDocument user = userDocumentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        userDocumentRepository.deleteById(user.getId());
    }
}
