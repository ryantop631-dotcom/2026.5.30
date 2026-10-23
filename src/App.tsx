/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Github, 
  Linkedin, 
  FileText, 
  Menu, 
  X, 
  Loader2,
  Sun,
  Moon,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  Music,
  Lock,
  Trash2
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
  deleteDoc 
} from 'firebase/firestore';

import AdminBar from './components/AdminBar';
import AdminPage from './components/AdminPage';
import PasswordModal from './components/PasswordModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import EasterEggModal from './components/EasterEggModal';
import DeleteConfirmModal, { DeleteTargetInfo } from './components/DeleteConfirmModal';
import { PortfolioBgmPlayer } from './components/PortfolioBgmPlayer';
import { 
  EditSiteContentModal, 
  EditExperienceModal, 
  EditCertificationModal, 
  EditPortfolioModal 
} from './components/EditModals';

import { soundEngine } from './utils/audio';
import { Language, translations } from './translations';
import { translateTextToEnglish, translateTag } from './utils/translator';

export default function App() {
  // -------------------------------------------------------------
  // THEME STATE (Dark / Light Mode)
  // -------------------------------------------------------------
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // -------------------------------------------------------------
  // LANGUAGE STATE (Korean / English)
  // -------------------------------------------------------------
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'ko' || saved === 'en') return saved;
    return 'ko';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'ko' ? 'en' : 'ko'));
  };

  const t = translations[lang];

  // -------------------------------------------------------------
  // BACKGROUND MUSIC (BGM)
  // -------------------------------------------------------------
  const [isBgmActive, setIsBgmActive] = useState<boolean>(false);

  const handleToggleBgm = () => {
    const isNowPlaying = soundEngine.toggleBackgroundMusic();
    setIsBgmActive(isNowPlaying);
  };

  // -------------------------------------------------------------
  // EASTER EGG (Press '1' 5 times for robot sound effect)
  // -------------------------------------------------------------
  const [easterEggCount, setEasterEggCount] = useState<number>(0);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const lastPressTimeRef = useRef<number>(0);
  const resetTimerRef = useRef<number | null>(null);

  const handleEasterEggPress = () => {
    const now = Date.now();
    const diff = now - lastPressTimeRef.current;
    lastPressTimeRef.current = now;

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    setEasterEggCount(prev => {
      const next = diff > 3000 ? 1 : prev + 1;
      if (next >= 5) {
        soundEngine.playRobotFanfare();
        setIsEasterEggOpen(true);
        return 0;
      } else {
        soundEngine.playKeyTick(next);
        return next;
      }
    });

    resetTimerRef.current = window.setTimeout(() => {
      setEasterEggCount(0);
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively writing in inputs/textareas
      const activeEl = document.activeElement;
      const isFormEl = 
        activeEl instanceof HTMLInputElement || 
        activeEl instanceof HTMLTextAreaElement || 
        activeEl?.getAttribute('contenteditable') === 'true';

      if (isFormEl) return;

      if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
        handleEasterEggPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // ADMINISTRATIVE STATE
  // -------------------------------------------------------------
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
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetInfo | null>(null);

  // -------------------------------------------------------------
  // ROUTING & ADMIN VIEW STATE (/ and /admin)
  // -------------------------------------------------------------
  const [adminViewMode, setAdminViewMode] = useState<'inline' | 'dashboard'>('dashboard');

  const checkIsAdminPath = (): boolean => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const h = window.location.hash.toLowerCase();
    const s = new URLSearchParams(window.location.search);
    return (
      p === '/admin' || 
      p.endsWith('/admin') || 
      h === '#/admin' || 
      h === '#admin' || 
      s.get('page') === 'admin' || 
      s.get('view') === 'admin' ||
      s.get('admin') === 'true'
    );
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return checkIsAdminPath() ? '/admin' : '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(checkIsAdminPath() ? '/admin' : '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    try {
      window.history.pushState(null, '', path);
    } catch {
      window.location.hash = path;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Maintain admin login status on session refreshes
  useEffect(() => {
    const isSaved = sessionStorage.getItem('admin_active') === 'true' || localStorage.getItem('admin_active') === 'true';
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
        setSiteContent(defaultSiteContent);
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
        const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Experience));
        items.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
        setExperiences(items);
      } else {
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
        const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Certification));
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
        const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as PortfolioItem));
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
  // DATA ACTIONS
  // -------------------------------------------------------------
  const handleSaveSiteContent = async (newContent: SiteContent) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'siteContent', 'main'), newContent);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteContent/main');
      }
    } else {
      setSiteContent(newContent);
    }
  };

  const handleSaveExperience = async (item: Experience) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'experiences', item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `experiences/${item.id}`);
      }
    } else {
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

  // -------------------------------------------------------------
  // SAFETY CONFIRMATION HANDLERS (Accidental Deletion Prevention)
  // -------------------------------------------------------------
  const requestDeleteExperience = async (id: string): Promise<void> => {
    const target = experiences.find(e => e.id === id);
    setDeleteTarget({
      type: 'experience',
      id,
      title: target?.title || (lang === 'ko' ? '경험 이력 항목' : 'Experience Record'),
      subtitle: target?.description
    });
  };

  const requestDeleteCertification = async (id: string): Promise<void> => {
    const target = certifications.find(c => c.id === id);
    setDeleteTarget({
      type: 'certification',
      id,
      title: target?.title || (lang === 'ko' ? '수상 및 인증 기록' : 'Award / Certification'),
      subtitle: target?.result
    });
  };

  const requestDeletePortfolioItem = async (id: string): Promise<void> => {
    const target = portfolioItems.find(p => p.id === id);
    setDeleteTarget({
      type: 'portfolio',
      id,
      title: target?.title || (lang === 'ko' ? '포트폴리오 프로젝트' : 'Portfolio Project'),
      subtitle: target?.status
    });
  };

  const handleExecuteDelete = async (target: DeleteTargetInfo) => {
    if (target.type === 'experience') {
      await handleDeleteExperience(target.id);
      setIsExperienceModalOpen(false);
      setExperienceEditTarget(null);
    } else if (target.type === 'certification') {
      await handleDeleteCertification(target.id);
      setIsCertificationModalOpen(false);
      setCertificationEditTarget(null);
    } else if (target.type === 'portfolio') {
      await handleDeletePortfolioItem(target.id);
      setIsPortfolioModalOpen(false);
      setPortfolioEditTarget(null);
    }
  };

  const exitAdminMode = () => {
    setIsAdminActive(false);
    sessionStorage.removeItem('admin_active');
    localStorage.removeItem('admin_active');
    soundEngine.playTrash();
  };

  const enterAdminMode = () => {
    setIsAdminActive(true);
    setAdminViewMode('inline');
    sessionStorage.setItem('admin_active', 'true');
    localStorage.setItem('admin_active', 'true');
    setIsPasswordModalOpen(false);
    soundEngine.playSuccess();
  };

  // -------------------------------------------------------------
  // LOCALIZATION HELPERS
  // -------------------------------------------------------------
  const displayTitle = lang === 'en' 
    ? (t.hero.title || translateTextToEnglish(siteContent.title))
    : siteContent.title;

  const displaySubtitle = lang === 'en' 
    ? (siteContent.subtitle === defaultSiteContent.subtitle ? t.hero.subtitle : translateTextToEnglish(siteContent.subtitle))
    : siteContent.subtitle;

  const displayDescription = lang === 'en' 
    ? (siteContent.description === defaultSiteContent.description ? t.hero.description : translateTextToEnglish(siteContent.description))
    : siteContent.description;

  const displayMission = lang === 'en' 
    ? (siteContent.missionStatement === defaultSiteContent.missionStatement ? t.hero.missionText : translateTextToEnglish(siteContent.missionStatement))
    : siteContent.missionStatement;

  const displaySkillsTitle = lang === 'en' 
    ? (siteContent.skillsTitle === defaultSiteContent.skillsTitle ? t.skills.title : translateTextToEnglish(siteContent.skillsTitle))
    : siteContent.skillsTitle;

  const displaySkillsSubtitle = lang === 'en' 
    ? (siteContent.skillsSubtitle === defaultSiteContent.skillsSubtitle ? t.skills.subtitle : translateTextToEnglish(siteContent.skillsSubtitle))
    : siteContent.skillsSubtitle;

  const getLocalizedSkill = (skill: string) => {
    const list = t.skills.skillsList;
    if (list[skill]) {
      return { name: list[skill].name, desc: list[skill].desc };
    }
    // Fallback search
    for (const key of Object.keys(list)) {
      if (key.toLowerCase() === skill.toLowerCase()) {
        return { name: list[key].name, desc: list[key].desc };
      }
    }
    return { 
      name: lang === 'en' ? translateTextToEnglish(skill) : skill, 
      desc: lang === 'ko' 
        ? `${skill} 역량을 통해 로봇 완성도를 조율하고 프로젝트의 성패를 주도적으로 돌파해 나갑니다.` 
        : `Applying ${skill} to elevate robotic performance and reliably deliver competition-grade milestones.`
    };
  };

  const getLocalizedExp = (item: Experience) => {
    if (lang === 'en') {
      if (t.experience.items[item.id]) {
        return {
          title: translateTextToEnglish(item.title) || t.experience.items[item.id].title,
          description: translateTextToEnglish(item.description) || t.experience.items[item.id].desc
        };
      }
      return {
        title: translateTextToEnglish(item.title),
        description: translateTextToEnglish(item.description)
      };
    }
    return { title: item.title, description: item.description };
  };

  const getLocalizedCert = (cert: Certification) => {
    if (lang === 'en') {
      const transItem = t.awards.items[cert.id];
      const translatedTitle = translateTextToEnglish(cert.title) || (transItem ? transItem.title : cert.title);
      const translatedResult = t.awards.results[cert.result] || translateTextToEnglish(cert.result) || cert.result;
      return {
        title: translatedTitle,
        result: translatedResult
      };
    }
    const localizedResult = t.awards.results[cert.result] || cert.result;
    return { title: cert.title, result: localizedResult };
  };

  const getLocalizedPortfolio = (item: PortfolioItem) => {
    if (lang === 'en') {
      const transItem = t.portfolio.items[item.id];
      return {
        title: translateTextToEnglish(item.title) || (transItem ? transItem.title : item.title),
        description: translateTextToEnglish(item.description) || (transItem ? transItem.desc : item.description),
        tags: (item.tags || []).map(tag => translateTag(tag))
      };
    }
    return {
      title: item.title,
      description: item.description,
      tags: item.tags || []
    };
  };

  // -------------------------------------------------------------
  // RENDER DEDICATED /admin PAGE IF ACTIVE PATH IS /admin
  // Shows login screen if unauthenticated, or dashboard if dashboard view mode is explicitly toggled.
  // When logged in, default view mode is 'inline' which lets the admin use all previous admin features!
  // -------------------------------------------------------------
  if (currentPath === '/admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080D1A] text-[#434656] dark:text-slate-200">
        <AdminPage 
          isAdminActive={isAdminActive}
          onLoginSuccess={enterAdminMode}
          onLogout={exitAdminMode}
          onNavigateHome={() => {
            navigateTo('/');
          }}
          isFirebaseConfigured={isFirebaseConfigured}
          siteContent={siteContent}
          experiences={experiences}
          certifications={certifications}
          portfolioItems={portfolioItems}
          onEditSiteContent={() => setEditingSiteContent(true)}
          onAddExperience={() => {
            setExperienceEditTarget(null);
            setIsExperienceModalOpen(true);
          }}
          onEditExperience={(exp) => {
            setExperienceEditTarget(exp);
            setIsExperienceModalOpen(true);
          }}
          onDeleteExperience={requestDeleteExperience}
          onAddCertification={() => {
            setCertificationEditTarget(null);
            setIsCertificationModalOpen(true);
          }}
          onEditCertification={(cert) => {
            setCertificationEditTarget(cert);
            setIsCertificationModalOpen(true);
          }}
          onDeleteCertification={requestDeleteCertification}
          onAddPortfolioItem={() => {
            setPortfolioEditTarget(null);
            setIsPortfolioModalOpen(true);
          }}
          onEditPortfolioItem={(item) => {
            setPortfolioEditTarget(item);
            setIsPortfolioModalOpen(true);
          }}
          onDeletePortfolioItem={requestDeletePortfolioItem}
          onChangePassword={() => setIsChangePasswordModalOpen(true)}
          lang={lang}
        />

        {/* MODALS RENDERED SO ADMIN CAN EDIT DIRECTLY FROM /admin DASHBOARD */}
        {editingSiteContent && (
          <EditSiteContentModal 
            isOpen={editingSiteContent}
            onClose={() => setEditingSiteContent(false)}
            initialData={siteContent}
            onSave={handleSaveSiteContent}
            isFirebaseReady={isFirebaseConfigured}
          />
        )}

        {isExperienceModalOpen && (
          <EditExperienceModal 
            key={experienceEditTarget ? `exp-${experienceEditTarget.id}` : 'new-exp'}
            isOpen={isExperienceModalOpen}
            onClose={() => {
              setIsExperienceModalOpen(false);
              setExperienceEditTarget(null);
            }}
            experience={experienceEditTarget}
            onSave={handleSaveExperience}
            onDelete={requestDeleteExperience}
          />
        )}

        {isCertificationModalOpen && (
          <EditCertificationModal 
            key={certificationEditTarget ? `cert-${certificationEditTarget.id}` : 'new-cert'}
            isOpen={isCertificationModalOpen}
            onClose={() => {
              setIsCertificationModalOpen(false);
              setCertificationEditTarget(null);
            }}
            certification={certificationEditTarget}
            onSave={handleSaveCertification}
            onDelete={requestDeleteCertification}
          />
        )}

        {isPortfolioModalOpen && (
          <EditPortfolioModal 
            key={portfolioEditTarget ? `port-${portfolioEditTarget.id}` : 'create-portfolio-modal'}
            isOpen={isPortfolioModalOpen}
            onClose={() => {
              setIsPortfolioModalOpen(false);
              setPortfolioEditTarget(null);
            }}
            portfolioItem={portfolioEditTarget}
            onSave={handleSavePortfolioItem}
            onDelete={requestDeletePortfolioItem}
            isFirebaseReady={isFirebaseConfigured}
          />
        )}

        {isChangePasswordModalOpen && (
          <ChangePasswordModal 
            isOpen={isChangePasswordModalOpen}
            onClose={() => setIsChangePasswordModalOpen(false)}
            lang={lang}
          />
        )}

        {/* SAFETY CONFIRMATION MODAL BEFORE PERMANENT DELETION */}
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleExecuteDelete}
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#080D1A] text-[#434656] dark:text-slate-200 transition-colors duration-200">
      {/* 🛠️ Main Admin Notification Bar */}
      {isAdminActive && (
        <AdminBar 
          isConfigured={isFirebaseConfigured} 
          onExit={exitAdminMode} 
          onChangePassword={() => setIsChangePasswordModalOpen(true)}
          adminViewMode={adminViewMode}
          onToggleViewMode={() => {
            if (currentPath !== '/admin') {
              navigateTo('/admin');
              setAdminViewMode('dashboard');
            } else {
              setAdminViewMode(prev => prev === 'inline' ? 'dashboard' : 'inline');
            }
          }}
          onNavigateToAdmin={() => {
            if (currentPath !== '/admin') navigateTo('/admin');
            setAdminViewMode('dashboard');
          }}
          lang={lang}
        />
      )}

      {/* FIXED TOP NAVIGATION BAR */}
      <nav 
        id="top-nav-bar"
        className={`fixed w-full h-20 z-40 bg-white/95 dark:bg-[#080D1A]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isAdminActive ? 'top-14' : 'top-0'
        }`}
      >
        <div id="nav-container" className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
          {/* Logo & Brand (Clicking logo triggers Easter Egg feedback as well!) */}
          <a
            id="brand-logo" 
            href="#about"
            onClick={(e) => {
              // Also allow clicking logo 5 times as an easter egg trigger
              handleEasterEggPress();
            }}
            className="font-headline font-bold text-lg md:text-xl tracking-tighter text-[#0052FF] dark:text-blue-400 flex items-center space-x-2.5 group cursor-pointer select-none"
            title={t.nav.easterEggHint}
          >
            <div className="relative">
              <img 
                src="/favicon.png?v=4" 
                alt="Logo" 
                className="w-8 h-8 rounded-full border-2 border-blue-200 dark:border-blue-700 object-contain shadow-xs bg-white dark:bg-gray-800 group-hover:rotate-12 transition-transform"
              />
              {easterEggCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[9px] font-mono font-black flex items-center justify-center animate-ping">
                  {easterEggCount}
                </span>
              )}
            </div>
            <span>{t.hero.badge}</span>
          </a>

          {/* Desktop Nav links */}
          <div className="hidden md:flex space-x-5 lg:space-x-7 items-center font-headline text-sm font-semibold">
            <a href="#about" className="text-[#0052FF] dark:text-blue-400 border-b-2 border-[#0052FF] dark:border-blue-400 pb-1 transition-all duration-300">{t.nav.about}</a>
            <a href="#experience" className="text-gray-500 dark:text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors pb-1">{t.nav.experience}</a>
            <a href="#skills" className="text-gray-500 dark:text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors pb-1">{t.nav.skills}</a>
            <a href="#awards" className="text-gray-500 dark:text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors pb-1">{t.nav.awards}</a>
            <a href="#portfolio" className="text-gray-500 dark:text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors pb-1">{t.nav.portfolio}</a>
            
            {/* Direct Admin Link in Nav */}
            <button
              id="nav-admin-link"
              onClick={() => navigateTo('/admin')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isAdminActive 
                  ? 'bg-[#0052FF] text-white shadow-xs' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={lang === 'ko' ? '관리자 페이지 (/admin)' : 'Admin Portal (/admin)'}
            >
              <Lock size={12} />
              <span>{lang === 'ko' ? '관리자' : 'Admin'}</span>
            </button>
          </div>

          {/* Desktop Utility Controls: Theme Toggle & Language Toggle */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Language Toggle Button */}
            <button
              id="language-toggle-btn"
              onClick={toggleLang}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-headline font-bold text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-xs"
              title={lang === 'ko' ? "Switch language to English" : "한국어로 언어 변경"}
            >
              <Globe size={14} className="text-[#0052FF] dark:text-blue-400" />
              <span>{lang === 'ko' ? 'EN' : 'KO'}</span>
              <span className="text-[10px] opacity-60">|</span>
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                {lang === 'ko' ? '한국어' : 'English'}
              </span>
            </button>

            {/* BGM Background Music Toggle Button */}
            <button
              id="bgm-toggle-btn"
              onClick={handleToggleBgm}
              className={`p-2 rounded-full border transition-all cursor-pointer shadow-xs flex items-center justify-center ${
                isBgmActive
                  ? 'border-[#0052FF] dark:border-blue-400 bg-blue-50 dark:bg-blue-900/40 text-[#0052FF] dark:text-blue-300 ring-2 ring-blue-400/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              title={isBgmActive ? t.nav.bgmPause : t.nav.bgmPlay}
              aria-label="Toggle Background Music"
            >
              <Music size={16} className={isBgmActive ? "animate-bounce text-[#0052FF] dark:text-blue-400" : ""} />
            </button>

            {/* Dark/Light Mode Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-xs"
              title={theme === 'dark' ? t.nav.themeToggleLight : t.nav.themeToggleDark}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-[#FFCC00] hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={17} className="text-[#0052FF] hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Easter Egg Trigger Icon */}
            <button
              id="easter-egg-hint-btn"
              onClick={() => {
                handleEasterEggPress();
              }}
              className="p-2 rounded-full border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0052FF] dark:text-blue-300 transition-all cursor-pointer shadow-xs"
              title={t.nav.easterEggHint}
              aria-label="Easter Egg"
            >
              <Zap size={16} className="text-[#FFCC00] animate-pulse" />
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              id="mobile-bgm-toggle-btn"
              onClick={handleToggleBgm}
              className={`p-2 rounded-full border transition-all ${
                isBgmActive 
                  ? 'border-[#0052FF] bg-blue-50 dark:bg-blue-900/50 text-[#0052FF] dark:text-blue-300' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
              }`}
              aria-label="Toggle Background Music"
              title={isBgmActive ? t.nav.bgmPause : t.nav.bgmPlay}
            >
              <Music size={16} className={isBgmActive ? "animate-bounce text-[#0052FF]" : ""} />
            </button>

            <button
              id="mobile-theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-[#FFCC00]" /> : <Moon size={18} className="text-[#0052FF]" />}
            </button>

            <button
              id="mobile-lang-toggle-btn"
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-headline font-bold text-gray-700 dark:text-gray-200"
            >
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>

            <button 
              id="mobile-nav-toggle"
              aria-label="Toggle Menu" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#0052FF] dark:text-blue-400 focus:outline-none p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-0 bg-white dark:bg-[#080D1A] border-b border-gray-100 dark:border-gray-800 p-4 shadow-xl z-30 font-headline font-semibold text-sm flex flex-col space-y-4 text-center">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#0052FF] dark:text-blue-400 bg-[#0052FF]/5 dark:bg-blue-900/20 rounded">{t.nav.about}</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 dark:text-gray-300 hover:text-[#0052FF] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">{t.nav.experience}</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 dark:text-gray-300 hover:text-[#0052FF] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">{t.nav.skills}</a>
            <a href="#awards" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 dark:text-gray-300 hover:text-[#0052FF] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">{t.nav.awards}</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="py-2 text-gray-600 dark:text-gray-300 hover:text-[#0052FF] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">{t.nav.portfolio}</a>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('/admin');
              }} 
              className="py-2.5 text-[#0052FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded font-bold flex items-center justify-center space-x-2"
            >
              <Lock size={14} />
              <span>{lang === 'ko' ? '관리자 페이지 (/admin)' : 'Admin Portal (/admin)'}</span>
            </button>
          </div>
        )}
      </nav>

      {/* EASTER EGG PROGRESS FLOATING BADGE */}
      {easterEggCount > 0 && (
        <div 
          id="easter-egg-counter-badge"
          className="fixed bottom-6 left-6 z-50 animate-bounce bg-[#0052FF] dark:bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-mono font-bold flex items-center space-x-2 border-2 border-white dark:border-gray-800 cursor-pointer"
          onClick={() => handleEasterEggPress()}
        >
          <Zap size={15} className="text-[#FFCC00] animate-pulse" />
          <span>{t.easterEgg.counterHint(easterEggCount)}</span>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className={`flex-grow transition-all duration-300 ${isAdminActive ? 'pt-34' : 'pt-20'}`}>
        {isLoading ? (
          <div id="loading-spinner-state" className="flex flex-col items-center justify-center py-40 text-center">
            <Loader2 size={48} className="animate-spin text-[#0052FF] dark:text-blue-400 mb-4" />
            <p className="text-sm font-semibold tracking-wider font-headline text-gray-500 dark:text-gray-400 uppercase">
              {t.admin.loading}
            </p>
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
                  className="absolute top-4 right-4 md:right-8 bg-[#0052FF] text-white p-2.5 rounded-full hover:bg-blue-700 shadow-lg flex items-center space-x-1.5 text-xs font-semibold z-10 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>{t.hero.editBtn}</span>
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="space-y-6">
                  <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl text-[#0052FF] dark:text-blue-400 tracking-tighter leading-tight">
                    {displayTitle}
                  </h1>
                  <h2 className="font-headline font-semibold text-lg md:text-xl text-[#434656] dark:text-gray-200">
                    {displaySubtitle}
                  </h2>
                  <p className="font-sans text-base md:text-lg text-[#434656] dark:text-gray-300 leading-relaxed max-w-xl">
                    {displayDescription}
                  </p>
                  
                  {displayMission && (
                    <div id="about-mission-statement" className="p-5 bg-[#f8f9fa] dark:bg-[#0D1527] border-l-4 border-[#0052FF] dark:border-blue-400 rounded-r-lg mt-8 shadow-sm">
                      <p className="font-mono text-xs text-[#0052FF] dark:text-blue-400 font-bold uppercase tracking-widest">
                        {t.hero.missionLabel}
                      </p>
                      <p className="font-sans text-sm md:text-base text-[#434656] dark:text-gray-300 mt-2 italic font-medium">
                        "{displayMission}"
                      </p>
                    </div>
                  )}
                </div>

                <div id="hero-img-frame" className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-[#0D1527] flex items-center justify-center">
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
            <section id="experience" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 border-t border-gray-100 dark:border-gray-800 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#0052FF] dark:text-blue-400 mb-2 border-l-4 border-[#0052FF] dark:border-blue-400 pl-4">
                    {t.experience.title}
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-500 dark:text-gray-400">
                    {t.experience.subtitle}
                  </p>
                </div>

                {isAdminActive && (
                  <button
                    id="add-experience-section-btn"
                    onClick={() => {
                      setExperienceEditTarget(null);
                      setIsExperienceModalOpen(true);
                    }}
                    className="mt-4 md:mt-0 bg-[#0052FF] hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>{t.experience.addBtn}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experiences.map(item => {
                  const loc = getLocalizedExp(item);
                  return (
                    <div 
                      key={item.id}
                      className={`bg-white dark:bg-[#0D1527] p-6 md:p-8 rounded-xl neon-border border-${item.color} relative group/card cursor-pointer`}
                    >
                      {/* Admin hovering edit controls */}
                      {isAdminActive && (
                        <div className="absolute top-4 right-4 flex space-x-1.5 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                          <button
                            onClick={() => {
                              setExperienceEditTarget(item);
                              setIsExperienceModalOpen(true);
                            }}
                            className="p-1.5 bg-[#0052FF] text-white rounded hover:bg-blue-700 shadow cursor-pointer transition-colors"
                            title={t.admin.editRecord}
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDeleteExperience(item.id);
                            }}
                            className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 shadow cursor-pointer transition-colors"
                            title={lang === 'ko' ? '삭제' : 'Delete'}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-headline font-semibold text-lg text-[#0A0A0A] dark:text-white leading-tight pr-6">
                          {loc.title}
                        </h3>
                        {/* Font-Material icon representations */}
                        <span className={`material-symbols-outlined text-2xl ${
                          item.color === 'blue' ? 'text-[#0052FF] dark:text-blue-400' : item.color === 'red' ? 'text-[#FF3B30] dark:text-red-400' : 'text-[#FFCC00]'
                        }`}>
                          {item.icon}
                        </span>
                      </div>
                      <p className="font-sans text-sm text-[#434656] dark:text-gray-300 leading-relaxed">
                        {loc.description}
                      </p>
                    </div>
                  );
                })}

                {experiences.length === 0 && (
                  <div className="col-span-2 text-center py-10 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded text-[#434656] dark:text-gray-400 text-xs">
                    {t.experience.empty}
                  </div>
                )}
              </div>
            </section>

            {/* SKILLS SECTION */}
            <section id="skills" className="bg-[#0052FF] dark:bg-[#05297C] text-white py-16 relative">
              <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                  <h2 className="font-headline font-bold text-3xl mb-3">
                    {displaySkillsTitle}
                  </h2>
                  <p className="font-headline text-base opacity-90">
                    {displaySkillsSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {siteContent.skills.map((rawSkill, index) => {
                    const loc = getLocalizedSkill(rawSkill);
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
                        {/* Circle / Pill Badge */}
                        <div className="mb-3">
                          <span 
                            className={`${bgClass} px-5 py-2 rounded-full font-sans text-xs font-bold shadow-md tracking-wide select-none inline-block`}
                          >
                            {loc.name}
                          </span>
                        </div>
                        {/* Description */}
                        <p className="text-white/85 text-xs font-medium leading-relaxed font-sans max-w-[200px]">
                          {loc.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CERTIFICATIONS & AWARDS SECTION */}
            <section id="awards" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 border-t border-gray-100 dark:border-gray-800 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#0052FF] dark:text-blue-400 mb-2 border-l-4 border-[#FF3B30] pl-4">
                    {t.awards.title}
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-500 dark:text-gray-400">
                    {t.awards.subtitle}
                  </p>
                </div>

                {isAdminActive && (
                  <button
                    id="add-certification-section-btn"
                    onClick={() => {
                      setCertificationEditTarget(null);
                      setIsCertificationModalOpen(true);
                    }}
                    className="mt-4 md:mt-0 bg-[#0052FF] hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>{t.awards.addBtn}</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {certifications.map(cert => {
                  const loc = getLocalizedCert(cert);
                  return (
                    <div 
                      key={cert.id}
                      className={`bg-white dark:bg-[#0D1527] p-5 md:p-6 rounded-xl relative group/cert flex items-center justify-between shadow-sm border-2 ${
                        cert.color === 'tertiary' 
                          ? 'border-[#FFCC00]' 
                          : 'border-gray-100 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-4 pr-10">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                          cert.color === 'tertiary' 
                            ? 'bg-[#FFCC00] text-[#0A0A0A]' 
                            : 'bg-gray-100 dark:bg-gray-800 text-[#0052FF] dark:text-blue-400'
                        }`}>
                          <span className="material-symbols-outlined text-xl">{cert.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-sm md:text-base text-[#0A0A0A] dark:text-white leading-tight">
                            {loc.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`font-headline font-black text-base md:text-lg leading-none ${
                          cert.color === 'tertiary' ? 'text-[#FF3B30] dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {loc.result}
                        </span>
                        
                        {/* Admin hover modifier elements */}
                        {isAdminActive && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setCertificationEditTarget(cert);
                                setIsCertificationModalOpen(true);
                              }}
                              className="p-1.5 bg-[#0052FF] text-white rounded hover:bg-blue-700 shadow cursor-pointer transition-colors"
                              title={t.admin.editRecord}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteCertification(cert.id);
                              }}
                              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 shadow cursor-pointer transition-colors"
                              title={lang === 'ko' ? '삭제' : 'Delete'}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {certifications.length === 0 && (
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded text-[#434656] dark:text-gray-400 text-xs">
                    {t.awards.empty}
                  </div>
                )}
              </div>
            </section>

            {/* PORTFOLIO SECTION */}
            <section id="portfolio" className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto py-16 border-t border-gray-100 dark:border-gray-800 relative group">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#0052FF] dark:text-blue-400 mb-2 border-l-4 border-[#0052FF] dark:border-blue-400 pl-4">
                    {t.portfolio.title}
                  </h2>
                  <p className="font-sans text-sm md:text-base text-gray-500 dark:text-gray-400">
                    {t.portfolio.subtitle}
                  </p>
                </div>

                {isAdminActive && (
                  <button
                    id="add-portfolio-section-btn"
                    onClick={() => {
                      setPortfolioEditTarget(null);
                      setIsPortfolioModalOpen(true);
                    }}
                    className="mt-4 md:mt-0 bg-[#0052FF] hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-semibold flex items-center space-x-1.5 shadow cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>{t.portfolio.addBtn}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems
                  .filter(item => {
                    const isClock = 
                      item.title?.toLowerCase().includes('clock') || 
                      item.title?.toLowerCase().includes('watch') || 
                      item.title?.toLowerCase().includes('시계') || 
                      item.description?.toLowerCase().includes('clock') || 
                      item.description?.toLowerCase().includes('watch') || 
                      item.description?.toLowerCase().includes('시계') ||
                      item.tags?.some(tag => {
                        const tg = tag.toLowerCase();
                        return tg.includes('clock') || tg.includes('watch') || tg.includes('시계');
                      });
                    return !isClock;
                  })
                  .map(item => {
                    const loc = getLocalizedPortfolio(item);
                    return (
                      <div 
                        key={item.id}
                        className={`bg-white dark:bg-[#0D1527] rounded-xl overflow-hidden neon-border group/card flex flex-col h-full border-2 relative ${
                          item.status === 'COMPLETED' ? 'border-[#0052FF] dark:border-blue-500' : 'border-[#FF3B30] dark:border-red-500'
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
                              className="p-1.5 bg-[#0052FF] hover:bg-blue-700 text-white rounded shadow cursor-pointer transition-colors"
                              title={t.admin.editRecord}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeletePortfolioItem(item.id);
                              }}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow cursor-pointer transition-colors"
                              title={lang === 'ko' ? '삭제' : 'Delete'}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}

                        <div className="h-48 relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                          <img 
                            src={item.imageUrl} 
                            alt={loc.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          />
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${
                              item.status === 'COMPLETED' ? 'bg-[#0052FF]' : 'bg-[#FF3B30]'
                            }`}>
                              {item.status === 'COMPLETED' 
                                ? (lang === 'ko' ? '완료 (COMPLETED)' : t.portfolio.completed) 
                                : (lang === 'ko' ? '개발 중 (IN DEV)' : t.portfolio.inDevelopment)}
                            </span>
                          </div>
                          <h3 className="font-headline font-bold text-base md:text-lg text-[#0A0A0A] dark:text-white mb-2">
                            {loc.title}
                          </h3>
                          <p className="font-sans text-xs md:text-sm text-[#434656] dark:text-gray-300 mb-4 flex-grow leading-relaxed">
                            {loc.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {loc.tags.map((tag, tIndex) => (
                              <span 
                                key={tIndex}
                                className="px-2 py-0.5 rounded text-[9px] font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer id="app-footer" className="bg-white dark:bg-[#050811] w-full py-10 mt-auto border-t border-gray-100 dark:border-gray-800">
        <div id="footer-container" className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto gap-4">
          <div className="font-headline text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-wider text-center md:text-left">
            {t.footer.copyright}
          </div>
          <div className="flex gap-6 font-headline font-bold text-xs items-center">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Github size={13} />
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF3B30] dark:hover:text-red-400 transition-colors flex items-center gap-1">
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>
            <button 
              onClick={() => soundEngine.playRobotFanfare()}
              className="text-gray-400 hover:text-[#FFCC00] transition-colors flex items-center gap-1 cursor-pointer"
              title={t.nav.easterEggHint}
            >
              <Volume2 size={13} />
              <span>FX</span>
            </button>
            <button 
              onClick={() => navigateTo('/admin')}
              className="text-gray-400 hover:text-[#0052FF] dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Lock size={13} />
              <span>{lang === 'ko' ? '관리자 (/admin)' : 'Admin (/admin)'}</span>
            </button>
            <a href="#" className="text-gray-400 hover:text-[#FFCC00] transition-colors flex items-center gap-1">
              <FileText size={13} />
              <span>{t.footer.docs}</span>
            </a>
          </div>
        </div>
      </footer>

      {/* FLOATING ADMIN SETTINGS LOGIN ICON */}
      <button 
        id="admin-login-floating-trigger"
        onClick={() => {
          navigateTo('/admin');
        }}
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-center p-3 hover:scale-105 transition-all shadow-xl rounded-full cursor-pointer border-2 outline-none ${
          isAdminActive 
            ? 'bg-[#0052FF] text-white border-[#0052FF]' 
            : 'bg-white dark:bg-[#0D1527] text-[#0052FF] dark:text-blue-400 border-[#0052FF] dark:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-[#0052FF]/10'
        }`}
        title={isAdminActive ? (lang === 'ko' ? '관리자 제어 센터 (/admin)' : 'Admin Control Center (/admin)') : (lang === 'ko' ? '관리자 로그인 (/admin)' : 'Admin Login (/admin)')}
      >
        <Settings size={22} className={isAdminActive ? '' : 'animate-spin-[duration:10s]'} />
      </button>

      {/* EASTER EGG CELEBRATION MODAL */}
      <EasterEggModal 
        isOpen={isEasterEggOpen} 
        onClose={() => setIsEasterEggOpen(false)} 
        lang={lang} 
      />

      {/* ADMIN SUB-COMPONENT MODALS */}
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSuccess={enterAdminMode}
        onNavigateToAdminPage={() => navigateTo('/admin')}
        lang={lang}
      />

      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        lang={lang}
      />

      <EditSiteContentModal 
        isOpen={editingSiteContent}
        onClose={() => setEditingSiteContent(false)}
        initialData={siteContent}
        onSave={handleSaveSiteContent}
        isFirebaseReady={isFirebaseConfigured}
      />

      {isExperienceModalOpen && (
        <EditExperienceModal 
          key={experienceEditTarget ? `exp-${experienceEditTarget.id}` : 'new-exp'}
          isOpen={isExperienceModalOpen}
          onClose={() => {
            setIsExperienceModalOpen(false);
            setExperienceEditTarget(null);
          }}
          experience={experienceEditTarget}
          onSave={handleSaveExperience}
          onDelete={requestDeleteExperience}
        />
      )}

      {isCertificationModalOpen && (
        <EditCertificationModal 
          key={certificationEditTarget ? `cert-${certificationEditTarget.id}` : 'new-cert'}
          isOpen={isCertificationModalOpen}
          onClose={() => {
            setIsCertificationModalOpen(false);
            setCertificationEditTarget(null);
          }}
          certification={certificationEditTarget}
          onSave={handleSaveCertification}
          onDelete={requestDeleteCertification}
        />
      )}

      {isPortfolioModalOpen && (
        <EditPortfolioModal 
          key={portfolioEditTarget ? `port-${portfolioEditTarget.id}` : 'create-portfolio-modal'}
          isOpen={isPortfolioModalOpen}
          onClose={() => {
            setIsPortfolioModalOpen(false);
            setPortfolioEditTarget(null);
          }}
          portfolioItem={portfolioEditTarget}
          onSave={handleSavePortfolioItem}
          onDelete={requestDeletePortfolioItem}
          isFirebaseReady={isFirebaseConfigured}
        />
      )}

      {/* SAFETY CONFIRMATION MODAL BEFORE PERMANENT DELETION */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleExecuteDelete}
        lang={lang}
      />

      {/* FLOATING PORTFOLIO BGM CONTROLLER */}
      <PortfolioBgmPlayer
        lang={lang}
        isBgmActive={isBgmActive}
        onToggleBgm={handleToggleBgm}
      />
    </div>
  );
}
