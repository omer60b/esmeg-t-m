import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  TrainingDocument, 
  TrainingCompletion,
  TrainingQuizQuestion
} from '../types';
import { SlidePresentationViewer } from './SlidePresentationViewer';
import { DepocuOriginalPdfView } from './DepocuOriginalPdfView';
import { UniversalVideoPlayer, isYouTubeUrl } from '../utils/videoUtils';
import { 
  X, 
  BookOpen, 
  Video, 
  FileText, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Upload, 
  Award, 
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Printer,
  Eye,
  Presentation,
  Building2,
  Sparkles,
  QrCode,
  ShieldCheck,
  Calendar,
  UserCheck,
  Youtube,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';
import { downloadCertificatePdf } from '../utils/certificateGenerator';

interface TrainingDetailModalProps {
  training: TrainingDocument;
  onClose: () => void;
  initialTab?: 'presentation' | 'content' | 'video' | 'pdf' | 'templates' | 'quiz';
  currentBranchId: number;
  currentBranchName: string;
  currentPersonnel: string;
  onRecordCompletion: (completion: TrainingCompletion) => void;
  onUpdateTrainingVideo?: (trainingId: string, videoUrl: string, videoTitle?: string) => Promise<void>;
  isAlreadyCompleted?: boolean;
  isAdmin?: boolean;
}

export const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({
  training,
  onClose,
  initialTab,
  currentBranchId,
  currentBranchName,
  currentPersonnel,
  onRecordCompletion,
  onUpdateTrainingVideo,
  isAlreadyCompleted = false,
  isAdmin = false
}) => {
  // Determine default tab
  const defaultTab = useMemo(() => {
    if (initialTab) return initialTab;
    if (training.isPresentation || (training.slides && training.slides.length > 0)) {
      return 'presentation';
    }
    return 'content';
  }, [initialTab, training.isPresentation, training.slides]);

  const [activeTab, setActiveTab] = useState<'presentation' | 'content' | 'video' | 'pdf' | 'templates' | 'quiz'>(defaultTab);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // PDF Viewer Mode: 'digital' (A4 formal interactive reader) vs 'embedded' (raw browser embed)
  const [pdfViewMode, setPdfViewMode] = useState<'digital' | 'embedded'>('digital');
  const [pdfZoom, setPdfZoom] = useState<number>(100);

  // Video state
  const [videoSrc, setVideoSrc] = useState<string>(training.videoUrl || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [adminVideoUrlInput, setAdminVideoUrlInput] = useState<string>(training.videoUrl || '');
  const [videoSaveMessage, setVideoSaveMessage] = useState<string | null>(null);

  // Keep activeTab synced when opened with a specific initialTab or training changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, training.id]);

  // Keep videoSrc synced in real-time when training.videoUrl updates from Firestore
  useEffect(() => {
    if (!uploadedVideoName) {
      setVideoSrc(training.videoUrl || '');
      setAdminVideoUrlInput(training.videoUrl || '');
    }
  }, [training.videoUrl, uploadedVideoName]);

  // Copy state
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Quiz state: generate 5 random questions (or all if <= 5)
  const randomizedQuestions = useMemo<TrainingQuizQuestion[]>(() => {
    if (!training.quiz || training.quiz.length === 0) return [];
    const pool = [...training.quiz];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  }, [training.quiz]);

  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [personnelInputName, setPersonnelInputName] = useState(currentPersonnel || '');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(null);
  const [quizValidationMsg, setQuizValidationMsg] = useState<string | null>(null);

  const isBilgiIslem = training.category === 'bilgi-islem';
  const chaptersList = (training.chapters && training.chapters.length > 0)
    ? training.chapters
    : [{ id: 'ch_1', title: 'Genel Kurallar', content: training.summary || 'Eğitim detayları...' }];
  const currentChapter = chaptersList[activeChapterIndex] || chaptersList[0];

  // Calculate Quiz Score & Pass state (Threshold: >= 4/5 or 80%)
  const correctCount = useMemo(() => {
    return randomizedQuestions.reduce((acc, q) => {
      return selectedAnswers[q.id] === q.correctOptionIndex ? acc + 1 : acc;
    }, 0);
  }, [randomizedQuestions, selectedAnswers]);

  const totalQuestions = randomizedQuestions.length;
  const isPassed = totalQuestions === 0 ? true : (correctCount / totalQuestions) >= 0.8; // En az %80 (4/5)

  // Handle local video file upload from device (Admin Only)
  const handleDeviceVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setUploadedVideoName(file.name);
      setIsPlaying(false);
    }
  };

  // Handle Admin saving YouTube / Web URL directly to this training
  const handleSaveAdminVideoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const trimmed = adminVideoUrlInput.trim();
    if (!trimmed) {
      await handleDeleteAdminVideo();
      return;
    }
    setUploadedVideoName(null);
    setVideoSrc(trimmed);
    if (onUpdateTrainingVideo) {
      await onUpdateTrainingVideo(training.id, trimmed, training.videoTitle || training.title);
      setVideoSaveMessage('Video linki kaydedildi ve tüm şube kullanıcılarına anında yayınlandı!');
      setTimeout(() => setVideoSaveMessage(null), 4000);
    }
  };

  const handleDeleteAdminVideo = async () => {
    if (!isAdmin) return;
    setUploadedVideoName(null);
    setVideoSrc('');
    setAdminVideoUrlInput('');
    if (onUpdateTrainingVideo) {
      await onUpdateTrainingVideo(training.id, '');
      setVideoSaveMessage('Video bu eğitimden kaldırıldı ve yayından alındı.');
      setTimeout(() => setVideoSaveMessage(null), 4000);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleAnswerSelect = (qId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizValidationMsg(null);
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length < randomizedQuestions.length) {
      setQuizValidationMsg(`Lütfen sınavı tamamlamadan önce tüm ${randomizedQuestions.length} soruyu cevaplayınız.`);
      return;
    }
    setQuizValidationMsg(null);
    setQuizSubmitted(true);
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizValidationMsg(null);
  };

  const handleFinalSignAgreement = () => {
    if (!personnelInputName.trim()) {
      setQuizValidationMsg('Lütfen personel adını ve soyadını yazınız.');
      return;
    }

    if (totalQuestions > 0 && !quizSubmitted) {
      setQuizValidationMsg('Lütfen öncelikle yukarıdaki 5 soruluk anlama testini çözüp "Sınavı Tamamla ve Sonucu Gör" butonuna tıklayınız.');
      return;
    }

    if (totalQuestions > 0 && !isPassed) {
      setQuizValidationMsg(`Sınav başarı barajını (%80 - En az 4 doğru) henüz sağlayamadınız. Puanınız: ${correctCount}/${totalQuestions}. Lütfen "Sınavı Yeniden Dene" butonuna tıklayarak testi tekrar çözünüz.`);
      return;
    }

    if (!agreedToTerms) {
      setQuizValidationMsg('Lütfen beyan ve onay kutucuğunu işaretleyiniz.');
      return;
    }

    setQuizValidationMsg(null);

    const certId = `ESME-SRT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedCertificateId(certId);

    const completionRecord: TrainingCompletion = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trainingId: training.id,
      trainingTitle: training.title,
      category: training.category,
      branchId: currentBranchId,
      branchName: currentBranchName,
      personnelName: personnelInputName.trim(),
      personnelRole: 'Şube Personeli / Sorumlusu',
      quizScore: correctCount,
      quizTotal: totalQuestions,
      quizPassed: isPassed,
      signedAgreement: true,
      completedAt: new Date().toISOString(),
      certificateId: certId
    };

    onRecordCompletion(completionRecord);
    setShowCertificateModal(true);
  };

  // Generate Formal PDF Certificate with 100% Turkish character fidelity
  const handleDownloadCertificatePdf = () => {
    const certId = generatedCertificateId || `ESME-TBL-${Date.now().toString(36).toUpperCase()}`;
    const completionObj: TrainingCompletion = {
      id: `comp_${Date.now()}`,
      trainingId: training.id,
      trainingTitle: training.title,
      category: training.category,
      branchId: currentBranchId,
      branchName: currentBranchName,
      personnelName: (personnelInputName || currentPersonnel).trim(),
      personnelRole: 'Şube Personeli / Sorumlusu',
      quizScore: correctCount,
      quizTotal: totalQuestions,
      quizPassed: isPassed,
      signedAgreement: true,
      completedAt: new Date().toISOString(),
      certificateId: certId
    };
    downloadCertificatePdf(
      completionObj,
      `Esme_AVM_Sertifika_${training.docNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    );
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isBilgiIslem 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200' 
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200'
              }`}>
                {isBilgiIslem ? 'Bilgi İşlem Eğitim' : 'Depocu Eğitim'}
              </span>

              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {training.docNo}
              </span>

              {training.isPresentation && (
                <span className="text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                  📊 İnteraktif Slayt Sunumu
                </span>
              )}

              {isAlreadyCompleted && (
                <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tamamlandı
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {training.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {training.subTitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 flex gap-2 overflow-x-auto scrollbar-none">
          
          {/* Tab 0: Slayt Sunumu (if slides available) */}
          {training.slides && training.slides.length > 0 && (
            <button
              onClick={() => setActiveTab('presentation')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'presentation'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 font-extrabold ring-1 ring-emerald-400'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              Slayt Sunumu ({training.slides.length} Slayt)
            </button>
          )}

          {/* Tab 1: İçerik */}
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'content'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            İçerik & Prosedür ({training.chapters.length} Bölüm)
          </button>

          {/* Tab 2: Video */}
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-sky-500" />
            Videolu Eğitim {training.videoDuration && `(${training.videoDuration})`}
          </button>

          {/* Tab 3: Resmi PDF Dokümanı (ALWAYS AVAILABLE & BULLETPROOF) */}
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            Resmi PDF & Doküman
          </button>

          {/* Tab 4: Resmi Yazışma & Şablonlar */}
          {training.officialNotice?.officialTemplate && (
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              Resmi Yazışma & Şablonlar
            </button>
          )}

          {/* Tab 5: Sınav & Sertifika */}
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            5 Soruluk Sınav & Sertifika
            {isAlreadyCompleted && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            )}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* TAB 0: SLIDE PRESENTATION VIEW */}
          {activeTab === 'presentation' && training.slides && training.slides.length > 0 && (
            <div className="space-y-4">
              <SlidePresentationViewer
                training={training}
                slides={training.slides}
                onOpenPdf={() => setActiveTab('pdf')}
              />
            </div>
          )}

          {/* TAB 1: CONTENT & CHAPTERS */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              
              {/* Chapter Selector if multi chapters */}
              {training.chapters.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Bölümler:
                  </span>
                  {training.chapters.map((chap, idx) => (
                    <button
                      key={chap.id}
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                        activeChapterIndex === idx
                          ? 'bg-red-600 text-white font-bold shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}. {chap.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Chapter Details */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                    Bölüm {activeChapterIndex + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {currentChapter.title}
                  </h3>
                </div>

                {/* Highlights / Key Items */}
                {currentChapter.highlights && currentChapter.highlights.length > 0 && (
                  <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Önemli Şartlar & Kılavuz Noktaları
                    </h4>
                    <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-200">
                      {currentChapter.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Markdown / Body text */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {currentChapter.content}
                </div>

                {/* Optional Table */}
                {currentChapter.tableData && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold text-[10px]">
                        <tr>
                          {currentChapter.tableData.headers.map((h, idx) => (
                            <th key={idx} className="p-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {currentChapter.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 font-medium text-slate-800 dark:text-slate-200">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Critical Caution Notes */}
                {currentChapter.criticalNotes && currentChapter.criticalNotes.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 mt-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Kesin Yasak ve Cezai Sorumluluk
                    </h4>
                    <ul className="space-y-1 text-xs text-rose-950 dark:text-rose-200">
                      {currentChapter.criticalNotes.map((n, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">⚠</span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Bottom Navigation for chapters */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={activeChapterIndex === 0}
                  onClick={() => setActiveChapterIndex(p => Math.max(0, p - 1))}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Önceki Bölüm
                </button>

                {activeChapterIndex < training.chapters.length - 1 ? (
                  <button
                    onClick={() => setActiveChapterIndex(p => p + 1)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow flex items-center gap-1 cursor-pointer"
                  >
                    Sonraki Bölüm <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" /> Sınava Geç
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: VIDEO TRAINING & PLAYER (ADMIN ONLY UPLOAD & YOUTUBE LINK SYNC) */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-sky-400" />
                        {training.videoTitle || `${training.title} Video Eğitimi`}
                      </h3>
                      {isYouTubeUrl(videoSrc) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                          <Youtube className="w-3 h-3" /> YouTube
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {uploadedVideoName ? `Yüklenen Video: ${uploadedVideoName}` : 'Standart Operasyon ve Uygulama Kaydı'}
                    </p>
                  </div>

                  {/* Device Video Upload Button - STRICTLY FOR ADMINS */}
                  {isAdmin ? (
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition">
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>Cihazdan Önizle</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleDeviceVideoUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                      🔒 Video yönetimi sadece yetkili yöneticilere açıktır
                    </span>
                  )}
                </div>

                {/* Admin Direct YouTube / Video Link Bar */}
                {isAdmin && (
                  <form onSubmit={handleSaveAdminVideoUrl} className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-sky-400 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        Yönetici: YouTube veya Video Linkini Tüm Şubelere Anlık Yayınla
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={adminVideoUrlInput}
                          onChange={(e) => setAdminVideoUrlInput(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... veya MP4 video linki"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer shrink-0"
                      >
                        Kaydet & Anlık Yayınla
                      </button>
                      {(videoSrc || training.videoUrl) && (
                        <button
                          type="button"
                          onClick={handleDeleteAdminVideo}
                          className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                          title="Bu eğitimin videosunu sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Videoyu Kaldır</span>
                        </button>
                      )}
                    </div>
                    {videoSaveMessage && (
                      <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {videoSaveMessage}
                      </p>
                    )}
                  </form>
                )}

                {/* Universal Video Player (YouTube, Vimeo, Drive, HTML5 MP4) */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[460px] flex items-center justify-center border border-slate-800">
                  <UniversalVideoPlayer
                    src={videoSrc}
                    title={training.videoTitle || training.title}
                    videoRef={videoRef}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    emptyMessage={
                      isAdmin
                        ? 'Yukarıdaki alana YouTube veya video linki yapıştırarak tüm kullanıcılara yayınlayabilirsiniz.'
                        : 'Yönetici tarafından video eklendiğinde burada anlık gösterilecektir.'
                    }
                  />
                </div>

                {/* Quick Video Controls Bar (Only for HTML5 direct video) */}
                {videoSrc && !isYouTubeUrl(videoSrc) && (
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayPause}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                        {isPlaying ? 'Durdur' : 'Oynat'}
                      </button>

                      <button
                        onClick={() => skipVideo(-10)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                        title="10 Saniye Geri"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> -10s
                      </button>

                      <button
                        onClick={() => skipVideo(10)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                        title="10 Saniye İleri"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> +10s
                      </button>
                    </div>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 px-1">Hız:</span>
                      {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => handleRateChange(rate)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            playbackRate === rate
                              ? 'bg-sky-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Notes */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  Videolu Eğitim Notları ve İzleme Zorunluluğu
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bu videoda gösterilen kasa ekranları, POS adımları ve şase numarası eşleştirmeleri birebir uygulanmalıdır. Videoyu izledikten sonra lütfen "5 Soruluk Sınav & Sertifika" sekmesinden eğitiminizi onaylayınız.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: DUAL-MODE PDF & OFFICIAL DOCUMENT VIEWER (100% VISIBLE) */}
          {activeTab === 'pdf' && (
            (training.id === 'dp-sunum-depo-gorev-tanimi' || training.pdfPath?.includes('ESME_Depocu')) ? (
              <DepocuOriginalPdfView pdfUrl={training.pdfPath} />
            ) : (
            <div className="space-y-4">
              
              {/* PDF Header Controls Bar */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                
                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setPdfViewMode('digital')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      pdfViewMode === 'digital'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>📄 Dijital Resmi Belge (A4 Hatasız)</span>
                  </button>

                  <button
                    onClick={() => setPdfViewMode('embedded')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      pdfViewMode === 'embedded'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>📎 Gömülü PDF / İndir</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintDocument}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Yazdır"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Yazdır</span>
                  </button>

                  {training.pdfPath && (
                    <>
                      <a
                        href={training.pdfPath}
                        download
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF İndir</span>
                      </a>

                      <a
                        href={training.pdfPath}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Yeni Sekmede Aç</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* MODE 1: FORMAL A4 DIGITAL DOCUMENT (GUARANTEED 100% VISIBLE & PRINTABLE) */}
              {pdfViewMode === 'digital' && (
                <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-6 relative overflow-hidden font-sans">
                  
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <span className="text-8xl sm:text-9xl font-black rotate-[-35deg] text-red-900">
                      ESME RESMİ
                    </span>
                  </div>

                  {/* Official Header */}
                  <div className="border-b-2 border-red-600 pb-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-black text-2xl flex items-center justify-center shadow">
                          E
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
                            ESME AVM
                          </h1>
                          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                            Bilgi İşlem ve Depo Yönetimi Direktörlüğü
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-600">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-mono font-bold block mb-1">
                          {training.docNo}
                        </span>
                        <span className="text-[10px] text-slate-500">Tarih: 2026-01-01 • Rev: 02</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Info Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Kapsam:</span>
                      <span className="font-semibold text-slate-800">{training.scope}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Hedef Birim:</span>
                      <span className="font-semibold text-slate-800">{training.targetUnit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Onaylayan:</span>
                      <span className="font-semibold text-slate-800">{training.authorOrManager}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Öncelik Seviyesi:</span>
                      <span className="font-bold text-red-600 uppercase">{training.priority}</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      {training.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium italic">
                      "{training.subTitle}"
                    </p>
                    <div className="bg-red-50/60 border-l-4 border-red-600 p-3 rounded-r-lg text-xs text-slate-800 leading-relaxed">
                      <strong>YÖNERGE AMACI & ÖZETİ:</strong> {training.summary}
                    </div>
                  </div>

                  {/* Official Chapters / Articles */}
                  <div className="space-y-6 pt-2">
                    {training.chapters.map((chap, cIdx) => (
                      <div key={chap.id} className="space-y-3 border-t border-slate-100 pt-4">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {cIdx + 1}
                          </span>
                          <span>{chap.title}</span>
                        </h3>

                        {chap.highlights && chap.highlights.length > 0 && (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                              Temel Uygulama Maddeleri:
                            </span>
                            <ul className="text-xs space-y-1 list-disc list-inside text-slate-800">
                              {chap.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {chap.content}
                        </div>

                        {chap.tableData && (
                          <div className="overflow-x-auto rounded-lg border border-slate-200 mt-2">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                                <tr>
                                  {chap.tableData.headers.map((h, i) => (
                                    <th key={i} className="p-2.5">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {chap.tableData.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {chap.criticalNotes && (
                          <div className="bg-rose-50 border-l-4 border-rose-600 p-3 rounded-r-lg text-xs text-rose-900 font-semibold space-y-1">
                            {chap.criticalNotes.map((cn, i) => (
                              <p key={i}>⚠ {cn}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sign-off Stamps */}
                  <div className="border-t-2 border-slate-200 pt-6 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block">Turgut CESUR</span>
                      <span className="text-[10px] text-slate-500 block">Bilgi İşlem ve Kasa Müdürü</span>
                      <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Elektronik Mühürlü</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block">O.BAS</span>
                      <span className="text-[10px] text-slate-500 block">Genel Yönetici / Koordinasyon</span>
                      <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Kurumsal Onaylı</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block">Şube Personeli</span>
                      <span className="text-[10px] text-slate-500 block">{currentPersonnel}</span>
                      <span className="text-[10px] text-blue-600 font-bold mt-1 block">Yönerge No: {training.docNo}</span>
                    </div>
                  </div>

                </div>
              )}

              {/* MODE 2: EMBEDDED PDF OBJECT & DOWNLOAD */}
              {pdfViewMode === 'embedded' && (
                <div className="space-y-4">
                  {training.pdfPath ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 h-[650px] bg-slate-100 dark:bg-slate-950">
                      <object
                        data={training.pdfPath}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <embed src={training.pdfPath} type="application/pdf" className="w-full h-full" />
                        <div className="p-8 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center justify-center h-full">
                          <FileText className="w-12 h-12 text-red-500 mb-3" />
                          <p className="font-bold text-sm">Tarayıcınız PDF önizlemesini doğrudan açamadı.</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-md">
                            Güvenlik kısıtlamaları nedeniyle tarayıcı eklentisi engellenmiş olabilir. Yukarıdaki "📄 Dijital Resmi Belge" sekmesinden metni eksiksiz okuyabilir veya aşağıdaki butonla PDF dosyasını indirebilirsiniz.
                          </p>
                          <a
                            href={training.pdfPath}
                            download
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                          >
                            PDF Dosyasını İndir
                          </a>
                        </div>
                      </object>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-800 dark:text-white">Bu modül için ham PDF yüklenmemiş.</p>
                      <p className="text-xs text-slate-500 mt-1">Lütfen "📄 Dijital Resmi Belge" sekmesini kullanarak resmi metni görüntüleyiniz.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
            )
          )}

          {/* TAB 4: TEMPLATES */}
          {activeTab === 'templates' && training.officialNotice && (
            <div className="space-y-6">
              {training.officialNotice.officialTemplate && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        {training.officialNotice.officialTemplate.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        İlgili birimlere gönderilecek resmi e-posta şablonu (Kopyalayarak Outlook/Spark'a yapıştırınız)
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyText(`Kime: ${training.officialNotice?.officialTemplate?.to}\nBilgi: ${training.officialNotice?.officialTemplate?.cc || ''}\nKonu: ${training.officialNotice?.officialTemplate?.subject}\n\n${training.officialNotice?.officialTemplate?.body}`)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer ${
                        copiedTemplate
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                      }`}
                    >
                      {copiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTemplate ? 'Kopyalandı' : 'Şablonu Kopyala'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2 text-slate-800 dark:text-slate-200">
                    <div><strong className="text-slate-500">Kime:</strong> {training.officialNotice.officialTemplate.to}</div>
                    {training.officialNotice.officialTemplate.cc && (
                      <div><strong className="text-slate-500">Bilgi:</strong> {training.officialNotice.officialTemplate.cc}</div>
                    )}
                    <div><strong className="text-slate-500">Konu:</strong> {training.officialNotice.officialTemplate.subject}</div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 whitespace-pre-line leading-relaxed">
                      {training.officialNotice.officialTemplate.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 5-QUESTION QUIZ & OFFICIAL CERTIFICATE FLOW */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              
              {/* Quiz Banner */}
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                      Resmi Yönerge Değerlendirme Sınavı
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black">
                    5 Soruluk Başarı Testi ve Beyan Onay Alanı
                  </h3>
                  <p className="text-xs text-rose-100 mt-1 max-w-xl">
                    Başarı sertifikası kazanabilmek için rastgele oluşturulan 5 soruluk testten <strong>en az 4 doğru (%80 başarı şartı)</strong> almanız gerekmektedir.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold block text-rose-200">Başarı Kriteri</span>
                  <span className="text-lg font-black text-amber-300">En Az 4 / 5</span>
                </div>
              </div>

              {/* Questions List */}
              {randomizedQuestions.length > 0 ? (
                <div className="space-y-4">
                  {randomizedQuestions.map((q, qIndex) => {
                    const selected = selectedAnswers[q.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.correctOptionIndex;

                    return (
                      <div 
                        key={q.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {qIndex + 1}
                          </span>
                          <span className="leading-snug">{q.question}</span>
                        </h4>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = selected === optIndex;
                            let btnStyle = 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100';

                            if (quizSubmitted) {
                              if (optIndex === q.correctOptionIndex) {
                                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 font-bold';
                              } else if (isChosen && !isCorrect) {
                                btnStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700 font-bold';
                              }
                            } else if (isChosen) {
                              btnStyle = 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-400 dark:border-red-700 font-bold shadow-sm';
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleAnswerSelect(q.id, optIndex)}
                                className={`w-full text-left p-3 rounded-xl text-xs border transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && optIndex === q.correctOptionIndex && (
                                  <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            💡 <strong>Açıklama:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Submit Quiz Button */}
                  {!quizSubmitted && (
                    <div className="text-center pt-2 space-y-3">
                      {quizValidationMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{quizValidationMsg}</span>
                        </div>
                      )}
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-900/30 transition cursor-pointer"
                      >
                        Sınavı Tamamla ve Sonucu Gör
                      </button>
                    </div>
                  )}

                  {/* Quiz Result Box */}
                  {quizSubmitted && (
                    <div className={`p-5 rounded-2xl border text-center space-y-2 ${
                      isPassed 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                    }`}>
                      <h4 className="text-base font-black">
                        {isPassed ? '🎉 Tebrikler! Sınavı Başarıyla Geçtiniz' : '❌ Başarı Barajı Sağlanamadı'}
                      </h4>
                      <p className="text-xs">
                        Puanınız: <strong>{correctCount} / {totalQuestions} Doğru</strong> (%{Math.round((correctCount / totalQuestions) * 100)}) • Başarı Şartı: En az 4 Doğru (%80)
                      </p>
                      {!isPassed && (
                        <div className="pt-2 space-y-2">
                          <p className="text-[11px] opacity-80">
                            Lütfen hatalı cevapladığınız soruların açıklamalarını inceleyip yönerge maddelerini tekrar okuduktan sonra sınavı yeniden deneyiniz.
                          </p>
                          <button
                            type="button"
                            onClick={handleRetryQuiz}
                            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Sınavı Yeniden Dene</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Bu eğitim için doğrudan tamamlama onayı geçerlidir.</p>
                </div>
              )}

              {/* Digital Onay & Taahhüt Form */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                {quizValidationMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{quizValidationMsg}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    Personel Eğitimi Tamamlama ve Taahhüt Beyanı
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Şube / Görev Yeri:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentBranchName}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Eğitimi Tamamlayan Personel (Ad Soyad):
                    </label>
                    <input
                      type="text"
                      value={personnelInputName}
                      onChange={(e) => setPersonnelInputName(e.target.value)}
                      placeholder="Adınız ve Soyadınız"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-semibold focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-red-600 rounded border-slate-700 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-200 leading-relaxed">
                      <strong>KURUMSAL TAAHHÜT:</strong> Yukarıda ve ilgili yönergede ({training.docNo}) açıklanan operasyonel kuralları, süreç adımlarını eksiksiz okuduğumu; sınava katılarak başarıyla tamamladığımı ve tüm süreçlerde kurallara harfiyen uyacağımı şahsen beyan, kabul ve taahhüt ederim.
                    </span>
                  </label>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Kayıt Tarihi: {new Date().toLocaleDateString('tr-TR')} • Esme Kurumsal Arşiv
                  </span>

                  <button
                    onClick={handleFinalSignAgreement}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Okudum, Onaylıyorum ve Tamamladım</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* SUCCESSFUL CERTIFICATE DISPLAY MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Esme AVM Akademisi
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Başarı ve Yeterlilik Sertifikası
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  5 soruluk sınavı %80 üzeri başarıyla tamamlayarak ({correctCount}/{totalQuestions}) sertifika almaya hak kazandınız.
                </p>
              </div>

              {/* Certificate Card Preview */}
              <div className="border-4 border-amber-500/30 rounded-2xl p-6 bg-gradient-to-br from-amber-500/5 to-red-500/5 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Personel Adı</span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">{personnelInputName || currentPersonnel}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Şube</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentBranchName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Eğitim:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{training.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sertifika Kodu:</span>
                    <span className="font-mono font-bold text-red-600">{generatedCertificateId}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
                  <span className="text-emerald-600 font-bold">✓ Dijital Mühür Onaylı</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadCertificatePdf}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Sertifikayı PDF Olarak İndir</span>
                </button>

                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  Kapat
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
