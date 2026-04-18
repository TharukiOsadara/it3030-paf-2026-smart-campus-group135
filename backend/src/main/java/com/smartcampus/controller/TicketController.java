package com.smartcampus.controller;

import com.smartcampus.dto.TicketAssignRequestDTO;
import com.smartcampus.dto.TicketCommentRequestDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketStatsResponseDTO;
import com.smartcampus.dto.TicketStatusUpdateRequestDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequestDTO request) {
        Ticket created = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(path = "/with-attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicketWithAttachments(
            @Valid @RequestPart("ticket") TicketRequestDTO request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestHeader(value = "X-User-Id", required = false) String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        Ticket created = ticketService.createTicket(request);
        if (files != null) {
            Ticket.UserRole role = parseRole(actorRole);
            String resolvedActor = actorId != null && !actorId.isBlank() ? actorId : request.getUserId();
            for (MultipartFile file : files) {
                created = ticketService.addAttachment(created.getId(), file, resolvedActor, role);
            }
        }
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

    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketRequestDTO request,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        Ticket updated = ticketService.updateTicket(id, request, actorId, parseRole(actorRole));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateRequestDTO request,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        Ticket updated = ticketService.updateStatus(id, request, actorId, parseRole(actorRole));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody TicketAssignRequestDTO request,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        Ticket updated = ticketService.assignTechnician(id, request, actorId, parseRole(actorRole));
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> addAttachment(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        Ticket updated = ticketService.addAttachment(id, file, actorId, parseRole(actorRole));
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId
    ) {
        Ticket.Attachment metadata = ticketService.getAttachmentMetadata(id, attachmentId);
        Resource resource = ticketService.downloadAttachment(id, attachmentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Ticket> deleteAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        return ResponseEntity.ok(ticketService.deleteAttachment(id, attachmentId, actorId, parseRole(actorRole)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(
            @PathVariable String id,
            @Valid @RequestBody TicketCommentRequestDTO request,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        return ResponseEntity.ok(ticketService.addComment(id, request, actorId, parseRole(actorRole)));
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @Valid @RequestBody TicketCommentRequestDTO request,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, request, actorId, parseRole(actorRole)));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        return ResponseEntity.ok(ticketService.deleteComment(id, commentId, actorId, parseRole(actorRole)));
    }

    @GetMapping("/stats")
    public ResponseEntity<TicketStatsResponseDTO> getStats() {
        return ResponseEntity.ok(ticketService.getStats());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole
    ) {
        ticketService.deleteTicket(id, actorId, parseRole(actorRole));
        return ResponseEntity.noContent().build();
    }

    private Ticket.UserRole parseRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return Ticket.UserRole.USER;
        }
        try {
            return Ticket.UserRole.valueOf(rawRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Ticket.UserRole.USER;
        }
    }
}