package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "beds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String bedNumber;

    @Column(nullable = false, length = 50)
    private String ward;

    @Column(length = 50)
    private String room;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BedStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "occupied_at")
    private LocalDateTime occupiedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum BedStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, CLEANING
    }
}
