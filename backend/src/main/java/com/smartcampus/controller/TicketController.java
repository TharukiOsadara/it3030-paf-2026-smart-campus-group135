package com.smartcampus.controller;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequestDTO request) {
        Ticket ticket = mapRequestToTicket(request);
        Ticket created = ticketService.createTicket(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(required = false) Ticket.Status status,
            @RequestParam(required = false) Ticket.Priority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String search
    ) {
        List<Ticket> tickets = ticketService.getTickets(status, priority, category, assignedTo, userId, resourceId, search);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @Valid @RequestBody TicketRequestDTO request) {
        Ticket ticketDetails = mapRequestToTicket(request);
        Ticket updated = ticketService.updateTicket(id, ticketDetails);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    private Ticket mapRequestToTicket(TicketRequestDTO request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setContactDetails(request.getContactDetails());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocation(request.getLocation());
        ticket.setUserId(request.getUserId());
        ticket.setStatus(request.getStatus() != null ? request.getStatus() : Ticket.Status.OPEN);
        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setResolutionNotes(request.getResolutionNotes());
        return ticket;
    }
}
