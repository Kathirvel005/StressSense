package com.stressprediction.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {

    @JsonProperty("stress_level")
    private int stressLevel;

    private String label;
    private double confidence;

    @JsonProperty("top_contributors")
    private List<Contributor> topContributors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Contributor {
        private String feature;
        private double value;
        private double score;
    }
}
