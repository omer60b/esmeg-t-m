import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Settings, 
  Search, 
  LogOut, 
  LogIn, 
  FileCheck2,
  Trophy, 
  Bell, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { TrainingCategory } from '../types';
import { officialEsmeBranches } from '../mockData';
import { Branch } from '../types';
import { updateBranchPassword } from '../services/branchStorage';

export type AppThemeMode = 'sepia' | 'light' | 'dark';

interface TrainingHeaderProps {
  activeTab: 'catalog' | 'ebook' | 'video' | 'leaderboard' | 'admin';
  setActiveTab: (tab: 'catalog' | 'ebook' | 'video' | 'leaderboard' | 'admin') => void;
  selectedCategory: 'all' | TrainingCategory;
  setSelectedCategory: (cat: 'all' | TrainingCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentBranchId: number;
  setCurrentBranchId: (id: number) => void;
  currentPersonnel: string;
  setCurrentPersonnel: (name: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenAdminAuth: () => void;
  branches?: Branch[];
  onStoreLogout?: () => void;
  onUpdateBranchPassword?: (branchId: number, newPassword: string) => Promise<void> | void;
  totalCount?: number;
  bilgiIslemCount?: number;
  depocuCount?: number;
  appTheme?: AppThemeMode;
  setAppTheme?: (theme: AppThemeMode) => void;
  pendingCount?: number;
  onClickPendingBell?: () => void;
}

export const TrainingHeader: React.FC<TrainingHeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentBranchId,
  setCurrentBranchId,
  currentPersonnel,
  setCurrentPersonnel,
  isAdmin,
  setIsAdmin,
  onOpenAdminAuth,
  branches: propsBranches,
  onStoreLogout,
  onUpdateBranchPassword,
  appTheme = 'sepia',
  setAppTheme,
  pendingCount = 0,
  onClickPendingBell
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const branchList = propsBranches && propsBranches.length > 0 ? propsBranches : officialEsmeBranches;
  const currentBranch = branchList.find(b => b.id === currentBranchId) || branchList[0];

  // In-app Store Password Change Modal State
  const [showStorePasswordModal, setShowStorePasswordModal] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);
  const [passwordModalSuccess, setPasswordModalSuccess] = useState<string | null>(null);

  // Branch Switch Password Verification Modal State (each branch has unique login)
  const [showBranchSwitchModal, setShowBranchSwitchModal] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState<number | null>(null);
  const [branchSwitchPassword, setBranchSwitchPassword] = useState('');
  const [showSwitchPasswordText, setShowSwitchPasswordText] = useState(false);
  const [branchSwitchError, setBranchSwitchError] = useState<string | null>(null);
  const [branchSwitchSuccess, setBranchSwitchSuccess] = useState<string | null>(null);

  const targetBranch = targetBranchId ? branchList.find(b => b.id === targetBranchId) : null;

  const handleBranchSelectChange = (newBranchId: number) => {
    if (newBranchId === currentBranchId) return;

    if (isAdmin) {
      // Administrator has global oversight and can switch branches freely
      setCurrentBranchId(newBranchId);
      return;
    }

    // Branch users: prompt for target branch password!
    setTargetBranchId(newBranchId);
    setBranchSwitchPassword('');
    setBranchSwitchError(null);
    setBranchSwitchSuccess(null);
    setShowUserDropdown(false);
    setShowBranchSwitchModal(true);
  };

  const handleBranchSwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchSwitchError(null);

    if (!targetBranch) {
      setBranchSwitchError('Lütfen geçerli bir mağaza seçiniz.');
      return;
    }

    const trimmedInput = branchSwitchPassword.trim();
    if (!trimmedInput) {
      setBranchSwitchError(`Lütfen "${targetBranch.name}" mağazasının giriş şifresini yazınız.`);
      return;
    }

    const targetPassword = targetBranch.password?.trim() || '1122';
    if (trimmedInput !== targetPassword) {
      setBranchSwitchError(`Hatalı şifre! "${targetBranch.name}" mağazasının giriş şifresini kontrol ediniz.`);
      return;
    }

    // Success: store authenticated for new branch
    setCurrentBranchId(targetBranch.id);
    try {
      localStorage.setItem('esme_active_branch_id', String(targetBranch.id));
      localStorage.setItem('esme_store_authenticated', 'true');
    } catch {}

    setBranchSwitchSuccess(`"${targetBranch.name}" mağazasına başarıyla geçiş yapıldı!`);
    setTimeout(() => {
      setShowBranchSwitchModal(false);
      setBranchSwitchSuccess(null);
      setTargetBranchId(null);
      setBranchSwitchPassword('');
    }, 700);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/40 border border-red-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white font-sans">
                  ESME <span className="text-red-500">Eğitim</span>
                </span>
                <span className="text-[10px] bg-red-600/30 text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase">
                  Esme AVM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                İç Yönergeler Portalı
              </p>
            </div>
          </div>

          {/* Search Box in Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Yönerge, madde, şase no, EFT hesap no, kural ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Eğitimler</span>
            </button>

            <button
              onClick={() => setActiveTab('ebook')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ebook'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">E-Kitap</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Videolar</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Başarı Sıralaması</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                    : 'text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">Yönetici Paneli</span>
              </button>
            )}

            {/* Global Theme Switcher (Kitap Kağıdı / Açık / Koyu) for All Pages */}
            {setAppTheme && (
              <div className="hidden xl:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs ml-1">
                <button
                  type="button"
                  onClick={() => setAppTheme('sepia')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    appTheme === 'sepia'
                      ? 'bg-[#fbf0d9] text-[#2b1d0f] shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Kitap Kağıdı Teması"
                >
                  Kitap Kağıdı
                </button>
                <button
                  type="button"
                  onClick={() => setAppTheme('light')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    appTheme === 'light'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Açık Tema"
                >
                  Açık
                </button>
                <button
                  type="button"
                  onClick={() => setAppTheme('dark')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    appTheme === 'dark'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Koyu Tema"
                >
                  Koyu
                </button>
              </div>
            )}

            {/* Pending Trainings Notification Bell */}
            <button
              type="button"
              onClick={onClickPendingBell}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer ml-1"
              title={
                pendingCount > 0
                  ? `${pendingCount} Bekleyen Eğitim Modülü`
                  : 'Tüm Eğitimler Tamamlandı'
              }
            >
              <Bell className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Personnel & Branch Switcher Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-red-900/60 border border-red-500/40 flex items-center justify-center text-red-300 font-bold">
                  {currentPersonnel.charAt(0) || 'P'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                    {currentPersonnel || 'Personel'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[110px]">
                    {currentBranch.name}
                  </p>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="pb-2 border-b border-slate-800 mb-2">
                    <p className="text-xs font-semibold text-slate-300">Aktif Şube ve Personel Bilgisi</p>
                    <p className="text-[11px] text-slate-400">Sınav ve sertifikalarda bu bilgiler yer alır</p>
                  </div>

                  <div className="space-y-2.5 mb-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Şubeniz ({branchList.length} Esme Mağazası):</label>
                      <select
                        value={currentBranchId}
                        onChange={(e) => handleBranchSelectChange(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-md p-1.5 focus:ring-1 focus:ring-red-500 cursor-pointer"
                      >
                        {branchList.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.city || 'Merkez'})
                          </option>
                        ))}
                      </select>
                      {!isAdmin && (
                        <p className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 shrink-0" />
                          <span>Farklı şube seçildiğinde mağaza giriş şifresi istenir.</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Adınız Soyadınız:</label>
                      <input
                        type="text"
                        value={currentPersonnel}
                        onChange={(e) => setCurrentPersonnel(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-md p-1.5 focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    {/* Theme Selector in Dropdown for Mobile / Tablet */}
                    {setAppTheme && (
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Sayfa Görünüm Teması:</label>
                        <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            onClick={() => setAppTheme('sepia')}
                            className={`py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                              appTheme === 'sepia'
                                ? 'bg-[#fbf0d9] text-[#2b1d0f]'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Kitap Kağıdı
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppTheme('light')}
                            className={`py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                              appTheme === 'light'
                                ? 'bg-white text-slate-950'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Açık
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppTheme('dark')}
                            className={`py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                              appTheme === 'dark'
                                ? 'bg-red-600 text-white'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Koyu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Change Store Password Button for Store Users */}
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setPasswordModalError(null);
                        setPasswordModalSuccess(null);
                        setOldPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmPasswordInput('');
                        setShowStorePasswordModal(true);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/50 text-amber-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mağaza Şifresini Değiştir</span>
                    </button>
                  </div>

                  {/* Store Logout / Change Branch Button */}
                  {onStoreLogout && (
                    <div className="mb-2.5 pb-2.5 border-b border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onStoreLogout();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Mağazadan Çıkış Yap / Şube Değiştir</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-1 flex justify-between items-center text-xs">
                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setIsAdmin(false);
                          setShowUserDropdown(false);
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Yönetici Modundan Çık
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenAdminAuth();
                        }}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Yönetici Girişi Yap
                      </button>
                    )}
                    <button
                      onClick={() => setShowUserDropdown(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* IN-APP STORE PASSWORD CHANGE MODAL */}
      {showStorePasswordModal && currentBranch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => setShowStorePasswordModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Mağaza Şifresini Değiştir
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">
                  {currentBranch.name} ({currentBranch.code})
                </p>
              </div>
            </div>

            {passwordModalSuccess ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-bold">{passwordModalSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStorePasswordModal(false)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordModalError(null);
                const currentPwd = currentBranch.password?.trim() || '1122';
                const trimmedOld = oldPasswordInput.trim();
                const trimmedNew = newPasswordInput.trim();
                const trimmedConfirm = confirmPasswordInput.trim();

                if (!trimmedOld) {
                  setPasswordModalError('Lütfen mevcut şifrenizi giriniz.');
                  return;
                }
                if (trimmedOld !== currentPwd) {
                  setPasswordModalError('Mevcut mağaza şifresi hatalı.');
                  return;
                }
                if (!trimmedNew || trimmedNew.length < 3) {
                  setPasswordModalError('Yeni şifre en az 3 karakter olmalıdır.');
                  return;
                }
                if (trimmedNew !== trimmedConfirm) {
                  setPasswordModalError('Yeni şifreler birbiriyle uyuşmuyor.');
                  return;
                }

                if (onUpdateBranchPassword) {
                  await onUpdateBranchPassword(currentBranch.id, trimmedNew);
                } else {
                  await updateBranchPassword(currentBranch.id, trimmedNew);
                }
                setPasswordModalSuccess('Mağaza şifreniz başarıyla güncellendi!');
              }} className="space-y-3.5 text-xs">
                {passwordModalError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordModalError}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Mevcut Mağaza Şifresi:
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Mevcut şifrenizi giriniz"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300 block">
                      Yeni Mağaza Şifresi:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPasswordText ? 'Gizle' : 'Göster'}
                    </button>
                  </div>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Yeni şifrenizi belirleyiniz"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Yeni Şifre (Tekrar):
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Yeni şifrenizi tekrar yazınız"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 font-mono font-bold text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowStorePasswordModal(false)}
                    className="px-3 py-2 rounded-xl text-slate-400 font-bold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Şifreyi Kaydet</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* BRANCH SWITCH PASSWORD VERIFICATION MODAL */}
      {showBranchSwitchModal && targetBranch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => {
                setShowBranchSwitchModal(false);
                setTargetBranchId(null);
                setBranchSwitchPassword('');
                setBranchSwitchError(null);
                setBranchSwitchSuccess(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Şube Değiştirme Doğrulaması
                </h3>
                <p className="text-xs text-slate-400">
                  Her mağazanın girişi kendine özeldir
                </p>
              </div>
            </div>

            {/* Current vs Target Store Card */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Mevcut Şubeniz:</span>
                <span className="font-bold text-slate-300">{currentBranch.name}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/60">
                <span className="text-red-400 font-semibold">Geçiş Yapılacak Şube:</span>
                <span className="font-bold text-white bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-lg">
                  {targetBranch.name} ({targetBranch.city || 'Merkez'})
                </span>
              </div>
            </div>

            {branchSwitchSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold">{branchSwitchSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleBranchSwitchSubmit} className="space-y-3.5 text-xs">
                {branchSwitchError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{branchSwitchError}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300 block">
                      "{targetBranch.name}" Giriş Şifresi:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSwitchPasswordText(!showSwitchPasswordText)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {showSwitchPasswordText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSwitchPasswordText ? 'Gizle' : 'Göster'}</span>
                    </button>
                  </div>
                  <input
                    type={showSwitchPasswordText ? 'text' : 'password'}
                    autoFocus
                    required
                    value={branchSwitchPassword}
                    onChange={(e) => setBranchSwitchPassword(e.target.value)}
                    placeholder="Mağazanın giriş şifresini yazınız"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Güvenlik gereği her mağazanın paneli ve sınav kayıtları ayrı şifrelenmiştir.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBranchSwitchModal(false);
                      setTargetBranchId(null);
                      setBranchSwitchPassword('');
                      setBranchSwitchError(null);
                    }}
                    className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Doğrula ve Şubeye Giriş Yap</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
