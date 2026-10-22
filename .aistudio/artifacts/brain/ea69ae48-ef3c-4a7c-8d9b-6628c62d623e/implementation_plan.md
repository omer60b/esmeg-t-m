# Esme Eğitim Portalı — PDF Okuyucu, Depocu Slayt Sunumu, Sınav-Sertifika & Süper Admin Yetkilendirme

Bu plan; E-Kitaplık ve eğitim modüllerinde orijinal PDF belgelerinin kesintisiz ve çift modlu görüntülenmesini, depocu alanına resmi yönergelerden türetilmiş 8 slaytlık interaktif sunum eklenmesini, video yüklemenin yalnızca yöneticilere sınırlandırılmasını, tebellüğ & takip alanında rastgele 5 soruluk anlama testi ve resmi başarı sertifikası üretimini, ayrıca O.BAS için en yetkili süper admin yönetim ve yeni yönetici tanımlama konsolunun kurulmasını kapsar.

## Kullanıcı Kararları & Onaylanan Tercihler

> [!IMPORTANT]
> Kullanıcı ile yapılan soru-cevap aşamasında aşağıdaki mimari tercihler kesinleştirilmiştir:

- **Sınav Başarı Barajı**: Tebellüğ & takip alanında rastgele 5 soruluk testte başarı sertifikası alabilmek için **en az 4 doğru (%80 başarı şartı)** uygulanacaktır. 4'ün altında kalan personele anında doğru açıklamalar gösterilecek ve tekrar deneme imkânı sunulacaktır.
- **PDF Görüntüleme Modu**: E-kitap ve detay modalında hem **İnteraktif Dijital A4 Belge Görünümü** (tarayıcı eklentisi veya iframe engellerinden etkilenmeyen, tam metin, tablo ve kaşe içeren garantili görünüm) hem de **Orijinal Gömülü PDF & Doğrudan İndirme** çift modlu sekmeli yapıyla sunulacaktır.
- **Depocu Sunum Alanı**: Önceki 4 depo yönergesi bilgi işlem alanında korunurken, depocu sekmesinde doğrudan interaktif **8 Slaytlık Depo Operasyonları & Motosiklet Teslimat Sunumu** gösterilecektir.
- **Video Yükleme Kısıtlaması**: Şube personelleri ve standart kullanıcılar için video yükleme alanları gizlenecek; yalnızca yetkili yöneticiler (`isAdmin === true`) yeni video yükleyebilecek veya düzenleyebilecektir.
- **Süper Admin Yetkileri**: `O.BAS` en yetkili yönetici olarak sistemdeki tüm eğitimleri, sayımları, kullanıcıları düzenleme, silme, sıfırlama ve sisteme yeni yetkili yönetici hesapları tanımlama hakkına sahip olacaktır.

---

## 1. Genel Bakış & Temel İşlevler

- **Çift Modlu PDF & Yönerge Okuyucu**: Kullanıcıların tarayıcı sandbox/iframe engeli nedeniyle gri kutu görmesini engelleyen; resmi antetli, mühürlü, tablolu ve maddeli A4 dijital sayfa önizleyicisi ile orijinal PDF dosya indirme/açma köprüsünün entegrasyonu.
- **İnteraktif Slayt Sunumu (Depocu Alanı)**: Depo, mal kabul, motosiklet şase/motor no doğrulama, Sunny vs Volta karneleri ve güvenlik teslimat kurallarını içeren 16:9 oranında slayt gösterisi, tam ekran modu, slayt geçişleri ve eğitmen notları.
- **Tebellüğ Sınav Motoru & Başarı Sertifikası**: Eğitim soru havuzundan her seferinde rastgele 5 soru çeken sınav motoru, %80 (4/5) başarı barajı ve başarılı olan personele özel benzersiz seri numaralı, şube onaylı, QR/kaşeli dijital başarı ve tebellüğ sertifikası üretimi (yazdırılabilir ve PDF indirilebilir).
- **Süper Admin Yönetim Konsolu (`O.BAS`)**: En yetkili yönetici unvanı ile tüm kayıtları silme, güncelleme, Excel/PDF ihraç etme ve yeni yönetici hesabı oluşturma (kullanıcı adı, şifre, unvan ve yetki seviyesi atama) paneli.

---

## 2. Kullanıcı Deneyimi & Arayüz Tasarımı

### Ana Akışlar

1. **E-Kitap ve PDF İnceleme Akışı**:
   - Kullanıcı "E-Kitap" veya herhangi bir eğitim kartındaki "Resmi PDF Dokümanı" sekmesine tıkladığında iki görünüm modu ile karşılaşır:
     - `📄 Dijital Resmi Belge (A4)`: Resmi Esme antetli kağıt formatında, madde numaraları, risk uyarıları, imza blokları ve tabloları içeren kusursuz okunabilir sayfa.
     - `📎 Orijinal PDF Dosyası`: Tarayıcı içi embed ve büyük "PDF İndir" / "Yeni Sekmede Aç" aksiyonları.
2. **Depocu Slayt Sunumu Akışı**:
   - "Depocu Eğitim" sekmesine tıklandığında doğrudan "Depo Operasyonları & Mal Kabul Sunumu" kartı karşılar.
   - "Slaytları Başlat" butonuna basıldığında tam ekran destekli, 8 adımlı 16:9 slayt sahnesi açılır; klavye ok tuşları veya butonlarla slaytlar gezilebilir.
3. **Tebellüğ & Sınav Akışı**:
   - Personel eğitim sonrasında veya Tebellüğ sekmesinde 5 rastgele soruluk testi çözer.
   - 4 veya 5 doğru yaptığında ekranda konfeti animasyonu eşliğinde resmi **"Esme Başarı ve Tebellüğ Sertifikası"** açılır; yazdırma ve PDF indirme seçenekleri sunulur.
4. **Süper Admin Yönetici Tanımlama Akışı**:
   - `O.BAS` giriş yaptığında Yönetici Panelinde "Yeni Yönetici Ekle" butonu aktif olur.
   - Kullanıcı adı, şifre, isim ve rol girilerek sisteme anında yeni yönetici kaydedilebilir ve Firestore bulutuna yazılır.

### Renk Paleti & Tipografi

- **Kurumsal Renkler**: Koyu arduvaz zemin (`slate-950`, `slate-900`), Esme kurumsal kırmızı vurguları (`red-600`, `rose-600`), bilgi işlem mavisi (`blue-500`) ve depo zümrüt yeşili (`emerald-500`).
- **Antetli Belge Tasarımı**: Beyaz ve krem zemin (`bg-white`), resmi lacivert/kırmızı başlıklar, gri kılavuz çizgileri, monospaced doküman kodları (`font-mono`).
- **Sertifika Tasarımı**: Altın sarısı ve kırmızı kenarlık işlemeleri, guilloche sertifika çerçevesi, mühür kaşesi ve dijital doğrulama kodu.

---

## 3. Temel Ürün Kararları & Mimari Tercihler

| Karar Alanı | Seçilen Yöntem | Gerekçe & Avantaj |
| :--- | :--- | :--- |
| **PDF Gösterimi** | Hibrit: A4 Dijital DOM + Orijinal PDF Dosya Köprüsü | Tarayıcı iframe kısıtlamaları ve mobil uyumsuzlukları tamamen bertaraf edilir, belge her zaman okunur. |
| **Slayt Motoru** | Yerel React Slayt Bileşeni (`SlidePresentationViewer`) | Harici kütüphane bağımlılığı olmadan 16:9 duyarlı, klavye destekli ve tam ekran sunum deneyimi. |
| **Sınav Üretimi** | Soru havuzundan Fisher-Yates karıştırma algoritmasıyla dinamik 5 soru seçimi | Ezberciliği önler, personelin gerçek bilgisini ve yönergeye hâkimiyetini ölçer. |
| **Video İzni** | `isAdmin` şartlı DOM render ve yetki kontrolü | Sıradan personelin yanlışlıkla video yüklemesini veya düzenlemesini kesin olarak engeller. |
| **Yönetici Kaydı** | Firestore & localStorage entegre Süper Admin konsolu | `O.BAS` tek tıkla yeni yönetici hesabı açabilir ve yetkilendirebilir. |

---

## 4. Teknik Mimari & Veri Akışı

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ESME KURUMSAL SİSTEMİ                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────┐   ┌───────────────────┐   ┌───────────────┐   │
│   │   EĞİTİM PORTALI   │   │  E-KİTAP OKUYUCU  │   │  TEBELLÜĞ &   │   │
│   │   (esmeegitim)     │   │  & PDF VIEWER     │   │  SINAV MODÜLÜ │   │
│   └─────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘   │
│             │                        │                     │           │
│             ▼                        ▼                     ▼           │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  - Depocu Slayt Sunumu (8 Slaytlık İnteraktif Deck)            │   │
│   │  - Çift Modlu PDF Okuyucu (A4 Dijital Belge + Gömülü Dosya)    │   │
│   │  - Rastgele 5 Soru Seçici (%80 Barajı & Başarı Sertifikası)    │   │
│   │  - Video Yükleme Koruması (Yalnızca Admin)                     │   │
│   │  - O.BAS Süper Admin Konsolu (Yeni Yönetici Tanımlama)         │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                   │
│                                    ▼                                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               BULUT VERİ TABANI & YEREL DEPOLAMA               │   │
│   │   - Firestore (`ai-studio-esmesaymmaazasto-...`)               │   │
│   │   - `appData/trainings_catalog` & `training_completions`       │   │
│   │   - `localStorage` Anlık Önbellek ve Oturum Yönetimi           │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Doğrulama & Test Adımları

1. **PDF Görünürlük Testi**: E-Kitap Okuyucusu ve Eğitim Detay pencerelerinde PDF sekmesine tıklandığında hem resmi dijital belgenin eksiksiz açıldığı hem de indirme/yeni sekme aksiyonlarının çalıştığı doğrulanacak.
2. **Depocu Slayt Sunumu Testi**: "Depocu Eğitim" kategorisine girildiğinde 8 slaytlık interaktif sunumun sorunsuz çalıştığı, sonraki/önceki butonlarının ve tam ekran modunun çalıştığı denetlenecek.
3. **Video İzin Testi**: Standart personel oturumunda video yükleme düğmelerinin görünmediği, yönetici oturumu açıldığında butonların aktifleştiği kontrol edilecek.
4. **Sınav ve Sertifika Testi**: Sınava girildiğinde soru havuzundan 5 farklı sorunun geldiği, 4 ve 5 doğru alan personele resmi sertifikanın üretildiği test edilecek.
5. **O.BAS Süper Admin Testi**: O.BAS hesabıyla giriş yapıldığında yeni yönetici ekleme formunun açıldığı, eklenen yeni yöneticinin sisteme başarıyla kaydedildiği doğrulanacak.
6. **Derleme & Lint Denetimi**: `compile_applet` ve `lint_applet` ile sıfır hata doğrulaması yapılacak.
