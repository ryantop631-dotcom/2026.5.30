import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [errorWord, setErrorWord] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = localStorage.getItem('admin_password') || '6363';
    if (password === currentPassword) {
      onSuccess();
      setPassword('');
      setErrorWord('');
    } else {
      setErrorWord('비밀번호가 일치하지 않습니다. 다시 입력해 주세요.');
    }
  };

  return (
    <div id="password-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="password-modal-card" 
        className="w-full max-w-md bg-white border-2 border-[#0052FF] rounded-xl shadow-2xl p-6 relative overflow-hidden transition-all duration-300 transform scale-100"
      >
        {/* Neon decorative ribbon */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0052FF] via-[#FF3B30] to-[#FFCC00]"></div>

        <button 
          id="close-password-modal"
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0052FF] transition-colors"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-3">
          <div className="w-12 h-12 rounded-full bg-[#0052FF]/10 flex items-center justify-center mb-4 text-[#0052FF]">
            <Lock size={22} className="animate-pulse" />
          </div>
          
          <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] tracking-tight">
            관리자 모드 로그인
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            포트폴리오의 텍스트와 이미지 수정을 위해 비밀번호를 입력해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 font-label-sm">
              PASSWORD
            </label>
            <input 
              id="admin-password-input"
              type="password" 
              required
              placeholder="••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorWord) setErrorWord('');
              }}
              className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0052FF] transition-all"
              autoFocus
            />
          </div>

          {errorWord && (
            <div id="password-error-message" className="flex items-center space-x-2 text-[#FF3B30] bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-3 rounded-lg text-xs leading-relaxed animate-shake">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorWord}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              id="password-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 text-sm font-semibold text-gray-600 transition-all font-title-md"
            >
              취소
            </button>
            <button
              id="password-submit-btn"
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#0052FF] hover:bg-[#003ec7] text-white text-sm font-semibold transition-all font-title-md shadow-md shadow-[#0052FF]/10"
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
