import { ShieldAlert, LogOut, KeyRound, LayoutDashboard, Edit3 } from 'lucide-react';
import { Language, translations } from '../translations';

interface AdminBarProps {
  isConfigured: boolean;
  onExit: () => void;
  onChangePassword: () => void;
  onNavigateToAdmin?: () => void;
  adminViewMode?: 'inline' | 'dashboard';
  onToggleViewMode?: () => void;
  lang?: Language;
}

export default function AdminBar({ 
  isConfigured, 
  onExit, 
  onChangePassword, 
  onNavigateToAdmin,
  adminViewMode = 'inline',
  onToggleViewMode,
  lang = 'ko' 
}: AdminBarProps) {
  const t = translations[lang].admin;

  return (
    <div 
      id="admin-status-bar" 
      className="fixed top-0 inset-x-0 h-14 bg-[#0A0A0A] text-white z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop border-b border-[#0052FF] animate-slide-down shadow-lg"
    >
      <div className="flex items-center space-x-3.5">
        <div className="flex-shrink-0 flex items-center justify-center p-1 bg-[#0052FF] text-white rounded">
          <ShieldAlert size={16} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <span className="font-headline-sm text-sm font-bold tracking-tight text-white leading-tight flex items-center gap-2">
            <span>{t.activeBanner}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono">
              /admin
            </span>
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5 md:mt-0">
            {isConfigured ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-gray-400 font-label-mono">
                  {t.liveSync}
                </span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></span>
                <span className="text-[11px] text-gray-400 font-label-mono">
                  {t.defaultSync}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {onToggleViewMode && (
          <button
            id="toggle-admin-view-mode-btn"
            onClick={onToggleViewMode}
            className="flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm outline-none cursor-pointer"
          >
            {adminViewMode === 'dashboard' ? (
              <>
                <Edit3 size={13} />
                <span>{lang === 'ko' ? '포트폴리오 직접 편집 (기존 기능)' : 'Live Portfolio Editor'}</span>
              </>
            ) : (
              <>
                <LayoutDashboard size={13} />
                <span>{lang === 'ko' ? '대시보드 표 관리 뷰' : 'Table Dashboard View'}</span>
              </>
            )}
          </button>
        )}
        {!onToggleViewMode && onNavigateToAdmin && (
          <button
            id="go-to-admin-dashboard-btn"
            onClick={onNavigateToAdmin}
            className="flex items-center space-x-1.5 py-1.5 px-3 rounded bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-semibold transition-all font-title-md outline-none cursor-pointer"
          >
            <span>{lang === 'ko' ? '관리자 제어 (/admin)' : 'Admin (/admin)'}</span>
          </button>
        )}
        <button
          id="change-admin-password-btn"
          onClick={onChangePassword}
          className="flex items-center space-x-1.5 py-1.5 px-3 rounded bg-white/10 hover:bg-[#0052FF] hover:text-white text-xs font-semibold text-gray-300 transition-all font-title-md outline-none cursor-pointer"
        >
          <KeyRound size={13} />
          <span>{t.changePassword}</span>
        </button>
        <button
          id="exit-admin-mode-btn"
          onClick={onExit}
          className="flex items-center space-x-1.5 py-1.5 px-3 rounded bg-white/10 hover:bg-[#FF3B30] hover:text-white text-xs font-semibold text-gray-300 transition-all font-title-md outline-none cursor-pointer"
        >
          <LogOut size={13} />
          <span>{t.exitAdmin}</span>
        </button>
      </div>
    </div>
  );
}

