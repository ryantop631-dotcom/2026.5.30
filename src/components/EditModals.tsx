import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { SiteContent, Experience, Certification, PortfolioItem } from '../types';
import { uploadImageToStorage } from '../firebase';

// ==========================================
// 1. EDIT SITE CONTENT MODAL
// ==========================================
interface EditSiteContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SiteContent;
  onSave: (data: SiteContent) => Promise<void>;
  isFirebaseReady: boolean;
}

export function EditSiteContentModal({ 
  isOpen, 
  onClose, 
  initialData, 
  onSave,
  isFirebaseReady 
}: EditSiteContentModalProps) {
  const [formData, setFormData] = useState<SiteContent>({ ...initialData });
  const [skillsInput, setSkillsInput] = useState<string>(initialData.skills.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorWord, setErrorWord] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleImageFile = async (file: File) => {
    if (!isFirebaseReady) {
      setErrorWord("Firebase가 구성되지 않아 파일을 업로드할 수 없습니다. 대신 텍스트로 수정해 주세요.");
      return;
    }
    setErrorWord('');
    try {
      setUploadProgress(10);
      const url = await uploadImageToStorage(file, 'banners', (progress) => {
        setUploadProgress(progress);
      });
      setFormData(prev => ({ ...prev, heroImageUrl: url }));
      setUploadProgress(null);
    } catch (err: any) {
      setErrorWord(err.message || "이미지 업로드에 실패했습니다. CORS 설정을 확인해 주세요.");
      setUploadProgress(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorWord('');
    
    // Parse skills from text input
    const skillsArray = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedData: SiteContent = {
      ...formData,
      skills: skillsArray
    };

    try {
      await onSave(updatedData);
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "오류가 발생해 수정사항을 저장할 수 없습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-[#0052FF] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 animate-scale-up">
        {/* Neon Ribbon */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0052FF] to-[#FF3B30]"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h3 className="font-headline-sm text-xl font-bold text-[#0A0A0A] mb-1">메인 소개 에디터</h3>
        <p className="text-xs text-gray-500 mb-6">메인 헤더의 텍스트와 우측 캐릭터 아트워크 이미지를 편집합니다.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorWord && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#FF3B30] flex items-center space-x-2">
              <AlertCircle size={15} />
              <span>{errorWord}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">헤더 메인 제목</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">설명 서브텍스트</label>
              <input 
                type="text" 
                value={formData.subtitle} 
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">소개 본문</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">MISSION STATEMENT (따옴표 인용구)</label>
            <input 
              type="text" 
              value={formData.missionStatement} 
              onChange={e => setFormData({ ...formData, missionStatement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              required
            />
          </div>

          <div className="border-t border-gray-100 my-4 pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Skills 섹션 문구</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">Skills 섹션 타이틀</label>
                <input 
                  type="text" 
                  value={formData.skillsTitle} 
                  onChange={e => setFormData({ ...formData, skillsTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">Skills 섹션 서브텍스트</label>
                <input 
                  type="text" 
                  value={formData.skillsSubtitle} 
                  onChange={e => setFormData({ ...formData, skillsSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">보유 기술 목록 (쉼표로 구분)</label>
              <input 
                type="text" 
                value={skillsInput} 
                onChange={e => setSkillsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                placeholder="C Coding, Micro Python, Teamwork"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-4 pt-4">
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-2">메인 캐릭터 이미지 업로드</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={formData.heroImageUrl} 
                  alt="Avatar Preview" 
                  referrerPolicy="no-referrer"
                  className="object-contain h-full w-full p-2"
                />
              </div>
              
              <div 
                className={`md:col-span-2 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-32 transition-colors cursor-pointer ${
                  dragActive ? "border-[#0052FF] bg-[#0052FF]/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInput} 
                  accept="image/*" 
                  className="hidden" 
                />
                {uploadProgress !== null ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-[#0052FF] mb-1" />
                    <span className="text-xs font-bold font-label-mono">{uploadProgress}% 업로드 중...</span>
                    <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-[#0052FF] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-1" size={24} />
                    <span className="text-xs text-gray-600 font-medium">데스크톱 파일을 끌어 놓거나 클릭해 파일 탐색</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (최대 10MB)</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-2.5">
              <label className="block text-xs text-gray-500 mb-1">또는 이미지 직접 Link 주소 입력</label>
              <input 
                type="url" 
                value={formData.heroImageUrl} 
                onChange={e => setFormData({ ...formData, heroImageUrl: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs select-all"
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="py-2 px-4 rounded border text-sm text-gray-600 hover:bg-gray-50"
              disabled={isSaving}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="py-2 px-5 rounded bg-[#0052FF] hover:bg-[#003ec7] text-white text-sm font-semibold flex items-center space-x-2"
              disabled={isSaving}
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              <span>수정 적용</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. EXPERIENCE CARD MODAL (Add/Edit)
// ==========================================
interface EditExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: Experience | null; // null represents "Add mode"
  onSave: (doc: Experience) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EditExperienceModal({
  isOpen,
  onClose,
  experience,
  onSave,
  onDelete
}: EditExperienceModalProps) {
  const isCreateMode = !experience;
  const [formData, setFormData] = useState<Experience>(
    experience || {
      id: `exp-${Date.now()}`,
      title: '',
      description: '',
      icon: 'smart_toy',
      color: 'blue',
      sortOrder: 5
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorWord, setErrorWord] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorWord('');
    try {
      await onSave({
        ...formData,
        sortOrder: Number(formData.sortOrder)
      });
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "오류가 발생해 데이터를 작성할 수 없습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!experience || !onDelete) return;
    if (!confirm('정말로 이 경험 레코드를 삭제하시겠습니까?')) return;
    
    setIsSaving(true);
    setErrorWord('');
    try {
      await onDelete(experience.id);
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "삭제하는 중 오류가 발생했습니다.");
      setIsSaving(false);
    }
  };

  const iconsSet = [
    { name: 'smart_toy', label: '로봇 (Smart Toy)' },
    { name: 'precision_manufacturing', label: '매뉴팩처링 (Mfg)' },
    { name: 'memory', label: '메모리 칩 (Memory)' },
    { name: 'engineering', label: '엔지니어링 (Eng)' },
    { name: 'build', label: '조립 (Wrench)' },
    { name: 'terminal', label: '코딩 (Terminal)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-[#0052FF] rounded-xl shadow-2xl w-full max-w-lg relative p-6 animate-scale-up">
        {/* Colorful top border matching selection */}
        <div className={`absolute top-0 inset-x-0 h-1.5 transition-all duration-300 ${
          formData.color === 'blue' ? 'bg-[#0052FF]' : formData.color === 'red' ? 'bg-[#FF3B30]' : 'bg-[#FFCC00]'
        }`}></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] mb-4">
          {isCreateMode ? "새 경험 이력 작성" : "경험 이력 세부 편집"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorWord && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#FF3B30] flex items-center space-x-2">
              <AlertCircle size={15} />
              <span>{errorWord}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">경험/행사명 (Title)</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              placeholder="예: 2026 RoboRave: SUMO"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">설명 및 세부 활동 성과 (Description)</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              placeholder="대회 성적, 사용된 조작 스킬 등을 입력합니다."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">보더 테두리 색상</label>
              <select 
                value={formData.color} 
                onChange={e => setFormData({ ...formData, color: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              >
                <option value="blue">Electric Blue (파란색)</option>
                <option value="red">Signal Red (붉은색)</option>
                <option value="yellow">Energy Yellow (노란색)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">노출 정렬 순서</label>
              <input 
                type="number" 
                value={formData.sortOrder} 
                onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-2">대표 아이콘</label>
            <div className="grid grid-cols-3 gap-2">
              {iconsSet.map(ic => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: ic.name })}
                  className={`flex flex-col items-center justify-center p-2.5 rounded border text-center transition-all ${
                    formData.icon === ic.name 
                      ? "border-[#0052FF] bg-[#0052FF]/5 text-[#0052FF] font-semibold" 
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl mb-1">{ic.name}</span>
                  <span className="text-[10px] whitespace-nowrap">{ic.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-2.5">
              <label className="block text-[11px] text-gray-500 mb-1">기타 Google Material Symbols 아이콘 키 지정</label>
              <input 
                type="text" 
                value={formData.icon} 
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                placeholder="예: memory, sports_events..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              {!isCreateMode && onDelete && (
                <button
                  id="delete-experience-record"
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold text-[#FF3B30] hover:bg-red-50 rounded transition-colors"
                  disabled={isSaving}
                >
                  <Trash2 size={13} />
                  <span>이 이력 삭제</span>
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={onClose}
                className="py-1.5 px-3.5 rounded border text-xs text-gray-600 hover:bg-gray-50"
                disabled={isSaving}
              >
                취소
              </button>
              <button 
                type="submit" 
                className="py-1.5 px-4 rounded bg-[#0052FF] hover:bg-[#003ec7] text-white text-xs font-semibold flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                <span>{isCreateMode ? "이력 작성" : "저장 적용"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. CERTIFICATION & AWARD MODAL (Add/Edit)
// ==========================================
interface EditCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: Certification | null;
  onSave: (doc: Certification) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EditCertificationModal({
  isOpen,
  onClose,
  certification,
  onSave,
  onDelete
}: EditCertificationModalProps) {
  const isCreateMode = !certification;
  const [formData, setFormData] = useState<Certification>(
    certification || {
      id: `cert-${Date.now()}`,
      title: '',
      result: '',
      icon: 'emoji_events',
      color: 'tertiary',
      sortOrder: 5
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorWord, setErrorWord] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorWord('');
    try {
      await onSave({
        ...formData,
        sortOrder: Number(formData.sortOrder)
      });
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "오류가 발생해 데이터를 작성할 수 없습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!certification || !onDelete) return;
    if (!confirm('정말로 이 수상 및 자격증 카드를 삭제하시겠습니까?')) return;
    
    setIsSaving(true);
    setErrorWord('');
    try {
      await onDelete(certification.id);
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "삭제하는 중 오류가 발생했습니다.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-[#0052FF] rounded-xl shadow-2xl w-full max-w-lg relative p-6 animate-scale-up">
        {/* Color top border */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${
          formData.color === 'tertiary' ? 'bg-[#FFCC00]' : 'bg-gray-300'
        }`}></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] mb-4">
          {isCreateMode ? "새 수상 및 인증 이력 작성" : "인증 이력 세부 편집"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorWord && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#FF3B30] flex items-center space-x-2">
              <AlertCircle size={15} />
              <span>{errorWord}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">수상 및 자격 명칭 (Award Name)</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              placeholder="예: 2026 RoboCup Singapore Open (CoSpace U12)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">상세 성적 (Result)</label>
              <input 
                type="text" 
                value={formData.result} 
                onChange={e => setFormData({ ...formData, result: e.target.value })}
                className="w-full px-3 py-2 border border-blue-100 bg-[#0052FF]/5 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm font-bold text-[#FF3B30] tracking-wide"
                placeholder="예: 2st Place, NO."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">노출 정렬 순서</label>
              <input 
                type="number" 
                value={formData.sortOrder} 
                onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">등급 테마/색상</label>
              <select 
                value={formData.color} 
                onChange={e => setFormData({ ...formData, color: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              >
                <option value="tertiary">Gold (노란색 트로피 배경)</option>
                <option value="default">Silver (회색 회로 아이콘 배경)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">대표 아이콘</label>
              <select 
                value={formData.icon} 
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              >
                <option value="emoji_events">트로피 (emoji_events)</option>
                <option value="workspace_premium">인증 마크 (workspace_premium)</option>
                <option value="military_tech">메달 (military_tech)</option>
                <option value="school">수련/아카데미 (school)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              {!isCreateMode && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold text-[#FF3B30] hover:bg-red-50 rounded transition-colors"
                  disabled={isSaving}
                >
                  <Trash2 size={13} />
                  <span>이 이력 삭제</span>
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={onClose}
                className="py-1.5 px-3.5 rounded border text-xs text-gray-600 hover:bg-gray-50"
                disabled={isSaving}
              >
                취소
              </button>
              <button 
                type="submit" 
                className="py-1.5 px-4 rounded bg-[#0052FF] hover:bg-[#003ec7] text-white text-xs font-semibold flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                <span>{isCreateMode ? "이력 추가" : "저장 적용"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. PORTFOLIO ITEM MODAL (Add/Edit)
// ==========================================
interface EditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioItem: PortfolioItem | null;
  onSave: (doc: PortfolioItem) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isFirebaseReady: boolean;
}

export function EditPortfolioModal({
  isOpen,
  onClose,
  portfolioItem,
  onSave,
  onDelete,
  isFirebaseReady
}: EditPortfolioModalProps) {
  const isCreateMode = !portfolioItem;
  const [formData, setFormData] = useState<PortfolioItem>(
    portfolioItem || {
      id: `port-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: 'https://picsum.photos/seed/cyber/600/400',
      status: 'COMPLETED',
      tags: [],
      sortOrder: 5
    }
  );
  
  const [tagsInput, setTagsInput] = useState<string>(
    portfolioItem ? portfolioItem.tags.join(', ') : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorWord, setErrorWord] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleImageFile = async (file: File) => {
    if (!isFirebaseReady) {
      setErrorWord("Firebase Storage가 연동되지 않아 이미지 파일을 업로드할 수 없습니다. 대신 이미지 주소를 직접 써 놓으세요.");
      return;
    }
    setErrorWord('');
    try {
      setUploadProgress(10);
      const url = await uploadImageToStorage(file, 'portfolio', (progress) => {
        setUploadProgress(progress);
      });
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setUploadProgress(null);
    } catch (err: any) {
      setErrorWord(err.message || "이미지 업로드에 실패했습니다. CORS 세팅이나 버킷을 검사해 주세요.");
      setUploadProgress(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorWord('');
    
    // Parse tags array
    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updatedItem: PortfolioItem = {
      ...formData,
      tags: tagsArray,
      sortOrder: Number(formData.sortOrder)
    };

    try {
      await onSave(updatedItem);
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "오류가 발생해 데이터를 저장할 수 없습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!portfolioItem || !onDelete) return;
    if (!confirm('정말로 이 포트폴리오 로봇 프로젝트를 삭제하시겠습니까?')) return;
    
    setIsSaving(true);
    setErrorWord('');
    try {
      await onDelete(portfolioItem.id);
      onClose();
    } catch (err: any) {
      setErrorWord(err.message || "삭제 실패했습니다.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-[#0052FF] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 animate-scale-up">
        {/* Header indicator */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${
          formData.status === 'COMPLETED' ? 'bg-[#0052FF]' : 'bg-[#FF3B30]'
        }`}></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h3 className="font-headline-sm text-lg font-bold text-[#0A0A0A] mb-1">
          {isCreateMode ? "새 포트폴리오 프로젝트 등록자" : "포트폴리오 카드 세부 정보 편집"}
        </h3>
        <p className="text-xs text-gray-500 mb-5">로봇 이미지, 태그 정보, 개발 진척 상태를 자연스럽게 수정합니다.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorWord && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#FF3B30] flex items-center space-x-2">
              <AlertCircle size={15} />
              <span>{errorWord}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">프로젝트 로봇 이름</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                placeholder="예: Line Tracing Robot"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">진행 성과 상태</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              >
                <option value="COMPLETED">COMPLETED (완성됨)</option>
                <option value="IN DEVELOPMENT">IN DEVELOPMENT (개발 중)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">로봇 프로젝트 설명</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
              placeholder="센서 부품, 프로그램 작동 스펙을 작성합니다."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">스킬 태그 목록 (쉼표 단위)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                placeholder="Color Sensor, Motor Control"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wider mb-1">정렬 가중치 (우선도)</label>
              <input 
                type="number" 
                value={formData.sortOrder} 
                onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] text-sm"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-4 pt-4">
            <label className="block text-xs font-bold text-gray-700 tracking-wider mb-2">대표작 로봇 그래픽 업로드</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Avatar Preview" 
                  referrerPolicy="no-referrer"
                  className="object-cover h-full w-full"
                />
              </div>
              
              <div 
                className={`md:col-span-2 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-32 transition-colors cursor-pointer ${
                  dragActive ? "border-[#0052FF] bg-[#0052FF]/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInput} 
                  accept="image/*" 
                  className="hidden" 
                />
                {uploadProgress !== null ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-[#0052FF] mb-1" />
                    <span className="text-xs font-semibold font-label-mono">{uploadProgress}% 업로드 중...</span>
                    <div className="w-24 bg-gray-200 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-[#0052FF] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-1" size={20} />
                    <span className="text-xs text-gray-600 font-medium">끌어 놓거나 클릭해 파일 탐색</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (최대 10MB)</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-2.5">
              <label className="block text-xs text-gray-500 mb-1">또는 인터넷 직접 이미지 Link URL 지정</label>
              <input 
                type="url" 
                value={formData.imageUrl} 
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs select-all"
                placeholder="https://example.com/robot.png"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              {!isCreateMode && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold text-[#FF3B30] hover:bg-red-50 rounded transition-colors"
                  disabled={isSaving}
                >
                  <Trash2 size={13} />
                  <span>이 프로젝트 전면 삭제</span>
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={onClose}
                className="py-1.5 px-3.5 rounded border text-xs text-gray-600 hover:bg-gray-50"
                disabled={isSaving}
              >
                취소
              </button>
              <button 
                type="submit" 
                className="py-1.5 px-4 rounded bg-[#0052FF] hover:bg-[#003ec7] text-white text-xs font-semibold flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                <span>{isCreateMode ? "프로젝트 등록" : "저장 적용"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
