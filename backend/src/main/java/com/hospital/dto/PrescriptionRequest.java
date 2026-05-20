package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PrescriptionRequest {
    @NotNull
    private Long patientId;
    private LocalDate issueDate;
    private LocalDate validUntil;
    private String notes;
    @NotNull
    private List<PrescriptionItemRequest> items;

    @Data
    public static class PrescriptionItemRequest {
        @NotBlank
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
