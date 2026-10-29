import { TrainingDocument } from '../types';

export const initialTrainings: TrainingDocument[] = [
  // ==========================================
  // BİLGİ İŞLEM EĞİTİM KATEGORİSİ
  // ==========================================
  {
    id: 'bi-01-kasa-genel',
    title: 'Bilgi İşlem & Kasa Genel Talimatı (17 Madde)',
    subTitle: 'Mağaza İçi Kasa, Cari, Fatura ve Operasyonel İşlem Kuralları',
    category: 'bilgi-islem',
    docNo: 'Bİ-EGT-2026/04',
    scope: 'Tüm Mağazalar & Kasa Personeli',
    targetUnit: 'Bilgi İşlem & Mağaza Kasaları',
    authorOrManager: 'Turgut CESUR (B.İ. ve Kasa Müdürü)',
    priority: 'zorunlu',
    iconName: 'Calculator',
    badgeText: '17 Altın Madde',
    summary: 'Mağazalarımızda yürütülen kasa, müşteri cari, fatura ve operasyonel süreçlerde sıfır hata prensibinin sağlanması için 17 zorunlu kural.',
    pdfPath: '/assets/aistudio/Bilgi___lem_ve_Kasa_Y_netimi_Genel_E_itim_Talimat__085ba22b.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=0kP0aW4l6bM',
    videoTitle: 'Kasa ve Cari Süreçleri Standart Operasyon Videosu',
    videoDuration: '06:45',
    chapters: [
      {
        id: 'c1',
        title: 'Bölüm I: Müşteri Cari & Kimlik Doğrulama Standartları',
        subTitle: 'Maddeler 1 ve 13',
        content: `**Madde 1: Mükerrer Cari Hesap Engeli ve T.C. Kimlik Kuralı:** Sistem güncellemesi tamamlanmış olup mükerrer ikinci hesap açılışı tamamen engellenmiştir. Müşteri sorgulama ve hesap açılışları kesinlikle T.C. Kimlik Numarası üzerinden yapılacaktır. Her işlemde fiziki kimlik temini zorunludur.\n\n**Madde 13: Kimliksiz İşlem Yapma Kesin Yasağı:** Fiziki kimlik kartı görülmeksizin işlem yapılması kesinlikle yasaktır. Yakınının veya kardeşinin e-Devlet şifresiyle dahi gelse işlem kabul edilmeyecektir; varsayımsal veya sözlü beyanla asla işlem açılmayacaktır.`,
        highlights: [
          'Mükerrer hesap açılışı sistem tarafından tamamen engellenmiştir.',
          'Müşteri sorgulamaları sadece T.C. Kimlik Numarası ile yapılır.',
          'e-Devlet şifresi veya sözlü beyanla asla işlem yapılamaz; fiziki kimlik şarttır.'
        ],
        criticalNotes: [
          'Kimlik kartı görülmeden yapılan işlemler doğrudan denetim kusuru sayılır.'
        ]
      },
      {
        id: 'c2',
        title: 'Bölüm II: Kasa, Tahsilat ve Nakit Yönetimi',
        subTitle: 'Maddeler 2, 5, 8, 11, 12, 16',
        content: `**Madde 2: Günlük Fatura & Peşinat Kontrolü:** Peşinatı alınıp faturası unutulan işlemlerin tespiti için Alınan Ödemeler ekranında tip filtresi "Peşin Satış" seçilerek sorgulama yapılmalıdır. Bu sayede gün içinde para tahsil edilen hem taksitli hem peşin tüm işlemler listelenir; fatura kontrolleri teyit edilir.\n\n**Madde 5: Kısmi Ödemelerde Doğru Ürün ve Hatalı Fiş İptal Protokolü:** Taksitten daha düşük tutar ödendiğinde (örn. 3.000 TL yerine 1.000 TL), tutar hemen düşülmemeli, müşteriye hangi üründen düşüleceği sorulmalıdır. Hatalı ödemelerde: Fiş müşteriden alınır, üzerine "İPTAL" çekilir, iptal gerekçesi yazılır; Müşteri ile Bilgi İşlem personelinin ad-soyad ve ıslak imzası tamamlanıp taranarak merkeze iletilir.\n\n**Madde 8: Mail Order Kesin Yasağı:** Kredi kartı bilgileri fiziki POS dışında telefonla veya formla alınarak Mail Order yöntemiyle çekim yapılması kesinlikle yasaktır.\n\n**Madde 11: Aylık Ödeme Planı Sözlü Teyidi:** Senet ve taksit sözleşmesi düzenlenirken ekrandaki ilk taksit vadesi ve aylık tutar müşteriye sözlü olarak net biçimde okunmalı ve mutlak teyit alınmalıdır.\n\n**Madde 12: Gün İçi Kasa Sayımı ve 15.000 TL Kasaya Aktarım Kuralı:** Kasa çekmecesi gün içinde sık sık sayılmalıdır. Çekmecedeki nakit meblağ 15.000 TL limitini aştığı anda, risk oluşmaması adına fazla para derhal mağaza çelik kasasına aktarılacaktır.\n\n**Madde 16: esme.com.tr Erken Ödeme İndirimi Eşitliği:** Müşteri web sitemizden borç kapama ekranında erken ödeme indirimiyle hangi tutarı görüyorsa, mağazaya gelip borcunu kapattığında da birebir aynı indirimli tutar uygulanarak hesabı kapatılacaktır.`,
        highlights: [
          'Kasa çekmecesinde 15.000 TL üzeri nakit tutulamaz; derhal çelik kasaya aktarılır.',
          'Telefonla veya formla Mail Order çekimi kesinlikle yasaktır.',
          'Kısmi ödemede müşteriye hangi üründen düşüleceği sorulmalıdır.',
          'esme.com.tr erken ödeme indirimi mağazada da birebir uygulanır.'
        ],
        criticalNotes: [
          'Gün içi kasa sayımında 15.000 TL limiti aşıldığında çelik kasaya aktarılmaması disiplin suçudur.'
        ]
      },
      {
        id: 'c3',
        title: 'Bölüm III: İptal, İade ve Değişim Prosedürleri',
        subTitle: 'Maddeler 3, 7, 10',
        content: `**Madde 3: Parça İptal Kuralları ve Sorumluluk:** Bilgi İşlem yöneticisi onayı olmadan parça iptal yapılamaz. Şartlar: Fatura kesilmiş olmalı ve evrakta teslim edilecek başka ürün bulunmamalıdır. Aksi halde evrak kilitlenir, kalan ürün teslim edilemez. İhlallerde sorumluluk işlemi yapan personele aittir.\n\n**Madde 7: Nakit ve Kredi Kartı İade Ayrımı:** Peşin ödeme mağazadan nakit iade edilecekse A4 kağıdına "... TL tutarındaki ödememi elden eksiksiz teslim aldım" yazılarak müşteri imzası alınır ve Bilgi İşlem'e iletilir. Kredi kartında ise bankanın iade seçeneğinden iptal geçilir; POS slipi A4'e yapıştırılıp müşteri imzasıyla Muhammet Bey'e taranır.\n\n**Madde 10: 30 Günü Aşan İptaller ve Satın Alma Onayı:** Ürün sistemde henüz teslim edilmemişse Bilgi İşlem'e e-posta yeterlidir. Ürün teslim edilmişse Satın Alma birimine onay e-postası gönderilmeli ve Bilgi İşlem CC'ye eklenmelidir; onay gelmeden tarih açılmaz. Teslim edilmeyen ürün teslim gösterilemez.`,
        highlights: [
          'Parça iptal ancak Bilgi İşlem yöneticisi onayıyla ve evrakta başka teslim edilecek ürün yoksa yapılabilir.',
          'Nakit iadelerde el yazılı A4 teslim yazısı ve müşteri imzası şarttır.',
          '30 günü aşan teslim edilmiş ürün iadelerinde Satın Alma onayı zorunludur.'
        ]
      },
      {
        id: 'c4',
        title: 'Bölüm IV: Dijital Sistemler, Portal ve Donanım İşlemleri',
        subTitle: 'Maddeler 4, 6, 9, 14, 15, 17',
        content: `**Madde 4: İnternet Satışı (esme.com.tr) ve Mağaza Müdürü Yetkisi:** İnternet satışlarının portal teslim aşamaları, fatura kesimi ve kasa kapatması yalnızca Mağaza Müdürü kullanıcı bilgileri ile yürütülecektir. Her şube işlem yapmasa dahi hesapların aktif olduğunu test etmelidir.\n\n**Madde 6: Tablet İmza Süreci ve Kağıt İmza Yasağı:** Sözleşme tablete düşmüyorsa ya tablet interneti kopmuştur ya da ekran kapatılmıştır. Kağıda imza kesinlikle alınamaz. Bilgi İşlem veya Tokat Mağaza Müdürü Ömer Bey ile irtibata geçilecektir.\n\n**Madde 9: Kullanıcı Case Talepleri:** Case açarken personelin Adı-Soyadı, T.C. Kimlik No ve reyonu net yazılmalıdır. Kredi Esme ve İst Esme aynı gün açılır; Portal ve Sipariş Esme hesapları ise 1 iş günü sonra aktifleşir.\n\n**Madde 14: İbraname Arama Kriteri ve Terminal ID:** İbraname için borcun bittiği tarih değil, sözleşmenin ilk işlem tarihi ile sorgulama yapılır. İbraname butonu görünmüyorsa: Profil > Ayarlar > Terminal ID kutusu doldurulmalıdır.\n\n**Madde 15: Fatura Yazdırma Sorunları:** Çıktı sorunlarında müşteri mağazadan geri çevrilmez; iletişim numarası alınıp Olgun Bey veya Bilgi İşlem ile irtibat kurularak sorun çözüldükten sonra dönüş yapılır.\n\n**Madde 17: Donanıma Müdahale Yasağı:** Oktay Bey'in bilgisi ve onayı olmadan bilgisayar kasası açma, yer değiştirme, parça sökme veya harici bağlantı kurma gibi işlemler kesinlikle yasaktır.`,
        highlights: [
          'Kağıda sözleşme imzası kesinlikle yasaktır; tablet imza zorunludur.',
          'Bilgisayar kasası açma ve parça sökme Oktay Bey onayı olmadan yasaktır.',
          'İbraname araması borç bitiş tarihiyle değil, ilk sözleşme tarihiyle yapılır.'
        ]
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Kasa çekmecesindeki nakit para gün içinde hangi limiti aştığında derhal mağaza çelik kasasına aktarılmalıdır?',
        options: ['5.000 TL', '10.000 TL', '15.000 TL', '25.000 TL'],
        correctOptionIndex: 2,
        explanation: 'Madde 12 uyarınca kasa çekmecesindeki nakit 15.000 TL limitini aştığı anda fazla para derhal çelik kasaya aktarılmalıdır.'
      },
      {
        id: 'q2',
        question: 'Sözleşme tablete düşmediğinde personelin izleyeceği doğru adım hangisidir?',
        options: [
          'Müşteriye kağıt sözleşme imzalatılır.',
          'Kağıda imza kesinlikle alınamaz; tablet bağlantısı kontrol edilir, Bilgi İşlem veya Tokat Mağaza Müdürü Ömer Bey ile irtibata geçilir.',
          'İşlem iptal edilir ve müşteri eve gönderilir.',
          'Sözleşmesiz teslimat yapılır.'
        ],
        correctOptionIndex: 1,
        explanation: 'Madde 6 gereğince kağıda imza kesinlikle yasaktır; tablet bağlantısı teyit edilmeli veya Ömer Bey/Bilgi İşlem aranmalıdır.'
      },
      {
        id: 'q3',
        question: 'İbraname sorgulaması yapılırken hangi tarih kriteri esas alınmalıdır?',
        options: [
          'Borcun son kapandığı günün tarihi',
          'Sözleşmenin ilk işlem tarihi',
          'Sorgulamanın yapıldığı güncel tarih',
          'Müşterinin doğum tarihi'
        ],
        correctOptionIndex: 1,
        explanation: 'Madde 14 uyarınca ibraname için borcun bittiği tarih değil, sözleşmenin ilk işlem tarihi ile sorgulama yapılır.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'bi-02-kvkk-guvenlik',
    title: 'Bilgi Güvenliği, KVKK ve Sosyal Medya Paylaşımları',
    subTitle: 'Çalışma Ortamı, Sistem Ekranları ve Sosyal Medya Paylaşımları Prosedürü',
    category: 'bilgi-islem',
    docNo: 'TLM-BG-2026/01',
    scope: 'Tüm Mağazalar, Merkez ve Saha Personeli',
    targetUnit: 'Hukuk Müşavirliği & Bilgi Güvenliği Yönetimi',
    authorOrManager: 'Hukuk Müşavirliği & İnsan Kaynakları',
    priority: 'kritik',
    iconName: 'ShieldAlert',
    badgeText: 'Yasal Uyarı & Cezai Yaptırım',
    summary: 'Kasa, ERP sistem ekranları, müşteri evrakları ve banko görsellerinin sosyal medyada paylaşılmasının yasal sonuçları ve mutlak yasaklar.',
    pdfPath: '/assets/aistudio/Bilgi_G_venli_i__KVKK_ve_Kurumsal_Payla__mlar_Talimatnamesi_e0f3bfc8.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
    videoTitle: 'KVKK ve Kurumsal Gizlilik Eğitimi',
    videoDuration: '05:12',
    chapters: [
      {
        id: 'kv1',
        title: 'Önemli Tespit ve İhlalin 3 Temel Yasal Boyutu',
        content: `Yapılan denetimlerde; şirket içi çalışma alanları, kasa/satış bankoları ve bilgisayar ekranlarına ait görsellerin personeller tarafından sosyal medyada (Instagram, TikTok, WhatsApp Durum vb.) paylaşıldığı; bu paylaşımlarda müşteri telefon numaraları, ad-soyad, adres, fatura detayları ve ERP kullanıcı giriş bilgilerinin açıkça ifşa edildiği tespit edilmiştir. Bu durum kurumsal güvenliğimizi doğrudan tehdit etmektedir.\n\n### İHLALİN 3 TEMEL YASAL VE CEZAİ BOYUTU:\n\n1. **KVKK & TCK MD. 136 (Kişisel Verilerin İfşası):** Müşterilerimize veya iş ortaklarımıza ait telefon numarası, T.C. kimlik no, sipariş fişi veya fatura bilgilerinin fotoğraflanarak paylaşılması 6698 sayılı KVKK uyarınca şirketimiz aleyhine milyonlarca liralık idari para cezası doğurur. Paylaşımı yapan personel hakkında ise Türk Ceza Kanunu Madde 136 uyarınca **2 yıldan 4 yıla kadar hapis cezası istemiyle** doğrudan adli soruşturma açılacaktır.\n\n2. **TCK MD. 239 (Sistem Ekranları ve Ticari Sırların Açıklanması):** Şirket içi ERP yazılımları, yönetim panelleri, terminal ekranları, kullanıcı adı ve şifreleri içeren görsellerin paylaşılması ciddi siber güvenlik zafiyeti yaratmaktadır. Bu eylem TCK Madde 239 (Ticari Sır, Bankacılık Sırrı veya Müşteri Sırrının Açıklanması) kapsamında suç teşkil etmekte olup adli kovuşturmaya tabidir.\n\n3. **İŞ KANUNU MD. 25/II (Tazminatsız Haklı Nedenle Fesih):** İşyeri mahremiyetini, müşteri gizliliğini ve işverene sadakat borcunu ihlal eden paylaşımlar; 4857 sayılı İş Kanunu'nun 25/II maddesi (Ahlak ve iyi niyet kurallarına uymayan haller) uyarınca personelin iş sözleşmesinin **kıdem ve ihbar tazminatı ödenmeksizin haklı nedenle derhal feshine** sebep olur.`,
        highlights: [
          'Müşteri verisi paylaşımı: Şirkete milyonluk para cezası, personele 2-4 yıl hapis cezası.',
          'ERP ekranı paylaşımı: TCK 239 Ticari Sır İhlali suçu.',
          'İş Kanunu 25/II uyarınca tazminatsız anında iş akdi feshi.'
        ],
        tableData: {
          headers: ['Yasaklanan Paylaşım Türü', 'İhlal Edilen Mevzuat / Kapsam', 'Doğrudan Hukuki ve İdari Sonucu'],
          rows: [
            ['Müşteri Verisi İfşası (Fiş, senet, adres, telefon)', '6698 sayılı KVKK ve TCK Md. 136 (Verileri Hukuka Aykırı Yayma)', 'Şirkete idari para cezası, şahsa 2-4 yıl hapis davası'],
            ['Ekran & Sistem Görselleri (ERP, kasa menüsü, şifre)', 'TCK Md. 239 (Ticari Sır İhlali) & Siber Güvenlik Protokolü', 'Adli kovuşturma, tazminatsız işten çıkarma ve maddi tazminat']
          ]
        }
      },
      {
        id: 'kv2',
        title: 'Tüm Personelin Derhal Uyması Gereken Kesin Talimatlar',
        content: `1. **Geçmiş Paylaşımların Derhal Kaldırılması:** Bugüne kadar sosyal medya hesaplarında (özel/genel ayrımı olmaksızın) mağaza içinden, bilgisayar ekranlarından veya müşteri evraklarından paylaşılmış tüm görsel ve videolar derhal silinecektir.\n\n2. **Kesin Paylaşım Yasağı:** Bundan sonraki süreçte şirket içi çalışma alanlarından, kasa arkasından, POS cihazlarından ve bilgisayar ekranlarından görsel/video çekilmesi ve paylaşılması istisnasız ve kesin olarak yasaklanmıştır.\n\n**TEBLİĞ VE BAĞLAYICILIK:** İşbu talimatname tüm personele tebliğ niteliğinde olup mağaza müdürleri çalışanların bilgilendirilmesinden şahsen sorumludur. Denetim ekiplerince sosyal medya hesaplarında yapılacak taramalarda ihlali tespit edilenler hakkında derhal yasal ve idari süreç başlatılacaktır.`,
        criticalNotes: [
          'Sosyal medya hesaplarındaki tüm mağaza ve ekran görüntüleri istisnasız derhal silinmelidir.'
        ]
      }
    ],
    officialNotice: {
      legalRisks: [
        'TCK Madde 136: Kişisel verileri hukuka aykırı yayma (2 yıldan 4 yıla kadar hapis cezası).',
        'TCK Madde 239: Ticari sır ve müşteri sırrının açıklanması.',
        'KVKK İdari Para Cezaları: Milyonlarca liralık kurumsal yaptırımlar.'
      ],
      disciplinaryActions: [
        '4857 Sayılı İş Kanunu Madde 25/II: Kıdem ve ihbar tazminatsız haklı nedenle derhal fesih.',
        'Şirketin uğradığı zararlar için personele rücu edilecek maddi tazminat davaları.'
      ]
    },
    quiz: [
      {
        id: 'qkv1',
        question: 'Kasa ekranı veya müşteri faturası fotoğrafını sosyal medyada (Instagram, WhatsApp Durum vb.) paylaşan personele TCK Md. 136 kapsamında hangi ceza talep edilir?',
        options: [
          'Sadece sözlü uyarı verilir.',
          '2 yıldan 4 yıla kadar hapis cezası istemiyle adli soruşturma açılır.',
          'Maaşından 100 TL kesilir.',
          'Bir hafta izin kullandırılır.'
        ],
        correctOptionIndex: 1,
        explanation: 'TCK 136 uyarınca kişisel verileri hukuka aykırı olarak paylaşan kişi hakkında 2 yıldan 4 yıla kadar hapis cezası istemiyle dava açılır.'
      },
      {
        id: 'qkv2',
        question: 'Müşteri gizliliğini ihlal eden personelin iş akdi hangi kanun maddesine göre tazminatsız feshedilir?',
        options: [
          'İş Kanunu Madde 17',
          'İş Kanunu Madde 25/II (Ahlak ve iyi niyet kurallarına uymayan haller)',
          'Tüketici Kanunu Madde 4',
          'Borçlar Kanunu Madde 12'
        ],
        correctOptionIndex: 1,
        explanation: 'İş Kanunu 25/II maddesi gereğince ihbar ve kıdem tazminatı ödenmeksizin derhal haklı nedenle fesih uygulanır.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'bi-03-kredi-karti',
    title: 'Kredi Kartı İşlemleri, İptal, İade ve Değişim Talimatı',
    subTitle: 'İptal, İade ve Değişim Süreçleri Standart Operasyon Prosedürü',
    category: 'bilgi-islem',
    docNo: 'TLM-OP-2024/03',
    scope: 'Kasa & Satış Personelleri',
    targetUnit: 'Kasa Yönetimi & Finans Muhasebe',
    authorOrManager: 'Furkan SAMANOĞLU & Turgut CESUR',
    priority: 'zorunlu',
    iconName: 'CreditCard',
    badgeText: 'Sıfır Hata Protokolü',
    summary: 'Aynı gün iptal ile gün sonu sonrası iade ayrımı, kısmi iade kuralları, esme.com.tr internet satışı ve Tüketici Hakem Heyeti ibraname süreci.',
    pdfPath: '/assets/aistudio/Kredi_Kart____lemleri_Uygulama_ve_Denetim_Talimat__987fed7c.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=60ItHLz5WEA',
    videoTitle: 'Kredi Kartı POS İptal ve İade Operasyon Eğitimi',
    videoDuration: '08:20',
    chapters: [
      {
        id: 'kk1',
        title: 'Kredi Kartı İptal ve İade Esasları Matrisi',
        content: `YÖNETİM UYARISI: Son dönemde kredi kartı iptal/iade adımlarında artan operasyonel hatalar şirket hesap mutabakatlarını ve POS cari dengesini doğrudan bozmaktadır. Mağaza kasalarında finansal süreçlerin eksiksiz yürütülebilmesi adına aşağıdaki işlem adımlarının uygulanması kesinlikle zorunludur.\n\n### 1. Tümünü İptal İşlemleri (Aynı Gün İçerisinde):\nMüşteri ürünü satın aldığı gün içinde iade talep ederse ve henüz Gün Sonu (Z Raporu) alınmamışsa:\n- **Kasa Ekranı:** Satış hangi pos/banka tipiyle yapıldıysa birebir aynı türde "İptal" seçeneğiyle düşülür. (Örnek: Ziraat Tek Çekim ile satıldıysa, Ziraat Tek Çekim İptal seçilmelidir).\n- **Fiziki POS:** İlgili banka POS cihazı menüsünden "İşlem İptali" gerçekleştirilir.\n- **Bildirim:** Provizyon banka sistemi üzerinden otomatik düşeceği için merkeze (Furkan Bey'e) e-posta veya evrak gönderilmesine gerek yoktur.\n\n### 2. Tam İade İşlemleri (Ertesi Gün ve Sonrası):\nGün Sonu alındıktan sonra (ertesi gün ya da daha ileri bir tarihte) iade talebi gelirse:\n- **Kasa Ekranı:** Kesinlikle "İptal" seçilmez; ilgili bankanın "İade" seçeneği kullanılmalıdır. (Örnek: Ziraat Tek Çekim İade).\n- **Fiziki POS:** Z Raporu kapandığı için POS cihazından iade işlemi yapılamaz. Tutar iadesi genel merkez tarafından kart hesabına aktarılacaktır.\n- **Bildirim & Evrak:** İadeye ait POS slipi ile müşteri tarafından ıslak imzalanmış İade Dilekçesi taranarak ivedilikle Furkan Bey'e e-posta yoluyla iletilmelidir.\n\n### 3. Kısmi İade İşlemleri (Tek Faturada Çoklu Ürün):\nAynı fiş/faturada yer alan birden fazla üründen sadece bir kısmının iade edilmesi halinde: Para iadesi her halükarda genel merkezce yapılacağı için ilgili bankanın "İade" seçeneği seçilmelidir. E-posta şablonunda net iade tutarı, müşteri dilekçesi ve işlem slipi eklenmelidir.`,
        highlights: [
          'Aynı gün Z Raporu öncesi: Kasa ekranından İPTAL + POS cihazından iptal (merkeze mail gerekmez).',
          'Ertesi gün ve sonrası: Kasa ekranından İADE + POS cihazından işlem yapılmaz (Furkan B. mail + A4 dilekçe).',
          'Altın Kural: Kasadan para çıkmayacak işlemde ASLA "İade" seçilemez!'
        ],
        tableData: {
          headers: ['İşlem Türü', 'İşlem Zamanlaması', 'Kasa Yazılım Seçeneği', 'POS Cihazı', 'Merkez Bildirimi'],
          rows: [
            ['Aynı Gün İptal', 'Gün Sonu / Z Raporu Öncesi', 'İptal (Satış Tipiyle Aynı)', 'Cihazdan İptal Yapılır', 'Gerekmez'],
            ['Tam İade', 'Gün Sonu / Z Raporu Sonrası', 'İade (İlgili Banka)', 'İşlem Yapılmaz', 'Zorunlu (Furkan B.)'],
            ['Kısmi İade', 'Tarih/Gün Fark Etmeksizin', 'İade (İlgili Banka)', 'İşlem Yapılmaz', 'Zorunlu (Furkan B.)']
          ]
        }
      },
      {
        id: 'kk2',
        title: 'Değişim, İnternet Satışı ve Hakem Heyeti İadeleri',
        content: `### 4. Kredi Kartı Değişim İşlemleri (Daha Yüksek Tutarlı Ürün):\nİlk satış tutarı kasa sisteminden satış yapılan banka seçeneğiyle "İptal" edilir (asla "İade" seçilmez). Yeni ürün bedeli satış olarak açılır. POS cihazından yalnızca ek ödeme farkı çekilir. Kasaya ilk çekilen tutar önceki yöntemle, ek tutar ise yeni yöntemle işlenir.\n\n### 5. Parça İptal ve Kısmi Değişim Sınırı:\nParça iptal yapıldıktan sonra, iptal edilen tutardan daha düşük bir tutar için yeni bir işlem girişi kesinlikle yapılamaz. Önce eski işlemin tamamı iptal edilerek merkeze iade süreci başlatılmalı, ardından yeni ürün bedeli için yeniden çekim yapılmalıdır.\n\n### 6. İnternet Satışı (esme.com.tr):\nİşlem öncesinde mutlaka Faruk Şimşek ile görüşülerek teyit alınmalıdır. Ödeme tipi "Kredi Kartı" seçildikten sonra alt seçeneklerden mutlaka "İnternet Satışı (esme.com.tr)" tanımı işaretlenmelidir. Fatura kesilir kesilmez faruk.simsek@esme.com.tr ve furkan.samanoglu@esme.com.tr adreslerine e-posta bildirimi zorunludur.\n\n### 7. Tüketici Hakem Heyeti (THH) Kararları:\nElden taksitli alışverişin bir kısmı kredi kartıyla ödenmiş ve THH kararıyla iade çıkmışsa müşteriden IBAN alınır. Zorunlu İbraname Metni: Müşterinin kendi el yazısıyla; "Yukarıdaki karar sonucu hak edişimin belirtmiş olduğum IBAN numarasına yatırılmasını rica ederim." yazdırılarak ıslak imzası alınır.`,
        criticalNotes: [
          'OPERASYONUN ALTIN KURALI: Kasada girilen işlem neticesinde müşteriye merkezden nakit/hesaba para iadesi yapılacaksa ve merkeze dilekçe gönderiliyorsa KESİNLİKLE "İADE" SEÇENEĞİ kullanılmalıdır. Kasadan veya POS\'tan para çıkışı yapılmayacak hiçbir işlemde asla "İADE" seçilemez!'
        ]
      }
    ],
    officialNotice: {
      officialTemplate: {
        title: 'Kısmi İade E-Posta Şablonu',
        to: 'furkan.samanoglu@esme.com.tr',
        cc: 'faruk.simsek@esme.com.tr',
        subject: '[MAĞAZA ADI] — [İşlem No] Kısmi İade Talebi',
        body: 'Sayın Furkan Bey,\n\n[İşlem No] numaralı işlemin [Tutar] TL\'lik kısmı kısmi iade olmuştur. Müşteri dilekçesi ve işlem slipi ekte taranmış olarak sunulmuştur. İadesini rica ederim.\n\nMağaza: [Mağaza Adı]\nKasiyer / B.İ. Sorumlusu: [Ad Soyad]'
      }
    },
    quiz: [
      {
        id: 'qkk1',
        question: 'Gün sonu (Z Raporu) alındıktan sonraki bir günde kredi kartı iadesi geldiğinde fiziki POS cihazından iade çekimi yapılır mı?',
        options: [
          'Evet, POS cihazından ters işlem yapılır.',
          'Hayır, Z Raporu kapandığı için POS cihazından işlem yapılmaz; tutar genel merkez tarafından karta iade edilir.',
          'Müşteriye nakit para ödenir.',
          'Banka aranıp şifre istenir.'
        ],
        correctOptionIndex: 1,
        explanation: 'Gün sonu kapandıktan sonra POS cihazından müdahale edilemez; A4 dilekçe ve slip ile merkeze iletilir, iadeyi merkez yapar.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'bi-04-banka-eft-iade',
    title: 'Banka Havalesi / EFT İade Süreç ve Bildirim Talimatı',
    subTitle: 'Müşteri IBAN İade Süreçleri ve Bildirim Standartları Prosedürü',
    category: 'bilgi-islem',
    docNo: 'TLM-FN-2024/05',
    scope: 'Mağaza Kasaları & Müşteri Hizmetleri',
    targetUnit: 'Muhasebe / Finans İadeleri',
    authorOrManager: 'Fatma KURUCA & Furkan SAMANOĞLU',
    priority: 'zorunlu',
    iconName: 'Building2',
    badgeText: 'Kritik Hesap: 38702',
    summary: 'Müşteriye nakit çıkışı yapılmayıp IBAN üzerinden EFT/Havale ile yapılacak iadelerde zorunlu şube seçimi ve bildirim şablonu.',
    pdfPath: '/assets/aistudio/Banka_Havalesi_ve_EFT__ade_S_re__Talimat__62b98dc9.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    videoTitle: 'Havale ve EFT İade Adımları',
    videoDuration: '04:18',
    chapters: [
      {
        id: 'bnk1',
        title: 'Banka Havalesi ve EFT İade 4 Aşamalı Süreç',
        content: `Müşteriye nakit çıkışı yapılmayıp ödemenin Banka Havalesi / EFT (IBAN) yoluyla iade edileceği işlemlerde, merkeze (Fatma Hanım tarafına) yapılan bildirim ve sistem kayıtlarında hatalar yaşandığı tespit edilmiştir. İade sürecinin gecikmeksizin tamamlanması için aşağıdaki adımların eksiksiz uygulanması gerekmektedir.\n\n### 1. Sistem Kaydı: Müşteri Hesabı Üzerinden İptal/İade Girişi:\nMüşteriye fiziki ödeme yapılmadan önce kasa/muhasebe yazılımında ilgili Müşteri Cari Hesabı açılarak iptal/iade işleminin sisteme resmen işlenmiş olması zorunludur. Sistemde kaydı tamamlanmamış işlemler için merkeze e-posta atılmamalıdır.\n\n### 2. Kritik Hesap Seçimi: Havale/EFT Banka Tanımı:\nSistemde iptal/iade türü olarak Havale/EFT seçeneği işaretlendiğinde, işlem yapılacak çıkış hesabı olarak mutlaka aşağıdaki şube ve hesap seçilmelidir:\n\n**T. İŞ BANKASI — GÜNEŞLİ ÇARŞI ŞUBESİ (HESAP NO: 38702)**\n\nFarklı bir banka veya şube hesabı seçilmesi cari hesap mutabakatını bozduğu için kesinlikle yasaktır.\n\n### 3. Resmi E-Posta Bildirimi (Zorunlu Bildirim Kanalı):\nKime: Merve Biçer (merve.bicer@esme.com.tr)\nBilgi (CC): Fatma Kuruca, Furkan Samanoğlu\nKonu: [Müşteri Adı Soyadı] — IBAN İade Talebi / [İşlem No]\n\n### 4. Merkez Kontrolü ve Transfer İcrası:\nE-posta iletiminin ardından Fatma Kuruca ve Furkan Samanoğlu tarafından sistem kayıtları ve ekstreler çapraz kontrol edilir. Bilgilerin doğruluğu teyit edildikten sonra ödeme finans birimi tarafından müşterinin IBAN adresine resmi olarak transfer edilir.`,
        highlights: [
          'Mutlaka seçilmesi gereken hesap: T. İŞ BANKASI — GÜNEŞLİ ÇARŞI ŞUBESİ (HESAP NO: 38702).',
          'Farklı bir hesap seçilmesi cari mutabakatı bozduğu için kesinlikle yasaktır.',
          'Müşteri IBAN bilgisi ve isim soyisim uyumu müşteriden iki kez teyit edilmelidir.'
        ],
        criticalNotes: [
          'ÖNEMLİ KONTROL KURALI: Müşteri IBAN bilgisinin ve isim-soyisim uyumunun müşteriden teyit edilmesi mağaza sorumluluğundadır. Yanlış hesap veya hatalı şube (38702 dışı) seçimi sonucu oluşacak gecikmeler müşteri memnuniyetsizliğine yol açacağından, bu protokole aykırı işlemler denetim kapsamında değerlendirilecektir.'
        ]
      }
    ],
    officialNotice: {
      officialTemplate: {
        title: 'Zorunlu IBAN İade E-Posta Bildirim Şablonu',
        to: 'merve.bicer@esme.com.tr',
        cc: 'fatma.kuruca@esme.com.tr, furkan.samanoglu@esme.com.tr',
        subject: '[Müşteri Adı Soyadı] — IBAN İade Talebi / [İşlem No]',
        body: 'Sayın Merve Hanım,\n\nAşağıda detayları belirtilen müşterimizin iade işlemi gerçekleştirilmiş olup sistem üzerinden T. İş Bankası Güneşli Çarşı Şubesi (38702 Hesap) seçilmiştir. İlgili tutarın müşteri IBAN numarasına aktarılmasını rica ederiz:\n\n• Müşteri Adı - Soyadı: [Müşteri Adı Soyadı]\n• İptal / İade Tarihi: [GG.AA.YYYY]\n• İptal / İade Tutarı: [0.000,00 TL]\n• Müşteri IBAN Numarası: TR__ ____ ____ ____ ____ ____ __\n• Banka & Hesap Sahibi: [Banka Adı - Hesap Sahibi Adı]'
      }
    },
    quiz: [
      {
        id: 'qbnk1',
        question: 'Havale/EFT iade işlemi yapılırken sistemden seçilmesi ZORUNLU olan banka ve şube hangisidir?',
        options: [
          'Ziraat Bankası Kadıköy Şubesi',
          'T. İş Bankası — Güneşli Çarşı Şubesi (Hesap No: 38702)',
          'Garanti Bankası Merkez Şube',
          'Herhangi bir şube fark etmez'
        ],
        correctOptionIndex: 1,
        explanation: 'Farklı bir banka/şube seçilmesi cari mutabakatı bozar; sadece T. İş Bankası Güneşli Çarşı (38702) seçilmelidir.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'bi-05-kasa-eksik-fazla',
    title: 'Kasa Eksik ve Fazla Para Yönetim Talimatnamesi',
    subTitle: 'Gün Sonu Kasa Mutabakatı, Bildirim Esasları ve Müdahale Protokolü',
    category: 'bilgi-islem',
    docNo: 'TLM-KSA-2026/09',
    scope: 'Tüm Mağaza Kasaları & Kasiyerler',
    targetUnit: 'Mali Denetim & Kasa Disiplini',
    authorOrManager: 'Turgut CESUR (B.İ. ve Kasa Müdürü)',
    priority: 'kritik',
    iconName: 'Coins',
    badgeText: 'Kasa Disiplini',
    summary: 'Kasada fazla para çıkması kazanç değildir; fiili nakit sayımı, fazlanın tamamının bankaya yatırılması ve aynı gün bildirim protokolü.',
    pdfPath: '/assets/aistudio/Kasa_Eksik_ve_Fazla_Para_Y_netim_Talimatnamesi_47fed698.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    videoTitle: 'Kasa Mutabakatı ve Fark Yönetimi Eğitimi',
    videoDuration: '05:40',
    chapters: [
      {
        id: 'ks1',
        title: 'Temel Kasa İlkesi ve 4 Aşamalı İşlem Protokolü',
        content: `TEMEL KASA İLKESİ (MUTLAKA BİLİNECEKTİR): Kasada fazla para çıkması bir kazanç veya harcanabilir serbest bir tutar kesinlikle değildir. Kasa fazlası; müşteriye eksik para üstü verilmesi veya faturasız/hatalı tahsilat yapılması gibi kasiyerin şahsen yaptığı operasyonel bir hatanın göstergesidir. Fazla paraya el koymak, kasada tutmak veya harcamak doğrudan görevi kötüye kullanma suçudur.\n\n### KASA FARKLARINDA UYGULANACAK 4 AŞAMALI İŞLEM PROTOKOLÜ:\n\n1. **Fiili Nakit Sayımı ve Gerçek Tutara Göre Kasa Kapatma:** Gün sonu alındığında kasada sistem tutarından farklı olarak fazla ya da eksik nakit tespit edilirse; kasa gün sonu kesinlikle yapay olarak eşitlenmeyecek, çekmecede fiilen sayılan fiziki nakit tutarına göre kapatılacaktır.\n\n2. **Kasa Fazlasının Bankaya Eksiksiz Yatırılması:** Kasada fazla çıkan tutar ayrılmadan, kasada saklanmadan veya harcanmadan o günkü hasılat ile birlikte bankaya tam ve eksiksiz olarak fazla yatırılacaktır. Kasa çekmecesinde kayıt dışı 1 TL dahi bırakılamaz.\n\n3. **Aynı Gün Resmi E-Posta ile Bilgilendirme Zorunluluğu:** Kasa mutabakat farkı oluştuğu gün; eksik veya fazla çıkan tutar, işlem tarihi, ilgili kasa ve tespit edilen olası gerekçeler gecikmeksizin Muhasebe birimine ve Bilgi İşlem Müdürü Turgut Cesur'a e-posta ile bildirilmelidir.\n\n4. **Sonraki Günlerde Müşteri Tespiti ve İade/Düzeltme Müdahalesi:** İlerleyen günlerde fazla paranın hangi müşteriye ait olduğu tespit edilirse veya müşteri itirazda bulunursa; mağaza kendi başına parayı iade edemez. Derhal Muhasebe ve Bilgi İşlem birimine bilgi verilecek; resmi kayıtlar kontrol edilerek merkez kontrolünde işleme müdahale edilecektir.`,
        highlights: [
          'Kasa fazlası kazanç değildir; operasyonel hatadır.',
          'Kasa kesinlikle yapay olarak eşitlenemez; fiili tutarla kapatılır.',
          'Fazla çıkan nakit eksiksiz olarak o günkü bankaya yatırılır (Kasada 1 TL dahi bırakılamaz).',
          'Aynı gün Muhasebe ve Turgut Cesur\'a e-posta bildirilmesi şarttır.'
        ],
        tableData: {
          headers: ['Durum', 'Kasa Kapatma Kuralı', 'Banka / Nakit Hareketi', 'Bildirim ve Takip'],
          rows: [
            ['Kasa Fazlası', 'Fiili sayılan yüksek tutarla kapatılır', 'Tüm fazla tutar bankaya yatırılır (Kasada tutulamaz)', 'Muhasebe + Turgut Bey\'e mail; müşteri çıkarsa düzeltilir'],
            ['Kasa Eksiği', 'Fiili sayılan eksik tutarla kapatılır', 'Fiziki açık gizlenemez, şahsi kaynakla kapatılamaz', 'Aynı gün detaylı savunma/gerekçe ile mail atılır']
          ]
        }
      }
    ],
    officialNotice: {
      officialTemplate: {
        title: 'Zorunlu Kasa Farkı Bildirim Şablonu (Aynı Gün Şarttır)',
        to: 'turgut.cesur@esme.com.tr',
        cc: 'muhasebe@esme.com.tr',
        subject: '[MAĞAZA ADI] — Kasa [Fazlası / Eksiği] Bildirimi — [Tarih]',
        body: 'Sayın İlgililer,\n\n[Mağaza Adı] kasamızda [GG.AA.YYYY] gün sonu sayımında sistem ile fiili kasa arasında fark tespit edilmiştir:\n\n• Fark Türü & Net Tutar: [Kasa Fazlası / Kasa Eksiği] — [......,00 TL]\n• Bankaya Yatırılan Tutar: [Fazla tutar dahil bankaya yatırılan net miktar]\n• Tespit Edilen / Olası Gerekçe: [Hatalı para üstü, mükerrer tahsilat vb. detaylı açıklama]'
      },
      disciplinaryActions: [
        'Kasa farklarının bildirilmemesi ağır disiplin suçu sayılır.',
        'Kasa fazlasının personele veya mağazaya mal edilmesi hırsızlık/görevi kötüye kullanma kapsamında iş akdi feshine tabidir.'
      ]
    },
    quiz: [
      {
        id: 'qks1',
        question: 'Gün sonu sayımında kasada sistemden 250 TL fazla nakit çıkarsa yapılması gereken doğru işlem nedir?',
        options: [
          '250 TL çekmecede bırakılır, ertesi gün eksik çıkarsa kullanılır.',
          'Kasa fiili yüksek tutarla kapatılır, 250 TL hasılatla birlikte bankaya tam yatırılır ve Turgut Bey\'e aynı gün mail atılır.',
          '250 TL mağaza personeli arasında paylaştırılır.',
          'Sistem rakamıyla uydurulsun diye kayıt silinir.'
        ],
        correctOptionIndex: 1,
        explanation: 'Kasa fazlası ayrılmadan bankaya yatırılır, fiili sayımla kapatılır ve aynı gün Turgut Cesur\'a e-posta atılır.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'bi-06-odeme-duzeltme',
    title: 'Ödeme Düzeltme ve Hatalı Taksit İptal Talimatnamesi',
    subTitle: 'Hatalı Taksit Düşümleri, İptal Protokolü ve Üçlü İmza Standardı',
    category: 'bilgi-islem',
    docNo: 'TLM-KSA-2026/08',
    scope: 'Kasa & Bilgi İşlem Personeli',
    targetUnit: 'Bilgi İşlem ve Kasa Yönetimi Koordinatörlüğü',
    authorOrManager: 'Turgut CESUR (B.İ. ve Kasa Müdürü)',
    priority: 'zorunlu',
    iconName: 'FileSignature',
    badgeText: '3\'lü Islak İmza Şartı',
    summary: 'Hatalı taksit tahsilatlarının düzeltilmesinde A4 el yazısı dilekçe, 3\'lü ıslak imza zinciri ve kırmızı "İPTAL" kaşesi zorunluluğu.',
    pdfPath: '/assets/aistudio/_deme_D_zeltme_ve_Hatal__Taksit__ptal_Talimatnamesi_bc66aa27.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    videoTitle: 'Hatalı Taksit İptal ve El Yazısı Dilekçe Prosedürü',
    videoDuration: '07:15',
    chapters: [
      {
        id: 'od1',
        title: 'Taksit Düzeltme ve İptal Sürecinin 5 Temel Esası',
        content: `YÖNETİM UYARISI: Son dönemde kasa taksit tahsilatlarında yanlış müşteri veya hatalı hesaptan düşüm yapılarak iletilen düzeltme taleplerinde ciddi bir artış yaşanmaktadır. Parasal işlemler şirketimizin en hassas operasyonu olup kuralların dışına çıkılması kesinlikle kabul edilemez.\n\n### 5 TEMEL ESAS:\n\n1. **El Yazısı ile Düzenleme Zorunluluğu:** Ödeme düzeltme talep dilekçesi bilgisayar çıktısı veya sözlü mesaj olarak değil, personelin kendi el yazısı ile okunaklı bir şekilde A4 formuna yazılacaktır. Standart dışı e-postalar doğrudan reddedilecektir.\n\n2. **Ayrıntılı Hata Gerekçesinin Yazılması:** Paranın neden yanlış hesaba işlendiği açık ve şüpheye yer bırakmayacak biçimde açıklanmalıdır. (Örn: Müşterinin kendi hesabına 500 TL yatıracakken eşinin hesabına yatıracağı 2.000 TL ile birlikte toplam 2.500 TL'nin tek hesaptan sehven düşülmesi vb.)\n\n3. **3'lü Islak İmza Şartı (Eksiksiz Onay Zinciri):** Düzeltme evrakı üzerinde istisnasız olarak 3 tarafın isim, soyisim ve ıslak imzası yer alacaktır:\n   1. Bilgi İşlem / Kasa Personeli\n   2. Ödeyen Müşteri\n   3. Mağaza Müdürü\n   *İmzası eksik formlar sisteme alınmaz.*\n\n4. **Hatalı Makbuzun Müşteriden Alınması ve İptal Kaşesi:** Hatalı kesilen tahsilat makbuzu kesinlikle müşteriye teslim edilmeyecektir. Evrak mağazada alıkonulacak, üzerine kırmızı kalemle veya kaşeyle büyük harflerle "İPTAL" yazılacak ve form ekine eklenecektir.\n\n5. **Evrak Üzerinde Tahrifat ve Oynama Kesin Yasağı:** İptal talep edilirken sistemden yeniden makbuz çıkartılması, rakamların karalanması veya evrak üzerinde silinti/düzeltme yapılması resmi evrakta tahrifat ve sahtecilik suçu teşkil eder. İstisnai hallerde doğrudan Turgut Bey aranmalıdır.`,
        highlights: [
          'Bilgisayar çıktısı veya WhatsApp ekranı kabul edilmez; A4 EL YAZISI şarttır.',
          '3\'lü Islak İmza: Kasiyer + Ödeyen Müşteri + Mağaza Müdürü.',
          'Hatalı makbuz müşteride kalamaz; kırmızı İPTAL çekilip forma eklenir.',
          'Evrak üzerinde karalama/silinti sahtecilik suçu sayılır.'
        ],
        tableData: {
          headers: ['Kontrol Noktası', 'Doğru Uygulama (Kabul Edilir)', 'Hatalı Uygulama (Doğrudan Red)'],
          rows: [
            ['Talep Formu Formatı', 'A4 kağıda okunaklı el yazısı ile yazılmış dilekçe', 'Word çıktısı, WhatsApp ekranı veya kuru e-posta'],
            ['İmza Protokolü', 'Personel + Müşteri + Mağaza Müdürü (3 imza)', 'Müdürsüz veya müşterisiz tek/çift imza'],
            ['Makbuz Durumu', 'Orijinal makbuz mağazada ve üzerine "İPTAL" çekilmiş', 'Makbuzun müşteriye verilmesi veya kayıp olması']
          ]
        }
      }
    ],
    officialNotice: {
      handwrittenSample: {
        title: 'Fatsa Mağazası Resmi Standart Örneği (El Yazısı Formu)',
        bodyText: "TURGUT BEY'İN DİKKATİNE\n\n1-4-....... NOLU TURGUT CESUR HESABINDAN 500 TL DÜŞÜLECEKKEN, MÜŞTERİNİN EŞİNİN HESABINA DA YATIRACAĞI PARA KENDİ HESABINDAN DÜŞÜLMÜŞTÜR.\n\n500 TL'Yİ DOĞRU HESAPTAN DÜŞEBİLMEM İÇİN 2.500 TL ÖDEMENİN GERİYE ÇEKİLMESİNİ RİCA EDERİM. 2.000 TL MÜŞTERİNİN EŞİ (1-4-.... NOLU) HESABINDAN DÜŞÜLECEKTİR.",
        signers: [
          { role: 'Bilgi İşlem / Kasa', name: 'Turgut C. (İsim - Kaşe - Islak İmza)' },
          { role: 'Ödeyen Müşteri', name: 'Müşteri Ad Soyad (Islak İmza Şarttır)' },
          { role: 'Mağaza Müdürü', name: 'Ömer C. (Onay Kaşe - İmza)' }
        ]
      },
      officialTemplate: {
        title: 'Ödeme Düzeltme E-Posta Şablonu',
        to: 'turgut.cesur@esme.com.tr',
        subject: 'ÖDEME DÜZELTME TALEBİ — [MAĞAZA ADI] — [MÜŞTERİ NO]',
        body: 'Sayın Turgut Bey,\n\n[Mağaza Adı] şubemizde gerçekleşen hatalı tahsilata ilişkin 3 ıslak imzalı el yazısı dilekçemiz ve üzerine İPTAL kaşesi vurulan orijinal tahsilat makbuzu ekte taranmış olarak bilgilerinize sunulmuştur.\n\nİlgili tutarın geriye çekilmesini rica ederiz.'
      }
    },
    quiz: [
      {
        id: 'qod1',
        question: 'Ödeme düzeltme dilekçesinde hangi 3 kişinin ıslak imzası bulunması zorunludur?',
        options: [
          'Sadece Kasiyer ve Mağaza Müdürü',
          'Bilgi İşlem/Kasa Personeli + Ödeyen Müşteri + Mağaza Müdürü',
          'Sadece Müşteri ve Bölge Müdürü',
          'Sadece Genel Müdürlük Muhasebe Yetkilisi'
        ],
        correctOptionIndex: 1,
        explanation: '3\'lü onay zinciri şarttır: Kasa Personeli, Ödeyen Müşteri ve Mağaza Müdürü ıslak imza atmak zorundadır.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'bi-07-resmi-evrak-tebligat',
    title: 'Resmi Evrak ve Tebligat Yönetim Talimatı',
    subTitle: 'İcra, Mahkeme, Kurum Yazıları ve Tebligat Bildirim Prosedürü',
    category: 'bilgi-islem',
    docNo: 'TLM-HK-2024/02',
    scope: 'Tüm Mağaza Müdürleri & Personel',
    targetUnit: 'Hukuk Müşavirliği & Mağaza Operasyonları',
    authorOrManager: 'Arife Hanım (Hukuk Müşavirliği)',
    priority: 'kritik',
    iconName: 'FileWarning',
    badgeText: 'Çok Acele / Gecikmesiz',
    summary: 'İcra, mahkeme ve kamu kurumlarından gelen tebligatlarda hak düşürücü yasal süreler ve aynı saat içerisinde Arife Hanım\'a iletim zorunluluğu.',
    pdfPath: '/assets/aistudio/Resmi_Evrak_ve_Tebligat_Y_netim_Talimat__d1a97de3.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    videoTitle: 'Hukuki Tebligat ve İcra Evrakları Yönetimi',
    videoDuration: '04:50',
    chapters: [
      {
        id: 'tb1',
        title: 'Yasal Uyarı, Kapsam ve 4 Adımlı Tebligat Protokolü',
        content: `YASAL UYARI VE KRİTİK HÜKÜM: Resmi kurumlardan, mahkemelerden veya icra dairelerinden gelen tebligatlarda cevap ve itiraz süreleri evrakın mağazaya tebliğ edildiği gün işlemeye başlar. Yasal sürelerin (çoğunlukla 7 gün) kaçırılması, şirketimizin haksız yere borçlu ve kusurlu duruma düşmesine, banka hesaplarına bloke konmasına ve doğrudan maddi zarara yol açmaktadır.\n\n### KAPSAMDAKİ EVRAKLAR:\nİcra Müdürlüğü Bildirimleri, Ödeme Emirleri (Örnek No: 7 vb.), Maaş Haciz Müzekkereleri, Mahkeme Tensip ve Dava Zabıtları, SGK / Vergi Dairesi Yazıları, Belediye ve Noter İhtarnameleri.\n\n### 4 ADIMLI PROTOKOL:\n\n1. **Tebellüğ ve Teslim Alma (Tarih ve Saat Tespiti):** PTT posta memuru, kargo yetkilisi veya resmi görevliden teslim alınan sarı/beyaz tebligat zarflarının üzerindeki teslim tarihi ve kaşesi kesinlikle yırtılmamalı veya silinmemelidir. Evrakın hangi gün ve saatte teslim alındığı hemen not edilmelidir.\n\n2. **Aynı Anda / Anında E-Posta ile İletim (Ertelenemez):** Evrak mağazaya ulaştığı aynı saat içerisinde derhal Arife Hanım'a e-posta yoluyla iletilmelidir. Evrak yüksek çözünürlüklü olarak taranmalı; tarama imkânı yoksa tüm sayfaları, barkodları ve tebliğ kaşesi net okunacak şekilde aydınlık bir ortamda fotoğraflanıp eklenmelidir.\n\n3. **İletim Teyidinin Alınması:** E-posta gönderildikten sonra evrakın Arife Hanım'a ulaştığı teyit edilmelidir. "Akşam toplu gönderirim" veya "Pazartesi günü bakarız" gibi yaklaşımlar kesinlikle yasaktır; evrakın mağazada bekletilmesi hiçbir gerekçeyle kabul edilemez.\n\n4. **Fiziki Orijinal Nüshanın Arşivlenmesi ve Kargolanması:** Taranan evrakın fiziki aslı zımbaları sökülmeden, tebligat zarfıyla birlikte koruyucu bir dosyaya konulmalı; kaybolmayacak şekilde Arife Hanım adına genel merkeze kargolanmalıdır.`,
        highlights: [
          'Tebligat itiraz süresi (çoğunlukla 7 gün) mağazaya ulaştığı gün başlar.',
          'Evrak mağazaya ulaştığı AYNI SAAT İÇERİSİNDE Arife Hanım\'a taranıp gönderilmelidir.',
          '"Akşam gönderirim" veya "Pazartesi bakarız" demek kesinlikle yasaktır.',
          'Tebligat zarfının teslim tarihi ve kaşesi kesinlikle yırtılmamalıdır.'
        ],
        criticalNotes: [
          'İDARİ VE HUKUKİ SORUMLULUK: Evrakın mağazada bekletilmesi veya geç iletilmesi nedeniyle yasal itiraz sürelerinin kaçırılması durumunda doğacak tüm maddi ve hukuki zararlardan, evrakı teslim alıp zamanında iletmeyen personel ve mağaza yöneticisi doğrudan sorumlu olacaktır.'
        ]
      }
    ],
    officialNotice: {
      officialTemplate: {
        title: 'Zorunlu Resmi Evrak Bildirim E-Posta Şablonu',
        to: 'arife.[soyad]@esme.com.tr',
        cc: 'İlgili Bölge Müdürü / Mağaza Müdürü',
        subject: 'ACİL — [Mağaza Adı] — Resmi Evrak / İcra Tebligatı — [Tarih]',
        body: 'Sayın Arife Hanım,\n\nMağazamıza [GG.AA.YYYY] tarihinde teslim edilen resmi tebligat taranarak ekte sunulmuştur. Yasal sürelerin takibi için bilgilerinize arz ederiz:\n\n• Tebliğ Eden Kurum: [Örn: İstanbul 12. İcra Dairesi / Tüketici Mahkemesi]\n• Evrak / Esas No: [Örn: 2024/.... Esas]\n• Tebellüğ Tarihi: [Bugünün Tarihi ve Saati]'
      }
    },
    quiz: [
      {
        id: 'qtb1',
        question: 'İcra veya mahkemeden gelen bir tebligat mağazaya ulaştığında personele tanınan bildirim süresi nedir?',
        options: [
          'Hafta sonu mesai bitimine kadar',
          'Aynı saat içerisinde derhal taranarak Arife Hanım\'a e-posta ile gönderilmelidir',
          '3 gün sonra kargo yapılır',
          'Pazartesi sabahı iletilir'
        ],
        correctOptionIndex: 1,
        explanation: 'Yasal itiraz sürelerinin kaçırılmaması için evrak mağazaya ulaştığı AYNI SAAT içerisinde taranıp iletilmelidir.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  // ==========================================
  // DEPOCU EĞİTİM KATEGORİSİ
  // ==========================================
  {
    id: 'dp-01-imei-envanter',
    title: 'İMEİ\'li Cep Telefonu Envanteri Dökme Eğitim Kılavuzu',
    subTitle: 'ERP Sistemi Üzerinden Seri No (IMEI) Bazlı Envanter Döküm Prosedürü',
    category: 'bilgi-islem',
    docNo: 'EGT-BT-2025/01 (SOP-BT-08)',
    scope: 'Tüm Mağaza Ekipleri, Kasa ve Depo',
    targetUnit: 'Bilgi İşlem ve Depo Yönetimi',
    authorOrManager: 'Turgut CESUR (BT & Kasa Müdürü)',
    priority: 'zorunlu',
    iconName: 'Smartphone',
    badgeText: 'IMEI Envanter Dökümü',
    summary: 'Mağazalarımızdaki IMEI kayıtlı cep telefonlarının fiziki stok kontrolleri ve periyodik sayımları için ERP üzerinden hatasız 4 adımlı rapor dökümü.',
    pdfPath: '/assets/aistudio/_meili_Cep_Telefonu_Envanteri_D_kme_E_itim_K_lavuzu_c25e3b44.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=M576WGiDBdQ',
    videoTitle: 'ERP Üzerinden IMEI Bazlı Telefon Sayım ve Envanter Eğitimi',
    videoDuration: '06:10',
    chapters: [
      {
        id: 'imei1',
        title: 'Adım 1 ve 2: Rapor Menüsü ve Filtre Kriterlerinin Tanımlanması',
        content: `EĞİTİMİN AMACI: Mağazalarımızda bulunan IMEI kayıtlı cep telefonlarının fiziki stok kontrolleri ve periyodik sayımları için sistem üzerinden doğru parametrelerle filtreleme yapılması ve standart envanter listesinin hatasız dökülmesi amaçlanmaktadır.\n\n### 1. Rapor Menüsü ve Filtre Tipinin Seçimi:\nERP yazılımı ana ekranında aşağıdaki menü yolu izlenerek ilgili rapor ekranına erişilir:\n**Depo Yönetimi > Raporlar > Ürün Envanter Raporu**\nAçılan pencerenin en üst kısmında yer alan "Filtreler" açılır kutusundan mutlaka **"Seri Numarası Bazında"** seçeneği işaretlenmelidir.\n\n### 2. Filtre Kriterlerinin Eksiksiz Tanımlanması:\nHatalı veya eksik veri dökülmesini engellemek için filtre alanları aşağıdaki tablodaki değerlerle birebir eşleştirilmelidir:`,
        highlights: [
          'Menü Yolu: Depo Yönetimi > Raporlar > Ürün Envanter Raporu.',
          'Filtreler tipi: Seri Numarası Bazında.',
          'Kategori Eşit: 24 CEP TELEFONU.'
        ],
        tableData: {
          headers: ['Filtre Alanı', 'Seçilecek Değer', 'Açıklama / Durum'],
          rows: [
            ['[Envanter Tarihi]', 'Bugün', 'İşlem yapılan günün tarihi'],
            ['[Renk Detaylı Listelensin]', 'Eşit: Evet', 'Varyant detayı için zorunlu'],
            ['[Boyut Detaylı Listelensin]', 'Eşit: Evet', 'Hafıza / Kapasite detayı'],
            ['[Onaylanmamış Transfer Adetleri ...]', 'Eşit: Hayır', 'Yoldaki ürünleri hariç tutar'],
            ['[Depo Detaylı Listelensin]', 'Eşit: Evet', 'Mağaza içi lokasyon ayrımı'],
            ['[Ürün Seri Numarası Detaylı ...]', 'Eşit: Evet', 'IMEI dökümü için kritiktir'],
            ['[Ek Filtreler] -> [Kategori] Eşit', '24 CEP TELEFONU', 'Yalnızca telefonları listeler']
          ]
        }
      },
      {
        id: 'imei2',
        title: 'Adım 3 ve 4: Grid Özelleştirme, Fiziki Stok Filtresi (Envanter=1) ve Çıktı',
        content: `### 3. Grid (Tablo) Görünümünü Özelleştirme:\nRapor listelendikten sonra tablo üzerinde sağ tıklanarak veya üst menüdeki dişli çark simgesinden "Gridi Özelleştir" penceresi açılır. Listenin sade ve okunabilir olması için yalnızca aşağıdaki 5 kutucuk işaretlenir:\n- [x] Depo Adı\n- [x] Ürün Kodu\n- [x] Ürün Adı\n- [x] Seri Numarası (IMEI)\n- [x] Envanter (Adet)\n*(Diğerleri: İşaretsiz bırakılır).*\nİşaretleme tamamlandıktan sonra "Gridi Aktar / Kaydet" yapılarak ekran görünümü sabitlenir.\n\n### 4. Fiziki Stok Filtresi (Envanter = 1) ve Yazdırma:\nEkrana gelen tabloda geçmişte satılmış (stoku 0 olan) seri numaraları da listelenebilir. Sadece fiilen mağazada bulunan cihazları dökmek için:\n1. Envanter sütun başlığının sağ üst köşesinde bulunan filtreleme simgesine (huni ikonuna) tıklayınız.\n2. Açılan filtre menüsünden sadece "1" yazan değeri seçiniz (0 değerinin işaretini kaldırınız).\n3. Bu işlemle birlikte ekranda sadece mevcut eldeki telefonlar ve onların IMEI numaraları kalacaktır.\n4. Sayfa önizlemesi yapılarak yatay/dikey sayfa ayarları kontrol edilir ve yazıcıdan çıktı alınır.\n\n**TEKNİK DESTEK VE YARDIM:** Uygulama esnasında sistemsel bir takılma veya hata yaşayan mağazalarımız kurumsal mesajlaşma Spark üzerinden **Tuğba Ekrem** ile irtibata geçebilir.`,
        highlights: [
          'Gridde sadece 5 kutucuk açık olmalı (Depo Adı, Ürün Kodu, Ürün Adı, Seri No IMEI, Envanter).',
          'Envanter sütununda huniye basılıp sadece 1 seçilmeli (0 olanlar gizlenmeli).',
          'Destek için Spark üzerinden Tuğba Ekrem.'
        ]
      }
    ],
    quiz: [
      {
        id: 'qimei1',
        question: 'IMEI dökümünde stoku 0 olan geçmiş cihazları listeden kaldırmak için hangi işlem yapılır?',
        options: [
          'Tek tek el ile satırlar silinir.',
          'Envanter sütunu başlığındaki huni simgesine tıklanıp yalnızca "1" değeri seçilir, "0" kaldırılır.',
          'Rapor kapatılıp yeniden açılır.',
          'Bilgisayar yeniden başlatılır.'
        ],
        correctOptionIndex: 1,
        explanation: 'Envanter başlığındaki huni filtresinden sadece 1 seçilerek fiilen eldeki cihazlar listelenir.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'dp-02-motor-satis-teslimat',
    title: 'Motor Satış, Faturalama ve Teslimat Süreci Yönergesi',
    subTitle: 'Motosiklet Satışı, İstihbarat, ÖTV, ARTES Noter Tescili ve Arşiv Prosedürü',
    category: 'bilgi-islem',
    docNo: 'SOP-MTR-2026/01',
    scope: 'Tüm Mağazalar, Satış, Kasa, Depo & Bİ',
    targetUnit: 'Motosiklet Operasyonları & Lojistik',
    authorOrManager: 'Aselin H. / Turgut B. / Metehan B.',
    priority: 'kritik',
    iconName: 'Bike',
    badgeText: 'Sıfır Tolerans & Çift Onay',
    summary: 'Motosiklet satışında şase-motor no formatı, Turgut B. ve Aselin H. zorunlu çift onayı, GİB e-Tebligat şartı ve plakasız teslimat yasağı.',
    pdfPath: '/assets/aistudio/Motor_Sat____Faturalama_ve_Teslimat_S_reci_Y_nergesi_bf7afb54.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    videoTitle: 'Motor Satış, Noter Tescil ve Depo Teslimat Standartları',
    videoDuration: '09:30',
    chapters: [
      {
        id: 'mtr1',
        title: 'Yönetim Talimatı ve Aşama I: Müşteri Kabul Standartları',
        content: `YÖNETİM TALİMATI & SIFIR TOLERANS: Motor satışları resmî tescil, vergi mevzuatı (ÖTV) ve Noter-ARTES entegrasyonu barındıran zincirleme bir operasyondur. Faturadaki tek bir harf veya rakam hatası dahi satışın iptaline, işlemlerin 2-3 saat kilitlenmesine ve müşteri mağduriyetine yol açmaktadır. "İzinliydim", "haberim yoktu" gibi mazeretler kabul edilmeyecek; kurallar harfiyen uygulanacaktır.\n\n### 1. Satış Öncesi ve Kredi İstihbarat Standartları:\n- **Fiyat Tipi ve Peşinat Kuralı:** Satışlar sistemde 22P AY fiyat tipinden açılacak; 1 Peşinat + Kalan Taksit şeklinde uygulanacaktır. Peşinatsız işlem kesinlikle açılamaz.\n- **Müşteri Profili ve Kefil Şartı:** İstihbarat süreci iPhone satış prosedürüyle benzerdir. Mevcut müşterilerimizde 2 yıllık aktif sorunsuz alışveriş geçmişi aranır. Yeni müşterilerde ise KEFİL alınması ZORUNLUDUR. Açık veya kapalı icrası olan müşteriye kesinlikle satış yapılamaz.\n- **KRİTİK ADIM — GİB E-TEBLİGAT ZORUNLULUĞU:** Müşteri adına ÖTV'nin şirketimiz tarafından ödenebilmesi için müşterinin e-Devlet kapısında e-Tebligat (GİB) butonunun AÇIK / AKTİF olması şarttır! Satış personeli sormuş olsa dahi, Kasa ve Bilgi İşlem personeli işlem girmeden önce müşteriye e-Tebligatının açık olduğunu bizzat sorup teyit etmekle yükümlüdür.\n- **Müşteri İletişim Dili ("Hemen Teslim" Kesin Yasağı):** Müşteriye kesinlikle "motoru hemen teslim alacaksınız" vaadinde bulunulamaz. Noter belgesinin merkezden geleceği, belge ulaştığında müşterinin aranıp mağazaya çağrılacağı açıkça anlatılacaktır.`,
        highlights: [
          'Fiyat tipi: 22P AY (1 Peşinat + Kalan Taksit). Peşinatsız satış açılamaz.',
          'Müşterinin e-Devlet GİB e-Tebligatı açık olmak ZORUNDADIR (Yoksa ÖTV ödenemez).',
          '"Hemen teslim alacaksınız" vaadi KESİNLİKLE YASAKTIR.',
          'İcrası olan müşteriye satış yapılamaz.'
        ]
      },
      {
        id: 'mtr2',
        title: 'Aşama II ve III: Çift Onaylı Fatura Protokolü ve Noter Süreci',
        content: `### 2. Sistem Girişi, Şase Numarası ve Çift Onaylı Faturalama Protokolü:\n- **Evrakta Tek Ürün Kuralı:** Satış evrakında ve faturada SADECE MOTOR yer almalıdır. Faturaya poşet, kask veya başka hiçbir yan ürün kesinlikle eklenemez.\n- **ist.esme.com.tr Şase / İmei Tanımlama:** İşlem girildikten sonra ist.esme.com.tr adresindeki "İmei Ekle" bölümüne Şase ve Motor Numarası tanımlanır. Volta markasında bilgiler uygunluk.volta.com.tr adresinden kopyala-yapıştır ile alınmalı; Sunny ve diğer markalarda ise fiziki karne üzerinden manuel girilerek iki kez kontrol edilmelidir.\n- **Format Standardı:** Fatura ve sözleşme açıklama alanına mutlaka ŞASE NO _ MOTOR NO formatında giriş yapılır. mor.exe açıldığında gözle teyit edilir.\n\n### ZORUNLU ÇİFT ONAY MEKANİZMASI (FATURA ÖNCESİ):\n1. Onay: Fatura kesilmeden önce **Turgut Bey** aranır; şase/motor no ve fatura alan doğruluğu onaylatılır.\n2. Onay: Ardından **Aselin Hanım** aranır; e-Tebligat ve ÖTV ödeme hazırlığı onaylatılır.\n*Bu iki onay eksiksiz alınmadan KESİNLİKLE fatura kesilmez.*\n\n- **Hafta Sonu Fatura Yasağı:** Faturanın kesildiği gün ÖTV maliyeye yatırıldığından; hafta sonları ve resmi tatillerde fatura kesilmez.\n\n### 3. ÖTV Süreci ve ARTES Noter İşlem Belgesi:\n- Aselin Hanım uygunluk belgesi ve ARTES Noter İşlem Belgesini iletir.\n- **3 İLA 5 GÜNLÜK HAK DÜŞÜRÜCÜ SÜRE:** Müşteri en geç 3 ila 5 iş günü içerisinde Notere giderek tescil yaptırmak zorundadır. Aksi halde sistem ceza kesmektedir. Müşteriye 2'şer nüsha fatura ve Noter İşlem Belgesi teslim edilir.`,
        criticalNotes: [
          'ZORUNLU ÇİFT ONAY: 1. Turgut Bey (Şase/fatura onayı) + 2. Aselin Hanım (ÖTV onayı). İki onay olmadan fatura kesen personel doğrudan sorumludur.'
        ]
      },
      {
        id: 'mtr3',
        title: 'Aşama IV ve V: Fiziki Teslimat ve Yasal 6 Evrak Arşivi',
        content: `### 4. Noter, Ruhsat, Plaka ve Fiziki Mağaza Teslimat Protokolü:\n- **Müşteri Resmi İşlem Adımları:** Müşteri kaşeli fatura ve Noter İşlem Belgesi ile Noter'e gider -> Ruhsatını çıkarır -> Şoförler Odası'ndan plakasını bastırır.\n- **KESİN TESLİMAT YASAĞI (RUHSATSIZ & PLAKASIZ ÇIKIŞ YOKTUR):** Ruhsatı çıkarılmamış ve plakası fiziki basılmamış HİÇBİR MOTOR müşteriye kesinlikle teslim edilemez. Plakasız motorun mağaza dışına çıkarılması kanunen suçtur.\n- **Birebir Şase Eşleşmesi ve Depo Teslimat Yasağı:** Satış işlemi teşhirdeki motorun şasesine göre yapılmıştır; depodan farklı motor verilemez. Depolar kesinlikle müşterinin adresine/evine teslimat yapamaz. Araç sadece mağazada, bizzat sözleşme sahibine kimlik teyidiyle teslim edilir.\n\n### 5. Zorunlu Arşivleme (Mağazada 6 Evrak Eksiksiz Yer Almalıdır):\n1. Kimlik Fotokopisi\n2. İmzalı & Kaşeli Fatura\n3. Uygunluk Belgesi Dökümü\n4. ÖTV Ödeme Belgesi\n5. İmzalı Noter Belgesi\n6. Ruhsat & Plaka Fotokopisi\n\nBu evraklar taranıp Müşteri Kartı > Dizin kısmına eklenir ve motorsatis@esme.com.tr adresine iletilir.`,
        highlights: [
          'RUHSATSIZ VE PLAKASIZ MOTOR MAĞAZA DIŞINA ÇIKARILAMAZ (Kanunen suçtur).',
          'Depodan müşterinin evine motor teslimatı kesinlikle yasaktır; teslimat sadece mağazada şahsa yapılır.',
          'Müşteri klasöründe 6 yasal evrak eksiksiz yer almalıdır.'
        ]
      }
    ],
    officialNotice: {
      officialTemplate: {
        title: 'Motor Bildirim E-Posta Şablonu',
        to: 'motorsatis@esme.com.tr',
        subject: '[MAĞAZA ADI] — Motor Satış ve Ruhsat Evrakları — [Şase No]',
        body: 'Sayın İlgililer,\n\n[Mağaza Adı] şubemizde satışı ve tescili tamamlanan araca ait 6 zorunlu evrak (Kimlik, Fatura, Uygunluk, ÖTV, Noter Belgesi, Ruhsat ve Plaka) taranmış olarak ekte sunulmuştur.\n\nŞase No: [ŞASE NO]\nMotor No: [MOTOR NO]\nMüşteri Ad Soyad: [Müşteri Adı]'
      }
    },
    quiz: [
      {
        id: 'qmtr1',
        question: 'Müşteriye satılan motosiklet hangi şart gerçekleşmeden mağaza dışına kesinlikle çıkarılamaz ve teslim edilemez?',
        options: [
          'Müşteri kaskını takmadan önce',
          'Noterden ruhsatı çıkarılıp Şoförler Odası\'ndan plakası fiziki basılıp takılmadan önce',
          'Müşteri ikinci taksiti ödemeden önce',
          'Benzin deposu doldurulmadan önce'
        ],
        correctOptionIndex: 1,
        explanation: 'Ruhsatı çıkarılmamış ve plakası fiziki takılmamış hiçbir motor mağaza dışına çıkarılamaz; kanunen suçtur.'
      },
      {
        id: 'qmtr2',
        question: 'Fatura kesilmeden önce alınması gereken ZORUNLU ÇİFT ONAY hangi kişilerden alınır?',
        options: [
          'Kasiyer ve Temizlik Görevlisi',
          '1. Onay: Turgut Bey (Şase/fatura onayı) - 2. Onay: Aselin Hanım (ÖTV onayı)',
          'Sadece Müşteri ve Kasiyer',
          'Noter Katibi ve Banka Müdürü'
        ],
        correctOptionIndex: 1,
        explanation: 'Fatura kesilmeden önce 1. Turgut Bey ve ardından 2. Aselin Hanım aranarak çift onay alınması zorunludur.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'dp-03-sunny-motor',
    title: 'Sunny Marka Motor Satışı ve Fatura Düzenleme Prosedürü',
    subTitle: 'Sunny Marka Süreç Değişiklikleri ve Volta Operasyonel Farkları',
    category: 'bilgi-islem',
    docNo: 'TLM-MTR-SUNNY-2026',
    scope: 'Tüm Mağazalar, Satış, Depo & Kasa Personeli',
    targetUnit: 'Satış & Mağaza Operasyonları Koordinatörlüğü',
    authorOrManager: 'Turgut CESUR & Motosiklet Operasyonları',
    priority: 'zorunlu',
    iconName: 'Wrench',
    badgeText: 'Fiziki Karne Yönetimi',
    summary: 'Sunny marka motorlarda online sistem olmaması nedeniyle fiziki karne yönetimi, manuel fatura girişi ve hafta sonu fatura kesim yasağı.',
    pdfPath: '/assets/aistudio/Sunny_Motor_Sat___ve_Fatura_S_re__Talimat__e151ec1e.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    videoTitle: 'Sunny Motosiklet Karne Kontrol ve Fatura Düzenleme',
    videoDuration: '05:35',
    chapters: [
      {
        id: 'sn1',
        title: 'Sunny vs Volta Operasyonel Farklar ve Karne Yönetimi',
        content: `Motosiklet satış portföyümüze Sunny markası dahil edilmiş olup, anlaşmalar tamamlanmıştır. Yeni ürünler mağazalarımıza sevk edilmektedir. Mevcut Volta süreçlerimizden önemli operasyonel farklılıklar bulunduğundan, satış ve tescil iptallerini önlemek amacıyla aşağıdaki kurallara harfiyen uyulması gerekmektedir.\n\n### İŞLEM KARŞILAŞTIRMA TABLOSU:\n- **Veri Doğrulama:** Volta'da web portalından (uygunluk.volta.com.tr) online kontrol yapılırken; Sunny'de **ONLINE SİSTEM YOKTUR**, fiziki karne üzerinden teyit edilir.\n- **Fatura Girişi:** Volta'da sistemden kopyala-yapıştır yapılırken; Sunny'de fatura paneline **manuel ve tek tek giriş zorunludur**.\n- **Karne / Belge Arşivi:** Volta'da dijital sorgulama belgeleri varken; Sunny'de **fiziki karne mağazada arşivlenir, müşteriye sadece fotokopisi verilir**.\n\n### 1. Motor / Şase No Kontrolleri ve Karne Yönetimi:\nSunny marka motorlar, üzerlerine iliştirilmiş Motor No ve Şase No bilgilerini içeren resmi karneleri (uygunluk belgeleri) ile teslim edilecektir. Dijital sistemden otomatik aktarım imkânı olmadığından, bu numaralar faturaya ilgili karneden bakılarak doğrudan manuel girilecektir.\n\n**Kritik Karne Kuralı:** Müşteri talep ederse faturasının yanına karnenin yalnızca fotokopisi çekilip verilebilir. Karnelerin orijinal ıslak nüshaları kesinlikle müşteriye verilmeyecek, mağaza arşivinde güvenle muhafaza edilecektir.`,
        highlights: [
          'Sunny için online sistem yoktur; teyit fiziki karne üzerinden yapılır.',
          'Şase ve motor numarası faturaya manuel ve tek tek girilmek zorundadır.',
          'Orijinal karne ASLA müşteriye verilmez; mağazada arşivlenir, müşteriye sadece fotokopi verilir.'
        ],
        tableData: {
          headers: ['İşlem Adımı', 'Volta Mevcut Uygulama', 'Sunny Yeni Uygulama'],
          rows: [
            ['Veri Doğrulama', 'Web portalından (uygunluk.volta.com.tr) online kontrol', 'Online sistem yoktur; fiziki karne üzerinden teyit edilir'],
            ['Fatura Girişi', 'Sistemden kopyala-yapıştır yöntemi', 'Fatura paneline manuel ve tek tek giriş zorunludur'],
            ['Karne / Belge Arşivi', 'Dijital sorgulama belgeleri', 'Fiziki karne mağazada arşivlenir, müşteriye fotokopisi verilir']
          ]
        }
      },
      {
        id: 'sn2',
        title: 'İki Aşamalı Onay ve Hafta Sonu Fatura Protokolü',
        content: `### 2. Fatura Öncesi İki Aşamalı Onay Mekanizması:\nFaturada bilgilerin doğru şablona işlenmesi ve yasal tescilin aksamaması adına iki ayrı kontrol noktası işletilecektir:\n- **Turgut Bey Kontrolü:** Bilgilerin faturadaki ilgili alanlara doğru yerleşip yerleşmediğini onaylar. (Numara karakter doğruluğunu denetlemez).\n- **Numara Karakter Teyidi:** Motor No ve Şase No bilgilerinin doğruluğu için fatura kesilmeden önce doğrudan operasyon sorumlusu / ilgili yetkili ile irtibata geçilip nihai teyit alınmalıdır.\n\n### 3. Hafta Sonu Satışlarında Fatura Kesim Protokolü:\nHafta sonu (Cumartesi-Pazar) gerçekleştirilen motor satışlarında veriler fatura ekranına taslak olarak işlenecek; fakat **fatura kesinleştirilmeyecektir**. Takip eden ilk iş günü mesai başlangıcında yapılacak kontrol ve onayın ardından resmi fatura kesim işlemi tamamlanacaktır.\n\n**DİKKAT:** Motor ve Şase numarasında yapılacak tek bir harf veya rakam hatası dahi noter tescilinin yapılamamasına, resmi satış iptaline ve ciddi operasyonel iş kaybına neden olmaktadır. Fatura oluşturmadan önce numaraları harf harf kontrol ediniz.`,
        criticalNotes: [
          'Hafta sonu yapılan satışlarda fatura KESİNLEŞTİRİLMEZ; taslak olarak işlenir, Pazartesi günü kontrol edilip kesilir.'
        ]
      }
    ],
    quiz: [
      {
        id: 'qsn1',
        question: 'Sunny marka motosikletlerin orijinal resmi karnesi (uygunluk belgesi) müşteriye teslim edilir mi?',
        options: [
          'Evet, orijinal karne müşteriye verilir.',
          'Hayır, orijinal ıslak nüsha mağazada arşivlenir, müşteriye yalnızca fotokopisi verilebilir.',
          'Karne çöpe atılır.',
          'Karne kargoyla fabrikaya geri gönderilir.'
        ],
        correctOptionIndex: 1,
        explanation: 'Karnelerin orijinal ıslak nüshaları kesinlikle müşteriye verilmez; mağazada arşivlenir, müşteriye sadece fotokopisi verilir.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  {
    id: 'dp-04-motor-istihbarat',
    title: 'Motor Satışı Kredi İstihbarat ve Risk Politikası Talimatı',
    subTitle: 'Senetli Motosiklet Satışlarında Müşteri Değerlendirme, Vade ve Teslimat Standartları',
    category: 'bilgi-islem',
    docNo: 'TLM-İST-2026/02',
    scope: 'Tüm Mağazalar, Kredi İstihbarat, Satış & Depo',
    targetUnit: 'Kredi İstihbarat & Risk Yönetimi Direktörlüğü',
    authorOrManager: 'Kredi İstihbarat & Risk Yönetimi',
    priority: 'kritik',
    iconName: 'UserCheck',
    badgeText: 'Risk Politikası',
    summary: '25 yaş şartı, en az 2 yıllık aktif Esme müşterisi olma veya kefil zorunluluğu, icra kaydı yasağı ve 12P Ay ödeme şablonu.',
    pdfPath: '/assets/aistudio/Motor_Sat____Kredi__stihbarat_ve_Teslimat_Talimatnamesi_6bd29342.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    videoTitle: 'Motor Satışı İstihbarat ve Risk Kriterleri',
    videoDuration: '04:45',
    chapters: [
      {
        id: 'ist1',
        title: '4 Ana Başlıkta Motor Satışı İstihbarat Standartları',
        content: `Motosiklet satışları yüksek finansal risk ve yasal tescil süreçleri barındırdığından, taksitli satış onayı verilmeden önce aşağıda belirlenen istihbarat ve operasyon kurallarına istisnasız uyulması zorunludur. Şartları karşılamayan müşterilere hiçbir surette onay verilemez ve inisiyatif kullanılamaz.\n\n### 4 ANA STANDART:\n\n1. **Müşteri Profili ve Geçmiş Şartı:**\n- Satışlar öncelikle mevcut Esme müşterilerine yapılacaktır.\n- Müşterinin şirketimiz nezdinde en az 2 yıllık aktif ve sorunsuz alışveriş geçmişi bulunmalıdır.\n- **Yeni Müşteriler:** Şirketimizde 2 yıllık kaydı olmayan yeni müşterilere satış yapılması halinde **mutlaka sağlam bir kefil** temin edilmelidir.\n\n2. **Yaş, Sigorta ve Gelir Doğrulaması:**\n- Müşteri kesinlikle **25 yaş ve üzerinde olmalıdır** (25 yaş altı kesinlikle işleme alınamaz).\n- Müşterinin SGK nezdinde aktif sigorta kaydı bulunmalıdır.\n- **Emekli Müşteriler:** Aktif çalışan olmayan emekli müşterilerden resmi onaylı Gelir Belgesi (Maaş Bordrosu / e-Devlet Aylık Dökümü) temin edilmesi zorunludur.\n\n3. **Hukuki Takip ve İcra Kaydı Kuralı:**\n- Müşterinin UYAP/KKB sorgulamalarında kesinlikle açık veya kapalı icra dosyası bulunmamalıdır.\n- Geçmişte ödenip kapatılmış dahi olsa sistemde görünen herhangi bir icra takibi dosyası doğrudan red gerekçesidir.\n\n4. **Fiyat Tipi, Peşinat ve Teslimat:**\n- Sistemden "12P Ay" fiyat tipi seçilerek 1 Peşin + 11 Ay Taksit şeklinde işlem girilecektir.\n- Peşinat: 1 TL dahi eksik olması halinde işlem kesinlikle açılamaz.\n- Teslimat Kuralı: Noter tescili yapılıp ruhsatı çıkarıldıktan ve plakası basıldıktan sonra araç sadece satın alan şahsın bizzat kendisine teslim edilir.`,
        highlights: [
          'Yaş sınırı: 25 yaş ve üzeri (< 25 yaş kesinlikle RED).',
          'Mevcut Esme müşterisinde 2 yıl sorunsuz geçmiş aranır; yeni müşteride KEFİL zorunludur.',
          'Açık veya kapalı icra kaydı olan müşteriye kesinlikle satış yapılamaz.',
          'Ödeme Şablonu: 12P Ay (1 Peşinat + 11 Taksit). Peşinat 1 TL dahi eksik olamaz.'
        ],
        tableData: {
          headers: ['Değerlendirme Kriteri', 'Gereken Standart / Belge', 'Durum / Karar', 'İstisna'],
          rows: [
            ['Müşteri Tipi', 'Mevcut Esme müşterisi (>= 2 Yıl aktif alışveriş)', 'Onay', 'Yeni ise Kefil Zorunlu'],
            ['Yaş Sınırı', '25 Yaş ve üzeri', 'Onay', '< 25 Yaş Kesin Red'],
            ['İcra Kaydı', 'Açık veya kapalı hiçbir icra takibi olmamalı', 'Var İse Kesin Red', 'İstisnası Yoktur'],
            ['Çalışma / Gelir', 'Aktif SGK veya Emekli resmi Gelir Belgesi', 'Belge Zorunlu', 'Belgesiz Onaylanamaz'],
            ['Ödeme Şablonu', '12P Ay (1 Peşin + 11 Taksit) — Tam Peşinat', 'Onay', 'Eksik Peşinatta İşlem Yasak'],
            ['Araç Teslimatı', 'Noter ruhsatı + Plaka basımı sonrası şahsen teslim', 'Şahsa Bizzat', '3. Şahsa/Vekile Teslim Yasak']
          ]
        }
      }
    ],
    officialNotice: {
      disciplinaryActions: [
        'Noter devri ve tescil işlemleri tamamlanmadan veya plaka takılmadan müşteriye motor teslim edilmesi şirket kuralı ihlali olup ağır idari ve cezai sorumluluk doğurur.',
        'Teslimatlar yalnızca sözleşme sahibine kimlik teyidiyle mağazada yapılır.'
      ]
    },
    quiz: [
      {
        id: 'qist1',
        question: 'Senetli motor satışında müşterinin taşıması gereken asgari yaş sınırı nedir?',
        options: ['18 Yaş', '21 Yaş', '25 Yaş ve Üzeri', '30 Yaş'],
        correctOptionIndex: 2,
        explanation: 'Talimatname gereği müşteri kesinlikle 25 yaş ve üzerinde olmalıdır; 25 yaş altı kesinlikle işleme alınamaz.'
      },
      {
        id: 'qist2',
        question: 'Müşterinin geçmişte kalmış ve kapatılmış bir icra takibi dosyası varsa motor satışı yapılabilir mi?',
        options: [
          'Evet, kapatıldığı için onay verilir.',
          'Hayır, açık veya kapalı fark etmeksizin icra kaydı doğrudan kesin red gerekçesidir.',
          'Müdür inisiyatifi ile açılabilir.',
          'Peşinat iki katına çıkarılarak verilir.'
        ],
        correctOptionIndex: 1,
        explanation: 'Geçmişte ödenip kapatılmış dahi olsa sistemde görünen herhangi bir icra takibi dosyası doğrudan kesin red gerekçesidir.'
      }
    ],
    createdAt: '2026-10-21T00:00:00Z',
    updatedAt: '2026-10-21T00:00:00Z'
  },

  // ==========================================
  // DEPOCU EĞİTİM KATEGORİSİ - İNTERAKTİF SLAYT SUNUMU
  // ==========================================
  {
    id: 'dp-sunum-depo-gorev-tanimi',
    title: 'Depocu Eğitim ve Görev Tanımı Kitapçığı & İnteraktif Sunumu',
    subTitle: 'Ömer BAŞ & Turgut CESUR — Mağaza İçi Depocuların Görevleri, Sevkiyat, El Terminali ve Nebim ERP Süreçleri',
    category: 'depocu',
    docNo: 'SUNUM-DPO-2026/02',
    scope: 'Tüm Mağaza İçi Depocular, Reyon Sorumluları ve Sevkiyat Ekipleri',
    targetUnit: 'Depo ve Lojistik Yönetimi Koordinatörlüğü',
    authorOrManager: 'Ömer BAŞ • Turgut CESUR',
    priority: 'zorunlu',
    iconName: 'Presentation',
    badgeText: '📊 Slayt Sunumu',
    isPresentation: true,
    summary: 'Ömer BAŞ ve Turgut CESUR tarafından hazırlanan resmi Depocu Eğitim ve Görev Tanımı Kitapçığı interaktif sunumu: Temel depo ve envanter görevleri (1-5), kayıp önleme ve satış destek (6-9), operasyonel 10 altın kural, sevkiyat aracına ürün atama, DSIC el terminali 4 ekran adımı, Nebim V3 ERP ürün ekstresi kontrolü, sipariş girişi/mağazalar arası transfer ve cep telefonu teslimat kuralları.',
    pdfPath: '/assets/aistudio/ESME_Depocu_E_itim_ve_G_rev_Tan_m__Sunum_Kitap_____dcab1f65.pdf',
    videoType: 'link',
    videoUrl: 'https://www.youtube.com/watch?v=uelHwf8o7_U',
    videoTitle: 'Depocu Eğitim ve Görev Tanımı Kitapçığı Video Anlatımı',
    videoDuration: '10:15',
    slides: [
      {
        id: 1,
        title: 'Depocu Eğitim ve Görev Tanımı Kitapçığı',
        subTitle: 'Ömer BAŞ & Turgut CESUR • Mağaza İçi Depocuların Kurumsal Rolü ve Operasyonel Verimlilik',
        categoryBadge: 'Giriş & Kurumsal Rol',
        bullets: [
          'Mağaza içi depocuların temel görevi; mağazaların günlük operasyonel verimliliğini sağlamak, stok yönetimini düzgün yürütmek ve ürünlerin doğru şekilde yerleştirilmesini temin etmektir.',
          'Depo personeli, mağaza stok güvenliğinin, müşteri memnuniyetinin ve doğru teslimat zincirinin ilk ve en kritik halkasıdır.',
          'Tüm operasyonel süreçler Nebim V3 ERP yazılımı ve DSIC El Terminali barkod altyapısı ile tam entegre yürütülür.',
          'Hazırlayanlar: Ömer BAŞ (Genel Yönetici) • Turgut CESUR (B.İ. ve Kasa Müdürü).'
        ],
        keyTakeaway: 'Depocunun hatasız çalışması; mağazanın satış performansını, müşteri memnuniyetini ve envanter doğruluğunu doğrudan belirler.',
        notes: 'Bu interaktif sunum, ESME Kurumsal Eğitim Kitapçığı temel alınarak mağaza içi depocularımızın görev ve sorumluluklarını eksiksiz kavramaları amacıyla hazırlanmıştır.'
      },
      {
        id: 2,
        title: 'Bölüm 01: Temel Depo ve Envanter Görevleri (1 – 5)',
        subTitle: 'Stok Yönetimi, Sayım, Depolama, Düzenleme ve Sevkiyat Süreçleri',
        categoryBadge: 'Bölüm 01: Envanter Görevleri',
        bullets: [
          '1. Stok Yönetimi: Ürün Kabulü: Mağazaya gelen sevkiyatları kabul eder, doğru miktarda olup olmadığını kontrol eder, siparişlerle karşılaştırır ve kaydeder. Stok Girişi: Gelen ürünleri sisteme işleyerek barkodlarını okutur ve reyon sorumlularına teslimatını sağlar. Stok Çıkışı: Satışa sunulacak ürünlerin depodan mağazaya sevkini ve stok çıkışlarını kontrol ederek mağaza stoklarına girişini sağlar.',
          '2. Stok Sayımı ve Envanter Kontrolü: Periyodik Stok Sayımları: Fiziksel envanter ile dijital envanter arasındaki farkları tespit etmek için belirli aralıklarla yapılan sayımlara katılır. Stok Farkları Tespiti: Eksik veya fazla stok tespit edilirse sebeplerini araştırır ve üst birime raporlar. Envanter Güncelleme: Değişiklikleri ve kayıpları raporlar.',
          '3. Ürün Depolama ve Düzenleme: Ürün Yerleştirme: Gelen yeni ürünleri düzenli şekilde reyon sorumlusu ile birlikte depoya yerleştirir ve raflardaki yerlerini planlar. Raf Düzeni: Kategorilere göre sıralanmasını ve satışa sunulacak ürünlerin uygun düzenlenmesini sağlar.',
          '4. Sevkiyat ve İade İşlemleri: Sevkiyat Hazırlığı: Başka şubelere veya müşterilere yapılacak sevkiyatlar için ürünleri hazırlar, doğru çıkışlarını sağlar. Ürün Transferleri: Mağaza içi farklı depolara veya mağazalara transferlerin düzgün ve hatasız yapılmasını sağlar.'
        ],
        tableData: {
          headers: ['Görev Alanı', 'Uygulama Standartları', 'Sorumluluk Detayları'],
          rows: [
            ['1. Stok Yönetimi', 'Ürün Kabulü, Stok Girişi, Stok Çıkışı', 'Miktar kontrolü, barkod okutma, reyon teslimi'],
            ['2. Stok Sayımı', 'Periyodik Sayım, Fark Tespiti, Güncelleme', 'Fiziki-dijital fark araştırması, üst birime raporlama'],
            ['3. Depolama & Düzen', 'Ürün Yerleştirme & Raf Düzeni', 'Reyon sorumlusu ile koordineli kategori planlaması'],
            ['4. Sevkiyat & İade', 'Sevkiyat Hazırlığı & Mağaza Transferi', 'Şube ve müşteri çıkışlarının hatasız ve sayılı yapılması']
          ]
        },
        keyTakeaway: 'Depoya giren ve depodan çıkan her bir ürün mutlaka evraklı, barkodlu ve sayılı olmalıdır.'
      },
      {
        id: 3,
        title: 'Bölüm 02: Kayıp Önleme, Planlama ve Satış Destek (6 – 9)',
        subTitle: 'Kayıp Tespiti, İleriye Dönük İhtiyaçlar, Raporlama ve Satış Desteği',
        categoryBadge: 'Bölüm 02: Kayıp Önleme',
        bullets: [
          '6. Stok Kayıplarının Tespiti ve Önlenmesi: Kayıp Ürünler: Reyon sorumlusu ile birlikte kaybolan veya zarar gören ürünleri tespit eder; sebeplerini (hırsızlık, yanlış yerleştirme, yanlış giriş vb.) araştırır ve raporlar. Envanter Güvenliği: Depo güvenliğini sağlar, stok kayıplarını engellemek için önlem alır ve alanı düzenli gözden geçirir.',
          '7. İleriye Dönük Stok İhtiyaçlarının Belirlenmesi: Stok Seviyesi Takibi: Satış sorumlusu ile istişareli şekilde satış hızına göre tükenmek üzere olan ürünleri takip eder, yeniden sipariş için yöneticilere bilgi verir. İhtiyaç Analizi: Popüler ürünlerin stoklarını izler ve düşük stok seviyeleri konusunda yönetime önerilerde bulunur.',
          '8. Raporlama ve Veri Girişi: Sayım Farkları Raporu: Sayımlar sonrasında fiziksel stok ile dijital envanter arasındaki farkları kontrol ederek envanter yönetiminde iyileştirme yapılması için raporlar.',
          '9. Müşteri ve Satış Destek İşlemleri: Müşteri Destek: Müşteriye satılan ürünün mağaza stoklarından düşülmesi için çıkışlarını sağlar. Satış Ekibine Yardım: Eksik/tükenmiş ürünlerin temininde ve zamanında depodan tesliminde destek sağlar. Acil Durum Planları: Tüm ürünlerin düzenli yerleştirilmesi ile acil durumlar için hızlı müdahale imkanı yaratır.'
        ],
        alertBox: {
          type: 'danger',
          title: 'KRİTİK OPERASYONEL KURAL — ARIZALI ÜRÜN KABULÜ',
          text: 'Ürün kabul sürecinde ürünlerde arıza tespit edilirse KESİNLİKLE sağlam satış reyonu stoğuna alınamaz! Derhal tutanak tanzim edilerek Arızalı/Hasarlı bölümüne ayrılır ve ilgili birimlere resmi bilgilendirme yapılır.'
        },
        keyTakeaway: 'Kayıpların önlenmesi; düzenli gözetim, sağlam tutanak disiplini ve satış ekibiyle anlık iletişim ile mümkündür.'
      },
      {
        id: 4,
        title: 'Bölüm 03: Operasyonel Altın Kurallar ve Evrak Takibi',
        subTitle: '10 Zorunlu Altın Kural: Arşivleme, SMS Onayı, Sayım ve Eksi Stok Yasağı',
        categoryBadge: 'Bölüm 03: 10 Altın Kural',
        bullets: [
          '• Evrak Takibi: Mağazaya gelen fatura, irsaliye ve transfer fişleri gibi önemli evrakların düzenli takibini yapmak.',
          '• Servis ve İade Koordinasyonu: Ürünlerin servis ve iade takibini reyon görevlisi ile birlikte koordineli şekilde sağlamak.',
          '• Evrak Arşivleme: Tüm depo ve sevkiyat evraklarının güvenli bir şekilde saklanmasını sağlamak.',
          '• Sayarak Teslim Alma: Firmalardan, depolardan ve mağazalardan gelen tüm ürünler, evrak ile karşılaştırılıp sayılarak teslim alınır.',
          '• Evraklı Giriş-Çıkış: Mağazalardan verilen ürünlerin de giriş ve çıkışları mutlaka evraklı ve sayılarak yapılmalıdır.',
          '• Hasarsız Paketleme: Teslimat için ürünler hazırlandığında sayılarak, paketli ve hasarsız şekilde teslim edilmelidir.',
          '• SMS Onayı ve İmza: Ürünleri mağazadan teslim ederken müşteriden mutlaka SMS onayı alınmalı; mağazaya gelen ürün ise sayılı kontrol edildikten sonra teslim alındığına dair imza alınmalıdır.',
          '• İmzalı Evrak Akışı: İrsaliye, fatura ve transfer fişleri gibi evraklar imzalı şekilde gönderilmeli, teslim alınmalı ve işlenip işlenmediği kontrol edilmelidir.',
          '• Kritik Ürün Sayımları: Reyon sorumluları ile istişareli olarak özellikle cep telefonu, bilgisayar ve beyaz eşya sayımları sık sık yapılarak ilgili birimlere imzalı gönderilmelidir.',
          '• Eksi Stok Yasağı: Mağaza envanteri aralıklı kontrol edilip eksi veren stoklar aynı anda düzelttirilmeli; stokta bulunmayan ürünlerin çıkışı kesinlikle yapılmamalıdır.'
        ],
        keyTakeaway: 'Evraksız tek bir koli depodan çıkamaz; eksiye düşen stok anında sıfır toleransla incelenir.'
      },
      {
        id: 5,
        title: 'Bölüm 04: Sevkiyat Aracına Ürün Atanması – Evrak ve Barkod Okutma',
        subTitle: 'Adım 1: ESME - Online Sevkiyat Listesi Sözleşme Barkodunun Okutulması',
        categoryBadge: 'Bölüm 04: Araç Atama',
        bullets: [
          'Adım 1 – Evrak Barkodunun Okutulması: Sevkiyat için merkez depolardan yapılan sevkiyat planlamalarında, sevkiyatçının getirmiş olduğu ESME - Online Sevkiyat Listesi evrakının üst kısmında bulunan barkod el terminali aracılığı ile okutulur.',
          'Kullanıcı adı ve şifre girildikten sonra ilgili sevkiyatçı seçilir.',
          'Resmi Evrak Örneği: ESME - Online Sevkiyat Listesi (Görsel 1)',
          'El Terminali İle Okutulacak Sözleşme Barkodu: 1-RI-7-2187238',
          'Mağaza / Müşteri: Tokat Mağaza — GÜLER ÖĞMEN (1-4-280617) • Teslimat Notu: Sevk',
          'Müşteri Adres: MERKEZ (Tokat) EMİRSEYİT BELDESİ BOZATALAN MAH. ÇEŞME SK. NO: 19 İÇ KAPI NO: 1 MERKEZ / TOKAT',
          'Sözleşme No / Tarih: 1-RI-7-2187238 - 18/01/2025 (Online Kredi Birimi - Züleyha Arıcı Tarafından Kredi Verilmiştir)',
          'Ürünler: 250701ARN002 - ARNİCA ST90010 SİYAH 4 LÜ ÇEYİZ SETİ (1 Adet) & AR4087 - ARZUM AR4087 GIRGIR 2Sİ 1 ARADA SÜPÜRGE (1 Adet)'
        ],
        tableData: {
          headers: ['Stok Kodu', 'Stok Adı', 'Miktar', 'Mağaza Onayı'],
          rows: [
            ['250701ARN002', 'ARNİCA ST90010 SİYAH 4 LÜ ÇEYİZ SETİ', '1 Adet', '☑ Onaylandı'],
            ['AR4087', 'ARZUM AR4087 GIRGIR 2Sİ 1 ARADA GIRGIR SÜPÜRGE', '1 Adet', '☑ Onaylandı']
          ]
        },
        keyTakeaway: 'Sevkiyat listesi üzerindeki sözleşme barkodu okunmadan araca ürün yükleme işlemi başlatılamaz.'
      },
      {
        id: 6,
        title: 'Bölüm 04 (Devam): DSIC El Terminali Ekranları ve Müşteri Teslimatı',
        subTitle: '4 Terminal Ekranı, Sevkiyat Aracına Atama ve Mağazadan Müşteri Teslim Adımları',
        categoryBadge: 'DSIC El Terminali',
        bullets: [
          'DSIC El Terminali 4 Aşamalı Ekran Akışı:',
          '1. Araca Ürün Atama: Barkod (1-rI-7-2187238), Tarih (2025-01-18), Miktar (2.00), Tutar (14.070,00 TL), Müşteri: GÜLER ÖĞMEN, M.Kodu: 1-4-280617, Mağaza Kodu: 009. Teslimatçı seçilir ve İLERİ > butonuna tıklanır.',
          '2. Depo Ara (İlk Liste): Barkod [1] ekranında ürün listesi görülür (Arnica 4\'lü Set, Arzum Gırgır).',
          '3. Barkod Okutma (2/2): Barkod: 8692341911101 okutulur. Kutuların üzerindeki ulusal barkodlar tek tek okutulur; sayaç 2/2 olduğunda ONAYLA butonu ile devam edilir.',
          '4. Atama Onay Ekranı: "İŞLEMİ TAMAMLAMAK İSTEDİĞİNİZDEN EMİN MİSİNİZ? Tüm ürün barkodları okutulduktan sonra EVET ile atama tamamlanır." -> EVET tıklanır.',
          'B. Mağazadan Müşteri Teslimat Adımları (5 Adım):',
          '1. Mağaza Teslimatı Oluştur: Terminalden Mağaza Teslimatı Oluştur seçilir, ardından Teslimatçı seçilir. 2. Müşteri Seçimi: Müşteri seçildikten sonra İleri denilir. 3. SMS Onay Kodu: Müşteri cep telefonuna gönderilen onay kodu girilip Doğrula butonuna tıklanır. 4. Zorunlu IMEI Girişi: Cep telefonu teslimatlarında satılan ürünün IMEI numarasının yazılması zorunludur. 5. Barkod ve Onay: Ürün barkodları okutularak Onayla butonuna tıklanır.'
        ],
        alertBox: {
          type: 'warning',
          title: 'ÖNEMLİ KURAL — SEVKİYATÇI SEÇİMİ',
          text: 'Aynı işlemler mağazadan müşteriye teslimat yapılırken de uygulanmaktadır. İlk giriş yapılırken SEVKİYATÇI KİM İSE ONUN MUTLAKA DOĞRU ŞEKİLDE SEÇİLMESİ gerekmektedir.'
        },
        keyTakeaway: 'Terminal ekranında sayaç tamamlanmadan ve müşteriden SMS onay kodu alınmadan teslimat geçerli sayılamaz.'
      },
      {
        id: 7,
        title: 'Bölüm 05: Nebim ERP Üzerinden Stok Ekstresinin Kontrolü',
        subTitle: 'Nebim V3 Menü Arama, Zorunlu Filtreler ve Stok Hareketleri Envanter Ekranı',
        categoryBadge: 'Nebim V3 ERP',
        bullets: [
          '1. Nebim V3 Arama Ekranı (Görsel 6): Arama kutusuna "ürün ek" yazılır. Çıkan sonuçlardan MUTLAKA "Ürün Ekstresi (Miktarlı)" seçilmelidir.',
          '2. Ürün Ekstresi (Miktarlı) Filtreleri (Görsel 7): Zorunlu Filtreler: [Başlangıç Tarihi] Bu Ayın İlk Günü, [Bitiş Tarihi] Bugün. Ek Filtreler: [Ürün Kodu] Eşit "042-001-090" yazılır. Sonrasında "Çalıştır" butonuna tıklanır.',
          '3. Stok Hareketleri ve Güncel Envanter Ekranı (Görsel 8): Ürün Kodu: 042-001-090 • Ürün Adı: SARAR KABARTMALI BATTANİYE 4 KG.',
          'Hareketler Detayı: 01.02.2025 Devir: 809,00 Giren - 766,00 Çıkan = 43,00 Envanter. 01.02.2025 Çıkış (Adem Bayar Perakende Sonra Teslim): 1,00 Çıkan = 42,00 Envanter. 01.02.2025 Çıkış İade (Emine Demiray Taksitli Satış): -1,00 Çıkan = 42,00 Envanter. 03.02.2025 Giriş (Tokat Mağaza Mağazaya Transfer): 35,00 Giren = 77,00 Güncel Envanter.'
        ],
        tableData: {
          headers: ['İşlem Tarihi', 'Belge Ref', 'Hareket', 'Cari Hesap / Süreç Açıklaması', 'Giren', 'Çıkan', 'Envanter'],
          rows: [
            ['01.02.2025', '—', 'Devir', 'Dönem Başı Devir Bakiyesi', '809,00', '766,00', '43,00'],
            ['01.02.2025', '1-RSD-6-1273...', 'Çıkış', 'ADEM BAYAR (Perakende Sonra Teslim)', '0,00', '1,00', '42,00'],
            ['01.02.2025', '1-RI-7-2212506', 'Çıkış (İade ☑)', 'EMİNE DEMİRAY (Taksitli Satış İade)', '0,00', '-1,00', '42,00'],
            ['03.02.2025', '1-S-6-54748', 'Giriş', 'Tokat Mağaza (Mağazaya Transfer)', '35,00', '0,00', '77,00 (Güncel)']
          ]
        },
        keyTakeaway: 'Nebim ERP Ürün Ekstresi (Miktarlı), bir ürünün mağazaya giriş, çıkış, iade ve transfer geçmişinin resmi dijital kayıt tablosudur.'
      },
      {
        id: 8,
        title: 'Bölüm 06: Sipariş Girişi ve Mağazalar Arası Transfer',
        subTitle: 'Firmadan Gelen Siparişlerin Girişi ve ERP Üzerinden Diğer Mağazalara Transfer',
        categoryBadge: 'Bölüm 06: Sipariş & Transfer',
        bullets: [
          'A. Firmadan Gelen Siparişlerin Girişi (4 Adım):',
          '1. Gelen Fatura / İrsaliye kısmı seçilir.',
          '2. Gelen ekrana tedarikçi firma ismi yazılır, listeden Tedarikçi seçilir.',
          '3. Hangi sipariş fişinin girişi sağlanacaksa o Sipariş Fişi seçilir.',
          '4. Tarih seçildikten sonra girişi yapılacak ürünlerin barkodları okutulur, ardından Onayla butonu tıklanarak kayıt sağlanır.',
          'B. ERP Üzerinden Diğer Mağazalara Transfer (4 Adım):',
          '1. Gelen ekrandan Merkeze İade seçilir ve ilgili kısımlar doldurulur.',
          '2. Satırlar bölümü tıklanarak yan sayfaya geçilir; sağ tıklanarak Barkod kolonu aktif edilir ve gönderilecek ürün okutulur.',
          '3. Adet girilir, yan satırdaki Açıklama kısmına hangi mağazaya gönderilecekse yazılır ve üstten Kaydet denilir.',
          '4. Yazıcı işareti tıklanarak çıktı alınır (Teslim Eden & Teslim Alan İmzası Zorunludur).'
        ],
        tableData: {
          headers: ['Süreç Adımı', 'İşlem Türü', 'Zorunlu İşlem Standartı'],
          rows: [
            ['Tedarikçi Girişi', 'Fatura / İrsaliye', 'Tedarikçi ve sipariş fişi seçilerek kutu barkodları okutulur'],
            ['Transfer Başlatma', 'Merkeze İade / Transfer', 'Satırlar bölümünden Barkod kolonu aktif edilerek ürün taranır'],
            ['Hedef Belirleme', 'Adet & Açıklama', 'Gönderilecek mağaza adı yazılır ve Kaydet butonuna basılır'],
            ['Evrak Teslimi', 'Yazıcı Çıktısı', 'Teslim Eden ve Teslim Alan personelin ıslak imzası zorunludur']
          ]
        },
        keyTakeaway: 'Mağazalar arası transferlerde fiziki çıktısı alınıp iki taraflı ıslak imzalanmayan evraklar muhasebece işleme alınamaz.'
      },
      {
        id: 9,
        title: 'Bölüm 07: Mağazadan Teslim Edilecek Cep Telefonu Teslimat Kuralları',
        subTitle: 'Müşteri Bilgileri, Fiziksel Durum, Jelatin Kontrolü, IMEI, SMS Onay ve İade Yasağı',
        categoryBadge: 'Bölüm 07: Cep Telefonu',
        bullets: [
          '1. Müşteri Bilgilerinin Doğruluğu: A. Kimlik Doğrulama: Teslimat yapılmadan önce müşteri kimlik bilgileri (TC kimlik numarası, adres, telefon numarası, satılan ürünün doğruluğu vb.) mutlaka kontrol edilmelidir. B. Teslim Alan Kişinin Kimlik Bilgisi: Cep telefonunu teslim alacak kişinin kimlik bilgileri mağazada kaydedilmiş olmalıdır. Siparişi veren kişi değilse yetki verilmiş olması şarttır.',
          '2. Ürün ve Paket Kontrolü: A. Fiziksel Durum Kontrolü: Hasar görmediğinden emin olunmalıdır. B. Jelatin ve Ekran Kontrolü: Ürünün jelatini açılıp ekranı ve diğer özellikleri müşteri huzurunda kontrol edilmelidir. C. Aksesuar ve Belge Tamlığı: Şarj kablosu, garanti belgesi, fatura eksiksiz olmalıdır.',
          '3. Teslimat Prosedürü: A. Teslimat Onay SMS\'i ve IMEI: Müşteri teslimat aldıktan sonra terminal üzerinden müşteriden onay kodu alınarak teslimat sağlanmalıdır. Cihazın IMEI numarası mutlaka okutulmalıdır. B. Ürün Teslimi ve Müşteri Onayı: Müşteri teslim aldığı ürünü incelemeli ve onayını verdiğinde teslimat tamamlanmalıdır.',
          '4. İade, Değişim ve Servis Kuralları: A. İade Bilgilendirmesi: Teslim edilen cep telefonunun İADE SÜRECİNİN OLMADIĞI hakkında müşteri teslimat esnasında açıkça bilgilendirilmelidir. B. Servis Yönlendirmesi: Sorun durumunda yetkili servise yönlendirme sağlanmalıdır.'
        ],
        alertBox: {
          type: 'danger',
          title: 'CEP TELEFONUNDA İADE SÜRECİ YOKTUR',
          text: 'Müşteriye teslim edilen cep telefonunun İADE SÜRECİNİN OLMADIĞI teslimat esnasında açıkça bildirilmeli; jelatin müşteri huzurunda açılarak kontrol edilmeli ve IMEI terminale işlenmelidir.'
        },
        keyTakeaway: 'Jelatini müşteri huzurunda kontrol edilmeyen ve IMEI numarası terminale girilmeyen hiçbir telefon mağazadan çıkamaz.'
      },
      {
        id: 10,
        title: 'Bölüm 08: Genel Değerlendirme, Kurumsal Sistemler ve Tebellüğ Onayı',
        subTitle: 'Operasyonel Verimlilik ve Müşteri Memnuniyeti Güvencesi • Ömer BAŞ & Turgut CESUR',
        categoryBadge: 'Bölüm 08: Değerlendirme & Sonuç',
        bullets: [
          'Mağaza içi depocular, mağaza operasyonlarının düzgün ve verimli işlemesinde kritik bir rol oynar.',
          'Stok yönetimi, ürün düzeni, sevkiyat ve iade işlemleri gibi birçok sorumluluğa sahip olan depocular, envanterin doğru ve güncel tutulmasını sağlar.',
          'Bu görevleri eksiksiz yerine getirmeleri; mağazanın satış performansını, müşteri memnuniyetini ve genel operasyonel verimliliğini doğrudan artırır.',
          'Kurum: ESME Mağazacılık Operasyonları • Sistemler: Nebim V3 ERP • DSIC El Terminali.',
          'Hazırlayanlar: Ömer BAŞ (Genel Yönetici) • Turgut CESUR (B.İ. ve Kasa Müdürü).',
          'Tebellüğ: Tüm mağaza depocuları bu kitapçık ve sunumdaki tüm kuralları okuduğunu, anladığını ve harfiyen uygulayacağını dijital olarak tebellüğ eder.'
        ],
        tableData: {
          headers: ['Kurumsal Parametre', 'Sistem & Sorumlu', 'Operasyonel Güvence'],
          rows: [
            ['Kurum', 'ESME Mağazacılık Operasyonları', '35 Şube Tüm Depo & Reyon Standartları'],
            ['Sistem Altyapısı', 'Nebim V3 ERP & DSIC El Terminali', 'Barkodlu Mal Kabul, Kör Sayım & Miktarlı Ekstre'],
            ['Hazırlayanlar & Onay', 'Ömer BAŞ & Turgut CESUR', 'Genel Yönetim & Bilgi İşlem Koordinatörlüğü'],
            ['Tebellüğ Durumu', 'Zorunlu Resmi Taahhütname', 'En az %80 Başarı ile Dijital Sertifika Tescili']
          ]
        },
        keyTakeaway: 'Tebrikler! Depocu Eğitim ve Görev Tanımı sunumunu tamamladınız. Şimdi "Anlama Sınavı ve Tebellüğ" sekmesine geçerek başarı sınavını çözebilir ve resmi sertifikanızı alabilirsiniz.',
        notes: 'Bu eğitim dokümanı ESME Mağazacılık iç denetim ve teftiş standartları gereğince tüm mağaza personelleri için resmi ve bağlayıcıdır.'
      }
    ],
    chapters: [
      {
        id: 'dp-c1',
        title: 'Bölüm 01: Temel Depo ve Envanter Görevleri (1 – 5)',
        subTitle: 'Stok Yönetimi, Sayım, Depolama, Düzenleme ve Sevkiyat İşlemleri',
        content: `**1. Stok Yönetimi:**\n• Ürün Kabulü: Mağazaya gelen sevkiyatları kabul eder, doğru miktarda olup olmadığını kontrol eder, siparişlerle karşılaştırır ve kaydeder.\n• Stok Girişi: Gelen ürünleri sisteme işleyerek barkodlarını okutur ve reyon sorumlularına teslimatını sağlar.\n• Stok Çıkışı: Satışa sunulacak ürünlerin depodan mağazaya sevkini ve stok çıkışlarını kontrol ederek mağaza stoklarına girişini sağlar.\n\n**2. Stok Sayımı ve Envanter Kontrolü:**\n• Periyodik Stok Sayımları: Fiziksel envanter ile dijital envanter arasındaki farkları tespit etmek için belirli aralıklarla yapılan sayımlara katılır.\n• Stok Farkları Tespiti: Sayımlar sırasında eksik veya fazla stok tespit edilirse sebeplerini araştırır ve üst birime raporlar.\n• Envanter Güncelleme: Stok seviyelerindeki değişiklikleri ve kayıpları raporlar, doğru verilerin sistemde tutulmasına yardımcı olur.\n\n**3. Ürün Depolama ve Düzenleme:**\n• Ürün Yerleştirme: Mağazaya gelen yeni ürünleri düzenli şekilde reyon sorumlusu ile birlikte depoya yerleştirir ve raflardaki yerlerini planlar.\n• Raf Düzeni: Ürünlerin mağaza içinde kategorilere göre sıralanmasını ve satışa sunulacak ürünlerin uygun şekilde düzenlenmesini sağlar.\n\n**4. Sevkiyat ve İade İşlemleri:**\n• Sevkiyat Hazırlığı: Mağazadan başka şubelere veya müşterilere yapılacak sevkiyatlar için ürünleri hazırlar, doğru çıkışlarını sağlar.\n• Ürün Transferleri: Ürünlerin mağaza içinde farklı depolara ya da mağazalara transferlerinin düzgün ve hatasız yapılmasını sağlar.`,
        highlights: [
          'Depoya giren her ürün siparişle karşılaştırılır ve barkodu okutulur.',
          'Sayım farkları anında araştırılıp üst birime resmi raporlanır.',
          'Sevkiyat ve mağazalar arası transferler hatasız ve sayılı yapılır.'
        ]
      },
      {
        id: 'dp-c2',
        title: 'Bölüm 02: Kayıp Önleme, Planlama ve Satış Destek (6 – 9)',
        subTitle: 'Kayıp Tespiti, İhtiyaç Analizi, Raporlama ve Arızalı Ürün Kuralı',
        content: `**6. Stok Kayıplarının Tespiti ve Önlenmesi:**\n• Kayıp Ürünler: Reyon sorumlusu ile birlikte kaybolan veya zarar gören ürünleri tespit eder; sebeplerini (hırsızlık, yanlış yerleştirme, yanlış giriş vb.) araştırır ve raporlar.\n• Envanter Güvenliği: Depo güvenliğini sağlar, stok kayıplarını engellemek için önlem alır ve depo alanını düzenli gözden geçirir.\n\n**7. İleriye Dönük Stok İhtiyaçlarının Belirlenmesi:**\n• Stok Seviyesi Takibi: Satış sorumlusu ile istişareli şekilde satış hızına göre tükenmek üzere olan ürünleri takip eder, yeniden sipariş için yöneticilere bilgi verir.\n• İhtiyaç Analizi: Popüler ürünlerin stoklarını izler ve düşük stok seviyeleri konusunda yönetime önerilerde bulunur.\n\n**8. Raporlama ve Veri Girişi:**\n• Sayım Farkları Raporu: Sayımlar sonrasında fiziksel stok ile dijital envanter arasındaki farkları kontrol ederek envanter yönetiminde iyileştirme yapılması için raporlar.\n\n**9. Müşteri ve Satış Destek İşlemleri:**\n• Müşteri Destek: Talepler doğrultusunda müşteriye satılan ürünün mağaza stoklarından düşülmesi için çıkışlarını sağlar.\n• Satış Ekibine Yardım: Eksik/tükenmiş ürünlerin temininde ve ürünlerin zamanında depodan tesliminde destek sağlar.\n• Acil Durum Planları: Tüm ürünlerin düzenli yerleştirilmesi ile acil durumlar için hızlı müdahale imkanı yaratır.\n\n**KRİTİK OPERASYONEL KURAL — ARIZALI ÜRÜN KABULÜ:**\nÜrün kabul sürecinde ürünlerde arıza tespit edilirse KESİNLİKLE sağlam satış reyonu stoğuna alınamaz! Derhal tutanak tanzim edilerek Arızalı/Hasarlı bölümüne ayrılır ve ilgili birimlere resmi bilgilendirme yapılır.`,
        highlights: [
          'Arızalı ürünler sağlam stoğa asla katılamaz; tutanakla ayrılır.',
          'Tükenmek üzere olan ürünler satış sorumlusu ile izlenip yönetime bildirilir.',
          'Depo güvenliği ve düzenli denetim kayıpları engellemenin temelidir.'
        ]
      },
      {
        id: 'dp-c3',
        title: 'Bölüm 03: Operasyonel Altın Kurallar ve Evrak Takibi',
        subTitle: '10 Zorunlu Altın Kural: Arşivleme, SMS Onayı, Sayım ve Eksi Stok Yasağı',
        content: `**10 Operasyonel Altın Kural:**\n1. Evrak Takibi: Mağazaya gelen fatura, irsaliye ve transfer fişleri gibi önemli evrakların düzenli takibini yapmak.\n2. Servis ve İade Koordinasyonu: Ürünlerin servis ve iade takibini reyon görevlisi ile birlikte koordineli şekilde sağlamak.\n3. Evrak Arşivleme: Tüm depo ve sevkiyat evraklarının güvenli bir şekilde saklanmasını sağlamak.\n4. Sayarak Teslim Alma: Firmalardan, depolardan ve mağazalardan gelen tüm ürünler, evrak ile karşılaştırılıp sayılarak teslim alınır.\n5. Evraklı Giriş-Çıkış: Mağazalardan verilen ürünlerin de giriş ve çıkışları mutlaka evraklı ve sayılarak yapılmalıdır.\n6. Hasarsız Paketleme: Teslimat için ürünler hazırlandığında sayılarak, paketli ve hasarsız şekilde teslim edilmelidir.\n7. SMS Onayı ve İmza: Ürünleri mağazadan teslim ederken müşteriden mutlaka SMS onayı alınmalı; mağazaya gelen ürün ise sayılı kontrol edildikten sonra teslim alındığına dair imza alınmalıdır.\n8. İmzalı Evrak Akışı: İrsaliye, fatura ve transfer fişleri gibi evraklar imzalı şekilde gönderilmeli, teslim alınmalı ve işlenip işlenmediği kontrol edilmelidir.\n9. Kritik Ürün Sayımları: Reyon sorumluları ile istişareli olarak özellikle cep telefonu, bilgisayar ve beyaz eşya sayımları sık sık yapılarak ilgili birimlere imzalı gönderilmelidir.\n10. Eksi Stok Yasağı: Mağaza envanteri aralıklı kontrol edilip eksi veren stoklar aynı anda düzelttirilmeli; stokta bulunmayan ürünlerin çıkışı kesinlikle yapılmamalıdır.`,
        highlights: [
          'Sayarak teslim alma ve evraklı çıkış sıfır tolerans kuralıdır.',
          'Müşteriye teslimatta SMS onayı zorunludur.',
          'Stokta olmayan veya eksiye düşen ürünün çıkışı kesinlikle yasaktır.'
        ]
      },
      {
        id: 'dp-c4',
        title: 'Bölüm 04: Sevkiyat Aracına Ürün Atanması ve DSIC El Terminali',
        subTitle: 'Sözleşme Barkodu Okutma, 4 Terminal Ekranı ve Müşteri Teslimatı',
        content: `**Adım 1 – Evrak Barkodunun Okutulması:**\nSevkiyat için merkez depolardan yapılan sevkiyat planlamalarında, sevkiyatçının getirmiş olduğu ESME - Online Sevkiyat Listesi evrakının üst kısmında bulunan barkod el terminali aracılığı ile okutulur. Kullanıcı adı ve şifre girildikten sonra ilgili sevkiyatçı seçilir.\n\n**Örnek Sevkiyat Listesi Evrakı (Görsel 1):**\n• El Terminali İle Okutulacak Sözleşme Barkodu: 1-RI-7-2187238\n• Mağaza / Müşteri Adı: Tokat Mağaza — GÜLER ÖĞMEN (1-4-280617) • Teslimat Notu: Sevk\n• Müşteri Adres: MERKEZ (Tokat) EMİRSEYİT BELDESİ BOZATALAN MAH. ÇEŞME SK. NO: 19 İÇ KAPI NO: 1 MERKEZ / TOKAT\n• Sözleşme No / Tarih: 1-RI-7-2187238 - 18/01/2025 Online Kredi Birimi-Züleyha Arıcı Tarafından Kredi Verilmiştir.\n• Ürünler: ARNİCA ST90010 SİYAH 4 LÜ ÇEYİZ SETİ (1 Adet), ARZUM AR4087 GIRGIR 2Sİ 1 ARADA SÜPÜRGE (1 Adet)\n\n**DSIC El Terminali 4 Ekran Adımı:**\n1. Araca Ürün Atama: Barkod, Tarih, Miktar, Tutar ve Müşteri adı doğrulanır, Teslimatçı seçilip İLERİ denilir.\n2. Depo Ara (İlk Liste): Müşterinin ürünleri ekranda listelenir.\n3. Barkod Okutma (2/2): Kutu üzerindeki ulusal barkodlar (örn: 8692341911101) okutulur, sayaç dolunca ONAYLA tıklanır.\n4. Atama Onay Ekranı: "EVET" seçilerek atama tamamlanır.\n\n**B. Mağazadan Müşteri Teslimatı (5 Adım):**\n1. Mağaza Teslimatı Oluştur ve Teslimatçı seç. 2. Müşteri seç ve İleri de. 3. SMS Onay Kodu girip Doğrula. 4. Zorunlu IMEI yazıp Onayla. 5. Barkodları okutup Onayla.`,
        highlights: [
          'Sevkiyatçı seçimi ilk ekranda mutlaka doğru yapılmalıdır.',
          'Kutulardaki ulusal barkodlar tek tek okunmalıdır.',
          'SMS kodu ve IMEI doğrulanmadan teslimat tamamlanamaz.'
        ]
      },
      {
        id: 'dp-c5',
        title: 'Bölüm 05: Nebim ERP Üzerinden Stok Ekstresi Kontrolü',
        subTitle: 'Nebim V3 Menü Arama, Zorunlu Filtreler ve Sarar Battaniye Stok Hareketleri',
        content: `**1. Nebim V3 Arama Ekranı (Görsel 6):**\nArama kutusuna "ürün ek" yazılır. Çıkan sonuçlardan MUTLAKA "Ürün Ekstresi (Miktarlı)" seçilmelidir.\n\n**2. Ürün Ekstresi (Miktarlı) Filtreler (Görsel 7):**\nZorunlu Filtreler:\n• [Başlangıç Tarihi] Bu Ayın İlk Günü ⬅ Tarihler Ayarlanmalı\n• [Bitiş Tarihi] Bugün\nEk Filtreler:\n• [Ürün Kodu] Eşit 042-001-090 ⬅ Ürün Kodu Girilmeli\nSonrasında "Çalıştır" denilmelidir.\n\n**3. Stok Hareketleri ve Güncel Envanter Ekranı (Görsel 8):**\nÜrün Kodu: 042-001-090 • Ürün Adı: SARAR KABARTMALI BATTANİYE 4 KG.\n• 01.02.2025 Devir: 809 Giren, 766 Çıkan, Envanter: 43\n• 01.02.2025 Çıkış (Adem Bayar Perakende Sonra Teslim): 1 Çıkan, Envanter: 42\n• 01.02.2025 Çıkış İade (Emine Demiray Taksitli Satış): -1 Çıkan, Envanter: 42\n• 03.02.2025 Giriş (Tokat Mağaza Mağazaya Transfer): 35 Giren, Envanter: 77 (Güncel)`,
        highlights: [
          'Arama kutusunda "Ürün Ekstresi (Miktarlı)" seçilmelidir.',
          'Başlangıç tarihi bu ayın ilk günü, bitiş bugündür.',
          'Tüm giriş, çıkış, iade ve transferler bu ekranda net görülür.'
        ]
      },
      {
        id: 'dp-c6',
        title: 'Bölüm 06: Sipariş Girişi ve Mağazalar Arası Transfer',
        subTitle: 'Firmadan Gelen Siparişler ve ERP Üzerinden Diğer Mağazalara Transfer',
        content: `**Firmadan Gelen Siparişlerin Girişi (4 Adım):**\n1. Gelen Fatura / İrsaliye kısmı seçilir.\n2. Gelen ekrana tedarikçi firma ismi yazılır, listeden Tedarikçi seçilir.\n3. Hangi sipariş fişinin girişi sağlanacaksa o Sipariş Fişi seçilir.\n4. Tarih seçildikten sonra girişi yapılacak ürünlerin barkodları okutulur, ardından Onayla butonu tıklanarak kayıt sağlanır.\n\n**ERP Üzerinden Diğer Mağazalara Transfer (4 Adım):**\n1. Gelen ekrandan Merkeze İade seçilir ve ilgili kısımlar doldurulur.\n2. Satırlar bölümü tıklanarak yan sayfaya geçilir; sağ tıklanarak Barkod kolonu aktif edilir ve gönderilecek ürün okutulur.\n3. Adet girilir, yan satırdaki Açıklama kısmına hangi mağazaya gönderilecekse yazılır ve üstten Kaydet denilir.\n4. Yazıcı işareti tıklanarak çıktı alınır (Teslim Eden & Teslim Alan İmzası Zorunludur).`,
        highlights: [
          'Tedarikçi girişinde sipariş fişi ile barkodlar eşleştirilir.',
          'Transferde Barkod kolonu aktif edilip ürün okutulur.',
          'Teslim eden ve alan ıslak imzalı çıktı zorunludur.'
        ]
      },
      {
        id: 'dp-c7',
        title: 'Bölüm 07: Cep Telefonu Teslimat Kuralları ve Genel Sonuç',
        subTitle: 'Kimlik, Jelatin Kontrolü, IMEI, İade Yasağı ve Operasyonel Güvence',
        content: `**1. Müşteri Bilgilerinin Doğruluğu:**\n• Kimlik Doğrulama: Teslimat öncesi müşteri kimlik bilgileri mutlaka kontrol edilmelidir.\n• Teslim Alan Kişinin Kimlik Bilgisi: Siparişi veren kişi değilse yetki belgesi şarttır.\n\n**2. Ürün ve Paket Kontrolü:**\n• Fiziksel Durum Kontrolü: Hasar görmediğinden emin olunmalıdır.\n• Jelatin ve Ekran Kontrolü: Ürünün jelatini açılıp ekranı ve özellikleri müşteri huzurunda kontrol edilmelidir.\n• Aksesuar ve Belge: Şarj kablosu, garanti belgesi ve fatura eksiksiz olmalıdır.\n\n**3. Teslimat Prosedürü:**\n• Teslimat Onay SMS'i ve IMEI: Terminalden müşteriden onay kodu alınır. Cihazın IMEI numarası mutlaka okutulur.\n• Müşteri Onayı: Ürünü inceleyip onay verdiğinde teslimat tamamlanır.\n\n**4. İade, Değişim ve Servis Kuralları:**\n• İade Bilgilendirmesi: Teslim edilen cep telefonunun İADE SÜRECİNİN OLMADIĞI hakkında müşteri teslimat esnasında açıkça bilgilendirilir.\n• Servis Yönlendirmesi: Sorun durumunda yetkili servise yönlendirme sağlanır.\n\n**BÖLÜM 08 GENEL DEĞERLENDİRME VE SONUÇ:**\nMağaza içi depocular, mağaza operasyonlarının düzgün ve verimli işlemesinde kritik bir rol oynar. Stok yönetimi, ürün düzeni, sevkiyat ve iade işlemleri gibi birçok sorumluluğa sahip olan depocular, envanterin doğru ve güncel tutulmasını sağlar. Bu görevleri eksiksiz yerine getirmeleri; mağazanın satış performansını, müşteri memnuniyetini ve genel operasyonel verimliliğini doğrudan artırır.\n\nKurum: ESME Mağazacılık Operasyonları • Sistemler: Nebim V3 ERP • DSIC El Terminali • Hazırlayanlar: Ömer BAŞ - Turgut CESUR`,
        highlights: [
          'Cep telefonunda iade süreci yoktur; müşteri teslim anında açıkça uyarılır.',
          'Jelatin müşteri huzurunda açılır ve ekran kontrol edilir.',
          'IMEI terminale okutulmadan teslimat tamamlanamaz.'
        ]
      }
    ],
    officialNotice: {
      disciplinaryActions: [
        'Evraksız veya kontrolsüz mal kabulü ve sevkiyat çıkışı yapılması şirket içi denetim kusuru sayılır.',
        'Kutusu açılmış cep telefonlarında keyfi iade kabul edilemez; arızalı ürünler sağlam stoğa dahil edilemez.',
        'Mağazalar arası transferlerde ıslak imzalı evrak arşivlenmesi zorunludur.'
      ]
    },
    quiz: [
      {
        id: 'qdpo_1',
        question: 'Nebim V3 ERP menüsünde stok ekstresi kontrol edilirken hangi seçenek seçilmelidir?',
        options: [
          'Ürün Ekstresi (Miktarlı)',
          'Genel Fatura Listesi',
          'Kasa Raporu',
          'Cari Bakiye Listesi'
        ],
        correctOptionIndex: 0,
        explanation: 'Bölüm 05 uyarınca menü arama kutusuna "ürün ek" yazılarak çıkan sonuçlardan MUTLAKA "Ürün Ekstresi (Miktarlı)" seçilmelidir.'
      },
      {
        id: 'qdpo_2',
        question: 'DSIC el terminali ile sevkiyat aracına ürün atama işleminde ilk okutulması gereken evrak barkodu hangisidir?',
        options: [
          'ESME - Online Sevkiyat Listesi üstündeki Sözleşme Barkodu (örn: 1-RI-7-2187238)',
          'Müşterinin kimlik kartı barkodu',
          'Kargo takip barkodu',
          'Mağaza kapı barkodu'
        ],
        correctOptionIndex: 0,
        explanation: 'Bölüm 04 Adım 1 uyarınca sevkiyatçının getirdiği ESME - Online Sevkiyat Listesi evrakının üst kısmındaki sözleşme barkodu terminalle okutulur.'
      },
      {
        id: 'qdpo_3',
        question: 'Mağazadan müşteriye teslim edilen cep telefonları için iade ve kontrol kuralı nedir?',
        options: [
          '14 gün içinde kutusu açılsa da koşulsuz iade alınır.',
          'Teslim edilen cep telefonunun İADE SÜRECİNİN OLMADIĞI müşteriye açıkça bildirilir, jelatin müşteri huzurunda açılıp IMEI okutulur.',
          'IMEI numarası yazılmadan teslim edilebilir.',
          'Müşteri kontrol etmeden imzasız teslim alır.'
        ],
        correctOptionIndex: 1,
        explanation: 'Bölüm 07 uyarınca cep telefonunun iade sürecinin olmadığı teslimatta müşteriye açıkça bildirilir; jelatin müşteri huzurunda açılır ve IMEI okutulur.'
      },
      {
        id: 'qdpo_4',
        question: 'Ürün kabul sürecinde hasarlı veya arızalı ürün tespit edildiğinde depocunun izleyeceği zorunlu protokol nedir?',
        options: [
          'Sağlam ürünlerin arasına yerleştirip satışa sunmak',
          'Kesinlikle sağlam reyon stoğuna sokmamak, derhal tutanak tutarak Arızalı/Hasarlı alanına ayırmak ve üst birime bildirmek',
          'Kutusunu koli bandıyla bantlayıp müşteriye sevk etmek',
          'Hiçbir şey yapmadan depoda bekletmek'
        ],
        correctOptionIndex: 1,
        explanation: 'Bölüm 02 Kritik Kural uyarınca arızalı ürünler KESİNLİKLE sağlam satış reyonu stoğuna alınamaz; tutanakla ayrılır ve üst birime bildirilir.'
      },
      {
        id: 'qdpo_5',
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
    ],
    createdAt: '2026-10-22T00:00:00Z',
    updatedAt: '2026-10-22T00:00:00Z'
  }
];
