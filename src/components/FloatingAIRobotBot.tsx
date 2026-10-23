import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrainingDocument,
  TrainingAnnouncement,
  SupportMessage
} from '../types';
import { officialEsmeBranches } from '../mockData';
import {
  getStoredSupportMessages,
  saveSupportMessages,
  subscribeToSupportMessages
} from '../services/trainingStorage';
import {
  Send,
  X,
  UserCheck,
  MessageSquare,
  Trash2,
  Reply,
  ShieldCheck,
  ChevronDown,
  Edit3
} from 'lucide-react';

interface FloatingAIRobotBotProps {
  trainings: TrainingDocument[];
  announcements: TrainingAnnouncement[];
  currentBranchId: number;
  currentPersonnel: string;
  isAdmin: boolean;
  onSelectTraining?: (
    training: TrainingDocument,
    initialTab?: 'content' | 'video' | 'pdf' | 'templates' | 'quiz' | 'presentation'
  ) => void;
}

type TargetManagerType =
  | 'Ömer BAŞ - Genel Yönetim'
  | 'Turgut CESUR - Bilgi İşlem Müdürlüğü'
  | 'Tuğba EKREM - Bilgi İşlem ve Kasa Sorumlusu'
  | 'Esme AVM Genel Yönetim Kordinatörlüğü';

export const FloatingAIRobotBot: React.FC<FloatingAIRobotBotProps> = ({
  trainings,
  announcements,
  currentBranchId,
  currentPersonnel,
  isAdmin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBotTab, setActiveBotTab] = useState<'user_chat' | 'admin_inbox'>('user_chat');
  const [targetManager, setTargetManager] = useState<TargetManagerType>('Ömer BAŞ - Genel Yönetim');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>(() => getStoredSupportMessages());
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [adminResponderName, setAdminResponderName] = useState<string>('Ömer BAŞ - Genel Yönetim');
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const currentBranch =
    officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

  // Real-time Firestore subscription for user-to-admin messages
  useEffect(() => {
    const unsub = subscribeToSupportMessages(updated => {
      setMessages(updated);
    });
    return () => unsub();
  }, []);

  // Automatically switch to Admin Inbox tab when admin logs in
  useEffect(() => {
    if (isAdmin) {
      setActiveBotTab('admin_inbox');
    } else {
      setActiveBotTab('user_chat');
    }
  }, [isAdmin]);

  // Scroll to bottom when chat opens or new message arrives
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [isOpen, messages.length, activeBotTab]);

  // Smart AI Assistant generator grounded on Esme AVM trainings & announcements
  const generateSmartAIReply = (
    userQuery: string,
    selectedManager: TargetManagerType
  ): string => {
    const q = userQuery.toLowerCase();

    const matchedTraining = trainings.find(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.chapters.some(
          ch =>
            ch.title.toLowerCase().includes(q) ||
            ch.content.toLowerCase().includes(q)
        )
    );

    if (q.includes('kasa') || q.includes('eft') || q.includes('iban') || q.includes('dekont') || q.includes('pos')) {
      return `🤖 Esme AVM: Mesajınız doğrudan "${selectedManager}" birimine iletildi. Kasa kapanışı, POS gün sonu ve EFT/Havale işlemlerinde dekont doğrulaması yapılmadan ürün teslimatı kesinlikle yapılmamalıdır. İlgili yönerge: Bilgi İşlem ve Kasa Yönetimi Genel Eğitim Talimatı (ESME-Bİ-001). Yöneticimiz en kısa sürede bu pencereden size yanıt verecektir.`;
    }

    if (q.includes('şase') || q.includes('sase') || q.includes('barkod') || q.includes('depo') || q.includes('sevkiyat') || q.includes('sayım')) {
      return `🤖 Esme AVM: Talebiniz "${selectedManager}" birimine canlı olarak iletildi. Depo kabul, şase numarası eşleştirme ve barkod etiketleme işlemlerinde fiziki ürün ile sistem kaydının birebir uyuşması zorunludur. Yöneticimiz mesajınızı inceleyip buradan yanıtlayacaktır.`;
    }

    if (q.includes('sınav') || q.includes('sertifika') || q.includes('tebellüğ') || q.includes('imza')) {
      return `🤖 Esme AVM: Mesajınız "${selectedManager}" ekranına düştü. Eğitim modülünün içindeki "Sınav & Tebellüğ" sekmesinden 5 soruluk testi tamamlayıp dijital onay kutucuğunu işaretleyerek sertifikanızı anında oluşturabilirsiniz.`;
    }

    if (matchedTraining) {
      return `🤖 Esme AVM: Mesajınız "${selectedManager}" yöneticimize başarıyla iletildi. Sorunuzla ilgili "${matchedTraining.title}" (${matchedTraining.docNo}) modülünü inceleyebilirsiniz. Yöneticimiz yanıt yazdığında burada anlık olarak görüntülenecektir.`;
    }

    const activeAnn = announcements.find(a => a.isActive);
    if (q.includes('duyuru') && activeAnn) {
      return `🤖 Esme AVM: Mesajınız "${selectedManager}" yöneticimize iletildi. Güncel aktif duyuru: "${activeAnn.title} — ${activeAnn.content}".`;
    }

    return `🤖 Esme AVM: Merhaba ${currentPersonnel} (${currentBranch.name}), mesajınız "${selectedManager}" ekranına anlık olarak iletildi. Yöneticimiz yanıt verdiğinde bu sohbet ekranında bildirim alacaksınız.`;
  };

  const handleSendUserMessage = async (customText?: string) => {
    const text = (customText ?? inputText).trim();
    if (!text) return;

    const now = new Date().toISOString();
    const aiReply = generateSmartAIReply(text, targetManager);

    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      branchId: currentBranchId,
      branchName: currentBranch.name,
      personnelName: currentPersonnel || 'Şube Personeli',
      targetManager,
      userMessage: text,
      aiAutoReply: aiReply,
      status: 'pending',
      createdAt: now
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');
    await saveSupportMessages(updated);
  };

  const handleSendAdminReply = async (msgId: string) => {
    const replyText = (replyDrafts[msgId] || '').trim();
    if (!replyText) return;

    const now = new Date().toISOString();
    const updated = messages.map(m =>
      m.id === msgId
        ? {
            ...m,
            adminReply: replyText,
            adminResponder: adminResponderName,
            repliedAt: now,
            status: 'replied' as const
          }
        : m
    );

    setMessages(updated);
    setReplyDrafts(prev => ({ ...prev, [msgId]: '' }));
    await saveSupportMessages(updated);
  };

  const handleDeleteMessage = async (msgId: string) => {
    const updated = messages.filter(m => m.id !== msgId);
    setMessages(updated);
    await saveSupportMessages(updated);
  };

  const handleClearAllConversations = async () => {
    setMessages([]);
    setConfirmClearAll(false);
    await saveSupportMessages([]);
  };

  // Messages relevant to the current branch/user
  const branchMessages = useMemo(() => {
    return messages.filter(m => Number(m.branchId) === Number(currentBranchId));
  }, [messages, currentBranchId]);

  const pendingTotalCount = useMemo(
    () => messages.filter(m => m.status === 'pending').length,
    [messages]
  );

  const repliedForBranchCount = useMemo(
    () => branchMessages.filter(m => m.status === 'replied').length,
    [branchMessages]
  );

  const quickPrompts = [
    'Yönetime acil operasyonel durum bildirmek istiyorum',
    'Kasa kapanış / EFT dekont onayı hakkında destek',
    'Depo şase no ve barkod eşleştirme sorusu',
    'Tebellüğ sınavı ve sertifika onayı hakkında'
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* OPEN CHAT WINDOW */}
      {isOpen && (
        <div className="mb-3 w-[345px] sm:w-[395px] max-h-[550px] bg-white dark:bg-slate-900 border-2 border-red-600/80 dark:border-red-500/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white flex items-center justify-between gap-2 border-b border-red-500/30">
            <div className="flex items-center gap-2.5">
              {/* Mini Robot Avatar in Header */}
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-400/40 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 64 64" className="w-7 h-7">
                  <line x1="32" y1="6" x2="32" y2="14" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="32" cy="5" r="3.5" fill="#22d3ee" />
                  <rect x="14" y="14" width="36" height="28" rx="9" fill="#1e293b" stroke="#f87171" strokeWidth="2.5" />
                  <circle cx="25" cy="27" r="4" fill="#22d3ee" />
                  <circle cx="39" cy="27" r="4" fill="#22d3ee" />
                  <rect x="24" y="35" width="16" height="3" rx="1.5" fill="#38bdf8" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-wide text-white">
                    Esme AVM
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[10px] text-slate-300">
                  Yönetime Ulaş • Canlı İletişim Hattı
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Admin Clear All Conversations Button in Header */}
              {isAdmin && messages.length > 0 && (
                confirmClearAll ? (
                  <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500 px-2 py-1 rounded-lg">
                    <button
                      type="button"
                      onClick={handleClearAllConversations}
                      className="text-[10px] font-extrabold text-white bg-rose-600 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Tümünü Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="text-[10px] font-bold text-slate-300 px-1 cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer"
                    title="Tüm Robot Konuşmalarını Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Tümünü Sil</span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Pencereyi Küçült"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher if Admin is Logged In */}
          {isAdmin && (
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 border-b border-slate-200 dark:border-slate-700 text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setActiveBotTab('admin_inbox')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  activeBotTab === 'admin_inbox'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gelen Konuşmalar ({messages.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveBotTab('user_chat')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  activeBotTab === 'user_chat'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kullanıcı Görünümü</span>
              </button>
            </div>
          )}

          {/* TAB 1: USER CHAT & DIRECT REACH TO MANAGERS */}
          {activeBotTab === 'user_chat' && (
            <>
              {/* Target Manager Selector */}
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                  Ulaşmak İstediğiniz Yönetici / Birim:
                </label>
                <select
                  value={targetManager}
                  onChange={e => setTargetManager(e.target.value as TargetManagerType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Ömer BAŞ - Genel Yönetim">
                    Ömer BAŞ - Genel Yönetim
                  </option>
                  <option value="Turgut CESUR - Bilgi İşlem Müdürlüğü">
                    Turgut CESUR - Bilgi İşlem Müdürlüğü
                  </option>
                  <option value="Tuğba EKREM - Bilgi İşlem ve Kasa Sorumlusu">
                    Tuğba EKREM - Bilgi İşlem ve Kasa Sorumlusu
                  </option>
                  <option value="Esme AVM Genel Yönetim Kordinatörlüğü">
                    Esme AVM Genel Yönetim Kordinatörlüğü
                  </option>
                </select>
              </div>

              {/* Conversation Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 max-h-[280px] bg-slate-50/50 dark:bg-slate-950/60">
                {/* Initial Greeting from Esme AVM Robot */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow">
                    🤖
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-800 dark:text-slate-100 shadow-xs">
                    <p className="font-extrabold text-red-600 dark:text-red-400 mb-1">
                      Esme AVM — Merhaba {currentPersonnel}! ({currentBranch.name})
                    </p>
                    <p className="leading-relaxed">
                      Ben <strong>Esme AVM</strong> asistan robotuyum. Yukarıdan ulaşmak istediğiniz yönetici veya birimi seçerek doğrudan mesaj gönderebilirsiniz:
                      <br />• <strong>Ömer BAŞ</strong> - Genel Yönetim
                      <br />• <strong>Turgut CESUR</strong> - Bilgi İşlem Müdürlüğü
                      <br />• <strong>Tuğba EKREM</strong> - Bilgi İşlem ve Kasa Sorumlusu
                      <br />• <strong>Esme AVM Genel Yönetim Kordinatörlüğü</strong>
                    </p>
                  </div>
                </div>

                {/* Quick Prompt Buttons when no messages yet */}
                {branchMessages.length === 0 && (
                  <div className="pl-9 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Hızlı Mesaj Seçenekleri:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendUserMessage(prompt)}
                          className="text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-red-900 dark:text-slate-200 border border-red-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Thread for Active Branch */}
                {branchMessages.map(msg => (
                  <div key={msg.id} className="space-y-2 relative group">
                    {/* User's Sent Message */}
                    <div className="flex flex-col items-end">
                      <div className="max-w-[85%] bg-red-600 text-white rounded-2xl rounded-tr-xs px-3 py-2 text-xs shadow-xs relative">
                        <div className="flex items-center justify-between gap-2 text-[10px] text-red-100 font-bold mb-0.5">
                          <span>Alıcı: {msg.targetManager}</span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-0.5 rounded bg-black/25 hover:bg-black/40 text-white cursor-pointer"
                              title="Bu Konuşmayı Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="font-medium leading-relaxed">{msg.userMessage}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 px-1">
                        {msg.personnelName} •{' '}
                        {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Esme AVM Robot Instant Response */}
                    {msg.aiAutoReply && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0 text-[11px]">
                          🤖
                        </div>
                        <div className="max-w-[85%] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-2.5 text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed shadow-xs">
                          {msg.aiAutoReply}
                        </div>
                      </div>
                    )}

                    {/* Official Manager Reply if Present */}
                    {msg.adminReply && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                          👨‍💼
                        </div>
                        <div className="max-w-[85%] bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-700 rounded-2xl rounded-tl-xs p-2.5 text-xs text-emerald-950 dark:text-emerald-100 shadow-sm">
                          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>YÖNETİCİ YANITI ({msg.adminResponder || msg.targetManager})</span>
                          </div>
                          <p className="font-semibold leading-relaxed">{msg.adminReply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendUserMessage();
                }}
                className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Yönetime mesajınızı veya sorunuzu yazın..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white shadow transition cursor-pointer shrink-0"
                  title="Yönetime Gönder"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* TAB 2: ADMIN INBOX (For Logged-In Managers to View, Edit, Reply & Delete Conversations) */}
          {activeBotTab === 'admin_inbox' && isAdmin && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 max-h-[370px] bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                  Yanıtlayan Yönetici:
                </span>
                <select
                  value={adminResponderName}
                  onChange={e => setAdminResponderName(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Ömer BAŞ - Genel Yönetim">Ömer BAŞ - Genel Yönetim</option>
                  <option value="Turgut CESUR - Bilgi İşlem Müdürlüğü">Turgut CESUR - Bilgi İşlem Müdürlüğü</option>
                  <option value="Tuğba EKREM - Bilgi İşlem ve Kasa Sorumlusu">Tuğba EKREM - Bilgi İşlem ve Kasa Sorumlusu</option>
                  <option value="Esme AVM Genel Yönetim Kordinatörlüğü">Esme AVM Genel Yönetim Kordinatörlüğü</option>
                </select>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  Henüz personellerden gelen bir konuşma bulunmuyor.
                </div>
              ) : (
                messages
                  .slice()
                  .reverse()
                  .map(msg => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            {msg.branchName} • {msg.personnelName}
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Birim: <strong>{msg.targetManager}</strong> •{' '}
                            {new Date(msg.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                          title="Konuşmayı Sil"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Sil</span>
                        </button>
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                        "{msg.userMessage}"
                      </p>

                      {msg.adminReply ? (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-2">
                          <div>
                            <strong>Yanıtınız ({msg.adminResponder}):</strong> {msg.adminReply}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyDrafts(prev => ({
                                ...prev,
                                [msg.id]: msg.adminReply || ''
                              }))
                            }
                            className="p-1 text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 cursor-pointer shrink-0"
                            title="Yanıtı Düzenle"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={replyDrafts[msg.id] || ''}
                          onChange={e =>
                            setReplyDrafts(prev => ({ ...prev, [msg.id]: e.target.value }))
                          }
                          placeholder={msg.adminReply ? 'Yanıtı güncelleyin...' : 'Personele yanıt yazın...'}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendAdminReply(msg.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Reply className="w-3 h-3" />
                          <span>{msg.adminReply ? 'Güncelle' : 'Yanıtla'}</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* COMPACT MOVING ESME AVM ROBOT BUTTON IN BOTTOM-RIGHT */}
      <div className="flex items-center gap-2">
        {/* Compact Callout Pill: Only "Yönetime Ulaş" */}
        {!isOpen && showWelcomeBubble && (
          <div className="flex items-center gap-1.5 bg-slate-900 text-white border border-red-500/50 rounded-full pl-3 pr-2 py-1.5 shadow-xl text-[11px] font-extrabold animate-in fade-in slide-in-from-right-3 duration-300">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Yönetime Ulaş</span>
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setShowWelcomeBubble(false);
              }}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              title="Gizle"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Small Moving 3D-Styled Esme AVM Robot Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 border-2 border-red-500/80 hover:border-cyan-400 shadow-xl shadow-red-950/50 flex items-center justify-center cursor-pointer transition-all animate-robot-patrol"
          title="Esme AVM — Yönetime Ulaş"
        >
          {/* Notification Badge */}
          {(isAdmin ? pendingTotalCount > 0 : repliedForBranchCount > 0) && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md z-10">
              {isAdmin ? pendingTotalCount : repliedForBranchCount}
            </span>
          )}

          {/* Animated Small Esme AVM Robot SVG */}
          <svg
            viewBox="0 0 64 64"
            className="w-11 h-11 drop-shadow-[0_2px_6px_rgba(34,211,238,0.35)]"
          >
            {/* Antenna */}
            <line
              x1="32"
              y1="4"
              x2="32"
              y2="12"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="4" r="3.2" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            <circle cx="32" cy="4" r="3.2" fill="#22d3ee" />

            {/* Left Waving Arm */}
            <g className="animate-robot-arm">
              <rect x="5" y="28" width="6" height="15" rx="3" fill="#ef4444" stroke="#f8fafc" strokeWidth="1.2" />
            </g>

            {/* Right Arm */}
            <rect x="53" y="28" width="6" height="15" rx="3" fill="#ef4444" stroke="#f8fafc" strokeWidth="1.2" />

            {/* Robot Head */}
            <rect
              x="14"
              y="12"
              width="36"
              height="24"
              rx="8"
              fill="#f8fafc"
              stroke="#dc2626"
              strokeWidth="2.2"
            />

            {/* Face Visor Screen */}
            <rect x="18" y="16" width="28" height="16" rx="5" fill="#0f172a" />

            {/* Glowing Blinking Eyes */}
            <g className="animate-robot-eyes">
              <circle cx="25.5" cy="23" r="3.2" fill="#22d3ee" />
              <circle cx="38.5" cy="23" r="3.2" fill="#22d3ee" />
              <circle cx="26.5" cy="22" r="1" fill="#ffffff" />
              <circle cx="39.5" cy="22" r="1" fill="#ffffff" />
            </g>

            {/* Happy LED Smile */}
            <path
              d="M 26 28 Q 32 31.5 38 28"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Robot Torso / Body */}
            <rect
              x="16"
              y="38"
              width="32"
              height="18"
              rx="6"
              fill="#f1f5f9"
              stroke="#dc2626"
              strokeWidth="2"
            />

            {/* Esme AVM Chest Badge */}
            <rect x="19" y="42" width="26" height="10" rx="3" fill="#dc2626" />
            <text
              x="32"
              y="49"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="6.5"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              ESME
            </text>

            {/* Hover Jet Glow under Robot */}
            <ellipse cx="32" cy="59" rx="10" ry="2.2" fill="#22d3ee" opacity="0.7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
