import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  GraduationCap, 
  Eye, 
  EyeOff,
  Key,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';
import { Branch } from '../types';
import { getStoredBranches, updateBranchPassword } from '../services/branchStorage';

interface StoreAuthGatewayProps {
  branches?: Branch[];
  onSuccess: (branchId: number, personnelName: string) => void;
  onOpenAdminAuth: () => void;
  initialBranchId?: number;
  initialPersonnel?: string;
  appTheme?: 'sepia' | 'light' | 'dark';
}

export const StoreAuthGateway: React.FC<StoreAuthGatewayProps> = ({
  branches: propsBranches,
  onSuccess,
  onOpenAdminAuth,
  initialBranchId = 10, // Güneşli default
  initialPersonnel = '',
  appTheme = 'sepia'
}) => {
  const [branchList, setBranchList] = useState<Branch[]>(() => {
    return (propsBranches && propsBranches.length > 0) ? propsBranches : getStoredBranches();
  });

  const [selectedBranchId, setSelectedBranchId] = useState<number>(initialBranchId);
  const [personnelName, setPersonnelName] = useState<string>(initialPersonnel || '');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Password Change Modal State for Store User
  const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
  const [changeOldPassword, setChangeOldPassword] = useState<string>('');
  const [changeNewPassword, setChangeNewPassword] = useState<string>('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState<string>('');
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [changeModalError, setChangeModalError] = useState<string | null>(null);

  // Sync if propsBranches changes
  React.useEffect(() => {
    if (propsBranches && propsBranches.length > 0) {
      setBranchList(propsBranches);
    }
  }, [propsBranches]);

  const selectedBranch = branchList.find(b => b.id === selectedBranchId) || branchList[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!selectedBranchId || !selectedBranch) {
      setError('Lütfen mağazanızı seçiniz.');
      return;
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setError('Lütfen mağaza giriş şifresini giriniz.');
      return;
    }

    // Target store password (defaults to '1122' internally, never shown on screen)
    const targetPassword = selectedBranch.password?.trim() || '1122';

    if (trimmedPassword !== targetPassword) {
      setError(`Hatalı mağaza şifresi! "${selectedBranch.name}" mağazası için şifrenizi kontrol ediniz.`);
      return;
    }

    const finalPersonnel = personnelName.trim() || `${selectedBranch.name} Sorumlusu`;
    onSuccess(selectedBranch.id, finalPersonnel);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeModalError(null);

    if (!selectedBranch) {
      setChangeModalError('Lütfen bir mağaza seçiniz.');
      return;
    }

    const trimmedOld = changeOldPassword.trim();
    const trimmedNew = changeNewPassword.trim();
    const trimmedConfirm = changeConfirmPassword.trim();

    const currentPwd = selectedBranch.password?.trim() || '1122';

    if (!trimmedOld) {
      setChangeModalError('Lütfen mevcut mağaza şifrenizi giriniz.');
      return;
    }

    if (trimmedOld !== currentPwd) {
      setChangeModalError('Mevcut şifre hatalı! Lütfen geçerli mağaza şifrenizi giriniz.');
      return;
    }

    if (!trimmedNew || trimmedNew.length < 3) {
      setChangeModalError('Yeni şifre en az 3 karakterden oluşmalıdır.');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setChangeModalError('Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }

    // Update password in storage & cloud
    const updatedBranches = await updateBranchPassword(selectedBranch.id, trimmedNew);
    setBranchList(updatedBranches);

    // Reset modal states
    setShowChangeModal(false);
    setChangeOldPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    setPassword(trimmedNew); // Pre-fill with the new password
    setSuccessNotice(`"${selectedBranch.name}" şifresi başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz.`);
  };

  const isDark = appTheme === 'dark';
  const isSepia = appTheme === 'sepia';

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-950 text-slate-100' 
        : isSepia 
        ? 'bg-[#f4ecd8] text-[#2c2216]' 
        : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-red-900/30 border border-red-500/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tight font-sans">
              esme<span className="text-red-600">egıtım</span>
            </h1>
            <span className="text-[11px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Esme AVM
            </span>
          </div>
          <p className="text-xs font-semibold opacity-75">
            Kurumsal Eğitim, İç Yönergeler ve Resmi Tebellüğ Portalı
          </p>
        </div>

        {/* Login Box */}
        <div className={`rounded-3xl border shadow-2xl p-6 sm:p-8 transition-colors ${
          isDark 
            ? 'bg-slate-900 border-slate-800' 
            : isSepia 
            ? 'bg-[#fbf4e4] border-[#d8c59e]' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="border-b pb-4 mb-5 border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Mağaza Girişi</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Mağazanız ve şifrenizle sistemi açınız
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300/50">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              <span>Güvenli Giriş</span>
            </div>
          </div>

          {/* Success Notice if password was changed */}
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-bold">{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Step 1: Select Store */}
            <div>
              <label className="text-xs font-bold block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-600" />
                  1. Mağazanızı Seçiniz ({branchList.length} Mağaza):
                </span>
                {selectedBranch && (
                  <span className="text-[10px] font-mono opacity-70">
                    Kod: {selectedBranch.code}
                  </span>
                )}
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(Number(e.target.value));
                  setError(null);
                  setSuccessNotice(null);
                }}
                className={`w-full rounded-xl p-3 text-xs font-bold border transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : isSepia 
                    ? 'bg-white border-[#cbb78d] text-[#2c2216]' 
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {branchList.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} — {branch.city || 'Merkez'} ({branch.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Personnel Name */}
            <div>
              <label className="text-xs font-bold block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" />
                2. Personel Adı Soyadı:
              </label>
              <input
                type="text"
                value={personnelName}
                onChange={(e) => setPersonnelName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz veya Şube Sorumlusu"
                className={`w-full rounded-xl p-3 text-xs font-semibold border transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : isSepia 
                    ? 'bg-white border-[#cbb78d] text-[#2c2216] placeholder-[#8a7758]' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Sertifika ve dijital tebellüğ evraklarında bu isim yer alacaktır.
              </span>
            </div>

            {/* Step 3: Store Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  3. Mağaza Giriş Şifresi:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setChangeModalError(null);
                    setShowChangeModal(true);
                  }}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>Şifre Değiştir</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Mağaza giriş şifresini giriniz"
                  maxLength={20}
                  autoComplete="current-password"
                  autoFocus
                  className={`w-full rounded-xl p-3 pr-10 text-xs font-bold border transition focus:outline-none focus:ring-2 focus:ring-red-500 tracking-wider ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                      : isSepia 
                      ? 'bg-white border-[#cbb78d] text-[#2c2216] placeholder-[#8a7758]' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                  title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer transform active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap ve Sistemi Aç</span>
            </button>
          </form>

          {/* Footer Options */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setChangeModalError(null);
                setShowChangeModal(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Mağaza Şifresini Değiştir</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdminAuth}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Yönetici Girişi</span>
            </button>
          </div>
        </div>

        {/* Corporate Legal Note */}
        <p className="text-center text-[11px] opacity-60 mt-4 leading-relaxed">
          Esme AVM Bilgi İşlem ve Depo Yönetimi Koordinatörlüğü • © {new Date().getFullYear()}
        </p>

      </div>

      {/* CHANGE STORE PASSWORD MODAL FOR STORE USERS */}
      {showChangeModal && selectedBranch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowChangeModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Mağaza Şifresini Değiştir
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {selectedBranch.name} ({selectedBranch.code})
                </p>
              </div>
            </div>

            {changeModalError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{changeModalError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Mevcut Mağaza Şifreniz:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showOldPassword ? 'Gizle' : 'Göster'}
                  </button>
                </div>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={changeOldPassword}
                  onChange={(e) => setChangeOldPassword(e.target.value)}
                  placeholder="Mevcut şifrenizi giriniz"
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Yeni Mağaza Şifresi:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? 'Gizle' : 'Göster'}
                  </button>
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  placeholder="Yeni şifrenizi belirleyiniz"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Yeni Şifre (Tekrar):
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={changeConfirmPassword}
                  onChange={(e) => setChangeConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar yazınız"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Şifremi Güncelle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
