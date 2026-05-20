package com.hospital.controller;

import com.hospital.dto.InvoiceRequest;
import com.hospital.entity.Invoice;
import com.hospital.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> create(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.create(request));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<Invoice>> findByPatient(@PathVariable Long patientId, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.findByPatient(patientId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> findById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Invoice> pay(@PathVariable Long id, @RequestBody Map<String, BigDecimal> request) {
        return ResponseEntity.ok(invoiceService.payInvoice(id, request.get("amount")));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Invoice> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.cancel(id));
    }
}
