import { ShieldAlert, LogOut, CheckCircle2, RotateCw } from 'lucide-react';

interface AdminBarProps {
  isConfigured: boolean;
  onExit: () => void;
}

export default function AdminBar({ isConfigured, onExit }: AdminBarProps) {
  return (
    <div 
      id="admin-status-bar" 
      className="fixed top-0 inset-x-0 h-14 bg-[#0A0A0A] text-white z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop border-b border-[#FF3B30] animate-slide-down"
    >
      <div className="flex items-center space-x-3.5">
        <div className="flex-shrink-0 flex items-center justify-center p-1 bg-[#FF3B30] text-white rounded animate-pulse">
          <ShieldAlert size={16} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <span className="font-headline-sm text-sm font-bold tracking-tight text-white leading-tight">
            관리자 편집 모드 활성화됨
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5 md:mt-0">
            {isConfigured ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-gray-400 font-label-mono">
                  Firebase 실시간 동기화 (Firestore + Storage)
                </span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></span>
                <span className="text-[11px] text-gray-400 font-label-mono">
                  기본 모드 (전체 편집 가능 | API 비활성)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-gray-400 font-label-mono max-w-sm truncate">
          <span>* 데스크톱, 모바일, 모든 브라우저에 실시간으로 자동 연동됩니다.</span>
        </div>
        <button
          id="exit-admin-mode-btn"
          onClick={onExit}
          className="flex items-center space-x-1.5 py-1.5 px-3 rounded bg-white/10 hover:bg-[#FF3B30] hover:text-white text-xs font-semibold text-gray-300 transition-all font-title-md outline-none"
        >
          <LogOut size={13} />
          <span>편집 종료</span>
        </button>
      </div>
    </div>
  );
}
