package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatsResponseDTO {
    private long total;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long rejected;
}
