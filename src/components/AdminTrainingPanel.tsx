import React, { useState, useEffect } from 'react';
import { 
  TrainingDocument, 
  TrainingCategory, 
  TrainingPriority, 
  TrainingCompletion,
  TrainingChapter,
  TrainingQuizQuestion
} from '../types';
import { officialEsmeBranches } from '../mockData';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Video, 
  FileText, 
  Award, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  FileSpreadsheet, 
  Search,
  X,
  Save,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  UserPlus,
  Lock,
  Key,
  RotateCcw,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { isYouTubeUrl, getYouTubeThumbnailUrl, UniversalVideoPlayer } from '../utils/videoUtils';

export interface CustomAdminAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  isSuperAdmin?: boolean;
  createdAt: string;
}

interface AdminTrainingPanelProps {
  trainings: TrainingDocument[];
  completions: TrainingCompletion[];
  onSaveTraining: (training: TrainingDocument) => void;
  onDeleteTraining: (id: string) => void;
  onOpenTrainingDetail: (training: TrainingDocument) => void;
  onClose: () => void;
  onClearCompletions?: () => void;
  onResetTrainings?: () => void;
  initialVideoUrl?: string | null;
  onClearInitialVideoUrl?: () => void;
}

export const AdminTrainingPanel: React.FC<AdminTrainingPanelProps> = ({
  trainings,
  completions,
  onSaveTraining,
  onDeleteTraining,
  onOpenTrainingDetail,
  onClose,
  onClearCompletions,
  onResetTrainings,
  initialVideoUrl,
  onClearInitialVideoUrl
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'trainings' | 'reports' | 'admins'>('trainings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingDocument | null>(null);

  // Active Logged In Admin Check
  const [currentAdmin, setCurrentAdmin] = useState<{
    username: string;
    name: string;
    role: string;
    isSuperAdmin: boolean;
  }>(() => {
    try {
      const raw = localStorage.getItem('esme_current_admin');
      if (raw) return JSON.parse(raw);
    } catch {}
    // Default to O.BAS Super Admin
    return {
      username: 'O.BAS',
      name: 'O.BAŞ (Genel Yönetici)',
      role: 'Genel Yönetici (En Yetkili Yönetici)',
      isSuperAdmin: true
    };
  });

  // Custom Admin Accounts State
  const [customAdmins, setCustomAdmins] = useState<CustomAdminAccount[]>(() => {
    try {
      const raw = localStorage.getItem('esme_custom_admins');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // New & Edit Admin Form State (O.BAS Authorized Management)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPasswordText, setShowAdminPasswordText] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('Bölge Denetim Müdürü');
  const [adminIsSuper, setAdminIsSuper] = useState(false);
  const [showPasswordsInTable, setShowPasswordsInTable] = useState(false);

  // Master passwords overrides (O.BAS / T.CESUR)
  const [masterPasswords, setMasterPasswords] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('esme_admin_passwords');
      return raw ? JSON.parse(raw) : { 'O.BAS': '1864', 'T.CESUR': '9084' };
    } catch {
      return { 'O.BAS': '1864', 'T.CESUR': '9084' };
    }
  });

  // Form State for New/Edit Training
  const [formCategory, setFormCategory] = useState<TrainingCategory>('bilgi-islem');
  const [formPriority, setFormPriority] = useState<TrainingPriority>('zorunlu');
  const [formTitle, setFormTitle] = useState('');
  const [formSubTitle, setFormSubTitle] = useState('');
  const [formDocNo, setFormDocNo] = useState(`SOP-ESME-${new Date().getFullYear()}/01`);
  const [formScope, setFormScope] = useState('Tüm Mağazalar, Kasa ve Bilgi İşlem');
  const [formTargetUnit, setFormTargetUnit] = useState('Bilgi İşlem & Depo Yönetimi');
  const [formAuthor, setFormAuthor] = useState('O.BAŞ (Genel Yönetici)');
  const [formSummary, setFormSummary] = useState('');
  const [formPdfPath, setFormPdfPath] = useState('');

  // Video Form State
  const [videoInputType, setVideoInputType] = useState<'link' | 'file' | 'none'>('link');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoTitle, setFormVideoTitle] = useState('');
  const [formVideoDuration, setFormVideoDuration] = useState('05:00');
  const [deviceVideoFileName, setDeviceVideoFileName] = useState('');

  // Chapters & Quizzes
  const [chapters, setChapters] = useState<TrainingChapter[]>([
    {
      id: 'ch_1',
      title: 'Bölüm 1: Genel Kurallar ve İşlem Esasları',
      content: 'Buraya eğitimin detaylı prosedür maddelerini ve kurallarını yazınız.',
      highlights: ['İşlemlerde sıfır hata kuralı esastır.'],
      criticalNotes: ['Kural ihlallerinde denetim ve idari yaptırım uygulanır.']
    }
  ]);

  const [quizzes, setQuizzes] = useState<TrainingQuizQuestion[]>([
    {
      id: 'q_1',
      question: 'Bu talimatnamenin temel amacı nedir?',
      options: [
        'Operasyonel hataları sıfıra indirmek ve standart sağlamak',
        'Süreçleri geciktirmek',
        'Kayıtsız işlem yapmak',
        'Belge düzenlememek'
      ],
      correctOptionIndex: 0,
      explanation: 'Talimatname operasyonel hataları önlemek ve kurumsal standardı korumak için hazırlanmıştır.'
    }
  ]);

  // Sync custom admins to localStorage
  const saveCustomAdmins = (updated: CustomAdminAccount[]) => {
    setCustomAdmins(updated);
    try {
      localStorage.setItem('esme_custom_admins', JSON.stringify(updated));
    } catch {}
  };

  // Open New Admin Modal
  const handleOpenNewAdmin = () => {
    setEditingAdminId(null);
    setAdminUsername('');
    setAdminPassword('');
    setShowAdminPasswordText(false);
    setAdminName('');
    setAdminRole('Bölge Denetim Müdürü');
    setAdminIsSuper(false);
    setShowAdminModal(true);
  };

  // Open Edit Admin Modal for custom admins
  const handleOpenEditAdmin = (admin: CustomAdminAccount) => {
    setEditingAdminId(admin.id);
    setAdminUsername(admin.username);
    setAdminPassword(admin.password);
    setShowAdminPasswordText(false);
    setAdminName(admin.name);
    setAdminRole(admin.role);
    setAdminIsSuper(!!admin.isSuperAdmin);
    setShowAdminModal(true);
  };

  // Open Edit Password / Details for Master Accounts (O.BAS / T.CESUR)
  const handleOpenEditMaster = (username: 'O.BAS' | 'T.CESUR') => {
    setEditingAdminId(`master_${username}`);
    setAdminUsername(username);
    setAdminPassword(masterPasswords[username] || (username === 'O.BAS' ? '1864' : '9084'));
    setShowAdminPasswordText(false);
    setAdminName(username === 'O.BAS' ? 'O.BAŞ (Genel Yönetici)' : 'Turgut CESUR (B.İ. ve Kasa Müdürü)');
    setAdminRole(username === 'O.BAS' ? 'Genel Yönetici (En Yetkili Yönetici)' : 'B.İ. ve Kasa Müdürü');
    setAdminIsSuper(true);
    setShowAdminModal(true);
  };

  // Save admin (Create or Edit with Password Update)
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim() || !adminName.trim()) {
      alert('Lütfen kullanıcı adı, şifre ve ad soyad alanlarını doldurunuz.');
      return;
    }

    const u = adminUsername.trim().toUpperCase();

    // Check if editing a master account
    if (editingAdminId === 'master_O.BAS' || editingAdminId === 'master_T.CESUR') {
      const targetUser = editingAdminId === 'master_O.BAS' ? 'O.BAS' : 'T.CESUR';
      const updatedPasswords = {
        ...masterPasswords,
        [targetUser]: adminPassword.trim()
      };
      setMasterPasswords(updatedPasswords);
      try {
        localStorage.setItem('esme_admin_passwords', JSON.stringify(updatedPasswords));
      } catch {}
      setShowAdminModal(false);
      alert(`"${targetUser}" hesabının şifresi ve bilgileri başarıyla güncellendi. Yeni Şifre: ${adminPassword.trim()}`);
      return;
    }

    // Custom Admin Edit Mode
    if (editingAdminId) {
      const updated = customAdmins.map(a => {
        if (a.id !== editingAdminId) return a;
        return {
          ...a,
          username: u,
          password: adminPassword.trim(),
          name: adminName.trim(),
          role: adminRole.trim(),
          isSuperAdmin: adminIsSuper
        };
      });
      saveCustomAdmins(updated);
      setShowAdminModal(false);
      alert(`"${u}" yöneticisinin bilgileri ve şifresi başarıyla güncellendi.`);
      return;
    }

    // Custom Admin Create Mode
    if (u === 'O.BAS' || u === 'T.CESUR' || customAdmins.some(a => a.username.toUpperCase() === u)) {
      alert('Bu kullanıcı adı sistemde zaten kayıtlıdır!');
      return;
    }

    const newAdmin: CustomAdminAccount = {
      id: `admin_${Date.now()}`,
      username: u,
      password: adminPassword.trim(),
      name: adminName.trim(),
      role: adminRole.trim(),
      isSuperAdmin: adminIsSuper,
      createdAt: new Date().toISOString()
    };

    saveCustomAdmins([...customAdmins, newAdmin]);
    setShowAdminModal(false);
    alert(`"${u}" kullanıcısı yetkili yönetici olarak başarıyla sisteme tanımlandı. Belirlenen Şifre: ${adminPassword.trim()}`);
  };

  // Delete custom admin account
  const handleDeleteAdmin = (id: string, name: string) => {
    if (confirm(`"${name}" yöneticisini silmek istediğinize emin misiniz?`)) {
      saveCustomAdmins(customAdmins.filter(a => a.id !== id));
    }
  };

  // Clear all completions (O.BAS Super Admin Action)
  const handleClearAllCompletions = () => {
    if (confirm('DİKKAT: Tüm şubelerin imzalanmış tebellüğ kayıtları ve sınav sonuçları sıfırlanacaktır. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      if (confirm('Son Onay: Gerçekten tüm tebellüğ kayıtlarını temizlemek istediğinizi onaylıyor musunuz?')) {
        try {
          localStorage.removeItem('esme_training_completions');
        } catch {}
        if (onClearCompletions) {
          onClearCompletions();
        }
        window.location.reload();
      }
    }
  };

  // Open modal in create mode
  const handleOpenCreate = (prefillVideoUrl?: string) => {
    setEditingTraining(null);
    setFormCategory('bilgi-islem');
    setFormPriority('zorunlu');
    setFormTitle('');
    setFormSubTitle('');
    setFormDocNo(`TLM-EGT-${new Date().getFullYear()}/${trainings.length + 1}`);
    setFormScope('Tüm Mağazalar, Kasa ve Bilgi İşlem');
    setFormTargetUnit('Bilgi İşlem & Depo Yönetimi');
    setFormAuthor('O.BAŞ (Genel Yönetici)');
    setFormSummary('');
    setFormPdfPath('/assets/aistudio/Bilgi___lem_ve_Kasa_Y_netimi_Genel_E_itim_Talimat__085ba22b.pdf');
    setVideoInputType('link');
    setFormVideoUrl(prefillVideoUrl || '');
    setFormVideoTitle('');
    setFormVideoDuration('05:00');
    setDeviceVideoFileName('');
    setChapters([
      {
        id: 'ch_1',
        title: 'Bölüm 1: Standart Operasyon Kuralları',
        content: 'Buraya ilgili operasyonun tüm detaylarını, yapılması gerekenleri yazınız.',
        highlights: ['Tüm adımlar eksiksiz uygulanmalıdır.'],
        criticalNotes: ['Hatalı işlemlerde derhal ilgili birime bilgi verilmelidir.']
      }
    ]);
    setShowAddModal(true);
  };

  useEffect(() => {
    if (initialVideoUrl) {
      handleOpenCreate(initialVideoUrl);
      if (onClearInitialVideoUrl) onClearInitialVideoUrl();
    }
  }, [initialVideoUrl]);

  // Open modal in edit mode
  const handleOpenEdit = (training: TrainingDocument) => {
    setEditingTraining(training);
    setFormCategory(training.category);
    setFormPriority(training.priority);
    setFormTitle(training.title);
    setFormSubTitle(training.subTitle);
    setFormDocNo(training.docNo);
    setFormScope(training.scope);
    setFormTargetUnit(training.targetUnit);
    setFormAuthor(training.authorOrManager);
    setFormSummary(training.summary);
    setFormPdfPath(training.pdfPath || '');
    setFormVideoUrl(training.videoUrl || '');
    setFormVideoTitle(training.videoTitle || '');
    setFormVideoDuration(training.videoDuration || '05:00');
    setVideoInputType(training.videoType === 'none' ? 'none' : (training.videoType || 'link'));
    setChapters(training.chapters || []);
    setQuizzes(training.quiz || []);
    setShowAddModal(true);
  };

  // Save new or updated training
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Lütfen bir eğitim başlığı giriniz.');
      return;
    }

    const hasValidVideo = videoInputType !== 'none' && Boolean(formVideoUrl.trim());

    const payload: TrainingDocument = {
      ...(editingTraining || {}),
      id: editingTraining ? editingTraining.id : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: formTitle.trim(),
      subTitle: formSubTitle.trim() || 'Standart Kurumsal Yönerge ve Uygulama Prosedürü',
      category: formCategory,
      docNo: formDocNo.trim() || 'TLM-EGT-2026/01',
      scope: formScope.trim(),
      targetUnit: formTargetUnit.trim(),
      authorOrManager: formAuthor.trim(),
      priority: formPriority,
      summary: formSummary.trim() || formTitle.trim(),
      pdfPath: formPdfPath.trim() || undefined,
      videoType: hasValidVideo ? videoInputType : 'none',
      videoUrl: hasValidVideo ? formVideoUrl.trim() : undefined,
      videoTitle: formVideoTitle.trim() || formTitle.trim(),
      videoDuration: formVideoDuration.trim() || '05:00',
      chapters: chapters.length > 0 ? chapters : [
        {
          id: 'ch_1',
          title: 'Genel Kurallar',
          content: formSummary.trim() || 'Genel operasyonel kurallar.'
        }
      ],
      quiz: quizzes,
      isCustom: editingTraining ? editingTraining.isCustom : true,
      createdAt: editingTraining?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveTraining(payload);
    setShowAddModal(false);
  };

  // Export completion report to Excel
  const handleExportExcel = () => {
    const rows = completions.map(c => ({
      'Tebellüğ No': c.certificateId,
      'Eğitim Adı': c.trainingTitle,
      'Kategori': c.category === 'bilgi-islem' ? 'Bilgi İşlem' : 'Depocu',
      'Şube Kodu': officialEsmeBranches.find(b => b.id === c.branchId)?.code || '',
      'Şube Adı': c.branchName,
      'Personel Ad Soyad': c.personnelName,
      'Görevi': c.personnelRole,
      'Sınav Skoru': `${c.quizScore ?? 0} / ${c.quizTotal ?? 0}`,
      'Sınav Durumu': c.quizPassed ? 'Başarılı' : 'Geliştirilmeli',
      'Taahhütname Onayı': c.signedAgreement ? 'Onaylandı' : 'Bekliyor',
      'Tarih & Saat': new Date(c.completedAt).toLocaleString('tr-TR')
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tebellüğ Raporu");
    XLSX.writeFile(wb, `esmeegitim_Tebellug_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Panel Header with Super Admin O.BAS Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-amber-900/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" /> esmeegitim Yönetim Paneli
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              En Yetkili Yönetici: {currentAdmin.name} ({currentAdmin.username})
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Eğitim İçeriği, Tebellüğ & Yetkili Yönetici Merkezi
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Yeni eğitim ve videolar ekleyin, mevcut modülleri düzenleyin, yeni yöneticiler tanımlayın ve 35 Esme şubesinin tebellüğ durumlarını canlı takip edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenCreate()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Eğitim Ekle</span>
          </button>
        </div>
      </div>

      {/* Admin Sub Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveAdminTab('trainings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeAdminTab === 'trainings'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500" />
          Katalog & Eğitim Yönetimi ({trainings.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeAdminTab === 'reports'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          Şube Tebellüğ Raporları ({completions.length} Onay)
        </button>

        <button
          onClick={() => setActiveAdminTab('admins')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeAdminTab === 'admins'
              ? 'bg-red-700 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          Süper Yönetici & Yönetici Hesapları ({2 + customAdmins.length})
        </button>
      </div>

      {/* TAB 1: TRAININGS LIST & MANAGEMENT */}
      {activeAdminTab === 'trainings' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Doküman No</th>
                    <th className="p-3.5">Eğitim Başlığı</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Öncelik</th>
                    <th className="p-3.5">Video / Sunum</th>
                    <th className="p-3.5">Sorumlu Birim</th>
                    <th className="p-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trainings.map(t => {
                    const isBI = t.category === 'bilgi-islem';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                          {t.docNo}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {t.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {t.subTitle}
                          </p>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isBI ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          }`}>
                            {isBI ? 'Bilgi İşlem' : 'Depocu'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {t.priority === 'kritik' ? (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded">
                              Kritik
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                              Zorunlu
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {t.isPresentation && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                                📊 Slayt
                              </span>
                            )}
                            {t.videoUrl ? (
                              <span className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                                <Video className="w-3 h-3 text-sky-500" /> {t.videoDuration || 'Var'}
                              </span>
                            ) : (
                              !t.isPresentation && <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {t.targetUnit}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenTrainingDetail(t)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                              title="Önizle / Oku"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition"
                              title="Düzenle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {/* O.BAS can delete any training, custom or default if needed */}
                            {(t.isCustom || currentAdmin.username === 'O.BAS') && (
                              <button
                                onClick={() => {
                                  if (confirm(`"${t.title}" eğitimini silmek istediğinize emin misiniz?`)) {
                                    onDeleteTraining(t.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS & COMPLETION MATRIX */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Resmi Tebellüğ İmzaları & Taahhütname Kayıtları
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toplam {completions.length} onay kaydı bulunmaktadır.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentAdmin.username === 'O.BAS' && completions.length > 0 && (
                <button
                  onClick={handleClearAllCompletions}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-300 dark:border-rose-800 transition cursor-pointer"
                  title="Tüm şube imzalarını temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kayıtları Temizle</span>
                </button>
              )}

              <button
                onClick={handleExportExcel}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel Olarak İndir (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Completions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Tebellüğ No</th>
                    <th className="p-3.5">Şube</th>
                    <th className="p-3.5">Personel</th>
                    <th className="p-3.5">Eğitim Başlığı</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Sınav Skoru</th>
                    <th className="p-3.5">Tarih / Saat</th>
                    <th className="p-3.5">Taahhüt Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {completions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Henüz kayıtlı bir tebellüğ onay kaydı bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    completions.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {c.certificateId}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {c.branchName}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                          {c.personnelName}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {c.trainingTitle}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.category === 'bilgi-islem' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          }`}>
                            {c.category === 'bilgi-islem' ? 'Bilgi İşlem' : 'Depocu'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-semibold">
                          {c.quizScore ?? 0} / {c.quizTotal ?? 0}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(c.completedAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> İmzalandı
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SUPER ADMIN & ADMIN ACCOUNTS (O.BAS DEDICATED CONSOLE) */}
      {activeAdminTab === 'admins' && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-5 rounded-2xl border border-red-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold mb-2 border border-red-500/30">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                O.BAS Süper Yönetici Konsolu
              </div>
              <h3 className="text-xl font-extrabold">
                Yetkili Yönetici Hesapları & Tam Sistem Kontrolü
              </h3>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                O.BAS en yetkili yönetici olarak tüm eğitimleri düzenleme, yeni yöneticiler atama, şube kayıtlarını sıfırlama ve sistem temizleme yetkisine sahiptir.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPasswordsInTable(!showPasswordsInTable)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title="Şifreleri Göster / Gizle"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>{showPasswordsInTable ? 'Şifreleri Gizle' : 'Şifreleri Göster'}</span>
              </button>

              <button
                onClick={handleOpenNewAdmin}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-red-900/40 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Yeni Yetkili Kullanıcı / Yönetici Aç</span>
              </button>
            </div>
          </div>

          {/* Admins Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                Kayıtlı ve Yetkili Yönetici Hesapları (O.BAS Yönetiminde)
              </h4>
              <span className="text-xs text-slate-400">
                Toplam {2 + customAdmins.length} Yetkili Hesap
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Kullanıcı Adı</th>
                    <th className="p-3.5">Ad Soyad</th>
                    <th className="p-3.5">Kurumsal Görevi</th>
                    <th className="p-3.5">Yetki Seviyesi</th>
                    <th className="p-3.5">Tanımlı Şifre</th>
                    <th className="p-3.5">Durum</th>
                    <th className="p-3.5 text-right">İşlem & Şifre Belirleme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Default 1: O.BAS */}
                  <tr className="bg-amber-50/40 dark:bg-amber-950/20 font-medium">
                    <td className="p-3.5 font-mono font-black text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      O.BAS
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      O.BAŞ
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      Genel Yönetici
                    </td>
                    <td className="p-3.5">
                      <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                        ★ EN YETKİLİ SÜPER YÖNETİCİ
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-600">
                      {showPasswordsInTable ? (masterPasswords['O.BAS'] || '1864') : '••••••'}
                    </td>
                    <td className="p-3.5">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Kök Sistem Hesabı
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditMaster('O.BAS')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        title="O.BAS Şifresini ve Bilgilerini Düzenle"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Şifre Belirle</span>
                      </button>
                    </td>
                  </tr>

                  {/* Default 2: T.CESUR */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      T.CESUR
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      Turgut CESUR
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      B.İ. ve Kasa Müdürü
                    </td>
                    <td className="p-3.5">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        Yönetici & Eğitmen
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-600">
                      {showPasswordsInTable ? (masterPasswords['T.CESUR'] || '9084') : '••••••'}
                    </td>
                    <td className="p-3.5 text-emerald-600 font-medium">
                      Aktif
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditMaster('T.CESUR')}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        title="T.CESUR Şifresini Belirle / Düzenle"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Şifre Belirle</span>
                      </button>
                    </td>
                  </tr>

                  {/* Custom Admins Created by O.BAS */}
                  {customAdmins.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {admin.username}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {admin.name}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {admin.role}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          {admin.isSuperAdmin ? 'Yetkili Yönetici (Tam)' : 'Yönetici'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-purple-600">
                        {showPasswordsInTable ? admin.password : '••••••'}
                      </td>
                      <td className="p-3.5 text-emerald-600 font-medium">
                        Aktif
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditAdmin(admin)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="Yöneticiyi Düzenle ve Şifre Belirle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Düzenle / Şifre</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-600 transition cursor-pointer"
                            title="Yönetici Hesabını Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Super Admin Control Actions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Süper Yönetici Sıfırlama ve Temizleme Araçları (Yalnızca O.BAS)
            </h4>
            <p className="text-xs text-slate-500">
              Bu alandaki işlemler doğrudan veritabanını ve yerel kayıtları etkiler. Yalnızca Genel Yönetici O.BAS tarafından uygulanabilir.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between gap-3">
                <div>
                  <h5 className="font-bold text-xs text-rose-900 dark:text-rose-300">
                    Tüm Şube Tebellüğ İmzalarını Sıfırla
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    35 şubenin sisteme kaydettiği tüm tebellüğ taahhütname onaylarını ve sertifikalarını temizler.
                  </p>
                </div>
                <button
                  onClick={handleClearAllCompletions}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Tebellüğ Kayıtlarını Sıfırla</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    Varsayılan 11 Eğitimi Geri Yükle
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Silinen veya değiştirilen resmi yönergeleri ve sunumları fabrika ayarlarına sıfırlar.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Tüm eğitimler fabrika ayarlarına döndürülecektir. Devam edilsin mi?')) {
                      if (onResetTrainings) {
                        onResetTrainings();
                      } else {
                        localStorage.removeItem('esme_akademi_trainings_v2');
                        localStorage.removeItem('esme_deleted_training_ids_v1');
                        window.location.reload();
                      }
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Fabrika Ayarlarına Dön</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CREATE & EDIT ADMIN MODAL (O.BAS AUTHORIZED CONSOLE) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-600">
                {editingAdminId ? <Edit3 className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {editingAdminId ? 'Yetkili Yöneticiyi Düzenle & Şifre Belirle' : 'Yeni Yetkili Kullanıcı / Yönetici Aç'}
                </h3>
                <p className="text-xs text-slate-500">
                  O.BAS Onayıyla Yönetici Kaydı ve Şifre Yönetimi
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Yönetici Kullanıcı Adı:
                </label>
                <input
                  type="text"
                  required
                  disabled={editingAdminId === 'master_O.BAS' || editingAdminId === 'master_T.CESUR'}
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toUpperCase())}
                  placeholder="Örn: A.YILMAZ"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold uppercase disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    {editingAdminId ? 'Yeni Şifre Belirleyin:' : 'Yönetici Şifresi:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdminPasswordText(!showAdminPasswordText)}
                    className="text-[11px] text-red-500 hover:underline font-semibold"
                  >
                    {showAdminPasswordText ? 'Gizle' : 'Şifreyi Göster'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPasswordText ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Şifreyi buraya yazınız (Örn: 1864)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono font-bold pr-10 text-slate-900 dark:text-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Kullanıcı sisteme giriş yaparken bu şifreyi kullanacaktır.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Yöneticinin Adı Soyadı:
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kurumsal Görevi / Departmanı:
                </label>
                <input
                  type="text"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  placeholder="Örn: Bölge Denetim Müdürü / Depo Amiri"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="superCheck"
                  checked={adminIsSuper}
                  disabled={editingAdminId === 'master_O.BAS'}
                  onChange={(e) => setAdminIsSuper(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="superCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Tam Yetkili Yönetici (Tüm Alanlarda Düzenleme & Silme Yetkisi)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAdminId ? 'Değişiklikleri Kaydet' : 'Yöneticiyi Kaydet'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CREATE / EDIT TRAINING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" />
                {editingTraining ? 'Eğitimi Düzenle' : 'Yeni Eğitim ve Yönerge Ekle'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
              
              {/* Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Eğitim Kategorisi:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TrainingCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold"
                  >
                    <option value="bilgi-islem">Bilgi İşlem Eğitim (Kasa, ERP, Finans, Hukuk, Depo Prosedürleri)</option>
                    <option value="depocu">Depocu Eğitim (Motosiklet, Sevkiyat, Slayt Sunumları)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Öncelik Seviyesi:
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TrainingPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold"
                  >
                    <option value="zorunlu">Zorunlu İç Genelge (Standart)</option>
                    <option value="kritik">Sıfır Tolerans & Kritik Kural (Yasal Cezalı)</option>
                    <option value="standart">Standart Bilgilendirme Kılavuzu</option>
                  </select>
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Eğitim Başlığı:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: POS ve Kasa İptal Prosedürleri"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Alt Başlık / Prosedür Tanımı:
                  </label>
                  <input
                    type="text"
                    value={formSubTitle}
                    onChange={(e) => setFormSubTitle(e.target.value)}
                    placeholder="Örn: Gün Sonu Kasa Mutabakat Standartları"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                  />
                </div>
              </div>

              {/* Doc No & Target Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Doküman / Yönerge No:
                  </label>
                  <input
                    type="text"
                    value={formDocNo}
                    onChange={(e) => setFormDocNo(e.target.value)}
                    placeholder="Örn: SOP-Bİ-2026/05"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hedef Kitle / Kapsam:
                  </label>
                  <input
                    type="text"
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    placeholder="Örn: Tüm Mağazalar & Kasa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sorumlu Birim / Yetkili:
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Örn: O.BAŞ (Genel Yönetici)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Eğitim Özeti (Katalogda Görünecek Açıklama):
                </label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Bu eğitimin amacı, uyulması gereken temel ilkeler..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                />
              </div>

              {/* VIDEO ATTACHMENT SECTION (ONLY ADMINS CAN UPLOAD / ADD VIDEOS) */}
              <div className="bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-extrabold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-sky-600" />
                    Videolu Eğitim & YouTube Entegrasyonu (Anlık Tüm Kullanıcılara Yansır)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoInputType('link')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${videoInputType === 'link' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      YouTube / Web Linki
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputType('file')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${videoInputType === 'file' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      Cihazımdan Seç
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoInputType('none');
                        setFormVideoUrl('');
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${videoInputType === 'none' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      Video Yok
                    </button>
                  </div>
                </div>

                {videoInputType === 'link' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          YouTube Linki veya MP4 Web Adresi:
                        </label>
                        <input
                          type="text"
                          value={formVideoUrl}
                          onChange={(e) => setFormVideoUrl(e.target.value)}
                          placeholder="Örn: https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Tahmini Video Süresi:
                        </label>
                        <input
                          type="text"
                          value={formVideoDuration}
                          onChange={(e) => setFormVideoDuration(e.target.value)}
                          placeholder="Örn: 05:00"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        Video Başlığı (İsteğe Bağlı):
                      </label>
                      <input
                        type="text"
                        value={formVideoTitle}
                        onChange={(e) => setFormVideoTitle(e.target.value)}
                        placeholder="Örn: Kasa İşlemleri Uygulamalı Eğitim Videosu"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                      />
                    </div>

                    {/* Live Preview inside Modal if YouTube or Video URL entered */}
                    {formVideoUrl.trim() && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span className="font-bold text-emerald-400">
                            ✓ Canlı Video Önizlemesi ({isYouTubeUrl(formVideoUrl) ? 'YouTube Videosu Algılandı' : 'Doğrudan Video Bağlantısı'})
                          </span>
                        </div>
                        <div className="aspect-video max-h-56 w-full rounded-lg overflow-hidden bg-black">
                          <UniversalVideoPlayer src={formVideoUrl} title={formVideoTitle || formTitle || 'Önizleme'} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {videoInputType === 'file' && (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-300 dark:border-sky-800 rounded-xl cursor-pointer hover:bg-sky-100/50 dark:hover:bg-sky-950/40 transition">
                      <Upload className="w-6 h-6 text-sky-600 mb-1" />
                      <span className="font-bold text-sky-900 dark:text-sky-300">
                        {deviceVideoFileName ? `Seçilen Video: ${deviceVideoFileName}` : 'Telefonunuzdan veya Bilgisayarınızdan Video Seçin'}
                      </span>
                      <span className="text-[11px] text-slate-500 text-center mt-1">
                        Not: Diğer tüm şube ve cihazlardaki kullanıcıların anında izleyebilmesi için <strong>YouTube / Web Linki</strong> sekmesini kullanmanız önerilir.
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFormVideoUrl(url);
                            setDeviceVideoFileName(file.name);
                            setFormVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
                            setVideoInputType('file');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* PDF ATTACHMENT */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bağlanacak Resmi Yönerge PDF Dosyası:
                </label>
                <select
                  value={formPdfPath}
                  onChange={(e) => setFormPdfPath(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-xs"
                >
                  <option value="">(PDF Yok)</option>
                  <option value="/assets/aistudio/Bilgi___lem_ve_Kasa_Y_netimi_Genel_E_itim_Talimat__085ba22b.pdf">Bilgi İşlem ve Kasa Yönetimi (Bİ-EGT-2026/04)</option>
                  <option value="/assets/aistudio/Bilgi_G_venli_i__KVKK_ve_Kurumsal_Payla__mlar_Talimatnamesi_e0f3bfc8.pdf">Bilgi Güvenliği ve KVKK Talimatı (TLM-BG-2026/01)</option>
                  <option value="/assets/aistudio/Kredi_Kart____lemleri_Uygulama_ve_Denetim_Talimat__987fed7c.pdf">Kredi Kartı İşlem Talimatı (TLM-OP-2024/03)</option>
                  <option value="/assets/aistudio/Banka_Havalesi_ve_EFT__ade_S_re__Talimat__62b98dc9.pdf">Banka Havalesi ve EFT İade Talimatı (TLM-FN-2024/05)</option>
                  <option value="/assets/aistudio/Kasa_Eksik_ve_Fazla_Para_Y_netim_Talimatnamesi_47fed698.pdf">Kasa Eksik ve Fazla Para Talimatı (TLM-KSA-2026/09)</option>
                  <option value="/assets/aistudio/_deme_D_zeltme_ve_Hatal__Taksit__ptal_Talimatnamesi_bc66aa27.pdf">Ödeme Düzeltme İşlemleri Talimatı (TLM-KSA-2026/08)</option>
                  <option value="/assets/aistudio/Resmi_Evrak_ve_Tebligat_Y_netim_Talimat__d1a97de3.pdf">Resmi Evrak ve Tebligat Talimatı (TLM-HK-2024/02)</option>
                  <option value="/assets/aistudio/_meili_Cep_Telefonu_Envanteri_D_kme_E_itim_K_lavuzu_c25e3b44.pdf">IMEI'li Cep Telefonu Envanteri (EGT-BT-2025/01)</option>
                  <option value="/assets/aistudio/Motor_Sat____Faturalama_ve_Teslimat_S_reci_Y_nergesi_bf7afb54.pdf">Motor Satış, Faturalama ve Teslimat (SOP-MTR-2026/01)</option>
                  <option value="/assets/aistudio/Sunny_Motor_Sat___ve_Fatura_S_re__Talimat__e151ec1e.pdf">Sunny Motor Satış ve Fatura Prosedürü (TLM-MTR-SUNNY)</option>
                  <option value="/assets/aistudio/Motor_Sat____Kredi__stihbarat_ve_Teslimat_Talimatnamesi_6bd29342.pdf">Motor Satışı Kredi İstihbarat (TLM-İST-2026/02)</option>
                  <option value="/assets/aistudio/ESME_Depocu_E_itim_ve_G_rev_Tan_m__Sunum_Kitap_____dcab1f65.pdf">Depocu Eğitim ve Görev Tanımı Kitapçığı & Sunumu (Ömer BAŞ & Turgut CESUR)</option>
                </select>
              </div>

              {/* Chapters section */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200">
                    Eğitim Maddeleri & Bölümleri ({chapters.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setChapters([
                        ...chapters,
                        {
                          id: `ch_${Date.now()}`,
                          title: `Bölüm ${chapters.length + 1}: Yeni Madde`,
                          content: 'Prosedür maddesi detayları...'
                        }
                      ]);
                    }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded text-[11px]"
                  >
                    + Madde Ekle
                  </button>
                </div>

                {chapters.map((chap, cIdx) => (
                  <div key={chap.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {cIdx + 1}. Bölüm Başlığı
                      </span>
                      {chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setChapters(chapters.filter((_, i) => i !== cIdx))}
                          className="text-rose-500 hover:text-rose-400 text-[11px]"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={chap.title}
                      onChange={(e) => {
                        const updated = [...chapters];
                        updated[cIdx].title = e.target.value;
                        setChapters(updated);
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={chap.content}
                      onChange={(e) => {
                        const updated = [...chapters];
                        updated[cIdx].content = e.target.value;
                        setChapters(updated);
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-900/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTraining ? 'Değişiklikleri Kaydet' : 'Eğitimi Yayınla'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
