package com.hospital.service;

import com.hospital.dto.MedicalRecordRequest;
import com.hospital.entity.Attachment;
import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AttachmentRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AttachmentRepository attachmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public MedicalRecord create(MedicalRecordRequest request, Long doctorId) {
        Patient patient = patientRepository.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .symptoms(request.getSymptoms())
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .notes(request.getNotes())
                .recordDate(LocalDateTime.now())
                .build();

        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getPatientHistory(Long patientId) {
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
    }

    public MedicalRecord update(Long id, MedicalRecordRequest request) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        if (request.getSymptoms() != null) record.setSymptoms(request.getSymptoms());
        if (request.getDiagnosis() != null) record.setDiagnosis(request.getDiagnosis());
        if (request.getTreatment() != null) record.setTreatment(request.getTreatment());
        if (request.getNotes() != null) record.setNotes(request.getNotes());

        return medicalRecordRepository.save(record);
    }

    public Attachment addAttachment(Long recordId, MultipartFile file) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        try {
            String uploadDir = "uploads/exams/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            Attachment attachment = Attachment.builder()
                    .medicalRecord(record)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .filePath(filePath.toString())
                    .build();

            return attachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
