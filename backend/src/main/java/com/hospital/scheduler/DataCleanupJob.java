package com.hospital.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataCleanupJob {

    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "0 0 3 * * SUN")
    public void cleanOldData() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusYears(2);

        int deletedLogs = jdbcTemplate.update(
                "DELETE FROM audit_logs WHERE created_at < ?", cutoffDate);

        log.info("Cleaned up {} old audit log records", deletedLogs);
    }
}
