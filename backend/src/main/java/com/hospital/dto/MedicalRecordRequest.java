package com.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MedicalRecordRequest {
    @NotNull
    private Long patientId;
    private String symptoms;
    private String diagnosis;
    private String treatment;
    private String notes;
}
