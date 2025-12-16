import React, { useState, useEffect } from 'react';
import { useAuthState } from './hooks/useAuth';
import AuthModal from './components/AuthModal';
import RPGLocationSystem from './components/RPGLocationSystem';
import DungeonShowcase from './components/DungeonShowcase';

function App() {
  const { user, token, login, register, logout, isLoading } = useAuthState();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showDungeonShowcase, setShowDungeonShowcase] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleDemoLogin = async () => {
    try {
      await login('demo@demo.com', 'demo123');
    } catch (error) {
      // 데모 계정이 없으면 생성
      try {
        await register('demo@demo.com', 'demo123');
      } catch (registerError) {
        console.error('서버 연결 실패, 오프라인 데모 모드로 전환');
        // 오프라인 데모 모드
        setDemoMode(true);
      }
    }
  };

  const handleOfflineDemo = () => {
    localStorage.setItem('demoMode', 'true');
    setDemoMode(true);
  };

  const handleAdminLogin = async () => {
    try {
      await login('junsu', 'sungo8547!');
    } catch (error) {
      console.error('관리자 로그인 실패:', error);
      alert('관리자 로그인에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  // 관리자 로그인 체크
  useEffect(() => {
    const adminLogin = localStorage.getItem('adminLogin');
    if (adminLogin === 'true') {
      localStorage.removeItem('adminLogin');
      handleAdminLogin();
    }
  }, []);

  // 던전 쇼케이스 표시
  if (showDungeonShowcase) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDungeonShowcase(false)}
          className="fixed top-4 right-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          ← 돌아가기
        </button>
        <DungeonShowcase />
      </div>
    );
  }

  if (!user && !token && !demoMode) {
    return (
      <>
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-yellow-400 rounded-lg p-8 border-4 border-yellow-600 mb-6">
              <h1 className="text-4xl font-bold text-black mb-4">⚔️ 워킹 RPG</h1>
              <p className="text-black mb-6">
                걸으면서 레벨업하고 강해지는 운동 RPG 게임!
                실제 걷기로 캐릭터를 성장시켜보세요.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDemoLogin}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded-lg text-lg"
                >
                  🎮 데모로 바로 시작
                </button>
                <button
                  onClick={handleOfflineDemo}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg"
                >
                  🔒 오프라인 데모
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg text-sm"
                >
                  계정으로 시작하기
                </button>
                <button
                  onClick={() => setShowDungeonShowcase(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                >
                  🏰 전체 던전 보기 👑
                </button>

              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border-2 border-yellow-300">
              <h2 className="font-bold text-black mb-3">🎮 게임 특징</h2>
              <ul className="text-sm text-black space-y-2 text-left">
                <li>• 📱 GPS를 활용한 실제 걷기 측정</li>
                <li>• ⚔️ 걸을수록 강해지는 RPG 시스템</li>
                <li>• 🏆 다양한 퀘스트와 도전 과제</li>
                <li>• 🔋 배터리 최적화된 위치 추적</li>
                <li>• 🌍 지역별 던전과 모험</li>
              </ul>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={login}
          onRegister={register}
        />
      </>
    );
  }

  return (
    <RPGLocationSystem 
      onLogout={demoMode ? () => {
        localStorage.removeItem('demoMode');
        setDemoMode(false);
      } : logout}
      userEmail={demoMode ? 'demo@offline.local' : user.email}
    />
  );
}

export default App;