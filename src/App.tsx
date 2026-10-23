import React, { useState, useEffect } from 'react';
import { 
  TrainingDocument, 
  TrainingCategory, 
  TrainingCompletion,
  AppDatabase,
  User
} from './types';
import { 
  getStoredTrainings, 
  upsertTraining, 
  deleteTraining, 
  resetTrainingsToDefault,
  getStoredCompletions, 
  recordTrainingCompletion, 
  clearAllCompletions,
  deleteTrainingCompletion,
  subscribeToTrainingUpdates,
  fetchRemoteTrainings
} from './services/trainingStorage';
import { 
  getDatabase, 
  saveDatabase, 
  fetchRemoteDatabase 
} from './services/storage';
import { subscribeToFirestore } from './services/firebaseService';
import { officialEsmeBranches } from './mockData';

// Training Components
import { TrainingHeader } from './components/TrainingHeader';
import { TrainingCatalogView } from './components/TrainingCatalogView';
import { TrainingDetailModal } from './components/TrainingDetailModal';
import { EBookReader } from './components/EBookReader';
import { VideoHubView } from './components/VideoHubView';
import { AdminTrainingPanel } from './components/AdminTrainingPanel';
import { TebellugTrackingView } from './components/TebellugTrackingView';
import { AdminAuthModal } from './components/AdminAuthModal';

// Stock & Counting Components
import { LoginScreen } from './components/LoginScreen';
import { StorePanel } from './components/StorePanel';
import { AdminHeader, AdminTab } from './components/AdminHeader';
import { BranchesTab } from './components/BranchesTab';
import { AislesTab } from './components/AislesTab';
import { UsersTab } from './components/UsersTab';
import { ProductsTab } from './components/ProductsTab';
import { CountHistoryTab } from './components/CountHistoryTab';
import { ReportsTab } from './components/ReportsTab';
import { EvaluationsTab } from './components/EvaluationsTab';

export default function App() {
  // Master Portal Mode: 'training' (esmeegitim) vs 'sayim' (Stok & Kör Sayım)
  const [systemMode, setSystemMode] = useState<'training' | 'sayim'>(() => {
    try {
      const stored = localStorage.getItem('esme_active_system_mode');
      return (stored === 'sayim' || stored === 'training') ? stored : 'training';
    } catch {
      return 'training';
    }
  });

  // ==========================================
  // 1. TRAINING PORTAL STATE & HANDLERS
  // ==========================================
  const [trainings, setTrainings] = useState<TrainingDocument[]>(() => getStoredTrainings());
  const [completions, setCompletions] = useState<TrainingCompletion[]>(() => getStoredCompletions());
  const [trainingActiveTab, setTrainingActiveTab] = useState<'catalog' | 'ebook' | 'video' | 'tebellug' | 'admin'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrainingCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('esme_is_admin_mode') === 'true';
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

  // ==========================================
  // 2. STOCK & SAYIM PORTAL STATE & HANDLERS
  // ==========================================
  const [db, setDb] = useState<AppDatabase>(() => getDatabase());
  const [stockAdminTab, setStockAdminTab] = useState<AdminTab>('history');
  const [currentStockUser, setCurrentStockUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('esme_logged_stock_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Sync mode changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('esme_active_system_mode', systemMode);
    } catch {}
  }, [systemMode]);

  // Real-time Firestore sync for both training and stock databases
  useEffect(() => {
    // 1. Initial training fetch
    fetchRemoteTrainings().then(remote => {
      if (remote.trainings && remote.trainings.length > 0) {
        setTrainings(remote.trainings);
      }
      if (Array.isArray(remote.completions)) {
        setCompletions(remote.completions);
      }
    });

    // 2. Training updates subscription
    const unsubscribeTraining = subscribeToTrainingUpdates(
      (updatedTrainings) => setTrainings(updatedTrainings),
      (updatedCompletions) => setCompletions(updatedCompletions)
    );

    // 3. Initial stock database fetch
    fetchRemoteDatabase().then(remoteDb => {
      if (remoteDb && Array.isArray(remoteDb.branches) && Array.isArray(remoteDb.users)) {
        setDb(remoteDb);
      }
    });

    // 4. Stock database Firestore subscription
    const unsubscribeDb = subscribeToFirestore((remoteDb) => {
      if (remoteDb && Array.isArray(remoteDb.branches) && Array.isArray(remoteDb.users)) {
        setDb(remoteDb);
      }
    });

    return () => {
      unsubscribeTraining();
      unsubscribeDb();
    };
  }, []);

  // Sync branch & personnel context
  useEffect(() => {
    try {
      localStorage.setItem('esme_active_branch_id', String(currentBranchId));
      localStorage.setItem('esme_active_personnel_name', currentPersonnel);
      localStorage.setItem('esme_is_admin_mode', String(isAdmin));
    } catch {}
  }, [currentBranchId, currentPersonnel, isAdmin]);

  const currentBranch = officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

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

  const handleQuickUpdateVideo = async (trainingId: string, videoUrl: string, videoTitle?: string) => {
    const target = trainings.find(t => t.id === trainingId);
    if (!target) return;
    const updated: TrainingDocument = {
      ...target,
      videoType: 'link',
      videoUrl: videoUrl.trim(),
      videoTitle: videoTitle || target.videoTitle || target.title,
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

  // Stock Database update handler
  const handleUpdateDb = (updater: (prev: AppDatabase) => AppDatabase) => {
    setDb(prev => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  // Stock Login & Logout handlers
  const handleStockLogin = (user: User) => {
    setCurrentStockUser(user);
    try {
      localStorage.setItem('esme_logged_stock_user', JSON.stringify(user));
    } catch {}
    if (user.role === 'admin' || user.isSuperAdmin) {
      setIsAdmin(true);
    }
  };

  const handleStockLogout = () => {
    setCurrentStockUser(null);
    try {
      localStorage.removeItem('esme_logged_stock_user');
    } catch {}
  };

  const bilgiIslemCount = trainings.filter(t => t.category === 'bilgi-islem').length;
  const depocuCount = trainings.filter(t => t.category === 'depocu').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-colors selection:bg-red-500 selection:text-white">
      {/* ======================================================== */}
      {/* SYSTEM 1: EĞİTİM PORTALI (ESMEEGITIM)                    */}
      {/* ======================================================== */}
      {systemMode === 'training' && (
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
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
            onSwitchToSayim={() => setSystemMode('sayim')}
            totalCount={trainings.length}
            bilgiIslemCount={bilgiIslemCount}
            depocuCount={depocuCount}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
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

            {/* VIEW 4: TEBELLÜĞ & TAAHHÜT TRACKING */}
            {trainingActiveTab === 'tebellug' && (
              <TebellugTrackingView
                trainings={trainings}
                completions={completions}
                currentBranchId={currentBranchId}
                currentPersonnel={currentPersonnel}
                onOpenTrainingDetail={handleOpenTrainingDetail}
                onRecordCompletion={handleRecordCompletion}
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
                />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4">
                    <span className="text-2xl font-bold">🔒</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Yönetici İzni Gereklidir
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Yeni eğitim veya video eklemek, mevcut modülleri güncellemek ve resmi tebellüğ raporlarını indirmek için yönetici girişi yapınız.
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
                    Esme Şirketler Grubu — Bilgi İşlem & Depo Yönetimi Koordinatörlüğü
                  </p>
                  <p className="text-[11px] text-slate-500">
                    esmeegitim — Resmi İç Yönergeler, Eğitim Standartları ve Dijital Tebellüğ Portalı • © {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-slate-500">Aktif Şube: <strong className="text-slate-300">{currentBranch.name}</strong></span>
                <span className="text-slate-500">Personel: <strong className="text-slate-300">{currentPersonnel}</strong></span>
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
      )}

      {/* ======================================================== */}
      {/* SYSTEM 2: STOK & KÖR SAYIM PORTALI                       */}
      {/* ======================================================== */}
      {systemMode === 'sayim' && (
        <div className="flex-1 flex flex-col bg-slate-900 text-slate-100">
          {!currentStockUser ? (
            /* Stock Login Screen (Store staff or Admin) */
            <LoginScreen
              users={db.users}
              branches={db.branches}
              onLogin={handleStockLogin}
              onSwitchToTraining={() => setSystemMode('training')}
            />
          ) : currentStockUser.role === 'store' ? (
            /* Store Staff Counting & Barcode Scanning Panel */
            <StorePanel
              user={currentStockUser}
              db={db}
              onUpdateDb={handleUpdateDb}
              onLogout={handleStockLogout}
              onSwitchToTraining={() => setSystemMode('training')}
            />
          ) : (
            /* Admin Stock & Store Control Console */
            <div className="flex-1 flex flex-col">
              <AdminHeader
                currentTab={stockAdminTab}
                onTabChange={setStockAdminTab}
                onLogout={handleStockLogout}
                username={currentStockUser.username}
                currentUser={currentStockUser}
                onSwitchToTraining={() => setSystemMode('training')}
              />

              <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {stockAdminTab === 'branches' && (
                  <BranchesTab db={db} onUpdateDb={handleUpdateDb} />
                )}
                {stockAdminTab === 'aisles' && (
                  <AislesTab db={db} onUpdateDb={handleUpdateDb} />
                )}
                {stockAdminTab === 'users' && (
                  <UsersTab db={db} onUpdateDb={handleUpdateDb} currentUser={currentStockUser} />
                )}
                {stockAdminTab === 'products' && (
                  <ProductsTab db={db} onUpdateDb={handleUpdateDb} />
                )}
                {stockAdminTab === 'history' && (
                  <CountHistoryTab db={db} onUpdateDb={handleUpdateDb} currentUser={currentStockUser} />
                )}
                {stockAdminTab === 'reports' && (
                  <ReportsTab db={db} onUpdateDb={handleUpdateDb} />
                )}
                {stockAdminTab === 'evaluations' && (
                  <EvaluationsTab 
                    db={db} 
                    onUpdateDb={handleUpdateDb} 
                    adminUsername={currentStockUser.username}
                    currentUser={currentStockUser} 
                  />
                )}
              </main>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
