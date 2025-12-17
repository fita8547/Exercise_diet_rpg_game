package com.rpgworkout.service;

import com.rpgworkout.model.Item;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ItemService {
    
    // 메모리 저장소 (실제로는 데이터베이스 사용)
    private final Map<String, Map<String, Integer>> userInventories = new HashMap<>();
    private final Map<String, Item> itemCatalog = new HashMap<>();

    public ItemService() {
        initializeItemCatalog();
    }

    private void initializeItemCatalog() {
        // 소모품 아이템들
        itemCatalog.put("health_potion", new Item(
            "health_potion", "체력 포션", "체력을 50 회복합니다", "consumable", "common", "🧪", 30, true, 99,
            new Item.ItemEffect("heal", 50, 0, "즉시 체력 50 회복")
        ));
        
        itemCatalog.put("energy_drink", new Item(
            "energy_drink", "에너지 드링크", "30분간 걷기 경험치 2배", "consumable", "rare", "⚡", 100, true, 10,
            new Item.ItemEffect("exp_boost", 200, 1800, "30분간 걷기 경험치 2배")
        ));
        
        itemCatalog.put("speed_boots", new Item(
            "speed_boots", "신속의 부츠", "1시간 동안 이동 속도 증가", "consumable", "epic", "👟", 200, true, 5,
            new Item.ItemEffect("distance_boost", 150, 3600, "1시간 동안 걷기 거리 1.5배")
        ));

        // 재료 아이템들
        itemCatalog.put("rare_gem", new Item(
            "rare_gem", "희귀한 보석", "특별한 제작에 사용되는 보석", "material", "rare", "💎", 500, true, 50,
            new Item.ItemEffect("material", 0, 0, "제작 재료")
        ));
        
        itemCatalog.put("dragon_scale_material", new Item(
            "dragon_scale_material", "드래곤 비늘", "전설 장비 제작 재료", "material", "legendary", "🐲", 1000, true, 10,
            new Item.ItemEffect("material", 0, 0, "전설 장비 제작 재료")
        ));

        // 특수 아이템들
        itemCatalog.put("exp_boost", new Item(
            "exp_boost", "경험치 부스터", "1시간 동안 모든 경험치 2배", "special", "epic", "⭐", 300, true, 3,
            new Item.ItemEffect("exp_boost", 200, 3600, "1시간 동안 모든 경험치 2배")
        ));
        
        itemCatalog.put("lucky_charm", new Item(
            "lucky_charm", "행운의 부적", "24시간 동안 희귀 아이템 드롭률 증가", "special", "legendary", "🍀", 800, true, 1,
            new Item.ItemEffect("luck_boost", 300, 86400, "24시간 동안 희귀 아이템 드롭률 3배")
        ));
    }

    // 사용자 인벤토리 가져오기
    public Map<String, Integer> getUserInventory(String userEmail) {
        return userInventories.getOrDefault(userEmail, new HashMap<>());
    }

    // 아이템 상세 정보와 함께 인벤토리 가져오기
    public List<Map<String, Object>> getUserInventoryWithDetails(String userEmail) {
        Map<String, Integer> inventory = getUserInventory(userEmail);
        List<Map<String, Object>> detailedInventory = new ArrayList<>();
        
        for (Map.Entry<String, Integer> entry : inventory.entrySet()) {
            String itemId = entry.getKey();
            int quantity = entry.getValue();
            Item item = itemCatalog.get(itemId);
            
            if (item != null && quantity > 0) {
                Map<String, Object> itemData = new HashMap<>();
                itemData.put("item", item);
                itemData.put("quantity", quantity);
                detailedInventory.add(itemData);
            }
        }
        
        return detailedInventory;
    }

    // 아이템 추가
    public boolean addItem(String userEmail, String itemId, int quantity) {
        Item item = itemCatalog.get(itemId);
        if (item == null) return false;
        
        Map<String, Integer> inventory = userInventories.computeIfAbsent(userEmail, k -> new HashMap<>());
        int currentQuantity = inventory.getOrDefault(itemId, 0);
        
        if (item.isStackable()) {
            int newQuantity = Math.min(currentQuantity + quantity, item.getMaxStack());
            inventory.put(itemId, newQuantity);
            return true;
        } else {
            if (currentQuantity == 0) {
                inventory.put(itemId, 1);
                return true;
            }
            return false; // 이미 가지고 있음
        }
    }

    // 아이템 사용
    public Map<String, Object> useItem(String userEmail, String itemId) {
        Map<String, Integer> inventory = getUserInventory(userEmail);
        int currentQuantity = inventory.getOrDefault(itemId, 0);
        
        if (currentQuantity <= 0) {
            return Map.of("success", false, "message", "아이템이 부족합니다");
        }
        
        Item item = itemCatalog.get(itemId);
        if (item == null) {
            return Map.of("success", false, "message", "존재하지 않는 아이템입니다");
        }
        
        // 아이템 수량 감소
        inventory.put(itemId, currentQuantity - 1);
        
        // 효과 적용
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", item.getName() + "을(를) 사용했습니다");
        result.put("effect", item.getEffect());
        
        return result;
    }

    // 아이템 구매 (걷기 경험치로)
    public boolean purchaseItem(String userEmail, String itemId, int walkingExp) {
        Item item = itemCatalog.get(itemId);
        if (item == null) return false;
        
        if (walkingExp < item.getPrice()) return false;
        
        return addItem(userEmail, itemId, 1);
    }

    // 상점용 아이템 목록
    public List<Item> getShopItems() {
        return new ArrayList<>(itemCatalog.values());
    }

    // 아이템 정보 가져오기
    public Item getItem(String itemId) {
        return itemCatalog.get(itemId);
    }

    // 아이템 제거
    public boolean removeItem(String userEmail, String itemId, int quantity) {
        Map<String, Integer> inventory = getUserInventory(userEmail);
        int currentQuantity = inventory.getOrDefault(itemId, 0);
        
        if (currentQuantity < quantity) return false;
        
        inventory.put(itemId, currentQuantity - quantity);
        return true;
    }

    // 인벤토리 슬롯 수 계산
    public int getUsedSlots(String userEmail) {
        return getUserInventory(userEmail).size();
    }

    // 최대 인벤토리 슬롯 수 (레벨에 따라 증가)
    public int getMaxSlots(int userLevel) {
        return 20 + (userLevel / 5) * 5; // 기본 20개, 5레벨마다 5개씩 증가
    }
}