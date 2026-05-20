package com.hospital.repository;

import com.hospital.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByPatientIdOrderByIssueDateDesc(Long patientId, Pageable pageable);
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    boolean existsByInvoiceNumber(String invoiceNumber);
}
