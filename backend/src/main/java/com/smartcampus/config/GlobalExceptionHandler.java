package com.smartcampus.config;

import com.smartcampus.dto.ErrorResponse;
import com.smartcampus.exception.AttachmentLimitExceededException;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.InvalidAttachmentException;
import com.smartcampus.exception.InvalidTicketTransitionException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.TicketNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;


/**
 * Global exception handler for all REST controllers
 * Provides consistent error response format
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), "Resource Not Found", request.getRequestURI());
    }

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTicketNotFound(TicketNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), "Ticket Not Found", request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .orElse("Validation failed");
        return build(HttpStatus.BAD_REQUEST, message, "Validation Error", request.getRequestURI());
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoHandlerFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Endpoint not found", "Not Found", request.getRequestURI());
    }

    @ExceptionHandler({ForbiddenOperationException.class, MissingRequestHeaderException.class})
    public ResponseEntity<ErrorResponse> handleForbidden(Exception ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), "Forbidden", request.getRequestURI());
    }

    @ExceptionHandler({InvalidTicketTransitionException.class, InvalidAttachmentException.class})
    public ResponseEntity<ErrorResponse> handleUnprocessable(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage(), "Unprocessable Content", request.getRequestURI());
    }

    @ExceptionHandler(AttachmentLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleAttachmentLimit(AttachmentLimitExceededException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), "Attachment Limit Exceeded", request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception for {}", request.getRequestURI(), ex);
        String message = ex.getClass().getSimpleName().contains("Mongo") && ex.getMessage() != null
                ? ex.getMessage()
                : "An unexpected error occurred";
        return build(HttpStatus.INTERNAL_SERVER_ERROR, message, ex.getClass().getSimpleName(), request.getRequestURI());
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, String error, String path) {
        ErrorResponse response = new ErrorResponse(status.value(), message, error);
        response.setPath(path);
        return ResponseEntity.status(status).body(response);
    }
}
