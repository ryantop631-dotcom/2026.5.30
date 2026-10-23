import React, { useState } from 'react';
import { Lock, X, AlertCircle, User, Eye, EyeOff } from 'lucide-react';
import { Language, translations } from '../translations';
import { soundEngine } from '../utils/audio';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNavigateToAdminPage?: () => void;
  lang?: Language;
}

export default function PasswordModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onNavigateToAdminPage,
  lang = 'ko' 
}: PasswordModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorWord, setErrorWord] = useState('');
  const t = translations[lang].admin;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWord('');

    // Clear legacy password '6363' if present in localStorage
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('admin_password') === '6363') {
        localStorage.setItem('admin_password', 'rlarlawndnjs1234!!');
      }
    } catch {
      // ignore
    }

    const trimmedUser = username.trim().toLowerCase();
    const rawUser = username.trim();
    const trimmedPass = password.trim();
    const rawPass = password;

    const customUser = (localStorage.getItem('admin_username') || '').trim().toLowerCase();
    const storedPass = localStorage.getItem('admin_password');

    const validUsernames = [
      'rlarlawndnjs1234',
      'rlawndnjs1234',
      '김김주원1234',
      '김주원1234',
      'admin'
    ];
    if (customUser) validUsernames.push(customUser);

    const isUserValid = validUsernames.includes(trimmedUser) || validUsernames.includes(rawUser);

    const validPasswords = [
      'rlarlawndnjs1234!!',
      'rlawndnjs1234!!',
      '김김주원1234!!',
      '김주원1234!!',
      'rlarlawndnjs1234',
      'rlawndnjs1234',
      '김김주원1234',
      '김주원1234',
      '6363'
    ];
    if (storedPass && storedPass !== '6363') {
      validPasswords.push(storedPass);
      validPasswords.push(storedPass.trim());
    }

    const isPassValid = validPasswords.includes(trimmedPass) || validPasswords.includes(rawPass);

    if (!isUserValid) {
      setErrorWord(lang === 'ko' ? '아이디가 일치하지 않습니다.' : 'Invalid admin ID.');
      soundEngine.playError();
      return;
    }

    if (!isPassValid) {
      setErrorWord(lang === 'ko' ? '비밀번호가 일치하지 않습니다.' : 'Incorrect password.');
      soundEngine.playError();
      return;
    }

    // Success
    soundEngine.playSuccess();
    onSuccess();
    setUsername('');
    setPassword('');
    setErrorWord('');
  };

  return (
    <div id="password-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="password-modal-card" 
        className="w-full max-w-md bg-white dark:bg-[#111726] border-2 border-[#0052FF] dark:border-blue-500 rounded-xl shadow-2xl p-6 relative overflow-hidden transition-all duration-300 transform scale-100"
      >
        {/* Neon decorative ribbon */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0052FF] via-[#FF3B30] to-[#FFCC00]"></div>

        <button 
          id="close-password-modal"
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0052FF] dark:hover:text-white transition-colors"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-3">
          <div className="w-12 h-12 rounded-full bg-[#0052FF]/10 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-[#0052FF] dark:text-blue-400">
            <Lock size={22} className="animate-pulse" />
          </div>
          
          <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
            {t.loginTitle}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'ko' ? '관리자 전용 아이디와 비밀번호를 입력해 주세요.' : 'Please enter the administrator ID and password to access editing features.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* USERNAME INPUT */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 font-label-sm">
              {lang === 'ko' ? '아이디 (ID)' : 'USERNAME'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User size={16} />
              </span>
              <input 
                id="admin-username-input"
                type="text" 
                required
                placeholder={lang === 'ko' ? '관리자 아이디 입력' : 'Admin ID'}
                value={username}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-lg focus:outline-none focus:border-[#0052FF] transition-all font-mono"
                autoFocus
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 font-label-sm">
              {lang === 'ko' ? '비밀번호 (PASSWORD)' : 'PASSWORD'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input 
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorWord) setErrorWord('');
                }}
                className="w-full pl-10 pr-10 py-2.5 text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-lg focus:outline-none focus:border-[#0052FF] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
              className="flex-1 py-2.5 px-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all font-title-md cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              id="password-submit-btn"
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#0052FF] hover:bg-[#003ec7] text-white text-sm font-semibold transition-all font-title-md shadow-md shadow-[#0052FF]/10 cursor-pointer"
            >
              {t.loginBtn}
            </button>
          </div>

          {onNavigateToAdminPage && (
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdminPage();
                }}
                className="text-xs text-[#0052FF] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                {lang === 'ko' ? '🔗 /admin 관리자 페이지로 이동' : '🔗 Go to /admin Page'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
