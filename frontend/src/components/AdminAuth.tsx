import React, { useState } from 'react';
import { Shield, Lock, AlertCircle } from 'lucide-react';

interface AdminAuthProps {
  onAdminLogin: (password: string) => Promise<void>;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAdminLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onAdminLogin(password);
    } catch (err: any) {
      console.error('Admin auth error:', err);
      const errorMessage = err.response?.data?.error || err.message || '관리자 인증에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full border-4 border-red-400 shadow-lg">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-black mb-2">🔒 관리자 인증</h1>
          <p className="text-gray-600">관리자 권한이 필요합니다</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 rounded p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              관리자 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-red-300 rounded focus:border-red-500 focus:outline-none text-lg"
              placeholder="관리자 비밀번호를 입력하세요"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3 px-4 rounded text-lg"
          >
            {isLoading ? '인증 중...' : '🔓 관리자 로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-yellow-600 hover:text-yellow-700 font-bold text-sm"
          >
            ← 메인 페이지로 돌아가기
          </a>
        </div>

        <div className="mt-4 bg-yellow-100 p-3 rounded border border-yellow-300">
          <p className="text-xs text-gray-600 text-center">
            ⚠️ 관리자 전용 페이지입니다<br/>
            무단 접근 시 법적 책임을 질 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;