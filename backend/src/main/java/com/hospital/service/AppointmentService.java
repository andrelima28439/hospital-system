package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public Appointment create(AppointmentRequest request) {
        Patient patient = patientRepository.findByIdAndActiveTrue(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.getRole().name().equals("DOCTOR")) {
            throw new BadRequestException("User is not a doctor");
        }

        if (request.getDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot schedule appointment in the past");
        }

        LocalDateTime endDateTime = request.getDateTime().plusMinutes(30);

        List<Appointment> conflicts = appointmentRepository
                .findScheduledByDoctorAndPeriod(request.getDoctorId(), request.getDateTime(), endDateTime);

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Doctor already has an appointment at this time");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .dateTime(request.getDateTime())
                .endDateTime(endDateTime)
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .notes(request.getNotes())
                .reason(request.getReason())
                .build();

        return appointmentRepository.save(appointment);
    }

    public Page<Appointment> findByPatient(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientIdOrderByDateTimeDesc(patientId, pageable);
    }

    public Page<Appointment> findByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorIdOrderByDateTimeDesc(doctorId, pageable);
    }

    public Appointment update(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot update cancelled appointment");
        }

        if (request.getDateTime() != null) {
            LocalDateTime endDateTime = request.getDateTime().plusMinutes(30);
            appointment.setDateTime(request.getDateTime());
            appointment.setEndDateTime(endDateTime);
        }

        if (request.getNotes() != null) appointment.setNotes(request.getNotes());
        if (request.getReason() != null) appointment.setReason(request.getReason());

        return appointmentRepository.save(appointment);
    }

    public void cancel(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    public List<LocalDateTime> getAvailableSlots(Long doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Appointment> appointments = appointmentRepository
                .findScheduledByDoctorAndPeriod(doctorId, startOfDay, endOfDay);

        List<LocalDateTime> allSlots = new ArrayList<>();
        LocalTime startTime = LocalTime.of(8, 0);
        LocalTime endTime = LocalTime.of(18, 0);

        while (startTime.isBefore(endTime)) {
            allSlots.add(LocalDateTime.of(date, startTime));
            startTime = startTime.plusMinutes(30);
        }

        for (Appointment apt : appointments) {
            allSlots.removeIf(slot ->
                    !slot.isBefore(apt.getEndDateTime()) && !slot.isBefore(apt.getDateTime()));
        }

        return allSlots;
    }
}
