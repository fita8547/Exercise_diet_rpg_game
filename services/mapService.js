/**
 * 지도 시스템 서비스
 * GPS 좌표를 게임 그리드로 변환하고 지역별 콘텐츠 관리
 */

class MapService {
  constructor() {
    // 그리드 설정
    this.GRID_SIZE = 5; // 5x5 그리드
    this.CELL_SIZE_METERS = 100; // 각 셀당 100m
    this.CENTER_OFFSET = Math.floor(this.GRID_SIZE / 2); // 중앙 기준점
  }

  /**
   * GPS 좌표를 게임 그리드 좌표로 변환
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Object} {gridX, gridY, cellId}
   */
  convertToGrid(latitude, longitude) {
    // 위도/경도를 미터 단위로 근사 변환
    const latMeters = latitude * 111000; // 1도 ≈ 111km
    const lngMeters = longitude * 111000 * Math.cos(latitude * Math.PI / 180);
    
    // 그리드 좌표 계산
    const gridX = Math.floor(latMeters / this.CELL_SIZE_METERS) % this.GRID_SIZE;
    const gridY = Math.floor(lngMeters / this.CELL_SIZE_METERS) % this.GRID_SIZE;
    
    // 음수 처리
    const normalizedX = ((gridX % this.GRID_SIZE) + this.GRID_SIZE) % this.GRID_SIZE;
    const normalizedY = ((gridY % this.GRID_SIZE) + this.GRID_SIZE) % this.GRID_SIZE;
    
    const cellId = `${normalizedX}_${normalizedY}`;
    
    return {
      gridX: normalizedX,
      gridY: normalizedY,
      cellId,
      centerX: this.CENTER_OFFSET,
      centerY: this.CENTER_OFFSET
    };
  }

  /**
   * 현재 위치 기준 5x5 맵 생성
   * @param {number} playerX 
   * @param {number} playerY 
   * @param {string} playStyle AI 분석 결과
   * @returns {Array} 5x5 맵 데이터
   */
  generateMap(playerX, playerY, playStyle = 'balanced') {
    const map = [];
    
    for (let y = 0; y < this.GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < this.GRID_SIZE; x++) {
        const isPlayerPosition = (x === this.CENTER_OFFSET && y === this.CENTER_OFFSET);
        const cellType = this.determineCellType(x, y, playStyle, isPlayerPosition);
        
        row.push({
          x,
          y,
          cellId: `${x}_${y}`,
          type: cellType.type,
          content: cellType.content,
          isPlayer: isPlayerPosition,
          distanceFromPlayer: this.calculateDistance(x, y, this.CENTER_OFFSET, this.CENTER_OFFSET)
        });
      }
      map.push(row);
    }
    
    return map;
  }

  /**
   * 셀 타입 결정 (AI 플레이 스타일 반영)
   * @param {number} x 
   * @param {number} y 
   * @param {string} playStyle 
   * @param {boolean} isPlayerPosition 
   * @returns {Object}
   */
  determineCellType(x, y, playStyle, isPlayerPosition) {
    if (isPlayerPosition) {
      return { type: 'player', content: null };
    }

    // 거리 기반 난이도
    const distance = this.calculateDistance(x, y, this.CENTER_OFFSET, this.CENTER_OFFSET);
    const cellHash = (x * 7 + y * 11) % 100; // 의사 랜덤
    
    // AI 스타일별 몬스터 출현 확률 조정
    const monsterChance = this.getMonsterChanceByStyle(playStyle, distance);
    
    if (cellHash < monsterChance) {
      return {
        type: 'monster',
        content: this.generateMonster(distance, playStyle)
      };
    } else if (cellHash < monsterChance + 15) {
      return {
        type: 'dungeon',
        content: this.generateDungeon(distance)
      };
    } else if (cellHash < monsterChance + 25) {
      return {
        type: 'treasure',
        content: { type: 'exp_bonus', value: distance * 10 }
      };
    } else {
      return { type: 'safe', content: null };
    }
  }

  /**
   * AI 스타일별 몬스터 출현 확률
   */
  getMonsterChanceByStyle(playStyle, distance) {
    const baseChance = 20 + (distance * 5); // 거리별 기본 확률
    
    switch (playStyle) {
      case 'warrior': return Math.min(baseChance + 10, 60); // 전투 지향
      case 'archer': return Math.max(baseChance - 5, 10);   // 회피 지향
      case 'mage': return baseChance;                       // 균형
      case 'paladin': return Math.min(baseChance + 5, 50);  // 안정적
      default: return baseChance;
    }
  }

  /**
   * 몬스터 생성
   */
  generateMonster(distance, playStyle) {
    const monsterTypes = ['goblin', 'orc', 'skeleton', 'slime', 'wolf'];
    const baseLevel = 1 + distance;
    
    // AI 스타일별 몬스터 타입 가중치
    let monsterType = monsterTypes[distance % monsterTypes.length];
    
    return {
      type: monsterType,
      level: baseLevel,
      hp: 30 + (baseLevel * 15),
      attack: 5 + (baseLevel * 3),
      defense: 2 + (baseLevel * 2),
      expReward: 15 + (baseLevel * 10),
      sprite: this.getMonsterSprite(monsterType)
    };
  }

  /**
   * 던전 생성
   */
  generateDungeon(distance) {
    const dungeonTypes = ['cave', 'ruins', 'tower', 'forest', 'crypt'];
    const type = dungeonTypes[distance % dungeonTypes.length];
    
    return {
      type,
      name: `${this.getDungeonName(type)} (Lv.${1 + distance})`,
      requiredLevel: 1 + distance,
      monsterCount: 3 + distance,
      bossLevel: 2 + distance,
      expReward: 50 + (distance * 25)
    };
  }

  /**
   * 다음 목표까지의 거리 계산
   * @param {Array} map 
   * @param {number} playerX 
   * @param {number} playerY 
   * @returns {Object}
   */
  findNearestTarget(map, playerX = 2, playerY = 2) {
    let nearestTarget = null;
    let minDistance = Infinity;
    
    for (let y = 0; y < this.GRID_SIZE; y++) {
      for (let x = 0; x < this.GRID_SIZE; x++) {
        const cell = map[y][x];
        if (cell.type === 'monster' || cell.type === 'dungeon') {
          const distance = this.calculateDistance(x, y, playerX, playerY);
          if (distance < minDistance) {
            minDistance = distance;
            nearestTarget = {
              ...cell,
              realDistanceMeters: Math.floor(distance * this.CELL_SIZE_METERS),
              direction: this.getDirection(playerX, playerY, x, y)
            };
          }
        }
      }
    }
    
    return nearestTarget;
  }

  /**
   * 유틸리티 함수들
   */
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  getDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? '동쪽' : '서쪽';
    } else {
      return dy > 0 ? '남쪽' : '북쪽';
    }
  }

  getMonsterSprite(type) {
    const sprites = {
      goblin: '👹',
      orc: '👺',
      skeleton: '💀',
      slime: '🟢',
      wolf: '🐺'
    };
    return sprites[type] || '👾';
  }

  getDungeonName(type) {
    const names = {
      cave: '어둠의 동굴',
      ruins: '고대 유적',
      tower: '마법사의 탑',
      forest: '저주받은 숲',
      crypt: '망자의 무덤'
    };
    return names[type] || '미지의 던전';
  }
}

module.exports = new MapService();