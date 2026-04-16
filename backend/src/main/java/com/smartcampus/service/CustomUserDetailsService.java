package com.smartcampus.service;

import com.smartcampus.model.UserDocument;
import com.smartcampus.repository.UserDocumentRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Custom UserDetailsService that loads users from MongoDB for form login (email/password).
 * Spring Security uses this to authenticate local users.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDocumentRepository userDocumentRepository;

    public CustomUserDetailsService(UserDocumentRepository userDocumentRepository) {
        this.userDocumentRepository = userDocumentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserDocument userDoc = userDocumentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Only local users have passwords
        if (userDoc.getPassword() == null) {
            throw new UsernameNotFoundException("This account uses Google login. Please sign in with Google.");
        }

        return new User(
                userDoc.getEmail(),
                userDoc.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + userDoc.getRole().name()))
        );
    }
}
