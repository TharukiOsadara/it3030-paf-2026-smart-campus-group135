package com.smartcampus.controller;

import com.smartcampus.dto.LoginResponseDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In a real app, use password encoder
            if (user.getPassword().equals(password)) {
                LoginResponseDTO response = new LoginResponseDTO(
                    "mock-jwt-token", // In a real app, generate a real JWT
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole()
                );
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") String userId) {
        return userRepository.findById(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<Map<String, String>>> getTechnicians() {
        List<Map<String, String>> technicians = userRepository.findByRole(Ticket.UserRole.TECHNICIAN)
                .stream()
                .map(u -> Map.of(
                        "id",    u.getId(),
                        "name",  u.getName() == null ? "" : u.getName(),
                        "email", u.getEmail() == null ? "" : u.getEmail()
                ))
                .toList();
        return ResponseEntity.ok(technicians);
    }
}
