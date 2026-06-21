package com.stressprediction.backend.controller;

import com.stressprediction.backend.dto.PredictionRequest;
import com.stressprediction.backend.dto.PredictionResponse;
import com.stressprediction.backend.model.StressHistory;
import com.stressprediction.backend.model.User;
import com.stressprediction.backend.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/predict")
    public ResponseEntity<?> predict(
            @Valid @RequestBody PredictionRequest request,
            @AuthenticationPrincipal User user) {
        try {
            PredictionResponse response = predictionService.predictStress(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<StressHistory>> getHistory(@AuthenticationPrincipal User user) {
        List<StressHistory> history = predictionService.getUserPredictionHistory(user);
        return ResponseEntity.ok(history);
    }
}
