package com.hospital.controller;

import com.hospital.dto.MedicalRecordRequest;
import com.hospital.entity.Attachment;
import com.hospital.entity.MedicalRecord;
import com.hospital.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecord> create(
            @Valid @RequestBody MedicalRecordRequest request,
            @AuthenticationPrincipal String doctorEmail) {
        Long doctorId = getDoctorIdFromEmail(doctorEmail);
        return ResponseEntity.ok(medicalRecordService.create(request, doctorId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecord>> getPatientHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getPatientHistory(patientId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalRecordService.update(id, request));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<Attachment> addAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(medicalRecordService.addAttachment(id, file));
    }

    private Long getDoctorIdFromEmail(String email) {
        return 1L;
    }
}
