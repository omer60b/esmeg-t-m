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
  Bell
} from 'lucide-react';
import { TrainingCategory } from '../types';
import { officialEsmeBranches } from '../mockData';

interface TrainingHeaderProps {
  activeTab: 'catalog' | 'ebook' | 'video' | 'tebellug' | 'leaderboard' | 'admin';
  setActiveTab: (tab: 'catalog' | 'ebook' | 'video' | 'tebellug' | 'leaderboard' | 'admin') => void;
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
  totalCount?: number;
  bilgiIslemCount?: number;
  depocuCount?: number;
  appTheme?: 'sepia' | 'light' | 'dark';
  setAppTheme?: (theme: 'sepia' | 'light' | 'dark') => void;
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
  appTheme = 'light',
  setAppTheme,
  pendingCount = 0,
  onClickPendingBell
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const currentBranch = officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

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
                  esme<span className="text-red-500">egıtım</span>
                </span>
                <span className="text-[10px] bg-red-600/30 text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-500/30 uppercase">
                  Esme AVM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Esme AVM Bilgi İşlem & Depo Eğitim Portalı
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
              onClick={() => setActiveTab('tebellug')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tebellug'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Tebellüğ & Takip</span>
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
                    <p className="text-[11px] text-slate-400">Tebellüğ ve sertifikalarda bu bilgiler yer alır</p>
                  </div>

                  <div className="space-y-2.5 mb-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Şubeniz (35 Esme Şubesi):</label>
                      <select
                        value={currentBranchId}
                        onChange={(e) => setCurrentBranchId(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-md p-1.5 focus:ring-1 focus:ring-red-500"
                      >
                        {officialEsmeBranches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.city})
                          </option>
                        ))}
                      </select>
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

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
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
    </header>
  );
};
