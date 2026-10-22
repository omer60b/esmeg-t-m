import React, { useState, useEffect, useRef } from 'react';
import { SlideItem, TrainingDocument } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  FileText, 
  Download, 
  Printer, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock,
  Presentation,
  BookOpen,
  Eye
} from 'lucide-react';
import { DepocuOriginalPdfView } from './DepocuOriginalPdfView';

interface SlidePresentationViewerProps {
  training: TrainingDocument;
  slides: SlideItem[];
  onOpenPdf?: () => void;
  defaultMode?: 'slides' | 'pdf';
}

export const SlidePresentationViewer: React.FC<SlidePresentationViewerProps> = ({
  training,
  slides,
  onOpenPdf,
  defaultMode = 'slides'
}) => {
  const [viewMode, setViewMode] = useState<'slides' | 'pdf'>(defaultMode);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : 'w-full'
      }`}
    >
      {/* Top Slide Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-extrabold tracking-wide text-slate-200">
            ESME EĞİTİM DEPOCU MODÜLÜ
          </span>
          {viewMode === 'slides' && (
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
              Slayt {currentSlideIndex + 1} / {slides.length}
            </span>
          )}
        </div>

        {/* Mode Switcher: Slayt Sunumu vs Orijinal PDF (Bütünü İle) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewMode('slides')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'slides'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Slayt Sunumu ({slides.length})</span>
          </button>

          <button
            onClick={() => setViewMode('pdf')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'pdf'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Orijinal PDF Kitapçığı (Bütünü İle)</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {viewMode === 'slides' && (
            <>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isAutoPlaying 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Otomatik Slayt Gösterisi (6 sn)"
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoPlaying ? 'Durdur' : 'Otomatik Oynat'}</span>
              </button>

              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  showNotes 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sunum Notları</span>
              </button>
            </>
          )}

          {training.pdfPath && (
            <a
              href={training.pdfPath}
              download
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PDF İndir</span>
            </a>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Tam Ekran Modu"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Conditionally Render Original PDF View or Slides */}
      {viewMode === 'pdf' ? (
        <div className="p-4 sm:p-6 bg-slate-950 flex-1 overflow-y-auto max-h-[85vh]">
          <DepocuOriginalPdfView pdfUrl={training.pdfPath} />
        </div>
      ) : (
        <>

      {/* Main Slide Stage (16:9 Aspect Ratio Canvas) */}
      <div className="relative flex-1 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[440px] sm:min-h-[520px]">
        
        {/* Slide Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentSlide.categoryBadge || 'Depo & Lojistik SOP'}
              </span>
              <span className="text-slate-400 text-xs">
                {training.docNo}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {currentSlide.title}
            </h2>
            {currentSlide.subTitle && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {currentSlide.subTitle}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-slate-800 select-none">
              #{String(currentSlideIndex + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Slide Body Content */}
        <div className="my-auto py-6 space-y-6">
          
          {/* Bullets List with Icons */}
          {currentSlide.bullets && currentSlide.bullets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentSlide.bullets.map((bullet, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-lg hover:border-slate-700 transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Table Data if Slide Contains Table */}
          {currentSlide.tableData && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    {currentSlide.tableData.headers.map((h, i) => (
                      <th key={i} className="p-3 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentSlide.tableData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 font-medium">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Critical Alert Box on Slide */}
          {currentSlide.alertBox && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              currentSlide.alertBox.type === 'danger'
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
            }`}>
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-extrabold uppercase tracking-wide mb-0.5">
                  {currentSlide.alertBox.title}
                </p>
                <p className="leading-relaxed">
                  {currentSlide.alertBox.text}
                </p>
              </div>
            </div>
          )}

          {/* Key Takeaway Box */}
          {currentSlide.keyTakeaway && (
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3.5 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-200 font-semibold leading-relaxed">
                <span className="font-bold text-white">Önemli Çıkarım: </span>
                {currentSlide.keyTakeaway}
              </p>
            </div>
          )}
        </div>

        {/* Slide Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Esme Şirketler Grubu</span>
            <span>•</span>
            <span>Depo & Lojistik Eğitim Programı</span>
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1 transition shadow cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Önceki Slayt
            </button>

            <span className="px-2 font-mono text-slate-400 font-bold">
              {currentSlideIndex + 1} / {slides.length}
            </span>

            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1 transition shadow cursor-pointer"
            >
              Sonraki Slayt <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails & Notes Drawer */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-col gap-2">
        {/* Thumbnails Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                currentSlideIndex === idx
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="truncate max-w-[120px]">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Optional Presenter Notes Panel */}
        {showNotes && currentSlide.notes && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 animate-fadeIn">
            <span className="font-bold text-amber-400 block mb-1">Eğitmen & Sunum Notu:</span>
            <p className="leading-relaxed">{currentSlide.notes}</p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
