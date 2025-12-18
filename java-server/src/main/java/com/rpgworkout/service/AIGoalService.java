package com.rpgworkout.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@Service
public class AIGoalService {
    
    /**
     * AI 기반 개인화된 걷기 목표 계산
     */
    public Map<String, Object> calculatePersonalizedGoals(Map<String, Object> userProfile) {
        Map<String, Object> goals = new HashMap<>();
        
        // 사용자 정보 추출
        double height = ((Number) userProfile.getOrDefault("height", 170)).doubleValue();
        double weight = ((Number) userProfile.getOrDefault("weight", 70)).doubleValue();
        String activityLevel = (String) userProfile.getOrDefault("activityLevel", "moderate");
        String goal = (String) userProfile.getOrDefault("goal", "fitness");
        int age = ((Number) userProfile.getOrDefault("age", 30)).intValue();
        
        // BMI 계산
        double bmi = weight / Math.pow(height / 100, 2);
        
        // 기본 걷기 목표 계산 (AI 알고리즘)
        double baseGoalKm = calculateBaseGoal(bmi, activityLevel, goal, age);
        
        // 일일 목표들 생성
        List<Map<String, Object>> dailyGoals = generateDailyGoals(baseGoalKm, userProfile);
        
        // 던전별 목표 거리 계산
        List<Map<String, Object>> dungeonGoals = generateDungeonGoals(baseGoalKm, userProfile);
        
        goals.put("baseGoalKm", baseGoalKm);
        goals.put("dailyGoals", dailyGoals);
        goals.put("dungeonGoals", dungeonGoals);
        goals.put("personalizedMessage", generatePersonalizedMessage(userProfile, baseGoalKm));
        
        return goals;
    }
    
    private double calculateBaseGoal(double bmi, String activityLevel, String goal, int age) {
        double baseKm = 2.0; // 기본 2km
        
        // BMI에 따른 조정
        if (bmi < 18.5) {
            baseKm *= 0.8; // 저체중 - 조금 적게
        } else if (bmi > 25) {
            baseKm *= 1.2; // 과체중 - 조금 더
        }
        
        // 활동 수준에 따른 조정
        switch (activityLevel.toLowerCase()) {
            case "low":
                baseKm *= 0.7;
                break;
            case "moderate":
                baseKm *= 1.0;
                break;
            case "high":
                baseKm *= 1.3;
                break;
        }
        
        // 목표에 따른 조정
        switch (goal.toLowerCase()) {
            case "weight_loss":
                baseKm *= 1.4;
                break;
            case "fitness":
                baseKm *= 1.0;
                break;
            case "health":
                baseKm *= 0.9;
                break;
        }
        
        // 나이에 따른 조정
        if (age > 50) {
            baseKm *= 0.9;
        } else if (age < 25) {
            baseKm *= 1.1;
        }
        
        return Math.round(baseKm * 10.0) / 10.0; // 소수점 1자리
    }
    
    private List<Map<String, Object>> generateDailyGoals(double baseGoalKm, Map<String, Object> userProfile) {
        List<Map<String, Object>> goals = new ArrayList<>();
        
        // 아침 목표
        Map<String, Object> morningGoal = new HashMap<>();
        morningGoal.put("time", "morning");
        morningGoal.put("targetKm", baseGoalKm * 0.4);
        morningGoal.put("description", "아침 산책으로 하루를 시작하세요!");
        morningGoal.put("reward", Map.of("exp", 50, "walkingExp", 20));
        goals.add(morningGoal);
        
        // 점심 목표
        Map<String, Object> lunchGoal = new HashMap<>();
        lunchGoal.put("time", "lunch");
        lunchGoal.put("targetKm", baseGoalKm * 0.3);
        lunchGoal.put("description", "점심시간 가벼운 걷기");
        lunchGoal.put("reward", Map.of("exp", 30, "walkingExp", 15));
        goals.add(lunchGoal);
        
        // 저녁 목표
        Map<String, Object> eveningGoal = new HashMap<>();
        eveningGoal.put("time", "evening");
        eveningGoal.put("targetKm", baseGoalKm * 0.3);
        eveningGoal.put("description", "저녁 운동으로 마무리!");
        eveningGoal.put("reward", Map.of("exp", 40, "walkingExp", 25));
        goals.add(eveningGoal);
        
        return goals;
    }
    
    private List<Map<String, Object>> generateDungeonGoals(double baseGoalKm, Map<String, Object> userProfile) {
        List<Map<String, Object>> dungeons = new ArrayList<>();
        
        // 쉬운 던전들 (기본 목표의 50-80%)
        dungeons.add(createDungeon("슬라임 숲", baseGoalKm * 0.5, "easy", "🟢", 
            Map.of("exp", 100, "walkingExp", 50, "item", "체력 포션")));
        
        dungeons.add(createDungeon("고블린 동굴", baseGoalKm * 0.7, "easy", "🟢",
            Map.of("exp", 150, "walkingExp", 75, "item", "에너지 드링크")));
        
        // 보통 던전들 (기본 목표의 100-150%)
        dungeons.add(createDungeon("오크 요새", baseGoalKm * 1.0, "normal", "🟡",
            Map.of("exp", 200, "walkingExp", 100, "item", "희귀한 보석")));
        
        dungeons.add(createDungeon("늑대 굴", baseGoalKm * 1.2, "normal", "🟡",
            Map.of("exp", 250, "walkingExp", 125, "item", "신속의 부츠")));
        
        // 어려운 던전들 (기본 목표의 150-200%)
        dungeons.add(createDungeon("해골 무덤", baseGoalKm * 1.5, "hard", "🔴",
            Map.of("exp", 300, "walkingExp", 150, "item", "경험치 부스터")));
        
        dungeons.add(createDungeon("드래곤 둥지", baseGoalKm * 2.0, "legendary", "🟣",
            Map.of("exp", 500, "walkingExp", 250, "item", "드래곤 비늘")));
        
        return dungeons;
    }
    
    private Map<String, Object> createDungeon(String name, double targetKm, String difficulty, 
                                            String icon, Map<String, Object> reward) {
        Map<String, Object> dungeon = new HashMap<>();
        dungeon.put("name", name);
        dungeon.put("targetKm", Math.round(targetKm * 10.0) / 10.0);
        dungeon.put("difficulty", difficulty);
        dungeon.put("icon", icon);
        dungeon.put("reward", reward);
        dungeon.put("autoComplete", true);
        return dungeon;
    }
    
    private String generatePersonalizedMessage(Map<String, Object> userProfile, double baseGoalKm) {
        String activityLevel = (String) userProfile.getOrDefault("activityLevel", "moderate");
        String goal = (String) userProfile.getOrDefault("goal", "fitness");
        
        StringBuilder message = new StringBuilder();
        message.append("🤖 AI 분석 결과: ");
        
        if ("low".equals(activityLevel)) {
            message.append("천천히 시작해서 꾸준히 걸어보세요! ");
        } else if ("high".equals(activityLevel)) {
            message.append("활동적이시네요! 조금 더 도전적인 목표를 설정했습니다. ");
        } else {
            message.append("적당한 활동량으로 건강한 습관을 만들어보세요! ");
        }
        
        message.append(String.format("하루 %.1fkm 걷기를 추천합니다. ", baseGoalKm));
        
        if ("weight_loss".equals(goal)) {
            message.append("체중 감량을 위해 조금 더 활발한 걷기를 권장합니다!");
        } else if ("health".equals(goal)) {
            message.append("건강 유지를 위한 적절한 운동량입니다!");
        } else {
            message.append("체력 향상을 위해 꾸준히 걸어보세요!");
        }
        
        return message.toString();
    }
    
    /**
     * 자동 던전 완료 체크
     */
    public Map<String, Object> checkAutoDungeonCompletion(double totalWalkDistance, 
                                                         Map<String, Object> userProfile) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> completedDungeons = new ArrayList<>();
        
        // 개인화된 목표 계산
        Map<String, Object> goals = calculatePersonalizedGoals(userProfile);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> dungeonGoals = (List<Map<String, Object>>) goals.get("dungeonGoals");
        
        // 완료된 던전 체크
        for (Map<String, Object> dungeon : dungeonGoals) {
            double targetKm = ((Number) dungeon.get("targetKm")).doubleValue();
            if (totalWalkDistance >= targetKm * 1000) { // m 단위로 변환
                completedDungeons.add(dungeon);
            }
        }
        
        result.put("completedDungeons", completedDungeons);
        result.put("totalReward", calculateTotalReward(completedDungeons));
        result.put("nextTarget", findNextTarget(totalWalkDistance, dungeonGoals));
        
        return result;
    }
    
    private Map<String, Object> calculateTotalReward(List<Map<String, Object>> completedDungeons) {
        int totalExp = 0;
        int totalWalkingExp = 0;
        List<String> items = new ArrayList<>();
        
        for (Map<String, Object> dungeon : completedDungeons) {
            @SuppressWarnings("unchecked")
            Map<String, Object> reward = (Map<String, Object>) dungeon.get("reward");
            totalExp += ((Number) reward.get("exp")).intValue();
            totalWalkingExp += ((Number) reward.get("walkingExp")).intValue();
            if (reward.containsKey("item")) {
                items.add((String) reward.get("item"));
            }
        }
        
        Map<String, Object> totalReward = new HashMap<>();
        totalReward.put("exp", totalExp);
        totalReward.put("walkingExp", totalWalkingExp);
        totalReward.put("items", items);
        
        return totalReward;
    }
    
    private Map<String, Object> findNextTarget(double currentDistance, List<Map<String, Object>> dungeonGoals) {
        for (Map<String, Object> dungeon : dungeonGoals) {
            double targetKm = ((Number) dungeon.get("targetKm")).doubleValue();
            if (currentDistance < targetKm * 1000) {
                Map<String, Object> nextTarget = new HashMap<>();
                nextTarget.put("dungeon", dungeon);
                nextTarget.put("remainingKm", targetKm - (currentDistance / 1000.0));
                return nextTarget;
            }
        }
        return null; // 모든 던전 완료
    }
}