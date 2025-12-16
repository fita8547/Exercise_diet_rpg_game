/**
 * AI 몸 상태 분석 서비스
 * 체중 우열 판단 없이 게임 플레이 스타일만 분류
 */

class AIService {
  /**
   * 몸 상태 분석 및 플레이 스타일 결정
   * @param {Object} bodyData - {height, weight, activityLevel, goal}
   * @returns {Object} 분석 결과
   */
  analyzeBodyAndDetermineStyle(bodyData) {
    const { height, weight, activityLevel, goal } = bodyData;
    
    // BMI 계산 (참고용, 우열 판단 없음)
    const bmi = weight / ((height / 100) ** 2);
    
    // 활동량 점수
    const activityScore = this.getActivityScore(activityLevel);
    
    // 목표 성향 점수
    const goalScore = this.getGoalScore(goal);
    
    // 플레이 스타일 결정
    const playStyle = this.determinePlayStyle(activityScore, goalScore, bmi);
    
    // 게임 특성 생성
    const gameCharacteristics = this.generateGameCharacteristics(playStyle);
    
    return {
      playStyle: playStyle.type,
      styleName: playStyle.name,
      description: playStyle.description,
      gameCharacteristics,
      recommendations: this.generateRecommendations(playStyle.type),
      statBonuses: this.calculateStatBonuses(playStyle.type, activityScore),
      combatStyle: this.getCombatStyle(playStyle.type)
    };
  }

  /**
   * 활동량을 점수로 변환
   */
  getActivityScore(activityLevel) {
    const scores = {
      'low': 1,      // 차분한 플레이 선호
      'moderate': 2, // 균형잡힌 플레이
      'high': 3      // 적극적인 플레이 선호
    };
    return scores[activityLevel] || 2;
  }

  /**
   * 목표를 성향 점수로 변환
   */
  getGoalScore(goal) {
    const scores = {
      'strength': 3,    // 공격적 성향
      'endurance': 2,   // 지속적 성향  
      'habit': 1,       // 안정적 성향
      'maintenance': 2  // 균형적 성향
    };
    return scores[goal] || 2;
  }

  /**
   * 플레이 스타일 결정 로직
   */
  determinePlayStyle(activityScore, goalScore, bmi) {
    // 복합 점수 계산
    const aggressionScore = (activityScore + goalScore) / 2;
    const stabilityPreference = bmi > 25 ? 1 : (bmi < 20 ? 3 : 2);
    
    // 4가지 플레이 스타일 분류
    if (aggressionScore >= 2.5 && stabilityPreference >= 2) {
      return {
        type: 'warrior',
        name: '전사형 모험가',
        description: '정면 돌파를 선호하는 근접 전투 전문가'
      };
    } else if (aggressionScore <= 1.5 && stabilityPreference >= 2) {
      return {
        type: 'archer',
        name: '궁수형 모험가', 
        description: '신중하고 전략적인 원거리 전투 전문가'
      };
    } else if (aggressionScore >= 2 && stabilityPreference <= 1.5) {
      return {
        type: 'mage',
        name: '마법사형 모험가',
        description: '지식과 기술을 활용하는 마법 전투 전문가'
      };
    } else {
      return {
        type: 'paladin',
        name: '성기사형 모험가',
        description: '균형잡힌 능력의 만능 전투 전문가'
      };
    }
  }

  /**
   * 게임 특성 생성
   */
  generateGameCharacteristics(playStyle) {
    const characteristics = {
      warrior: {
        preferredWeapon: '검과 방패',
        combatRange: '근접',
        specialAbility: '강력한 일격',
        weakness: '마법 저항력 부족',
        monsterPreference: '고블린, 오크류',
        dungeonBonus: '동굴, 요새류'
      },
      archer: {
        preferredWeapon: '활과 화살',
        combatRange: '원거리',
        specialAbility: '연속 사격',
        weakness: '근접 방어력 부족',
        monsterPreference: '비행형, 원거리형',
        dungeonBonus: '숲, 평원류'
      },
      mage: {
        preferredWeapon: '지팡이와 마법서',
        combatRange: '중거리',
        specialAbility: '원소 마법',
        weakness: '물리 방어력 부족',
        monsterPreference: '언데드, 정령류',
        dungeonBonus: '탑, 유적류'
      },
      paladin: {
        preferredWeapon: '성검과 성방패',
        combatRange: '근중거리',
        specialAbility: '치유와 보호',
        weakness: '특별한 약점 없음',
        monsterPreference: '모든 타입',
        dungeonBonus: '모든 던전'
      }
    };
    
    return characteristics[playStyle.type];
  }

  /**
   * 플레이 스타일별 추천사항
   */
  generateRecommendations(styleType) {
    const recommendations = {
      warrior: [
        '근접 전투에서 높은 데미지를 입힙니다',
        '방어력이 높아 오래 버틸 수 있습니다', 
        '단순하고 직관적인 전투 방식을 선호합니다',
        '던전 탐험에서 안정적인 성과를 보입니다'
      ],
      archer: [
        '원거리에서 안전하게 적을 처치합니다',
        '이동 속도가 빨라 회피에 유리합니다',
        '정확한 타이밍과 위치 선정이 중요합니다',
        '넓은 지역 탐험에 적합합니다'
      ],
      mage: [
        '다양한 마법으로 상황에 대응합니다',
        '지능적인 전투 방식을 구사합니다',
        '마나 관리가 전투의 핵심입니다',
        '복잡한 던전 구조를 파악하는데 뛰어납니다'
      ],
      paladin: [
        '공격과 방어, 회복을 모두 갖춘 만능형입니다',
        '팀 플레이에서 뛰어난 능력을 발휘합니다',
        '지속적이고 안정적인 성장을 추구합니다',
        '모든 상황에 적응할 수 있는 유연성을 가집니다'
      ]
    };
    
    return recommendations[styleType] || [];
  }

  /**
   * 스탯 보너스 계산
   */
  calculateStatBonuses(styleType, activityScore) {
    const baseBonus = activityScore * 5; // 활동량에 따른 기본 보너스
    
    const bonuses = {
      warrior: {
        hp: baseBonus + 15,
        attack: baseBonus + 10,
        defense: baseBonus + 8,
        stamina: baseBonus + 3
      },
      archer: {
        hp: baseBonus + 5,
        attack: baseBonus + 8,
        defense: baseBonus + 3,
        stamina: baseBonus + 15
      },
      mage: {
        hp: baseBonus + 8,
        attack: baseBonus + 12,
        defense: baseBonus + 5,
        stamina: baseBonus + 8
      },
      paladin: {
        hp: baseBonus + 10,
        attack: baseBonus + 7,
        defense: baseBonus + 10,
        stamina: baseBonus + 10
      }
    };
    
    return bonuses[styleType] || bonuses.paladin;
  }

  /**
   * 전투 스타일 정의
   */
  getCombatStyle(styleType) {
    const combatStyles = {
      warrior: {
        attackPattern: 'aggressive',
        defensePattern: 'tank',
        skillCooldown: 'short',
        criticalChance: 0.15,
        dodgeChance: 0.05,
        counterAttackChance: 0.20
      },
      archer: {
        attackPattern: 'precise',
        defensePattern: 'evasive', 
        skillCooldown: 'medium',
        criticalChance: 0.25,
        dodgeChance: 0.20,
        counterAttackChance: 0.10
      },
      mage: {
        attackPattern: 'burst',
        defensePattern: 'barrier',
        skillCooldown: 'long',
        criticalChance: 0.20,
        dodgeChance: 0.10,
        counterAttackChance: 0.15
      },
      paladin: {
        attackPattern: 'balanced',
        defensePattern: 'steady',
        skillCooldown: 'medium',
        criticalChance: 0.12,
        dodgeChance: 0.12,
        counterAttackChance: 0.15
      }
    };
    
    return combatStyles[styleType] || combatStyles.paladin;
  }

  /**
   * 플레이 스타일 업데이트 (일일 재분석)
   */
  updateDailyStyle(currentStyle, recentActivity) {
    // 최근 활동 패턴에 따른 스타일 미세 조정
    // 예: 전투를 많이 했으면 warrior 성향 증가
    return currentStyle; // 현재는 기본 유지
  }
}

module.exports = new AIService();