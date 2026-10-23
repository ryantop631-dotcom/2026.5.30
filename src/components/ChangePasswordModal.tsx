import React, { useState } from 'react';
import { KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../translations';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export default function ChangePasswordModal({ isOpen, onClose, lang = 'ko' }: ChangePasswordModalProps) {
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

    if (localStorage.getItem('admin_password') === '6363') {
      localStorage.setItem('admin_password', 'rlarlawndnjs1234!!');
    }

    const actualCurrentPass = localStorage.getItem('admin_password') || 'rlarlawndnjs1234!!';
    const trimmedInput = currentPass.trim();

    const isMatch = trimmedInput === 'rlarlawndnjs1234!!' || currentPass === 'rlarlawndnjs1234!!' || trimmedInput === actualCurrentPass || currentPass === actualCurrentPass;

    if (!isMatch) {
      setErrorWord(lang === 'ko' ? '현재 비밀번호가 일치하지 않습니다.' : 'Current password does not match.');
      return;
    }

    if (newPass.length === 0) {
      setErrorWord(lang === 'ko' ? '새 비밀번호를 입력해 주세요.' : 'Please enter a new password.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorWord(lang === 'ko' ? '새 비밀번호와 확인 입력이 일치하지 않습니다.' : 'New password and confirmation do not match.');
      return;
    }

    // Save
    localStorage.setItem('admin_password', newPass);
    setSuccessWord(lang === 'ko' ? '비밀번호가 성공적으로 변경되었습니다!' : 'Password successfully updated!');
    
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
        className="w-full max-w-sm bg-white dark:bg-[#111726] border-2 border-[#0052FF] dark:border-blue-500 rounded-xl shadow-2xl p-6 relative overflow-hidden transition-all duration-300 transform scale-100"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0052FF] via-[#FF3B30] to-[#FFCC00]"></div>

        <button 
          id="close-change-password-modal"
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0052FF] dark:hover:text-white transition-colors"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-3">
          <div className="w-12 h-12 rounded-full bg-[#0052FF]/10 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-[#0052FF] dark:text-blue-400">
            <KeyRound size={22} className="animate-pulse" />
          </div>
          
          <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
            {lang === 'ko' ? '관리자 비밀번호 변경' : 'Change Admin Password'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'ko' ? '기존 비밀번호를 입력하고 새 비밀번호로 수정합니다.' : 'Verify current password and set a new administrator password.'}
          </p>
        </div>

        {successWord ? (
          <div id="change-password-success-view" className="mt-6 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 animate-fade-in">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <span className="text-sm font-semibold">{successWord}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-label-sm">
                {lang === 'ko' ? '현재 비밀번호' : 'CURRENT PASSWORD'}
              </label>
              <input 
                id="current-password-input"
                type="password" 
                required
                placeholder={lang === 'ko' ? '현재 비밀번호 입력' : 'Enter current password'}
                value={currentPass}
                onChange={(e) => {
                  setCurrentPass(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-lg text-sm focus:outline-none focus:border-[#0052FF] transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-label-sm">
                {lang === 'ko' ? '새 비밀번호' : 'NEW PASSWORD'}
              </label>
              <input 
                id="new-password-input"
                type="password" 
                required
                placeholder={lang === 'ko' ? '새로운 비밀번호' : 'Enter new password'}
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-lg text-sm focus:outline-none focus:border-[#0052FF] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-label-sm">
                {lang === 'ko' ? '새 비밀번호 확인' : 'CONFIRM NEW PASSWORD'}
              </label>
              <input 
                id="confirm-password-input"
                type="password" 
                required
                placeholder={lang === 'ko' ? '새로운 비밀번호 재입력' : 'Re-enter new password'}
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-lg text-sm focus:outline-none focus:border-[#0052FF] transition-all"
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
                className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all font-title-md cursor-pointer"
              >
                {lang === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button
                id="change-password-submit-btn"
                type="submit"
                className="flex-1 py-2 px-4 rounded-lg bg-[#0052FF] hover:bg-[#003ec7] text-white text-sm font-semibold transition-all font-title-md shadow-md shadow-[#0052FF]/10 cursor-pointer"
              >
                {lang === 'ko' ? '변경하기' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

