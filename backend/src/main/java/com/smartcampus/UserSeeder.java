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
        if (userRepository.findByEmail("tech@smartcampus.com").isEmpty()) {
            User tech = new User();
            tech.setName("Technician One");
            tech.setEmail("tech@smartcampus.com");
            tech.setPassword("tech123"); // In a real app, hash this
            tech.setRole(Ticket.UserRole.TECHNICIAN);
            userRepository.save(tech);
            System.out.println("Seeded technician user: tech@smartcampus.com / tech123");
        }
    }
}
