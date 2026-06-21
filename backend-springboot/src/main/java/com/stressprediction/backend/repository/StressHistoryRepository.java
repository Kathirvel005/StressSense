package com.stressprediction.backend.repository;

import com.stressprediction.backend.model.StressHistory;
import com.stressprediction.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface StressHistoryRepository extends JpaRepository<StressHistory, Long> {
    List<StressHistory> findByUserOrderByTimestampDesc(User user);
    
    @Query("SELECT sh.predictedStressLevel as level, COUNT(sh) as count FROM StressHistory sh GROUP BY sh.predictedStressLevel")
    List<Object[]> getStressLevelDistribution();

    @Query("SELECT AVG(sh.predictedStressLevel) FROM StressHistory sh WHERE sh.user = ?1")
    Double getAverageStressLevelForUser(User user);
    
    @Query("SELECT AVG(sh.predictedStressLevel) FROM StressHistory sh")
    Double getGlobalAverageStressLevel();
}
