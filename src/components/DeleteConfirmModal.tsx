import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export interface DeleteTargetInfo {
  type: 'experience' | 'certification' | 'portfolio';
  id: string;
  title: string;
  subtitle?: string;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  target: DeleteTargetInfo | null;
  onClose: () => void;
  onConfirm: (target: DeleteTargetInfo) => Promise<void> | void;
  lang?: 'ko' | 'en';
}

export default function DeleteConfirmModal({
  isOpen,
  target,
  onClose,
  onConfirm,
  lang = 'ko'
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle ESC key to dismiss safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isDeleting) return;
      if (e.key === 'Escape') {
        soundEngine.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !target) return null;

  const typeLabels: Record<DeleteTargetInfo['type'], { ko: string; en: string }> = {
    experience: { ko: '경험 이력', en: 'Experience Record' },
    certification: { ko: '수상 및 인증 기록', en: 'Award & Certification' },
    portfolio: { ko: '포트폴리오 프로젝트', en: 'Portfolio Project' }
  };

  const currentTypeLabel = typeLabels[target.type]?.[lang] || (lang === 'ko' ? '항목' : 'Item');

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await onConfirm(target);
      soundEngine.playTrash();
      onClose();
    } catch (err: any) {
      soundEngine.playError();
      setErrorMessage(
        err.message || 
        (lang === 'ko' ? '삭제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.' : 'An error occurred while deleting. Please try again.')
      );
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (isDeleting) return;
    soundEngine.playClick();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
    >
      <div 
        className="bg-white dark:bg-[#111726] border-2 border-red-500/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />

        {/* Close Icon Button */}
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          aria-label={lang === 'ko' ? '닫기' : 'Close'}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 md:p-7 space-y-5">
          {/* Header Icon + Title */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
              <AlertTriangle size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md inline-block mb-1">
                {lang === 'ko' ? '삭제 확인 필요' : 'Deletion Confirmation'}
              </span>
              <h3 
                id="delete-confirm-title"
                className="text-lg md:text-xl font-bold font-headline text-gray-900 dark:text-white"
              >
                {lang === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?'}
              </h3>
            </div>
          </div>

          {/* Target Item Card */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0D1527] border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500 dark:text-gray-400">
                {lang === 'ko' ? '삭제 대상 구분' : 'Target Type'}
              </span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400 px-2 py-0.5 bg-red-50 dark:bg-red-950/50 rounded border border-red-100 dark:border-red-900/50 text-[11px]">
                {currentTypeLabel}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 block mb-0.5">
                {lang === 'ko' ? '항목 이름' : 'Item Title'}
              </span>
              <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white break-words">
                "{target.title || (lang === 'ko' ? '(이름 없음)' : '(Untitled)')}"
              </p>
              {target.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {target.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-200 flex items-start space-x-2.5">
            <span className="text-base leading-none">⚠️</span>
            <p className="leading-relaxed">
              {lang === 'ko'
                ? '실수로 삭제하는 것을 방지하기 위해 한 번 더 확인합니다. 삭제된 데이터는 복구할 수 없습니다.'
                : 'To prevent accidental deletion, please confirm. Once deleted, this item cannot be recovered.'}
            </p>
          </div>

          {/* Error Message if deletion fails */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isDeleting}
              className="py-2.5 px-5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs md:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {lang === 'ko' ? '취소 (돌아가기)' : 'Cancel'}
            </button>
            <button
              type="button"
              id="confirm-permanent-delete-btn"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs md:text-sm font-bold shadow-md shadow-red-500/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{lang === 'ko' ? '삭제하는 중...' : 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>{lang === 'ko' ? '확인 및 삭제' : 'Yes, Delete'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
