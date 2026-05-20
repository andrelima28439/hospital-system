package com.hospital.controller;

import com.hospital.dto.BedRequest;
import com.hospital.entity.Bed;
import com.hospital.service.BedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @GetMapping
    public ResponseEntity<List<Bed>> findAll() {
        return ResponseEntity.ok(bedService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bed> findById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Bed> create(@Valid @RequestBody BedRequest request) {
        return ResponseEntity.ok(bedService.create(request));
    }

    @PostMapping("/{bedId}/occupy")
    public ResponseEntity<Bed> occupy(@PathVariable Long bedId, @RequestBody Map<String, Long> request) {
        return ResponseEntity.ok(bedService.occupyBed(bedId, request.get("patientId")));
    }

    @PostMapping("/{bedId}/release")
    public ResponseEntity<Bed> release(@PathVariable Long bedId) {
        return ResponseEntity.ok(bedService.releaseBed(bedId));
    }

    @PutMapping("/{bedId}/status")
    public ResponseEntity<Bed> updateStatus(
            @PathVariable Long bedId,
            @RequestBody Map<String, String> request) {
        Bed.BedStatus status = Bed.BedStatus.valueOf(request.get("status"));
        return ResponseEntity.ok(bedService.updateStatus(bedId, status));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "available", bedService.getAvailableCount(),
                "occupied", bedService.getOccupiedCount()
        ));
    }
}
