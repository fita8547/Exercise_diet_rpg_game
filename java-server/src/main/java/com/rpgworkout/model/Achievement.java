package com.rpgworkout.model;

public class Achievement {
    private String achievementId;
    private String title;
    private String description;
    private String category; // walk, battle, social, collection, special
    private String icon;
    private int targetValue;
    private int currentProgress;
    private boolean isCompleted;
    private boolean isHidden; // 숨겨진 업적
    private AchievementReward reward;
    private long completedAt;

    // 생성자
    public Achievement() {}

    public Achievement(String achievementId, String title, String description, 
                      String category, String icon, int targetValue, 
                      boolean isHidden, AchievementReward reward) {
        this.achievementId = achievementId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.icon = icon;
        this.targetValue = targetValue;
        this.currentProgress = 0;
        this.isCompleted = false;
        this.isHidden = isHidden;
        this.reward = reward;
        this.completedAt = 0;
    }

    // Getters and Setters
    public String getAchievementId() { return achievementId; }
    public void setAchievementId(String achievementId) { this.achievementId = achievementId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getTargetValue() { return targetValue; }
    public void setTargetValue(int targetValue) { this.targetValue = targetValue; }

    public int getCurrentProgress() { return currentProgress; }
    public void setCurrentProgress(int currentProgress) { this.currentProgress = currentProgress; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public boolean isHidden() { return isHidden; }
    public void setHidden(boolean hidden) { isHidden = hidden; }

    public AchievementReward getReward() { return reward; }
    public void setReward(AchievementReward reward) { this.reward = reward; }

    public long getCompletedAt() { return completedAt; }
    public void setCompletedAt(long completedAt) { this.completedAt = completedAt; }

    // 진행률 계산
    public double getProgressPercentage() {
        if (targetValue == 0) return 0.0;
        return Math.min(100.0, (double) currentProgress / targetValue * 100.0);
    }

    // 업적 완료 체크
    public boolean checkCompletion() {
        if (currentProgress >= targetValue && !isCompleted) {
            isCompleted = true;
            completedAt = System.currentTimeMillis();
            return true;
        }
        return false;
    }

    public static class AchievementReward {
        private int walkingExp;
        private int exp;
        private String title; // 칭호
        private String costumeId;
        private String itemId;
        private int itemQuantity;

        public AchievementReward() {}

        public AchievementReward(int walkingExp, int exp, String title, 
                               String costumeId, String itemId, int itemQuantity) {
            this.walkingExp = walkingExp;
            this.exp = exp;
            this.title = title;
            this.costumeId = costumeId;
            this.itemId = itemId;
            this.itemQuantity = itemQuantity;
        }

        // Getters and Setters
        public int getWalkingExp() { return walkingExp; }
        public void setWalkingExp(int walkingExp) { this.walkingExp = walkingExp; }

        public int getExp() { return exp; }
        public void setExp(int exp) { this.exp = exp; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCostumeId() { return costumeId; }
        public void setCostumeId(String costumeId) { this.costumeId = costumeId; }

        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }

        public int getItemQuantity() { return itemQuantity; }
        public void setItemQuantity(int itemQuantity) { this.itemQuantity = itemQuantity; }
    }
}