package com.rpgworkout.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestController {
    
    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Java 서버가 정상적으로 작동 중입니다!");
        response.put("status", "success");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        String email = request.get("email");
        String password = request.get("password");
        
        // 간단한 테스트 로그인
        if (("test@test.com".equals(email) && "123456".equals(password)) ||
            ("demo@demo.com".equals(email) && "demo123".equals(password))) {
            response.put("message", "로그인 성공");
            response.put("token", "test-jwt-token-12345");
            
            Map<String, Object> user = new HashMap<>();
            user.put("id", "test-user-id");
            user.put("email", email);
            user.put("isAdmin", false);
            response.put("user", user);
        } else {
            response.put("error", "로그인 실패");
        }
        
        return response;
    }
    
    @PostMapping("/auth/register")
    public Map<String, Object> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "회원가입 성공");
        response.put("token", "test-jwt-token-12345");
        
        Map<String, Object> user = new HashMap<>();
        user.put("id", "new-user-id");
        user.put("email", request.get("email"));
        user.put("isAdmin", false);
        response.put("user", user);
        
        return response;
    }
    
    @GetMapping("/character")
    public Map<String, Object> getCharacter() {
        Map<String, Object> character = new HashMap<>();
        character.put("level", 1);
        character.put("exp", 0);
        character.put("requiredExp", 100);
        character.put("currentRegion", "starting_area");
        character.put("lastActiveDate", System.currentTimeMillis());
        character.put("totalWalkDistance", globalWalkDistance); // 실제 걸은 거리 반영
        character.put("totalWalkTime", 0.0);
        // 코인 시스템 제거 - 걷기 경험치로 대체
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("hp", 100);
        stats.put("attack", 10);
        stats.put("defense", 5);
        stats.put("stamina", 50);
        character.put("stats", stats);
        
        Map<String, Object> equippedCostumes = new HashMap<>();
        character.put("equippedCostumes", equippedCostumes);
        
        Map<String, Object> response = new HashMap<>();
        response.put("character", character);
        return response;
    }
    
    @GetMapping("/battle/dungeons")
    public Map<String, Object> getDungeons() {
        Map<String, Object> response = new HashMap<>();
        
        // 현재 사용자의 걸은 거리 (실제로는 DB에서 가져와야 함)
        double currentWalkDistance = 0.0; // 기본값
        
        // 21개 던전 생성
        Map<String, Object>[] dungeons = new Map[21];
        
        // 기본 던전들 (0-2km)
        dungeons[0] = createDungeon("goblin_cave_1", "고블린 동굴", 1, 0, 50, 8, 2, 25, "easy", "goblin", false);
        dungeons[1] = createDungeon("slime_forest_1", "슬라임 숲", 1, 200, 30, 5, 1, 15, "easy", "spider", false);
        dungeons[2] = createDungeon("orc_fortress_1", "오크 요새", 3, 500, 120, 15, 5, 75, "normal", "orc", false);
        dungeons[3] = createDungeon("skeleton_tomb_1", "해골 무덤", 5, 800, 200, 25, 8, 150, "normal", "skeleton", false);
        dungeons[4] = createDungeon("wolf_den_1", "늑대 굴", 4, 1000, 150, 20, 3, 100, "normal", "wolf", false);
        dungeons[5] = createDungeon("troll_bridge_1", "트롤 다리", 8, 1500, 300, 35, 12, 200, "hard", "troll", false);
        dungeons[6] = createDungeon("spider_nest_1", "거미 둥지", 6, 2000, 180, 22, 6, 120, "normal", "spider", false);
        
        // 중급 던전들 (2-5km)
        dungeons[7] = createDungeon("bat_cave_1", "박쥐 동굴", 7, 2500, 220, 28, 8, 160, "hard", "bat", false);
        dungeons[8] = createDungeon("ghost_mansion_1", "유령 저택", 10, 3000, 350, 40, 15, 250, "hard", "ghost", false);
        dungeons[9] = createDungeon("elemental_tower_1", "정령의 탑", 12, 3500, 400, 45, 18, 300, "hard", "elemental", false);
        dungeons[10] = createDungeon("minotaur_labyrinth_1", "미노타우로스 미궁", 15, 4000, 500, 55, 22, 400, "very_hard", "minotaur", false);
        dungeons[11] = createDungeon("berserker_camp_1", "광전사 야영지", 13, 4500, 450, 50, 20, 350, "very_hard", "berserker", false);
        dungeons[12] = createDungeon("giant_mountain_1", "거인의 산", 18, 5000, 600, 65, 25, 500, "very_hard", "giant", false);
        
        // 고급 던전들 (5-10km)
        dungeons[13] = createDungeon("hawk_nest_1", "거대 매의 둥지", 16, 6000, 550, 60, 23, 450, "very_hard", "hawk", false);
        dungeons[14] = createDungeon("assassin_hideout_1", "암살자 은신처", 20, 7000, 700, 75, 30, 600, "very_hard", "assassin", false);
        dungeons[15] = createDungeon("dragon_lair_1", "어린 드래곤 둥지", 25, 8000, 800, 80, 35, 800, "nightmare", "dragon_young", false);
        dungeons[16] = createDungeon("vampire_castle_1", "뱀파이어 성", 22, 9000, 750, 70, 32, 700, "nightmare", "vampire_lord", false);
        dungeons[17] = createDungeon("phoenix_sanctuary_1", "불사조 성역", 28, 10000, 900, 90, 40, 900, "nightmare", "phoenix", false);
        
        // 최고급 던전들 (10km+)
        dungeons[18] = createDungeon("kraken_depths_1", "크라켄의 심연", 30, 15000, 1000, 100, 45, 1000, "nightmare", "kraken", false);
        
        // 전설 던전들 (절대 못 깨는 - 매우 높은 거리 요구)
        dungeons[19] = createDungeon("ancient_dragon_lair", "고대 드래곤 둥지", 50, 50000, 5000, 500, 200, 5000, "nightmare", "ancient_dragon", true);
        dungeons[20] = createDungeon("demon_king_castle", "마왕성", 100, 100000, 10000, 1000, 500, 10000, "nightmare", "demon_king", true);
        
        // 실제 걸은 거리 사용
        currentWalkDistance = globalWalkDistance;
        
        // 걸은 거리에 따라 던전 잠금/해제 설정
        for (Map<String, Object> dungeon : dungeons) {
            double requiredDistance = ((Number) dungeon.get("requiredDistance")).doubleValue();
            boolean canEnter = currentWalkDistance >= requiredDistance;
            dungeon.put("canEnter", canEnter);
            
            // 디버깅용 로그
            System.out.println("던전: " + dungeon.get("name") + 
                             ", 필요거리: " + requiredDistance + 
                             ", 현재거리: " + currentWalkDistance + 
                             ", 입장가능: " + canEnter);
        }
        
        response.put("dungeons", dungeons);
        response.put("totalWalkDistance", currentWalkDistance);
        response.put("playerLevel", 1);
        
        return response;
    }
    
    private Map<String, Object> createDungeon(String dungeonId, String name, int requiredLevel, 
                                            double requiredDistance, int hp, int attack, int defense, 
                                            int expReward, String difficulty, String bossType, boolean isLegendary) {
        Map<String, Object> dungeon = new HashMap<>();
        dungeon.put("dungeonId", dungeonId);
        dungeon.put("name", name);
        dungeon.put("requiredLevel", requiredLevel);
        dungeon.put("requiredDistance", requiredDistance);
        
        Map<String, Object> monsterStats = new HashMap<>();
        monsterStats.put("hp", hp);
        monsterStats.put("attack", attack);
        monsterStats.put("defense", defense);
        dungeon.put("monsterStats", monsterStats);
        
        dungeon.put("expReward", expReward);
        dungeon.put("difficulty", difficulty);
        dungeon.put("bossType", bossType);
        dungeon.put("isLegendary", isLegendary);
        
        return dungeon;
    }
    
    @PostMapping("/workout")
    public Map<String, Object> submitWorkout(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "운동이 기록되었습니다!");
        
        Map<String, Object> workout = new HashMap<>();
        workout.put("type", request.get("type"));
        workout.put("amount", request.get("amount"));
        
        Map<String, Object> statGained = new HashMap<>();
        statGained.put("hp", 5);
        statGained.put("attack", 2);
        statGained.put("defense", 1);
        statGained.put("stamina", 3);
        workout.put("statGained", statGained);
        
        response.put("workout", workout);
        response.put("character", getCharacter().get("character"));
        response.put("expGained", 10);
        response.put("coinsGained", 5);
        
        return response;
    }
    
    @PostMapping("/location")
    public Map<String, Object> updateLocation(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "위치가 업데이트되었습니다");
        response.put("region", "seoul_area");
        
        Map<String, Object> location = new HashMap<>();
        location.put("latitude", request.get("latitude"));
        location.put("longitude", request.get("longitude"));
        location.put("region", "seoul_area");
        response.put("location", location);
        
        return response;
    }
    
    // 전역 변수로 걸은 거리 저장 (실제로는 DB에 저장해야 함)
    private static double globalWalkDistance = 0.0;
    
    @PostMapping("/location/update")
    public Map<String, Object> updateWalkDistance(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        double newDistance = ((Number) request.get("distance")).doubleValue();
        globalWalkDistance += newDistance; // 누적
        
        response.put("message", "걷기 거리가 업데이트되었습니다");
        response.put("totalWalkDistance", globalWalkDistance);
        response.put("addedDistance", newDistance);
        
        // 업데이트된 캐릭터 정보
        Map<String, Object> character = (Map<String, Object>) getCharacter().get("character");
        character.put("totalWalkDistance", globalWalkDistance);
        response.put("character", character);
        
        return response;
    }
    
    @PostMapping("/location/reset")
    public Map<String, Object> resetWalkDistance() {
        Map<String, Object> response = new HashMap<>();
        
        globalWalkDistance = 0.0; // 전역 거리 초기화
        
        response.put("message", "걷기 거리가 초기화되었습니다");
        response.put("totalWalkDistance", globalWalkDistance);
        
        // 초기화된 캐릭터 정보
        Map<String, Object> character = (Map<String, Object>) getCharacter().get("character");
        character.put("totalWalkDistance", globalWalkDistance);
        response.put("character", character);
        
        return response;
    }
    
    @GetMapping("/costumes")
    public Map<String, Object> getCostumes() {
        Map<String, Object> response = new HashMap<>();
        
        // 12개 코스튬 생성
        Map<String, Object>[] costumes = new Map[12];
        
        // 머리 장비 - 외관 전용
        costumes[0] = createCostume("warrior_helmet", "전사의 투구", "용맹한 전사의 상징적인 투구", "head", "common", 100, "🔥 용맹한 전사의 기운", "⛑️", 1);
        costumes[1] = createCostume("mage_hat", "마법사의 모자", "신비로운 마법사의 모자", "head", "rare", 200, "✨ 신비로운 마법의 오라", "🎩", 3);
        costumes[2] = createCostume("royal_crown", "왕관", "왕족의 권위를 나타내는 황금 왕관", "head", "legendary", 1000, "👑 왕족의 위엄과 품격", "👑", 10);
        
        // 몸 장비 - 외관 전용
        costumes[3] = createCostume("leather_armor", "가죽 갑옷", "실용적이고 멋진 가죽 갑옷", "body", "common", 150, "🛡️ 견고한 방어 자세", "🦺", 1);
        costumes[4] = createCostume("chain_mail", "사슬 갑옷", "빛나는 사슬로 만든 중갑", "body", "rare", 300, "⚔️ 중무장 기사의 위용", "🛡️", 5);
        costumes[5] = createCostume("dragon_scale", "드래곤 비늘 갑옷", "전설의 드래곤 비늘로 제작된 갑옷", "body", "legendary", 1500, "🐲 드래곤의 위압적인 기운", "🐲", 15);
        
        // 무기 - 외관 전용
        costumes[6] = createCostume("iron_sword", "철검", "잘 벼려진 기본 철제 검", "weapon", "common", 120, "⚔️ 날카로운 검기", "⚔️", 1);
        costumes[7] = createCostume("magic_staff", "마법 지팡이", "마법의 힘이 깃든 신비한 지팡이", "weapon", "rare", 250, "🔮 마법진이 빛나는 효과", "🪄", 4);
        costumes[8] = createCostume("excalibur", "엑스칼리버", "전설 속의 성스러운 검", "weapon", "legendary", 2000, "⚡ 성스러운 빛의 검기", "🗡️", 20);
        
        // 액세서리 - 외관 전용
        costumes[9] = createCostume("power_ring", "힘의 반지", "고대의 힘이 깃든 반지", "accessory", "common", 80, "💫 손가락에서 빛나는 오라", "💍", 1);
        costumes[10] = createCostume("health_amulet", "체력의 부적", "생명의 기운이 넘치는 부적", "accessory", "rare", 180, "💚 생명력이 넘치는 빛", "🔮", 3);
        costumes[11] = createCostume("legendary_necklace", "전설의 목걸이", "모든 것을 빛나게 하는 목걸이", "accessory", "legendary", 1200, "🌟 모든 능력이 빛나는 효과", "📿", 12);
        
        // 모든 코스튬을 소유하지 않은 상태로 설정
        for (Map<String, Object> costume : costumes) {
            costume.put("isOwned", false);
            costume.put("isEquipped", false);
        }
        
        response.put("costumes", costumes);
        // 코인 시스템 제거 - 걷기 경험치 기반으로 변경
        response.put("walkingExp", (int)(globalWalkDistance / 10)); // 10m = 1 걷기 경험치
        response.put("equippedCostumes", new HashMap<>());
        
        return response;
    }
    
    private Map<String, Object> createCostume(String costumeId, String name, String description, 
                                            String category, String rarity, int price, 
                                            String visualEffect, String icon, int unlockLevel) {
        Map<String, Object> costume = new HashMap<>();
        costume.put("costumeId", costumeId);
        costume.put("name", name);
        costume.put("description", description);
        costume.put("category", category);
        costume.put("rarity", rarity);
        costume.put("price", price);
        costume.put("visualEffect", visualEffect);
        costume.put("icon", icon);
        costume.put("unlockLevel", unlockLevel);
        
        return costume;
    }
    
    @GetMapping("/ranking")
    public Map<String, Object> getRanking() {
        Map<String, Object> response = new HashMap<>();
        
        // 샘플 랭킹 데이터
        Map<String, Object>[] levelRanking = new Map[5];
        levelRanking[0] = Map.of("email", "admin@admin.com", "level", 100, "exp", 0);
        levelRanking[1] = Map.of("email", "player1@test.com", "level", 25, "exp", 1500);
        levelRanking[2] = Map.of("email", "player2@test.com", "level", 20, "exp", 800);
        levelRanking[3] = Map.of("email", "player3@test.com", "level", 15, "exp", 200);
        levelRanking[4] = Map.of("email", "test@test.com", "level", 1, "exp", 0);
        
        Map<String, Object>[] walkRanking = new Map[5];
        walkRanking[0] = Map.of("email", "admin@admin.com", "totalWalkDistance", 100000.0);
        walkRanking[1] = Map.of("email", "player1@test.com", "totalWalkDistance", 15000.0);
        walkRanking[2] = Map.of("email", "player2@test.com", "totalWalkDistance", 12000.0);
        walkRanking[3] = Map.of("email", "player3@test.com", "totalWalkDistance", 8000.0);
        walkRanking[4] = Map.of("email", "test@test.com", "totalWalkDistance", 0.0);
        
        Map<String, Object>[] coinRanking = new Map[5];
        coinRanking[0] = Map.of("email", "admin@admin.com", "walkingExp", 10000);
        coinRanking[1] = Map.of("email", "player1@test.com", "walkingExp", 1500);
        coinRanking[2] = Map.of("email", "player2@test.com", "walkingExp", 1200);
        coinRanking[3] = Map.of("email", "player3@test.com", "walkingExp", 800);
        coinRanking[4] = Map.of("email", "test@test.com", "walkingExp", 0);
        
        response.put("levelRanking", levelRanking);
        response.put("walkRanking", walkRanking);
        response.put("walkingExpRanking", coinRanking); // 걷기 경험치 랭킹으로 변경
        
        return response;
    }
}