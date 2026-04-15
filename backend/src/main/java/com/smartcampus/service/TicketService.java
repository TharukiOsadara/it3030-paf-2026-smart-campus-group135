package com.smartcampus.service;

import com.smartcampus.exception.TicketNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
    }

    public List<Ticket> getTickets(
            Ticket.Status status,
            Ticket.Priority priority,
            String category,
            String assignedTo,
            String userId,
            String resourceId,
            String search
    ) {
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String normalizedCategory = (category != null && !category.isBlank()) ? category.trim() : null;

        return ticketRepository.findByFilters(
                status,
                priority,
                normalizedCategory,
                assignedTo,
                userId,
                resourceId,
                normalizedSearch
        );
    }

    public Ticket updateTicket(String id, Ticket ticketDetails) {
        Ticket existing = getTicketById(id);

        existing.setTitle(ticketDetails.getTitle());
        existing.setDescription(ticketDetails.getDescription());
        existing.setCategory(ticketDetails.getCategory());
        existing.setPriority(ticketDetails.getPriority());
        existing.setContactDetails(ticketDetails.getContactDetails());
        existing.setResourceId(ticketDetails.getResourceId());
        existing.setLocation(ticketDetails.getLocation());
        existing.setUserId(ticketDetails.getUserId());
        existing.setStatus(ticketDetails.getStatus());
        existing.setAssignedTo(ticketDetails.getAssignedTo());
        existing.setResolutionNotes(ticketDetails.getResolutionNotes());

        if (ticketDetails.getStatus() == Ticket.Status.RESOLVED && existing.getResolvedAt() == null) {
            existing.setResolvedAt(java.time.LocalDateTime.now());
        }

        if (ticketDetails.getStatus() == Ticket.Status.CLOSED && existing.getClosedAt() == null) {
            existing.setClosedAt(java.time.LocalDateTime.now());
        }

        return ticketRepository.save(existing);
    }

    public void deleteTicket(String id) {
        Ticket existing = getTicketById(id);
        ticketRepository.delete(existing);
    }
}
