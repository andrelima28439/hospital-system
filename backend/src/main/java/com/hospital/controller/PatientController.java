package com.hospital.controller;

import com.hospital.dto.PatientRequest;
import com.hospital.entity.Patient;
import com.hospital.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<Page<Patient>> findAll(Pageable pageable) {
        return ResponseEntity.ok(patientService.findAll(pageable));
    }

    @PostMapping
    public ResponseEntity<Patient> create(@Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> findById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(patientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        patientService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
