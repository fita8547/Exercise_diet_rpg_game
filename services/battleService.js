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
    const monsterTypes = this.getPreferredMonsters(playStyle);
    const selectedType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    const levelVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    const monsterLevel = Math.max(1, playerLevel + levelVariation);
    
    return this.createMonster(selectedType, monsterLevel);
  }

  /**
   * AI 스타일별 선호 몬스터
   */
  getPreferredMonsters(playStyle) {
    const monsterPreferences = {
      warrior: ['goblin', 'orc', 'troll'],
      archer: ['wolf', 'spider', 'bat'],
      mage: ['skeleton', 'ghost', 'elemental'],
      paladin: ['goblin', 'skeleton', 'orc', 'wolf'] // 균형
    };
    return monsterPreferences[playStyle] || monsterPreferences.paladin;
  }

  /**
   * 몬스터 생성
   */
  createMonster(type, level) {
    const monsterData = {
      goblin: { name: '고블린', hp: 25, attack: 6, defense: 2, sprite: '👹' },
      orc: { name: '오크', hp: 40, attack: 8, defense: 4, sprite: '👺' },
      troll: { name: '트롤', hp: 60, attack: 10, defense: 6, sprite: '👹' },
      wolf: { name: '늑대', hp: 30, attack: 9, defense: 1, sprite: '🐺' },
      spider: { name: '거미', hp: 20, attack: 7, defense: 3, sprite: '🕷️' },
      bat: { name: '박쥐', hp: 15, attack: 5, defense: 1, sprite: '🦇' },
      skeleton: { name: '해골병사', hp: 35, attack: 7, defense: 5, sprite: '💀' },
      ghost: { name: '유령', hp: 25, attack: 8, defense: 2, sprite: '👻' },
      elemental: { name: '정령', hp: 45, attack: 9, defense: 3, sprite: '🔥' }
    };

    const base = monsterData[type] || monsterData.goblin;
    const levelMultiplier = 1 + (level - 1) * 0.3;

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
      expReward: Math.floor(15 * levelMultiplier + level * 5)
    };
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
    
    // 간단한 AI: 70% 공격, 30% 특수 행동
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