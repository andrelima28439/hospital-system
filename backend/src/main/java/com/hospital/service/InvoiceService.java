package com.hospital.service;

import com.hospital.dto.InvoiceRequest;
import com.hospital.entity.Invoice;
import com.hospital.entity.InvoiceItem;
import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.InvoiceRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;

    public Invoice create(InvoiceRequest request) {
        Patient patient = patientRepository.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        String invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .patient(patient)
                .issueDate(LocalDateTime.now())
                .dueDate(request.getDueDate())
                .totalAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .status(Invoice.InvoiceStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();

        List<InvoiceItem> items = request.getItems().stream()
                .map(item -> InvoiceItem.builder()
                        .invoice(invoice)
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        invoice.setItems(items);
        invoice.setTotalAmount(items.stream()
                .map(InvoiceItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .subtract(invoice.getDiscount()));

        return invoiceRepository.save(invoice);
    }

    public Page<Invoice> findByPatient(Long patientId, Pageable pageable) {
        return invoiceRepository.findByPatientIdOrderByIssueDateDesc(patientId, pageable);
    }

    public Invoice findById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    public Invoice payInvoice(Long id, BigDecimal amount) {
        Invoice invoice = findById(id);

        BigDecimal newPaid = invoice.getPaidAmount() != null ?
                invoice.getPaidAmount().add(amount) : amount;

        invoice.setPaidAmount(newPaid);
        invoice.setPaymentDate(LocalDateTime.now());

        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        } else {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
        }

        return invoiceRepository.save(invoice);
    }

    public Invoice cancel(Long id) {
        Invoice invoice = findById(id);
        invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
        return invoiceRepository.save(invoice);
    }
}
