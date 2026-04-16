package com.smartcampus.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for JWT token generation and validation.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:your-secret-key-make-it-long-and-secure-at-least-32-characters}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")  // 24 hours in milliseconds
    private long jwtExpiration;

    /**
     * Generate JWT token for a user.
     *
     * @param userId   User ID (MongoDB document ID)
     * @param email    User email
     * @param name     User name
     * @param role     User role
     * @return JWT token string
     */
    public String generateToken(String userId, String email, String name, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("name", name);
        claims.put("role", role);

        return createToken(claims, userId);
    }

    /**
     * Create JWT token with claims.
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
}
