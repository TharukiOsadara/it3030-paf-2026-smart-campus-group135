package com.smartcampus.config;

import com.smartcampus.model.UserDocument;
import com.smartcampus.repository.UserDocumentRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

/**
 * Handles successful OAuth2 login by creating a session and redirecting to appropriate URL based on user role.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${oauth2.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final UserDocumentRepository userDocumentRepository;

    public OAuth2LoginSuccessHandler(UserDocumentRepository userDocumentRepository) {
        this.userDocumentRepository = userDocumentRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        // Get or create session
        HttpSession session = request.getSession(true);

        // Save authentication to SecurityContext
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(authentication);

        // Save SecurityContext to session so it persists across requests
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );

        // Set CORS headers explicitly
        response.setHeader("Access-Control-Allow-Origin", frontendUrl);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

        // Determine redirect URL based on user role
        String redirectUrl = frontendUrl + "/";  // Default to home
        
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            
            if (email != null) {
                Optional<UserDocument> userOpt = userDocumentRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    UserDocument user = userOpt.get();
                    if (user.getRole() == UserDocument.Role.ADMIN) {
                        redirectUrl = frontendUrl + "/admin/users";
                    } else if (user.getRole() == UserDocument.Role.TECHNICIAN) {
                        redirectUrl = frontendUrl + "/technician-dashboard";
                    }
                }
            }
        } catch (Exception e) {
            // If anything fails, just redirect to home
            redirectUrl = frontendUrl + "/";
        }

        // Redirect to appropriate URL based on role
        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader("Location", redirectUrl);
    }
}
