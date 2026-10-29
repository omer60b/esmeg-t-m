import React, { useState, useRef, useEffect } from 'react';
import { TrainingDocument, TrainingCategory } from '../types';
import { UniversalVideoPlayer, isYouTubeUrl, getYouTubeThumbnailUrl } from '../utils/videoUtils';
import { 
  Video, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Upload, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Plus,
  Youtube,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';

interface VideoHubViewProps {
  trainings: TrainingDocument[];
  selectedCategory: 'all' | TrainingCategory;
  setSelectedCategory: (cat: 'all' | TrainingCategory) => void;
  onOpenTrainingDetail: (training: TrainingDocument) => void;
  onOpenAdminNewTraining?: (videoSrc?: string) => void;
  onQuickUpdateVideo?: (trainingId: string, videoUrl: string, videoTitle?: string) => Promise<void>;
  isAdmin?: boolean;
}

export const VideoHubView: React.FC<VideoHubViewProps> = ({
  trainings,
  selectedCategory,
  setSelectedCategory,
  onOpenTrainingDetail,
  onOpenAdminNewTraining,
  onQuickUpdateVideo,
  isAdmin
}) => {
  const videoTrainings = trainings.filter(t => 
    Boolean(t.videoUrl && t.videoUrl.trim() && (t.videoType !== 'none' || isYouTubeUrl(t.videoUrl)))
  );

  const [activeTrainingId, setActiveTrainingId] = useState<string>(
    videoTrainings[0]?.id || trainings[0]?.id || ''
  );

  // Always resolve the freshest training object from trainings prop so real-time updates reflect immediately
  const activeTraining = videoTrainings.find(t => t.id === activeTrainingId) || videoTrainings[0] || trainings[0];

  useEffect(() => {
    if (activeTraining && activeTraining.id !== activeTrainingId) {
      setActiveTrainingId(activeTraining.id);
    }
  }, [activeTraining, activeTrainingId]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);
  const [quickYoutubeUrl, setQuickYoutubeUrl] = useState('');
  const [quickAssignSuccess, setQuickAssignSuccess] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredVideos = videoTrainings.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const changeRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Upload local device video
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoSrc(url);
      setCustomVideoName(file.name);
      setIsPlaying(false);
    }
  };

  // Handle quick YouTube / video URL assignment by Admin
  const handleQuickAssignUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickYoutubeUrl.trim();
    if (!trimmed) return;

    if (onQuickUpdateVideo && activeTraining) {
      await onQuickUpdateVideo(activeTraining.id, trimmed, activeTraining.videoTitle || activeTraining.title);
      setCustomVideoSrc(null);
      setCustomVideoName(null);
      setQuickYoutubeUrl('');
      setQuickAssignSuccess(`"${activeTraining.title}" eğitimine video linki anlık olarak kaydedildi ve tüm kullanıcılara yayınlandı!`);
      setTimeout(() => setQuickAssignSuccess(null), 5000);
    } else if (onOpenAdminNewTraining) {
      onOpenAdminNewTraining(trimmed);
    }
  };

  const currentSrc = customVideoSrc || activeTraining?.videoUrl || '';
  const isCurrentYouTube = isYouTubeUrl(currentSrc);

  return (
    <div className="space-y-6">
      
      {/* Video Hub Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold mb-2">
            <Video className="w-3.5 h-3.5" /> esmeegitim Multimedya & Video Eğitim Merkezi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Videolu Operasyon ve Süreç Eğitimleri
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
            Kasa işlemleri, ERP IMEI dökümleri, Volta ve Sunny motosiklet tescil süreçleri için adım adım ekran kayıtları, YouTube eğitimleri ve pratik uygulama videoları.
          </p>
        </div>

        {/* Admin Quick YouTube Link & Video Management Box */}
        {isAdmin && (
          <div className="bg-slate-800/90 backdrop-blur border border-sky-500/30 rounded-2xl p-4 flex flex-col gap-3 shrink-0 w-full lg:max-w-md shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Yönetici: Anlık YouTube / Video Linki Ata</span>
              </div>
              {onOpenAdminNewTraining && (
                <button
                  onClick={() => onOpenAdminNewTraining(quickYoutubeUrl.trim() || customVideoSrc || undefined)}
                  className="text-[11px] bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer shadow"
                >
                  <Plus className="w-3 h-3" /> Yeni Video Eğitim Aç
                </button>
              )}
            </div>

            <form onSubmit={handleQuickAssignUrl} className="space-y-2">
              <p className="text-[11px] text-slate-300 leading-tight">
                Seçili eğitime (<strong>{activeTraining?.title}</strong>) YouTube veya MP4 linki yapıştırıp kaydettiğinizde tüm kullanıcılarda anında görünür:
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickYoutubeUrl}
                    onChange={(e) => setQuickYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... veya youtu.be/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3.5 rounded-lg transition shadow shrink-0 cursor-pointer"
                >
                  Anlık Yayınla
                </button>
              </div>
            </form>

            {quickAssignSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{quickAssignSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/70">
              <span className="text-[10px] text-slate-400">
                Veya yerel dosyadan önizleme yapın:
              </span>
              <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold py-1 px-2.5 rounded-lg transition flex items-center gap-1">
                <Upload className="w-3 h-3 text-sky-400" />
                <span>Cihazdan MP4 Seç</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleDeviceUpload}
                  className="hidden"
                />
              </label>
            </div>
            {customVideoName && (
              <span className="text-[10px] text-amber-300 truncate block">
                ⚠ Cihaz önizlemesi: {customVideoName} (Tüm şubelerde görünmesi için YouTube/Web linki kullanınız)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Video Arena: Player on Left, Playlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Video Player */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl p-4 sm:p-6 text-white space-y-4">
          
          {activeTraining ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      activeTraining.category === 'bilgi-islem'
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                        : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                    }`}>
                      {activeTraining.category === 'bilgi-islem' ? 'BİLGİ İŞLEM VİDEOSU' : 'DEPOCU VİDEOSU'}
                    </span>
                    {isCurrentYouTube && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                        <Youtube className="w-3 h-3" /> YouTube Yayını
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {customVideoName ? `Cihazdan: ${customVideoName}` : activeTraining.videoTitle || activeTraining.title}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenTrainingDetail(activeTraining)}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Eğitim Metnini & Sınavı Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Universal Player (Supports YouTube, Vimeo, Google Drive, Direct MP4) */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                <UniversalVideoPlayer
                  src={currentSrc}
                  title={activeTraining.videoTitle || activeTraining.title}
                  videoRef={videoRef}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>

              {/* Controls Bar (Shown for direct HTML5 videos; YouTube has built-in player controls) */}
              {!isCurrentYouTube && currentSrc && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Durdur' : 'Oynat'}
                    </button>
                    <button
                      onClick={() => skipTime(-10)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> 10s Geri
                    </button>
                    <button
                      onClick={() => skipTime(10)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                    >
                      10s İleri <RotateCw className="w-3.5 h-3.5 inline ml-1" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 px-1">Oynatma Hızı:</span>
                    {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => changeRate(rate)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          playbackRate === rate ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Description & Highlights */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Eğitim Özeti ve Dikkat Edilecekler
                </h4>
                <p className="leading-relaxed">
                  {activeTraining.summary}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Süre: {activeTraining.videoDuration || '05:00'}</span>
                  <span>Doküman: {activeTraining.docNo}</span>
                  <span>Birim: {activeTraining.targetUnit}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-12 text-slate-400">
              Henüz video tanımlı bir eğitim bulunmamaktadır.
            </div>
          )}

        </div>

        {/* Right: Video Playlist */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-sky-500" />
              Video Oynatma Listesi ({filteredVideos.length})
            </h4>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => setSelectedCategory('bilgi-islem')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${selectedCategory === 'bilgi-islem' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Bİ
              </button>
              <button
                onClick={() => setSelectedCategory('depocu')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${selectedCategory === 'depocu' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
              >
                Depo
              </button>
            </div>
          </div>

          {/* Playlist Cards */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredVideos.map((t) => {
              const isActive = activeTraining?.id === t.id && !customVideoSrc;
              const isBI = t.category === 'bilgi-islem';
              const ytThumb = getYouTubeThumbnailUrl(t.videoUrl);

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTrainingId(t.id);
                    setCustomVideoSrc(null);
                    setCustomVideoName(null);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-800 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {ytThumb ? (
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <img src={ytThumb} alt={t.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isBI ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isBI ? 'Bilgi İşlem' : 'Depocu'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.videoDuration || '05:00'}
                      </span>
                    </div>

                    <h5 className={`text-xs font-bold truncate ${isActive ? 'text-sky-900 dark:text-sky-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {t.videoTitle || t.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {t.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
