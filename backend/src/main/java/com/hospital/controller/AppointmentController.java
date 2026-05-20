package com.hospital.controller;

import com.hospital.dto.AppointmentRequest;
import com.hospital.entity.Appointment;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> create(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<Appointment>> findAll(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            Pageable pageable) {
        if (patientId != null) {
            return ResponseEntity.ok(appointmentService.findByPatient(patientId, pageable));
        }
        if (doctorId != null) {
            return ResponseEntity.ok(appointmentService.findByDoctor(doctorId, pageable));
        }
        return ResponseEntity.ok(Page.empty());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> update(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        appointmentService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorId, date));
    }
}
