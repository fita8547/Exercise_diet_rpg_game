import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  onClose: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  onClose 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일을 Base64로 변환하여 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      // 실제 서버 업로드는 나중에 구현
      // 현재는 localStorage에 저장
      localStorage.setItem('profileImage', selectedImage);
      onImageChange(selectedImage);
      onClose();
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    localStorage.removeItem('profileImage');
    onImageChange('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black">프로필 이미지 변경</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 이미지 미리보기 */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-100 mb-4">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="프로필 미리보기"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* 업로드 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              <Camera className="w-4 h-4" />
              이미지 선택
            </button>
            
            {selectedImage && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold"
              >
                <X className="w-4 h-4" />
                제거
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-600">
            • 이미지 파일만 업로드 가능합니다<br/>
            • 최대 파일 크기: 5MB<br/>
            • 권장 크기: 정사각형 (1:1 비율)
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!selectedImage || isUploading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                저장하기
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;