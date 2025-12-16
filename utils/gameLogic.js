// 운동 타입별 능력치 증가 계산
const calculateStatGain = (type, amount) => {
  const statGain = { hp: 0, attack: 0, defense: 0, stamina: 0 };
  
  // 하루 최대 스탯 증가량 제한
  const maxGains = { hp: 20, attack: 10, defense: 10, stamina: 15 };
  
  switch (type) {
    case 'pushup':
      statGain.attack = Math.min(Math.floor(amount / 5), maxGains.attack);
      break;
    case 'squat':
      statGain.defense = Math.min(Math.floor(amount / 7), maxGains.defense);
      break;
    case 'plank':
      statGain.stamina = Math.min(Math.floor(amount / 15), maxGains.stamina);
      break;
    case 'walk':
      statGain.hp = Math.min(Math.floor(amount / 200), maxGains.hp);
      break;
  }
  
  return statGain;
};

// 좌표를 지역 ID로 변환
const getRegionFromCoordinates = (latitude, longitude) => {
  // 간단한 그리드 기반 지역 분할
  const latGrid = Math.floor((latitude + 90) / 10); // 0-17
  const lngGrid = Math.floor((longitude + 180) / 20); // 0-17
  
  return `region_${latGrid}_${lngGrid}`;
};

// 위치 이동 거리 계산 (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 전투 데미지 계산
const calculateDamage = (attackerAttack, defenderDefense) => {
  const baseDamage = Math.max(1, attackerAttack - defenderDefense);
  const randomFactor = Math.floor(Math.random() * 5) + 1; // 1-5
  return baseDamage + randomFactor;
};

// 오늘 날짜 문자열 (YYYY-MM-DD)
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

module.exports = {
  calculateStatGain,
  getRegionFromCoordinates,
  calculateDistance,
  calculateDamage,
  getTodayString
};