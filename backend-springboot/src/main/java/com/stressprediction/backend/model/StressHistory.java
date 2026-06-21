package com.stressprediction.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stress_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StressHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Inputs (20 variables)
    // Psychological
    private int anxietyLevel;
    private int selfEsteem;
    private int mentalHealthHistory;
    private int depression;

    // Physiological
    private int headache;
    private int bloodPressure;
    private int sleepQuality;
    private int breathingProblem;

    // Environmental
    private int noiseLevel;
    private int livingConditions;
    private int safety;
    private int basicNeeds;

    // Academic
    private int academicPerformance;
    private int studyLoad;
    private int teacherStudentRelationship;
    private int futureCareerConcerns;

    // Social
    private int socialSupport;
    private int peerPressure;
    private int extracurricularActivities;
    private int bullying;

    // Outputs
    private int predictedStressLevel;
    private double confidence;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
