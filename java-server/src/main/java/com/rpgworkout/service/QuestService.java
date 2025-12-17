package com.rpgworkout.service;

import com.rpgworkout.model.Quest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestService {
    
    // 메모리 저장소 (실제로는 데이터베이스 사용)
    private final Map<String, List<Quest>> userQuests = new HashMap<>();
    private final List<Quest> questTemplates = new ArrayList<>();

    public QuestService() {
        initializeQuestTemplates();
    }

    private void initializeQuestTemplates() {
        // 일일 퀘스트 템플릿
        questTemplates.add(new Quest(
            "daily_walk_1km", "첫 걸음", "1km 걷기", "daily", "walk", 1000,
            new Quest.QuestReward(50, 25, null, 0, null), 1
        ));
        
        questTemplates.add(new Quest(
            "daily_walk_3km", "꾸준한 걸음", "3km 걷기", "daily", "walk", 3000,
            new Quest.QuestReward(150, 75, "health_potion", 1, null), 3
        ));
        
        questTemplates.add(new Quest(
            "daily_battle_3", "전투의 달인", "던전에서 3번 승리", "daily", "battle", 3,
            new Quest.QuestReward(100, 50, "energy_drink", 2, null), 2
        ));

        // 주간 퀘스트 템플릿
        questTemplates.add(new Quest(
            "weekly_walk_20km", "주간 마라토너", "일주일간 20km 걷기", "weekly", "walk", 20000,
            new Quest.QuestReward(500, 250, "rare_gem", 1, null), 5
        ));

        // 메인 퀘스트 템플릿
        questTemplates.add(new Quest(
            "main_first_costume", "첫 번째 꾸미기", "코스튬 1개 구매하기", "main", "costume", 1,
            new Quest.QuestReward(200, 100, null, 0, "warrior_helmet"), 1
        ));
        
        questTemplates.add(new Quest(
            "main_level_10", "성장의 길", "레벨 10 달성", "main", "level", 10,
            new Quest.QuestReward(300, 200, "exp_boost", 3, null), 1
        ));

        // 사이드 퀘스트 템플릿
        questTemplates.add(new Quest(
            "side_walk_marathon", "마라톤 도전", "42.195km 걷기", "side", "walk", 42195,
            new Quest.QuestReward(1000, 500, null, 0, "legendary_necklace"), 10
        ));
    }

    // 사용자 퀘스트 목록 가져오기
    public List<Quest> getUserQuests(String userEmail) {
        return userQuests.getOrDefault(userEmail, new ArrayList<>());
    }

    // 활성 퀘스트만 가져오기
    public List<Quest> getActiveQuests(String userEmail) {
        return getUserQuests(userEmail).stream()
                .filter(quest -> quest.isActive() && !quest.isCompleted() && !quest.isExpired())
                .collect(Collectors.toList());
    }

    // 완료된 퀘스트 가져오기
    public List<Quest> getCompletedQuests(String userEmail) {
        return getUserQuests(userEmail).stream()
                .filter(Quest::isCompleted)
                .collect(Collectors.toList());
    }

    // 일일 퀘스트 생성
    public void generateDailyQuests(String userEmail, int userLevel) {
        List<Quest> userQuestList = userQuests.computeIfAbsent(userEmail, k -> new ArrayList<>());
        
        // 기존 일일 퀘스트 제거 (만료된 것들)
        userQuestList.removeIf(quest -> "daily".equals(quest.getType()) && quest.isExpired());
        
        // 새로운 일일 퀘스트 추가 (레벨에 맞는 것들만)
        List<Quest> availableDailyQuests = questTemplates.stream()
                .filter(quest -> "daily".equals(quest.getType()) && quest.getRequiredLevel() <= userLevel)
                .collect(Collectors.toList());
        
        // 랜덤하게 3개 선택
        Collections.shuffle(availableDailyQuests);
        for (int i = 0; i < Math.min(3, availableDailyQuests.size()); i++) {
            Quest template = availableDailyQuests.get(i);
            Quest newQuest = createQuestFromTemplate(template);
            userQuestList.add(newQuest);
        }
    }

    // 퀘스트 진행도 업데이트
    public List<Quest> updateQuestProgress(String userEmail, String category, int value) {
        List<Quest> userQuestList = getUserQuests(userEmail);
        List<Quest> completedQuests = new ArrayList<>();
        
        for (Quest quest : userQuestList) {
            if (quest.getCategory().equals(category) && quest.isActive() && !quest.isCompleted()) {
                quest.setCurrentProgress(quest.getCurrentProgress() + value);
                if (quest.checkCompletion()) {
                    completedQuests.add(quest);
                }
            }
        }
        
        return completedQuests;
    }

    // 퀘스트 보상 수령
    public Quest.QuestReward claimQuestReward(String userEmail, String questId) {
        List<Quest> userQuestList = getUserQuests(userEmail);
        
        for (Quest quest : userQuestList) {
            if (quest.getQuestId().equals(questId) && quest.isCompleted()) {
                quest.setActive(false); // 비활성화
                return quest.getReward();
            }
        }
        
        return null;
    }

    // 템플릿에서 새 퀘스트 생성
    private Quest createQuestFromTemplate(Quest template) {
        Quest newQuest = new Quest();
        newQuest.setQuestId(template.getQuestId() + "_" + System.currentTimeMillis());
        newQuest.setTitle(template.getTitle());
        newQuest.setDescription(template.getDescription());
        newQuest.setType(template.getType());
        newQuest.setCategory(template.getCategory());
        newQuest.setTargetValue(template.getTargetValue());
        newQuest.setCurrentProgress(0);
        newQuest.setCompleted(false);
        newQuest.setActive(true);
        newQuest.setReward(template.getReward());
        newQuest.setRequiredLevel(template.getRequiredLevel());
        
        // 일일 퀘스트는 24시간 후 만료
        if ("daily".equals(template.getType())) {
            newQuest.setExpiryTime(System.currentTimeMillis() + (24 * 60 * 60 * 1000));
        }
        
        return newQuest;
    }

    // 메인 퀘스트 초기화 (새 사용자용)
    public void initializeMainQuests(String userEmail) {
        List<Quest> userQuestList = userQuests.computeIfAbsent(userEmail, k -> new ArrayList<>());
        
        // 메인 퀘스트 추가
        List<Quest> mainQuests = questTemplates.stream()
                .filter(quest -> "main".equals(quest.getType()))
                .collect(Collectors.toList());
        
        for (Quest template : mainQuests) {
            Quest newQuest = createQuestFromTemplate(template);
            userQuestList.add(newQuest);
        }
    }
}