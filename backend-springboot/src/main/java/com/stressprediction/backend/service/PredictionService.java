package com.stressprediction.backend.service;

import com.stressprediction.backend.dto.PredictionRequest;
import com.stressprediction.backend.dto.PredictionResponse;
import com.stressprediction.backend.model.StressHistory;
import com.stressprediction.backend.model.User;
import com.stressprediction.backend.repository.StressHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final StressHistoryRepository historyRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public PredictionResponse predictStress(PredictionRequest request, User user) {
        String url = mlServiceUrl + "/predict";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Wrap request in entity
        HttpEntity<PredictionRequest> entity = new HttpEntity<>(request, headers);
        
        // Query Python Flask microservice
        PredictionResponse flaskResponse;
        try {
            flaskResponse = restTemplate.postForObject(url, entity, PredictionResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to reach Machine Learning Service at " + url + ": " + e.getMessage());
        }

        if (flaskResponse == null) {
            throw new RuntimeException("ML service returned an empty response");
        }

        // Save to Database
        StressHistory history = StressHistory.builder()
                .user(user)
                .anxietyLevel(request.getAnxietyLevel())
                .selfEsteem(request.getSelfEsteem())
                .mentalHealthHistory(request.getMentalHealthHistory())
                .depression(request.getDepression())
                .headache(request.getHeadache())
                .bloodPressure(request.getBloodPressure())
                .sleepQuality(request.getSleepQuality())
                .breathingProblem(request.getBreathingProblem())
                .noiseLevel(request.getNoiseLevel())
                .livingConditions(request.getLivingConditions())
                .safety(request.getSafety())
                .basicNeeds(request.getBasicNeeds())
                .academicPerformance(request.getAcademicPerformance())
                .studyLoad(request.getStudyLoad())
                .teacherStudentRelationship(request.getTeacherStudentRelationship())
                .futureCareerConcerns(request.getFutureCareerConcerns())
                .socialSupport(request.getSocialSupport())
                .peerPressure(request.getPeerPressure())
                .extracurricularActivities(request.getExtracurricularActivities())
                .bullying(request.getBullying())
                .predictedStressLevel(flaskResponse.getStressLevel())
                .confidence(flaskResponse.getConfidence())
                .build();

        historyRepository.save(history);

        return flaskResponse;
    }

    public List<StressHistory> getUserPredictionHistory(User user) {
        return historyRepository.findByUserOrderByTimestampDesc(user);
    }

    public Map<String, Object> getUserAnalyticsSummary(User user) {
        List<StressHistory> historyList = getUserPredictionHistory(user);
        
        Double averageStress = historyRepository.getAverageStressLevelForUser(user);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("predictionCount", historyList.size());
        summary.put("averageStressLevel", averageStress != null ? averageStress : 0.0);
        summary.put("recentPredictions", historyList.stream().limit(10).toList());
        
        return summary;
    }

    public Map<String, Object> getAdminAnalyticsSummary() {
        List<Object[]> distribution = historyRepository.getStressLevelDistribution();
        Double globalAverage = historyRepository.getGlobalAverageStressLevel();
        
        Map<Integer, Long> levelCounts = new HashMap<>();
        levelCounts.put(0, 0L);
        levelCounts.put(1, 0L);
        levelCounts.put(2, 0L);
        
        for (Object[] row : distribution) {
            Integer level = (Integer) row[0];
            Long count = (Long) row[1];
            levelCounts.put(level, count);
        }

        // Get Model info
        Map<String, Object> mlMetrics = new HashMap<>();
        try {
            String url = mlServiceUrl + "/metrics";
            mlMetrics = restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            mlMetrics.put("error", "Flask microservice unreachable");
        }

        Map<String, Object> adminSummary = new HashMap<>();
        adminSummary.put("stressLevelDistribution", levelCounts);
        adminSummary.put("globalAverageStressLevel", globalAverage != null ? globalAverage : 0.0);
        adminSummary.put("mlMetrics", mlMetrics);
        
        return adminSummary;
    }
}
