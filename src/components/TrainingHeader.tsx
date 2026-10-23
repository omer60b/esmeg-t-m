import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  ShieldCheck, 
  Settings, 
  Search, 
  User as UserIcon, 
  Building2, 
  LogOut, 
  LogIn, 
  Sparkles,
  Layers,
  FileCheck2,
  Boxes
} from 'lucide-react';
import { TrainingCategory } from '../types';
import { officialEsmeBranches } from '../mockData';

interface TrainingHeaderProps {
  activeTab: 'catalog' | 'ebook' | 'video' | 'tebellug' | 'admin';
  setActiveTab: (tab: 'catalog' | 'ebook' | 'video' | 'tebellug' | 'admin') => void;
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
  onSwitchToSayim?: () => void;
  totalCount?: number;
  bilgiIslemCount?: number;
  depocuCount?: number;
}

export const TrainingHeader: React.FC<TrainingHeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  currentBranchId,
  setCurrentBranchId,
  currentPersonnel,
  setCurrentPersonnel,
  isAdmin,
  setIsAdmin,
  onOpenAdminAuth,
  onSwitchToSayim,
  totalCount = 11,
  bilgiIslemCount = 7,
  depocuCount = 4
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const currentBranch = officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner / Corporate Line */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
            Esme Şirketler Grubu
          </span>
          <span className="hidden sm:inline text-rose-100">
            Kurumsal Online Eğitim, Bilgilendirme ve Yönerge Portalı
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          {onSwitchToSayim && (
            <button
              onClick={onSwitchToSayim}
              className="bg-indigo-600/90 hover:bg-indigo-500 text-white px-2.5 py-0.5 rounded border border-indigo-400/50 flex items-center gap-1 font-bold transition shadow-xs cursor-pointer"
              title="Stok & Kör Sayım Portalına Geçiş Yap"
            >
              <Boxes className="w-3.5 h-3.5" /> Stok & Sayım Portalı
            </button>
          )}
          <span className="hidden md:inline text-rose-100">
            Resmi Prosedürler & SOP Kılavuzları
          </span>
          {isAdmin ? (
            <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Yetkili Yönetici Modu
            </span>
          ) : (
            <button 
              onClick={onOpenAdminAuth}
              className="text-rose-200 hover:text-white underline decoration-rose-400 font-medium cursor-pointer"
            >
              Yönetici Girişi
            </button>
          )}
        </div>
      </div>

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
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Bilgi İşlem & Depo Eğitim Portalı
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
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
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
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
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
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
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
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'tebellug'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Tebellüğ & Takip</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 font-semibold'
                    : 'text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">Yönetici Paneli</span>
              </button>
            )}

            {/* Personnel & Branch Switcher Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs transition"
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

                  <div className="space-y-2 mb-3">
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
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setIsAdmin(false);
                          setShowUserDropdown(false);
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Yönetici Modundan Çık
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenAdminAuth();
                        }}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Yönetici Girişi Yap
                      </button>
                    )}
                    <button
                      onClick={() => setShowUserDropdown(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px]"
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

      {/* Primary Category Selector Bar (Bilgi İşlem Eğitim vs Depocu Eğitim) */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Kategoriler:
            </span>

            {/* All */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Tüm Eğitimler ({totalCount})
            </button>

            {/* Bilgi İşlem Eğitim */}
            <button
              onClick={() => setSelectedCategory('bilgi-islem')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCategory === 'bilgi-islem'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400/40'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse"></span>
              Bilgi İşlem Eğitim ({bilgiIslemCount} Talimat)
            </button>

            {/* Depocu Eğitim */}
            <button
              onClick={() => setSelectedCategory('depocu')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCategory === 'depocu'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400/40'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Depocu Eğitim ({depocuCount} Kılavuz)
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Zorunlu Tebellüğe Tabi
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-0.5 rounded text-sky-300">
              <Video className="w-3 h-3 text-sky-400" /> Videolu Anlatım
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};
