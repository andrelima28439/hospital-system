package com.hospital.controller;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.entity.Prescription;
import com.hospital.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<Prescription> create(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal String doctorEmail) {
        Long doctorId = getDoctorIdFromEmail(doctorEmail);
        return ResponseEntity.ok(prescriptionService.create(request, doctorId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientId));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generatePdf(@PathVariable Long id) {
        byte[] pdf = prescriptionService.generatePdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "prescription-" + id + ".pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    private Long getDoctorIdFromEmail(String email) {
        return 1L;
    }
}
