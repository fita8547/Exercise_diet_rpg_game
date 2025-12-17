package com.rpgworkout.model;

public class Quest {
    private String questId;
    private String title;
    private String description;
    private String type; // daily, weekly, main, side
    private String category; // walk, battle, costume, social
    private int targetValue;
    private int currentProgress;
    private boolean isCompleted;
    private boolean isActive;
    private QuestReward reward;
    private int requiredLevel;
    private long expiryTime; // 만료 시간 (일일 퀘스트용)

    // 생성자
    public Quest() {}

    public Quest(String questId, String title, String description, String type, 
                 String category, int targetValue, QuestReward reward, int requiredLevel) {
        this.questId = questId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.category = category;
        this.targetValue = targetValue;
        this.currentProgress = 0;
        this.isCompleted = false;
        this.isActive = true;
        this.reward = reward;
        this.requiredLevel = requiredLevel;
        
        // 일일 퀘스트는 24시간 후 만료
        if ("daily".equals(type)) {
            this.expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);
        }
    }

    // Getters and Setters
    public String getQuestId() { return questId; }
    public void setQuestId(String questId) { this.questId = questId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getTargetValue() { return targetValue; }
    public void setTargetValue(int targetValue) { this.targetValue = targetValue; }

    public int getCurrentProgress() { return currentProgress; }
    public void setCurrentProgress(int currentProgress) { this.currentProgress = currentProgress; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public QuestReward getReward() { return reward; }
    public void setReward(QuestReward reward) { this.reward = reward; }

    public int getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(int requiredLevel) { this.requiredLevel = requiredLevel; }

    public long getExpiryTime() { return expiryTime; }
    public void setExpiryTime(long expiryTime) { this.expiryTime = expiryTime; }

    // 진행률 계산
    public double getProgressPercentage() {
        if (targetValue == 0) return 0.0;
        return Math.min(100.0, (double) currentProgress / targetValue * 100.0);
    }

    // 퀘스트 완료 체크
    public boolean checkCompletion() {
        if (currentProgress >= targetValue && !isCompleted) {
            isCompleted = true;
            return true;
        }
        return false;
    }

    // 만료 체크
    public boolean isExpired() {
        return expiryTime > 0 && System.currentTimeMillis() > expiryTime;
    }

    public static class QuestReward {
        private int walkingExp;
        private int exp;
        private String itemId;
        private int itemQuantity;
        private String costumeId;

        public QuestReward() {}

        public QuestReward(int walkingExp, int exp, String itemId, int itemQuantity, String costumeId) {
            this.walkingExp = walkingExp;
            this.exp = exp;
            this.itemId = itemId;
            this.itemQuantity = itemQuantity;
            this.costumeId = costumeId;
        }

        // Getters and Setters
        public int getWalkingExp() { return walkingExp; }
        public void setWalkingExp(int walkingExp) { this.walkingExp = walkingExp; }

        public int getExp() { return exp; }
        public void setExp(int exp) { this.exp = exp; }

        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }

        public int getItemQuantity() { return itemQuantity; }
        public void setItemQuantity(int itemQuantity) { this.itemQuantity = itemQuantity; }

        public String getCostumeId() { return costumeId; }
        public void setCostumeId(String costumeId) { this.costumeId = costumeId; }
    }
}