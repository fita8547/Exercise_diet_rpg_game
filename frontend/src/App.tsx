import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthState } from './hooks/useAuth';
import AuthModal from './components/AuthModal';
import RPGLocationSystem from './components/RPGLocationSystem';
import DungeonShowcase from './components/DungeonShowcase';
import AdminAuth from './components/AdminAuth';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { user, token, login, register, logout, isLoading } = useAuthState();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDungeonShowcase, setShowDungeonShowcase] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleDemoLogin = async () => {
    try {
      console.log('🎮 데모 로그인 시도...');
      console.log('📡 API URL:', 'http://localhost:3001/api');
      await login('demo@demo.com', 'demo123');
      console.log('✅ 데모 로그인 성공');
      console.log('👤 사용자 정보:', user);
      console.log('🔑 토큰:', token);
    } catch (error) {
      console.log('❌ 데모 로그인 실패:', error);
      console.log('🔄 계정 생성 시도...');
      // 데모 계정이 없으면 생성
      try {
        await register('demo@demo.com', 'demo123');
        console.log('✅ 데모 계정 생성 및 로그인 성공');
      } catch (registerError) {
        console.error('❌ 서버 연결 실패:', registerError);
        const errorMessage = registerError instanceof Error ? registerError.message : '알 수 없는 오류';
        alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.\n\n오류: ' + errorMessage);
      }
    }
  };

  const handleAdminPasswordAuth = async (password: string) => {
    if (password === 'sungo8547!') {
      try {
        await login('junsu', password);
        setIsAdminAuthenticated(true);
      } catch (error) {
        console.error('관리자 로그인 실패:', error);
        throw new Error('관리자 로그인에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      }
    } else {
      throw new Error('관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    logout();
    window.location.href = '/';
  };

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

  return (
    <Routes>
      {/* 관리자 페이지 라우트 */}
      <Route 
        path="/adminisgoodjunsu" 
        element={
          !isAdminAuthenticated ? (
            <AdminAuth onAdminLogin={handleAdminPasswordAuth} />
          ) : (
            <AdminDashboard onLogout={handleAdminLogout} />
          )
        } 
      />
      
      {/* 메인 페이지 라우트 */}
      <Route 
        path="/" 
        element={
          <>
            {/* 던전 쇼케이스 표시 */}
            {showDungeonShowcase && (
              <div className="relative">
                <button
                  onClick={() => setShowDungeonShowcase(false)}
                  className="fixed top-4 right-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  ← 돌아가기
                </button>
                <DungeonShowcase />
              </div>
            )}

            {/* 로그인하지 않은 경우 */}
            {!showDungeonShowcase && (!user && !token) && (
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
                          onClick={async () => {
                            try {
                              console.log('🔧 직접 API 테스트...');
                              const response = await fetch('http://localhost:3001/api/test');
                              const data = await response.json();
                              console.log('✅ API 테스트 성공:', data);
                              alert('API 연결 성공: ' + data.message);
                            } catch (error) {
                              console.error('❌ API 테스트 실패:', error);
                              const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                              alert('API 연결 실패: ' + errorMessage);
                            }
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg text-sm"
                        >
                          🔧 API 연결 테스트
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
            )}

            {/* 로그인한 경우 게임 화면 */}
            {!showDungeonShowcase && user && token && (
              <RPGLocationSystem 
                onLogout={logout}
                userEmail={user.email}
              />
            )}
          </>
        } 
      />
    </Routes>
  );
}

export default App;