/**
 * RPG 전투 시스템 서비스
 * 턴제 전투 + AI 스타일별 전투 특성 반영
 */

class BattleService {
  constructor() {
    this.activeBattles = new Map(); // 진행 중인 전투 저장
  }

  /**
   * 몬스터 조우 확률 계산
   * @param {number} movementDistance - 이동 거리 (미터)
   * @param {string} playStyle - AI 플레이 스타일
   * @param {number} currentEncounterGauge - 현재 조우 게이지 (0-100)
   * @returns {Object} 조우 결과
   */
  checkMonsterEncounter(movementDistance, playStyle, currentEncounterGauge = 0) {
    // 이동 거리에 따른 게이지 증가
    const baseIncrease = Math.floor(movementDistance / 10); // 10m당 1포인트
    
    // AI 스타일별 조우 확률 조정
    const styleMultiplier = this.getEncounterMultiplier(playStyle);
    const gaugeIncrease = Math.floor(baseIncrease * styleMultiplier);
    
    const newGauge = Math.min(currentEncounterGauge + gaugeIncrease, 100);
    
    // 게이지 100% 도달 시 전투 발생
    if (newGauge >= 100) {
      const monster = this.generateRandomMonster(playStyle);
      return {
        encounterTriggered: true,
        monster,
        newGauge: 0, // 게이지 리셋
        message: `${monster.name}이(가) 나타났다!`
      };
    }
    
    return {
      encounterTriggered: false,
      monster: null,
      newGauge,
      message: `조우 게이지: ${newGauge}/100`
    };
  }

  /**
   * AI 스타일별 조우 확률 배수
   */
  getEncounterMultiplier(playStyle) {
    const multipliers = {
      warrior: 1.3,  // 적극적으로 전투 추구
      archer: 0.8,   // 조심스럽게 이동
      mage: 1.0,     // 보통
      paladin: 1.1   // 약간 적극적
    };
    return multipliers[playStyle] || 1.0;
  }

  /**
   * 랜덤 몬스터 생성 (AI 스타일 반영)
   */
  generateRandomMonster(playStyle, playerLevel = 1) {
    // 보스 조우 확률 (레벨이 높을수록 증가)
    const bossChance = Math.min(0.05 + (playerLevel - 1) * 0.01, 0.15); // 최대 15%
    const nightmareChance = playerLevel >= 50 ? 0.02 : 0; // 레벨 50+ 에서만 2%
    
    const roll = Math.random();
    
    if (roll < nightmareChance) {
      // 최종 보스 (거의 불가능)
      const nightmareBosses = ['ancient_dragon', 'demon_king', 'god_of_war', 'void_lord', 'chaos_emperor', 'infinity_beast'];
      const selectedBoss = nightmareBosses[Math.floor(Math.random() * nightmareBosses.length)];
      return this.createMonster(selectedBoss, Math.max(50, playerLevel));
    } else if (roll < bossChance) {
      // 중급 보스
      const midBosses = ['dragon_young', 'vampire_lord', 'phoenix', 'kraken'];
      const selectedBoss = midBosses[Math.floor(Math.random() * midBosses.length)];
      return this.createMonster(selectedBoss, Math.max(20, playerLevel));
    } else {
      // 일반 몬스터
      const monsterTypes = this.getPreferredMonsters(playStyle);
      const selectedType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
      
      const levelVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      const monsterLevel = Math.max(1, playerLevel + levelVariation);
      
      return this.createMonster(selectedType, monsterLevel);
    }
  }

  /**
   * 특정 보스 몬스터 생성 (던전용)
   */
  generateBossMonster(bossType, playerLevel) {
    const bossLevel = Math.max(playerLevel, this.getMinimumBossLevel(bossType));
    return this.createMonster(bossType, bossLevel);
  }

  /**
   * 보스별 최소 레벨
   */
  getMinimumBossLevel(bossType) {
    const minimumLevels = {
      dragon_young: 15, vampire_lord: 18, phoenix: 20, kraken: 22,
      ancient_dragon: 50, demon_king: 60, god_of_war: 70, 
      void_lord: 80, chaos_emperor: 90, infinity_beast: 100
    };
    return minimumLevels[bossType] || 1;
  }

  /**
   * AI 스타일별 선호 몬스터
   */
  getPreferredMonsters(playStyle) {
    const monsterPreferences = {
      warrior: ['goblin', 'orc', 'troll', 'minotaur', 'berserker', 'giant'],
      archer: ['wolf', 'spider', 'bat', 'hawk', 'assassin', 'ranger'],
      mage: ['skeleton', 'ghost', 'elemental', 'lich', 'demon', 'wizard'],
      paladin: ['goblin', 'skeleton', 'orc', 'wolf', 'knight', 'angel'] // 균형
    };
    return monsterPreferences[playStyle] || monsterPreferences.paladin;
  }

  /**
   * 몬스터 생성
   */
  createMonster(type, level) {
    const monsterData = {
      // 기본 몬스터
      goblin: { name: '고블린', hp: 25, attack: 6, defense: 2, sprite: '👹' },
      orc: { name: '오크', hp: 40, attack: 8, defense: 4, sprite: '👺' },
      troll: { name: '트롤', hp: 60, attack: 10, defense: 6, sprite: '👹' },
      wolf: { name: '늑대', hp: 30, attack: 9, defense: 1, sprite: '🐺' },
      spider: { name: '거미', hp: 20, attack: 7, defense: 3, sprite: '🕷️' },
      bat: { name: '박쥐', hp: 15, attack: 5, defense: 1, sprite: '🦇' },
      skeleton: { name: '해골병사', hp: 35, attack: 7, defense: 5, sprite: '💀' },
      ghost: { name: '유령', hp: 25, attack: 8, defense: 2, sprite: '👻' },
      elemental: { name: '정령', hp: 45, attack: 9, defense: 3, sprite: '🔥' },
      
      // 새로운 일반 몬스터
      minotaur: { name: '미노타우로스', hp: 80, attack: 12, defense: 8, sprite: '🐂' },
      berserker: { name: '광전사', hp: 70, attack: 15, defense: 3, sprite: '⚔️' },
      giant: { name: '거인', hp: 120, attack: 14, defense: 10, sprite: '🗿' },
      hawk: { name: '매', hp: 25, attack: 12, defense: 2, sprite: '🦅' },
      assassin: { name: '암살자', hp: 40, attack: 18, defense: 4, sprite: '🥷' },
      ranger: { name: '레인저', hp: 50, attack: 13, defense: 6, sprite: '🏹' },
      lich: { name: '리치', hp: 90, attack: 16, defense: 7, sprite: '🧙‍♂️' },
      demon: { name: '악마', hp: 100, attack: 17, defense: 8, sprite: '😈' },
      wizard: { name: '마법사', hp: 60, attack: 20, defense: 5, sprite: '🧙‍♀️' },
      knight: { name: '기사', hp: 85, attack: 11, defense: 12, sprite: '🛡️' },
      angel: { name: '천사', hp: 75, attack: 14, defense: 9, sprite: '😇' },
      
      // 중급 보스 (매우 강함)
      dragon_young: { name: '어린 드래곤', hp: 200, attack: 25, defense: 15, sprite: '🐲' },
      vampire_lord: { name: '뱀파이어 로드', hp: 180, attack: 22, defense: 12, sprite: '🧛‍♂️' },
      phoenix: { name: '불사조', hp: 160, attack: 28, defense: 10, sprite: '🔥' },
      kraken: { name: '크라켄', hp: 220, attack: 24, defense: 18, sprite: '🐙' },
      
      // 최종 보스 (거의 불가능)
      ancient_dragon: { name: '고대 드래곤', hp: 500, attack: 50, defense: 30, sprite: '🐉' },
      demon_king: { name: '마왕', hp: 666, attack: 66, defense: 33, sprite: '👹' },
      god_of_war: { name: '전쟁의 신', hp: 1500, attack: 150, defense: 80, sprite: '⚡' },
      void_lord: { name: '공허의 군주', hp: 2000, attack: 180, defense: 90, sprite: '🌌' },
      chaos_emperor: { name: '혼돈의 황제', hp: 2500, attack: 200, defense: 100, sprite: '👑' },
      infinity_beast: { name: '무한의 야수', hp: 3000, attack: 250, defense: 120, sprite: '🌟' }
    };

    const base = monsterData[type] || monsterData.goblin;
    
    // 보스 몬스터는 레벨 스케일링 제한
    const isBoss = this.isBossMonster(type);
    const levelMultiplier = isBoss ? 1 + (level - 1) * 0.1 : 1 + (level - 1) * 0.3;

    return {
      id: `${type}_${Date.now()}`,
      type,
      name: `Lv.${level} ${base.name}`,
      level,
      maxHp: Math.floor(base.hp * levelMultiplier),
      hp: Math.floor(base.hp * levelMultiplier),
      attack: Math.floor(base.attack * levelMultiplier),
      defense: Math.floor(base.defense * levelMultiplier),
      sprite: base.sprite,
      expReward: Math.floor((isBoss ? 100 : 15) * levelMultiplier + level * (isBoss ? 50 : 5)),
      isBoss,
      difficulty: this.getMonsterDifficulty(type)
    };
  }

  /**
   * 보스 몬스터 판별
   */
  isBossMonster(type) {
    const bossTypes = [
      'dragon_young', 'vampire_lord', 'phoenix', 'kraken',
      'ancient_dragon', 'demon_king', 'god_of_war', 'void_lord', 
      'chaos_emperor', 'infinity_beast'
    ];
    return bossTypes.includes(type);
  }

  /**
   * 몬스터 난이도 반환
   */
  getMonsterDifficulty(type) {
    const difficulties = {
      // 쉬움
      goblin: 'easy', bat: 'easy', spider: 'easy',
      
      // 보통
      wolf: 'normal', orc: 'normal', skeleton: 'normal', ghost: 'normal',
      hawk: 'normal', ranger: 'normal', knight: 'normal',
      
      // 어려움
      troll: 'hard', elemental: 'hard', minotaur: 'hard', berserker: 'hard',
      giant: 'hard', assassin: 'hard', lich: 'hard', demon: 'hard',
      wizard: 'hard', angel: 'hard',
      
      // 매우 어려움 (중급 보스)
      dragon_young: 'very_hard', vampire_lord: 'very_hard', 
      phoenix: 'very_hard', kraken: 'very_hard',
      
      // 거의 불가능 (최종 보스)
      ancient_dragon: 'nightmare', demon_king: 'nightmare',
      god_of_war: 'nightmare', void_lord: 'nightmare',
      chaos_emperor: 'nightmare', infinity_beast: 'nightmare'
    };
    return difficulties[type] || 'normal';
  }

  /**
   * 전투 시작
   */
  startBattle(playerId, player, monster) {
    const battleId = `battle_${playerId}_${Date.now()}`;
    
    const battle = {
      id: battleId,
      playerId,
      player: { ...player, hp: player.maxHp || player.hp },
      monster: { ...monster },
      turn: 'player',
      turnCount: 0,
      log: [`${monster.name}과(와)의 전투가 시작되었습니다!`],
      status: 'active'
    };

    this.activeBattles.set(battleId, battle);
    return battle;
  }

  /**
   * 전투 액션 처리
   */
  processBattleAction(battleId, action, playStyle) {
    const battle = this.activeBattles.get(battleId);
    if (!battle || battle.status !== 'active') {
      throw new Error('유효하지 않은 전투입니다.');
    }

    let result = {};

    if (battle.turn === 'player') {
      result = this.processPlayerAction(battle, action, playStyle);
      if (battle.status === 'active') {
        battle.turn = 'monster';
      }
    } else {
      result = this.processMonsterAction(battle);
      if (battle.status === 'active') {
        battle.turn = 'player';
      }
    }

    battle.turnCount++;
    this.activeBattles.set(battleId, battle);

    return {
      battle,
      actionResult: result,
      isFinished: battle.status !== 'active'
    };
  }

  /**
   * 플레이어 액션 처리
   */
  processPlayerAction(battle, action, playStyle) {
    const { player, monster } = battle;
    let damage = 0;
    let message = '';

    switch (action.type) {
      case 'attack':
        damage = this.calculateDamage(player.attack, monster.defense, playStyle);
        monster.hp = Math.max(0, monster.hp - damage);
        message = `${damage} 데미지를 입혔습니다!`;
        break;

      case 'skill':
        const skillResult = this.useSkill(action.skillType, player, monster, playStyle);
        damage = skillResult.damage;
        message = skillResult.message;
        break;

      case 'defend':
        player.defendBonus = Math.floor(player.defense * 0.5);
        message = '방어 태세를 취했습니다. (방어력 임시 증가)';
        break;

      default:
        message = '알 수 없는 행동입니다.';
    }

    battle.log.push(`플레이어: ${message}`);

    // 몬스터 처치 확인
    if (monster.hp <= 0) {
      battle.status = 'victory';
      battle.log.push(`${monster.name}을(를) 처치했습니다!`);
      battle.log.push(`${monster.expReward} 경험치를 획득했습니다!`);
    }

    return { damage, message, monsterDefeated: monster.hp <= 0 };
  }

  /**
   * 몬스터 액션 처리
   */
  processMonsterAction(battle) {
    const { player, monster } = battle;
    
    // 보스 몬스터는 더 복잡한 AI
    if (monster.isBoss) {
      return this.processBossAction(battle);
    }
    
    // 일반 몬스터: 70% 공격, 30% 특수 행동
    const actionRoll = Math.random();
    let damage = 0;
    let message = '';

    if (actionRoll < 0.7) {
      // 일반 공격
      const playerDefense = player.defense + (player.defendBonus || 0);
      damage = this.calculateDamage(monster.attack, playerDefense);
      player.hp = Math.max(0, player.hp - damage);
      message = `${monster.name}의 공격! ${damage} 데미지를 받았습니다!`;
    } else {
      // 특수 행동 (회복, 강화 등)
      const healAmount = Math.floor(monster.maxHp * 0.1);
      monster.hp = Math.min(monster.maxHp, monster.hp + healAmount);
      message = `${monster.name}이(가) 체력을 ${healAmount} 회복했습니다!`;
    }

    // 방어 보너스 초기화
    player.defendBonus = 0;

    battle.log.push(`몬스터: ${message}`);

    // 플레이어 패배 확인
    if (player.hp <= 0) {
      battle.status = 'defeat';
      battle.log.push('패배했습니다...');
    }

    return { damage, message, playerDefeated: player.hp <= 0 };
  }

  /**
   * 보스 몬스터 특수 액션
   */
  processBossAction(battle) {
    const { player, monster } = battle;
    const actionRoll = Math.random();
    let damage = 0;
    let message = '';

    // 보스별 특수 패턴
    const bossPatterns = this.getBossPatterns(monster.type);
    const selectedPattern = bossPatterns[Math.floor(Math.random() * bossPatterns.length)];

    switch (selectedPattern.type) {
      case 'devastating_attack':
        const playerDefense = player.defense + (player.defendBonus || 0);
        damage = Math.floor(this.calculateDamage(monster.attack * 1.5, playerDefense));
        player.hp = Math.max(0, player.hp - damage);
        message = `${monster.name}의 ${selectedPattern.name}! ${damage} 데미지!`;
        break;

      case 'area_attack':
        damage = Math.floor(monster.attack * 0.8);
        player.hp = Math.max(0, player.hp - damage);
        message = `${monster.name}의 ${selectedPattern.name}! 방어 무시 ${damage} 데미지!`;
        break;

      case 'life_drain':
        damage = Math.floor(monster.attack * 0.6);
        const drainAmount = Math.floor(damage * 0.5);
        player.hp = Math.max(0, player.hp - damage);
        monster.hp = Math.min(monster.maxHp, monster.hp + drainAmount);
        message = `${monster.name}의 ${selectedPattern.name}! ${damage} 데미지, ${drainAmount} 흡수!`;
        break;

      case 'rage_mode':
        monster.rageMode = true;
        monster.attack = Math.floor(monster.attack * 1.3);
        message = `${monster.name}이(가) 분노했습니다! 공격력 증가!`;
        break;

      case 'ultimate':
        damage = Math.floor(monster.attack * 2);
        player.hp = Math.max(0, player.hp - damage);
        message = `${monster.name}의 궁극기 ${selectedPattern.name}! ${damage} 데미지!`;
        break;

      default:
        // 일반 공격
        const normalDefense = player.defense + (player.defendBonus || 0);
        damage = this.calculateDamage(monster.attack, normalDefense);
        player.hp = Math.max(0, player.hp - damage);
        message = `${monster.name}의 공격! ${damage} 데미지!`;
    }

    // 방어 보너스 초기화
    player.defendBonus = 0;

    battle.log.push(`보스: ${message}`);

    // 플레이어 패배 확인
    if (player.hp <= 0) {
      battle.status = 'defeat';
      battle.log.push('패배했습니다...');
    }

    return { damage, message, playerDefeated: player.hp <= 0 };
  }

  /**
   * 보스별 특수 패턴
   */
  getBossPatterns(bossType) {
    const patterns = {
      dragon_young: [
        { type: 'devastating_attack', name: '화염 브레스' },
        { type: 'area_attack', name: '날개 공격' },
        { type: 'rage_mode', name: '용의 분노' }
      ],
      vampire_lord: [
        { type: 'life_drain', name: '흡혈' },
        { type: 'devastating_attack', name: '어둠의 손톱' },
        { type: 'area_attack', name: '박쥐 떼' }
      ],
      phoenix: [
        { type: 'area_attack', name: '불사조의 날개' },
        { type: 'ultimate', name: '재생의 불꽃' },
        { type: 'devastating_attack', name: '태양 광선' }
      ],
      kraken: [
        { type: 'area_attack', name: '촉수 휩쓸기' },
        { type: 'devastating_attack', name: '바다의 분노' },
        { type: 'life_drain', name: '생명력 흡수' }
      ],
      ancient_dragon: [
        { type: 'ultimate', name: '고대의 화염' },
        { type: 'devastating_attack', name: '용의 포효' },
        { type: 'area_attack', name: '지진' },
        { type: 'rage_mode', name: '고대의 분노' }
      ],
      demon_king: [
        { type: 'ultimate', name: '지옥의 심판' },
        { type: 'life_drain', name: '영혼 흡수' },
        { type: 'devastating_attack', name: '악마의 손톱' },
        { type: 'area_attack', name: '지옥불' }
      ],
      god_of_war: [
        { type: 'ultimate', name: '신의 일격' },
        { type: 'devastating_attack', name: '전쟁의 함성' },
        { type: 'rage_mode', name: '전투 광기' },
        { type: 'area_attack', name: '천둥 번개' }
      ],
      void_lord: [
        { type: 'ultimate', name: '공허의 파멸' },
        { type: 'life_drain', name: '존재 흡수' },
        { type: 'devastating_attack', name: '차원 절단' },
        { type: 'area_attack', name: '공간 붕괴' }
      ],
      chaos_emperor: [
        { type: 'ultimate', name: '혼돈의 지배' },
        { type: 'devastating_attack', name: '현실 왜곡' },
        { type: 'area_attack', name: '무질서의 폭풍' },
        { type: 'rage_mode', name: '절대 권력' }
      ],
      infinity_beast: [
        { type: 'ultimate', name: '무한의 파괴' },
        { type: 'devastating_attack', name: '시공간 붕괴' },
        { type: 'life_drain', name: '무한 흡수' },
        { type: 'area_attack', name: '차원 폭발' },
        { type: 'rage_mode', name: '무한의 분노' }
      ]
    };

    return patterns[bossType] || [
      { type: 'devastating_attack', name: '강력한 공격' },
      { type: 'area_attack', name: '광역 공격' }
    ];
  }

  /**
   * 데미지 계산 (AI 스타일 반영)
   */
  calculateDamage(attack, defense, playStyle = 'balanced') {
    const baseDamage = Math.max(1, attack - defense);
    const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 ~ 1.2
    
    // AI 스타일별 데미지 보정
    const styleBonus = this.getDamageBonus(playStyle);
    
    return Math.floor(baseDamage * randomFactor * styleBonus);
  }

  /**
   * AI 스타일별 데미지 보너스
   */
  getDamageBonus(playStyle) {
    const bonuses = {
      warrior: 1.2,  // 높은 물리 데미지
      archer: 1.1,   // 정확한 데미지
      mage: 1.15,    // 마법 데미지
      paladin: 1.0   // 균형
    };
    return bonuses[playStyle] || 1.0;
  }

  /**
   * 스킬 사용
   */
  useSkill(skillType, player, monster, playStyle) {
    const skills = {
      warrior: {
        'power_strike': { damage: player.attack * 1.5, message: '강력한 일격!' },
        'berserker': { damage: player.attack * 1.3, message: '광전사의 분노!' }
      },
      archer: {
        'precise_shot': { damage: player.attack * 1.4, message: '정확한 사격!' },
        'multi_shot': { damage: player.attack * 1.2, message: '연속 사격!' }
      },
      mage: {
        'fireball': { damage: player.attack * 1.6, message: '화염구 마법!' },
        'ice_shard': { damage: player.attack * 1.3, message: '얼음 창 마법!' }
      },
      paladin: {
        'holy_strike': { damage: player.attack * 1.3, message: '신성한 일격!' },
        'heal': { damage: 0, heal: player.maxHp * 0.3, message: '치유 마법!' }
      }
    };

    const styleSkills = skills[playStyle] || skills.paladin;
    const skill = styleSkills[skillType] || styleSkills[Object.keys(styleSkills)[0]];

    let damage = Math.floor(skill.damage || 0);
    if (skill.heal) {
      player.hp = Math.min(player.maxHp, player.hp + Math.floor(skill.heal));
    }

    monster.hp = Math.max(0, monster.hp - damage);

    return {
      damage,
      message: skill.message
    };
  }

  /**
   * 전투 종료 및 정리
   */
  endBattle(battleId) {
    const battle = this.activeBattles.get(battleId);
    if (battle) {
      this.activeBattles.delete(battleId);
      return {
        result: battle.status,
        expGained: battle.status === 'victory' ? battle.monster.expReward : 0,
        coinsGained: battle.status === 'victory' ? Math.floor(battle.monster.expReward / 5) + 10 : 0,
        log: battle.log
      };
    }
    return null;
  }

  /**
   * 활성 전투 조회
   */
  getBattle(battleId) {
    return this.activeBattles.get(battleId);
  }
}

module.exports = new BattleService();