package com.hospital.service;

import com.hospital.dto.BedRequest;
import com.hospital.entity.Bed;
import com.hospital.entity.Patient;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.BedRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;

    public List<Bed> findAll() {
        return bedRepository.findAll();
    }

    public Bed findById(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));
    }

    public Bed create(BedRequest request) {
        Bed bed = Bed.builder()
                .bedNumber(request.getBedNumber())
                .ward(request.getWard())
                .room(request.getRoom())
                .status(request.getStatus() != null ? request.getStatus() : Bed.BedStatus.AVAILABLE)
                .build();

        return bedRepository.save(bed);
    }

    public Bed occupyBed(Long bedId, Long patientId) {
        Bed bed = findById(bedId);
        Patient patient = patientRepository.findByIdAndActiveTrue(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (bed.getStatus() != Bed.BedStatus.AVAILABLE) {
            throw new BadRequestException("Bed is not available");
        }

        bed.setStatus(Bed.BedStatus.OCCUPIED);
        bed.setPatient(patient);
        bed.setOccupiedAt(LocalDateTime.now());

        return bedRepository.save(bed);
    }

    public Bed releaseBed(Long bedId) {
        Bed bed = findById(bedId);

        bed.setStatus(Bed.BedStatus.AVAILABLE);
        bed.setPatient(null);
        bed.setOccupiedAt(null);

        return bedRepository.save(bed);
    }

    public Bed updateStatus(Long bedId, Bed.BedStatus status) {
        Bed bed = findById(bedId);
        bed.setStatus(status);
        return bedRepository.save(bed);
    }

    public List<Bed> findByWard(String ward) {
        return bedRepository.findByWard(ward);
    }

    public long getAvailableCount() {
        return bedRepository.countByStatus(Bed.BedStatus.AVAILABLE);
    }

    public long getOccupiedCount() {
        return bedRepository.countByStatus(Bed.BedStatus.OCCUPIED);
    }
}
