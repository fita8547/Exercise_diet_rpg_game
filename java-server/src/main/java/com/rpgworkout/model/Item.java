package com.rpgworkout.model;

public class Item {
    private String itemId;
    private String name;
    private String description;
    private String category; // consumable, material, special
    private String rarity; // common, rare, epic, legendary
    private String icon;
    private int price; // 걷기 경험치로 구매
    private boolean isStackable;
    private int maxStack;
    private ItemEffect effect;

    // 생성자
    public Item() {}

    public Item(String itemId, String name, String description, String category, 
                String rarity, String icon, int price, boolean isStackable, 
                int maxStack, ItemEffect effect) {
        this.itemId = itemId;
        this.name = name;
        this.description = description;
        this.category = category;
        this.rarity = rarity;
        this.icon = icon;
        this.price = price;
        this.isStackable = isStackable;
        this.maxStack = maxStack;
        this.effect = effect;
    }

    // Getters and Setters
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRarity() { return rarity; }
    public void setRarity(String rarity) { this.rarity = rarity; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public boolean isStackable() { return isStackable; }
    public void setStackable(boolean stackable) { isStackable = stackable; }

    public int getMaxStack() { return maxStack; }
    public void setMaxStack(int maxStack) { this.maxStack = maxStack; }

    public ItemEffect getEffect() { return effect; }
    public void setEffect(ItemEffect effect) { this.effect = effect; }

    public static class ItemEffect {
        private String type; // heal, buff, exp_boost, distance_boost
        private int value;
        private int duration; // 지속시간 (초)
        private String description;

        public ItemEffect() {}

        public ItemEffect(String type, int value, int duration, String description) {
            this.type = type;
            this.value = value;
            this.duration = duration;
            this.description = description;
        }

        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public int getValue() { return value; }
        public void setValue(int value) { this.value = value; }

        public int getDuration() { return duration; }
        public void setDuration(int duration) { this.duration = duration; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}