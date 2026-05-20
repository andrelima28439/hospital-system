package com.hospital.repository;

import com.hospital.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Page<Appointment> findByPatientIdOrderByDateTimeDesc(Long patientId, Pageable pageable);
    Page<Appointment> findByDoctorIdOrderByDateTimeDesc(Long doctorId, Pageable pageable);
    List<Appointment> findByDoctorIdAndDateTimeBetweenOrderByDateTimeAsc(Long doctorId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.dateTime >= :start AND a.dateTime < :end AND a.status <> 'CANCELLED'")
    List<Appointment> findScheduledByDoctorAndPeriod(@Param("doctorId") Long doctorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.dateTime BETWEEN :start AND :end AND a.status = 'SCHEDULED'")
    List<Appointment> findAppointmentsForReminder(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
