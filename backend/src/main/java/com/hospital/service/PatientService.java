package com.hospital.service;

import com.hospital.dto.PatientRequest;
import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Page<Patient> findAll(Pageable pageable) {
        return patientRepository.findByActiveTrue(pageable);
    }

    public Patient findById(Long id) {
        return patientRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public Patient create(PatientRequest request) {
        Patient patient = Patient.builder()
                .name(request.getName())
                .cpf(request.getCpf())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .bloodType(request.getBloodType())
                .allergies(request.getAllergies())
                .medicalConditions(request.getMedicalConditions())
                .insuranceProvider(request.getInsuranceProvider())
                .insuranceNumber(request.getInsuranceNumber())
                .active(true)
                .build();

        return patientRepository.save(patient);
    }

    public Patient update(Long id, PatientRequest request) {
        Patient patient = findById(id);

        patient.setName(request.getName());
        patient.setCpf(request.getCpf());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setBirthDate(request.getBirthDate());
        patient.setGender(request.getGender());
        patient.setBloodType(request.getBloodType());
        patient.setAllergies(request.getAllergies());
        patient.setMedicalConditions(request.getMedicalConditions());
        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setInsuranceNumber(request.getInsuranceNumber());

        return patientRepository.save(patient);
    }

    public void deactivate(Long id) {
        Patient patient = findById(id);
        patient.setActive(false);
        patientRepository.save(patient);
    }
}
