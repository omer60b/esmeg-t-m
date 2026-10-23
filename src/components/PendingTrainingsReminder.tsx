import React, { useState, useEffect, useMemo } from 'react';
import { TrainingDocument, TrainingCompletion } from '../types';
import { officialEsmeBranches } from '../mockData';
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface PendingTrainingsReminderProps {
  trainings: TrainingDocument[];
  completions: TrainingCompletion[];
  currentBranchId: number;
  currentPersonnel: string;
  onSelectTraining: (
    training: TrainingDocument,
    initialTab?: 'content' | 'video' | 'pdf' | 'templates' | 'quiz' | 'presentation'
  ) => void;
  externalOpenTrigger?: number;
}

export const PendingTrainingsReminder: React.FC<PendingTrainingsReminderProps> = ({
  trainings,
  completions,
  currentBranchId,
  currentPersonnel,
  onSelectTraining,
  externalOpenTrigger
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPeriodicToast, setShowPeriodicToast] = useState(false);
  const [toastDismissedAt, setToastDismissedAt] = useState<number>(0);

  const currentBranch =
    officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

  // Compute pending vs completed trainings for active branch
  const { pendingTrainings, completedCount, completionRate } = useMemo(() => {
    const completedIds = new Set(
      completions.filter(c => c.branchId === currentBranchId).map(c => c.trainingId)
    );

    const pending = trainings
      .filter(t => !completedIds.has(t.id))
      .sort((a, b) => {
        const pOrder = { kritik: 0, zorunlu: 1, standart: 2 };
        return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
      });

    const doneCount = trainings.length - pending.length;
    const rate = trainings.length > 0 ? Math.round((doneCount / trainings.length) * 100) : 100;

    return {
      pendingTrainings: pending,
      completedCount: doneCount,
      completionRate: rate
    };
  }, [trainings, completions, currentBranchId]);

  // Expand box when header notification bell is clicked
  useEffect(() => {
    if (externalOpenTrigger && externalOpenTrigger > 0) {
      setIsExpanded(true);
      setShowPeriodicToast(true);
    }
  }, [externalOpenTrigger]);

  // Periodic reminder notification system (shows initial reminder after 8s, then periodically every 180s if pending trainings exist)
  useEffect(() => {
    if (pendingTrainings.length === 0) {
      setShowPeriodicToast(false);
      return;
    }

    const initialTimer = setTimeout(() => {
      if (Date.now() - toastDismissedAt > 60000) {
        setShowPeriodicToast(true);
      }
    }, 6000);

    const intervalTimer = setInterval(() => {
      setShowPeriodicToast(true);
    }, 180000); // Every 3 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [pendingTrainings.length, currentBranchId, toastDismissedAt]);

  const nextPriorityTraining = pendingTrainings[0];

  return (
    <>
      {/* BEKLEYEN EĞİTİMLER KUTUCUĞU */}
      <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400/80 dark:border-amber-600/60 shadow-md overflow-hidden transition-colors">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-amber-50/90 dark:bg-slate-800/90 border-b border-amber-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                pendingTrainings.length > 0
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-emerald-600 text-white border-emerald-500'
              }`}
            >
              {pendingTrainings.length > 0 ? (
                <Bell className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-950 text-amber-950 dark:text-amber-300 border border-amber-400/60">
                  {pendingTrainings.length > 0
                    ? `🔔 BEKLEYEN EĞİTİMLER (${pendingTrainings.length} MODÜL)`
                    : '✓ TÜM EĞİTİMLER TAMAMLANDI'}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Şube: <strong className="text-slate-950 dark:text-white">{currentBranch.name}</strong> • Personel:{' '}
                  <strong className="text-slate-950 dark:text-white">{currentPersonnel}</strong>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {pendingTrainings.length > 0
                  ? `Henüz tamamlanmamış ${pendingTrainings.length} zorunlu eğitim ve tebellüğ modülünüz bulunuyor`
                  : 'Tebrikler! Şubenize ait tüm eğitim ve tebellüğ modüllerini eksiksiz tamamladınız.'}
              </h3>
            </div>
          </div>

          {/* Right: Progress & Collapse Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                <span>Tamamlanan: {completedCount} / {trainings.length}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                  %{completionRate}
                </span>
              </div>
              <div className="w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {pendingTrainings.length > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-amber-300 dark:border-slate-600 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>{isExpanded ? 'Gizle' : 'Listeyi Gör'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Pending Trainings Grid */}
        {isExpanded && pendingTrainings.length > 0 && (
          <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingTrainings.map(item => {
                const isBI = item.category === 'bilgi-islem';
                const isCritical = item.priority === 'kritik';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-red-400 dark:hover:border-red-500 transition flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isBI
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {isBI ? 'Bilgi İşlem' : 'Depocu Eğitim'}
                        </span>

                        <div className="flex items-center gap-1">
                          {isCritical ? (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" /> Kritik
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                              Zorunlu
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                            {item.docNo}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectTraining(item, item.isPresentation ? 'presentation' : 'content')
                        }
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Eğitimi Oku</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTraining(item, 'quiz')}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Sınav & İmza</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PERİYODİK EĞİTİM HATIRLATMA BİLDİRİM KARTI (SAĞ ALT KÖŞE) */}
      {showPeriodicToast && nextPriorityTraining && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-red-600 dark:border-red-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
                  PERİYODİK EĞİTİM HATIRLATICISI
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {pendingTrainings.length} Bekleyen Eğitiminiz Var!
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  <strong>{currentBranch.name}</strong> şubesi için sıradaki zorunlu eğitim:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {nextPriorityTraining.title}
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPeriodicToast(false);
                setToastDismissedAt(Date.now());
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              title="Bildirimi Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPeriodicToast(false);
                setToastDismissedAt(Date.now());
              }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Daha Sonra Hatırlat
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPeriodicToast(false);
                onSelectTraining(
                  nextPriorityTraining,
                  nextPriorityTraining.isPresentation ? 'presentation' : 'content'
                );
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow cursor-pointer"
            >
              <span>Şimdi Tamamla</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
