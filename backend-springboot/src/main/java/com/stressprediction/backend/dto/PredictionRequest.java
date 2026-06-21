package com.stressprediction.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PredictionRequest {

    // Psychological
    @Min(0) @Max(21)
    @JsonProperty("anxiety_level")
    private int anxietyLevel;

    @Min(0) @Max(30)
    @JsonProperty("self_esteem")
    private int selfEsteem;

    @Min(0) @Max(1)
    @JsonProperty("mental_health_history")
    private int mentalHealthHistory;

    @Min(0) @Max(27)
    @JsonProperty("depression")
    private int depression;

    // Physiological
    @Min(0) @Max(5)
    @JsonProperty("headache")
    private int headache;

    @Min(1) @Max(3)
    @JsonProperty("blood_pressure")
    private int bloodPressure;

    @Min(0) @Max(5)
    @JsonProperty("sleep_quality")
    private int sleepQuality;

    @Min(0) @Max(5)
    @JsonProperty("breathing_problem")
    private int breathingProblem;

    // Environmental
    @Min(0) @Max(5)
    @JsonProperty("noise_level")
    private int noiseLevel;

    @Min(0) @Max(5)
    @JsonProperty("living_conditions")
    private int livingConditions;

    @Min(0) @Max(5)
    @JsonProperty("safety")
    private int safety;

    @Min(0) @Max(5)
    @JsonProperty("basic_needs")
    private int basicNeeds;

    // Academic
    @Min(0) @Max(5)
    @JsonProperty("academic_performance")
    private int academicPerformance;

    @Min(0) @Max(5)
    @JsonProperty("study_load")
    private int studyLoad;

    @Min(0) @Max(5)
    @JsonProperty("teacher_student_relationship")
    private int teacherStudentRelationship;

    @Min(0) @Max(5)
    @JsonProperty("future_career_concerns")
    private int futureCareerConcerns;

    // Social
    @Min(0) @Max(5)
    @JsonProperty("social_support")
    private int socialSupport;

    @Min(0) @Max(5)
    @JsonProperty("peer_pressure")
    private int peerPressure;

    @Min(0) @Max(5)
    @JsonProperty("extracurricular_activities")
    private int extracurricularActivities;

    @Min(0) @Max(5)
    @JsonProperty("bullying")
    private int bullying;
}
