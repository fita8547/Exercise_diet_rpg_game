package com.rpgworkout.controller;

import com.rpgworkout.model.Item;
import com.rpgworkout.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemService itemService;

    // 사용자 인벤토리 조회
    @GetMapping("/inventory")
    public Map<String, Object> getUserInventory(@RequestParam(defaultValue = "test@test.com") String userEmail,
                                               @RequestParam(defaultValue = "1") int userLevel) {
        Map<String, Object> response = new HashMap<>();
        
        List<Map<String, Object>> inventory = itemService.getUserInventoryWithDetails(userEmail);
        int usedSlots = itemService.getUsedSlots(userEmail);
        int maxSlots = itemService.getMaxSlots(userLevel);
        
        response.put("inventory", inventory);
        response.put("usedSlots", usedSlots);
        response.put("maxSlots", maxSlots);
        response.put("message", "인벤토리를 불러왔습니다");
        
        return response;
    }

    // 아이템 상점 조회
    @GetMapping("/shop")
    public Map<String, Object> getItemShop() {
        Map<String, Object> response = new HashMap<>();
        
        List<Item> shopItems = itemService.getShopItems();
        
        response.put("items", shopItems);
        response.put("message", "아이템 상점 목록을 불러왔습니다");
        
        return response;
    }

    // 아이템 구매
    @PostMapping("/purchase")
    public Map<String, Object> purchaseItem(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String itemId = (String) request.get("itemId");
        int walkingExp = (Integer) request.getOrDefault("walkingExp", 0);
        
        Item item = itemService.getItem(itemId);
        if (item == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "존재하지 않는 아이템입니다");
            return response;
        }
        
        if (walkingExp < item.getPrice()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "걷기 경험치가 부족합니다");
            response.put("required", item.getPrice());
            response.put("current", walkingExp);
            return response;
        }
        
        boolean success = itemService.purchaseItem(userEmail, itemId, walkingExp);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", item.getName() + "을(를) 구매했습니다!");
            response.put("item", item);
            response.put("remainingExp", walkingExp - item.getPrice());
        } else {
            response.put("success", false);
            response.put("message", "구매에 실패했습니다");
        }
        
        return response;
    }

    // 아이템 사용
    @PostMapping("/use")
    public Map<String, Object> useItem(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String itemId = (String) request.get("itemId");
        
        Map<String, Object> result = itemService.useItem(userEmail, itemId);
        
        return result;
    }

    // 아이템 추가 (관리자/퀘스트 보상용)
    @PostMapping("/add")
    public Map<String, Object> addItem(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        String itemId = (String) request.get("itemId");
        int quantity = (Integer) request.getOrDefault("quantity", 1);
        
        boolean success = itemService.addItem(userEmail, itemId, quantity);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            Item item = itemService.getItem(itemId);
            response.put("success", true);
            response.put("message", item.getName() + " " + quantity + "개를 획득했습니다!");
            response.put("item", item);
            response.put("quantity", quantity);
        } else {
            response.put("success", false);
            response.put("message", "아이템 추가에 실패했습니다");
        }
        
        return response;
    }

    // 아이템 정보 조회
    @GetMapping("/{itemId}")
    public Map<String, Object> getItemInfo(@PathVariable String itemId) {
        Item item = itemService.getItem(itemId);
        
        Map<String, Object> response = new HashMap<>();
        if (item != null) {
            response.put("success", true);
            response.put("item", item);
        } else {
            response.put("success", false);
            response.put("message", "존재하지 않는 아이템입니다");
        }
        
        return response;
    }

    // 인벤토리 정리 (수량 0인 아이템 제거)
    @PostMapping("/cleanup")
    public Map<String, Object> cleanupInventory(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.getOrDefault("userEmail", "test@test.com");
        
        Map<String, Integer> inventory = itemService.getUserInventory(userEmail);
        inventory.entrySet().removeIf(entry -> entry.getValue() <= 0);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "인벤토리가 정리되었습니다");
        response.put("inventory", itemService.getUserInventoryWithDetails(userEmail));
        
        return response;
    }
}