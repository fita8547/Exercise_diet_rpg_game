import React, { useState } from 'react';
import { Shield, Crown, Users, Swords, LogOut, Home } from 'lucide-react';
import DungeonShowcase from './DungeonShowcase';
import RPGLocationSystem from './RPGLocationSystem';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'game' | 'dungeons' | 'users'>('game');

  const handleBackToMain = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* 관리자 헤더 */}
      <div className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">🔒 관리자 대시보드</h1>
              <p className="text-red-200 text-sm">junsu@admin - 모든 권한 보유</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBackToMain}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              메인으로
            </button>
            <button
              onClick={onLogout}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-red-200">
        <div className="max-w-6xl mx-auto">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('game')}
              className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 ${
                activeTab === 'game'
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-600 hover:text-red-600'
              }`}
            >
              <Swords className="w-4 h-4" />
              게임 플레이
            </button>
            <button
              onClick={() => setActiveTab('dungeons')}
              className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 ${
                activeTab === 'dungeons'
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-600 hover:text-red-600'
              }`}
            >
              <Crown className="w-4 h-4" />
              던전 관리
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 ${
                activeTab === 'users'
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-600 hover:text-red-600'
              }`}
            >
              <Users className="w-4 h-4" />
              사용자 관리
            </button>
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'game' && (
          <div>
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-bold text-black mb-2">🎮 관리자 게임 모드</h2>
              <p className="text-black">
                관리자 권한으로 모든 던전에 접근할 수 있습니다. 
                레벨 100 캐릭터로 모든 컨텐츠를 테스트해보세요!
              </p>
            </div>
            <RPGLocationSystem 
              onLogout={onLogout}
              userEmail="junsu"
            />
          </div>
        )}

        {activeTab === 'dungeons' && (
          <div>
            <div className="bg-purple-100 border-2 border-purple-400 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-bold text-black mb-2">👑 던전 관리</h2>
              <p className="text-black">
                모든 던전의 정보를 확인하고 관리할 수 있습니다.
              </p>
            </div>
            <DungeonShowcase />
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-bold text-black mb-2">👥 사용자 관리</h2>
              <p className="text-black">
                사용자 관리 기능은 추후 구현 예정입니다.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-gray-300">
              <h3 className="text-lg font-bold text-black mb-4">📊 시스템 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-100 p-4 rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-600">∞</div>
                  <div className="text-sm text-gray-600">총 사용자</div>
                </div>
                <div className="bg-blue-100 p-4 rounded border border-blue-300">
                  <div className="text-2xl font-bold text-blue-600">21</div>
                  <div className="text-sm text-gray-600">총 던전</div>
                </div>
                <div className="bg-purple-100 p-4 rounded border border-purple-300">
                  <div className="text-2xl font-bold text-purple-600">6</div>
                  <div className="text-sm text-gray-600">전설 던전</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;