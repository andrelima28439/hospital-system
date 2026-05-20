package com.hospital.repository;

import com.hospital.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Page<Patient> findByActiveTrue(Pageable pageable);
    Optional<Patient> findByIdAndActiveTrue(Long id);
    boolean existsByCpf(String cpf);
}
