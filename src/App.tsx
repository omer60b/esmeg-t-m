import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrainingDocument, 
  TrainingCategory, 
  TrainingCompletion,
  TrainingAnnouncement,
  Branch
} from './types';
import { 
  getStoredTrainings, 
  upsertTraining, 
  deleteTraining, 
  resetTrainingsToDefault,
  getStoredCompletions, 
  recordTrainingCompletion, 
  updateTrainingCompletion,
  clearAllCompletions,
  deleteTrainingCompletion,
  getStoredAnnouncements,
  saveAnnouncements,
  subscribeToTrainingUpdates,
  fetchRemoteTrainings
} from './services/trainingStorage';
import { 
  getStoredBranches, 
  upsertBranch, 
  deleteBranch, 
  updateBranchPassword, 
  resetAllBranchPasswords, 
  resetBranchesToDefault, 
  fetchRemoteBranches, 
  subscribeToBranchUpdates 
} from './services/branchStorage';
import { purgeLegacyStockData } from './services/firebaseService';
import { officialEsmeBranches } from './mockData';

// Training Components
import { TrainingHeader, AppThemeMode } from './components/TrainingHeader';
import { StoreAuthGateway } from './components/StoreAuthGateway';
import { AnnouncementsBanner } from './components/AnnouncementsBanner';
import { PendingTrainingsReminder } from './components/PendingTrainingsReminder';
import { TrainingCatalogView } from './components/TrainingCatalogView';
import { TrainingDetailModal } from './components/TrainingDetailModal';
import { EBookReader } from './components/EBookReader';
import { VideoHubView } from './components/VideoHubView';
import { AdminTrainingPanel } from './components/AdminTrainingPanel';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminAuthModal } from './components/AdminAuthModal';
import { FloatingAIRobotBot } from './components/FloatingAIRobotBot';

export default function App() {
  const [trainings, setTrainings] = useState<TrainingDocument[]>(() => getStoredTrainings());
  const [completions, setCompletions] = useState<TrainingCompletion[]>(() => getStoredCompletions());
  const [announcements, setAnnouncements] = useState<TrainingAnnouncement[]>(() => getStoredAnnouncements());
  const [branches, setBranches] = useState<Branch[]>(() => getStoredBranches());
  const [trainingActiveTab, setTrainingActiveTab] = useState<'catalog' | 'ebook' | 'video' | 'leaderboard' | 'admin'>(() => {
    try {
      const savedAdmin = localStorage.getItem('esme_is_admin_mode') === 'true';
      const savedTab = localStorage.getItem('esme_active_tab') as any;
      const validTabs = ['catalog', 'ebook', 'video', 'leaderboard', 'admin'];
      if (savedTab && validTabs.includes(savedTab)) return savedTab;
      if (savedAdmin) return 'admin';
    } catch {}
    return 'catalog';
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrainingCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Global Theme Mode ('sepia' | 'light' | 'dark') across all pages — Initial default: 'sepia' (Kitap Kağıdı)
  const [appTheme, setAppTheme] = useState<AppThemeMode>(() => {
    try {
      const saved = localStorage.getItem('esme_app_theme_v2') as AppThemeMode | null;
      if (saved === 'sepia' || saved === 'light' || saved === 'dark') {
        return saved;
      }
      return 'sepia';
    } catch {
      return 'sepia';
    }
  });

  const [bellTrigger, setBellTrigger] = useState<number>(0);

  // Sync active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('esme_active_tab', trainingActiveTab);
    } catch {}
  }, [trainingActiveTab]);

  // Sync theme classes on <html> element for high-contrast readability across all modals & pages
  useEffect(() => {
    try {
      localStorage.setItem('esme_app_theme_v2', appTheme);
    } catch {}
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-light', 'theme-sepia');
    if (appTheme === 'dark') {
      root.classList.add('dark');
    } else if (appTheme === 'sepia') {
      root.classList.add('theme-sepia');
    } else {
      root.classList.add('theme-light');
    }
  }, [appTheme]);

  // Current branch & personnel context for training
  const [currentBranchId, setCurrentBranchId] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('esme_active_branch_id');
      return stored ? Number(stored) : 10; // Güneşli Mağaza default
    } catch {
      return 10;
    }
  });

  const [currentPersonnel, setCurrentPersonnel] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('esme_active_personnel_name');
      return stored || 'Şube Sorumlusu';
    } catch {
      return 'Şube Sorumlusu';
    }
  });

  // Admin login persists across page refresh; only cleared on explicit logout
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('esme_is_admin_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isAdmin) {
        localStorage.setItem('esme_is_admin_mode', 'true');
      } else {
        localStorage.removeItem('esme_is_admin_mode');
        if (trainingActiveTab === 'admin') {
          setTrainingActiveTab('catalog');
        }
      }
    } catch {}
  }, [isAdmin, trainingActiveTab]);

  const [isStoreAuthenticated, setIsStoreAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('esme_store_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [initialModalTab, setInitialModalTab] = useState<'content' | 'video' | 'pdf' | 'templates' | 'quiz' | 'presentation'>('content');
  const [ebookTargetTrainingId, setEbookTargetTrainingId] = useState<string | undefined>();
  const [pendingAdminVideoUrl, setPendingAdminVideoUrl] = useState<string | null>(null);

  // Always derive selectedTraining from live trainings state so real-time updates (like new YouTube links) appear immediately
  const selectedTraining = selectedTrainingId 
    ? trainings.find(t => t.id === selectedTrainingId) || null 
    : null;

  // Real-time Firestore sync for training database, branches, and purge any legacy stock data
  useEffect(() => {
    purgeLegacyStockData();

    // Fetch trainings, completions, announcements
    fetchRemoteTrainings().then(remote => {
      if (Array.isArray(remote.trainings)) {
        setTrainings(remote.trainings);
      }
      if (Array.isArray(remote.completions)) {
        setCompletions(remote.completions);
      }
      if (Array.isArray(remote.announcements)) {
        setAnnouncements(remote.announcements);
      }
    });

    const unsubscribeTraining = subscribeToTrainingUpdates(
      (updatedTrainings) => setTrainings(updatedTrainings),
      (updatedCompletions) => setCompletions(updatedCompletions),
      (updatedAnnouncements) => setAnnouncements(updatedAnnouncements)
    );

    // Fetch and subscribe to branches
    fetchRemoteBranches().then(remoteBranches => {
      if (Array.isArray(remoteBranches) && remoteBranches.length > 0) {
        setBranches(remoteBranches);
      }
    });

    const unsubscribeBranches = subscribeToBranchUpdates((updatedBranches) => {
      setBranches(updatedBranches);
    });

    return () => {
      unsubscribeTraining();
      unsubscribeBranches();
    };
  }, []);

  // Sync branch & personnel context
  useEffect(() => {
    try {
      localStorage.setItem('esme_active_branch_id', String(currentBranchId));
      localStorage.setItem('esme_active_personnel_name', currentPersonnel);
    } catch {}
  }, [currentBranchId, currentPersonnel]);

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0] || officialEsmeBranches[0];

  // Store Login & Logout Handlers
  const handleStoreLoginSuccess = (branchId: number, personnel: string) => {
    setCurrentBranchId(branchId);
    setCurrentPersonnel(personnel);
    setIsStoreAuthenticated(true);
    setTrainingActiveTab('catalog'); // Her mağaza girişinde ilk açılan sayfa karşılama ve eğitimler alanı olsun
    setSelectedCategory('all');
    setSearchQuery('');
    try {
      localStorage.setItem('esme_store_authenticated', 'true');
      localStorage.setItem('esme_active_branch_id', String(branchId));
      localStorage.setItem('esme_active_personnel_name', personnel);
      localStorage.setItem('esme_active_tab', 'catalog');
    } catch {}
  };

  const handleStoreLogout = () => {
    setIsStoreAuthenticated(false);
    setTrainingActiveTab('catalog');
    try {
      localStorage.removeItem('esme_store_authenticated');
      localStorage.setItem('esme_active_tab', 'catalog');
    } catch {}
  };

  // Branch CRUD Handlers for Administrator
  const handleSaveBranch = async (branchData: Partial<Branch> & { name: string }) => {
    const updated = await upsertBranch(branchData);
    setBranches(updated);
  };

  const handleDeleteBranch = async (branchId: number) => {
    const updated = await deleteBranch(branchId);
    setBranches(updated);
  };

  const handleUpdateBranchPassword = async (branchId: number, newPassword: string) => {
    const updated = await updateBranchPassword(branchId, newPassword);
    setBranches(updated);
  };

  const handleResetBranchPasswords = async (newPassword?: string) => {
    const updated = await resetAllBranchPasswords(newPassword || '1122');
    setBranches(updated);
  };

  const handleResetBranchesToDefault = async () => {
    const defaults = await resetBranchesToDefault();
    setBranches(defaults);
  };

  // Active announcements count for the notification bell
  const activeAnnouncementsCount = useMemo(() => {
    return announcements.filter(a => a.isActive).length;
  }, [announcements]);

  const handleOpenTrainingDetail = (
    training: TrainingDocument, 
    initialTab: 'content' | 'video' | 'pdf' | 'templates' | 'quiz' | 'presentation' = 'content'
  ) => {
    setSelectedTrainingId(training.id);
    setInitialModalTab(initialTab);
  };

  const handleOpenEBook = (trainingId?: string) => {
    setEbookTargetTrainingId(trainingId);
    setTrainingActiveTab('ebook');
  };

  const handleSaveTraining = async (training: TrainingDocument) => {
    await upsertTraining(training);
    setTrainings(getStoredTrainings());
  };

  const handleQuickUpdateVideo = async (
    trainingId: string, 
    videoUrl: string, 
    videoTitle?: string,
    videoDuration?: string
  ) => {
    const target = trainings.find(t => t.id === trainingId);
    if (!target) return;
    const trimmed = videoUrl.trim();
    const updated: TrainingDocument = {
      ...target,
      videoType: trimmed ? 'link' : 'none',
      videoUrl: trimmed,
      videoTitle: videoTitle || target.videoTitle || target.title,
      videoDuration: videoDuration || target.videoDuration || '05:00',
      updatedAt: new Date().toISOString()
    };
    await upsertTraining(updated);
    setTrainings(getStoredTrainings());
  };

  const handleDeleteVideo = async (trainingId: string) => {
    const target = trainings.find(t => t.id === trainingId);
    if (!target) return;
    const updated: TrainingDocument = {
      ...target,
      videoType: 'none',
      videoUrl: '',
      updatedAt: new Date().toISOString()
    };
    await upsertTraining(updated);
    setTrainings(getStoredTrainings());
  };

  const handleDeleteTraining = async (id: string) => {
    await deleteTraining(id);
    setTrainings(getStoredTrainings());
  };

  const handleResetTrainings = async () => {
    const defaults = await resetTrainingsToDefault();
    setTrainings(defaults);
  };

  const handleRecordCompletion = async (completion: TrainingCompletion) => {
    await recordTrainingCompletion(completion);
    setCompletions(getStoredCompletions());
  };

  const handleClearCompletions = async () => {
    await clearAllCompletions();
    setCompletions([]);
  };

  const handleDeleteCompletion = async (completionId: string) => {
    const updated = await deleteTrainingCompletion(completionId);
    setCompletions(updated);
  };

  const handleUpdateCompletion = async (updatedComp: TrainingCompletion) => {
    const updated = await updateTrainingCompletion(updatedComp);
    setCompletions(updated);
  };

  const handleSaveAnnouncements = async (updated: TrainingAnnouncement[]) => {
    await saveAnnouncements(updated);
    setAnnouncements(updated);
    // Trigger periodic notification system immediately when manager publishes/updates an announcement
    setBellTrigger(prev => prev + 1);
  };

  const bilgiIslemCount = trainings.filter(t => t.category === 'bilgi-islem').length;
  const depocuCount = trainings.filter(t => t.category === 'depocu').length;

  // Dynamic root background and high-contrast text colors based on selected theme
  const themeWrapperClass =
    appTheme === 'dark'
      ? 'dark bg-slate-950 text-slate-100'
      : appTheme === 'sepia'
      ? 'theme-sepia-wrapper bg-[#f4ecd8] text-[#2c2216]'
      : 'theme-light bg-slate-100 text-slate-900';

  // Gatekeeper: If store user is not authenticated and not in admin mode, show StoreAuthGateway
  if (!isStoreAuthenticated && !isAdmin) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${appTheme === 'dark' ? 'dark' : ''}`}>
        <StoreAuthGateway
          branches={branches}
          onSuccess={handleStoreLoginSuccess}
          onOpenAdminAuth={() => setShowAdminAuthModal(true)}
          initialBranchId={currentBranchId}
          initialPersonnel={currentPersonnel}
          appTheme={appTheme}
        />
        <AdminAuthModal
          isOpen={showAdminAuthModal}
          onClose={() => setShowAdminAuthModal(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setTrainingActiveTab('admin');
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-red-500 selection:text-white ${appTheme === 'dark' ? 'dark' : ''}`}>
      <div className={`flex-1 flex flex-col transition-colors duration-200 ${themeWrapperClass}`}>
        {/* Header */}
        <TrainingHeader
          activeTab={trainingActiveTab}
          setActiveTab={setTrainingActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentBranchId={currentBranchId}
          setCurrentBranchId={setCurrentBranchId}
          currentPersonnel={currentPersonnel}
          setCurrentPersonnel={setCurrentPersonnel}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          onOpenAdminAuth={() => setShowAdminAuthModal(true)}
          branches={branches}
          onStoreLogout={handleStoreLogout}
          onUpdateBranchPassword={handleUpdateBranchPassword}
          totalCount={trainings.length}
          bilgiIslemCount={bilgiIslemCount}
          depocuCount={depocuCount}
          appTheme={appTheme}
          setAppTheme={setAppTheme}
          pendingCount={activeAnnouncementsCount}
          onClickPendingBell={() => setBellTrigger(prev => prev + 1)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Global Theme Switcher Bar (Visible Across All Pages for Instant Access) */}
          <div className={`mb-4 rounded-2xl border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
            appTheme === 'dark'
              ? 'bg-slate-900/90 border-slate-800 text-slate-200'
              : appTheme === 'sepia'
              ? 'bg-[#efe4c8] border-[#d5c4a1] text-[#2c2216]'
              : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${
                appTheme === 'dark' ? 'bg-indigo-400' : appTheme === 'sepia' ? 'bg-amber-700' : 'bg-emerald-600'
              }`} />
              <span>Portal Görünüm Teması (Tüm Sayfalar):</span>
              <span className={`font-semibold text-[11px] ${
                appTheme === 'dark' ? 'text-slate-400' : appTheme === 'sepia' ? 'text-[#5c4932]' : 'text-slate-600'
              }`}>
                {appTheme === 'sepia' ? 'Kitap Kağıdı (Göz Yormayan Okuma Modu)' : appTheme === 'light' ? 'Açık Tema (Yüksek Kontrastlı Okunaklı Görünüm)' : 'Koyu Tema (Gece Görünümü)'}
              </span>
            </div>

            <div className={`flex items-center rounded-xl p-1 border ${
              appTheme === 'dark'
                ? 'bg-slate-950 border-slate-800'
                : appTheme === 'sepia'
                ? 'bg-[#e6d7b2] border-[#c8b58c]'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setAppTheme('sepia')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  appTheme === 'sepia'
                    ? 'bg-[#f4ecd8] text-[#2c2216] shadow-xs border border-[#c8b58c]'
                    : appTheme === 'light'
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kitap Kağıdı
              </button>
              <button
                onClick={() => setAppTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  appTheme === 'light'
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                    : appTheme === 'sepia'
                    ? 'text-[#433422] hover:text-[#1f170e] hover:bg-white/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Açık
              </button>
              <button
                onClick={() => setAppTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  appTheme === 'dark'
                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                    : appTheme === 'sepia'
                    ? 'text-[#433422] hover:text-[#1f170e]'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Koyu
              </button>
            </div>
          </div>

          {/* Top Urgent Operational Announcements Banner (Editable by Admins) */}
          <AnnouncementsBanner
            announcements={announcements}
            onSaveAnnouncements={handleSaveAnnouncements}
            isAdmin={isAdmin}
            onRequestAdminAuth={() => setShowAdminAuthModal(true)}
          />

          {/* Periodic Notification System (Triggered When Managers Publish Announcements) */}
          <PendingTrainingsReminder
            announcements={announcements}
            currentBranchId={currentBranchId}
            currentPersonnel={currentPersonnel}
            appTheme={appTheme}
            bellTrigger={bellTrigger}
          />
          
          {/* VIEW 1: CATALOG */}
          {trainingActiveTab === 'catalog' && (
            <TrainingCatalogView
              trainings={trainings}
              completions={completions}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectTraining={handleOpenTrainingDetail}
              onOpenEBook={handleOpenEBook}
              currentPersonnel={currentPersonnel}
              currentBranchId={currentBranchId}
            />
          )}

          {/* VIEW 2: E-BOOK READER */}
          {trainingActiveTab === 'ebook' && (
            <EBookReader
              trainings={trainings}
              initialTrainingId={ebookTargetTrainingId}
              onOpenTrainingDetail={handleOpenTrainingDetail}
              appTheme={appTheme}
              setAppTheme={setAppTheme}
            />
          )}

          {/* VIEW 3: VIDEO TRAINING HUB */}
          {trainingActiveTab === 'video' && (
            <VideoHubView
              trainings={trainings}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenTrainingDetail={handleOpenTrainingDetail}
              onQuickUpdateVideo={handleQuickUpdateVideo}
              onDeleteVideo={handleDeleteVideo}
              onOpenAdminNewTraining={(videoSrc) => {
                if (videoSrc) setPendingAdminVideoUrl(videoSrc);
                if (!isAdmin) {
                  setShowAdminAuthModal(true);
                } else {
                  setTrainingActiveTab('admin');
                }
              }}
              isAdmin={isAdmin}
            />
          )}

          {/* VIEW 4: LEADERBOARD & CERTIFICATE ALBUM */}
          {trainingActiveTab === 'leaderboard' && (
            <LeaderboardView
              trainings={trainings}
              completions={completions}
              currentBranchId={currentBranchId}
              currentPersonnel={currentPersonnel}
              isAdmin={isAdmin}
              onUpdateCompletion={handleUpdateCompletion}
              onDeleteCompletion={handleDeleteCompletion}
            />
          )}

          {/* VIEW 5: ADMIN TRAINING MANAGEMENT */}
          {trainingActiveTab === 'admin' && (
            isAdmin ? (
              <AdminTrainingPanel
                trainings={trainings}
                completions={completions}
                onSaveTraining={handleSaveTraining}
                onDeleteTraining={handleDeleteTraining}
                onOpenTrainingDetail={handleOpenTrainingDetail}
                onClose={() => setTrainingActiveTab('catalog')}
                onClearCompletions={handleClearCompletions}
                onDeleteCompletion={handleDeleteCompletion}
                onResetTrainings={handleResetTrainings}
                initialVideoUrl={pendingAdminVideoUrl}
                onClearInitialVideoUrl={() => setPendingAdminVideoUrl(null)}
                branches={branches}
                onSaveBranch={handleSaveBranch}
                onDeleteBranch={handleDeleteBranch}
                onUpdateBranchPassword={handleUpdateBranchPassword}
                onResetBranchPasswords={handleResetBranchPasswords}
                onResetBranchesToDefault={handleResetBranchesToDefault}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4">
                  <span className="text-2xl font-bold">🔒</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Yönetici İzni Gereklidir
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Yeni eğitim veya video eklemek, mevcut modülleri güncellemek ve şube başarı raporlarını indirmek için yönetici girişi yapınız.
                </p>
                <button
                  onClick={() => setShowAdminAuthModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 cursor-pointer"
                >
                  Yönetici Girişi Yap
                </button>
              </div>
            )
          )}
        </main>

        {/* Corporate Footer */}
        <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                E
              </div>
              <div>
                <p className="font-bold text-slate-200">
                  ESME Eğitim, İç Yönergeler Portalı
                </p>
                <p className="text-[11px] text-slate-400">
                  ESME Eğitim, İç Yönergeler Portalı • © {new Date().getFullYear()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-slate-400">Aktif Şube: <strong className="text-slate-200">{currentBranch.name}</strong></span>
              <span className="text-slate-400">Personel: <strong className="text-slate-200">{currentPersonnel}</strong></span>
              <button
                onClick={() => {
                  if (isAdmin) setIsAdmin(false);
                  else setShowAdminAuthModal(true);
                }}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                {isAdmin ? 'Yönetici Modunu Kapat' : 'Yönetici Girişi'}
              </button>
            </div>
          </div>
        </footer>

        {/* Small Moving AI Bot Robot at Bottom-Right (Reach Managers & Smart AI Assistant) */}
        <FloatingAIRobotBot
          trainings={trainings}
          announcements={announcements}
          currentBranchId={currentBranchId}
          currentPersonnel={currentPersonnel}
          isAdmin={isAdmin}
          onSelectTraining={handleOpenTrainingDetail}
        />

        {/* Detail / Classroom Modal */}
        {selectedTraining && (
          <TrainingDetailModal
            training={selectedTraining}
            initialTab={initialModalTab}
            onClose={() => setSelectedTrainingId(null)}
            currentBranchId={currentBranchId}
            currentBranchName={currentBranch.name}
            currentPersonnel={currentPersonnel}
            onRecordCompletion={handleRecordCompletion}
            onUpdateTrainingVideo={handleQuickUpdateVideo}
            isAlreadyCompleted={completions.some(c => c.trainingId === selectedTraining.id && c.branchId === currentBranchId)}
            isAdmin={isAdmin}
          />
        )}

        {/* Admin Authentication Modal */}
        <AdminAuthModal
          isOpen={showAdminAuthModal}
          onClose={() => setShowAdminAuthModal(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setTrainingActiveTab('admin');
          }}
        />
      </div>
    </div>
  );
}
