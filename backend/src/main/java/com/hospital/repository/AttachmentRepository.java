package com.hospital.repository;

import com.hospital.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByMedicalRecordId(Long medicalRecordId);
}
