package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

/**
 * MODULE B: Booking Repository
 * Provides data access for booking management including conflict detection
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Find all bookings by user ID
     */
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all bookings ordered by creation date (admin view)
     */
    List<Booking> findAllByOrderByCreatedAtDesc();

    /**
     * Find bookings by status
     */
    List<Booking> findByStatusOrderByCreatedAtDesc(Booking.BookingStatus status);

    /**
     * Conflict detection query:
     * Find overlapping bookings for the same resource on the same date.
     * Two time ranges [s1, e1) and [s2, e2) overlap when s1 < e2 AND s2 < e1.
     * Only considers PENDING and APPROVED bookings (not REJECTED/CANCELLED).
     */
    List<Booking> findByResourceIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
           String resourceId,
           LocalDate bookingDate,
           LocalTime endTime,
           LocalTime startTime,
           List<Booking.BookingStatus> statuses);

    /**
     * Conflict detection query for updates:
     * same as findConflictingBookings, but excludes current booking id.
     */
    List<Booking> findByIdNotAndResourceIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
           String bookingId,
           String resourceId,
           LocalDate bookingDate,
           LocalTime endTime,
           LocalTime startTime,
           List<Booking.BookingStatus> statuses);

    default List<Booking> findConflictingBookings(String resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
       return findByResourceIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
              resourceId,
              bookingDate,
              endTime,
              startTime,
              Arrays.asList(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED));
    }

    default List<Booking> findConflictingBookingsExcludingBooking(String bookingId, String resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
       return findByIdNotAndResourceIdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
              bookingId,
              resourceId,
              bookingDate,
              endTime,
              startTime,
              Arrays.asList(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED));
    }
}
