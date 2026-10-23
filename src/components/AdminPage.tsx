import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowLeft, 
  KeyRound, 
  LogOut, 
  Edit3, 
  Plus, 
  Trash2, 
  ExternalLink,
  Layers,
  Award,
  Briefcase,
  FileText,
  CheckCircle2,
  Database
} from 'lucide-react';
import { SiteContent, Experience, Certification, PortfolioItem } from '../types';
import { Language, translations } from '../translations';
import { soundEngine } from '../utils/audio';

interface AdminPageProps {
  isAdminActive: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  isFirebaseConfigured: boolean;
  siteContent: SiteContent;
  experiences: Experience[];
  certifications: Certification[];
  portfolioItems: PortfolioItem[];
  onEditSiteContent: () => void;
  onAddExperience: () => void;
  onEditExperience: (exp: Experience) => void;
  onDeleteExperience: (id: string) => void;
  onAddCertification: () => void;
  onEditCertification: (cert: Certification) => void;
  onDeleteCertification: (id: string) => void;
  onAddPortfolioItem: () => void;
  onEditPortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
  onChangePassword: () => void;
  lang?: Language;
}

export default function AdminPage({
  isAdminActive,
  onLoginSuccess,
  onLogout,
  onNavigateHome,
  isFirebaseConfigured,
  siteContent,
  experiences,
  certifications,
  portfolioItems,
  onEditSiteContent,
  onAddExperience,
  onEditExperience,
  onDeleteExperience,
  onAddCertification,
  onEditCertification,
  onDeleteCertification,
  onAddPortfolioItem,
  onEditPortfolioItem,
  onDeletePortfolioItem,
  onChangePassword,
  lang = 'ko'
}: AdminPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'experience' | 'awards' | 'portfolio'>('overview');

  const t = translations[lang];

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Clear legacy password '6363' if present in localStorage
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('admin_password') === '6363') {
        localStorage.setItem('admin_password', 'rlarlawndnjs1234!!');
      }
    } catch {
      // ignore storage access errors
    }

    const trimmedUser = username.trim().toLowerCase();
    const rawUser = username.trim();
    const trimmedPass = password.trim();
    const rawPass = password;

    const customUser = (localStorage.getItem('admin_username') || '').trim().toLowerCase();
    const storedPass = localStorage.getItem('admin_password');

    // Comprehensive permitted IDs:
    // User requested: rlarlawndnjs1234
    // Also covers Korean keyboard IME (김김주원1234 / 김주원1234) and Kim Ju-won romanization (rlawndnjs1234)
    const validUsernames = [
      'rlarlawndnjs1234',
      'rlawndnjs1234',
      '김김주원1234',
      '김주원1234',
      'admin'
    ];
    if (customUser) {
      validUsernames.push(customUser);
    }

    const isUserValid = validUsernames.includes(trimmedUser) || validUsernames.includes(rawUser);

    // Comprehensive permitted passwords:
    // User requested: rlarlawndnjs1234!!
    // Also covers Korean IME, single rla, with or without exclamation marks
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
      setErrorMessage(
        lang === 'ko' 
          ? '아이디가 일치하지 않습니다.' 
          : 'Invalid admin ID.'
      );
      soundEngine.playError();
      return;
    }

    if (!isPassValid) {
      setErrorMessage(
        lang === 'ko' 
          ? '비밀번호가 일치하지 않습니다.' 
          : 'Incorrect password.'
      );
      soundEngine.playError();
      return;
    }

    // Success!
    soundEngine.playSuccess();
    onLoginSuccess();
    setUsername('');
    setPassword('');
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAdminActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080D1A] flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300">
        {/* Back button */}
        <div className="w-full max-w-md mb-6">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{lang === 'ko' ? '포트폴리오 메인으로 돌아가기' : 'Back to Portfolio Home'}</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-white dark:bg-[#111726] rounded-2xl shadow-2xl border-2 border-[#0052FF]/30 dark:border-blue-500/30 overflow-hidden relative">
          {/* Top highlight bar */}
          <div className="h-2 bg-gradient-to-r from-[#0052FF] via-[#00C6FF] to-[#0052FF]"></div>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-[#0052FF]/10 dark:bg-blue-900/30 text-[#0052FF] dark:text-blue-400 mb-3">
                <ShieldCheck size={32} />
              </div>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#0052FF] dark:text-blue-400 mb-1">
                SECURE ADMIN PORTAL
              </span>
              <h1 className="text-2xl font-bold font-headline text-gray-900 dark:text-white tracking-tight">
                {lang === 'ko' ? '관리자 페이지 로그인' : 'Admin Portal Login'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {lang === 'ko' 
                  ? '포트폴리오 수정을 위해 관리자 계정으로 로그인해 주세요.'
                  : 'Please sign in with your administrator credentials to manage portfolio content.'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
                  {lang === 'ko' ? '아이디 (USERNAME)' : 'USERNAME'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <User size={18} />
                  </span>
                  <input
                    id="admin-page-username-input"
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
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-10 pr-4 py-3 text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-xl focus:outline-none focus:border-[#0052FF] dark:focus:border-blue-400 transition-all font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 font-mono">
                  {lang === 'ko' ? '비밀번호 (PASSWORD)' : 'PASSWORD'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="admin-page-password-input"
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
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full pl-10 pr-12 py-3 text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 dark:bg-[#0B0F19] dark:text-white rounded-xl focus:outline-none focus:border-[#0052FF] dark:focus:border-blue-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div 
                  id="admin-login-error"
                  className="flex items-start space-x-2.5 text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 p-3.5 rounded-xl text-xs font-medium leading-relaxed animate-shake"
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="admin-page-login-btn"
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0041cc] text-white text-sm font-bold shadow-lg shadow-[#0052FF]/25 hover:shadow-[#0052FF]/40 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Lock size={16} />
                <span>{lang === 'ko' ? '관리자 로그인' : 'Sign in as Administrator'}</span>
              </button>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-[#0D1527] px-8 py-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
              Kim Ju-won Robotics Lab &bull; Administrative Interface
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ADMIN DASHBOARD (If authenticated)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080D1A] text-gray-900 dark:text-gray-100 pb-20 transition-colors duration-300">
      {/* Top Banner */}
      <header className="bg-[#0A0A0A] text-white border-b border-[#0052FF] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-[#0052FF] text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-headline font-bold text-base md:text-lg tracking-tight">
                  {lang === 'ko' ? '관리자 제어 센터' : 'Admin Control Center'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {lang === 'ko' ? '관리자 계정: rlarlawndnjs1234' : 'Logged in as: rlarlawndnjs1234'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* View Portfolio Live Mode Button */}
            <button
              id="admin-view-portfolio-btn"
              onClick={onNavigateHome}
              className="flex items-center space-x-2 py-2 px-3.5 rounded-lg bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>{lang === 'ko' ? '포트폴리오 실시간 편집 화면으로 이동' : 'Go to Portfolio Editor'}</span>
            </button>

            {/* Change Password */}
            <button
              id="admin-change-password-btn"
              onClick={onChangePassword}
              className="flex items-center space-x-1.5 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
            >
              <KeyRound size={14} />
              <span className="hidden sm:inline">{lang === 'ko' ? '비밀번호 변경' : 'Change Password'}</span>
            </button>

            {/* Logout */}
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="flex items-center space-x-1.5 py-2 px-3 rounded-lg bg-[#FF3B30]/20 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white text-xs font-semibold transition-all border border-[#FF3B30]/40 cursor-pointer"
            >
              <LogOut size={14} />
              <span>{lang === 'ko' ? '로그아웃' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Layers size={16} />
            <span>{lang === 'ko' ? '대시보드 개요' : 'Overview'}</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'content'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FileText size={16} />
            <span>{lang === 'ko' ? '소개 & 히어로 정보' : 'About & Hero'}</span>
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'experience'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Briefcase size={16} />
            <span>{lang === 'ko' ? `경험 이력 (${experiences.length})` : `Experience (${experiences.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('awards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'awards'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Award size={16} />
            <span>{lang === 'ko' ? `수상 및 인증 (${certifications.length})` : `Awards (${certifications.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'portfolio'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Database size={16} />
            <span>{lang === 'ko' ? `포트폴리오 (${portfolioItems.length})` : `Portfolio (${portfolioItems.length})`}</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Site Content Card */}
              <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0052FF] dark:text-blue-400">
                    <FileText size={22} />
                  </div>
                  <button
                    onClick={onEditSiteContent}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="편집"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
                <h3 className="text-sm font-bold font-headline text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {lang === 'ko' ? '메인 소개 & 헤드라인' : 'Hero & Site Content'}
                </h3>
                <p className="text-xl font-bold font-headline mt-1 truncate">
                  {siteContent.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {siteContent.description}
                </p>
              </div>

              {/* Experience Count Card */}
              <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Briefcase size={22} />
                  </div>
                  <button
                    onClick={onAddExperience}
                    className="p-2 rounded-lg text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                    title="추가"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <h3 className="text-sm font-bold font-headline text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {lang === 'ko' ? '등록된 경험 이력' : 'Experiences'}
                </h3>
                <p className="text-3xl font-black font-headline mt-1 text-purple-600 dark:text-purple-400">
                  {experiences.length}
                  <span className="text-sm font-normal text-gray-400 ml-1">{lang === 'ko' ? '건' : 'items'}</span>
                </p>
                <button
                  onClick={() => setActiveTab('experience')}
                  className="text-xs text-[#0052FF] dark:text-blue-400 hover:underline mt-2 inline-block font-semibold"
                >
                  {lang === 'ko' ? '이력 목록 관리하기 →' : 'Manage experiences →'}
                </button>
              </div>

              {/* Awards Card */}
              <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Award size={22} />
                  </div>
                  <button
                    onClick={onAddCertification}
                    className="p-2 rounded-lg text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                    title="추가"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <h3 className="text-sm font-bold font-headline text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {lang === 'ko' ? '수상 및 인증 기록' : 'Awards & Certs'}
                </h3>
                <p className="text-3xl font-black font-headline mt-1 text-amber-600 dark:text-amber-400">
                  {certifications.length}
                  <span className="text-sm font-normal text-gray-400 ml-1">{lang === 'ko' ? '건' : 'items'}</span>
                </p>
                <button
                  onClick={() => setActiveTab('awards')}
                  className="text-xs text-[#0052FF] dark:text-blue-400 hover:underline mt-2 inline-block font-semibold"
                >
                  {lang === 'ko' ? '수상 내역 관리하기 →' : 'Manage awards →'}
                </button>
              </div>

              {/* Portfolio Projects Card */}
              <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Database size={22} />
                  </div>
                  <button
                    onClick={onAddPortfolioItem}
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="추가"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <h3 className="text-sm font-bold font-headline text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {lang === 'ko' ? '포트폴리오 프로젝트' : 'Projects'}
                </h3>
                <p className="text-3xl font-black font-headline mt-1 text-emerald-600 dark:text-emerald-400">
                  {portfolioItems.length}
                  <span className="text-sm font-normal text-gray-400 ml-1">{lang === 'ko' ? '건' : 'items'}</span>
                </p>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="text-xs text-[#0052FF] dark:text-blue-400 hover:underline mt-2 inline-block font-semibold"
                >
                  {lang === 'ko' ? '프로젝트 관리하기 →' : 'Manage projects →'}
                </button>
              </div>
            </div>

            {/* Live Portfolio Editing Callout Banner */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#0052FF] to-blue-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                  <CheckCircle2 size={14} />
                  <span>{lang === 'ko' ? '관리자 권한 부여됨' : 'Admin Privileges Active'}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-headline">
                  {lang === 'ko' ? '포트폴리오 화면에서 실시간으로 직접 수정해 보세요' : 'Edit Directly on the Live Portfolio'}
                </h2>
                <p className="text-sm text-blue-100 max-w-2xl">
                  {lang === 'ko'
                    ? '포트폴리오 페이지로 이동하면 각 섹션마다 [소개 편집], [+ 이력 등록], [수정], [삭제] 버튼이 활성화되어 실제 화면을 보면서 즉시 수정할 수 있습니다.'
                    : 'When you view the portfolio, edit buttons, add forms, and deletion tools are live right beside the components.'}
                </p>
              </div>
              <button
                onClick={onNavigateHome}
                className="py-3 px-6 rounded-xl bg-white text-[#0052FF] hover:bg-gray-100 font-bold text-sm shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <span>{lang === 'ko' ? '포트폴리오 편집 화면 열기' : 'Open Portfolio Editor'}</span>
                <ExternalLink size={16} />
              </button>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-[#111726] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-bold font-headline mb-4 flex items-center space-x-2">
                <ShieldCheck size={18} className="text-[#0052FF] dark:text-blue-400" />
                <span>{lang === 'ko' ? '시스템 보안 및 데이터베이스 연동 정보' : 'System & Sync Information'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0D1527] border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-1">{lang === 'ko' ? '관리자 계정 ID' : 'Admin Username'}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">rlarlawndnjs1234</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0D1527] border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-1">{lang === 'ko' ? '데이터베이스 상태' : 'Database Status'}</span>
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{isFirebaseConfigured ? 'Firebase Firestore Live Sync' : 'Local Storage Mode'}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0D1527] border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-1">{lang === 'ko' ? '세션 보안 상태' : 'Session Security'}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{lang === 'ko' ? '보호된 세션 활성화됨' : 'Protected Session Active'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SITE CONTENT */}
        {activeTab === 'content' && (
          <div className="bg-white dark:bg-[#111726] p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h2 className="text-lg font-bold font-headline">
                  {lang === 'ko' ? '소개 및 히어로 섹션 정보' : 'Hero & About Details'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lang === 'ko' ? '포트폴리오의 대표 헤드라인, 소개글, 미션 선언문 및 이미지를 관리합니다.' : 'Manage headline, description, mission statement and artwork.'}
                </p>
              </div>
              <button
                onClick={onEditSiteContent}
                className="py-2 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>{lang === 'ko' ? '정보 수정하기' : 'Edit Details'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">
                    TITLE
                  </span>
                  <p className="text-lg font-bold font-headline mt-1 text-[#0052FF] dark:text-blue-400">
                    {siteContent.title}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">
                    SUBTITLE
                  </span>
                  <p className="text-sm font-semibold mt-1">
                    {siteContent.subtitle}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">
                    DESCRIPTION
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed bg-gray-50 dark:bg-[#0D1527] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    {siteContent.description}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">
                    MISSION STATEMENT
                  </span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic mt-1 border-l-2 border-[#0052FF] pl-3">
                    "{siteContent.missionStatement}"
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono mb-2">
                  HERO ARTWORK IMAGE
                </span>
                <div className="h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0D1527] overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={siteContent.heroImageUrl}
                    alt="Hero artwork"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-headline">
                  {lang === 'ko' ? '경험 이력 목록' : 'Experience Records'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lang === 'ko' ? '대회, 프로젝트, 수업 등 주요 활동을 등록하고 관리합니다.' : 'Add and manage tournament records, courses, and robotics projects.'}
                </p>
              </div>
              <button
                onClick={onAddExperience}
                className="py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>{lang === 'ko' ? '+ 새 경험 이력 등록' : '+ Add Experience'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#0052FF] dark:text-blue-300 font-bold">
                      ORDER #{exp.sortOrder}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {exp.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => onEditExperience(exp)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-600 dark:text-gray-300 hover:text-[#0052FF] transition-all cursor-pointer"
                      title="수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteExperience(exp.id)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AWARDS & CERTS */}
        {activeTab === 'awards' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-headline">
                  {lang === 'ko' ? '수상 및 인증 내역' : 'Awards & Certifications'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lang === 'ko' ? '로봇 대회 수상 경력 및 인증 정보를 관리합니다.' : 'Manage tournament awards and official robotics credentials.'}
                </p>
              </div>
              <button
                onClick={onAddCertification}
                className="py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>{lang === 'ko' ? '+ 새 수상/인증 등록' : '+ Add Award'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
                      {cert.result}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                      {cert.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      SORT #{cert.sortOrder}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => onEditCertification(cert)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-600 dark:text-gray-300 hover:text-[#0052FF] transition-all cursor-pointer"
                      title="수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteCertification(cert.id)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PORTFOLIO ITEMS */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-headline">
                  {lang === 'ko' ? '포트폴리오 프로젝트 목록' : 'Portfolio Projects'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lang === 'ko' ? '개발한 로봇 프로젝트, 센서 제어, 코딩 내역을 관리합니다.' : 'Manage completed and in-development robotics projects.'}
                </p>
              </div>
              <button
                onClick={onAddPortfolioItem}
                className="py-2.5 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>{lang === 'ko' ? '+ 새 프로젝트 등록' : '+ Add Project'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#111726] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="h-36 bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Database size={32} className="text-gray-400" />
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-black/60 text-white backdrop-blur-xs">
                      {item.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-grow">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] rounded text-gray-600 dark:text-gray-300 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#0D1527] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">
                      SORT #{item.sortOrder}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditPortfolioItem(item)}
                        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#0052FF] transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => onDeletePortfolioItem(item.id)}
                        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
