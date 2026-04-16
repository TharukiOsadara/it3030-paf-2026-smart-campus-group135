package com.smartcampus.exception;

/**
 * Exception thrown when a requested resource is not found
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Factory method for resource not found by ID
     */
    public static ResourceNotFoundException notFoundById(String id) {
        return new ResourceNotFoundException("Resource not found with id: " + id);
    }
}
