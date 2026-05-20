package com.hospital.scheduler;

import com.hospital.entity.Appointment;
import com.hospital.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderJob {

    private final AppointmentRepository appointmentRepository;

    @Scheduled(cron = "0 0 8 * * ?")
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindow = now.plusDays(1);

        List<Appointment> upcomingAppointments = appointmentRepository
                .findAppointmentsForReminder(now, reminderWindow);

        for (Appointment appointment : upcomingAppointments) {
            log.info("REMINDER: Appointment for patient {} with Dr. {} at {}",
                    appointment.getPatient().getName(),
                    appointment.getDoctor().getName(),
                    appointment.getDateTime());
        }

        log.info("Sent {} appointment reminders", upcomingAppointments.size());
    }
}
