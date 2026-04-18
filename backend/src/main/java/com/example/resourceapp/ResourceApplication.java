package com.example.resourceapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = {"com.example.resourceapp", "com.smartcampus"})
@EnableMongoRepositories(basePackages = {"com.example.resourceapp.repository", "com.smartcampus.repository"})
public class ResourceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResourceApplication.class, args);
    }
}