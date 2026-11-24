# DÖNGÜ — Akıllı Şehir & Su Geri Kazanım Sistemi

**Water AI Hackathon 2026 · Wilo Türkiye · imece · 5 Aralık, İstanbul**  
*Şehirler Odağı: Daireden başlayıp şehre ölçeklenen kapalı su döngüsü*

---

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat (tarayıcı otomatik açılır)
npm run dev

# Üretim derlemesi (dist/ klasörüne)
npm run build

# Derleme çıktısını önizle
npm run preview
```

Geliştirme sunucusu varsayılan olarak `http://localhost:5173` adresinde çalışır.

---

## 💡 Proje Özeti: DÖNGÜ & Su İzim

**DÖNGÜ**, su sayacının yanına eklenen akış ve basınç sensörü (ESP32) ile dairede suyun nerede harcandığını yapay zekâ ile öğrenen, gizli kaçakları yakalayan ve duş/lavabodan çıkan az kirli gri suyu binada arıtarak tuvalet rezervuarlarında yeniden döngüye sokan bütünleşik bir akıllı şehir projesidir.

### Temel Mimari
1. **Daire Ölçeği (Ölç & İmzala):** Tek noktadan saniyede 1 ölçüm. Musluk basınç dalgası analizi (**HydroSense** metodolojisi, %97,9 doğruluk). Tuvalet, duş, çamaşır ve mutfak ayrımı.
2. **Kişisel Koçluk (Su İzim Mobil Uygulaması):** 2030 ulusal hedefi olan 120 L/gün ile anlık kıyaslama, alan bazlı tüketim, 3 seviyeli uyarı (🟢 Bilgi, 🟡 Uyarı, 🔴 Acil vana kesme).
3. **İlçe/Şehir Ölçeği (Arıt & Geri Kazandır):** Kullanılan su, il koşullarına göre kurulan ilçe ya da şehir arıtma tesislerinde arıtılır; park sulama, sokak temizliği ve sanayide yeniden kullanılır. Su İzim uygulaması her haneye kendi suyunun ne kadarının geri döndüğünü (Döngü Oranı) gösterir.
4. **Şehir Ölçeği (Veri & Şebeke İyileştirme):** Binalardan gelen anonim verilerle dağıtım şebekesindeki %32'lik şebeke kayıplarının coğrafi haritası ve belediyelere dinamik su talep projeksiyonu.

---

## 🎬 Videoları Ekleme

Sitedeki bölümlerde toplam 15 video alanı var. Kapaktaki video, ekibin kendini ve projeyi anlattığı ana tanıtım videosudur. Video eklenene kadar yerinde
"Video eklenecek" kartı ve çekim için **konuşma metni** görünür.

1. Videoyu `public/videos/` klasörüne koyun (ör. `public/videos/problem.mp4`).
2. `src/data/config.js` > `VIDEOS` içinde ilgili bölümün `src` alanını doldurun:
   ```js
   problem: { ..., src: "/videos/problem.mp4" },
   ```
   Dosya yerine bağlantı da verebilirsiniz:
   - YouTube (liste dışı olabilir): `src: "https://youtu.be/XXXX"`
   - Google Drive (bağlantıya sahip herkes görebilir): `src: "https://drive.google.com/file/d/XXXX/view"`
3. Yayına çıkmadan önce `SHOW_VIDEO_SCRIPTS = false` yapın; konuşma metinleri gizlenir,
   boş kalan alanlarda "Video yakında" yazar.

> GitHub 100 MB'tan büyük dosyaları kabul etmez. Büyük videoları YouTube'a "liste dışı"
> olarak yükleyip bağlantısını kullanmak en kolayı.

| Anahtar | Bölüm | Anahtar | Bölüm |
|---|---|---|---|
| `intro` | Kapak (tüm ekip, tek tanıtım videosu) | `graywater` | İlçe/şehir arıtma |
| `solution` | Çözüm (Ölç→Tanı→Uyar→Arıt) | `valuestream` | Değer akış haritası |
| `measure` | Nasıl ölçüyoruz (3D giriş) | `ai-section` | Yapay zekâ katmanı |
| `signatures` | Su imzası | `simulation` | Simülasyon |
| `exceptions` | İstisnalar | `cost` | Maliyet & uygulanabilirlik |
| `alerts` | Kaçak tespiti | `vision` | Evden şehre |
| `app` | Su İzim uygulaması | `roadmap` | Yol haritası |
| | | `closing` | Kapanış |

---

## 📁 Dosya Yapısı

```
WaterAI/
├── index.html              # Ana web sayfası (15 bölüm, semantik HTML, ARIA uyumlu)
├── vite.config.js          # Vite yapılandırması & chunk ayrımı
├── package.json
├── README.md
├── src/
│   ├── main.js             # Giriş noktası ve 6 adımlı 3D scroll senkronizasyonu
│   ├── data/
│   │   └── config.js       # ⭐ TÜM içerik, takım, EPA, DSİ, tarife ve simülasyon verileri
│   ├── sections/
│   │   ├── video.js        # Bölüm videoları (dosya / YouTube / Vimeo / Drive)
│   │   ├── extra.js        # Su İzim, Değer Akış Haritası, Maliyet, Yol Haritası
│   │   ├── content.js      # İçerik render, su imzaları, 3 seviyeli alarm, arıtma hesaplayıcı
│   │   ├── hero.js         # Canvas akışkan dalga animasyonu
│   │   ├── problem.js      # Chart.js kişi başı su kıtlığı grafiği
│   │   └── simulation.js   # 24 saatlik interaktif debi ve algoritma simülasyonu
│   ├── three/
│   │   └── scene.js        # Gelişmiş Three.js sahnesi (Sayaç, sensör, veri paketleri, 3D telefon, ilçe arıtma tesisi & şehre geri dönüş, sinir ağı)
│   └── styles/
│       ├── main.css        # Global stiller ve grid sistemi
│       ├── sections.css    # Bölüm bazlı stiller ve 600vh scroll container
│       └── variables.css   # Renk ve tipografi değişkenleri
└── public/
    ├── favicon.svg         # Su damlası vektör ikonu
    ├── videos/             # ⭐ Bölüm videoları buraya
    └── assets/
        ├── logos/          # Wilo ve imece logo yer tutucuları
        └── team/           # Takım fotoğrafları yer tutucuları
```

---

## ✏️ Doldurmanız Gereken Yer Tutucular

### 1. `src/data/config.js` (En Önemlisi)

| Alan | Açıklama |
|------|----------|
| `TEAM.name` | Takım adınız (ör. `"Döngü Takımı"`) |
| `TEAM.contact` | İletişim e-posta adresi |
| `TEAM.members[0].name` | 1. üye adı/soyadı (Veri & YZ) |
| `TEAM.members[1].name` | 2. üye adı/soyadı (Donanım & Veri) |
| `TEAM.members[2].name` | 3. üye adı/soyadı (Arayüz & Anlatı) |
| `TEAM.members[*].university` | Üniversite ve bölüm bilgileri |
| `TARIFF.pricePerM3_TL` | Sunum yapacağınız şehirdeki su tarifesi (TL/m³) |

### 2. Logo Dosyaları → `public/assets/logos/`
- `wilo.png`: Wilo Türkiye logosu (PNG/SVG, şeffaf arka plan)
- `imece.png`: imece logosu (PNG/SVG, şeffaf arka plan)
*(Dosyalar eklenmediğinde şık metin rozetleri otomatik olarak gösterilir).*

### 3. Fotoğraf Dosyaları → `public/assets/team/`
- `member1.jpg`, `member2.jpg`, `member3.jpg`: Takım üyeleri fotoğrafları.
*(Eklenmediğinde rol bazlı emoji avatarları gösterilir).*

---

## 📊 Kullanılan Gerçek Veri Kaynakları

1. **ABD Çevre Koruma Ajansı (EPA):** Ortalama evde kaçaklar yılda ~10.000 galon (38 ton) su israf eder; evlerin %9'unda günde 50 galon üzeri sızıntı vardır.
2. **2026–2035 Ulusal Su Planı:** 2030 yılı için kişi başı günlük su tüketim hedefi 120 litre (mevcut ortalama 130 L).
3. **DSİ ve Kurum Raporları:** Türkiye 2000: 1.652 m³, günümüz: ~1.308 m³, 2050 projeksiyonu: ~1.069 m³ (1.000 m³ su fakirliği eşiği).
4. **Türkiye Şebeke Kayıp Oranı (2023):** %32 kayıp-kaçak oranı.
5. **Washington Üniversitesi HydroSense:** Tek basınç sensörüyle %97,9 armatür ayrımı doğruluğu.
6. **Arıtılmış Atık Suyun Yeniden Kullanımı:** Türkiye'nin 2030 hedefi arıtılmış atık suyun %15'inin yeniden kullanılmasıdır; sitedeki Döngü Oranı örnekleri bu oranı esas alır.
7. **Mahremiyet Literatürü:** Su sensöründen hane halkı aktivite çıkarımı (%82,69 doğruluk) tespiti ve uç bilişim (edge computing) ile KVKK gizlilik koruması.
