package com.smartcampus.config;

import com.smartcampus.service.CustomOAuth2UserService;
import com.smartcampus.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration supporting both OAuth2 Google login AND local email/password auth.
 *
 * Access rules:
 *   - /api/auth/** → permitAll (register, login, me, logout)
 *   - /api/users/** → ADMIN only
 *   - /api/notifications/** → any authenticated user
 *   - /api/resources/**, /ws/** → permitAll (existing modules)
 *   - OAuth2 login via Google → redirect to frontend dashboard on success
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final UserDetailsService customUserDetailsService;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService,
                          OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                          UserDetailsService customUserDetailsService) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/resources/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/**").permitAll()
                // Admin-only endpoints
                .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN")
                // Authenticated-only endpoints
                .requestMatchers("/api/notifications/**").authenticated()
                // Everything else
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2LoginSuccessHandler)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/server-logout")
                .logoutSuccessUrl("http://localhost:5173/login")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }
}
