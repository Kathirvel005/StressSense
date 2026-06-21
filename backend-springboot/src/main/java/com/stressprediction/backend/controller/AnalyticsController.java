package com.stressprediction.backend.controller;

import com.stressprediction.backend.model.User;
import com.stressprediction.backend.service.PredictionService;
import com.stressprediction.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final PredictionService predictionService;
    private final UserService userService;

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getUserSummary(@AuthenticationPrincipal User user) {
        Map<String, Object> summary = predictionService.getUserAnalyticsSummary(user);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analytics/admin-summary")
    public ResponseEntity<Map<String, Object>> getAdminSummary() {
        Map<String, Object> summary = predictionService.getAdminAnalyticsSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }
}
