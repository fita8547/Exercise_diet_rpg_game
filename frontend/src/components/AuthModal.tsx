import React, { useState } from 'react';
import { Swords, Mail, Lock, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLoginMode && password !== confirmPassword) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      if (isLoginMode) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.response?.data?.error || err.message || '네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-yellow-400">
        <div className="flex items-center gap-3 mb-6">
          <Swords className="w-8 h-8 text-yellow-600" />
          <h2 className="text-2xl font-bold text-black">
            {isLoginMode ? '모험가 로그인' : '새로운 모험가 등록'}
          </h2>
        </div>

        {error && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-yellow-300 rounded focus:border-yellow-500 focus:outline-none"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-yellow-300 rounded focus:border-yellow-500 focus:outline-none"
              placeholder="비밀번호 (6자 이상)"
              minLength={6}
              required
            />
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-yellow-300 rounded focus:border-yellow-500 focus:outline-none"
                placeholder="비밀번호 다시 입력"
                minLength={6}
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 text-black font-bold py-3 px-4 rounded"
            >
              {isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded"
            >
              취소
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-yellow-600 hover:text-yellow-700 font-bold text-sm"
          >
            {isLoginMode ? '새 계정 만들기' : '이미 계정이 있나요?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;