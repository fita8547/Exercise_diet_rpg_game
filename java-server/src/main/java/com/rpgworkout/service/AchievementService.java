package com.rpgworkout.service;

import com.rpgworkout.model.Achievement;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AchievementService {
    
    // 메모리 저장소 (실제로는 데이터베이스 사용)
    private final Map<String, List<Achievement>> userAchievements = new HashMap<>();
    private final List<Achievement> achievementTemplates = new ArrayList<>();

    public AchievementService() {
        initializeAchievementTemplates();
    }

    private void initializeAchievementTemplates() {
        // 걷기 관련 업적
        achievementTemplates.add(new Achievement(
            "walk_first_step", "첫 걸음", "첫 1km 걷기", "walk", "🚶", 1000, false,
            new Achievement.AchievementReward(100, 50, "초보 워커", null, "health_potion", 3)
        ));
        
        achievementTemplates.add(new Achievement(
            "walk_10km", "꾸준한 걸음", "총 10km 걷기", "walk", "🏃", 10000, false,
            new Achievement.AchievementReward(300, 150, "꾸준한 워커", null, "energy_drink", 5)
        ));
        
        achievementTemplates.add(new Achievement(
            "walk_marathon", "마라토너", "42.195km 걷기", "walk", "🏃‍♂️", 42195, false,
            new Achievement.AchievementReward(1000, 500, "마라토너", "legendary_necklace", null, 0)
        ));
        
        achievementTemplates.add(new Achievement(
            "walk_100km", "백km 워커", "총 100km 걷기", "walk", "🌟", 100000, false,
            new Achievement.AchievementReward(2000, 1000, "백km 워커", null, "lucky_charm", 1)
        ));

        // 전투 관련 업적
        achievementTemplates.add(new Achievement(
            "battle_first_win", "첫 승리", "첫 번째 전투 승리", "battle", "⚔️", 1, false,
            new Achievement.AchievementReward(50, 25, "신참 전사", null, "health_potion", 1)
        ));
        
        achievementTemplates.add(new Achievement(
            "battle_10_wins", "전투의 달인", "10번 전투 승리", "battle", "🛡️", 10, false,
            new Achievement.AchievementReward(200, 100, "전투의 달인", null, "exp_boost", 2)
        ));
        
        achievementTemplates.add(new Achievement(
            "battle_boss_slayer", "보스 킬러", "보스 몬스터 5마리 처치", "battle", "👑", 5, false,
            new Achievement.AchievementReward(500, 250, "보스 킬러", "dragon_scale", null, 0)
        ));

        // 수집 관련 업적
        achievementTemplates.add(new Achievement(
            "collection_first_costume", "패셔니스타", "첫 번째 코스튬 구매", "collection", "👗", 1, false,
            new Achievement.AchievementReward(100, 50, "패셔니스타", null, "rare_gem", 1)
        ));
        
        achievementTemplates.add(new Achievement(
            "collection_5_costumes", "코스튬 컬렉터", "코스튬 5개 수집", "collection", "🎭", 5, false,
            new Achievement.AchievementReward(300, 150, "코스튬 컬렉터", null, "dragon_scale_material", 1)
        ));

        // 소셜 관련 업적
        achievementTemplates.add(new Achievement(
            "social_first_friend", "첫 친구", "첫 번째 친구 추가", "social", "👥", 1, false,
            new Achievement.AchievementReward(50, 25, "사교적인", null, "health_potion", 2)
        ));

        // 특별 업적 (숨겨진)
        achievementTemplates.add(new Achievement(
            "special_night_walker", "야행성", "밤 12시~6시 사이에 5km 걷기", "special", "🌙", 5000, true,
            new Achievement.AchievementReward(500, 250, "야행성 워커", null, "lucky_charm", 1)
        ));
        
        achievementTemplates.add(new Achievement(
            "special_speed_demon", "스피드 데몬", "1시간 안에 10km 걷기", "special", "💨", 10000, true,
            new Achievement.AchievementReward(800, 400, "스피드 데몬", "excalibur", null, 0)
        ));
    }

    // 사용자 업적 목록 가져오기
    public List<Achievement> getUserAchievements(String userEmail) {
        return userAchievements.getOrDefault(userEmail, new ArrayList<>());
    }

    // 완료된 업적만 가져오기
    public List<Achievement> getCompletedAchievements(String userEmail) {
        return getUserAchievements(userEmail).stream()
                .filter(Achievement::isCompleted)
                .collect(Collectors.toList());
    }

    // 진행 중인 업적만 가져오기 (숨겨진 업적 제외)
    public List<Achievement> getActiveAchievements(String userEmail) {
        return getUserAchievements(userEmail).stream()
                .filter(achievement -> !achievement.isCompleted() && !achievement.isHidden())
                .collect(Collectors.toList());
    }

    // 카테고리별 업적 가져오기
    public List<Achievement> getAchievementsByCategory(String userEmail, String category) {
        return getUserAchievements(userEmail).stream()
                .filter(achievement -> achievement.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    // 업적 진행도 업데이트
    public List<Achievement> updateAchievementProgress(String userEmail, String category, int value) {
        List<Achievement> userAchievementList = getUserAchievements(userEmail);
        List<Achievement> completedAchievements = new ArrayList<>();
        
        for (Achievement achievement : userAchievementList) {
            if (achievement.getCategory().equals(category) && !achievement.isCompleted()) {
                achievement.setCurrentProgress(achievement.getCurrentProgress() + value);
                if (achievement.checkCompletion()) {
                    completedAchievements.add(achievement);
                }
            }
        }
        
        return completedAchievements;
    }

    // 업적 보상 수령
    public Achievement.AchievementReward claimAchievementReward(String userEmail, String achievementId) {
        List<Achievement> userAchievementList = getUserAchievements(userEmail);
        
        for (Achievement achievement : userAchievementList) {
            if (achievement.getAchievementId().equals(achievementId) && achievement.isCompleted()) {
                return achievement.getReward();
            }
        }
        
        return null;
    }

    // 사용자 업적 초기화 (새 사용자용)
    public void initializeUserAchievements(String userEmail) {
        List<Achievement> userAchievementList = userAchievements.computeIfAbsent(userEmail, k -> new ArrayList<>());
        
        // 모든 업적 템플릿을 사용자에게 추가
        for (Achievement template : achievementTemplates) {
            Achievement newAchievement = createAchievementFromTemplate(template);
            userAchievementList.add(newAchievement);
        }
    }

    // 템플릿에서 새 업적 생성
    private Achievement createAchievementFromTemplate(Achievement template) {
        Achievement newAchievement = new Achievement();
        newAchievement.setAchievementId(template.getAchievementId());
        newAchievement.setTitle(template.getTitle());
        newAchievement.setDescription(template.getDescription());
        newAchievement.setCategory(template.getCategory());
        newAchievement.setIcon(template.getIcon());
        newAchievement.setTargetValue(template.getTargetValue());
        newAchievement.setCurrentProgress(0);
        newAchievement.setCompleted(false);
        newAchievement.setHidden(template.isHidden());
        newAchievement.setReward(template.getReward());
        newAchievement.setCompletedAt(0);
        
        return newAchievement;
    }

    // 업적 통계
    public Map<String, Object> getAchievementStats(String userEmail) {
        List<Achievement> allAchievements = getUserAchievements(userEmail);
        
        long totalAchievements = allAchievements.size();
        long completedAchievements = allAchievements.stream().filter(Achievement::isCompleted).count();
        long hiddenCompleted = allAchievements.stream()
                .filter(a -> a.isCompleted() && a.isHidden()).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAchievements", totalAchievements);
        stats.put("completedAchievements", completedAchievements);
        stats.put("hiddenCompleted", hiddenCompleted);
        stats.put("completionRate", totalAchievements > 0 ? (double) completedAchievements / totalAchievements * 100 : 0);
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = allAchievements.stream()
                .filter(Achievement::isCompleted)
                .collect(Collectors.groupingBy(Achievement::getCategory, Collectors.counting()));
        stats.put("categoryStats", categoryStats);
        
        return stats;
    }

    // 최근 완료된 업적 (최대 5개)
    public List<Achievement> getRecentCompletedAchievements(String userEmail) {
        return getUserAchievements(userEmail).stream()
                .filter(Achievement::isCompleted)
                .sorted((a, b) -> Long.compare(b.getCompletedAt(), a.getCompletedAt()))
                .limit(5)
                .collect(Collectors.toList());
    }
}