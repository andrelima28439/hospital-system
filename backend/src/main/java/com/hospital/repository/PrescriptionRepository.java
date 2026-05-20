package com.hospital.repository;

import com.hospital.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByIssueDateDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByIssueDateDesc(Long doctorId);
}
