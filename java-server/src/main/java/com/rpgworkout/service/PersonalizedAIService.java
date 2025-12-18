package com.rpgworkout.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

@Service
public class PersonalizedAIService {
    
    @Value("${openai.api.key:}")
    private String openaiApiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * AI 기반 개인화된 게임 경험 생성
     */
    public Map<String, Object> generatePersonalizedGameExperience(Map<String, Object> userProfile) {
        Map<String, Object> gameExperience = new HashMap<>();
        
        try {
            // AI 분석 수행
            Map<String, Object> aiAnalysis = performAIAnalysis(userProfile);
            
            // 개인화된 던전 생성
            List<Map<String, Object>> personalizedDungeons = generatePersonalizedDungeons(aiAnalysis, userProfile);
            
            // 맞춤형 퀘스트 생성
            List<Map<String, Object>> personalizedQuests = generatePersonalizedQuests(aiAnalysis, userProfile);
            
            // 개인화된 캐릭터 특성 생성
            Map<String, Object> characterTraits = generateCharacterTraits(aiAnalysis, userProfile);
            
            // 맞춤형 운동 계획 생성
            Map<String, Object> workoutPlan = generateWorkoutPlan(aiAnalysis, userProfile);
            
            gameExperience.put("aiAnalysis", aiAnalysis);
            gameExperience.put("personalizedDungeons", personalizedDungeons);
            gameExperience.put("personalizedQuests", personalizedQuests);
            gameExperience.put("characterTraits", characterTraits);
            gameExperience.put("workoutPlan", workoutPlan);
            gameExperience.put("success", true);
            
        } catch (Exception e) {
            System.err.println("AI 분석 실패, 기본 설정 사용: " + e.getMessage());
            // AI 실패 시 기본 설정 사용
            gameExperience = generateDefaultGameExperience(userProfile);
        }
        
        return gameExperience;
    }
    
    private Map<String, Object> performAIAnalysis(Map<String, Object> userProfile) throws Exception {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            return performLocalAIAnalysis(userProfile);
        }
        
        // OpenAI API 호출을 위한 프롬프트 생성
        String prompt = createAnalysisPrompt(userProfile);
        
        // OpenAI API 호출
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", Arrays.asList(
            Map.of("role", "system", "content", "당신은 운동과 게임화 전문가입니다. 사용자의 신체 정보와 목표를 분석하여 맞춤형 RPG 게임 경험을 설계해주세요."),
            Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.7);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.set("Content-Type", "application/json");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            "https://api.openai.com/v1/chat/completions",
            HttpMethod.POST,
            entity,
            String.class
        );
        
        // 응답 파싱
        JsonNode responseJson = objectMapper.readTree(response.getBody());
        String aiResponse = responseJson.get("choices").get(0).get("message").get("content").asText();
        
        return parseAIResponse(aiResponse);
    }
    
    private String createAnalysisPrompt(Map<String, Object> userProfile) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("사용자 정보:\n");
        prompt.append("- 키: ").append(userProfile.get("height")).append("cm\n");
        prompt.append("- 몸무게: ").append(userProfile.get("weight")).append("kg\n");
        prompt.append("- 활동 수준: ").append(userProfile.get("activityLevel")).append("\n");
        prompt.append("- 목표: ").append(userProfile.get("goal")).append("\n");
        prompt.append("- 나이: ").append(userProfile.getOrDefault("age", 30)).append("세\n\n");
        
        prompt.append("다음 형식으로 분석 결과를 JSON으로 제공해주세요:\n");
        prompt.append("{\n");
        prompt.append("  \"personalityType\": \"모험가형/전략가형/탐험가형/수집가형 중 하나\",\n");
        prompt.append("  \"motivationStyle\": \"경쟁형/성취형/사회형/자기계발형 중 하나\",\n");
        prompt.append("  \"preferredIntensity\": \"low/moderate/high\",\n");
        prompt.append("  \"recommendedDailyGoal\": \"숫자 (km)\",\n");
        prompt.append("  \"characterClass\": \"warrior/mage/archer/paladin 중 하나\",\n");
        prompt.append("  \"specialTraits\": [\"특성1\", \"특성2\", \"특성3\"],\n");
        prompt.append("  \"personalizedMessage\": \"개인화된 격려 메시지\"\n");
        prompt.append("}\n");
        
        return prompt.toString();
    }
    
    private Map<String, Object> parseAIResponse(String aiResponse) {
        try {
            // JSON 부분만 추출
            int startIndex = aiResponse.indexOf("{");
            int endIndex = aiResponse.lastIndexOf("}") + 1;
            if (startIndex >= 0 && endIndex > startIndex) {
                String jsonPart = aiResponse.substring(startIndex, endIndex);
                return objectMapper.readValue(jsonPart, Map.class);
            }
        } catch (Exception e) {
            System.err.println("AI 응답 파싱 실패: " + e.getMessage());
        }
        
        // 파싱 실패 시 기본값 반환
        return createDefaultAIAnalysis();
    }
    
    private Map<String, Object> performLocalAIAnalysis(Map<String, Object> userProfile) {
        Map<String, Object> analysis = new HashMap<>();
        
        double height = ((Number) userProfile.getOrDefault("height", 170)).doubleValue();
        double weight = ((Number) userProfile.getOrDefault("weight", 70)).doubleValue();
        String activityLevel = (String) userProfile.getOrDefault("activityLevel", "moderate");
        String goal = (String) userProfile.getOrDefault("goal", "fitness");
        
        // BMI 기반 분석
        double bmi = weight / Math.pow(height / 100, 2);
        
        // 성격 유형 결정
        String personalityType = determinePersonalityType(activityLevel, goal);
        String motivationStyle = determineMotivationStyle(goal, activityLevel);
        String preferredIntensity = determinePreferredIntensity(activityLevel, bmi);
        String characterClass = determineCharacterClass(goal, activityLevel);
        
        analysis.put("personalityType", personalityType);
        analysis.put("motivationStyle", motivationStyle);
        analysis.put("preferredIntensity", preferredIntensity);
        analysis.put("recommendedDailyGoal", calculateRecommendedGoal(bmi, activityLevel, goal));
        analysis.put("characterClass", characterClass);
        analysis.put("specialTraits", generateSpecialTraits(personalityType, motivationStyle));
        analysis.put("personalizedMessage", generatePersonalizedMessage(personalityType, motivationStyle, goal));
        
        return analysis;
    }
    
    private String determinePersonalityType(String activityLevel, String goal) {
        if ("high".equals(activityLevel)) {
            return "모험가형";
        } else if ("habit".equals(goal)) {
            return "전략가형";
        } else if ("endurance".equals(goal)) {
            return "탐험가형";
        } else {
            return "수집가형";
        }
    }
    
    private String determineMotivationStyle(String goal, String activityLevel) {
        if ("strength".equals(goal)) {
            return "경쟁형";
        } else if ("endurance".equals(goal)) {
            return "성취형";
        } else if ("high".equals(activityLevel)) {
            return "사회형";
        } else {
            return "자기계발형";
        }
    }
    
    private String determinePreferredIntensity(String activityLevel, double bmi) {
        if ("high".equals(activityLevel) && bmi < 25) {
            return "high";
        } else if ("low".equals(activityLevel) || bmi > 30) {
            return "low";
        } else {
            return "moderate";
        }
    }
    
    private String determineCharacterClass(String goal, String activityLevel) {
        if ("strength".equals(goal)) {
            return "warrior";
        } else if ("endurance".equals(goal)) {
            return "archer";
        } else if ("habit".equals(goal)) {
            return "mage";
        } else {
            return "paladin";
        }
    }
    
    private double calculateRecommendedGoal(double bmi, String activityLevel, String goal) {
        double baseGoal = 2.0; // 기본 2km
        
        // BMI 조정
        if (bmi < 18.5) baseGoal *= 0.8;
        else if (bmi > 25) baseGoal *= 1.2;
        
        // 활동 수준 조정
        switch (activityLevel) {
            case "low": baseGoal *= 0.7; break;
            case "high": baseGoal *= 1.3; break;
        }
        
        // 목표 조정
        if ("strength".equals(goal)) baseGoal *= 1.1;
        else if ("endurance".equals(goal)) baseGoal *= 1.4;
        
        return Math.round(baseGoal * 10.0) / 10.0;
    }
    
    private List<String> generateSpecialTraits(String personalityType, String motivationStyle) {
        List<String> traits = new ArrayList<>();
        
        switch (personalityType) {
            case "모험가형":
                traits.addAll(Arrays.asList("위험 감수", "빠른 적응", "에너지 넘침"));
                break;
            case "전략가형":
                traits.addAll(Arrays.asList("계획적 사고", "꾸준함", "분석적"));
                break;
            case "탐험가형":
                traits.addAll(Arrays.asList("호기심 많음", "지구력", "탐구정신"));
                break;
            case "수집가형":
                traits.addAll(Arrays.asList("완벽주의", "체계적", "목표지향"));
                break;
        }
        
        return traits;
    }
    
    private String generatePersonalizedMessage(String personalityType, String motivationStyle, String goal) {
        StringBuilder message = new StringBuilder();
        
        message.append("🎯 ").append(personalityType).append(" 특성을 가진 당신에게 ");
        
        switch (motivationStyle) {
            case "경쟁형":
                message.append("도전적인 목표와 경쟁 요소를 추가했습니다!");
                break;
            case "성취형":
                message.append("단계별 성취감을 느낄 수 있는 시스템을 준비했습니다!");
                break;
            case "사회형":
                message.append("다른 플레이어와 함께할 수 있는 요소들을 포함했습니다!");
                break;
            case "자기계발형":
                message.append("개인적 성장에 집중할 수 있는 콘텐츠를 마련했습니다!");
                break;
        }
        
        return message.toString();
    }
    
    private List<Map<String, Object>> generatePersonalizedDungeons(Map<String, Object> aiAnalysis, Map<String, Object> userProfile) {
        List<Map<String, Object>> dungeons = new ArrayList<>();
        
        String personalityType = (String) aiAnalysis.get("personalityType");
        String characterClass = (String) aiAnalysis.get("characterClass");
        double recommendedGoal = ((Number) aiAnalysis.get("recommendedDailyGoal")).doubleValue();
        
        // 성격 유형에 따른 맞춤형 던전 생성
        switch (personalityType) {
            case "모험가형":
                dungeons.add(createPersonalizedDungeon("위험한 화산 동굴", recommendedGoal * 0.8, "hard", "🌋", 
                    "모험가답게 위험을 무릅쓰고 도전하세요!", characterClass));
                dungeons.add(createPersonalizedDungeon("미지의 정글", recommendedGoal * 1.2, "legendary", "🌿",
                    "새로운 영역을 탐험하는 스릴을 느껴보세요!", characterClass));
                break;
                
            case "전략가형":
                dungeons.add(createPersonalizedDungeon("고대 도서관", recommendedGoal * 0.6, "normal", "📚",
                    "체계적으로 계획을 세워 정복하세요!", characterClass));
                dungeons.add(createPersonalizedDungeon("마법사의 탑", recommendedGoal * 1.0, "hard", "🗼",
                    "전략적 사고로 퍼즐을 해결하세요!", characterClass));
                break;
                
            case "탐험가형":
                dungeons.add(createPersonalizedDungeon("끝없는 사막", recommendedGoal * 1.5, "legendary", "🏜️",
                    "지구력을 시험하는 긴 여정입니다!", characterClass));
                dungeons.add(createPersonalizedDungeon("심해 동굴", recommendedGoal * 1.1, "hard", "🌊",
                    "깊은 곳까지 탐험해보세요!", characterClass));
                break;
                
            case "수집가형":
                dungeons.add(createPersonalizedDungeon("보물 창고", recommendedGoal * 0.7, "normal", "💎",
                    "희귀한 아이템들을 수집하세요!", characterClass));
                dungeons.add(createPersonalizedDungeon("용의 보물고", recommendedGoal * 1.3, "legendary", "🐉",
                    "최고의 보물을 찾아보세요!", characterClass));
                break;
        }
        
        return dungeons;
    }
    
    private Map<String, Object> createPersonalizedDungeon(String name, double targetKm, String difficulty, 
                                                         String icon, String description, String characterClass) {
        Map<String, Object> dungeon = new HashMap<>();
        dungeon.put("name", name);
        dungeon.put("targetKm", Math.round(targetKm * 10.0) / 10.0);
        dungeon.put("difficulty", difficulty);
        dungeon.put("icon", icon);
        dungeon.put("description", description);
        dungeon.put("characterClass", characterClass);
        
        // 캐릭터 클래스에 따른 보상 조정
        Map<String, Object> reward = new HashMap<>();
        switch (characterClass) {
            case "warrior":
                reward.put("exp", 200);
                reward.put("walkingExp", 100);
                reward.put("item", "전사의 검");
                break;
            case "mage":
                reward.put("exp", 250);
                reward.put("walkingExp", 80);
                reward.put("item", "마법의 지팡이");
                break;
            case "archer":
                reward.put("exp", 180);
                reward.put("walkingExp", 120);
                reward.put("item", "정확한 활");
                break;
            case "paladin":
                reward.put("exp", 220);
                reward.put("walkingExp", 90);
                reward.put("item", "성스러운 방패");
                break;
        }
        
        dungeon.put("reward", reward);
        dungeon.put("personalized", true);
        
        return dungeon;
    }
    
    private List<Map<String, Object>> generatePersonalizedQuests(Map<String, Object> aiAnalysis, Map<String, Object> userProfile) {
        List<Map<String, Object>> quests = new ArrayList<>();
        
        String motivationStyle = (String) aiAnalysis.get("motivationStyle");
        double recommendedGoal = ((Number) aiAnalysis.get("recommendedDailyGoal")).doubleValue();
        
        // 동기 스타일에 따른 맞춤형 퀘스트
        switch (motivationStyle) {
            case "경쟁형":
                quests.add(createPersonalizedQuest("속도의 도전", "다른 플레이어보다 빠르게 목표 달성", 
                    recommendedGoal * 0.5, "daily"));
                break;
            case "성취형":
                quests.add(createPersonalizedQuest("단계별 성장", "매일 조금씩 거리 늘리기", 
                    recommendedGoal * 0.3, "weekly"));
                break;
            case "사회형":
                quests.add(createPersonalizedQuest("함께하는 걸음", "친구와 함께 걷기", 
                    recommendedGoal * 0.8, "social"));
                break;
            case "자기계발형":
                quests.add(createPersonalizedQuest("개인 기록 갱신", "자신의 최고 기록 경신", 
                    recommendedGoal * 1.2, "personal"));
                break;
        }
        
        return quests;
    }
    
    private Map<String, Object> createPersonalizedQuest(String name, String description, double targetKm, String type) {
        Map<String, Object> quest = new HashMap<>();
        quest.put("name", name);
        quest.put("description", description);
        quest.put("targetKm", Math.round(targetKm * 10.0) / 10.0);
        quest.put("type", type);
        quest.put("reward", Map.of("exp", 150, "walkingExp", 75));
        quest.put("personalized", true);
        return quest;
    }
    
    private Map<String, Object> generateCharacterTraits(Map<String, Object> aiAnalysis, Map<String, Object> userProfile) {
        Map<String, Object> traits = new HashMap<>();
        
        @SuppressWarnings("unchecked")
        List<String> specialTraits = (List<String>) aiAnalysis.get("specialTraits");
        String characterClass = (String) aiAnalysis.get("characterClass");
        
        traits.put("class", characterClass);
        traits.put("specialAbilities", specialTraits);
        traits.put("personalityType", aiAnalysis.get("personalityType"));
        traits.put("motivationStyle", aiAnalysis.get("motivationStyle"));
        
        return traits;
    }
    
    private Map<String, Object> generateWorkoutPlan(Map<String, Object> aiAnalysis, Map<String, Object> userProfile) {
        Map<String, Object> plan = new HashMap<>();
        
        String preferredIntensity = (String) aiAnalysis.get("preferredIntensity");
        double recommendedGoal = ((Number) aiAnalysis.get("recommendedDailyGoal")).doubleValue();
        
        plan.put("dailyGoal", recommendedGoal);
        plan.put("intensity", preferredIntensity);
        plan.put("weeklyPlan", generateWeeklyPlan(recommendedGoal, preferredIntensity));
        
        return plan;
    }
    
    private List<Map<String, Object>> generateWeeklyPlan(double dailyGoal, String intensity) {
        List<Map<String, Object>> weeklyPlan = new ArrayList<>();
        String[] days = {"월", "화", "수", "목", "금", "토", "일"};
        
        for (int i = 0; i < 7; i++) {
            Map<String, Object> dayPlan = new HashMap<>();
            dayPlan.put("day", days[i]);
            
            // 강도에 따른 일별 목표 조정
            double dayGoal = dailyGoal;
            if ("high".equals(intensity)) {
                dayGoal *= (i == 6) ? 1.5 : 1.0; // 일요일 강화
            } else if ("low".equals(intensity)) {
                dayGoal *= (i == 6) ? 0.5 : 0.8; // 전체적으로 낮춤
            }
            
            dayPlan.put("targetKm", Math.round(dayGoal * 10.0) / 10.0);
            dayPlan.put("restDay", i == 6 && "low".equals(intensity));
            
            weeklyPlan.add(dayPlan);
        }
        
        return weeklyPlan;
    }
    
    private Map<String, Object> createDefaultAIAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("personalityType", "수집가형");
        analysis.put("motivationStyle", "자기계발형");
        analysis.put("preferredIntensity", "moderate");
        analysis.put("recommendedDailyGoal", 2.0);
        analysis.put("characterClass", "paladin");
        analysis.put("specialTraits", Arrays.asList("균형감각", "꾸준함", "적응력"));
        analysis.put("personalizedMessage", "당신만의 속도로 꾸준히 걸어보세요!");
        return analysis;
    }
    
    private Map<String, Object> generateDefaultGameExperience(Map<String, Object> userProfile) {
        Map<String, Object> gameExperience = new HashMap<>();
        Map<String, Object> defaultAnalysis = createDefaultAIAnalysis();
        
        gameExperience.put("aiAnalysis", defaultAnalysis);
        gameExperience.put("personalizedDungeons", generatePersonalizedDungeons(defaultAnalysis, userProfile));
        gameExperience.put("personalizedQuests", generatePersonalizedQuests(defaultAnalysis, userProfile));
        gameExperience.put("characterTraits", generateCharacterTraits(defaultAnalysis, userProfile));
        gameExperience.put("workoutPlan", generateWorkoutPlan(defaultAnalysis, userProfile));
        gameExperience.put("success", true);
        gameExperience.put("fallback", true);
        
        return gameExperience;
    }
}