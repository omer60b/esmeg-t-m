import React, { useState } from 'react';
import { 
  TrainingDocument, 
  TrainingCompletion,
  TrainingQuizQuestion,
  TrainingCategory
} from '../types';
import { officialEsmeBranches } from '../mockData';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Building2, 
  ShieldCheck, 
  FileCheck2, 
  Printer, 
  ChevronRight,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  X,
  Check,
  Calendar,
  UserCheck,
  Layers,
  Boxes
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TebellugTrackingViewProps {
  trainings: TrainingDocument[];
  completions: TrainingCompletion[];
  currentBranchId: number;
  currentPersonnel: string;
  onOpenTrainingDetail: (training: TrainingDocument, initialTab?: 'content' | 'video' | 'pdf' | 'templates' | 'quiz' | 'presentation') => void;
  onRecordCompletion?: (completion: TrainingCompletion) => void;
}

// Comprehensive corporate question bank for the randomized 5-question exam
const comprehensiveQuestionPool: { category: TrainingCategory; item: TrainingQuizQuestion }[] = [
  // BİLGİ İŞLEM SORULARI
  {
    category: 'bilgi-islem',
    item: {
      id: 'pool_bi_1',
      question: 'Kasa sayımında fiili nakit ile ERP sistem tutarı arasında fark çıkması durumunda ilk yapılması gereken işlem nedir?',
      options: [
        'Farkı cebinden tamamlamak veya fazlayı kasadan almak',
        'Kasa mutabakat ve fark tutanağı düzenleyerek durumu şube müdürüne ve B.İ. yönetimine bildirmek',
        'Günü kapatmadan sistemi kapatıp çıkmak',
        'Farkı sonraki günün kayıtlarına aktarmak'
      ],
      correctOptionIndex: 1,
      explanation: 'Kasa fazlası veya eksiği durumunda hiçbir şekilde müdahale edilmez; resmi tutanak tanzim edilerek Bilgi İşlem ve Finans yönetimine iletilir.'
    }
  },
  {
    category: 'bilgi-islem',
    item: {
      id: 'pool_bi_2',
      question: 'Kasa çekmecesindeki nakit meblağ gün içinde hangi limiti aştığında derhal mağaza çelik kasasına aktarılmalıdır?',
      options: ['5.000 TL', '10.000 TL', '15.000 TL', '25.000 TL'],
      correctOptionIndex: 2,
      explanation: 'Madde 12 gereği kasa çekmecesinde 15.000 TL üzeri nakit tutulamaz; risk oluşmaması adına fazla para derhal mağaza çelik kasasına aktarılır.'
    }
  },
  {
    category: 'bilgi-islem',
    item: {
      id: 'pool_bi_3',
      question: 'Kredi kartı slip çekiminde "Onaylandı" mesajı alınmadan yapılan satış işlemleri için kural nedir?',
      options: [
        'Pos slibi çıkmasa da müşteri beyanına göre işlem tamamlanır',
        'Sadece banka POS cihazından onay slibi çıktığında işlem tamamlanmış sayılır, aksi halde iptal/iade riski doğar',
        'Tutar müşteriye elden nakit iade edilir',
        'Slip alınmasına gerek yoktur'
      ],
      correctOptionIndex: 1,
      explanation: 'POS cihazından onaylı işlem slibi alınmadan ve müşteri nüshası teslim edilmeden mal satışı gerçekleştirilemez.'
    }
  },
  {
    category: 'bilgi-islem',
    item: {
      id: 'pool_bi_4',
      question: 'Esme Şirketler Grubu bünyesinde şirket içi gizli müşteri verileri ve şifrelerin WhatsApp veya üçüncü şahıslarla paylaşımı için kural nedir?',
      options: [
        'İş kolaylığı için herkesle serbestçe paylaşılabilir',
        'KVKK ve Bilgi Güvenliği Talimatı uyarınca KESİNLİKLE YASAKTIR ve hukuki/cezai yaptırım doğurur',
        'Yalnızca grup yöneticilerine serbesttir',
        'Ekran görüntüsü alınarak paylaşılabilir'
      ],
      correctOptionIndex: 1,
      explanation: 'Müşteri kişisel verileri (KVKK) ve sistem şifrelerinin üçüncü taraflarla paylaşılması sıfır toleranslı kural ihlalidir.'
    }
  },
  {
    category: 'bilgi-islem',
    item: {
      id: 'pool_bi_5',
      question: 'Hatalı taksit veya yanlış müşteri kartına çekim yapıldığında ödeme düzeltme prosedürü nasıldır?',
      options: [
        'Aynı gün gün sonu (Z raporu) alınmadan önce POS cihazından işlem iptali yapılır ve sistemde düzeltme fişi kesilir',
        'Bir hafta sonra muhasebeye bildirilir',
        'Müşteriden nakit alınıp karta iade yapılmaz',
        'Kasa kapatılır ve işlem silinir'
      ],
      correctOptionIndex: 0,
      explanation: 'Hatalı POS işlemlerinde gün sonu alınmadan önce iptal yapılmalıdır; gün sonu sonrası banka yazışması ve ters ibraz prosedürü gerekir.'
    }
  },

  // DEPOCU EĞİTİM VE GÖREV TANIMI SORULARI (PDF'DEN BİREBİR)
  {
    category: 'depocu',
    item: {
      id: 'pool_dp_1',
      question: 'Nebim V3 ERP menüsünde stok ekstresi kontrol edilirken hangi seçenek seçilmelidir?',
      options: [
        'Ürün Ekstresi (Miktarlı)',
        'Genel Fatura Listesi',
        'Kasa Raporu',
        'Cari Bakiye Listesi'
      ],
      correctOptionIndex: 0,
      explanation: 'Depocu Eğitim Kitapçığı Bölüm 05 uyarınca arama kutusuna "ürün ek" yazılarak çıkan sonuçlardan MUTLAKA "Ürün Ekstresi (Miktarlı)" seçilmelidir.'
    }
  },
  {
    category: 'depocu',
    item: {
      id: 'pool_dp_2',
      question: 'DSIC el terminali ile sevkiyat aracına ürün atama işleminde ilk okutulması gereken evrak barkodu hangisidir?',
      options: [
        'ESME - Online Sevkiyat Listesi üst kısmındaki Sözleşme Barkodu (örn: 1-RI-7-2187238)',
        'Müşterinin kimlik kartı barkodu',
        'Kargo takip barkodu',
        'Mağaza kapı barkodu'
      ],
      correctOptionIndex: 0,
      explanation: 'Bölüm 04 Adım 1 uyarınca sevkiyatçının getirdiği ESME - Online Sevkiyat Listesi evrakının üst kısmındaki sözleşme barkodu terminalle okutulur.'
    }
  },
  {
    category: 'depocu',
    item: {
      id: 'pool_dp_3',
      question: 'Mağazadan müşteriye teslim edilen cep telefonları için iade ve kontrol kuralı nedir?',
      options: [
        '14 gün içinde kutusu açılsa da koşulsuz iade alınır.',
        'Teslim edilen cep telefonunun İADE SÜRECİNİN OLMADIĞI müşteriye açıkça bildirilir, jelatin müşteri huzurunda açılıp IMEI terminale okutulur.',
        'IMEI numarası yazılmadan teslim edilebilir.',
        'Müşteri kontrol etmeden imzasız teslim alır.'
      ],
      correctOptionIndex: 1,
      explanation: 'Bölüm 07 uyarınca cep telefonunun iade sürecinin olmadığı teslimatta müşteriye açıkça bildirilir; jelatin müşteri huzurunda açılır ve IMEI okutulur.'
    }
  },
  {
    category: 'depocu',
    item: {
      id: 'pool_dp_4',
      question: 'Ürün kabul sürecinde hasarlı veya arızalı ürün tespit edildiğinde depocunun izleyeceği zorunlu protokol nedir?',
      options: [
        'Sağlam ürünlerin arasına yerleştirip reyon satışına sunmak',
        'Kesinlikle sağlam reyon stoğuna sokmamak, derhal tutanak tutarak Arızalı/Hasarlı alanına ayırmak ve üst birime bildirmek',
        'Kutusunu koli bandıyla bantlayıp müşteriye sevk etmek',
        'Hiçbir şey yapmadan depoda bekletmek'
      ],
      correctOptionIndex: 1,
      explanation: 'Bölüm 02 Kritik Kural uyarınca arızalı ürünler KESİNLİKLE sağlam satış reyonu stoğuna alınamaz; tutanakla ayrılır ve üst birime bildirilir.'
    }
  },
  {
    category: 'depocu',
    item: {
      id: 'pool_dp_5',
      question: 'ERP üzerinden diğer mağazalara ürün transferi yapıldıktan sonra tamamlanması gereken son zorunlu adım nedir?',
      options: [
        'Telefonla mağazaya sözlü söyleyip kapatmak',
        'Yazıcı işaretine tıklanarak çıktı alınması ve Teslim Eden ile Teslim Alan personelin ıslak imzalarının tamamlanması',
        'Hiçbir çıktı almadan işlemi sonlandırmak',
        'Ürünü kargoya evraksız teslim etmek'
      ],
      correctOptionIndex: 1,
      explanation: 'Bölüm 06 uyarınca transfer kaydedildikten sonra yazıcı çıktısı alınarak Teslim Eden & Teslim Alan personelin ıslak imzaları zorunludur.'
    }
  }
];

export const TebellugTrackingView: React.FC<TebellugTrackingViewProps> = ({
  trainings,
  completions,
  currentBranchId,
  currentPersonnel,
  onOpenTrainingDetail,
  onRecordCompletion
}) => {
  const currentBranch = officialEsmeBranches.find(b => b.id === currentBranchId) || officialEsmeBranches[0];

  // Category Filter for Independent Data Tracking
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bilgi-islem' | 'depocu'>('all');

  // Filter trainings by category
  const filteredTrainings = trainings.filter(t => selectedCategory === 'all' || t.category === selectedCategory);
  
  // Completions for this branch, filtered by category
  const branchCompletions = completions.filter(c => c.branchId === currentBranchId);
  const filteredBranchCompletions = branchCompletions.filter(c => {
    if (selectedCategory === 'all') return true;
    const matchTraining = trainings.find(t => t.id === c.trainingId);
    return matchTraining ? matchTraining.category === selectedCategory : c.category === selectedCategory;
  });

  const completionRate = Math.round((filteredBranchCompletions.length / Math.max(1, filteredTrainings.length)) * 100);

  // Standalone 5-Question Exam State
  const [showExamModal, setShowExamModal] = useState(false);
  const [examQuestions, setExamQuestions] = useState<TrainingQuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [generatedCertificate, setGeneratedCertificate] = useState<TrainingCompletion | null>(null);
  const [examErrorMsg, setExamErrorMsg] = useState<string | null>(null);

  // Start the 5-Question Exam based on active category
  const handleStartExam = () => {
    // Collect questions according to selectedCategory to keep them independent
    let targetPool: TrainingQuizQuestion[] = [];

    if (selectedCategory === 'depocu') {
      const depocuStatic = comprehensiveQuestionPool.filter(q => q.category === 'depocu').map(q => q.item);
      const depocuTrainings = trainings.filter(t => t.category === 'depocu').flatMap(t => t.quiz || []);
      targetPool = [...depocuStatic, ...depocuTrainings];
    } else if (selectedCategory === 'bilgi-islem') {
      const biStatic = comprehensiveQuestionPool.filter(q => q.category === 'bilgi-islem').map(q => q.item);
      const biTrainings = trainings.filter(t => t.category === 'bilgi-islem').flatMap(t => t.quiz || []);
      targetPool = [...biStatic, ...biTrainings];
    } else {
      targetPool = [
        ...comprehensiveQuestionPool.map(q => q.item),
        ...trainings.flatMap(t => t.quiz || [])
      ];
    }

    // Remove duplicates by question text
    const uniqueQuestions: TrainingQuizQuestion[] = [];
    const seen = new Set<string>();
    for (const q of targetPool) {
      const normalized = q.question.trim().toLowerCase();
      if (!seen.has(normalized) && q.options && q.options.length >= 3) {
        seen.add(normalized);
        uniqueQuestions.push(q);
      }
    }

    // Shuffle and pick 5
    const shuffled = [...uniqueQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    setExamQuestions(selected);
    setUserAnswers({});
    setExamSubmitted(false);
    setExamScore(0);
    setGeneratedCertificate(null);
    setExamErrorMsg(null);
    setShowExamModal(true);
  };

  // Submit Exam
  const handleSubmitExam = () => {
    if (Object.keys(userAnswers).length < examQuestions.length) {
      setExamErrorMsg(`Lütfen sınavı tamamlamadan önce tüm ${examQuestions.length} soruyu da cevaplayınız!`);
      return;
    }
    setExamErrorMsg(null);

    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    setExamScore(correctCount);
    setExamSubmitted(true);

    const isPassed = correctCount >= 4; // 80% passing threshold as confirmed

    if (isPassed) {
      const certId = `ESME-CERT-${Date.now().toString().slice(-6)}`;
      const examTitle = selectedCategory === 'depocu' 
        ? 'Esme Resmi Depocu Eğitim ve Görev Tanımı Yeterlilik Sınavı'
        : selectedCategory === 'bilgi-islem'
        ? 'Esme Resmi Bilgi İşlem ve Operasyon Yeterlilik Sınavı'
        : 'Esme Resmi Genel Tebellüğ ve Operasyonel Yeterlilik Sınavı';

      const completionRecord: TrainingCompletion = {
        id: `exam_comp_${Date.now()}`,
        trainingId: selectedCategory === 'depocu' ? 'depocu-tebellug-sinavi' : 'genel-tebellug-sinavi',
        trainingTitle: examTitle,
        category: selectedCategory === 'depocu' ? 'depocu' : 'bilgi-islem',
        branchId: currentBranchId,
        branchName: currentBranch.name,
        personnelName: currentPersonnel,
        personnelRole: selectedCategory === 'depocu' ? 'Mağaza İçi Depocu' : 'Mağaza / B.İ. Görevlisi',
        completedAt: new Date().toISOString(),
        quizScore: correctCount,
        quizTotal: examQuestions.length,
        quizPassed: true,
        signedAgreement: true,
        certificateId: certId
      };

      setGeneratedCertificate(completionRecord);
      if (onRecordCompletion) {
        onRecordCompletion(completionRecord);
      }
    }
  };

  // Generate and download formal Certificate PDF with jsPDF
  const handleDownloadCertificate = (completion: TrainingCompletion) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Decorative Borders
    doc.setDrawColor(185, 28, 28); // Esme Red
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    doc.setDrawColor(217, 119, 6); // Amber Gold
    doc.setLineWidth(1);
    doc.rect(13, 13, 271, 184);

    // Header Corporate Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(185, 28, 28);
    doc.text("ESME SIRKETLER GRUBU", 148.5, 30, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text(
      completion.category === 'depocu'
        ? "MAGAZA ICI DEPO YONETIMI VE SEVKIYAT AKADEMISI"
        : "KURUMSAL OPERASYON VE BILGI ISLEM AKADEMISI",
      148.5, 38, { align: "center" }
    );

    // Certificate Ribbon
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text(
      completion.category === 'depocu'
        ? "RESMI DEPOCU EGITIM BASARI VE TEBELLUG SERTIFIKASI"
        : "RESMI EGITIM BASARI VE TEBELLUG SERTIFIKASI",
      148.5, 54, { align: "center" }
    );

    // Personnel Info Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);

    const bodyText = `Isbu resmi belge ile asagida kimligi ve gorev yeri belirtilen personelimizin; Esme Sirketler Grubu bunyesinde yayimlanan resmi talimatname ve operasyon yonergelerini eksiksiz okudugu, rastgele 5 sorudan olusan Resmi Yeterlilik Sinavinda %80 ve uzeri basari gosterdigi ve kurallara harfiyen uyacagini dijital olarak tebellug ettigi resmiyet kazanmistir.`;
    
    doc.text(doc.splitTextToSize(bodyText, 240), 148.5, 68, { align: "center" });

    // Information Box Table
    autoTable(doc, {
      startY: 84,
      margin: { left: 35, right: 35 },
      theme: 'grid',
      styles: { fontSize: 9.5, cellPadding: 3, font: 'helvetica' },
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Parametre', 'Resmi Tebellug Detayi']],
      body: [
        ['Tebellug Eden Personel', completion.personnelName],
        ['Magaza / Sube', `${completion.branchName} (Sube ID: ${completion.branchId})`],
        ['Egitim Modulu / Sinav', completion.trainingTitle],
        ['Kategori / Alan', completion.category === 'depocu' ? 'Depocu ve Sevkiyat Egitimi' : 'Bilgi Islem ve Operasyon Egitimi'],
        ['Sinav Basarisi (Baraj: En az 4/5)', `${completion.quizScore ?? 5} / ${completion.quizTotal ?? 5} (%${Math.round(((completion.quizScore ?? 5) / (completion.quizTotal ?? 5)) * 100)} - BASARILI)`],
        ['Tebellug Tarih ve Saati', new Date(completion.completedAt).toLocaleString('tr-TR')],
        ['Sertifika Dogrulama Kodu', completion.certificateId]
      ]
    });

    // Signature Area
    const finalY = 158;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);

    doc.text("Tebellug Eden Personel", 55, finalY);
    doc.text("Dijital Onay ve Islak Imza Kasesi", 55, finalY + 5);
    doc.setFont("helvetica", "italic");
    doc.text(completion.personnelName, 55, finalY + 12);

    doc.setFont("helvetica", "bold");
    doc.text("Genel Yonetim / Onay", 225, finalY);
    doc.text("Genel Mudurluk & B.I. Koordinatorlugu", 225, finalY + 5);
    doc.setFont("helvetica", "italic");
    doc.text("Omer BAS (Genel Yonetici) & Turgut CESUR", 225, finalY + 12);

    // Save
    doc.save(`Esme_Basari_Sertifikasi_${completion.certificateId}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Category Independence Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 pl-2">Takip Alanı:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tüm Eğitimler ({trainings.length})
          </button>
          <button
            onClick={() => setSelectedCategory('bilgi-islem')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'bilgi-islem'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Bilgi İşlem Alanı ({trainings.filter(t => t.category === 'bilgi-islem').length})
          </button>
          <button
            onClick={() => setSelectedCategory('depocu')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'depocu'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Depocu Alanı ({trainings.filter(t => t.category === 'depocu').length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 pr-2 hidden sm:inline">
          {selectedCategory === 'depocu' 
            ? 'Depocu eğitimi ve sunumu bağımsız olarak listelenmektedir' 
            : selectedCategory === 'bilgi-islem'
            ? 'Bilgi işlem yönergeleri bağımsız olarak listelenmektedir'
            : 'Tüm alanlar birlikte listelenmektedir'}
        </span>
      </div>

      {/* Tebellüğ Header Banner */}
      <div className={`text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border transition-all ${
        selectedCategory === 'depocu'
          ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-emerald-800/50'
          : selectedCategory === 'bilgi-islem'
          ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-800/50'
          : 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-emerald-900/40'
      }`}>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> 
            {selectedCategory === 'depocu' 
              ? 'Depocu Eğitim ve Görev Tanımı Portalı' 
              : selectedCategory === 'bilgi-islem'
              ? 'Bilgi İşlem ve Operasyon Portalı'
              : 'Resmi Tebellüğ ve Taahhütname Portalı'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {selectedCategory === 'depocu' 
              ? 'Depocu Eğitimi & Şube Tebellüğ Uyumu'
              : selectedCategory === 'bilgi-islem'
              ? 'Bilgi İşlem Yönergeleri & Şube Uyumu'
              : 'Şube Eğitim & Tebellüğ Uyumu'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            {selectedCategory === 'depocu'
              ? 'Depo sorumlularının ve sevkiyat personellerinin resmi Depocu Eğitim ve Görev Tanımı Kitapçığı sunumunu tamamlayıp dijital olarak imzalaması zorunludur.'
              : selectedCategory === 'bilgi-islem'
              ? 'Şubenizdeki tüm personellerin Bilgi İşlem ve Kasa yönergelerini tamamlayıp imzalaması şirket içi denetim standartları gereğidir.'
              : 'Şubenizdeki personellerin yönergeleri tamamlayıp imzalaması ve 5 soruluk yeterlilik sınavından geçmesi şirket içi denetim standartları gereğidir.'}
          </p>
        </div>

        {/* Branch Completion Gauge */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 sm:p-5 border border-slate-700/80 shrink-0 min-w-[240px]">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-bold flex items-center gap-1 text-white">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              {currentBranch.name}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              %{completionRate}
            </span>
          </div>

          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>

          <span className="text-[11px] text-slate-400 block text-center">
            {filteredBranchCompletions.length} / {filteredTrainings.length} Eğitim Tebellüğ Edildi
          </span>
        </div>
      </div>

      {/* SPECIAL FEATURE: 5-QUESTION RANDOMIZED EXAM & CERTIFICATE BANNER */}
      <div className={`text-white rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 border transition-all ${
        selectedCategory === 'depocu'
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 border-emerald-400/40'
          : selectedCategory === 'bilgi-islem'
          ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 border-blue-400/40'
          : 'bg-gradient-to-r from-amber-600 via-rose-600 to-red-700 border-amber-400/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-amber-200" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-amber-200" /> 
              {selectedCategory === 'depocu' ? 'Depocu Özel Yeterlilik Sınavı' : 'Resmi Yeterlilik Sınavı'}
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              {selectedCategory === 'depocu'
                ? 'Depocu Eğitim ve Görev Tanımı 5 Soruluk Sınavı'
                : selectedCategory === 'bilgi-islem'
                ? 'Bilgi İşlem ve Operasyon 5 Soruluk Yeterlilik Sınavı'
                : 'Rastgele 5 Soruluk Resmi Başarı & Tebellüğ Sınavı'}
            </h3>
            <p className="text-xs text-white/90 max-w-xl mt-0.5">
              {selectedCategory === 'depocu'
                ? 'Depocu Eğitim Kitapçığı konularından (stok kabul, terminal adımları, ERP ekstresi, transfer, telefon teslimi) 5 soru sorulur. En az 4 doğru (%80) ile resmi Depocu Sertifikası verilir.'
                : 'İlgili yönergeler arasından rastgele 5 soru sorulur. En az 4 doğru (%80) yapan personele şube tescilli resmi Esme Başarı ve Tebellüğ Sertifikası tanzim edilir.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleStartExam}
          className="shrink-0 px-6 py-3 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition transform hover:scale-105 cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Sınavı Başlat & Sertifika Al</span>
        </button>
      </div>

      {/* Directives Status Table for Current Branch */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              {selectedCategory === 'depocu'
                ? 'Depocu Eğitim Modülü ve Şube İmzaları'
                : selectedCategory === 'bilgi-islem'
                ? 'Bilgi İşlem Genelgeleri ve Şube İmzaları'
                : 'Resmi Genelgeler ve Şube İmzaları'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              İmzalanan eğitimlerin dijital tebellüğ sertifikasını anında indirebilirsiniz.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTrainings.map(t => {
            const completion = branchCompletions.find(c => c.trainingId === t.id);
            const isDone = !!completion;
            const isBI = t.category === 'bilgi-islem';

            return (
              <div 
                key={t.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isDone 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isBI ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {isBI ? 'Bilgi İşlem' : 'Depocu'}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-slate-400">
                        {t.docNo}
                      </span>
                      {t.priority === 'kritik' && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                          Kritik
                        </span>
                      )}
                      {t.isPresentation && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                          📊 Slayt Sunumu ({t.slides?.length || 10} Slayt)
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {t.title}
                    </h4>

                    {isDone ? (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                        ✓ {completion.personnelName} tarafından tebellüğ edildi • Kod: {completion.certificateId}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Henüz şubenizden imzalanmadı
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isDone ? (
                    <button
                      onClick={() => handleDownloadCertificate(completion)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Sertifika İndir (PDF)
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenTrainingDetail(t, t.isPresentation ? 'presentation' : 'quiz')}
                      className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer ${
                        t.isPresentation ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                      }`}
                    >
                      <span>{t.isPresentation ? 'Sunumu Başlat' : 'Oku & Tebellüğ Et'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 5-QUESTION EXAM MODAL */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 text-white flex items-center justify-between shrink-0 ${
              selectedCategory === 'depocu'
                ? 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900'
                : 'bg-gradient-to-r from-red-700 via-rose-700 to-slate-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {selectedCategory === 'depocu'
                      ? 'Depocu Eğitim ve Görev Tanımı Yeterlilik Sınavı'
                      : 'Resmi Tebellüğ & Yeterlilik Sınavı'}
                  </h3>
                  <p className="text-xs text-white/80">
                    5 Rastgele Soru • Geçme Barajı: En az 4 Doğru (%80) • Şube: {currentBranch.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowExamModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {!examSubmitted ? (
                <>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Personel: <strong>{currentPersonnel}</strong> — Lütfen soruları dikkatle okuyarak işaretleyiniz. Başarı sertifikası alabilmek için en az 4 soruya doğru yanıt vermelisiniz (%80).
                    </span>
                  </div>

                  <div className="space-y-6">
                    {examQuestions.map((q, qIndex) => {
                      const selectedOption = userAnswers[qIndex];

                      return (
                        <div 
                          key={q.id || qIndex} 
                          className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {qIndex + 1}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                              {q.question}
                            </h4>
                          </div>

                          <div className="space-y-2 pt-1 pl-8">
                            {q.options.map((opt, optIndex) => {
                              const isChecked = selectedOption === optIndex;

                              return (
                                <button
                                  key={optIndex}
                                  type="button"
                                  onClick={() => setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
                                    isChecked
                                      ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 font-bold shadow-sm'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isChecked ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                    {isChecked && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* EXAM RESULTS & CERTIFICATE VIEW */
                <div className="space-y-6">
                  {examScore >= 4 ? (
                    /* PASSED */
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold mb-2">
                          🏆 BAŞARI VE TEBELLÜĞ ŞARTI SAĞLANDI
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          Tebrikler, Sınavı Başarıyla Tamamladınız!
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                          5 sorudan <strong className="text-emerald-600 dark:text-emerald-400">{examScore} doğru</strong> yaptınız (%{Math.round((examScore / 5) * 100)}). Şirket içi tebellüğ ve yeterlilik sertifikanız hazırlanmıştır.
                        </p>
                      </div>

                      {/* On-Screen Certificate Preview */}
                      {generatedCertificate && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-amber-400 shadow-md max-w-xl mx-auto text-left relative overflow-hidden">
                          <div className="absolute top-2 right-2 opacity-10">
                            <ShieldCheck className="w-32 h-32 text-red-600" />
                          </div>
                          
                          <div className="border-b border-amber-300 pb-3 mb-4 text-center">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block">
                              ESME ŞİRKETLER GRUBU AKADEMİSİ
                            </span>
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {generatedCertificate.category === 'depocu'
                                ? 'RESMİ DEPOCU EĞİTİM BAŞARI VE TEBELLÜĞ SERTİFİKASI'
                                : 'RESMİ EĞİTİM BAŞARI VE TEBELLÜĞ SERTİFİKASI'}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Kod: {generatedCertificate.certificateId}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Personel Adı:</span>
                              <span className="font-bold">{generatedCertificate.personnelName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Şube / Mağaza:</span>
                              <span className="font-bold">{generatedCertificate.branchName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Alan:</span>
                              <span className="font-bold text-emerald-600">
                                {generatedCertificate.category === 'depocu' ? 'Depocu ve Sevkiyat' : 'Bilgi İşlem'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Başarı Skoru:</span>
                              <span className="font-bold text-emerald-600">{examScore} / 5 (%{Math.round((examScore / 5) * 100)})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tarih & Saat:</span>
                              <span className="font-mono">{new Date(generatedCertificate.completedAt).toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Onay:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">Ömer BAŞ (Genel Yönetici) & Turgut CESUR</span>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-center gap-3">
                            <button
                              onClick={() => handleDownloadCertificate(generatedCertificate)}
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Resmi Sertifikayı İndir (PDF)
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" /> Yazdır
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* FAILED - LESS THAN 4 CORRECT */
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-2xl p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-10 h-10" />
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold mb-2">
                          BARAJIN ALTINDA KALINDI (%80 ŞARTI)
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          Sınav Başarısı Yetersiz: {examScore} / 5 Doğru
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                          Başarı ve tebellüğ sertifikası düzenlenebilmesi için en az <strong>4 doğru (%80)</strong> gerekmektedir. Lütfen yönergeleri ve sunumu tekrar inceleyip sınava yeniden giriniz.
                        </p>
                      </div>

                      <button
                        onClick={handleStartExam}
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Sınavı Tekrar Başlat</span>
                      </button>
                    </div>
                  )}

                  {/* Question Review */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                      Soru Cevap İnceleme:
                    </h4>
                    {examQuestions.map((q, idx) => {
                      const userAns = userAnswers[idx];
                      const isCorrect = userAns === q.correctOptionIndex;

                      return (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-xl border text-xs ${
                            isCorrect 
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                              : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {idx + 1}. {q.question}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                            }`}>
                              {isCorrect ? '✓ Doğru' : '✗ Yanlış'}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-1">
                            <strong>Doğru Cevap:</strong> {q.options[q.correctOptionIndex]}
                          </p>
                          {q.explanation && (
                            <p className="text-slate-400 text-[10px] mt-0.5 italic">
                              Açıklama: {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            {!examSubmitted && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-2 shrink-0">
                {examErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{examErrorMsg}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {Object.keys(userAnswers).length} / {examQuestions.length} soru işaretlendi
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExamModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitExam}
                      className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <span>Sınavı Tamamla ve Değerlendir</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
