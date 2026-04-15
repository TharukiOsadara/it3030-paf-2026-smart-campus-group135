package com.smartcampus.service;

import com.smartcampus.model.UserDocument;
import com.smartcampus.repository.UserDocumentRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Custom OAuth2 user service that persists users to MongoDB on login.
 * If the user already exists (by email), their record is reused.
 * If not, a new record is created with role USER.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserDocumentRepository userDocumentRepository;

    public CustomOAuth2UserService(UserDocumentRepository userDocumentRepository) {
        this.userDocumentRepository = userDocumentRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String oauthId = oAuth2User.getAttribute("sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // Save user to MongoDB if not exists
        UserDocument userDocument = userDocumentRepository.findByEmail(email)
                .orElseGet(() -> {
                    UserDocument newUser = UserDocument.fromOAuth2(name, email, picture, provider, oauthId);
                    return userDocumentRepository.save(newUser);
                });

        // Build attributes map with our database ID included
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("dbId", userDocument.getId());
        attributes.put("dbRole", userDocument.getRole().name());

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                attributes,
                "email"
        );
    }
}
