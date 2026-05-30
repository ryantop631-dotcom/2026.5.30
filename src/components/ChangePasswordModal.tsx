import React, { useState } from 'react';
import { KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [errorWord, setErrorWord] = useState('');
  const [successWord, setSuccessWord] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWord('');
    setSuccessWord('');

    const actualCurrentPass = localStorage.getItem('admin_password') || '6363';

    if (currentPass !== actualCurrentPass) {
      setErrorWord('현재 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPass.length === 0) {
      setErrorWord('새 비밀번호를 입력해 주세요.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorWord('새 비밀번호와 확인 입력이 일치하지 않습니다.');
      return;
    }

    // Save
    localStorage.setItem('admin_password', newPass);
    setSuccessWord('비밀번호가 성공적으로 변경되었습니다!');
    
    // Clear fields
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');

    // Close after a brief delay so the user sees the success state
    setTimeout(() => {
      onClose();
      setSuccessWord('');
    }, 1500);
  };

  return (
    <div id="change-password-modal-container" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 100 }}>
      <div 
        id="change-password-modal-card" 
        className="w-full max-w-sm bg-white border-2 border-[#0052FF] rounded-xl shadow-2xl p-6 relative overflow-hidden transition-all duration-300 transform scale-100"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0052FF] via-[#FF3B30] to-[#FFCC00]"></div>

        <button 
          id="close-change-password-modal"
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0052FF] transition-colors"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-3">
          <div className="w-12 h-12 rounded-full bg-[#0052FF]/10 flex items-center justify-center mb-4 text-[#0052FF]">
            <KeyRound size={22} className="animate-pulse" />
          </div>
          
          <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] tracking-tight">
            관리자 비밀번호 변경
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            기존 비밀번호를 입력하고 새 비밀번호로 수정합니다.
          </p>
        </div>

        {successWord ? (
          <div id="change-password-success-view" className="mt-6 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 animate-fade-in">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <span className="text-sm font-semibold">{successWord}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1 font-label-sm">
                현재 비밀번호
              </label>
              <input 
                id="current-password-input"
                type="password" 
                required
                placeholder="현재 비밀번호 입력"
                value={currentPass}
                onChange={(e) => {
                  setCurrentPass(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0052FF] transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1 font-label-sm">
                새 비밀번호
              </label>
              <input 
                id="new-password-input"
                type="password" 
                required
                placeholder="새로운 비밀번호"
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0052FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1 font-label-sm">
                새 비밀번호 확인
              </label>
              <input 
                id="confirm-password-input"
                type="password" 
                required
                placeholder="새로운 비밀번호 재입력"
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0052FF] transition-all"
              />
            </div>

            {errorWord && (
              <div id="change-password-error-message" className="flex items-center space-x-2 text-[#FF3B30] bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-2.5 rounded-lg text-xs leading-relaxed animate-shake">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorWord}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                id="change-password-cancel-btn"
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 text-sm font-semibold text-gray-600 transition-all font-title-md"
              >
                취소
              </button>
              <button
                id="change-password-submit-btn"
                type="submit"
                className="flex-1 py-2 px-4 rounded-lg bg-[#0052FF] hover:bg-[#003ec7] text-white text-sm font-semibold transition-all font-title-md shadow-md shadow-[#0052FF]/10"
              >
                변경하기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
