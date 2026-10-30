import React, { useState, useEffect } from 'react';
import { TrainingDocument, TrainingCategory } from '../types';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  FileText, 
  Maximize2, 
  Sun, 
  Moon, 
  Type, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Layers,
  Share2
} from 'lucide-react';

interface EBookReaderProps {
  trainings: TrainingDocument[];
  initialTrainingId?: string;
  onOpenTrainingDetail: (training: TrainingDocument) => void;
  appTheme?: 'sepia' | 'light' | 'dark';
  setAppTheme?: (theme: 'sepia' | 'light' | 'dark') => void;
}

export const EBookReader: React.FC<EBookReaderProps> = ({
  trainings,
  initialTrainingId,
  onOpenTrainingDetail,
  appTheme,
  setAppTheme
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrainingCategory>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [localTheme, setLocalTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showPdfSidebar, setShowPdfSidebar] = useState(false);

  const readingTheme = appTheme || localTheme;
  const handleSelectTheme = (theme: 'sepia' | 'light' | 'dark') => {
    setLocalTheme(theme);
    if (setAppTheme) setAppTheme(theme);
  };

  // Active category filtered books
  const visibleBooks = trainings.filter(t => selectedCategory === 'all' || t.category === selectedCategory);

  useEffect(() => {
    if (initialTrainingId) {
      const target = trainings.find(t => t.id === initialTrainingId);
      if (target) {
        setSelectedCategory(target.category);
        const categoryBooks = trainings.filter(t => t.category === target.category);
        const idxInFiltered = categoryBooks.findIndex(t => t.id === initialTrainingId);
        if (idxInFiltered >= 0) setCurrentIndex(idxInFiltered);
      }
    }
  }, [initialTrainingId, trainings]);

  const currentBook = visibleBooks[currentIndex] || visibleBooks[0] || trainings[0];
  const isBilgiIslem = currentBook?.category === 'bilgi-islem';

  const handleCategoryChange = (cat: 'all' | TrainingCategory) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
  };

  // Handle keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < visibleBooks.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, visibleBooks.length]);

  // Filter Table of Contents
  const filteredTOC = visibleBooks.filter(t => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.docNo.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q);
  });

  // Reading Theme styles
  const themeStyles = {
    light: 'bg-white text-slate-900 border-slate-200',
    dark: 'bg-slate-900 text-slate-100 border-slate-800',
    sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e8d5b5]'
  };

  const fontStyles = {
    normal: 'text-sm leading-relaxed',
    large: 'text-base leading-loose',
    xlarge: 'text-lg leading-loose'
  };

  return (
    <div className="space-y-4">

      {/* Category Independence Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 pl-2">Kitaplık Alanı:</span>
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tüm Kitapçıklar ({trainings.length})
          </button>
          <button
            onClick={() => handleCategoryChange('bilgi-islem')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'bilgi-islem'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Bilgi İşlem Kitapçıkları ({trainings.filter(t => t.category === 'bilgi-islem').length})
          </button>
          <button
            onClick={() => handleCategoryChange('depocu')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'depocu'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Depocu Kitapçığı & Sunumu ({trainings.filter(t => t.category === 'depocu').length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 pr-2 hidden sm:inline">
          {selectedCategory === 'depocu' 
            ? 'Yalnızca Depocu Eğitim Kitapçığı ve Sunumu görüntüleniyor' 
            : selectedCategory === 'bilgi-islem'
            ? 'Yalnızca Bilgi İşlem ve Kasa Talimatnameleri görüntüleniyor'
            : 'Tüm kurumsal el kitapları'}
        </span>
      </div>
      
      {/* E-Book Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {selectedCategory === 'depocu' 
                ? 'Esme Depocu Eğitim ve Görev Tanımı Kitapçığı'
                : selectedCategory === 'bilgi-islem'
                ? 'Esme Bilgi İşlem ve Operasyon Yönergeleri'
                : 'Esme Kurumsal Yönergeler ve Operasyon El Kitabı'}
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                2026 Edisyonu
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sayfa {currentIndex + 1} / {visibleBooks.length} • {currentBook.docNo}
            </p>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Font Size Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              title="Normal Yazı"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              title="Büyük Yazı"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded text-sm font-bold cursor-pointer ${fontSize === 'xlarge' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              title="Çok Büyük Yazı"
            >
              A++
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
            <button
              onClick={() => handleSelectTheme('sepia')}
              className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition cursor-pointer ${
                readingTheme === 'sepia'
                  ? 'bg-[#e8d5b5] text-[#2b1d0f] shadow-sm ring-1 ring-[#c8ad7f]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Kitap Kağıdı
            </button>
            <button
              onClick={() => handleSelectTheme('light')}
              className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition cursor-pointer ${
                readingTheme === 'light'
                  ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-300'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Açık
            </button>
            <button
              onClick={() => handleSelectTheme('dark')}
              className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition cursor-pointer ${
                readingTheme === 'dark'
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-700'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Koyu
            </button>
          </div>

          {/* PDF View Toggle */}
          {currentBook.pdfPath && (
            <button
              onClick={() => setShowPdfSidebar(!showPdfSidebar)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                showPdfSidebar 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {showPdfSidebar ? 'Metne Dön' : 'PDF Yan Panel'}
            </button>
          )}

          {/* Open full classroom modal */}
          <button
            onClick={() => onOpenTrainingDetail(currentBook)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Eğitim Modülüne Git
          </button>
        </div>

      </div>

      {/* Main E-Book Reader Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Table of Contents */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" />
              İçindekiler Dizini
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {visibleBooks.length} Doküman
            </span>
          </div>

          {/* TOC Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Kitapta ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Chapter Links */}
          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredTOC.map((t, idx) => {
              const isSelected = currentBook?.id === t.id;
              const isBI = t.category === 'bilgi-islem';

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    const originalIdx = visibleBooks.findIndex(orig => orig.id === t.id);
                    if (originalIdx >= 0) setCurrentIndex(originalIdx);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition border flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-sm'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isBI ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isBI ? 'Bilgi İşlem' : 'Depocu'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {t.docNo}
                      </span>
                    </div>

                    <p className={`font-semibold line-clamp-1 ${isSelected ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {t.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: The Book Page View */}
        <div
          className={`lg:col-span-8 rounded-2xl border p-6 sm:p-10 shadow-lg space-y-6 transition-colors duration-200 ${
            readingTheme === 'light'
              ? 'bg-white text-slate-950 border-slate-300'
              : readingTheme === 'sepia'
              ? 'bg-[#fbf0d9] text-[#2b1d0f] border-[#dec49a]'
              : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}
        >
          {/* Book Page Header */}
          <div
            className={`border-b pb-4 flex items-center justify-between gap-4 ${
              readingTheme === 'dark' ? 'border-slate-800' : 'border-slate-300'
            }`}
          >
            <div>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${
                  isBilgiIslem
                    ? readingTheme === 'dark'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                    : readingTheme === 'dark'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {isBilgiIslem ? 'BİLGİ İŞLEM KURUMSAL TALİMAT' : 'DEPOCU STANDART OPERASYON KILAVUZU'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {currentBook.title}
              </h1>
              <p
                className={`text-xs font-semibold mt-0.5 ${
                  readingTheme === 'dark'
                    ? 'text-slate-300'
                    : readingTheme === 'sepia'
                    ? 'text-[#5c4328]'
                    : 'text-slate-700'
                }`}
              >
                {currentBook.subTitle} • {currentBook.docNo}
              </p>
            </div>

            {currentBook.pdfPath && (
              <a
                href={currentBook.pdfPath}
                download
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition border ${
                  readingTheme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                }`}
                title="Orijinal PDF'i İndir"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </a>
            )}
          </div>

          {/* Side-by-side or Embedded PDF viewer */}
          {showPdfSidebar && (
            <div
              className={`rounded-2xl border p-4 mb-6 space-y-4 ${
                readingTheme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800'
                  : readingTheme === 'sepia'
                  ? 'bg-[#f4e4c3] border-[#d5b887]'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b ${
                  readingTheme === 'dark' ? 'border-slate-800' : 'border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-extrabold">Orijinal Resmi Yönerge PDF Belgesi</span>
                </div>

                <div className="flex items-center gap-2">
                  {currentBook.pdfPath && (
                    <>
                      <a
                        href={currentBook.pdfPath}
                        download
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF İndir
                      </a>
                      <a
                        href={currentBook.pdfPath}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
                          readingTheme === 'dark'
                            ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                            : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Yeni Sekmede Aç
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => window.print()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                      readingTheme === 'dark'
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    <span>🖨 Yazdır</span>
                  </button>
                </div>
              </div>

              {currentBook.pdfPath ? (
                <div className="h-[520px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950">
                  <object
                    data={currentBook.pdfPath}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <embed src={currentBook.pdfPath} type="application/pdf" className="w-full h-full" />
                    <div className="p-8 text-center text-slate-200 flex flex-col items-center justify-center h-full">
                      <FileText className="w-10 h-10 text-red-500 mb-2" />
                      <p className="font-bold text-xs">Tarayıcı PDF eklentisi iframe içinde engellendi.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Belge içeriği aşağıda metin ve madde olarak eksiksiz listelenmiştir. Orijinal PDF dosyasını yukarıdaki butondan indirebilirsiniz.
                      </p>
                      <a
                        href={currentBook.pdfPath}
                        download
                        className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                      >
                        PDF İndir
                      </a>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-semibold">
                  Bu doküman için harici PDF atanmamıştır. Aşağıdaki metin resmi yönergenin kendisidir.
                </div>
              )}
            </div>
          )}

          {/* Book Summary Card */}
          <div
            className={`p-4 rounded-xl border ${
              readingTheme === 'dark'
                ? 'bg-slate-800/70 border-slate-700 text-slate-100'
                : readingTheme === 'sepia'
                ? 'bg-[#f4e4c3] border-[#d5b887] text-[#2b1d0f]'
                : 'bg-slate-50 border-slate-300 text-slate-950'
            }`}
          >
            <h4 className="text-xs font-extrabold uppercase tracking-wider mb-1">
              Genelge Özeti ve Kapsamı
            </h4>
            <p className="text-xs font-medium leading-relaxed">
              {currentBook.summary}
            </p>
            <div
              className={`grid grid-cols-2 gap-2 mt-3 pt-2 border-t text-[11px] ${
                readingTheme === 'dark' ? 'border-slate-700' : 'border-slate-300'
              }`}
            >
              <div>
                <span
                  className={`block font-semibold ${
                    readingTheme === 'dark'
                      ? 'text-slate-400'
                      : readingTheme === 'sepia'
                      ? 'text-[#5c4328]'
                      : 'text-slate-600'
                  }`}
                >
                  Hedef Kitle / Kapsam:
                </span>
                <span className="font-extrabold">{currentBook.scope}</span>
              </div>
              <div>
                <span
                  className={`block font-semibold ${
                    readingTheme === 'dark'
                      ? 'text-slate-400'
                      : readingTheme === 'sepia'
                      ? 'text-[#5c4328]'
                      : 'text-slate-600'
                  }`}
                >
                  Yetkili Birim:
                </span>
                <span className="font-extrabold">{currentBook.targetUnit}</span>
              </div>
            </div>
          </div>

          {/* Book Chapters & Rules */}
          <div className={`space-y-6 ${fontStyles[fontSize]}`}>
            {(currentBook.chapters || []).map((chap, cIdx) => (
              <section key={chap.id} className="space-y-3 pt-2">
                <h3
                  className={`text-base sm:text-lg font-extrabold border-b pb-1.5 flex items-center gap-2 ${
                    readingTheme === 'dark' ? 'border-slate-800' : 'border-slate-300'
                  }`}
                >
                  <span className="text-red-600 font-black">§ {cIdx + 1}</span>
                  <span>{chap.title}</span>
                </h3>

                {chap.highlights && chap.highlights.length > 0 && (
                  <div
                    className={`p-3.5 rounded-lg border-l-4 ${
                      readingTheme === 'dark'
                        ? 'bg-slate-800/80 border-amber-500 text-slate-100'
                        : readingTheme === 'sepia'
                        ? 'bg-[#f4e4c3] border-[#b45309] text-[#2b1d0f]'
                        : 'bg-blue-50/90 border-blue-600 text-slate-950'
                    }`}
                  >
                    <p className="text-xs font-extrabold uppercase tracking-wider mb-1">
                      Önemli Şartlar:
                    </p>
                    <ul className="text-xs space-y-1 list-disc list-inside font-medium">
                      {chap.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="whitespace-pre-line leading-relaxed font-medium">
                  {chap.content}
                </div>

                {chap.criticalNotes && (
                  <div
                    className={`border-l-4 border-red-600 p-3.5 rounded-r-lg text-xs font-bold space-y-1 ${
                      readingTheme === 'dark'
                        ? 'bg-rose-950/50 text-rose-200'
                        : 'bg-rose-50 text-rose-950'
                    }`}
                  >
                    {chap.criticalNotes.map((cn, i) => (
                      <p key={i}>⚠ {cn}</p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Book Page Footer & Navigation */}
          <div
            className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
              readingTheme === 'dark' ? 'border-slate-800' : 'border-slate-300'
            }`}
          >
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed text-xs font-extrabold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                readingTheme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Önceki Doküman
            </button>

            <span className="text-xs font-mono font-extrabold">
              Doküman {currentIndex + 1} / {visibleBooks.length}
            </span>

            <button
              disabled={currentIndex === visibleBooks.length - 1}
              onClick={() => setCurrentIndex(p => Math.min(visibleBooks.length - 1, p + 1))}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed text-xs font-extrabold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                readingTheme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-300'
              }`}
            >
              Sonraki Doküman <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
