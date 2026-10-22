import React, { useState } from 'react';
import { ShieldCheck, Lock, X, LogIn, AlertCircle } from 'lucide-react';

export interface AdminUserSession {
  username: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
}

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (admin: AdminUserSession) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [username, setUsername] = useState('O.BAS');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toUpperCase();
    const p = password.trim();

    // Load dynamic master password overrides (set by O.BAS)
    let masterPasswords: Record<string, string> = { 'O.BAS': '1864', 'T.CESUR': '9084' };
    try {
      const raw = localStorage.getItem('esme_admin_passwords');
      if (raw) masterPasswords = { ...masterPasswords, ...JSON.parse(raw) };
    } catch {}

    const obasPass = masterPasswords['O.BAS'] || '1864';
    const tcesurPass = masterPasswords['T.CESUR'] || '9084';

    // 1. Check Super Admin O.BAS
    if (u === 'O.BAS' && p === obasPass) {
      const session: AdminUserSession = {
        username: 'O.BAS',
        name: 'O.BAŞ (Genel Yönetici)',
        role: 'Genel Yönetici (En Yetkili Yönetici)',
        isSuperAdmin: true
      };
      try {
        localStorage.setItem('esme_current_admin', JSON.stringify(session));
      } catch {}
      setError(null);
      onSuccess(session);
      onClose();
      return;
    }

    // 2. Check Admin T.CESUR
    if (u === 'T.CESUR' && p === tcesurPass) {
      const session: AdminUserSession = {
        username: 'T.CESUR',
        name: 'Turgut CESUR (B.İ. ve Kasa Müdürü)',
        role: 'B.İ. ve Kasa Müdürü',
        isSuperAdmin: false
      };
      try {
        localStorage.setItem('esme_current_admin', JSON.stringify(session));
      } catch {}
      setError(null);
      onSuccess(session);
      onClose();
      return;
    }

    // 3. Check Custom Admins created by O.BAS
    try {
      const customRaw = localStorage.getItem('esme_custom_admins');
      if (customRaw) {
        const customAdmins = JSON.parse(customRaw);
        const matched = customAdmins.find(
          (a: any) => a.username.toUpperCase() === u && a.password === p
        );
        if (matched) {
          const session: AdminUserSession = {
            username: matched.username,
            name: matched.name || matched.username,
            role: matched.role || 'Sistem Yöneticisi',
            isSuperAdmin: !!matched.isSuperAdmin
          };
          localStorage.setItem('esme_current_admin', JSON.stringify(session));
          setError(null);
          onSuccess(session);
          onClose();
          return;
        }
      }
    } catch {}

    // Fallback if password matches master keys without typing exact username
    if (p === obasPass || p === '1864') {
      const session: AdminUserSession = {
        username: 'O.BAS',
        name: 'O.BAŞ (Genel Yönetici)',
        role: 'Genel Yönetici (En Yetkili Yönetici)',
        isSuperAdmin: true
      };
      try {
        localStorage.setItem('esme_current_admin', JSON.stringify(session));
      } catch {}
      setError(null);
      onSuccess(session);
      onClose();
      return;
    }

    setError('Hatalı yönetici kullanıcı adı veya şifresi! Lütfen bilgilerinizi kontrol ediniz.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Yönetici Girişi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Eğitim yönetimi, video ekleme ve tam yetkili kontrol paneli
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Yönetici Kullanıcı Adı:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Örn: O.BAS"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Yönetici Şifresi:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi giriniz"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
