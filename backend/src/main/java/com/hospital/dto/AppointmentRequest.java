package com.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull
    private Long patientId;
    @NotNull
    private Long doctorId;
    @NotNull
    private LocalDateTime dateTime;
    private String notes;
    private String reason;
}
