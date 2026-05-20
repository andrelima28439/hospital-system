package com.hospital.repository;

import com.hospital.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByStatus(Bed.BedStatus status);
    long countByStatus(Bed.BedStatus status);
    List<Bed> findByWard(String ward);
}
