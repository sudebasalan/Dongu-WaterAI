/**
 * DÖNGÜ — Merkezi Veri ve Konfigürasyon Dosyası
 * Bu dosyada tüm içerik, rakam ve takım bilgisi tutulur.
 * Kolayca güncellemek için buradan değiştirin.
 */

// ─── PROJE ───────────────────────────────────────────────────────────────────
export const PROJECT = {
  name: "DÖNGÜ",
  appName: "Su İzim",
  tagline: "Evini tanıyan, kaçağı yakalayan, suyunu yeniden kullanan akıllı şehir.",
  taglineSub: "Daire sensörü + yapay zekâ + ilçe ve şehir ölçeğinde arıtma ve geri kazanım",
};

// ─── TAKIM ───────────────────────────────────────────────────────────────────
export const TEAM = {
  name: "HydraMind Ekibi",
  event: "Water AI Hackathon 2026",
  organizer: "Wilo Türkiye",
  facilitator: "imece",
  date: "5 Aralık 2026, İstanbul",
  contact: "iletisim@dongu-su.org", // ← İletişim e-postanızı buraya yazabilirsiniz

  members: [
    {
      id: 1,
      name: "Veri & Yapay Zekâ Lideri", // ← Gerçek adınızı buraya yazabilirsiniz
      role: "Veri ve Yapay Zekâ",
      university: "İTÜ / ODTÜ — Bilgisayar / YZ Müh.",
      contribution: "Anomali tespiti, cihaz tanıma ve akış sınıflandırma modellerini tasarladım.",
      photo: "/assets/team/member1.svg",
    },
    {
      id: 2,
      name: "IoT & Donanım Lideri", // ← Gerçek adınızı buraya yazabilirsiniz
      role: "Donanım ve Veri",
      university: "Yıldız Teknik / Boğaziçi — Elektrik-Elektronik",
      contribution: "ESP32 tabanlı sensör devresini kurdum, veri akışını ve arıtma entegrasyonunu yapılandırdım.",
      photo: "/assets/team/member2.svg",
    },
    {
      id: 3,
      name: "Tasarım & Ürün Lideri", // ← Gerçek adınızı buraya yazabilirsiniz
      role: "Arayüz ve Anlatı",
      university: "Mimar Sinan / Marmara — Endüstriyel Tasarım",
      contribution: "Su İzim mobil uygulamasının tasarımını ve projenin kullanıcı deneyimini şekillendirdim.",
      photo: "/assets/team/member3.svg",
    },
  ],
};

// ─── SU VERİLERİ ─────────────────────────────────────────────────────────────
export const WATER_DATA = {
  sourceCapita: "DSİ verilerine dayanan basın ve kurum yayınları (doğrulanacak)",
  sourceEPA: "ABD Çevre Koruma Ajansı (EPA) — WaterSense Program verileri",
  sourceTurkey: "T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı; 2026–2035 Ulusal Su Planı",
  sourceHydroSense: "Froehlich vd. (2009), HydroSense, UbiComp — Washington Üniversitesi",
  sourceGrawater: "İzmir bina çalışması — gri su yeniden kullanımı (literatür; doğrulanacak)",

  perCapitaM3: [
    { year: 2000, value: 1652 },
    { year: 2024, value: 1308 },
    { year: 2050, value: 1069, projected: true },
  ],
  scarcityThreshold: 1000,       // m³/kişi/yıl — FAO/DSİ eşiği
  dailyLitersPerPerson: 130,     // konut sakini günlük ortalama

  // EPA istatistikleri
  epaAnnualLeakGallons: 10000,   // ortalama evde yıllık kaçak (galon)
  epaAnnualLeakLiters: 37854,    // ≈ 38 ton
  epaHomesOver50GalDay: 9,       // % — günde >50 galon kaçak olan evler
  epaBillSavingPct: 10,          // % — kolay kaçak tamiri sonrası tasarruf

  // Türkiye şebeke kayıp oranı
  turkeyNetworkLossPct: 32,      // 2023 ortalaması
  nationalDailyTargetLiters: 120, // 2026-2035 Ulusal Su Planı hedefi (L/kişi/gün)

  // Gri su arıtma
  graywaterSavingPct: 44,        // İzmir bina çalışması — %44 su tasarrufu
  graywaterPaybackYears: 6,      // geri ödeme süresi (yıl)
  cityReusePct: 15,              // ilçe/şehir tesisinde arıtılıp yeniden kullanılan pay — Türkiye 2030 hedefi
  hydrosenseAccuracy: 97.9,      // HydroSense tek nokta doğruluğu (%)
};

// ─── TARİFE VE FİYAT (Örnek — gerçek tarife şehre göre değişir) ─────────────
export const TARIFF = {
  note: "Aşağıdaki rakamlar örnek amaçlıdır; gerçek su tarifesi şehre ve abonelik tipine göre değişir.",
  pricePerM3_TL: 15.5,
  sewerageMultiplier: 0.8,
  fixedMonthlyFee_TL: 20,
  currency: "TL",
};

// ─── SİMÜLASYON PARAMETRELERİ ────────────────────────────────────────────────
export const SIMULATION = {
  baseFlowLPM: 0,
  normalDayProfile: [
    0, 0, 0, 0, 0.1, 0.5,
    2.5, 4.2, 3.1, 1.2, 0.8, 1.0,
    1.5, 1.2, 0.9, 0.7, 0.8, 1.5,
    3.2, 4.0, 3.5, 2.0, 0.8, 0.2,
  ],
  leakTypes: {
    toilet: { lpm: 0.08, label: "Klozet sızıntısı" },
    drip:   { lpm: 0.03, label: "Damlayan musluk" },
    pipe:   { lpm: 0.25, label: "Boru kaçağı" },
  },
  thresholdAlarm_LPM: 0.5,
};

// ─── LOGO DOSYALARI ──────────────────────────────────────────────────────────
export const LOGOS = {
  wilo:  "/assets/logos/wilo-kirpik.png",
  imece: "/assets/logos/imece.png",
};

// ─── VİDEOLAR ────────────────────────────────────────────────────────────────
// Her bölümde bir video alanı var. Videoyu eklemek için ilgili bölümün
// "src" alanını doldurmanız yeterli. Üç seçenek:
//   1) Kendi dosyanız: videoyu public/videos/ klasörüne koyun ve
//      src: "/videos/problem.mp4" yazın.
//   2) YouTube (liste dışı/unlisted olabilir): src: "https://youtu.be/XXXX"
//   3) Google Drive (paylaşım "bağlantıya sahip herkes"): src: "https://drive.google.com/file/d/XXXX/view"
// src boş kaldığında yerinde "Video eklenecek" kartı görünür.
//
// presenter: TEAM.members içindeki sıra (0, 1, 2) ya da "team" (tüm ekip).
// SHOW_VIDEO_SCRIPTS: true iken boş video kartlarında konuşma metni görünür
// (çekim sırasında prova için). Yayına çıkmadan önce false yapın.
export const SHOW_VIDEO_SCRIPTS = true;

export const VIDEOS = {
  intro: {
    title: "DÖNGÜ'yü ekibimizden dinleyin",
    presenter: "team", duration: "3–5 dk", src: "/videos/tanitim.mp4", poster: "",
    script: "Bu video projenin tamamını anlatan tek tanıtım videosu. Önerilen akış: (1) Ekip kendini tanıtır: isim, bölüm, projedeki görev. (2) Problem: Faturamız ne kadar harcadığımızı söylüyor ama nerede ve neden harcadığımızı söylemiyor; kaçaklar görünmüyor ve kullanılan su tek kullanımda kayboluyor. (3) Çözüm: Sayacın yanına takılan tek bir sensör ve yapay zekâ her evin su alışkanlığını öğreniyor, kaçağı anında yakalıyor. (4) Arıtma: Kullanılan su, il koşullarına göre kurulan ilçe ya da şehir tesislerinde arıtılıp parklara, sokak temizliğine ve sanayiye geri kazandırılıyor. (5) Su İzim: Herkes kendi suyunun ne kadarının arıtılıp geri döndüğünü uygulamada görüyor. (6) Kapanış: Daireden başlayıp şehre ölçeklenen bir su döngüsü kuruyoruz.",
  },
  solution: {
    title: "Ölç → Tanı → Uyar → Arıt → Yeniden kullan",
    presenter: 2, duration: "75 sn", src: "/videos/cozum.mp4", poster: "",
    script: "DÖNGÜ'yü beş kelimeyle anlatabiliriz: Ölç, tanı, uyar, arıt, yeniden kullan. Önce dairenizin sayacının yanına küçük bir sensör takıyoruz. Sonra yapay zekâmız evinizi tanıyor: sabah kaçta duş alınıyor, akşam kaçta bulaşık yıkanıyor. Bir şey bu düzene uymadığında size haber veriyoruz. Kullanılan su ise ilin koşullarına göre kurulan ilçe ya da şehir arıtma tesislerinde temizlenip parklara, sokak temizliğine ve sanayiye geri dönüyor. Su tek kullanımda kaybolmuyor, döngüye giriyor.",
  },
  measure: {
    title: "Tek sensör, tüm ev",
    presenter: 1, duration: "60 sn", src: "/videos/olcum.mp4", poster: "",
    script: "Bu sensör sistemimizin gözü ve kulağı. Sayacın hemen yanına takılıyor, tesisatı kırmamıza gerek kalmıyor. İki şeyi ölçüyor: suyun akışını ve borudaki basıncı. Bir musluğu açtığınızda borularda küçük bir basınç dalgası oluşur. Her musluğun, her rezervuarın dalgası biraz farklıdır. Biz bu farkları yakalıyoruz. Bilimsel çalışmalarda tek bir sensörle evdeki kullanımların yüzde doksanın üzerinde doğrulukla ayırt edilebildiği gösterildi. Biz bu bilgiyi bir ürüne dönüştürüyoruz.",
  },
  signatures: {
    title: "Her suyun bir imzası var",
    presenter: 0, duration: "75 sn", src: "", poster: "",
    script: "Peki yapay zekâ mutfakla tuvaleti nasıl ayırıyor? Cevap: su imzası. Tuvaleti çektiğinizde kısa ve güçlü bir akış olur, sonra rezervuar dolar. Duş uzun ve sabit akar. Çamaşır makinesi belli aralıklarla su alır. Modelimiz önce akıştaki her kullanımı ayırıyor, sonra hangi gruba ait olduğunu buluyor. İlk birkaç hafta uygulama size arada bir 'Bu kullanım neydi?' diye soruyor. Siz cevapladıkça model sizin evinizi öğreniyor.",
  },
  exceptions: {
    title: "Hayat düzenli değil, sistemimiz bunu biliyor",
    presenter: 2, duration: "60 sn", src: "/videos/istisnalar.mp4", poster: "",
    script: "Diyelim ki vardiyalı çalışıyorsunuz ve bu hafta gece vardiyasındasınız. Uygulamayı açıp takvime 'Bu hafta gece vardiyası' yazıyorsunuz, bu kadar. Sistem beklentisini değiştiriyor. Bu hafta akşam saatlerinde evde sürekli su akarsa, bunun siz olmadığınızı biliyoruz ve 'Tesisatınızda bir sorun olabilir' diye haber veriyoruz. Tatile çıktığınızda da aynı şey geçerli. Her cumartesi temizlik yapıyorsanız bunu söylemenize bile gerek yok, sistem birkaç hafta içinde kendisi öğreniyor.",
  },
  alerts: {
    title: "Kaçağı fatura gelmeden yakala",
    presenter: 0, duration: "75 sn", src: "/videos/kacak.mp4", poster: "",
    script: "Kaçak tespitinde dört şeye bakıyoruz. Bir: Evin normaline uymayan uzun bir akış var mı? İki: Gece herkes uyurken akış sıfıra iniyor mu? Üç: Akış bildiğimiz bir kullanıma benziyor mu? Dört: Siz evde değilken su akıyor mu? Bunları birleştirip size üç seviyede haber veriyoruz: bilgi, uyarı ve acil. Bina ölçeğinde de ana sayaçtaki tüketimi dairelerin toplamıyla karşılaştırıyoruz; aradaki fark ortak tesisattaki kaçağı gösteriyor.",
  },
  app: {
    title: "Su İzim uygulaması",
    presenter: 2, duration: "90 sn", src: "/videos/uygulama.mp4", poster: "",
    script: "Şimdi size Su İzim uygulamasını göstereyim. Ana ekranda bugün kişi başı ne kadar su kullandığınızı ve bunun ulusal hedef olan 120 litrenin neresinde olduğunu görüyorsunuz. Aşağıda suyunuzun nereye gittiği var: banyo, mutfak, tuvalet, çamaşır. Takvimden vardiya, tatil, misafir gibi durumları bildiriyorsunuz. Uyarılar ekranına kaçak ya da arıza bildirimleri düşüyor. Ve Döngü Oranı: Kullandığınız suyun ne kadarının ilçenizin arıtma tesisinde arıtılıp şehre geri döndüğünü görüyorsunuz.",
  },
  graywater: {
    title: "Su kaybolmasın, arıtılıp şehre dönsün",
    presenter: 1, duration: "90 sn", src: "/videos/aritma.mp4", poster: "",
    script: "Evden çıkan su kanalizasyonla arıtma tesisine gidiyor. Biz arıtmayı binalarda değil, ilin koşullarına göre ilçe ya da şehir ölçeğinde yapıyoruz: Büyükşehirlerde ilçe tesisleri, küçük illerde tek bir şehir tesisi. Büyük tesiste metreküp başına maliyet düşüyor ve mevcut tesisler genişletilebiliyor. Arıtılan su park sulamasında, sokak temizliğinde ve sanayide kullanılıyor; böylece bu işler için içme suyu harcanmıyor. Sensörlerimiz de tesise ne zaman ne kadar su geleceğini önceden gösteriyor. Siz de uygulamada kendi suyunuzun ne kadarının geri döndüğünü görüyorsunuz.",
  },
  valuestream: {
    title: "Bir damlanın yolculuğu",
    presenter: 1, duration: "75 sn", src: "/videos/deger-akisi.mp4", poster: "",
    script: "Bir damlanın yolculuğunu takip edelim. 4 kişilik bir ev günde yaklaşık 600 litre su kullanıyor. Bu suyun eve ulaşması için barajdan yaklaşık 880 litre çekiliyor, çünkü şebekede kayıp var. Evin içinde sessiz kaçaklar var ve biz bunları ancak bir ay sonra faturada görüyoruz. Kullanılan su da yeniden kullanılmadan doğaya bırakılıyor. DÖNGÜ ile kaçak dakikalar içinde yakalanıyor, öneriler gereksiz kullanımı azaltıyor ve ilçe tesisinde arıtılan suyun bir kısmı parklarda ve sanayide içme suyunun yerine kullanılıyor. Sonuçta barajdan çekilen su yüzde yirmi iki azalıyor.",
  },
  "ai-section": {
    title: "Yapay zekâ tam olarak nerede?",
    presenter: 0, duration: "60 sn", src: "/videos/yapay-zeka.mp4", poster: "",
    script: "Yapay zekâ projemizde üç yerde çalışıyor. Birincisi su imzası: hangi musluğun, hangi cihazın açıldığını tanıyor. İkincisi evi tanıma: her evin kendi normalini ve istisnalarını öğreniyor, böylece kaçağı yanlış alarm vermeden yakalıyor. Üçüncüsü arıtma tesisi yük tahmini: dairelerden gelen anonim veriyle ilçe tesisine ne zaman ne kadar su geleceğini önceden tahmin ediyor, pompalar ve arıtma kademeleri buna göre çalışıyor.",
  },
  simulation: {
    title: "Kendin dene",
    presenter: 0, duration: "60 sn", src: "/videos/simulasyon.mp4", poster: "",
    script: "Bu simülasyonda 24 saatlik örnek bir ev verisi var. Gizli bir kaçak başlatın ve üç yöntemi karşılaştırın. Sabit eşik küçük kaçağı kaçırıyor. Gece sıfır kuralı, gece uyanık biri olduğunda yanlış alarm veriyor. DÖNGÜ ise evin normalini bildiği için kaçağı yakalıyor ve yanlış alarm vermiyor. İlçe arıtma döngüsünü açtığınızda kullandığınız suyun ne kadarının arıtılıp şehre geri döndüğünü görüyorsunuz.",
  },
  cost: {
    title: "Ucuz, ölçeklenebilir, uygulanabilir",
    presenter: 1, duration: "60 sn", src: "/videos/maliyet.mp4", poster: "",
    script: "Bir fikrin iyi olması yetmez, uygulanabilir olması gerekir. Evde yalnızca sayacın yanına küçük bir sensör takıyoruz. Pahalı kısım olan arıtmayı ise binalarda değil, ilçe ya da şehir ölçeğinde yapıyoruz; büyük tesiste metreküp başına maliyet düşüyor ve mümkün olan yerde mevcut tesisleri genişletiyoruz. Tesise gelecek yükü gerçek veriyle tahmin ettiğimiz için gereksiz kapasite kurmuyoruz. Ev sahibi düşük faturayla, bina yönetimi ortak kaçakları bularak, belediye de daha iyi planlama yaparak kazanıyor.",
  },
  vision: {
    title: "Evden şehre",
    presenter: 0, duration: "60 sn", src: "/videos/sehir.mp4", poster: "",
    script: "Tek bir evin verisi o ev için değerli. Ama binlerce evin verisi bir şehir için çok daha değerli. Kimlik bilgisi olmadan, sadece toplu olarak bakıldığında, belediye hangi ilçede hangi saatte ne kadar su gerektiğini ve arıtma tesisine ne kadar su geleceğini önceden görebiliyor. Mahalleye giren suyu binaların toplam tüketimiyle karşılaştırdığımızda kaybın sokaktaki borularda mı yoksa binaların içinde mi olduğunu anlıyoruz. DÖNGÜ bir daireden başlıyor ama bütün şehrin su haritasını çıkarıyor.",
  },
  roadmap: {
    title: "Prototipten şehre",
    presenter: 2, duration: "45 sn", src: "/videos/yol-haritasi.mp4", poster: "",
    script: "Hackathon'da çalışan bir prototip gösteriyoruz: sensör, yapay zekâ modeli ve uygulama. Sonraki adım tek bir apartmanda pilot uygulama ve kaçak tespiti. Ardından pilot ilçenin arıtma tesisiyle veri bağlantısı kurup geri kazanılan suyu uygulamada göstereceğiz. Başarılı olursa ilçeye, oradan şehre taşıyacağız.",
  },
  closing: {
    title: "Kapanış",
    presenter: "team", duration: "30 sn", src: "/videos/kapanis.mp4", poster: "",
    script: "DÖNGÜ: Her damlayı ölçen, her evi tanıyan, kaçağı anında yakalayan ve kullanılan suyu şehirde arıtıp yeniden hayata döndüren akıllı şehir. Su faturasını bir sayıdan bir hikâyeye, kaybolan suyu da bir kaynağa dönüştürüyoruz. Bizi dinlediğiniz için teşekkür ederiz.",
  },
};

// ─── DEĞER AKIŞ HARİTASI (4 kişilik örnek daire, L/gün) ─────────────────────
// Varsayımlar: kişi başı 150 L/gün; şebeke kaybı %32; ilçe tesisinde geri
// kazanılan pay %15 (2030 ulusal hedefi). Geri kazanılan su, park/sanayi gibi
// işlerde içme suyunun yerine kullanıldığı için barajdan çekilen su azalır.
export const VALUE_STREAM = {
  current: {
    label: "Mevcut durum",
    dam: 882, networkLoss: 282, home: 600, useful: 540, sewer: 540, sewerVerb: "atılır", leak: 60, returned: 0,
    info: "Aylık sayaç okuma → fatura: kaçak ~30 gün sonra fark edilir",
    leadTime: "~30 gün (fatura dönemi)",
    perCapita: 150, cycleRate: 0, loop: false,
  },
  future: {
    label: "DÖNGÜ ile",
    dam: 688, networkLoss: 245, home: 520, useful: 510, sewer: 510, sewerVerb: "arıtmaya gider", leak: 10, returned: 77,
    info: "Saniyelik sensör → yapay zekâ → Su İzim: kaçak anında bildirilir",
    leadTime: "dakikalar (anlık uyarı)",
    perCapita: 130, cycleRate: 15, loop: true,
  },
};
