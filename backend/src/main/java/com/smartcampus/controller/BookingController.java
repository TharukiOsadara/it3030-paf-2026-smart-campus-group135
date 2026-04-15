package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * MODULE B: Booking Management REST Controller
 * Provides endpoints for creating, viewing, approving,
 * rejecting, and cancelling resource bookings
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * POST /api/bookings?userId={userId}
     * Create a new booking request (default status: PENDING)
     * HTTP: 201 CREATED, 400 BAD REQUEST, 409 CONFLICT
     */
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody BookingRequestDTO request,
            @RequestParam Long userId) {
        Booking booking = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    /**
     * GET /api/bookings/my?userId={userId}
     * Get all bookings for the specified user
     * HTTP: 200 OK
     */
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(@RequestParam Long userId) {
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * GET /api/bookings
     * Get all bookings (admin view)
     * HTTP: 200 OK
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    /**
     * PUT /api/bookings/{id}/approve
     * Approve a pending booking
     * HTTP: 200 OK, 400 BAD REQUEST, 404 NOT FOUND
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable String id) {
        Booking booking = bookingService.approveBooking(id);
        return ResponseEntity.ok(booking);
    }

    /**
     * PUT /api/bookings/{id}/reject
     * Reject a pending booking with a reason
     * HTTP: 200 OK, 400 BAD REQUEST, 404 NOT FOUND
     * Body: {"reason": "..."}
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        Booking booking = bookingService.rejectBooking(id, reason);
        return ResponseEntity.ok(booking);
    }

    /**
     * PUT /api/bookings/{id}/cancel
     * Cancel an approved booking
     * HTTP: 200 OK, 400 BAD REQUEST, 404 NOT FOUND
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String id) {
        Booking booking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(booking);
    }

    /**
     * PUT /api/bookings/{id}/reschedule
     * Reschedule an existing booking
     * Only PENDING bookings can be rescheduled
     */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Booking> rescheduleBooking(
            @PathVariable String id,
            @RequestBody BookingRequestDTO request) {
        Booking booking = bookingService.rescheduleBooking(id, request);
        return ResponseEntity.ok(booking);
    }

    /**
     * DELETE /api/bookings/{id}
     * Delete an existing booking
     * Only CANCELLED or REJECTED bookings can be deleted
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteCancelledBooking(id);
        return ResponseEntity.noContent().build();
    }
}
