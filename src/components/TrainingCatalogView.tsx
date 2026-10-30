import React, { useState } from 'react';
import { 
  TrainingDocument, 
  TrainingCategory, 
  TrainingPriority, 
  TrainingCompletion 
} from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Building2, 
  ShieldAlert, 
  Sparkles, 
  FileDown, 
  Clock, 
  Search,
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';
import { isYouTubeUrl } from '../utils/videoUtils';

interface TrainingCatalogViewProps {
  trainings: TrainingDocument[];
  completions: TrainingCompletion[];
  selectedCategory: 'all' | TrainingCategory;
  setSelectedCategory: (cat: 'all' | TrainingCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectTraining: (training: TrainingDocument, initialTab?: 'content' | 'video' | 'pdf' | 'templates' | 'quiz' | 'presentation') => void;
  onOpenEBook: (trainingId?: string) => void;
  currentPersonnel: string;
  currentBranchId: number;
}

export const TrainingCatalogView: React.FC<TrainingCatalogViewProps> = ({
  trainings,
  completions,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectTraining,
  onOpenEBook,
  currentPersonnel,
  currentBranchId
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | TrainingPriority>('all');
  const [onlyVideo, setOnlyVideo] = useState(false);
  const [onlyCompleted, setOnlyCompleted] = useState<'all' | 'completed' | 'pending'>('all');

  // Filter trainings
  const filteredTrainings = trainings.filter(t => {
    // Category filter
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // Video filter
    if (onlyVideo && (!t.videoUrl || (t.videoType === 'none' && !isYouTubeUrl(t.videoUrl)))) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = (t.title || '').toLowerCase().includes(q);
      const inDocNo = (t.docNo || '').toLowerCase().includes(q);
      const inSummary = (t.summary || '').toLowerCase().includes(q);
      const inScope = (t.scope || '').toLowerCase().includes(q);
      const inUnit = (t.targetUnit || '').toLowerCase().includes(q);
      const inAuthor = (t.authorOrManager || '').toLowerCase().includes(q);
      const inChapters = (t.chapters || []).some(c => (c.title || '').toLowerCase().includes(q) || (c.content || '').toLowerCase().includes(q));
      if (!inTitle && !inDocNo && !inSummary && !inScope && !inUnit && !inAuthor && !inChapters) return false;
    }

    // Completion filter
    const isCompleted = completions.some(c => c.trainingId === t.id && c.branchId === currentBranchId);
    if (onlyCompleted === 'completed' && !isCompleted) return false;
    if (onlyCompleted === 'pending' && isCompleted) return false;

    return true;
  });

  const bilgiIslemCount = trainings.filter(t => t.category === 'bilgi-islem').length;
  const depocuCount = trainings.filter(t => t.category === 'depocu').length;
  const completedCount = trainings.filter(t => 
    completions.some(c => c.trainingId === t.id && c.branchId === currentBranchId)
  ).length;

  return (
    <div className="space-y-6">
      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tümü ({trainings.length})
          </button>
          <button
            onClick={() => setSelectedCategory('bilgi-islem')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === 'bilgi-islem'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200/50 dark:border-blue-800/50'
            }`}
          >
            Bilgi İşlem Eğitim ({bilgiIslemCount})
          </button>
          <button
            onClick={() => setSelectedCategory('depocu')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === 'depocu'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/50 dark:border-emerald-800/50'
            }`}
          >
            Depocu Eğitim ({depocuCount})
          </button>
        </div>

        {/* Priority & Video Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${priorityFilter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Tüm Öncelikler
            </button>
            <button
              onClick={() => setPriorityFilter('kritik')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${priorityFilter === 'kritik' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'}`}
            >
              <ShieldAlert className="w-3 h-3" /> Kritik
            </button>
            <button
              onClick={() => setPriorityFilter('zorunlu')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${priorityFilter === 'zorunlu' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'}`}
            >
              <AlertTriangle className="w-3 h-3" /> Zorunlu
            </button>
          </div>

          {/* Video Toggle */}
          <button
            onClick={() => setOnlyVideo(!onlyVideo)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
              onlyVideo
                ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Videolu Eğitimler
          </button>

          {/* Completion Toggle */}
          <select
            value={onlyCompleted}
            onChange={(e) => setOnlyCompleted(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-red-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="completed">Tamamlananlar</option>
            <option value="pending">Henüz İmzalanmayanlar</option>
          </select>
        </div>

      </div>

      {/* Training Cards Grid */}
      {filteredTrainings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
            Eğitim Modülü Bulunamadı
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Arama kriterinize veya filtrenize uygun eğitim bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz.
          </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriorityFilter('all');
                setOnlyVideo(false);
                setSearchQuery('');
                setOnlyCompleted('all');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500 transition shadow"
            >
              Filtreleri Temizle
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map((training) => {
            const isCompleted = completions.some(
              c => c.trainingId === training.id && c.branchId === currentBranchId
            );
            const isBilgiIslem = training.category === 'bilgi-islem';

            return (
              <div 
                key={training.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Card Header Top Badges */}
                  <div className={`p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 ${
                    isBilgiIslem 
                      ? 'bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10'
                      : 'bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isBilgiIslem
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300/60'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isBilgiIslem ? 'bg-blue-600' : 'bg-emerald-600'}`}></span>
                        {isBilgiIslem ? 'BİLGİ İŞLEM EĞİTİM' : 'DEPOCU EĞİTİM'}
                      </span>

                      <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {training.docNo}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                      {training.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {training.subTitle}
                    </p>
                  </div>

                  {/* Summary & Key Points */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {training.summary}
                    </p>

                    {/* Metadata tags */}
                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hedef Birim:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                          {training.targetUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Sorumlu / Onay:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                          {training.authorOrManager}
                        </span>
                      </div>
                    </div>

                    {/* Feature Indicators */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {training.isPresentation && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                          📊 İnteraktif Slayt Sunumu
                        </span>
                      )}

                      {training.priority === 'kritik' && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                          <ShieldAlert className="w-3 h-3" /> Sıfır Tolerans & Kritik
                        </span>
                      )}

                      {training.priority === 'zorunlu' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-200 dark:border-amber-900">
                          <AlertTriangle className="w-3 h-3" /> Zorunlu Kural
                        </span>
                      )}

                      {training.videoUrl && (
                        <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 px-2 py-0.5 rounded flex items-center gap-1 border border-sky-200 dark:border-sky-800">
                          <Video className="w-3 h-3 text-sky-500" /> {training.videoDuration || 'Video'}
                        </span>
                      )}

                      {training.pdfPath && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                          <FileText className="w-3 h-3 text-red-500" /> PDF Yönerge
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Actions and Status */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      Durum:
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Tamamlanmadı
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {training.isPresentation ? (
                      <>
                        <button
                          onClick={() => onSelectTraining(training, 'presentation')}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-900/20 cursor-pointer"
                        >
                          <span className="text-xs">📊</span>
                          <span>Slayt Sunumu</span>
                        </button>
                        <button
                          onClick={() => onSelectTraining(training, 'pdf')}
                          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-900/20 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Orijinal PDF</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onSelectTraining(training, 'content')}
                          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Eğitimi Oku
                        </button>

                        <button
                          onClick={() => onSelectTraining(training, training.videoUrl ? 'video' : 'quiz')}
                          className={`w-full text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow cursor-pointer ${
                            isCompleted
                              ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                          }`}
                        >
                          {training.videoUrl ? (
                            <>
                              <Video className="w-3.5 h-3.5" /> Video İzle
                            </>
                          ) : (
                            <>
                              <Award className="w-3.5 h-3.5" /> Sınava Gir & Onayla
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
