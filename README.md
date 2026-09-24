# ÜSTAD KPSS ARAÇLAR

KPSS'ye hazırlanan için **tek pakette** çalışma araçları: sınav geri sayımı, net & puan hesabı,
not defteri, 2026 güncel bilgiler ve 2011-2021 çıkmış soru arşivi.

Bu proje diğer ÜSTAD projelerinden **ayrıdır**: KPSS-B/Sınav Koçu (`ustad-motor`), ÜSTAD KPSS-B KOÇ PRO
(`ustad-koc-pro`) ve ÜSTAD AYT (`ustad-motor-ayt`) depolarına **karışmaz**. Her proje kendi deposunda durur.

## Bölümler

| # | Bölüm | Ne yapar |
|---|-------|----------|
| 1 | ⏳ Sınav Geri Sayımı | ÖSYM 2026 takvimi: Ön Lisans 4 Ekim, Ortaöğretim 25 Ekim, DHBT 1 Kasım, sonuç tarihleri. Gün/saat/dakika/saniye canlı sayaç + sınav sabahı hatırlatıcı |
| 2 | 🧮 Net & Puan | GY-GK doğru/yanlış girişi, net (KPSS'de yanlış doğruyu götürmez), yüzde, hedefe göre fark, deneme geçmişi |
| 3 | 📝 Notlarım | Konu etiketli notlar, arama, sesli okuma, JSON yedek al / geri yükle |
| 4 | 📰 2026 Güncel Bilgiler | 30 madde, her biri kaynaklı (TÜİK, ÖSYM, UEFA, Nobel, sanayi bakanlığı…), hızlı tekrar kartları |
| 5 | 📚 Çıkmış Sorular (2011-2021) | Yıl yıl ÖSYM'nin resmî soru kitapçığı sayfasına bağlantı + test yapısı/konu dağılımı + ÖSYM tarzında **özgün** alıştırma soruları |
| 6 | ⚙️ Ayarlar | 11 tema, yazı boyutu, sesli okuma, veri yedekle/sil |
| 7 | ©️ Hakkında & Telif | Sürüm, telif, veri kaynakları |

## Telif durumu (önemli)

- **ÖSYM soruları kopyalanmadı.** ÖSYM kitapçıklarında "Bu soruların telif hakları ÖSYM'ye aittir.
  Sorular ÖSYM'nin yazılı izni olmaksızın hiçbir kişi, kurum veya kuruluş tarafından kullanılamaz."
  ibaresi yer alır. Uygulama bu nedenle **soru metnini gömmez**; yıl kutularından ÖSYM'nin kendi
  soru kitapçığı sayfasına bağlantı verir.
- Doğrudan PDF bağlantısı yalnızca sunucudan `HTTP 200 + application/pdf` yanıtı alındığında gösterilir
  (`araclar/ozgun-uret.py` bu denetimi yapar). ÖSYM erişim kısıtı uyguladığında bağlantı gizlenir,
  resmî sayfa bağlantısı kalır. Doğrulanmış bağlantı yoksa uygulama "doğrulanmadı" diye **açıkça yazar**.
- Alıştırma soruları **tamamen özgün** yazılmıştır (`araclar/ozgun-uret.py`).
- Güncel bilgilerdeki her madde **kaynağıyla** gösterilir; kaynağı doğrulanamayan bilgi pakete alınmaz.

## Dosya düzeni

```
index.html              tek sayfa uygulama (web + WebView aynı dosyayı kullanır)
assets/stil.css         11 tema, bölüm renkleri
assets/araclar.js       çekirdek: menü, tema, depo, panel
assets/sayim.js         geri sayım + hatırlatıcı
assets/hesap.js         net & gösterge puan + deneme geçmişi
assets/notlar.js        not defteri
assets/guncel.js        2026 güncel bilgiler ekranı
assets/cikmis.js        çıkmış sorular + özgün soru motoru
assets/test.js          kendi kendini test (yalnızca ?test=1; APK'ya girmez)
icerik/takvim.js        ÖSYM 2026 sınav takvimi (kaynaklı)
icerik/guncel.js        2026 güncel bilgiler verisi (üretilir)
icerik/cikmis.js        2011-2021 arşiv + özgün sorular (üretilir)
araclar/                üretici ve derleme betikleri (aşağıda)
apk/                    imzalı APK
```

## Üretici / derleme betikleri

| Betik | İş |
|-------|----|
| `araclar/ozgun-uret.py` | `icerik/cikmis.js` üretir (yıl listesi + özgün sorular; sayısal cevaplar assert ile doğrulanır) |
| `araclar/guncel-derle.py` | araştırma JSON'unu `icerik/guncel.js` hâline getirir (kaynaksız madde kabul edilmez) |
| `araclar/apk-kabuk-kur.py` | Android kabuğunu hazırlar (paket adı, uygulama adı, sürüm, simge) |
| `araclar/build-kpss-araclar.sh` | Gradle'sız APK derleme: aapt2 → javac → d8 → zipalign → apksigner |

## Kendi kendini test

Tarayıcıda:

```
index.html?test=1
```

24 test koşar: takvim sırası, geri sayım DOM çıktısı, puan göstergesi (55 doğru → 50,0),
net hesabı, sınır aşımı denetimi, not ekleme/arama, soru verisi bütünlüğü (5 benzersiz şık,
açıklama zorunlu), menü/ekran sayıları. Sonuç sayfada ve sekme başlığında görünür.

## Sürüm

- **1.0** — ilk sürüm. Web + imzalı APK (`apk/USTAD-KPSS-ARACLAR-v1.0.apk`).
- Paket adı: `tr.com.ustadkenankuzucu.ustadkpssaraclar` · versionCode 1

## Veri kaynakları

ÖSYM 2026 sınav takvimi ve kılavuzları, TÜİK veri portalı, ilgili kurum/ajans açıklamaları.
Takvim ve güncel bilgiler değişebilir; bağlayıcı kaynak her zaman ÖSYM'nin kendi yayınıdır.

---

© 2026 **Kenan Kuzucu** · Tüm hakları saklıdır (5846 sayılı FSEK). İzinsiz çoğaltma, kopyalama, satış ve dağıtım yasaktır.
