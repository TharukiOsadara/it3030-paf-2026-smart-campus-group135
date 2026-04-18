package com.smartcampus;

import com.smartcampus.model.User;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class UserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public UserSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.findByEmail("admin@smartcampus.com").isEmpty()) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@smartcampus.com");
            admin.setPassword("admin123");
            admin.setRole(Ticket.UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("[Seeder] admin@smartcampus.com / admin123  (ADMIN)");
        }

        if (userRepository.findByEmail("user@smartcampus.com").isEmpty()) {
            User user = new User();
            user.setName("Regular User");
            user.setEmail("user@smartcampus.com");
            user.setPassword("user123");
            user.setRole(Ticket.UserRole.USER);
            userRepository.save(user);
            System.out.println("[Seeder] user@smartcampus.com / user123  (USER)");
        }

        if (userRepository.findByEmail("tech@smartcampus.com").isEmpty()) {
            User tech = new User();
            tech.setName("Technician One");
            tech.setEmail("tech@smartcampus.com");
            tech.setPassword("tech123");
            tech.setRole(Ticket.UserRole.TECHNICIAN);
            userRepository.save(tech);
            System.out.println("[Seeder] tech@smartcampus.com / tech123  (TECHNICIAN)");
        }
    }
}
