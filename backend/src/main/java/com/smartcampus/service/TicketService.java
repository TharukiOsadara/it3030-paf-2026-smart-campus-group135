package com.smartcampus.service;

import com.smartcampus.dto.TicketAssignRequestDTO;
import com.smartcampus.dto.TicketCommentRequestDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketStatsResponseDTO;
import com.smartcampus.dto.TicketStatusUpdateRequestDTO;
import com.smartcampus.exception.AttachmentLimitExceededException;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.InvalidTicketTransitionException;
import com.smartcampus.exception.TicketNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final AttachmentStorageService attachmentStorageService;
    private final MongoTemplate mongoTemplate;

    public TicketService(TicketRepository ticketRepository,
                         AttachmentStorageService attachmentStorageService,
                         MongoTemplate mongoTemplate) {
        this.ticketRepository = ticketRepository;
        this.attachmentStorageService = attachmentStorageService;
        this.mongoTemplate = mongoTemplate;
    }

    public Ticket createTicket(TicketRequestDTO request) {
        LocalDateTime now = LocalDateTime.now();

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setPriority(request.getPriority());
        ticket.setContactDetails(trimToNull(request.getContactDetails()));
        ticket.setResourceId(trimToNull(request.getResourceId()));
        ticket.setLocation(request.getLocation().trim());
        ticket.setUserId(request.getUserId().trim());
        ticket.setStatus(request.getStatus() != null ? request.getStatus() : Ticket.Status.OPEN);
        ticket.setAssignedTo(trimToNull(request.getAssignedTo()));
        ticket.setResolutionNotes(trimToNull(request.getResolutionNotes()));
        ticket.setRejectionReason(trimToNull(request.getRejectionReason()));
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        if (ticket.getStatus() == Ticket.Status.RESOLVED && ticket.getResolutionNotes() == null) {
            throw new InvalidTicketTransitionException("Resolution notes are required when marking ticket as RESOLVED");
        }

        if (ticket.getStatus() == Ticket.Status.REJECTED && ticket.getRejectionReason() == null) {
            throw new InvalidTicketTransitionException("Rejection reason is required when marking ticket as REJECTED");
        }

        if (ticket.getStatus() == Ticket.Status.RESOLVED) {
            ticket.setResolvedAt(now);
        }

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            ticket.setClosedAt(now);
        }

        ticket.setAttachments(new ArrayList<>());
        ticket.setComments(new ArrayList<>());
        ticket.setActivities(new ArrayList<>());
        addActivity(ticket, "CREATED", ticket.getUserId(), Ticket.UserRole.USER, "Ticket created");

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
        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Criteria> criteria = new ArrayList<>();

        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }

        if (priority != null) {
            criteria.add(Criteria.where("priority").is(priority));
        }

        if (hasText(category)) {
            criteria.add(Criteria.where("category").regex("^" + escapeRegex(category.trim()) + "$", "i"));
        }

        if (hasText(assignedTo)) {
            criteria.add(Criteria.where("assignedTo").is(assignedTo.trim()));
        }

        if (hasText(userId)) {
            criteria.add(Criteria.where("userId").is(userId.trim()));
        }

        if (hasText(resourceId)) {
            criteria.add(Criteria.where("resourceId").is(resourceId.trim()));
        }

        if (hasText(search)) {
            String regex = escapeRegex(search.trim());
            criteria.add(new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i"),
                    Criteria.where("location").regex(regex, "i")
            ));
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Ticket.class);
    }

    public List<Ticket> getMyTickets(String userId) {
        if (!hasText(userId)) {
            throw new ForbiddenOperationException("User id is required");
        }
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId.trim());
    }

    public Ticket updateTicket(String id, TicketRequestDTO request, String actorId, Ticket.UserRole role) {
        Ticket existing = getTicketById(id);
        validateTicketOwnerOrStaff(existing, actorId, role);

        if (existing.getStatus() == Ticket.Status.CLOSED || existing.getStatus() == Ticket.Status.REJECTED) {
            throw new InvalidTicketTransitionException("Closed or rejected tickets cannot be edited");
        }

        existing.setTitle(request.getTitle().trim());
        existing.setDescription(request.getDescription().trim());
        existing.setCategory(request.getCategory().trim());
        existing.setPriority(request.getPriority());
        existing.setContactDetails(trimToNull(request.getContactDetails()));
        existing.setResourceId(trimToNull(request.getResourceId()));
        existing.setLocation(request.getLocation().trim());
        existing.setUpdatedAt(LocalDateTime.now());

        addActivity(existing, "UPDATED", actorId, role, "Ticket details updated");
        return ticketRepository.save(existing);
    }

    public Ticket updateStatus(String id, TicketStatusUpdateRequestDTO request, String actorId, Ticket.UserRole role) {
        Ticket existing = getTicketById(id);
        ensureStaff(role);

        Ticket.Status current = existing.getStatus();
        Ticket.Status next = request.getStatus();
        validateTransition(current, next);

        if (next == Ticket.Status.REJECTED && role != Ticket.UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only ADMIN can reject a ticket");
        }

        if (next == Ticket.Status.IN_PROGRESS && !hasText(existing.getAssignedTo())) {
            throw new InvalidTicketTransitionException("Assign a technician before moving ticket to IN_PROGRESS");
        }

        if (next == Ticket.Status.RESOLVED && !hasText(request.getResolutionNotes())) {
            throw new InvalidTicketTransitionException("Resolution notes are required when marking as RESOLVED");
        }

        if (next == Ticket.Status.REJECTED && !hasText(request.getRejectionReason())) {
            throw new InvalidTicketTransitionException("Rejection reason is required when marking as REJECTED");
        }

        LocalDateTime now = LocalDateTime.now();
        existing.setStatus(next);
        existing.setUpdatedAt(now);

        if (existing.getFirstResponseAt() == null && next != Ticket.Status.OPEN) {
            existing.setFirstResponseAt(now);
        }

        if (next == Ticket.Status.RESOLVED) {
            existing.setResolutionNotes(request.getResolutionNotes().trim());
            existing.setResolvedAt(now);
        }

        if (next == Ticket.Status.CLOSED) {
            existing.setClosedAt(now);
        }

        if (next == Ticket.Status.REJECTED) {
            existing.setRejectionReason(request.getRejectionReason().trim());
        }

        addActivity(existing, "STATUS_CHANGED", actorId, role, "Status changed from " + current + " to " + next);
        return ticketRepository.save(existing);
    }

    public Ticket assignTechnician(String id, TicketAssignRequestDTO request, String actorId, Ticket.UserRole role) {
        Ticket existing = getTicketById(id);
        ensureAdminOrStaff(role);

        String technicianId = request.getTechnicianId().trim();
        existing.setAssignedTo(technicianId);
        existing.setUpdatedAt(LocalDateTime.now());

        addActivity(existing, "ASSIGNED", actorId, role, "Ticket assigned to technician " + technicianId);
        return ticketRepository.save(existing);
    }

    public void deleteTicket(String id, String actorId, Ticket.UserRole role) {
        Ticket existing = getTicketById(id);
        validateTicketOwnerOrAdmin(existing, actorId, role);
        if (existing.getAttachments() != null) {
            for (Ticket.Attachment attachment : existing.getAttachments()) {
                attachmentStorageService.delete(existing.getId(), attachment.getStoredFileName());
            }
        }
        ticketRepository.delete(existing);
    }

    public Ticket addComment(String ticketId, TicketCommentRequestDTO request, String actorId, Ticket.UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        ensureKnownActor(actorId);

        Ticket.Comment comment = new Ticket.Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setUserId(actorId);
        comment.setUserRole(role);
        comment.setContent(request.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        addActivity(ticket, "COMMENT_ADDED", actorId, role, "Comment added");
        return ticketRepository.save(ticket);
    }

    public Ticket updateComment(String ticketId, String commentId, TicketCommentRequestDTO request, String actorId, Ticket.UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        Ticket.Comment comment = findComment(ticket, commentId);

        if (!Objects.equals(comment.getUserId(), actorId) && role != Ticket.UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only comment owner or ADMIN can edit comment");
        }

        comment.setContent(request.getContent().trim());
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        addActivity(ticket, "COMMENT_UPDATED", actorId, role, "Comment updated");
        return ticketRepository.save(ticket);
    }

    public Ticket deleteComment(String ticketId, String commentId, String actorId, Ticket.UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        Ticket.Comment comment = findComment(ticket, commentId);

        if (!Objects.equals(comment.getUserId(), actorId) && role != Ticket.UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only comment owner or ADMIN can delete comment");
        }

        ticket.getComments().removeIf(c -> Objects.equals(c.getId(), commentId));
        ticket.setUpdatedAt(LocalDateTime.now());
        addActivity(ticket, "COMMENT_DELETED", actorId, role, "Comment deleted");
        return ticketRepository.save(ticket);
    }

    public Ticket addAttachment(String ticketId, MultipartFile file, String actorId, Ticket.UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        ensureKnownActor(actorId);

        if (ticket.getAttachments() == null) {
            ticket.setAttachments(new ArrayList<>());
        }

        if (ticket.getAttachments().size() >= 3) {
            throw new AttachmentLimitExceededException("A ticket can only have up to 3 attachments");
        }

        AttachmentStorageService.StoredAttachment stored = attachmentStorageService.store(ticketId, file);

        Ticket.Attachment attachment = new Ticket.Attachment();
        attachment.setId(UUID.randomUUID().toString());
        attachment.setStoredFileName(stored.storedFileName());
        attachment.setOriginalFileName(stored.originalFileName());
        attachment.setContentType(stored.contentType());
        attachment.setSizeBytes(stored.sizeBytes());
        attachment.setUploadedBy(actorId);
        attachment.setUploadedAt(LocalDateTime.now());

        ticket.getAttachments().add(attachment);
        ticket.setUpdatedAt(LocalDateTime.now());

        addActivity(ticket, "ATTACHMENT_ADDED", actorId, role, "Attachment added: " + attachment.getOriginalFileName());
        return ticketRepository.save(ticket);
    }

    public Ticket deleteAttachment(String ticketId, String attachmentId, String actorId, Ticket.UserRole role) {
        Ticket ticket = getTicketById(ticketId);
        validateTicketOwnerOrAdmin(ticket, actorId, role);

        Ticket.Attachment attachment = findAttachment(ticket, attachmentId);
        attachmentStorageService.delete(ticketId, attachment.getStoredFileName());
        ticket.getAttachments().removeIf(a -> Objects.equals(a.getId(), attachmentId));
        ticket.setUpdatedAt(LocalDateTime.now());

        addActivity(ticket, "ATTACHMENT_DELETED", actorId, role, "Attachment removed: " + attachment.getOriginalFileName());
        return ticketRepository.save(ticket);
    }

    public Resource downloadAttachment(String ticketId, String attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        Ticket.Attachment attachment = findAttachment(ticket, attachmentId);
        return attachmentStorageService.load(ticketId, attachment.getStoredFileName());
    }

    public Ticket.Attachment getAttachmentMetadata(String ticketId, String attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        return findAttachment(ticket, attachmentId);
    }

    public TicketStatsResponseDTO getStats() {
        return new TicketStatsResponseDTO(
                ticketRepository.count(),
                ticketRepository.countByStatus(Ticket.Status.OPEN),
                ticketRepository.countByStatus(Ticket.Status.IN_PROGRESS),
                ticketRepository.countByStatus(Ticket.Status.RESOLVED),
                ticketRepository.countByStatus(Ticket.Status.CLOSED),
                ticketRepository.countByStatus(Ticket.Status.REJECTED)
        );
    }

    private Ticket.Attachment findAttachment(Ticket ticket, String attachmentId) {
        if (ticket.getAttachments() == null) {
            throw TicketNotFoundException.withMessage("Attachment not found: " + attachmentId);
        }

        return ticket.getAttachments().stream()
                .filter(att -> Objects.equals(att.getId(), attachmentId))
                .findFirst()
                .orElseThrow(() -> TicketNotFoundException.withMessage("Attachment not found: " + attachmentId));
    }

    private Ticket.Comment findComment(Ticket ticket, String commentId) {
        if (ticket.getComments() == null) {
            throw TicketNotFoundException.withMessage("Comment not found: " + commentId);
        }

        return ticket.getComments().stream()
                .filter(c -> Objects.equals(c.getId(), commentId))
                .findFirst()
                .orElseThrow(() -> TicketNotFoundException.withMessage("Comment not found: " + commentId));
    }

    private void ensureKnownActor(String actorId) {
        if (!hasText(actorId)) {
            throw new ForbiddenOperationException("X-User-Id header is required");
        }
    }

    private void validateTicketOwnerOrStaff(Ticket ticket, String actorId, Ticket.UserRole role) {
        ensureKnownActor(actorId);
        if (Objects.equals(ticket.getUserId(), actorId)) {
            return;
        }
        if (role == Ticket.UserRole.ADMIN || role == Ticket.UserRole.STAFF) {
            return;
        }
        throw new ForbiddenOperationException("You are not allowed to edit this ticket");
    }

    private void validateTicketOwnerOrAdmin(Ticket ticket, String actorId, Ticket.UserRole role) {
        ensureKnownActor(actorId);
        if (Objects.equals(ticket.getUserId(), actorId) || role == Ticket.UserRole.ADMIN) {
            return;
        }
        throw new ForbiddenOperationException("Only ticket owner or ADMIN can perform this action");
    }

    private void ensureStaff(Ticket.UserRole role) {
        if (role == Ticket.UserRole.ADMIN || role == Ticket.UserRole.STAFF || role == Ticket.UserRole.TECHNICIAN) {
            return;
        }
        throw new ForbiddenOperationException("Only staff roles can update ticket workflow status");
    }

    private void ensureAdminOrStaff(Ticket.UserRole role) {
        if (role == Ticket.UserRole.ADMIN || role == Ticket.UserRole.STAFF) {
            return;
        }
        throw new ForbiddenOperationException("Only ADMIN or STAFF can assign technicians");
    }

    private void validateTransition(Ticket.Status current, Ticket.Status next) {
        if (current == next) {
            return;
        }

        boolean valid;
        switch (current) {
            case OPEN -> valid = next == Ticket.Status.IN_PROGRESS || next == Ticket.Status.REJECTED;
            case IN_PROGRESS -> valid = next == Ticket.Status.RESOLVED || next == Ticket.Status.REJECTED;
            case RESOLVED -> valid = next == Ticket.Status.CLOSED || next == Ticket.Status.IN_PROGRESS;
            case CLOSED, REJECTED -> valid = false;
            default -> valid = false;
        }

        if (!valid) {
            throw new InvalidTicketTransitionException("Invalid status transition from " + current + " to " + next);
        }
    }

    private void addActivity(Ticket ticket, String type, String actorId, Ticket.UserRole role, String content) {
        if (ticket.getActivities() == null) {
            ticket.setActivities(new ArrayList<>());
        }

        ticket.getActivities().add(new Ticket.Activity(
                UUID.randomUUID().toString(),
                type,
                actorId,
                role,
                content,
                LocalDateTime.now()
        ));
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String trimToNull(String value) {
        if (!hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String escapeRegex(String input) {
        return input.replace("\\", "\\\\")
                .replace(".", "\\.")
                .replace("*", "\\*")
                .replace("+", "\\+")
                .replace("?", "\\?")
                .replace("(", "\\(")
                .replace(")", "\\)")
                .replace("[", "\\[")
                .replace("]", "\\]")
                .replace("{", "\\{")
                .replace("}", "\\}")
                .replace("^", "\\^")
                .replace("$", "\\$")
                .replace("|", "\\|");
    }
}