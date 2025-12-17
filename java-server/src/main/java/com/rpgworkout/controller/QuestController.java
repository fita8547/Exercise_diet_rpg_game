package com.rpgworkout.controller;

import com.rpgworkout.model.Quest;
import com.rpgworkout.service.QuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quests")
@CrossOrigin(origins = "*")
public class QuestController {

    @Autowired
    private QuestService questService;

    // 사용자의 모든 퀘스트 가져오기
    @GetMapping
    public Map<String, Object> getUserQuests(@RequestParam(defaultValue = "test@test.com") String userEmail) {
        Map<String, Object> response = new HashMap<>();
        
        List<Quest> activeQuests = questService.getActiveQuests(userEmail);
        List<Quest> completedQuests = questService.getCompletedQuests(userEmail);
        
        response.put("activeQuests", activeQuests);
        response.put("completedQuests", completedQuests);
        response.put("totalActive", activeQuests.size());
        response.put("totalCompleted", completedQuests.size());
        
        return response;
    }

    // 일일 퀘스트 생성
    @PostMapping("/daily/generate")
    public Map<String, Object> generateDailyQuests(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        int userLevel = (Integer) request.getOrDefault("userLevel", 1);
        
        questService.generateDailyQuests(userEmail, userLevel);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "일일 퀘스트가 생성되었습니다");
        response.put("activeQuests", questService.getActiveQuests(userEmail));
        
        return response;
    }

    // 퀘스트 진행도 업데이트
    @PostMapping("/progress")
    public Map<String, Object> updateQuestProgress(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String category = (String) request.get("category");
        int value = (Integer) request.getOrDefault("value", 1);
        
        List<Quest> completedQuests = questService.updateQuestProgress(userEmail, category, value);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "퀘스트 진행도가 업데이트되었습니다");
        response.put("completedQuests", completedQuests);
        response.put("activeQuests", questService.getActiveQuests(userEmail));
        
        return response;
    }

    // 퀘스트 보상 수령
    @PostMapping("/claim")
    public Map<String, Object> claimQuestReward(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String questId = (String) request.get("questId");
        
        Quest.QuestReward reward = questService.claimQuestReward(userEmail, questId);
        
        Map<String, Object> response = new HashMap<>();
        if (reward != null) {
            response.put("success", true);
            response.put("message", "퀘스트 보상을 받았습니다!");
            response.put("reward", reward);
        } else {
            response.put("success", false);
            response.put("message", "보상을 받을 수 없습니다");
        }
        
        return response;
    }

    // 메인 퀘스트 초기화 (새 사용자용)
    @PostMapping("/initialize")
    public Map<String, Object> initializeQuests(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        
        questService.initializeMainQuests(userEmail);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "퀘스트가 초기화되었습니다");
        response.put("activeQuests", questService.getActiveQuests(userEmail));
        
        return response;
    }

    // 퀘스트 통계
    @GetMapping("/stats")
    public Map<String, Object> getQuestStats(@RequestParam(defaultValue = "test@test.com") String userEmail) {
        List<Quest> allQuests = questService.getUserQuests(userEmail);
        
        long totalQuests = allQuests.size();
        long completedQuests = allQuests.stream().filter(Quest::isCompleted).count();
        long activeQuests = allQuests.stream().filter(q -> q.isActive() && !q.isCompleted()).count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalQuests", totalQuests);
        response.put("completedQuests", completedQuests);
        response.put("activeQuests", activeQuests);
        response.put("completionRate", totalQuests > 0 ? (double) completedQuests / totalQuests * 100 : 0);
        
        return response;
    }
}