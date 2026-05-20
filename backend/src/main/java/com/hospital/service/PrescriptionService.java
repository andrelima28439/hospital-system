package com.hospital.service;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.entity.Patient;
import com.hospital.entity.Prescription;
import com.hospital.entity.PrescriptionItem;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.UserRepository;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public Prescription create(PrescriptionRequest request, Long doctorId) {
        Patient patient = patientRepository.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Prescription prescription = Prescription.builder()
                .patient(patient)
                .doctor(doctor)
                .issueDate(request.getIssueDate() != null ? request.getIssueDate() : LocalDate.now())
                .validUntil(request.getValidUntil())
                .notes(request.getNotes())
                .build();

        List<PrescriptionItem> items = request.getItems().stream()
                .map(item -> PrescriptionItem.builder()
                        .prescription(prescription)
                        .medicationName(item.getMedicationName())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .instructions(item.getInstructions())
                        .build())
                .toList();

        prescription.setItems(items);
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByIssueDateDesc(patientId);
    }

    public byte[] generatePdf(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        Document document = new Document(new com.itextpdf.kernel.pdf.PdfDocument(writer));

        document.add(new Paragraph("HOSPITAL PRESCRIPTION")
                .setFontSize(18).setBold());
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Patient: " + prescription.getPatient().getName()));
        document.add(new Paragraph("Doctor: Dr. " + prescription.getDoctor().getName()));
        document.add(new Paragraph("Date: " + prescription.getIssueDate().toString()));
        if (prescription.getValidUntil() != null) {
            document.add(new Paragraph("Valid until: " + prescription.getValidUntil().toString()));
        }

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Medications:").setBold());

        float[] columnWidths = {200, 100, 100, 100};
        Table table = new Table(columnWidths);
        table.addHeaderCell("Medication");
        table.addHeaderCell("Dosage");
        table.addHeaderCell("Frequency");
        table.addHeaderCell("Duration");

        for (PrescriptionItem item : prescription.getItems()) {
            table.addCell(item.getMedicationName());
            table.addCell(item.getDosage() != null ? item.getDosage() : "");
            table.addCell(item.getFrequency() != null ? item.getFrequency() : "");
            table.addCell(item.getDuration() != null ? item.getDuration() : "");
        }

        document.add(table);

        if (prescription.getNotes() != null && !prescription.getNotes().isEmpty()) {
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Notes: " + prescription.getNotes()));
        }

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Doctor's Signature: ________________________"));

        document.close();
        return baos.toByteArray();
    }
}
