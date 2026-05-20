package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRequest {
    @NotBlank
    private String name;
    private String cpf;
    private String email;
    private String phone;
    private String address;
    private LocalDate birthDate;
    private String gender;
    private String bloodType;
    private String allergies;
    private String medicalConditions;
    private String insuranceProvider;
    private String insuranceNumber;
}
