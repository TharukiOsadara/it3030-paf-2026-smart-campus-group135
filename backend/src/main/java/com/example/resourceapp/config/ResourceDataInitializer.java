package com.example.resourceapp.config;

import com.example.resourceapp.model.Resource;
import com.example.resourceapp.model.ResourceStatus;
import com.example.resourceapp.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class ResourceDataInitializer {

    @Bean
    CommandLineRunner seedResources(ResourceRepository resourceRepository) {
        return args -> {
            if (resourceRepository.count() > 0) {
                return;
            }

            resourceRepository.saveAll(List.of(
                buildResource(
                    "Main Auditorium",
                    "AUDITORIUM",
                    300,
                    "Block A",
                    List.of("08:00-12:00", "13:00-18:00"),
                    ResourceStatus.ACTIVE,
                    Map.of("projector", true, "ac", true)
                ),
                buildResource(
                    "Physics Lab 2",
                    "LAB",
                    40,
                    "Science Wing",
                    List.of("09:00-12:00", "14:00-17:00"),
                    ResourceStatus.ACTIVE,
                    Map.of("labType", "Physics", "safetyChecked", true)
                ),
                buildResource(
                    "Computer Lab 1",
                    "EQUIPMENT",
                    60,
                    "IT Building",
                    List.of("08:30-16:30"),
                    ResourceStatus.ACTIVE,
                    Map.of("systems", 60, "os", "Windows")
                ),
                buildResource(
                    "Campus Shuttle Van",
                    "VEHICLE",
                    12,
                    "Transport Office",
                    List.of("07:00-10:00", "15:00-19:00"),
                    ResourceStatus.OUT_OF_SERVICE,
                    Map.of("fuelType", "Diesel", "plate", "CP-4521")
                )
            ));
        };
    }

    private Resource buildResource(
        String name,
        String type,
        Integer capacity,
        String location,
        List<String> availabilityWindows,
        ResourceStatus status,
        Map<String, Object> metadata
    ) {
        Resource resource = new Resource();
        resource.setName(name);
        resource.setType(type);
        resource.setCapacity(capacity);
        resource.setLocation(location);
        resource.setAvailabilityWindows(availabilityWindows);
        resource.setStatus(status);
        resource.setMetadata(metadata);
        return resource;
    }
}
