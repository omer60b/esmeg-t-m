import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrainingAnnouncement } from '../types';
import { officialEsmeBranches } from '../mockData';
import {
  Bell,
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Info
} from 'lucide-react';

interface PendingTrainingsReminderProps {
  announcements: TrainingAnnouncement[];
  currentBranchId: number;
  currentPersonnel: string;
  bellTrigger?: number;
  appTheme?: 'sepia' | 'light' | 'dark';
}

const ACK_STORAGE_KEY = 'esme_acknowledged_announcements_v1';

function getAcknowledgedMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

function saveAcknowledgedKey(versionKey: string) {
  try {
    const current = getAcknowledgedMap();
    current[versionKey] = true;
    localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

export const PendingTrainingsReminder: React.FC<PendingTrainingsReminderProps> = ({
  announcements,
  currentBranchId,
  currentPersonnel,
  bellTrigger
}) => {
  const [showAnnouncementToast, setShowAnnouncementToast] = useState(false);
  const [ackMap, setAckMap] = useState<Record<string, boolean>>(() => getAcknowledgedMap());
  const prevTopVersionRef = useRef<string | null>(null);

  const currentBranch =
    officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

  // Active announcements published by managers
  const activeAnnouncements = useMemo(
    () => announcements.filter(a => a.isActive),
    [announcements]
  );

  // Pick the newest unacknowledged announcement, or fall back to the newest active announcement
  const targetAnnouncement = useMemo(() => {
    if (activeAnnouncements.length === 0) return null;
    const unacknowledged = activeAnnouncements.find(
      a => !ackMap[`${a.id}_${a.updatedAt}`]
    );
    return unacknowledged || activeAnnouncements[0];
  }, [activeAnnouncements, ackMap]);

  const targetVersionKey = targetAnnouncement
    ? `${targetAnnouncement.id}_${targetAnnouncement.updatedAt}`
    : null;

  const isTargetUnacknowledged = targetVersionKey ? !ackMap[targetVersionKey] : false;

  // 1. Trigger immediately when a manager publishes or updates an announcement
  useEffect(() => {
    if (!targetAnnouncement || !targetVersionKey) {
      setShowAnnouncementToast(false);
      return;
    }

    // If a brand new or updated announcement version arrives from a manager, show immediately
    if (prevTopVersionRef.current && prevTopVersionRef.current !== targetVersionKey) {
      setShowAnnouncementToast(true);
    } else if (!prevTopVersionRef.current && isTargetUnacknowledged) {
      // On initial load, if there is an unacknowledged manager announcement, show after 2.5s
      const initTimer = setTimeout(() => {
        setShowAnnouncementToast(true);
      }, 2500);
      prevTopVersionRef.current = targetVersionKey;
      return () => clearTimeout(initTimer);
    }

    prevTopVersionRef.current = targetVersionKey;
  }, [targetAnnouncement, targetVersionKey, isTargetUnacknowledged]);

  // 2. Periodic Reminder Notification Loop for active manager announcements
  useEffect(() => {
    if (!targetAnnouncement || !isTargetUnacknowledged) return;

    const periodicTimer = setInterval(() => {
      setShowAnnouncementToast(true);
    }, 60000); // Remind every 60 seconds until user acknowledges the manager's announcement

    return () => clearInterval(periodicTimer);
  }, [targetAnnouncement, isTargetUnacknowledged]);

  // 3. Open immediately when user clicks the header Notification Bell
  useEffect(() => {
    if (bellTrigger && bellTrigger > 0 && targetAnnouncement) {
      setShowAnnouncementToast(true);
    }
  }, [bellTrigger, targetAnnouncement]);

  if (!showAnnouncementToast || !targetAnnouncement) {
    return null;
  }

  const isUrgent = targetAnnouncement.priority === 'acil';
  const isImportant = targetAnnouncement.priority === 'onemli';

  const handleAcknowledge = () => {
    if (targetVersionKey) {
      saveAcknowledgedKey(targetVersionKey);
      setAckMap(getAcknowledgedMap());
    }
    setShowAnnouncementToast(false);
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border-2 border-red-600 dark:border-red-500 rounded-2xl shadow-2xl p-4 sm:p-5 animate-in slide-in-from-top-5 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow ${
              isUrgent
                ? 'bg-red-600 text-white'
                : isImportant
                ? 'bg-amber-500 text-slate-950'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            ) : isImportant ? (
              <Megaphone className="w-5 h-5 animate-pulse" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
                🔔 YÖNETİCİ DUYURU BİLDİRİMİ
              </span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                • {targetAnnouncement.author}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 leading-snug">
              {targetAnnouncement.title}
            </h4>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {targetAnnouncement.content}
            </p>

            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
              Aktif Şube: <strong className="text-slate-800 dark:text-slate-200">{currentBranch.name}</strong> • Personel:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{currentPersonnel}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAnnouncementToast(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          title="Sonra Hatırlat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowAnnouncementToast(false)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Periyodik Hatırlat</span>
        </button>

        <button
          type="button"
          onClick={handleAcknowledge}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Okudum, İnceledim</span>
        </button>
      </div>
    </div>
  );
};
