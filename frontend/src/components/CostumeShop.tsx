import React, { useState, useEffect } from 'react';
import { ShoppingBag, Footprints, Lock, Check, X } from 'lucide-react';
import { costumeAPI } from '../services/api';

interface Costume {
  costumeId: string;
  name: string;
  description: string;
  category: 'head' | 'body' | 'weapon' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  icon: string;
  unlockLevel: number;
  isOwned: boolean;
  isEquipped: boolean;
  visualEffect?: string; // 외관 효과 설명
}

interface CostumeShopProps {
  onClose: () => void;
  walkingExp?: number; // 걷기 경험치 전달
}

const CostumeShop: React.FC<CostumeShopProps> = ({ onClose, walkingExp = 0 }) => {
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: '전체', icon: '🛍️' },
    { id: 'head', name: '머리', icon: '⛑️' },
    { id: 'body', name: '몸', icon: '🦺' },
    { id: 'weapon', name: '무기', icon: '⚔️' },
    { id: 'accessory', name: '액세서리', icon: '💍' }
  ];

  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  };

  const rarityTextColors = {
    common: 'text-gray-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  };

  useEffect(() => {
    loadCostumes();
  }, []);

  const loadCostumes = async () => {
    try {
      console.log('🛍️ 코스튬 로드 시작...');
      const data = await costumeAPI.getCostumes();
      console.log('🛍️ 코스튬 데이터:', data);
      setCostumes(data.costumes || []);
    } catch (error) {
      console.error('🛍️ 코스튬 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseCostume = async (costumeId: string) => {
    try {
      const response = await fetch('/api/costumes/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ costumeId })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        loadCostumes(); // 목록 새로고침
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('코스튬 구매 실패:', error);
      alert('구매 중 오류가 발생했습니다.');
    }
  };

  const equipCostume = async (costumeId: string, action: 'equip' | 'unequip') => {
    try {
      const response = await fetch('/api/costumes/equip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ costumeId, action })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        loadCostumes(); // 목록 새로고침
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('코스튬 장착/해제 실패:', error);
      alert('장착/해제 중 오류가 발생했습니다.');
    }
  };

  const filteredCostumes = selectedCategory === 'all' 
    ? costumes 
    : costumes.filter(costume => costume.category === selectedCategory);

  const getVisualEffect = (costume: Costume) => {
    // 코스튬별 외관 효과 설명
    const effects: { [key: string]: string } = {
      'warrior_helmet': '🔥 용맹한 전사의 기운',
      'mage_hat': '✨ 신비로운 마법의 오라',
      'royal_crown': '👑 왕족의 위엄과 품격',
      'leather_armor': '🛡️ 견고한 방어 자세',
      'chain_mail': '⚔️ 중무장 기사의 위용',
      'dragon_scale': '🐲 드래곤의 위압적인 기운',
      'iron_sword': '⚔️ 날카로운 검기',
      'magic_staff': '🔮 마법진이 빛나는 효과',
      'excalibur': '⚡ 성스러운 빛의 검기',
      'power_ring': '💫 손가락에서 빛나는 오라',
      'health_amulet': '💚 생명력이 넘치는 빛',
      'legendary_necklace': '🌟 모든 능력이 빛나는 효과'
    };
    
    return costume.visualEffect || effects[costume.costumeId] || '✨ 멋진 외관 효과';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
            <p className="text-black font-bold">코스튬 상점 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-yellow-400 p-6 border-b-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-black" />
              <div>
                <h2 className="text-2xl font-bold text-black">코스튬 상점</h2>
                <p className="text-black text-sm">멋진 장비로 캐릭터를 꾸며보세요!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-300 px-4 py-2 rounded-lg border-2 border-green-500">
                <Footprints className="w-5 h-5 text-green-700" />
                <span className="font-bold text-black">{walkingExp.toLocaleString()}</span>
                <span className="text-sm text-black">걷기 경험치</span>
              </div>
              <button
                onClick={onClose}
                className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="bg-yellow-100 p-4 border-b-2 border-yellow-300">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 코스튬 목록 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCostumes.map(costume => (
              <div
                key={costume.costumeId}
                className={`p-4 rounded-lg border-2 ${rarityColors[costume.rarity]}`}
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{costume.icon}</div>
                  <h3 className="font-bold text-black">{costume.name}</h3>
                  <p className={`text-xs font-bold uppercase ${rarityTextColors[costume.rarity]}`}>
                    {costume.rarity}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{costume.description}</p>
                  <div className="text-xs text-purple-600 font-medium">
                    {getVisualEffect(costume)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">필요 레벨: {costume.unlockLevel}</span>
                    <div className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-green-600" />
                      <span className="font-bold">{costume.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">걷기 경험치</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {costume.isOwned ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        소유 중
                      </div>
                      {costume.isEquipped ? (
                        <button
                          onClick={() => equipCostume(costume.costumeId, 'unequip')}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                          장착 해제
                        </button>
                      ) : (
                        <button
                          onClick={() => equipCostume(costume.costumeId, 'equip')}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                          장착하기
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => purchaseCostume(costume.costumeId)}
                      disabled={walkingExp < costume.price}
                      className={`w-full font-bold py-2 px-4 rounded text-sm ${
                        walkingExp >= costume.price
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {walkingExp >= costume.price ? '구매하기' : '걷기 경험치 부족'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredCostumes.length === 0 && (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">해당 카테고리에 사용 가능한 코스튬이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostumeShop;