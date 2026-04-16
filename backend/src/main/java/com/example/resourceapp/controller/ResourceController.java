package com.example.resourceapp.controller;

import com.example.resourceapp.model.Resource;
import com.example.resourceapp.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Member 1 Logic Implementation: Resource Controller endpoints
@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @Autowired
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return new ResponseEntity<>(resourceService.getAllResources(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return new ResponseEntity<>(resourceService.getResourceById(id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        return new ResponseEntity<>(resourceService.createResource(resource), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable String id, @Valid @RequestBody Resource resourceDetails) {
        return new ResponseEntity<>(resourceService.updateResource(id, resourceDetails), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
