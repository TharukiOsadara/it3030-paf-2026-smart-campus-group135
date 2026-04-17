package com.smartcampus.exception;

public class TicketNotFoundException extends RuntimeException {

    public TicketNotFoundException(String id) {
        super("Ticket not found with id: " + id);
    }

    public static TicketNotFoundException withMessage(String message) {
        return new TicketNotFoundException(message, true);
    }

    private TicketNotFoundException(String message, boolean customMessage) {
        super(customMessage ? message : "Ticket not found with id: " + message);
    }
}
