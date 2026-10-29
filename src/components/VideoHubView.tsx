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
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Layers,
  Film
} from 'lucide-react';

interface VideoHubViewProps {
  trainings: TrainingDocument[];
  selectedCategory: 'all' | TrainingCategory;
  setSelectedCategory: (cat: 'all' | TrainingCategory) => void;
  onOpenTrainingDetail: (training: TrainingDocument) => void;
  onOpenAdminNewTraining?: (videoSrc?: string) => void;
  onQuickUpdateVideo?: (trainingId: string, videoUrl: string, videoTitle?: string, videoDuration?: string) => Promise<void>;
  onDeleteVideo?: (trainingId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const VideoHubView: React.FC<VideoHubViewProps> = ({
  trainings,
  selectedCategory,
  setSelectedCategory,
  onOpenTrainingDetail,
  onOpenAdminNewTraining,
  onQuickUpdateVideo,
  onDeleteVideo,
  isAdmin
}) => {
  const videoTrainings = trainings.filter(t => 
    Boolean(t.videoUrl && t.videoUrl.trim() && (t.videoType !== 'none' || isYouTubeUrl(t.videoUrl)))
  );

  // Filter mode for playlist: 'videos_only' or 'all_topics' (allows admins to see & edit older topics without video)
  const [playlistMode, setPlaylistMode] = useState<'videos_only' | 'all_topics'>(() => {
    return (isAdmin && videoTrainings.length === 0) ? 'all_topics' : 'videos_only';
  });

  const [activeTrainingId, setActiveTrainingId] = useState<string>(
    videoTrainings[0]?.id || trainings[0]?.id || ''
  );

  // Always resolve the freshest training object from trainings prop
  const activeTraining = trainings.find(t => t.id === activeTrainingId) || videoTrainings[0] || trainings[0];

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

  // Admin Video Edit Modal State
  const [editingTraining, setEditingTraining] = useState<TrainingDocument | null>(null);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDuration, setEditVideoDuration] = useState('05:00');

  // Admin Video Delete Confirmation Modal State
  const [deletingVideoTraining, setDeletingVideoTraining] = useState<TrainingDocument | null>(null);

  // Determine which list to display in the playlist
  const displayedTrainings = playlistMode === 'all_topics' ? trainings : videoTrainings;

  const filteredPlaylist = displayedTrainings.filter(t => {
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

  // Open Edit Video Modal for a specific training
  const handleOpenEditVideo = (training: TrainingDocument) => {
    setEditingTraining(training);
    setEditVideoUrl(training.videoUrl || '');
    setEditVideoTitle(training.videoTitle || training.title);
    setEditVideoDuration(training.videoDuration || '05:00');
  };

  // Save Video Edit / Add to training
  const handleSaveVideoEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;
    const trimmed = editVideoUrl.trim();

    if (onQuickUpdateVideo) {
      await onQuickUpdateVideo(
        editingTraining.id, 
        trimmed, 
        editVideoTitle.trim() || editingTraining.title,
        editVideoDuration.trim() || '05:00'
      );
    }

    setEditingTraining(null);
    setQuickAssignSuccess(trimmed 
      ? `"${editingTraining.title}" eğitimine video bağlantısı kaydedildi ve kullanıcılara yayınlandı!`
      : `"${editingTraining.title}" eğitiminden video bağlantısı kaldırıldı.`
    );
    setTimeout(() => setQuickAssignSuccess(null), 5000);
  };

  // Confirm delete video
  const handleConfirmDeleteVideo = async () => {
    if (!deletingVideoTraining) return;
    const title = deletingVideoTraining.title;
    
    if (onDeleteVideo) {
      await onDeleteVideo(deletingVideoTraining.id);
    } else if (onQuickUpdateVideo) {
      await onQuickUpdateVideo(deletingVideoTraining.id, '');
    }

    setDeletingVideoTraining(null);
    setQuickAssignSuccess(`"${title}" konusuna ait video yayından kaldırıldı.`);
    setTimeout(() => setQuickAssignSuccess(null), 5000);
  };

  // Handle quick YouTube / video URL assignment on active training
  const handleQuickAssignUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickYoutubeUrl.trim();
    if (!trimmed) return;

    if (onQuickUpdateVideo && activeTraining) {
      await onQuickUpdateVideo(
        activeTraining.id, 
        trimmed, 
        activeTraining.videoTitle || activeTraining.title,
        activeTraining.videoDuration || '05:00'
      );
      setCustomVideoSrc(null);
      setCustomVideoName(null);
      setQuickYoutubeUrl('');
      setQuickAssignSuccess(`"${activeTraining.title}" eğitimine video linki anlık kaydedildi ve tüm kullanıcılara yayınlandı!`);
      setTimeout(() => setQuickAssignSuccess(null), 5000);
    } else if (onOpenAdminNewTraining) {
      onOpenAdminNewTraining(trimmed);
    }
  };

  const hasActiveVideo = Boolean(activeTraining?.videoUrl && activeTraining.videoUrl.trim() && activeTraining.videoType !== 'none');
  const currentSrc = customVideoSrc || (hasActiveVideo ? activeTraining.videoUrl : '');
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
                <span>Yönetici: Video Linki Ekle / Düzenle</span>
              </div>
              {onOpenAdminNewTraining && (
                <button
                  onClick={() => onOpenAdminNewTraining(quickYoutubeUrl.trim() || customVideoSrc || undefined)}
                  className="text-[11px] bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer shadow"
                >
                  <Plus className="w-3 h-3" /> Yeni Konu Aç
                </button>
              )}
            </div>

            {/* Quick Topic Selector for Admin (Allows choosing ANY topic including older ones) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>İşlem Yapılacak Eğitim Konusu:</span>
                <span className="text-[10px] text-sky-400">
                  {hasActiveVideo ? '✓ Videolu Konu' : '⚡ Videosuz Eski Konu'}
                </span>
              </label>
              <select
                value={activeTrainingId}
                onChange={(e) => {
                  setActiveTrainingId(e.target.value);
                  setCustomVideoSrc(null);
                  setCustomVideoName(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {trainings.map(t => {
                  const hasVid = Boolean(t.videoUrl && t.videoUrl.trim() && t.videoType !== 'none');
                  return (
                    <option key={t.id} value={t.id}>
                      {hasVid ? '▶ ' : '○ '} {t.docNo} - {t.title} {hasVid ? '(Videolu)' : '(Videosuz)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <form onSubmit={handleQuickAssignUrl} className="space-y-2">
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
                  Yayınla
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
                Yerel dosyadan geçici önizleme:
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
                ⚠ Cihaz önizlemesi: {customVideoName}
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
                    {!hasActiveVideo && !customVideoSrc && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ⚡ Henüz Video Yok
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {customVideoName ? `Cihazdan: ${customVideoName}` : activeTraining.videoTitle || activeTraining.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Admin Edit & Delete Buttons on Player Header */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleOpenEditVideo(activeTraining)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition shadow cursor-pointer"
                        title="Bu eğitimin videosunu düzenle veya ekle"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{hasActiveVideo ? 'Videoyu Düzenle' : 'Video Ekle'}</span>
                      </button>

                      {hasActiveVideo && (
                        <button
                          onClick={() => setDeletingVideoTraining(activeTraining)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition border border-rose-500/30 cursor-pointer"
                          title="Bu eğitimin videosunu kaldır"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Videoyu Kaldır</span>
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => onOpenTrainingDetail(activeTraining)}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer ml-1"
                  >
                    <span>Metin & Sınav</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Universal Player or Empty State for Topic Without Video */}
              {currentSrc ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                  <UniversalVideoPlayer
                    src={currentSrc}
                    title={activeTraining.videoTitle || activeTraining.title}
                    videoRef={videoRef}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-slate-900/80 border border-dashed border-slate-700 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <Film className="w-12 h-12 text-slate-500 mb-3 opacity-60" />
                  <h4 className="text-base font-bold text-white mb-1">
                    Bu Eğitim Konusuna Henüz Video Eklenmedi
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                    "{activeTraining.title}" ({activeTraining.docNo}) konusu için henüz bir YouTube veya operasyon videosu atanmamış.
                  </p>
                  {isAdmin ? (
                    <button
                      onClick={() => handleOpenEditVideo(activeTraining)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Bu Konuya YouTube Videosu Ekle</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      Yönetici tarafından video yüklendiğinde burada anında izlenebilecektir.
                    </span>
                  )}
                </div>
              )}

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
                  Eğitim Özeti ve Operasyonel Notlar
                </h4>
                <p className="leading-relaxed">
                  {activeTraining.summary}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Süre: {activeTraining.videoDuration || '05:00'}</span>
                  <span>Doküman: {activeTraining.docNo}</span>
                  <span>Birim: {activeTraining.targetUnit}</span>
                  <span>Sorumlu: {activeTraining.authorOrManager}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-12 text-slate-400">
              Henüz eğitim konusu bulunmamaktadır.
            </div>
          )}

        </div>

        {/* Right: Video Playlist */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          
          <div className="space-y-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-sky-500" />
                {playlistMode === 'all_topics' ? 'Tüm Eğitim Konuları' : 'Video Oynatma Listesi'} ({filteredPlaylist.length})
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

            {/* Admin Playlist Toggle: Videos Only vs All Topics (Older Topics Included) */}
            {isAdmin && (
              <div className="flex items-center justify-between gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px]">
                <button
                  onClick={() => setPlaylistMode('videos_only')}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    playlistMode === 'videos_only'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Video className="w-3 h-3 text-sky-500" />
                  <span>Videolu ({videoTrainings.length})</span>
                </button>
                <button
                  onClick={() => setPlaylistMode('all_topics')}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    playlistMode === 'all_topics'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Eski eklenen ve videosuz tüm konuları da gösterir"
                >
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>Tüm Konular ({trainings.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Playlist Cards */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredPlaylist.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
                <Film className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Henüz Video Bulunmamaktadır
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  {isAdmin 
                    ? 'Yönetici olarak yukarıdaki "Tüm Konular" butonuna geçip eski veya yeni tüm konulara YouTube video linki ekleyebilirsiniz.'
                    : 'Yöneticilerimiz tarafından video eğitim yüklendiğinde bu alanda otomatik olarak listelenecektir.'}
                </p>
                {isAdmin && playlistMode === 'videos_only' && (
                  <button
                    type="button"
                    onClick={() => setPlaylistMode('all_topics')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tüm Konuları Listele & Video Ekle</span>
                  </button>
                )}
              </div>
            ) : (
              filteredPlaylist.map((t) => {
              const isActive = activeTraining?.id === t.id && !customVideoSrc;
              const isBI = t.category === 'bilgi-islem';
              const hasVideo = Boolean(t.videoUrl && t.videoUrl.trim() && t.videoType !== 'none');
              const ytThumb = hasVideo ? getYouTubeThumbnailUrl(t.videoUrl) : null;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTrainingId(t.id);
                    setCustomVideoSrc(null);
                    setCustomVideoName(null);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 relative group ${
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
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      hasVideo
                        ? isActive 
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/40'
                    }`}>
                      {hasVideo ? (
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isBI ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isBI ? 'Bilgi İşlem' : 'Depocu'}
                      </span>
                      {hasVideo ? (
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.videoDuration || '05:00'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                          Videosuz
                        </span>
                      )}
                    </div>

                    <h5 className={`text-xs font-bold truncate ${isActive ? 'text-sky-900 dark:text-sky-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {hasVideo ? (t.videoTitle || t.title) : t.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {t.docNo} • {t.title}
                    </p>

                    {/* Admin Quick Action Buttons inside Playlist Card */}
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1.5 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideo(t)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                          title="Videoyu düzenle veya link ata"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>{hasVideo ? 'Düzenle' : '+ Video Ekle'}</span>
                        </button>

                        {hasVideo && (
                          <button
                            type="button"
                            onClick={() => setDeletingVideoTraining(t)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                            title="Videoyu kaldır"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }))}
          </div>

        </div>

      </div>

      {/* EDIT & ADD VIDEO MODAL (ADMIN ONLY) */}
      {editingTraining && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingTraining(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600">
                <Youtube className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {editingTraining.videoUrl ? 'Eğitim Videosunu Düzenle' : 'Eski Konuya Video Ekle'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {editingTraining.title} ({editingTraining.docNo})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveVideoEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  YouTube Video Linki (veya Doğrudan Video Web Adresi):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * YouTube linki, embed iframe kodu veya web video linki yapıştırabilirsiniz. Boş bırakıp kaydederseniz video silinir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Video Başlığı:
                  </label>
                  <input
                    type="text"
                    value={editVideoTitle}
                    onChange={(e) => setEditVideoTitle(e.target.value)}
                    placeholder="Video Başlığı"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tahmini Süre:
                  </label>
                  <input
                    type="text"
                    value={editVideoDuration}
                    onChange={(e) => setEditVideoDuration(e.target.value)}
                    placeholder="Örn: 06:45"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Live Preview if valid URL */}
              {editVideoUrl.trim() && (
                <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black max-h-48">
                  <UniversalVideoPlayer
                    src={editVideoUrl.trim()}
                    title={editVideoTitle || editingTraining.title}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTraining(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Kaydet & Anlık Yayınla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE VIDEO MODAL (ADMIN ONLY) */}
      {deletingVideoTraining && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setDeletingVideoTraining(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Eğitim Videosunu Sil / Kaldır
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                  {deletingVideoTraining.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              "{deletingVideoTraining.title}" ({deletingVideoTraining.docNo}) eğitim konusuna ait video yayından kaldırılacaktır. Eğitim metni ve sınavı korunacaktır. Onaylıyor musunuz?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingVideoTraining(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVideo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Evet, Videoyu Kaldır</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
