import React, { useState, useMemo } from 'react';
import { TrainingDocument, TrainingCompletion, TrainingCategory } from '../types';
import { officialEsmeBranches } from '../mockData';
import { downloadCertificatePdf, generateCertificateImageUrl } from '../utils/certificateGenerator';
import {
  Trophy,
  Medal,
  Award,
  Building2,
  Users,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Sparkles,
  X,
  Star,
  TrendingUp
} from 'lucide-react';

interface LeaderboardViewProps {
  trainings: TrainingDocument[];
  completions: TrainingCompletion[];
  currentBranchId: number;
  currentPersonnel: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  trainings,
  completions,
  currentBranchId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrainingCategory>('all');
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'personnel' | 'album'>('branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewCertificate, setPreviewCertificate] = useState<{
    completion: TrainingCompletion;
    imageUrl: string;
  } | null>(null);

  const filteredTrainings = useMemo(
    () => trainings.filter(t => selectedCategory === 'all' || t.category === selectedCategory),
    [trainings, selectedCategory]
  );

  const filteredCompletions = useMemo(
    () => completions.filter(c => selectedCategory === 'all' || c.category === selectedCategory),
    [completions, selectedCategory]
  );

  const totalRequiredCount = Math.max(1, filteredTrainings.length);

  // 1. Compute 35 Esme AVM Branch Rankings
  const branchRankings = useMemo(() => {
    const rankings = officialEsmeBranches.map(branch => {
      const branchComps = filteredCompletions.filter(c => c.branchId === branch.id);
      const uniqueCompletedTrainings = new Set(
        branchComps
          .filter(c => filteredTrainings.some(t => t.id === c.trainingId))
          .map(c => c.trainingId)
      );

      const completedCount = uniqueCompletedTrainings.size;
      const totalCertificates = branchComps.length;
      const completionRate = Math.min(100, Math.round((completedCount / totalRequiredCount) * 100));

      let avgScorePct = 0;
      if (branchComps.length > 0) {
        const sumPct = branchComps.reduce((acc, c) => {
          const s = c.quizScore ?? 5;
          const tot = c.quizTotal ?? 5;
          return acc + (s / Math.max(1, tot)) * 100;
        }, 0);
        avgScorePct = Math.round(sumPct / branchComps.length);
      }

      // Composite score for sorting: completionRate * 10 + totalCertificates * 5 + avgScorePct * 0.5
      const compositePoints = Math.round(completionRate * 10 + totalCertificates * 15 + avgScorePct);

      return {
        branch,
        completedCount,
        totalRequired: filteredTrainings.length,
        totalCertificates,
        completionRate,
        avgScorePct,
        compositePoints,
        latestCompletion: branchComps[0]?.completedAt || null
      };
    });

    return rankings.sort((a, b) => {
      if (b.compositePoints !== a.compositePoints) return b.compositePoints - a.compositePoints;
      if (b.completionRate !== a.completionRate) return b.completionRate - a.completionRate;
      if (b.totalCertificates !== a.totalCertificates) return b.totalCertificates - a.totalCertificates;
      return a.branch.name.localeCompare(b.branch.name, 'tr');
    });
  }, [filteredCompletions, filteredTrainings, totalRequiredCount]);

  // 2. Compute Personnel Rankings
  const personnelRankings = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        personnelName: string;
        branchId: number;
        branchName: string;
        certificateCount: number;
        totalCorrect: number;
        totalQuestions: number;
        avgQuizPct: number;
        points: number;
        certificates: TrainingCompletion[];
      }
    >();

    filteredCompletions.forEach(comp => {
      const nameClean = (comp.personnelName || 'Şube Personeli').trim();
      const key = `${nameClean.toLocaleLowerCase('tr-TR')}__${comp.branchId}`;
      const existing = map.get(key);
      const score = comp.quizScore ?? 5;
      const total = comp.quizTotal ?? 5;

      if (existing) {
        existing.certificateCount += 1;
        existing.totalCorrect += score;
        existing.totalQuestions += total;
        existing.avgQuizPct = Math.round(
          (existing.totalCorrect / Math.max(1, existing.totalQuestions)) * 100
        );
        existing.points = existing.certificateCount * 100 + existing.avgQuizPct;
        existing.certificates.push(comp);
      } else {
        const avgQuizPct = Math.round((score / Math.max(1, total)) * 100);
        map.set(key, {
          key,
          personnelName: nameClean,
          branchId: comp.branchId,
          branchName: comp.branchName,
          certificateCount: 1,
          totalCorrect: score,
          totalQuestions: total,
          avgQuizPct,
          points: 100 + avgQuizPct,
          certificates: [comp]
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.certificateCount - a.certificateCount;
    });
  }, [filteredCompletions]);

  const handleOpenPreview = (comp: TrainingCompletion) => {
    const imageUrl = generateCertificateImageUrl(comp);
    setPreviewCertificate({ completion: comp, imageUrl });
  };

  const filteredBranchRankings = branchRankings.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLocaleLowerCase('tr-TR');
    return (
      item.branch.name.toLocaleLowerCase('tr-TR').includes(q) ||
      item.branch.code.toLocaleLowerCase('tr-TR').includes(q) ||
      (item.branch.city || '').toLocaleLowerCase('tr-TR').includes(q)
    );
  });

  const filteredPersonnelRankings = personnelRankings.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLocaleLowerCase('tr-TR');
    return (
      item.personnelName.toLocaleLowerCase('tr-TR').includes(q) ||
      item.branchName.toLocaleLowerCase('tr-TR').includes(q)
    );
  });

  const filteredAlbumCertificates = filteredCompletions.filter(comp => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLocaleLowerCase('tr-TR');
    return (
      comp.personnelName.toLocaleLowerCase('tr-TR').includes(q) ||
      comp.branchName.toLocaleLowerCase('tr-TR').includes(q) ||
      comp.trainingTitle.toLocaleLowerCase('tr-TR').includes(q) ||
      comp.certificateId.toLocaleLowerCase('tr-TR').includes(q)
    );
  });

  const top3Branches = branchRankings.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-red-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-400/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-amber-200 text-xs font-extrabold border border-white/20">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>ESME AVM KURUMSAL BAŞARI LİGİ & SERTİFİKA ALBÜMÜ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Şube & Personel Başarı Sıralaması
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
            35 Esme AVM şubesinin eğitim tamamlama oranları, 5 soruluk yeterlilik sınavı başarı puanları ve Türkçe karakter uyumlu resmi dijital sertifika albümü.
          </p>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-black/25 backdrop-blur rounded-2xl p-3.5 border border-white/15 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Toplam Şube</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {officialEsmeBranches.length}
            </span>
          </div>
          <div className="bg-black/25 backdrop-blur rounded-2xl p-3.5 border border-white/15 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Sertifika</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {filteredCompletions.length}
            </span>
          </div>
          <div className="bg-black/25 backdrop-blur rounded-2xl p-3.5 border border-white/15 text-center">
            <span className="text-[10px] uppercase font-bold text-sky-300 block">Aktif Personel</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {personnelRankings.length}
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3Branches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3Branches.map((item, idx) => {
            const rank = idx + 1;
            const styles =
              rank === 1
                ? {
                    card: 'bg-gradient-to-br from-amber-50 via-yellow-50/60 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-400 dark:border-amber-600 shadow-lg',
                    badge: 'bg-amber-500 text-slate-950',
                    label: '1. LİDER ŞUBE',
                    icon: <Trophy className="w-6 h-6 text-amber-500" />
                  }
                : rank === 2
                ? {
                    card: 'bg-gradient-to-br from-slate-50 via-slate-100/50 to-white dark:from-slate-800/60 dark:to-slate-900 border-slate-300 dark:border-slate-700 shadow',
                    badge: 'bg-slate-600 text-white',
                    label: '2. BAŞARILI ŞUBE',
                    icon: <Medal className="w-6 h-6 text-slate-400" />
                  }
                : {
                    card: 'bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-white dark:from-orange-950/30 dark:to-slate-900 border-orange-300 dark:border-orange-800/70 shadow',
                    badge: 'bg-orange-600 text-white',
                    label: '3. BAŞARILI ŞUBE',
                    icon: <Award className="w-6 h-6 text-orange-500" />
                  };

            return (
              <div
                key={item.branch.id}
                className={`rounded-2xl border-2 p-5 flex flex-col justify-between gap-4 relative overflow-hidden ${styles.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles.badge}`}
                    >
                      {styles.label}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                      {item.branch.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.branch.city || 'İstanbul'} • Kod: {item.branch.code}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm shrink-0">
                    {styles.icon}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Eğitim Tamamlama Oranı
                    </span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      %{item.completionRate} ({item.completedCount}/{item.totalRequired})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.completionRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Sertifika: <strong>{item.totalCertificates}</strong></span>
                    <span>Sınav Ort: <strong>%{item.avgScorePct}</strong></span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {item.compositePoints} Puan
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('branches')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'branches'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Şube Başarı Sıralaması (35 Şube)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('personnel')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'personnel'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personel Başarı Sıralaması ({personnelRankings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('album')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'album'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Resmi Sertifika Albümü ({filteredCompletions.length})</span>
          </button>
        </div>

        {/* Category & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('bilgi-islem')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'bilgi-islem'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Bilgi İşlem
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('depocu')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedCategory === 'depocu'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Depocu
            </button>
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Şube, personel veya sertifika ara..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: 35 BRANCH LEADERBOARD TABLE */}
      {activeSubTab === 'branches' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 w-16 text-center">Sıra</th>
                  <th className="p-3.5">Esme AVM Şubesi</th>
                  <th className="p-3.5">Tamamlanan Eğitim</th>
                  <th className="p-3.5">Uyum Oranı (%)</th>
                  <th className="p-3.5">Sertifika Sayısı</th>
                  <th className="p-3.5">Sınav Başarısı</th>
                  <th className="p-3.5">Başarı Puanı</th>
                  <th className="p-3.5 text-right">Durum Rozeti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBranchRankings.map((item) => {
                  const globalRank =
                    branchRankings.findIndex(r => r.branch.id === item.branch.id) + 1;
                  const isCurrentBranch = item.branch.id === currentBranchId;

                  return (
                    <tr
                      key={item.branch.id}
                      className={`transition ${
                        isCurrentBranch
                          ? 'bg-red-50/70 dark:bg-red-950/30 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        {globalRank === 1 ? (
                          <span className="inline-flex w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black items-center justify-center shadow">
                            1
                          </span>
                        ) : globalRank === 2 ? (
                          <span className="inline-flex w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black items-center justify-center">
                            2
                          </span>
                        ) : globalRank === 3 ? (
                          <span className="inline-flex w-7 h-7 rounded-full bg-orange-400 text-white font-black items-center justify-center">
                            3
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-500">#{globalRank}</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.branch.name}
                          </span>
                          {isCurrentBranch && (
                            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                              Sizin Şubeniz
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block">
                          {item.branch.city} • Kod: {item.branch.code}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.completedCount} / {item.totalRequired} Modül
                      </td>

                      <td className="p-3.5 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.completionRate >= 80
                                  ? 'bg-emerald-500'
                                  : item.completionRate >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${item.completionRate}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 w-10 text-right">
                            %{item.completionRate}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.totalCertificates} Sertifika
                      </td>

                      <td className="p-3.5 font-mono">
                        {item.totalCertificates > 0 ? `%${item.avgScorePct}` : '-'}
                      </td>

                      <td className="p-3.5 font-mono font-extrabold text-amber-600 dark:text-amber-400">
                        {item.compositePoints} Puan
                      </td>

                      <td className="p-3.5 text-right">
                        {item.completionRate === 100 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tam Uyumlu
                          </span>
                        ) : item.completionRate >= 50 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-extrabold">
                            <TrendingUp className="w-3.5 h-3.5" /> Başarılı
                          </span>
                        ) : item.totalCertificates > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold">
                            <Star className="w-3.5 h-3.5" /> Devam Ediyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-semibold">
                            Başlangıç
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PERSONNEL LEADERBOARD */}
      {activeSubTab === 'personnel' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {filteredPersonnelRankings.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Award className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Henüz Personel Sınav & Sertifika Kaydı Yok
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Personeller eğitim modüllerindeki 5 soruluk yeterlilik sınavlarını tamamlayıp sertifika aldıkça başarı sıralaması burada otomatik oluşur.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5 w-16 text-center">Sıra</th>
                    <th className="p-3.5">Personel Adı Soyadı</th>
                    <th className="p-3.5">Görev Yaptığı Şube</th>
                    <th className="p-3.5">Kazanılan Sertifika</th>
                    <th className="p-3.5">Ortalama Sınav Başarısı</th>
                    <th className="p-3.5">Toplam Puan</th>
                    <th className="p-3.5 text-right">Son Sertifika</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPersonnelRankings.map((person, idx) => {
                    const rank = idx + 1;
                    const latestCert = person.certificates[0];

                    return (
                      <tr
                        key={person.key}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="p-3.5 text-center">
                          {rank <= 3 ? (
                            <span
                              className={`inline-flex w-7 h-7 rounded-full font-black items-center justify-center ${
                                rank === 1
                                  ? 'bg-amber-400 text-slate-950'
                                  : rank === 2
                                  ? 'bg-slate-300 text-slate-900'
                                  : 'bg-orange-400 text-white'
                              }`}
                            >
                              {rank}
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-slate-500">#{rank}</span>
                          )}
                        </td>

                        <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                          {person.personnelName}
                        </td>

                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                          {person.branchName}
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px]">
                            🏆 {person.certificateCount} Sertifika
                          </span>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          %{person.avgQuizPct} ({person.totalCorrect}/{person.totalQuestions})
                        </td>

                        <td className="p-3.5 font-mono font-black text-amber-600 dark:text-amber-400">
                          {person.points} Puan
                        </td>

                        <td className="p-3.5 text-right">
                          {latestCert && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(latestCert)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Önizle
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadCertificatePdf(latestCert)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" /> PDF İndir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: CERTIFICATE ALBUM (SERTİFİKA ALBÜMÜ) */}
      {activeSubTab === 'album' && (
        <div className="space-y-4">
          {filteredAlbumCertificates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Award className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Sertifika Albümünde Henüz Kayıt Bulunmuyor
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Eğitim modüllerini veya Tebellüğ & Takip sayfasındaki 5 soruluk yeterlilik sınavını başarıyla tamamladığınızda sertifikalarınız bu albümde sergilenir.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAlbumCertificates.map(cert => {
                const score = cert.quizScore ?? 5;
                const total = cert.quizTotal ?? 5;
                const pct = Math.round((score / Math.max(1, total)) * 100);

                return (
                  <div
                    key={cert.id}
                    className="bg-gradient-to-br from-amber-50/70 via-white to-red-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-2xl border-2 border-amber-400/70 dark:border-amber-600/50 p-5 shadow-md hover:shadow-xl transition flex flex-col justify-between gap-4 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-amber-300/60 dark:border-slate-700 pb-2.5 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                          ESME AVM AKADEMİSİ
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded">
                          {cert.certificateId}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug mb-1">
                        {cert.personnelName}
                      </h4>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">
                        {cert.branchName}
                      </p>

                      <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {cert.trainingTitle}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Kategori:{' '}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {cert.category === 'depocu' ? 'Depocu Eğitim' : 'Bilgi İşlem'}
                            </strong>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                            {score}/{total} (%{pct})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Tarih: {new Date(cert.completedAt).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(cert)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Albümde Gör</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadCertificatePdf(cert)}
                        className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF İndir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HIGH-RESOLUTION CERTIFICATE ALBUM PREVIEW MODAL */}
      {previewCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Esme AVM Resmi Başarı ve Tebellüğ Sertifikası Önizlemesi
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {previewCertificate.completion.personnelName} • {previewCertificate.completion.branchName} • Kod: {previewCertificate.completion.certificateId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadCertificatePdf(previewCertificate.completion)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF İndir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCertificate(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={previewCertificate.imageUrl}
                alt="Esme AVM Sertifika"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-300 dark:border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
