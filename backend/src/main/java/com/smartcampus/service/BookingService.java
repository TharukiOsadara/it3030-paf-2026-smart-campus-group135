package com.smartcampus.service;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.NotificationCreateDTO;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Booking.BookingStatus;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * MODULE B: Booking Service
 * Handles business logic for booking management including
 * conflict detection, status workflow, and CRUD operations
 */
@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new booking request.
     * Validates input and checks for time conflicts before saving.
     * New bookings always start with PENDING status.
     */
    public Booking createBooking(BookingRequestDTO request, String userId) {
        // Parse date and time from the DTO strings
        LocalDate bookingDate = LocalDate.parse(request.getBookingDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        // Validate that end time is after start time
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for conflicting bookings on the same resource, date, and overlapping time
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(), bookingDate, startTime, endTime);

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflict: the requested resource is already booked during this period");
        }

        // Build and save the booking entity
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(userId);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    /**
     * Get all bookings for a specific user (ordered by newest first)
     */
    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get all bookings (admin view, ordered by newest first)
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Approve a pending booking
     * Only PENDING bookings can be approved
     */
    public Booking approveBooking(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedAt(java.time.LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        sendBookingStatusNotification(
            saved,
            "Your booking request for " + saved.getBookingDate() + " " + saved.getStartTime() + "-" + saved.getEndTime() + " has been approved."
        );

        return saved;
    }

    /**
     * Reject a pending booking with a reason
     * Only PENDING bookings can be rejected
     */
    public Booking rejectBooking(String bookingId, String reason) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminComment(reason);
        booking.setReviewedAt(java.time.LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        sendBookingStatusNotification(
            saved,
            "Your booking request for " + saved.getBookingDate() + " " + saved.getStartTime() + "-" + saved.getEndTime() + " was rejected. Reason: " + reason
        );

        return saved;
    }

    /**
     * Cancel an approved booking
     * Only APPROVED bookings can be cancelled
     */
    public Booking cancelBooking(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException(
                    "Only APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    /**
     * Reschedule an existing booking
     * Only PENDING bookings can be rescheduled
     */
    public Booking rescheduleBooking(String bookingId, BookingRequestDTO request) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING bookings can be rescheduled. Current status: " + booking.getStatus());
        }

        LocalDate bookingDate = LocalDate.parse(request.getBookingDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookingsExcludingBooking(
                bookingId, request.getResourceId(), bookingDate, startTime, endTime);

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflict: the requested resource is already booked during this period");
        }

        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    /**
     * Delete a cancelled booking
     * Only CANCELLED or REJECTED bookings can be deleted
     */
    public void deleteCancelledBooking(String bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CANCELLED
                && booking.getStatus() != BookingStatus.REJECTED) {
            throw new IllegalStateException(
                    "Only CANCELLED or REJECTED bookings can be deleted. Current status: " + booking.getStatus());
        }

        bookingRepository.delete(booking);
    }

    /**
     * Find a booking by ID or throw ResourceNotFoundException
     */
    private Booking findBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private void sendBookingStatusNotification(Booking booking, String message) {
        try {
            NotificationCreateDTO notification = new NotificationCreateDTO(
                    booking.getUserId(),
                    message,
                    Notification.NotificationType.BOOKING
            );
            notificationService.createNotification(notification);
        } catch (Exception ignored) {
            // Booking status update should not fail if notification persistence has an issue.
        }
    }
}
