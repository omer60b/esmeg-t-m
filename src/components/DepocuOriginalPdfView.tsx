import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ExternalLink, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ChevronDown,
  Building2,
  Calendar,
  UserCheck
} from 'lucide-react';

interface DepocuOriginalPdfViewProps {
  pdfUrl?: string;
  onClose?: () => void;
}

export const DepocuOriginalPdfView: React.FC<DepocuOriginalPdfViewProps> = ({
  pdfUrl = '/assets/aistudio/ESME_Depocu_E_itim_ve_G_rev_Tan_m__Sunum_Kitap_____dcab1f65.pdf'
}) => {
  const [activeMode, setActiveMode] = useState<'embed' | 'document'>('embed');
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col text-slate-100">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-red-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600 text-white shadow-sm">
              RESMİ KİTAPÇIK • 5 SAYFA
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ESME-DPO-SOP-2026/02
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            ESME Depocu Eğitim ve Görev Tanımı Kitapçığı (Orijinal Belge)
          </h2>
          <p className="text-xs text-slate-300">
            Ömer BAŞ & Turgut CESUR • Değişiklik Yapılmamış Orijinal Tam Doküman
          </p>
        </div>

        {/* View Mode & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex items-center">
            <button
              onClick={() => setActiveMode('embed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'embed'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gömülü Orijinal PDF</span>
            </button>
            <button
              onClick={() => setActiveMode('document')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'document'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>A4 Tam Sayfa Metin & Görseller</span>
            </button>
          </div>

          <a
            href={pdfUrl}
            download="ESME_Depocu_Egitim_ve_Gorev_Tanimi_Kitapcigi.pdf"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            title="Orijinal PDF'yi İndir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF İndir</span>
          </a>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            title="Yeni Sekmede Tam Ekran Aç"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yeni Sekmede Aç</span>
          </a>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Yazdır"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 bg-slate-900/60 flex-1">
        
        {/* MODE 1: EMBEDDED PDF VIEWER */}
        {activeMode === 'embed' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Orijinal PDF doğrudan tarayıcı gömülü okuyucusunda gösterilmektedir. (5 Sayfa tam döküm)
              </span>
              <span className="text-[11px] font-mono">Dosya: ESME_Depocu_E_itim_..._Kitap.pdf</span>
            </div>

            <div className="w-full h-[750px] sm:h-[850px] rounded-2xl overflow-hidden border border-slate-700 bg-white shadow-2xl relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&statusbar=1`}
                className="w-full h-full border-none"
                title="ESME Depocu Eğitim ve Görev Tanımı Kitapçığı"
              />
            </div>
          </div>
        )}

        {/* MODE 2: UNABRIDGED 5-PAGE A4 DIGITAL REPLICA (GUARANTEED 100% READABLE) */}
        {activeMode === 'document' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Page Jump Selector Bar */}
            <div className="sticky top-2 z-20 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 pl-2">Sayfaya Git:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[1, 2, 3, 4, 5].map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setSelectedPage(pageNum);
                      const el = document.getElementById(`pdf-page-${pageNum}`);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedPage === pageNum
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    Sayfa {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const pages = document.querySelectorAll('.a4-page-card');
                  pages.forEach(p => p.scrollIntoView({ behavior: 'smooth' }));
                }}
                className="text-[11px] text-slate-400 hover:text-white pr-2 underline"
              >
                Tümünü İncele
              </button>
            </div>

            {/* SAYFA 1 */}
            <div id="pdf-page-1" className="a4-page-card bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6">
              
              {/* Header Antet */}
              <div className="border-b-2 border-red-600 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
                    ESME AVM
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                    Depocu Eğitim ve Görev Tanımı Kitapçığı
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 block text-slate-700">
                    SAYFA 1 / 5
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Ömer BAŞ & Turgut CESUR</span>
                </div>
              </div>

              {/* Tanım ve Giriş */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                <strong>Mağaza İçi Depocuların Görevleri:</strong> Mağaza içi depocular, mağazaların günlük operasyonel verimliliğini sağlamak, stok yönetimini düzgün yürütmek ve ürünlerin doğru şekilde yerleştirilmesini temin etmekle sorumludur. Bu pozisyon, mağaza içi operasyonların düzenli işlemesini ve müşteri memnuniyetini doğrudan etkiler.
              </div>

              {/* 1. Temel Depo ve Envanter Görevleri */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-red-600 text-white text-xs font-black flex items-center justify-center">1</span>
                  Temel Depo ve Envanter Görevleri
                </h3>

                <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">1. Stok Yönetimi</p>
                    <p>• <strong>Ürün Kabulü:</strong> Mağazaya gelen sevkiyatları kabul eder, doğru miktarda olup olmadığını kontrol eder, siparişlerle karşılaştırır ve kaydeder.</p>
                    <p>• <strong>Stok Girişi:</strong> Gelen ürünleri sisteme işleyerek barkodlarını okutur ve reyon sorumlularına teslimatını sağlar.</p>
                    <p>• <strong>Stok Çıkışı:</strong> Satışa sunulacak ürünlerin depodan mağazaya sevkini ve stok çıkışlarını kontrol ederek mağaza stoklarına girişini sağlar.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">2. Stok Sayımı ve Envanter Kontrolü</p>
                    <p>• <strong>Periyodik Stok Sayımları:</strong> Fiziksel envanter ile dijital envanter arasındaki farkları tespit etmek için belirli aralıklarla yapılan sayımlara katılır.</p>
                    <p>• <strong>Stok Farkları Tespiti:</strong> Eksik veya fazla stok tespit edilirse sebeplerini araştırır ve üst birime raporlar.</p>
                    <p>• <strong>Envanter Güncelleme:</strong> Değişiklikleri ve kayıpları raporlar.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">3. Ürün Depolama ve Düzenleme</p>
                    <p>• <strong>Ürün Yerleştirme:</strong> Gelen yeni ürünleri düzenli şekilde reyon sorumlusu ile birlikte depoya yerleştirir ve raflardaki yerlerini planlar.</p>
                    <p>• <strong>Raf Düzeni:</strong> Kategorilere göre sıralanmasını ve satışa sunulacak ürünlerin uygun düzenlenmesini sağlar.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">4. Sevkiyat ve İade İşlemleri</p>
                    <p>• <strong>Sevkiyat Hazırlığı:</strong> Başka şubelere veya müşterilere yapılacak sevkiyatlar için ürünleri hazırlar, doğru çıkışlarını sağlar.</p>
                    <p>• <strong>Ürün Transferleri:</strong> Mağaza içi farklı depolara veya mağazalara transferlerin düzgün ve hatasız yapılmasını sağlar.</p>
                  </div>
                </div>
              </div>

              {/* 2. Kayıp Önleme, Planlama ve Satış Destek */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-red-600 text-white text-xs font-black flex items-center justify-center">2</span>
                  Kayıp Önleme, Planlama ve Satış Destek Görevleri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">6. Stok Kayıplarının Tespiti ve Önlenmesi</p>
                    <p>• <strong>Kayıp Ürünler:</strong> Reyon sorumlusu ile kayıp ve hasarları tespit eder; hırsızlık, yanlış yerleştirme gibi sebepleri araştırır.</p>
                    <p>• <strong>Envanter Güvenliği:</strong> Depo alanını düzenli gözden geçirir ve güvenlik önlemlerini sağlar.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">7. İleriye Dönük Stok İhtiyaçları</p>
                    <p>• <strong>Stok Seviyesi Takibi:</strong> Satış sorumlusu ile tükenmek üzere olan ürünleri takip edip sipariş için yöneticilere bilgi verir.</p>
                    <p>• <strong>İhtiyaç Analizi:</strong> Popüler ürünlerin stoklarını izler ve öneriler sunar.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">8. Raporlama ve Veri Girişi</p>
                    <p>• <strong>Sayım Farkları Raporu:</strong> Fiziksel stok ile dijital envanter arasındaki farkları raporlayarak iyileştirme sağlar.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">9. Müşteri ve Satış Destek İşlemleri</p>
                    <p>• <strong>Müşteri Destek:</strong> Satılan ürünün mağaza stoklarından düşülmesi için çıkışını sağlar.</p>
                    <p>• <strong>Satış Ekibine Yardım & Acil Planlar:</strong> Ürünlerin hızlı temini ve acil durumlara hazır yerleşim.</p>
                  </div>
                </div>

                {/* Arızalı Ürün Kuralı */}
                <div className="bg-rose-50 border-l-4 border-rose-600 p-3.5 rounded-r-xl text-xs text-rose-950">
                  <strong className="block font-black text-rose-900 mb-1 uppercase tracking-wide">
                    ⚠️ KRİTİK KURAL — ARIZALI ÜRÜN KABULÜ:
                  </strong>
                  Ürün kabul sürecinde ürünlerde arıza tespit edilirse KESİNLİKLE sağlam satış reyonu stoğuna alınamaz! Derhal tutanak tanzim edilerek Arızalı/Hasarlı bölümüne ayrılır ve ilgili birimlere resmi bilgilendirme yapılır.
                </div>
              </div>

            </div>

            {/* SAYFA 2 */}
            <div id="pdf-page-2" className="a4-page-card bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6">
              <div className="border-b-2 border-red-600 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    10 Operasyonel Altın Kural & Sevkiyat Aracına Ürün Atanması
                  </h3>
                  <p className="text-xs text-slate-500">Adım 1: ESME - Online Sevkiyat Listesi Sözleşme Barkodunun Okutulması</p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                  SAYFA 2 / 5
                </span>
              </div>

              {/* 10 Altın Kural Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-red-600 tracking-wider">
                  Mağaza İçi Depocunun 10 Zorunlu Altın Kuralı:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-800">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>1. Evrak Takibi:</strong> Fatura, irsaliye ve transfer fişleri gibi evrakların düzenli takibi.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>2. Servis ve İade:</strong> Ürünlerin servis ve iade takibini reyon görevlisi ile koordineli sağlamak.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>3. Evrak Arşivleme:</strong> Tüm depo ve sevkiyat evraklarının güvenli arşivlenmesi.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>4. Sayarak Teslim Alma:</strong> Firmalardan, depolardan, mağazalardan gelen tüm ürünler sayılarak teslim alınır.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>5. Evraklı Giriş-Çıkış:</strong> Mağazalardan verilen ürünlerin giriş-çıkışları mutlaka evraklı ve sayılı olmalıdır.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>6. Hasarsız Paketleme:</strong> Teslimat ürünleri sayılarak, paketli ve hasarsız teslim edilir.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>7. SMS Onayı ve İmza:</strong> Müşteriden SMS onayı alınmalı; gelen ürün sayılı kontrol sonrası imzalanmalıdır.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>8. İmzalı Evrak Akışı:</strong> İrsaliye, fatura ve transfer fişleri imzalı gönderilip kontrol edilir.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>9. Kritik Ürün Sayımları:</strong> Cep telefonu, bilgisayar, beyaz eşya sayımları sık sık imzalı gönderilir.</div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200"><strong>10. Eksi Stok Yasağı:</strong> Eksi stoklar anında düzelttirilir; stokta olmayan ürünün çıkışı kesinlikle yapılamaz.</div>
                </div>
              </div>

              {/* Sevkiyat Aracına Ürün Atanması (Görsel 1) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
                  Sevkiyat Aracına Ürün Atanması — Adım 1: Barkod Okutma
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Sevkiyat için merkez depolardan yapılan sevkiyat planlamalarında, sevkiyatçının getirmiş olduğu <strong>ESME - Online Sevkiyat Listesi</strong> evrakının üst kısmında bulunan barkod el terminali aracılığı ile okutulur. Kullanıcı adı ve şifre girildikten sonra ilgili sevkiyatçı seçilir.
                </p>

                {/* Görsel 1: ESME - Online Sevkiyat Listesi */}
                <div className="p-4 rounded-xl border-2 border-slate-300 bg-slate-50 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-black text-red-600 text-sm">ESME - Online Sevkiyat Listesi</span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-300 font-bold text-slate-800">
                      Görsel 1: Resmi Evrak
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                    <span className="text-slate-400 text-[10px] block">EL TERMİNALİ İLE OKUTULACAK BARKOD</span>
                    <span className="text-base font-black tracking-widest text-slate-900 block my-1">
                      * 1-RI-7-2187238 *
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">Sözleşme Barkodu: 1-RI-7-2187238</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800">
                    <div><strong>Mağaza:</strong> Tokat Mağaza</div>
                    <div><strong>Teslimat Notu:</strong> Sevk</div>
                    <div><strong>Müşteri:</strong> GÜLER ÖĞMEN (1-4-280617)</div>
                    <div><strong>Sözleşme No / Tarih:</strong> 1-RI-7-2187238 - 18/01/2025</div>
                    <div className="col-span-2">
                      <strong>Müşteri Adres:</strong> MERKEZ (Tokat) EMİRSEYİT BELDESİ BOZATALAN MAH. ÇEŞME SK. NO: 19 İÇ KAPI NO: 1 MERKEZ / TOKAT
                    </div>
                    <div className="col-span-2">
                      <strong>Kredi Onayı:</strong> Online Kredi Birimi - Züleyha Arıcı Tarafından Kredi Verilmiştir.
                    </div>
                  </div>

                  {/* Ürün Listesi */}
                  <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                    <thead className="bg-slate-100 font-bold">
                      <tr>
                        <th className="p-1.5 border">Stok Kodu</th>
                        <th className="p-1.5 border">Stok Adı</th>
                        <th className="p-1.5 border text-right">Miktar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1.5 border font-semibold">250701ARN002</td>
                        <td className="p-1.5 border">ARNİCA ST90010 SİYAH 4 LÜ ÇEYİZ SETİ</td>
                        <td className="p-1.5 border text-right font-bold">1 Adet</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border font-semibold">AR4087</td>
                        <td className="p-1.5 border">ARZUM AR4087 GIRGIR 2Sİ 1 ARADA GIRGIR SÜPÜRGE</td>
                        <td className="p-1.5 border text-right font-bold">1 Adet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* SAYFA 3 */}
            <div id="pdf-page-3" className="a4-page-card bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6">
              <div className="border-b-2 border-red-600 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    DSIC El Terminali 4 Ekran Görseli & Müşteri Teslimat Adımları
                  </h3>
                  <p className="text-xs text-slate-500">Görseller 2, 3, 4, 5 — Terminal Adımları ve Mağazadan Teslimat</p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                  SAYFA 3 / 5
                </span>
              </div>

              {/* 4 Terminal Ekranı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                
                {/* Görsel 2 */}
                <div className="p-3.5 rounded-xl border-2 border-slate-300 bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-amber-400">Görsel 2: Araca Ürün Atama</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">1/4</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-200">
                    <p>• Barkod: <strong>1-rI-7-2187238</strong></p>
                    <p>• Tarih: <strong>2025-01-18</strong> • Miktar: <strong>2.00</strong></p>
                    <p>• Tutar: <strong>14.070,00 TL</strong></p>
                    <p>• Müşteri: <strong>GÜLER ÖĞMEN</strong></p>
                    <p>• M.Kodu: 1-4-280617 • M.Kodu: 009</p>
                    <p className="text-emerald-400">→ Teslimatçı seçilir ve İLERİ &gt; tıklanır</p>
                  </div>
                </div>

                {/* Görsel 3 */}
                <div className="p-3.5 rounded-xl border-2 border-slate-300 bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-amber-400">Görsel 3: Depo Ara Ekranı</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">2/4</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-200">
                    <p>• Barkod [1] sekmesinde ürünler listelenir:</p>
                    <p>1. ARNİCA ST90010 SİYAH 4 LÜ ÇEYİZ SETİ (1)</p>
                    <p>2. ARZUM AR4087 GIRGIR 2Sİ 1 ARADA SÜPÜRGE (1)</p>
                    <p className="text-sky-300">• Ürünlerin yanındaki kutular taranır</p>
                  </div>
                </div>

                {/* Görsel 4 */}
                <div className="p-3.5 rounded-xl border-2 border-slate-300 bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-amber-400">Görsel 4: Barkod Okutma (2/2)</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">3/4</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-200">
                    <p>• Barkod: <strong>8692341911101</strong></p>
                    <p>• Sayaç: <strong className="text-emerald-400">2 / 2 (Tamamlandı)</strong></p>
                    <p>• Her iki ürünün ulusal barkodu okutulduktan sonra <strong>ONAYLA</strong> butonu ile sonraki aşamaya geçilir.</p>
                  </div>
                </div>

                {/* Görsel 5 */}
                <div className="p-3.5 rounded-xl border-2 border-slate-300 bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-amber-400">Görsel 5: Atama Onay Ekranı</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">4/4</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-200">
                    <p className="bg-red-950/60 p-2 rounded border border-red-800 text-red-200">
                      "İŞLEMİ TAMAMLAMAK İSTEDİĞİNİZDEN EMİN MİSİNİZ?"
                    </p>
                    <p className="text-emerald-300 font-bold">
                      → <strong>EVET</strong> tıklanarak araca ürün atama başarıyla tamamlanır.
                    </p>
                  </div>
                </div>

              </div>

              {/* Mağazadan Müşteri Teslimatı 5 Adımı */}
              <div className="space-y-3 pt-3 border-t border-slate-200 text-xs text-slate-800">
                <h4 className="font-black text-sm text-slate-900">
                  B. Mağazadan Müşteri Teslimat Adımları (5 Adım):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-black text-red-600 block">1. Teslimat Başlat</span>
                    <span>Terminalden Mağaza Teslimatı Oluştur ve Teslimatçı seçimi.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-black text-red-600 block">2. Müşteri Seçimi</span>
                    <span>İlgili müşteri listeden seçilip İleri butonuna basılır.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-black text-red-600 block">3. SMS Onay Kodu</span>
                    <span>Müşteri telefonuna giden kod girilip Doğrula tıklanır.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-black text-red-600 block">4. Zorunlu IMEI</span>
                    <span>Cep telefonunda IMEI numarasının yazılması zorunludur.</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-black text-red-600 block">5. Barkod & Onay</span>
                    <span>Ürün barkodları okutularak Onayla ile işlem tamamlanır.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* SAYFA 4 */}
            <div id="pdf-page-4" className="a4-page-card bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6">
              <div className="border-b-2 border-red-600 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Nebim ERP Üzerinden Stok Ekstresi Kontrolü & Mağaza Transferi
                  </h3>
                  <p className="text-xs text-slate-500">Görseller 6, 7, 8 — Ürün Ekstresi (Miktarlı) ve Sipariş Giriş Adımları</p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                  SAYFA 4 / 5
                </span>
              </div>

              {/* Nebim V3 Arama ve Filtreleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* Görsel 6 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex justify-between items-center border-b pb-1 font-bold">
                    <span className="text-blue-700">Görsel 6: Nebim V3 Menü Arama</span>
                    <span className="text-[10px] bg-slate-200 px-1 rounded">Arama</span>
                  </div>
                  <p className="text-slate-700">
                    Nebim V3 sol üst arama kutusuna <strong>"ürün ek"</strong> yazılır. Çıkan menü seçeneklerinden MUTLAKA <strong>"Ürün Ekstresi (Miktarlı)"</strong> seçilir.
                  </p>
                </div>

                {/* Görsel 7 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex justify-between items-center border-b pb-1 font-bold">
                    <span className="text-blue-700">Görsel 7: Zorunlu Filtreler</span>
                    <span className="text-[10px] bg-slate-200 px-1 rounded">Filtre</span>
                  </div>
                  <p className="text-slate-700">
                    • <strong>Başlangıç Tarihi:</strong> Bu Ayın İlk Günü<br/>
                    • <strong>Bitiş Tarihi:</strong> Bugün<br/>
                    • <strong>Ek Filtreler:</strong> [Ürün Kodu] Eşit <strong>"042-001-090"</strong> → <strong>Çalıştır</strong>
                  </p>
                </div>

              </div>

              {/* Görsel 8: Sarar Battaniye Tablosu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                    Görsel 8: Sarar Battaniye (042-001-090) Stok Hareketleri Tablosu
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">Güncel Envanter: 77 Adet</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-300">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-800 text-white text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border">İşlem Tarihi</th>
                        <th className="p-2 border">Belge Ref No</th>
                        <th className="p-2 border">Hareket Türü</th>
                        <th className="p-2 border">Cari Hesap / Açıklama</th>
                        <th className="p-2 border text-right">Giren</th>
                        <th className="p-2 border text-right">Çıkan</th>
                        <th className="p-2 border text-right">Envanter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                      <tr className="bg-slate-50 font-semibold">
                        <td className="p-2 border">01.02.2025</td>
                        <td className="p-2 border">—</td>
                        <td className="p-2 border font-bold">Devir</td>
                        <td className="p-2 border">Dönem Başı Devir Bakiyesi</td>
                        <td className="p-2 border text-right font-bold">809,00</td>
                        <td className="p-2 border text-right">766,00</td>
                        <td className="p-2 border text-right font-black text-blue-700">43,00</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">01.02.2025</td>
                        <td className="p-2 border">1-RSD-6-127387</td>
                        <td className="p-2 border text-rose-700 font-semibold">Çıkış</td>
                        <td className="p-2 border">ADEM BAYAR (Perakende Sonra Teslim)</td>
                        <td className="p-2 border text-right">0,00</td>
                        <td className="p-2 border text-right font-bold text-rose-700">1,00</td>
                        <td className="p-2 border text-right font-bold">42,00</td>
                      </tr>
                      <tr>
                        <td className="p-2 border">01.02.2025</td>
                        <td className="p-2 border">1-RI-7-2212506</td>
                        <td className="p-2 border text-emerald-700 font-semibold">Çıkış (İade)</td>
                        <td className="p-2 border">EMİNE DEMİRAY (Taksitli Satış İadesi)</td>
                        <td className="p-2 border text-right">0,00</td>
                        <td className="p-2 border text-right font-bold text-emerald-700">-1,00</td>
                        <td className="p-2 border text-right font-bold">42,00</td>
                      </tr>
                      <tr className="bg-emerald-50/60 font-bold">
                        <td className="p-2 border">03.02.2025</td>
                        <td className="p-2 border">1-S-6-54748</td>
                        <td className="p-2 border text-emerald-700">Giriş (Transfer)</td>
                        <td className="p-2 border">Tokat Mağaza (Mağazaya Transfer)</td>
                        <td className="p-2 border text-right font-black text-emerald-700">35,00</td>
                        <td className="p-2 border text-right">0,00</td>
                        <td className="p-2 border text-right font-black text-emerald-800 text-sm">77,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transfer ve Sipariş Giriş Adımları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800 pt-2 border-t border-slate-200">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">A. Tedarikçiden Gelen Siparişlerin Girişi:</p>
                  <p>1. Gelen Fatura / İrsaliye kısmı seçilir.</p>
                  <p>2. Tedarikçi firma ismi yazılır ve listeden seçilir.</p>
                  <p>3. İlgili Sipariş Fişi seçilir.</p>
                  <p>4. Tarih seçilip barkodlar okutulur ve Onayla tıklanır.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">B. Mağazalar Arası Transfer (Merkeze İade):</p>
                  <p>1. Merkeze İade seçilip ilgili alanlar doldurulur.</p>
                  <p>2. Satırlar &gt; sağ tıkla Barkod kolonu aktif edilir ve ürün okutulur.</p>
                  <p>3. Adet ve Açıklama (hedef mağaza) girilip Kaydet denilir.</p>
                  <p className="font-semibold text-rose-700">4. Yazıcıdan çıktı alınır (İki taraflı ıslak imza şarttır).</p>
                </div>
              </div>

            </div>

            {/* SAYFA 5 */}
            <div id="pdf-page-5" className="a4-page-card bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6">
              <div className="border-b-2 border-red-600 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Cep Telefonu Teslimat Kuralları & Genel Değerlendirme
                  </h3>
                  <p className="text-xs text-slate-500">Müşteri Bilgileri, Jelatin & Ekran Kontrolü, IMEI, İade Yasağı ve İmzalar</p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                  SAYFA 5 / 5
                </span>
              </div>

              {/* Cep Telefonu Teslimat Kuralları */}
              <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 mb-1">1. Müşteri Bilgilerinin Doğruluğu</p>
                  <p>• <strong>Kimlik Doğrulama:</strong> Teslimat yapılmadan önce müşteri kimlik bilgileri (TC kimlik numarası, adres, telefon numarası, satılan ürünün doğruluğu vb.) mutlaka kontrol edilmelidir.</p>
                  <p>• <strong>Teslim Alan Kişinin Kimlik Bilgisi:</strong> Cep telefonunu teslim alacak kişinin kimlik bilgileri mağazada kaydedilmiş olmalıdır. Siparişi veren kişi değilse yetki verilmiş olması şarttır.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 mb-1">2. Ürün ve Paket Kontrolü</p>
                  <p>• <strong>Fiziksel Durum Kontrolü:</strong> Kutunun ve ürünün hasar görmediğinden emin olunmalıdır.</p>
                  <p>• <strong>Jelatin ve Ekran Kontrolü:</strong> Ürünün jelatini açılıp ekranı ve diğer özellikleri müşteri huzurunda kontrol edilmelidir.</p>
                  <p>• <strong>Aksesuar ve Belge Tamlığı:</strong> Şarj kablosu, garanti belgesi ve fatura eksiksiz teslim edilmelidir.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900 mb-1">3. Teslimat Prosedürü</p>
                  <p>• <strong>Teslimat Onay SMS'i ve IMEI:</strong> Müşteri teslimat aldıktan sonra terminal üzerinden müşteriden onay kodu alınarak teslimat sağlanmalıdır. Cihazın IMEI numarası mutlaka terminale okutulmalıdır.</p>
                  <p>• <strong>Müşteri Onayı:</strong> Müşteri teslim aldığı ürünü inceleyip onayını verdiğinde teslimat tamamlanır.</p>
                </div>

                {/* Cep Telefonunda İade Yoktur Kutusu */}
                <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl text-rose-950">
                  <p className="font-black text-rose-900 text-sm mb-1 uppercase">
                    4. İADE, DEĞİŞİM VE SERVİS KURALLARI — KESİN İADE YASAĞI:
                  </p>
                  <p className="font-bold">
                    • İade Bilgilendirmesi: Müşteriye teslim edilen cep telefonunun İADE SÜRECİNİN OLMADIĞI hakkında müşteri teslimat esnasında açıkça bilgilendirilmelidir.
                  </p>
                  <p className="mt-1">
                    • Servis Yönlendirmesi: Herhangi bir teknik arıza durumunda ürün doğrudan yetkili servise yönlendirilecektir.
                  </p>
                </div>
              </div>

              {/* Genel Değerlendirme & Sonuç */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">Genel Değerlendirme ve Sonuç:</p>
                Mağaza içi depocular, mağaza operasyonlarının düzgün ve verimli işlemesinde kritik bir rol oynar. Doğru envanter yönetimi, düzenli stok takibi ve eksiksiz evrak disiplini; mağaza başarısının, müşteri memnuniyetinin ve stok güvenliğinin temel güvencesidir.
              </div>

              {/* Resmi İmzalar ve Mühürler */}
              <div className="border-t-2 border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">Ömer BAŞ</span>
                  <span className="text-slate-500 block text-[11px]">Genel Yönetici</span>
                  <span className="text-emerald-600 font-bold text-[10px] mt-2 block">✓ Kurumsal Genel Onay</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">Turgut CESUR</span>
                  <span className="text-slate-500 block text-[11px]">Bilgi İşlem ve Kasa Müdürü</span>
                  <span className="text-emerald-600 font-bold text-[10px] mt-2 block">✓ Elektronik Mühürlü</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
