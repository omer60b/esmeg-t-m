import React, { useState } from 'react';
import { TrainingAnnouncement } from '../types';
import {
  Megaphone,
  Edit3,
  Plus,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Bell,
  Info,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface AnnouncementsBannerProps {
  announcements: TrainingAnnouncement[];
  onSaveAnnouncements: (updated: TrainingAnnouncement[]) => Promise<void>;
  isAdmin: boolean;
  onRequestAdminAuth: () => void;
}

export const AnnouncementsBanner: React.FC<AnnouncementsBannerProps> = ({
  announcements,
  onSaveAnnouncements,
  isAdmin
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingAnnouncement | null>(null);

  // Form states for add/edit inside modal
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'acil' | 'onemli' | 'bilgi'>('acil');
  const [authorInput, setAuthorInput] = useState('Ömer BAŞ & Turgut CESUR');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const activeAnnouncements = announcements.filter(a => a.isActive !== false);
  const safeIndex = activeAnnouncements.length > 0 ? activeIndex % activeAnnouncements.length : 0;
  const currentAnn = activeAnnouncements[safeIndex];

  // Normal users should not see the banner at all if there are no active announcements
  if (!isAdmin && activeAnnouncements.length === 0) {
    return null;
  }

  const handleOpenEditor = (item?: TrainingAnnouncement) => {
    if (!isAdmin) return;
    if (item) {
      setEditingItem(item);
      setTitleInput(item.title);
      setContentInput(item.content);
      setPriorityInput(item.priority);
      setAuthorInput(item.author || 'Ömer BAŞ & Turgut CESUR');
    } else {
      setEditingItem(null);
      setTitleInput('');
      setContentInput('');
      setPriorityInput('acil');
      setAuthorInput('Ömer BAŞ & Turgut CESUR');
    }
    setShowManageModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !titleInput.trim() || !contentInput.trim()) return;

    const now = new Date().toISOString();
    let updatedList: TrainingAnnouncement[];

    if (editingItem) {
      updatedList = announcements.map(a =>
        a.id === editingItem.id
          ? {
              ...a,
              title: titleInput.trim(),
              content: contentInput.trim(),
              priority: priorityInput,
              author: authorInput.trim() || 'Yönetim',
              updatedAt: now,
              isActive: true
            }
          : a
      );
    } else {
      const newAnn: TrainingAnnouncement = {
        id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: titleInput.trim(),
        content: contentInput.trim(),
        priority: priorityInput,
        author: authorInput.trim() || 'Ömer BAŞ & Turgut CESUR',
        createdAt: now,
        updatedAt: now,
        isActive: true
      };
      updatedList = [newAnn, ...announcements];
      setActiveIndex(0);
    }

    await onSaveAnnouncements(updatedList);
    setEditingItem(null);
    setTitleInput('');
    setContentInput('');
    setSaveSuccessMsg('Duyuru kaydedildi ve tüm Esme AVM şubelerinde anlık yayınlandı!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!isAdmin) return;
    const updatedList = announcements.filter(a => a.id !== id);
    await onSaveAnnouncements(updatedList);
    if (editingItem?.id === id) {
      setEditingItem(null);
      setTitleInput('');
      setContentInput('');
    }
  };

  const priorityStyle = (priority?: 'acil' | 'onemli' | 'bilgi') => {
    if (priority === 'acil') {
      return {
        wrapper: 'bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 border-red-700/60',
        badge: 'bg-red-600 text-white',
        badgeLabel: 'ACİL OPERASYONEL DUYURU',
        icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
      };
    }
    if (priority === 'onemli') {
      return {
        wrapper: 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border-amber-600/60',
        badge: 'bg-amber-500 text-slate-950',
        badgeLabel: 'ÖNEMLİ GÜNCELLEME',
        icon: <Bell className="w-4 h-4 text-amber-300 shrink-0" />
      };
    }
    return {
      wrapper: 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border-blue-700/60',
      badge: 'bg-blue-600 text-white',
      badgeLabel: 'KURUMSAL DUYURU',
      icon: <Info className="w-4 h-4 text-sky-300 shrink-0" />
    };
  };

  const style = priorityStyle(currentAnn?.priority);

  return (
    <div className="mb-6">
      <div
        className={`rounded-2xl border p-4 sm:p-5 text-white shadow-lg transition-all ${style.wrapper}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Duyurular Header & Content */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
              <Megaphone className="w-5 h-5 text-amber-300" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  DUYURULAR
                </span>
                <span className="text-white/30">•</span>
                {currentAnn ? (
                  <>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1 ${style.badge}`}
                    >
                      {style.icon}
                      {style.badgeLabel}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">
                      Yayınlayan: <strong className="text-white">{currentAnn.author}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({new Date(currentAnn.updatedAt || currentAnn.createdAt).toLocaleDateString('tr-TR')})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-300">Aktif operasyonel duyuru bulunmuyor</span>
                )}
              </div>

              {currentAnn ? (
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {currentAnn.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-0.5">
                    {currentAnn.content}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  Yöneticiler acil operasyonel güncellemeleri ve şube talimatlarını bu alandan tüm Esme AVM şubelerine anlık yayınlayabilir.
                </p>
              )}
            </div>
          </div>

          {/* Right: Carousel Controls (for multiple announcements) & Admin-Only Action Buttons */}
          {(activeAnnouncements.length > 1 || isAdmin) && (
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
              {activeAnnouncements.length > 1 && (
                <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(prev => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length)
                    }
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-200 transition cursor-pointer"
                    title="Önceki Duyuru"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold px-1.5 text-amber-300">
                    {safeIndex + 1} / {activeAnnouncements.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(prev => (prev + 1) % activeAnnouncements.length)}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-200 transition cursor-pointer"
                    title="Sonraki Duyuru"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2">
                  {currentAnn && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditor(currentAnn)}
                      className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Duyuruyu Düzenle</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEditor()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Duyuru Yayınla</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADMIN ANNOUNCEMENT EDITOR MODAL (STRICTLY ADMIN ONLY) */}
      {isAdmin && showManageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-red-700 via-rose-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    Esme AVM — Acil Operasyonel Duyuru Yönetimi
                  </h3>
                  <p className="text-xs text-white/80">
                    Yayınlanan duyurular 35 Esme AVM şubesinde Eğitim Portalı'nın en üstünde anlık gösterilir
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSaveForm} className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {editingItem ? 'Mevcut Duyuruyu Düzenle' : 'Yeni Operasyonel Duyuru Ekle'}
                  </h4>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        setTitleInput('');
                        setContentInput('');
                      }}
                      className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      + Yeni Duyuru Moduna Geç
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Öncelik Seviyesi
                    </label>
                    <select
                      value={priorityInput}
                      onChange={e => setPriorityInput(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="acil">🚨 Acil Operasyonel Duyuru</option>
                      <option value="onemli">⚠️ Önemli Güncelleme</option>
                      <option value="bilgi">ℹ️ Kurumsal Bilgilendirme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Yayınlayan Yönetici / Birim
                    </label>
                    <input
                      type="text"
                      value={authorInput}
                      onChange={e => setAuthorInput(e.target.value)}
                      placeholder="Örn: Ömer BAŞ & Turgut CESUR"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duyuru Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                    placeholder="Örn: Acil Operasyonel Güncelleme — Kasa İade ve Sevkiyat Kontrolü"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duyuru Metni / Talimat Detayı *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={contentInput}
                    onChange={e => setContentInput(e.target.value)}
                    placeholder="Tüm şubelerin dikkat etmesi gereken acil operasyonel açıklamayı buraya yazınız..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingItem ? 'Değişiklikleri Yayınla' : 'Duyuruyu Yayınla'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Announcements List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Yayındaki Duyurular ({announcements.length})
                </h4>

                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    Henüz kayıtlı duyuru bulunmamaktadır.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {announcements.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                item.priority === 'acil'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : item.priority === 'onemli'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {item.priority}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {item.content}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            {item.author} • {new Date(item.updatedAt || item.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setTitleInput(item.title);
                              setContentInput(item.content);
                              setPriorityInput(item.priority);
                              setAuthorInput(item.author);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
