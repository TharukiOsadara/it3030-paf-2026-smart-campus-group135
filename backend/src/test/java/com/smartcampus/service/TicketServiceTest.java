package com.smartcampus.service;

import com.smartcampus.dto.TicketCommentRequestDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketStatusUpdateRequestDTO;
import com.smartcampus.exception.AttachmentLimitExceededException;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.InvalidTicketTransitionException;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private AttachmentStorageService attachmentStorageService;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private TicketService ticketService;

    private TicketRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new TicketRequestDTO(
                "Projector issue",
                "Projector screen is flickering",
                "Equipment",
                Ticket.Priority.HIGH,
                "student@example.com | +94770000000",
                "user-123",
                "RES-1",
                "Block A Room 101",
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    @Test
    void createTicket_ShouldInitializeDefaultsAndActivity() {
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket created = ticketService.createTicket(requestDTO);

        assertEquals(Ticket.Status.OPEN, created.getStatus());
        assertEquals("user-123", created.getUserId());
        assertTrue(created.getCreatedAt() != null);
        assertEquals(1, created.getActivities().size());
        assertEquals("CREATED", created.getActivities().get(0).getType());
    }

    @Test
    void updateStatus_ShouldRejectInvalidTransition() {
        Ticket existing = buildTicket("t-1", Ticket.Status.OPEN);
        when(ticketRepository.findById("t-1")).thenReturn(Optional.of(existing));

        TicketStatusUpdateRequestDTO statusRequest = new TicketStatusUpdateRequestDTO(Ticket.Status.CLOSED, null, null);

        assertThrows(InvalidTicketTransitionException.class,
                () -> ticketService.updateStatus("t-1", statusRequest, "staff-1", Ticket.UserRole.STAFF));
    }

    @Test
    void addAttachment_ShouldFailWhenLimitExceeded() {
        Ticket existing = buildTicket("t-2", Ticket.Status.OPEN);
        existing.setAttachments(new ArrayList<>(List.of(
                new Ticket.Attachment("a1", "1.jpg", "1.jpg", "image/jpeg", 100L, "user-1", LocalDateTime.now()),
                new Ticket.Attachment("a2", "2.jpg", "2.jpg", "image/jpeg", 100L, "user-1", LocalDateTime.now()),
                new Ticket.Attachment("a3", "3.jpg", "3.jpg", "image/jpeg", 100L, "user-1", LocalDateTime.now())
        )));

        when(ticketRepository.findById("t-2")).thenReturn(Optional.of(existing));

        assertThrows(AttachmentLimitExceededException.class,
                () -> ticketService.addAttachment("t-2", multipartFile, "user-1", Ticket.UserRole.USER));

        verify(attachmentStorageService, never()).store(any(), any());
    }

    @Test
    void updateComment_ShouldAllowOnlyOwnerOrAdmin() {
        Ticket existing = buildTicket("t-3", Ticket.Status.OPEN);
        existing.setComments(new ArrayList<>(List.of(
                new Ticket.Comment("c1", "owner-1", Ticket.UserRole.USER, "old", LocalDateTime.now(), LocalDateTime.now())
        )));

        when(ticketRepository.findById("t-3")).thenReturn(Optional.of(existing));

        assertThrows(ForbiddenOperationException.class,
                () -> ticketService.updateComment("t-3", "c1", new TicketCommentRequestDTO("new"), "other-user", Ticket.UserRole.USER));

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Ticket updated = ticketService.updateComment("t-3", "c1", new TicketCommentRequestDTO("new"), "owner-1", Ticket.UserRole.USER);

        assertEquals("new", updated.getComments().get(0).getContent());

        ArgumentCaptor<Ticket> captor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(captor.capture());
        assertEquals("new", captor.getValue().getComments().get(0).getContent());
    }

    private Ticket buildTicket(String id, Ticket.Status status) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setTitle("Title");
        ticket.setDescription("Desc");
        ticket.setCategory("Equipment");
        ticket.setPriority(Ticket.Priority.MEDIUM);
        ticket.setStatus(status);
        ticket.setLocation("Room 1");
        ticket.setUserId("owner-1");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setActivities(new ArrayList<>());
        ticket.setComments(new ArrayList<>());
        ticket.setAttachments(new ArrayList<>());
        return ticket;
    }
}
