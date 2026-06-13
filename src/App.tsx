/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trophy, 
  Cpu, 
  ExternalLink,
  Github,
  Linkedin,
  FileText,
  Clock,
  ChevronRight,
  Menu,
  X,
  Loader2
} from 'lucide-react';

import { SiteContent, Experience, Certification, PortfolioItem } from './types';
import { 
  defaultSiteContent, 
  defaultExperiences, 
  defaultCertifications, 
  defaultPortfolioItems 
} from './data';

import { 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType 
} from './firebase';

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

import AdminBar from './components/AdminBar';
import PasswordModal from './components/PasswordModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { 
  EditSiteContentModal, 
  EditExperienceModal, 
  EditCertificationModal, 
  EditPortfolioModal 
} from './components/EditModals';

const getSkillDescription = (skill: string): string => {
  const s = skill.toLowerCase().trim();
  if (s.includes('c coding') || s === 'c') {
    return "C 언어로 아두이노 센서들을 구동하고 로봇 내부 지능을 구현하는 기술";
  }
  if (s.includes('micro python') || s.includes('micropython') || s.includes('python')) {
    return "마이크로파이썬을 사용해 스마트 하드웨어 및 보드를 세밀하게 제어하는 기술";
  }
  if (s.includes('block') || s.includes('블록')) {
    return "스크래치나 엔트리 같은 도구로 직관적인 컴포넌트 알고리즘을 짜는 논리 기술";
  }
  if (s.includes('building') || s.includes('제작') || s.includes('조립')) {
    return "다양한 프레임, 모터, 센서 브래킷을 완전한 구동 형태로 튼튼히 설계하는 조립 기술";
  }
  if (s.includes('problem solving') || s.includes('문제 해결') || s.includes('디버깅')) {
    return "로봇 구동 실패나 예외적 오작동의 근본 원인을 끝까지 추적해 수정해 내는 인내심";
  }
  if (s.includes('teamwork') || s.includes('협동') || s.includes('팀워크')) {
    return "대회나 로봇 팀 프로젝트에서 동료들과 조화를 이루고 문제를 함께 상의해 해결하는 태도";
  }
  if (s.includes('ppt') || s.includes('발표') || s.includes('presentation')) {
    return "우리가 개발한 설계 방식과 성과를 남들에게 간결하고 핵심적으로 보여주는 전달 능력";
  }
  if (s.includes('instruction') || s.includes('가이드') || s.includes('설명서')) {
    return "누구든 쉽게 똑같이 작동하는 로봇을 제작할 수 있게 매뉴얼과 조립법을 구조화하는 역량";
  }
  return `${skill} 역량을 통해 로봇 완성도를 조율하고 프로젝트의 성패를 주도적으로 돌파해 나갑니다.`;
};

export default function App() {
  // Administrative state
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Data States
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal Editing targets
  const [editingSiteContent, setEditingSiteContent] = useState<boolean>(false);
  const [experienceEditTarget, setExperienceEditTarget] = useState<Experience | null>(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState<boolean>(false);
  const [certificationEditTarget, setCertificationEditTarget] = useState<Certification | null>(null);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState<boolean>(false);
  const [portfolioEditTarget, setPortfolioEditTarget] = useState<PortfolioItem | null>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState<boolean>(false);

  // Maintain admin login status on session refreshes
  useEffect(() => {
    const isSaved = sessionStorage.getItem('admin_active') === 'true';
    if (isSaved) {
      setIsAdminActive(true);
    }
  }, []);

  // -------------------------------------------------------------
  // FIREBASE REAL-TIME SYNC ENGINE OR FALLBACK STATE MANAGEMENT
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      // Firebase not active: load standard mock records initially
      setExperiences(defaultExperiences);
      setCertifications(defaultCertifications);
      setPortfolioItems(defaultPortfolioItems);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let isSiteChecked = false;
    let isExpChecked = false;
    let isCertChecked = false;
    let isPortChecked = false;

    // Helper: Verify data loading states
    const checkCompleted = () => {
      if (isSiteChecked && isExpChecked && isCertChecked && isPortChecked) {
        setIsLoading(false);
      }
    };

    // 1. Subscribe to SiteContent doc
    const unsubSite = onSnapshot(doc(db, 'siteContent', 'main'), (snap) => {
      if (snap.exists()) {
        setSiteContent(snap.data() as SiteContent);
      } else {
        // Doc empty: fallback to local and trigger seed if needed
        setSiteContent(defaultSiteContent);
        // Autoseed in the background
        setDoc(doc(db, 'siteContent', 'main'), defaultSiteContent).catch(e => console.warn("Seeding doc error:", e));
      }
      isSiteChecked = true;
      checkCompleted();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'siteContent/main');
      isSiteChecked = true;
      checkCompleted();
    });

    // 2. Subscribe to experiences collection
    const unsubExperiences = onSnapshot(collection(db, 'experiences'), (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => d.data() as Experience);
        items.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
        setExperiences(items);
      } else {
        // Collection empty: seed default items & show local fallback
        setExperiences(defaultExperiences);
        defaultExperiences.forEach(item => {
          setDoc(doc(db, 'experiences', item.id), item).catch(e => console.warn(e));
        });
      }
      isExpChecked = true;
      checkCompleted();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'experiences');
      isExpChecked = true;
      checkCompleted();
    });

    // 3. Subscribe to certifications collection
    const unsubCertifications = onSnapshot(collection(db, 'certifications'), (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => d.data() as Certification);
        items.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
        setCertifications(items);
      } else {
        setCertifications(defaultCertifications);
        defaultCertifications.forEach(item => {
          setDoc(doc(db, 'certifications', item.id), item).catch(e => console.warn(e));
        });
      }
      isCertChecked = true;
      checkCompleted();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'certifications');
      isCertChecked = true;
      checkCompleted();
    });

    // 4. Subscribe to portfolio collection
    const unsubPortfolio = onSnapshot(collection(db, 'portfolio'), (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => d.data() as PortfolioItem);
        items.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
        setPortfolioItems(items);
      } else {
        setPortfolioItems(defaultPortfolioItems);
        defaultPortfolioItems.forEach(item => {
          setDoc(doc(db, 'portfolio', item.id), item).catch(e => console.warn(e));
        });
      }
      isPortChecked = true;
      checkCompleted();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'portfolio');
      isPortChecked = true;
      checkCompleted();
    });

    return () => {
      unsubSite();
      unsubExperiences();
      unsubCertifications();
      unsubPortfolio();
    };
  }, []);

  // -------------------------------------------------------------
  // PERSISTENCE ACTIONS (Hybrid Firebase + Local State fallbacks)
  // -------------------------------------------------------------

  // Custom Site Content write-back
  const handleSaveSiteContent = async (updated: SiteContent) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'siteContent', 'main'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteContent/main');
      }
    } else {
      // Local state fallback
      setSiteContent(updated);
    }
  };

  // Experience Writes & Deletes
  const handleSaveExperience = async (item: Experience) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'experiences', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `experiences/${item.id}`);
      }
    } else {
      // Offline local editor manipulation
      setExperiences(prev => {
        const idx = prev.findIndex(x => x.id === item.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = item;
          return next.sort((a, b) => a.sortOrder - b.sortOrder);
        } else {
          return [...prev, item].sort((a, b) => a.sortOrder - b.sortOrder);
        }
      });
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'experiences', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `experiences/${id}`);
      }
    } else {
      setExperiences(prev => prev.filter(x => x.id !== id));
    }
  };

  // Certification Writes & Deletes
  const handleSaveCertification = async (item: Certification) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'certifications', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `certifications/${item.id}`);
      }
    } else {
      setCertifications(prev => {
        const idx = prev.findIndex(x => x.id === item.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = item;
          return next.sort((a, b) => a.sortOrder - b.sortOrder);
        } else {
          return [...prev, item].sort((a, b) => a.sortOrder - b.sortOrder);
        }
      });
    }
  };

  const handleDeleteCertification = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'certifications', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `certifications/${id}`);
      }
    } else {
      setCertifications(prev => prev.filter(x => x.id !== id));
    }
  };

  // Portfolio Writes & Deletes
  const handleSavePortfolioItem = async (item: PortfolioItem) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'portfolio', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `portfolio/${item.id}`);
      }
    } else {
      setPortfolioItems(prev => {
        const idx = prev.findIndex(x => x.id === item.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = item;
          return next.sort((a, b) => a.sortOrder - b.sortOrder);
        } else {
          return [...prev, item].sort((a, b) => a.sortOrder - b.sortOrder);
        }
      });
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'portfolio', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `portfolio/${id}`);
      }
    } else {
      setPortfolioItems(prev => prev.filter(x => x.id !== id));
    }
  };

  const exitAdminMode = () => {
    setIsAdminActive(false);
    sessionStorage.removeItem('admin_active');
  };

  const enterAdminMode = () => {
    setIsAdminActive(true);
    sessionStorage.setItem('admin_active', 'true');
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-[#434656]">
      {/* 🛠️ Main Admin Notification Bar */}
      {isAdminActive && (
        <AdminBar 
          isConfigured={isFirebaseConfigured} 
          onExit={exitAdminMode} 
          onChangePassword={() => setIsChangePasswordModalOpen(true)}
        />
      )}

      {/* FIXED TOP NAVIGATION BAR */}
      <nav 
        id="top-nav-bar"
        className={`fixed w-full h-20 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ease-in-out ${
          isAdminActive ? 'top-14' : 'top-0'
        }`}
      >
        <div id="nav-container" className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
          <a
            id="brand-logo" 
            href="#about"
            className="font-headline font-bold text-lg md:text-xl tracking-tighter text-[#0052FF]"
          >
            ROBOT CODING AREA
          </a>

          {/* Desktop Nav links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center font-headline text-sm font-semibold">
            <a href="#about" className="text-[#0052FF] border-b-2 border-[#0052FF] pb-1 transition-all duration-300">About</a>
            <a href="#experience" className="text-gray-500 hover:text-[#0052FF] transition-colors pb-1">Experience</a>
            <a href="#skills" className="text-gray-500 hover:text-[#0052FF] transition-colors pb-1">Skills</a>
            <a href="#awards" className="text-gray-500 hover:text-[#0052FF] transition-colors pb-1">Certifications &amp; Awards</a>
            <a href="#portfolio" className="text-gray-500 hover:text-[#0052FF] transition-colors pb-1">Portfolio</a>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button 
            id="mobile-nav-toggle"
            aria-label="Toggle Menu" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#0052FF] focus:outline-none p-1 rounded hover:bg-gray-50"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-0 bg-white border-b border-gray-100 p-4 shadow-xl z-30 font-headline font-semibold text-sm flex flex-col space-y-4 text-center">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#0052FF] bg-[#0052FF]/5 rounded">About</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 hover:text-[#0052FF] hover:bg-gray-50 rounded">Experience</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 hover:text-[#0052FF] hover:bg-gray-50 rounded">Skills</a>
            <a href="#awards" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 hover:text-[#0052FF] hover:bg-gray-50 rounded">Certifications &amp; Awards</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 hover:text-[#0052FF] hover:bg-gray-50 rounded">Portfolio</a>
          </div>
        )}
      </nav>

      {/* MAIN LAYOUT */}
      <main className={`flex-grow transition-all duration-300 ${isAdminActive ? 'pt-34' : 'pt-20'}`}>
        {isLoading ? (
          <div id="loading-spinner-state" className="flex flex-col items-center justify-center py-40 text-center">
            <Loader2 size={48} className="animate-spin text-[#0052FF] mb-4" />
            <p className="text-sm font-semibold tracking-wider font-headline text-gray-500 uppercase">포트폴리오 연동 정보 확인 중입니다...</p>
          </div>
        ) : (
          <>
            {/* ABOUT / HERO SECTION */}
            <section id="about" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 md:py-24 relative group">
              {/* Admin overlay edit button */}
              {isAdminActive && (
                <button
                  id="edit-about-section-btn"
                  onClick={() => setEditingSiteContent(true)}
                  className="absolute top-4 right-4 md:right-8 bg-[#0052FF] text-white p-2.5 rounded-full hover:bg-blue-700 shadow-lg flex items-center space-x-1.5 text-xs font-semibold z-10 transition-transform hover:scale-105"
                >
                  <Edit2 size={13} />
                  <span>소개 편집</span>
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="space-y-6">
                  <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl text-[#0052FF] tracking-tighter leading-tight">
                    {siteContent.title}
                  </h1>
                  <h2 className="font-headline font-semibold text-lg md:text-xl text-[#434656]">
                    {siteContent.subtitle}
                  </h2>
                  <p className="font-sans text-base md:text-lg text-[#434656] leading-relaxed max-w-xl">
                    {siteContent.description}
                  </p>
                  
                  {siteContent.missionStatement && (
                    <div id="about-mission-statement" className="p-5 bg-[#f8f9fa] border-l-4 border-[#0052FF] rounded-r-lg mt-8 shadow-sm">
                      <p className="font-mono text-xs text-[#0052FF] font-bold uppercase tracking-widest">
                        &gt; MISSION_STATEMENT
                      </p>
                      <p className="font-sans text-sm md:text-base text-[#434656] mt-2 italic font-medium">
                        "{siteContent.missionStatement}"
                      </p>
                    </div>
                  )}
                </div>

                <div id="hero-img-frame" className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white flex items-center justify-center">
                  <img 
                    src={siteContent.heroImageUrl} 
                    alt="Kim Ju-won Hero Artwork Logo" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-4 max-h-[95%]"
                  />
                </div>
              </div>
            </section>

            {/* EXPERIENCE SECTION */}
            <section id="experience" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 border-t border-gray-100 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#0052FF] mb-2 border-l-4 border-[#0052FF] pl-4">
                    Experience
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-500">
                    로봇 수업과 프로젝트를 통해 경험한 활동들을 정리했습니다.
                  </p>
                </div>

                {isAdminActive && (
                  <button
                    id="add-experience-section-btn"
                    onClick={() => {
                      setExperienceEditTarget(null);
                      setIsExperienceModalOpen(true);
                    }}
                    className="mt-4 md:mt-0 bg-[#0052FF] hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow"
                  >
                    <Plus size={13} />
                    <span>경험 이력 등록</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experiences.map(item => (
                  <div 
                    key={item.id}
                    className={`bg-white p-6 md:p-8 rounded-xl neon-border border-${item.color} relative group/card cursor-pointer`}
                  >
                    {/* Admin hovering edit controls */}
                    {isAdminActive && (
                      <div className="absolute top-4 right-4 flex space-x-1.5 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => {
                            setExperienceEditTarget(item);
                            setIsExperienceModalOpen(true);
                          }}
                          className="p-1.5 bg-[#0052FF] text-white rounded hover:bg-blue-700 shadow"
                          title="이력 수정"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-headline font-semibold text-lg text-[#0A0A0A] leading-tight pr-6">
                        {item.title}
                      </h3>
                      {/* Font-Material icon representations */}
                      <span className={`material-symbols-outlined text-2xl ${
                        item.color === 'blue' ? 'text-[#0052FF]' : item.color === 'red' ? 'text-[#FF3B30]' : 'text-[#FFCC00]'
                      }`}>
                        {item.icon}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-[#434656] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}

                {experiences.length === 0 && (
                  <div className="col-span-2 text-center py-10 bg-gray-50 border border-dashed rounded text-[#434656] text-xs">
                    등록된 경험 이력이 없습니다.
                  </div>
                )}
              </div>
            </section>

            {/* SKILLS SECTION */}
            <section id="skills" className="bg-[#0052FF] text-white py-16 relative">
              <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                  <h2 className="font-headline font-bold text-3xl mb-3">
                    {siteContent.skillsTitle}
                  </h2>
                  <p className="font-headline text-base opacity-90">
                    {siteContent.skillsSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {siteContent.skills.map((skill, index) => {
                    // Cyclic tag colors from requirements colors
                    const styleSeq = index % 3;
                    const bgClass = 
                      styleSeq === 0 ? "bg-white text-[#0052FF]" : 
                      styleSeq === 1 ? "bg-[#FFCC00] text-[#0A0A0A]" : 
                      "bg-[#FF3B30] text-white";

                    return (
                      <div 
                        key={index}
                        className="flex flex-col items-center p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-center shadow-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/25"
                      >
                        {/* 동그라미 (Circle / Pill Badge) */}
                        <div className="mb-3">
                          <span 
                            className={`${bgClass} px-5 py-2 rounded-full font-sans text-xs font-bold shadow-md tracking-wide select-none inline-block`}
                          >
                            {skill}
                          </span>
                        </div>
                        {/* 하얀 글씨로 쓰인 설명 */}
                        <p className="text-white/85 text-xs font-medium leading-relaxed font-sans max-w-[200px]">
                          {getSkillDescription(skill)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CERTIFICATIONS & AWARDS SECTION */}
            <section id="awards" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#0052FF] mb-2 border-l-4 border-[#FF3B30] pl-4">
                    Certifications &amp; Awards
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-500">
                    제 손으로 만든 로봇이 세상 밖으로 나가 인정받은 발자국들입니다.
                  </p>
                </div>

                {isAdminActive && (
                  <button
                    id="add-certification-section-btn"
                    onClick={() => {
                      setCertificationEditTarget(null);
                      setIsCertificationModalOpen(true);
                    }}
                    className="mt-4 md:mt-0 bg-[#0052FF] hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow"
                  >
                    <Plus size={13} />
                    <span>수상/이력 필터 추가</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {certifications.map(cert => (
                  <div 
                    key={cert.id}
                    className={`bg-white p-5 md:p-6 rounded-xl relative group/cert flex items-center justify-between shadow-sm border-2 ${
                      cert.color === 'tertiary' ? 'border-[#FFCC00]' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4 pr-10">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                        cert.color === 'tertiary' ? 'bg-[#FFCC00] text-[#0A0A0A]' : 'bg-gray-100 text-[#0052FF]'
                      }`}>
                        <span className="material-symbols-outlined text-xl">{cert.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-sm md:text-base text-[#0A0A0A] leading-tight">
                          {cert.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`font-headline font-black text-base md:text-lg leading-none ${
                        cert.color === 'tertiary' ? 'text-[#FF3B30]' : 'text-gray-500'
                      }`}>
                        {cert.result}
                      </span>
                      
                      {/* Admin hover modifier elements */}
                      {isAdminActive && (
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              setCertificationEditTarget(cert);
                              setIsCertificationModalOpen(true);
                            }}
                            className="p-1.5 bg-[#0052FF] text-white rounded hover:bg-blue-700 shadow"
                            title="수상 이력 수정"
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PORTFOLIO SECTION */}
            <section id="portfolio" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 border-t border-gray-100 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#0052FF] mb-2 border-l-4 border-[#0052FF] pl-4">
                    Portfolio
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-400">
                    내 손으로 빚어낸 로봇과, 이를 움직이는 소프트웨어 코드들을 모았습니다.
                  </p>
                </div>

                {isAdminActive && (
                  <button
                    id="add-portfolio-section-btn"
                    onClick={() => {
                      setPortfolioEditTarget(null);
                      setIsPortfolioModalOpen(true);
                    }}
                    className="mt-4 md:mt-0 bg-[#0052FF] hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow"
                  >
                    <Plus size={13} />
                    <span>포트폴리오 등록</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map(item => (
                  <div 
                    key={item.id}
                    className={`bg-white rounded-xl overflow-hidden neon-border group/card flex flex-col h-full border-2 relative ${
                      item.status === 'COMPLETED' ? 'border-[#0052FF]' : 'border-[#FF3B30]'
                    }`}
                  >
                    {/* Admin edit trigger */}
                    {isAdminActive && (
                      <div className="absolute top-4 right-4 flex space-x-1.5 z-10">
                        <button
                          onClick={() => {
                            setPortfolioEditTarget(item);
                            setIsPortfolioModalOpen(true);
                          }}
                          className="p-1.5 bg-[#0052FF] hover:bg-blue-700 text-white rounded shadow"
                          title="포트폴리오 수정"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}

                    <div className="h-48 relative overflow-hidden bg-gray-50">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${
                          item.status === 'COMPLETED' ? 'bg-[#0052FF]' : 'bg-[#FF3B30]'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-base md:text-lg text-[#0A0A0A] mb-2">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs md:text-sm text-[#434656] mb-4 flex-grow leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {item.tags.map((tag, tIndex) => (
                          <span 
                            key={tIndex}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-gray-50 border border-gray-200 text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer id="app-footer" className="bg-white w-full py-10 mt-auto border-t border-gray-100">
        <div id="footer-container" className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto gap-4">
          <div className="font-headline text-xs text-gray-400 font-semibold tracking-wider text-center md:text-left">
            © 2026 My Robot Portfolio. All rights reserved.
          </div>
          <div className="flex gap-6 font-headline font-bold text-xs">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0052FF] transition-colors flex items-center gap-1">
              <Github size={13} />
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF3B30] transition-colors flex items-center gap-1">
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FFCC00] hover:text-black transition-colors flex items-center gap-1">
              <FileText size={13} />
              <span>Documentation</span>
            </a>
          </div>
        </div>
      </footer>

      {/* FLOATING ADMIN SETTINGS LOGIN ICON */}
      <button 
        id="admin-login-floating-trigger"
        onClick={() => {
          if (isAdminActive) {
            exitAdminMode();
          } else {
            setIsPasswordModalOpen(true);
          }
        }}
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-center p-3 hover:scale-105 transition-all shadow-xl rounded-full cursor-pointer border-2 outline-none ${
          isAdminActive 
            ? 'bg-[#FF3B30] text-white border-[#FF3B30]' 
            : 'bg-white text-[#0052FF] border-[#0052FF] hover:bg-gray-50 shadow-[#0052FF]/10'
        }`}
        title={isAdminActive ? "편집 모드 종료" : "관리자 시스템 설정"}
      >
        <Settings size={22} className={isAdminActive ? '' : 'animate-spin-[duration:10s]'} />
      </button>

      {/* ADMIN SUB-COMPONENT MODALS */}
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSuccess={enterAdminMode} 
      />

      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <EditSiteContentModal 
        isOpen={editingSiteContent}
        onClose={() => setEditingSiteContent(false)}
        initialData={siteContent}
        onSave={handleSaveSiteContent}
        isFirebaseReady={isFirebaseConfigured}
      />

      <EditExperienceModal 
        isOpen={isExperienceModalOpen}
        onClose={() => {
          setIsExperienceModalOpen(false);
          setExperienceEditTarget(null);
        }}
        experience={experienceEditTarget}
        onSave={handleSaveExperience}
        onDelete={handleDeleteExperience}
      />

      <EditCertificationModal 
        isOpen={isCertificationModalOpen}
        onClose={() => {
          setIsCertificationModalOpen(false);
          setCertificationEditTarget(null);
        }}
        certification={certificationEditTarget}
        onSave={handleSaveCertification}
        onDelete={handleDeleteCertification}
      />

      <EditPortfolioModal 
        isOpen={isPortfolioModalOpen}
        onClose={() => {
          setIsPortfolioModalOpen(false);
          setPortfolioEditTarget(null);
        }}
        portfolioItem={portfolioEditTarget}
        onSave={handleSavePortfolioItem}
        onDelete={handleDeletePortfolioItem}
        isFirebaseReady={isFirebaseConfigured}
      />
    </div>
  );
}
