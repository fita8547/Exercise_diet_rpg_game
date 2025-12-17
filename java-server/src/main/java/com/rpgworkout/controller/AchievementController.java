package com.rpgworkout.controller;

import com.rpgworkout.model.Achievement;
import com.rpgworkout.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    // 사용자의 모든 업적 가져오기
    @GetMapping
    public Map<String, Object> getUserAchievements(@RequestParam(defaultValue = "test@test.com") String userEmail) {
        Map<String, Object> response = new HashMap<>();
        
        List<Achievement> activeAchievements = achievementService.getActiveAchievements(userEmail);
        List<Achievement> completedAchievements = achievementService.getCompletedAchievements(userEmail);
        List<Achievement> recentCompleted = achievementService.getRecentCompletedAchievements(userEmail);
        
        response.put("activeAchievements", activeAchievements);
        response.put("completedAchievements", completedAchievements);
        response.put("recentCompleted", recentCompleted);
        response.put("totalActive", activeAchievements.size());
        response.put("totalCompleted", completedAchievements.size());
        
        return response;
    }

    // 카테고리별 업적 가져오기
    @GetMapping("/category/{category}")
    public Map<String, Object> getAchievementsByCategory(@PathVariable String category,
                                                        @RequestParam(defaultValue = "test@test.com") String userEmail) {
        Map<String, Object> response = new HashMap<>();
        
        List<Achievement> achievements = achievementService.getAchievementsByCategory(userEmail, category);
        
        response.put("achievements", achievements);
        response.put("category", category);
        response.put("total", achievements.size());
        
        return response;
    }

    // 업적 진행도 업데이트
    @PostMapping("/progress")
    public Map<String, Object> updateAchievementProgress(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String category = (String) request.get("category");
        int value = (Integer) request.getOrDefault("value", 1);
        
        List<Achievement> completedAchievements = achievementService.updateAchievementProgress(userEmail, category, value);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "업적 진행도가 업데이트되었습니다");
        response.put("completedAchievements", completedAchievements);
        response.put("newCompletions", completedAchievements.size());
        
        return response;
    }

    // 업적 보상 수령
    @PostMapping("/claim")
    public Map<String, Object> claimAchievementReward(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String achievementId = (String) request.get("achievementId");
        
        Achievement.AchievementReward reward = achievementService.claimAchievementReward(userEmail, achievementId);
        
        Map<String, Object> response = new HashMap<>();
        if (reward != null) {
            response.put("success", true);
            response.put("message", "업적 보상을 받았습니다!");
            response.put("reward", reward);
        } else {
            response.put("success", false);
            response.put("message", "보상을 받을 수 없습니다");
        }
        
        return response;
    }

    // 업적 초기화 (새 사용자용)
    @PostMapping("/initialize")
    public Map<String, Object> initializeAchievements(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        
        achievementService.initializeUserAchievements(userEmail);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "업적이 초기화되었습니다");
        response.put("activeAchievements", achievementService.getActiveAchievements(userEmail));
        
        return response;
    }

    // 업적 통계
    @GetMapping("/stats")
    public Map<String, Object> getAchievementStats(@RequestParam(defaultValue = "test@test.com") String userEmail) {
        Map<String, Object> stats = achievementService.getAchievementStats(userEmail);
        
        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("message", "업적 통계를 불러왔습니다");
        
        return response;
    }

    // 업적 검색
    @GetMapping("/search")
    public Map<String, Object> searchAchievements(@RequestParam String query,
                                                 @RequestParam(defaultValue = "test@test.com") String userEmail) {
        List<Achievement> allAchievements = achievementService.getUserAchievements(userEmail);
        
        List<Achievement> searchResults = allAchievements.stream()
                .filter(achievement -> 
                    achievement.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                    achievement.getDescription().toLowerCase().contains(query.toLowerCase())
                )
                .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", searchResults);
        response.put("query", query);
        response.put("total", searchResults.size());
        
        return response;
    }

    // 업적 상세 정보
    @GetMapping("/{achievementId}")
    public Map<String, Object> getAchievementDetail(@PathVariable String achievementId,
                                                   @RequestParam(defaultValue = "test@test.com") String userEmail) {
        List<Achievement> userAchievements = achievementService.getUserAchievements(userEmail);
        
        Achievement achievement = userAchievements.stream()
                .filter(a -> a.getAchievementId().equals(achievementId))
                .findFirst()
                .orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        if (achievement != null) {
            response.put("success", true);
            response.put("achievement", achievement);
            response.put("progressPercentage", achievement.getProgressPercentage());
        } else {
            response.put("success", false);
            response.put("message", "업적을 찾을 수 없습니다");
        }
        
        return response;
    }
}