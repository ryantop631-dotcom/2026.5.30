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
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-300"
      style={{ 
        backgroundColor: siteContent.backgroundColor || '#ffffff',
        color: siteContent.textColor || '#434656'
      }}
    >
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
        className={`fixed w-full h-20 z-40 transition-all duration-300 ease-in-out border-b border-gray-100 ${
          isAdminActive ? 'top-14' : 'top-0'
        }`}
        style={{
          backgroundColor: siteContent.backgroundColor ? `${siteContent.backgroundColor}e6` : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottomColor: siteContent.backgroundColor === '#ffffff' ? '#f3f4f6' : 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div id="nav-container" className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
          <a
            id="brand-logo" 
            href="#about"
            className="font-headline font-bold text-lg md:text-xl tracking-tighter"
            style={{ color: siteContent.titleColor || '#0052FF' }}
          >
            ROBOT CODING AREA
          </a>

          {/* Desktop Nav links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center font-headline text-sm font-semibold">
            <a href="#about" className="border-b-2 pb-1 transition-all duration-300" style={{ color: siteContent.accentColor || '#0052FF', borderBottomColor: siteContent.accentColor || '#0052FF' }}>About</a>
            <a href="#experience" className="transition-colors pb-1" style={{ color: siteContent.textColor || '#434656' }}>Experience</a>
            <a href="#skills" className="transition-colors pb-1" style={{ color: siteContent.textColor || '#434656' }}>Skills</a>
            <a href="#awards" className="transition-colors pb-1" style={{ color: siteContent.textColor || '#434656' }}>Certifications &amp; Awards</a>
            <a href="#portfolio" className="transition-colors pb-1" style={{ color: siteContent.textColor || '#434656' }}>Portfolio</a>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button 
            id="mobile-nav-toggle"
            aria-label="Toggle Menu" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden focus:outline-none p-1 rounded hover:bg-gray-50/10"
            style={{ color: siteContent.accentColor || '#0052FF' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-0 border-b border-gray-100 p-4 shadow-xl z-30 font-headline font-semibold text-sm flex flex-col space-y-4 text-center"
            style={{ backgroundColor: siteContent.backgroundColor || '#ffffff', borderBottomColor: siteContent.backgroundColor === '#ffffff' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.1)' }}
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 rounded" style={{ color: siteContent.accentColor || '#0052FF', backgroundColor: `${siteContent.accentColor || '#0052FF'}1a` }}>About</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-2 rounded" style={{ color: siteContent.textColor || '#434656' }}>Experience</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-2 rounded" style={{ color: siteContent.textColor || '#434656' }}>Skills</a>
            <a href="#awards" onClick={() => setMobileMenuOpen(false)} className="py-2 rounded" style={{ color: siteContent.textColor || '#434656' }}>Certifications &amp; Awards</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="py-2 rounded" style={{ color: siteContent.textColor || '#434656' }}>Portfolio</a>
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
                  <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-tight" style={{ color: siteContent.titleColor || '#0052FF' }}>
                    {siteContent.title}
                  </h1>
                  <h2 className="font-headline font-semibold text-lg md:text-xl" style={{ color: siteContent.textColor || '#434656', opacity: 0.9 }}>
                    {siteContent.subtitle}
                  </h2>
                  <p className="font-sans text-base md:text-lg leading-relaxed max-w-xl" style={{ color: siteContent.textColor || '#434656' }}>
                    {siteContent.description}
                  </p>
                  
                  {siteContent.missionStatement && (
                    <div id="about-mission-statement" className="p-5 border-l-4 rounded-r-lg mt-8 shadow-sm"
                      style={{ 
                        backgroundColor: siteContent.backgroundColor === '#ffffff' ? '#f8f9fa' : 'rgba(255, 255, 255, 0.05)',
                        borderLeftColor: siteContent.accentColor || '#0052FF'
                      }}
                    >
                      <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: siteContent.accentColor || '#0052FF' }}>
                        &gt; MISSION_STATEMENT
                      </p>
                      <p className="font-sans text-sm md:text-base mt-2 italic font-medium" style={{ color: siteContent.textColor || '#434656' }}>
                        "{siteContent.missionStatement}"
                      </p>
                    </div>
                  )}
                </div>

                <div id="hero-img-frame" className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 flex items-center justify-center"
                  style={{ 
                    backgroundColor: siteContent.backgroundColor === '#ffffff' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                    borderColor: siteContent.backgroundColor === '#ffffff' ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
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
            <section id="experience" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 border-t relative group"
              style={{ borderTopColor: siteContent.backgroundColor === '#ffffff' ? '#f3f4f6' : 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl mb-2 border-l-4 pl-4"
                    style={{ color: siteContent.titleColor || '#0052FF', borderLeftColor: siteContent.accentColor || '#0052FF' }}
                  >
                    Experience
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-400">
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
                    className="mt-4 md:mt-0 hover:brightness-115 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow"
                    style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}
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
                    className={`p-6 md:p-8 rounded-xl neon-border relative group/card cursor-pointer`}
                    style={{ 
                      backgroundColor: siteContent.backgroundColor === '#ffffff' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                      borderColor: item.color === 'blue' ? (siteContent.accentColor || '#0052FF') : item.color === 'red' ? '#FF3B30' : '#FFCC00',
                      color: siteContent.textColor || '#434656'
                    }}
                  >
                    {/* Admin hovering edit controls */}
                    {isAdminActive && (
                      <div className="absolute top-4 right-4 flex space-x-1.5 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => {
                            setExperienceEditTarget(item);
                            setIsExperienceModalOpen(true);
                          }}
                          className="p-1.5 text-white rounded shadow"
                          style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}
                          title="이력 수정"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-headline font-semibold text-lg leading-tight pr-6" style={{ color: siteContent.titleColor || '#0A0A0A' }}>
                        {item.title}
                      </h3>
                      {/* Font-Material icon representations */}
                      <span className={`material-symbols-outlined text-2xl`}
                        style={{ 
                          color: item.color === 'blue' ? (siteContent.accentColor || '#0052FF') : item.color === 'red' ? '#FF3B30' : '#FFCC00'
                        }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: siteContent.textColor || '#434656' }}>
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
            <section id="skills" className="text-white py-16 relative" style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}>
              <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                  <h2 className="font-headline font-bold text-3xl mb-3">
                    {siteContent.skillsTitle}
                  </h2>
                  <p className="font-headline text-base opacity-90">
                    {siteContent.skillsSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3.5 max-w-4xl mx-auto">
                  {siteContent.skills.map((skill, index) => {
                    // Cyclic tag colors from requirements colors
                    const styleSeq = index % 3;
                    const bgClass = 
                      styleSeq === 0 ? "bg-white text-[#0052FF]" : 
                      styleSeq === 1 ? "bg-[#FFCC00] text-[#0A0A0A]" : 
                      "bg-[#FF3B30] text-white";

                    return (
                      <span 
                        key={index}
                        className={`${bgClass} px-5 py-2 rounded-full font-sans text-xs font-bold shadow-md tracking-wide select-none`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CERTIFICATIONS & AWARDS SECTION */}
            <section id="awards" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl mb-2 border-l-4 pl-4"
                    style={{ color: siteContent.titleColor || '#0052FF', borderLeftColor: siteContent.accentColor || '#FF3B30' }}
                  >
                    Certifications &amp; Awards
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-400">
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
                    className="mt-4 md:mt-0 hover:brightness-115 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow"
                    style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}
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
                    className={`p-5 md:p-6 rounded-xl relative group/cert flex items-center justify-between shadow-sm border-2`}
                    style={{ 
                      backgroundColor: siteContent.backgroundColor === '#ffffff' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                      borderColor: cert.color === 'tertiary' ? '#FFCC00' : (siteContent.backgroundColor === '#ffffff' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.1)'),
                      color: siteContent.textColor || '#434656'
                    }}
                  >
                    <div className="flex items-center space-x-4 pr-10">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0`}
                        style={{ 
                          backgroundColor: cert.color === 'tertiary' ? '#FFCC00' : 'rgba(120, 120, 120, 0.1)',
                          color: cert.color === 'tertiary' ? '#0A0A0A' : (siteContent.accentColor || '#0052FF')
                        }}
                      >
                        <span className="material-symbols-outlined text-xl">{cert.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-sm md:text-base leading-tight" style={{ color: siteContent.titleColor || '#0A0A0A' }}>
                          {cert.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`font-headline font-black text-base md:text-lg leading-none`}
                        style={{ 
                          color: cert.color === 'tertiary' ? '#FF3B30' : (siteContent.textColor || '#434656')
                        }}
                      >
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
                            className="p-1.5 text-white rounded shadow"
                            style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}
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
            <section id="portfolio" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 relative group"
              style={{ borderTopColor: siteContent.backgroundColor === '#ffffff' ? '#f3f4f6' : 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl mb-2 border-l-4 pl-4"
                    style={{ color: siteContent.titleColor || '#0052FF', borderLeftColor: siteContent.accentColor || '#0052FF' }}
                  >
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
                    className="mt-4 md:mt-0 hover:brightness-115 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow"
                    style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}
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
                    className={`rounded-xl overflow-hidden neon-border group/card flex flex-col h-full border-2 relative`}
                    style={{ 
                      backgroundColor: siteContent.backgroundColor === '#ffffff' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                      borderColor: item.status === 'COMPLETED' ? (siteContent.accentColor || '#0052FF') : '#FF3B30',
                      color: siteContent.textColor || '#434656'
                    }}
                  >
                    {/* Admin edit trigger */}
                    {isAdminActive && (
                      <div className="absolute top-4 right-4 flex space-x-1.5 z-10">
                        <button
                          onClick={() => {
                            setPortfolioEditTarget(item);
                            setIsPortfolioModalOpen(true);
                          }}
                          className="p-1.5 text-white rounded shadow"
                          style={{ backgroundColor: siteContent.accentColor || '#0052FF' }}
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: item.status === 'COMPLETED' ? (siteContent.accentColor || '#0052FF') : '#FF3B30' }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-base md:text-lg mb-2" style={{ color: siteContent.titleColor || '#0A0A0A' }}>
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs md:text-sm mb-4 flex-grow leading-relaxed" style={{ color: siteContent.textColor || '#434656' }}>
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {item.tags.map((tag, tIndex) => (
                          <span 
                            key={tIndex}
                            className="px-2 py-0.5 rounded text-[9px] font-mono"
                            style={{ 
                              backgroundColor: siteContent.backgroundColor === '#ffffff' ? '#f9fafb' : 'rgba(255, 255, 255, 0.1)',
                              borderColor: siteContent.backgroundColor === '#ffffff' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.15)',
                              borderWidth: '1px',
                              color: siteContent.textColor || '#434656'
                            }}
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
