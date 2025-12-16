const Character = require('../models/Character');

class CharacterService {
  // 캐릭터 생성 또는 조회
  async getOrCreateCharacter(userId) {
    let character = await Character.findOne({ userId });
    
    if (!character) {
      character = new Character({ userId });
      await character.save();
    }
    
    return character;
  }

  // 캐릭터 능력치 업데이트
  async updateStats(userId, statGain) {
    const character = await Character.findOne({ userId });
    if (!character) throw new Error('캐릭터를 찾을 수 없습니다.');

    character.stats.hp += statGain.hp;
    character.stats.attack += statGain.attack;
    character.stats.defense += statGain.defense;
    character.stats.stamina += statGain.stamina;
    character.lastActiveDate = new Date();

    await character.save();
    return character;
  }

  // 경험치 추가 및 레벨업 처리
  async addExperience(userId, exp) {
    const character = await Character.findOne({ userId });
    if (!character) throw new Error('캐릭터를 찾을 수 없습니다.');

    character.exp += exp;
    const leveledUp = character.checkLevelUp();
    
    await character.save();
    
    return { character, leveledUp };
  }

  // 지역 업데이트
  async updateRegion(userId, regionId) {
    const character = await Character.findOne({ userId });
    if (!character) throw new Error('캐릭터를 찾을 수 없습니다.');

    const oldRegion = character.currentRegion;
    character.currentRegion = regionId;
    character.lastActiveDate = new Date();
    
    await character.save();
    
    return { character, regionChanged: oldRegion !== regionId };
  }
}

module.exports = new CharacterService();