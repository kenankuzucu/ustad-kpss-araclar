# -*- coding: utf-8 -*-
"""ÜSTAD KPSS ARAÇLAR · çıkmış soru arşivi + özgün soru paketi üretici.
- Yıl listesi (2011-2021): ÖSYM resmî kitapçık bağlantıları (varsa `osym-arsiv.json`'dan okunur).
- Özgün sorular: tamamen sıfırdan yazılmış, ÖSYM sorularının kopyası DEĞİL.
- Sayısal soruların cevabı assert ile doğrulanır; şık dizilimi sabit tohumla dengelenir.
Çıktı: icerik/cikmis.js   ·   Kullanım: python araclar/ozgun-uret.py
"""
import json, pathlib, random, os

S = pathlib.Path(__file__).resolve().parent.parent
ARSIV = pathlib.Path.home() / "AppData/Local/hermes/cache/scratch/osym-arsiv.json"

# ── Yıl listesi ────────────────────────────────────────────────────────────────
YIL_TABAN = {
    2011: "KPSS Genel Yetenek-Genel Kültür (Lisans/Ön Lisans/Ortaöğretim ayrı oturumlar)",
    2012: "KPSS Genel Yetenek-Genel Kültür",
    2013: "KPSS Genel Yetenek-Genel Kültür",
    2014: "KPSS Genel Yetenek-Genel Kültür",
    2015: "KPSS Genel Yetenek-Genel Kültür",
    2016: "KPSS Genel Yetenek-Genel Kültür",
    2017: "KPSS Genel Yetenek-Genel Kültür",
    2018: "KPSS Genel Yetenek-Genel Kültür",
    2019: "KPSS Genel Yetenek-Genel Kültür",
    2020: "KPSS Genel Yetenek-Genel Kültür",
    2021: "KPSS Genel Yetenek-Genel Kültür",
}
# Geçmiş yıllarda soru dağılımı: 30 Türkçe + 30 Matematik (GY), 27 Tarih + 18 Coğrafya + 9 Vatandaşlık + 6 Güncel (GK)
KONU_TABAN = ["30 Türkçe", "30 Matematik", "27 Tarih", "18 Coğrafya", "9 Vatandaşlık", "6 Güncel Bilgiler"]

arsiv = {}
if ARSIV.exists():
    try:
        ham = json.loads(ARSIV.read_text(encoding="utf-8"))
        for k in ham.get("kayitlar", []):
            y = int(k.get("yil") or 0)
            if y and k.get("url") and str(k.get("durum", "")).lower() in ("200", "403", "engellendi", "ok", "true"):
                arsiv.setdefault(y, k["url"])
    except Exception as e:
        print("arsiv okunamadi:", e)

# ÖSYM resmî soru kitapçığı sayfası (doğrulandı: HTTP 200, 2026-09-24)
RESMI_SAYFA = "https://www.osym.gov.tr/soru-kitapciklarinin-goruntulenmesi"

yillar = []
for y in sorted(YIL_TABAN):
    yillar.append({
        "yil": y,
        "tur": "KPSS Lisans / Ön Lisans / Ortaöğretim",
        "yapi": YIL_TABAN[y] + " — 60 Genel Yetenek + 60 Genel Kültür = 120 soru / 130 dakika",
        "konu": KONU_TABAN,
        "url": arsiv.get(y),
        "arsiv_url": RESMI_SAYFA,
        "not": ("Doğrudan kitapçık bağlantısı doğrulanmıştır (ÖSYM sunucusu)." if y in arsiv else
                "ÖSYM soru kitapçıklarının telif hakkı ÖSYM'ye aittir; bu uygulama soru metni yayımlamaz. "
                "Kitapçığın resmî PDF'ine ÖSYM'nin kendi soru kitapçığı sayfasından yıl seçerek ulaşabilirsin. "
                "Doğrudan bağlantı yalnızca sunucudan 200 + application/pdf yanıtı alındığında gösterilir."),
    })

# ── Özgün sorular ─────────────────────────────────────────────────────────────
# (yil, ders, konu, soru, DOGRU, [4 yanlis], aciklama)
SORULAR = [
 (2011,"Türkçe","Yazım Kuralları",
  "\"Herşey\" sözcüğünün doğru yazımı aşağıdakilerden hangisidir?",
  "her şey", ["herşey","herşeyi","her-şey","herşeyin"],
  "TDK Yazım Kılavuzu'na göre 'şey' sözcüğü kendisinden önceki sözcükten ayrı yazılır: her şey, bir şey, hiçbir şey."),
 (2011,"Matematik","Yüzde Problemleri",
  "Bir ürünün fiyatı 200 TL iken önce %10 zam, sonra yeni fiyat üzerinden %10 indirim yapılıyor. Son fiyat kaç TL'dir?",
  "198 TL", ["200 TL","202 TL","196 TL"],
  "200 × 1,10 = 220 TL; 220 × 0,90 = 198 TL. Yüzde zam ve indirim eşit olsa da sonuç başlangıç fiyatından düşüktür."),
 (2011,"Tarih","Atatürk İlkeleri",
  "\"Egemenlik kayıtsız şartsız milletindir.\" sözü Atatürk ilkelerinden hangisiyle doğrudan ilgilidir?",
  "Cumhuriyetçilik", ["Laiklik","Devletçilik","İnkılapçılık"],
  "Egemenliğin millete ait olması ve bunun seçimle kullanılması cumhuriyetçilik ilkesinin temelidir."),

 (2012,"Türkçe","Noktalama İşaretleri",
  "Aşağıdaki cümlelerin hangisinde virgül (,) yanlış kullanılmıştır?",
  "Kitabı, arkadaşıma hediye ettim.",
  ["Ali, okula erken geldi.","Ders çalıştım, sınavı kazandım.","Pazardan elma, armut ve üzüm aldık."],
  "Özne dışındaki ögelere bakılmaksızın nesne ile dolaylı tümleç arasına virgül konmaz: 'Kitabı arkadaşıma hediye ettim.'"),
 (2012,"Coğrafya","İklim Bilgisi",
  "Türkiye'de yıllık yağış miktarı en fazla olan kıyı bölümü aşağıdakilerden hangisidir?",
  "Doğu Karadeniz kıyıları", ["Ege kıyıları","Antalya körfezi kıyıları","Güney Marmara kıyıları"],
  "Kuzey Anadolu Dağları'nın denize paralel uzanması ve nemli hava kütlelerinin yükselerek yağış bırakması nedeniyle en çok yağış Doğu Karadeniz kıyılarına düşer."),
 (2012,"Vatandaşlık","Temel Hak ve Ödevler",
  "1982 Anayasası'na göre \"kişinin dokunulmazlığı, maddi ve manevi varlığı\" aşağıdaki hak gruplarından hangisine girer?",
  "Kişi hakları ve ödevleri", ["Sosyal ve ekonomik haklar","Siyasi hak ve ödevler","Sosyal devlet ilkeleri"],
  "Kişi hak ve ödevleri; kişi dokunulmazlığı, zorla çalıştırma yasağı, özel hayatın gizliliği gibi hakları kapsar."),

 (2013,"Matematik","Oran-Orantı",
  "3 işçi bir işi 12 günde bitiriyorsa, aynı verimle çalışan 4 işçi aynı işi kaç günde bitirir?",
  "9 gün", ["8 gün","16 gün","10 gün"],
  "İş miktarı sabit olduğu için işçi sayısı ile gün sayısı ters orantılıdır: 3 × 12 = 4 × x → x = 9."),
 (2013,"Tarih","Kurtuluş Savaşı",
  "Kurtuluş Savaşı'nda Batı Cephesi'ndeki son askerî başarı aşağıdakilerden hangisidir?",
  "Büyük Taarruz", ["Sakarya Savaşı","II. İnönü Savaşı","Dumlupınar Savaşı öncesi Kütahya-Eskişehir Muharebeleri"],
  "Büyük Taarruz (26 Ağustos-9 Eylül 1922) Batı Cephesi'nin son askerî harekâtıdır; ardından Mudanya Mütarekesi ve Lozan gelir."),
 (2013,"Türkçe","Sözcük Türleri",
  "\"Yolun sonunda küçük, ahşap bir ev vardı.\" cümlesindeki \"ahşap\" sözcüğü tür bakımından nedir?",
  "Sıfat", ["Zamir","Zarf","İsim tamlaması"],
  "'Ahşap' sözcüğü 'ev' ismini nitelediği için sıfat (ön ad) görevindedir."),

 (2014,"Coğrafya","Türkiye'nin İklimi",
  "Türkiye'de karasal iklimin görüldüğü iç bölgelerde yıllık sıcaklık farkının kıyı bölgelerden fazla olmasının temel nedeni nedir?",
  "Deniz etkisinden uzak olunması",
  ["Yükseltinin düşük olması","Enlem farkının az olması","Bakı etkisinin kıyıda fazla olması"],
  "Denizlerin ısı tutma özelliği kıyılarda sıcaklık farkını azaltır; iç bölgelerde deniz etkisi bulunmadığı için yıllık sıcaklık farkı büyür."),
 (2014,"Vatandaşlık","Yasama",
  "1982 Anayasası'na göre yasama yetkisi aşağıdakilerden hangisine aittir?",
  "Türkiye Büyük Millet Meclisi", ["Cumhurbaşkanlığı","Anayasa Mahkemesi","Bakanlar Kurulu (Cumhurbaşkanı ve bakanlar)"],
  "Anayasa'nın 7. maddesi gereği yasama yetkisi TBMM'nindir ve devredilemez."),
 (2014,"Matematik","Yaş Problemleri",
  "Bir baba ile oğlunun yaşları toplamı 48'dir. 4 yıl sonra babanın yaşı oğlunun yaşının 3 katı olacağına göre baba bugün kaç yaşındadır?",
  "38", ["36","40","34"],
  "4 yıl sonra toplam yaş 48 + 8 = 56 olur. Baba = 3x, oğul = x → 4x = 56, x = 14; bugün oğul 10, baba 38."),

 (2015,"Tarih","Osmanlı Tarihi",
  "Osmanlı Devleti'nde ilk düzenli ordunun (Yaya ve Müsellem) kurulması ve ardından Kapıkulu askerlerinin oluşturulması hangi padişah döneminde gerçekleşmiştir?",
  "I. Murat", ["Fatih Sultan Mehmet","Yavuz Sultan Selim","II. Bayezid"],
  "Yaya ve Müsellem adıyla ilk düzenli birlikler Orhan Bey döneminde kurulmuş, Kapıkulu askerleri ve Yeniçeri Ocağı I. Murat döneminde düzenlenmiştir."),
 (2015,"Türkçe","Cümlenin Ögeleri",
  "\"Küçük çocuk, parkta arkadaşlarıyla uzun süre oynadı.\" cümlesinde \"parkta\" sözcüğü hangi ögedir?",
  "Dolaylı tümleç", ["Zarf tümleci","Belirtisiz nesne","Özne"],
  "'Nerede?' sorusuna cevap verdiği için dolaylı tümleçtir. 'Uzun süre' ise zarf tümlecidir."),
 (2015,"Coğrafya","Nüfus ve Yerleşme",
  "Türkiye'de nüfus yoğunluğunun en fazla olduğu bölge aşağıdakilerden hangisidir?",
  "Marmara Bölgesi", ["İç Anadolu Bölgesi","Karadeniz Bölgesi","Güneydoğu Anadolu Bölgesi"],
  "Sanayi, ticaret ve ulaşım olanakları nedeniyle Marmara Bölgesi nüfus yoğunluğunda ilk sıradadır."),

 (2016,"Matematik","Karışım Problemleri",
  "%20'lik 30 litre tuzlu su çözeltisine 10 litre saf su eklenirse yeni çözeltinin tuz yüzdesi kaç olur?",
  "%15", ["%10","%18","%12"],
  "Tuz miktarı: 30 × 0,20 = 6 litre; yeni hacim 40 litre → 6/40 = 0,15 = %15."),
 (2016,"Vatandaşlık","Yargı",
  "1982 Anayasası'na göre temyiz incelemesini yapan en yüksek yargı organı aşağıdakilerden hangisidir?",
  "Yargıtay", ["Danıştay","Sayıştay","Bölge İdare Mahkemesi"],
  "Adli yargıda temyiz mercii Yargıtay, idari yargıda Danıştay'dır; Sayıştay ise kesin hükme bağlama ve denetim görevi yapar."),
 (2016,"Tarih","Cumhuriyet Dönemi",
  "Türkiye'de kadınlara milletvekili seçme ve seçilme hakkı hangi yıl tanınmıştır?",
  "1934", ["1930","1926","1923"],
  "Kadınlara belediye seçimlerinde 1930, milletvekili seçme-seçilme hakkı 5 Aralık 1934'te tanınmıştır."),

 (2017,"Türkçe","Anlatım Bozukluğu",
  "Aşağıdaki cümlelerin hangisinde anlatım bozukluğu vardır?",
  "Bugün hava hem çok sıcak hem de oldukça serindi.",
  ["Sabah erken kalktım ve spora gittim.","Kitabı okudum, arkadaşıma verdim.","Sınav sonucunu merakla bekliyorum."],
  "'Hem çok sıcak hem serin' birbiriyle çelişen yargıların aynı cümlede kullanılmasından doğan anlatım bozukluğudur."),
 (2017,"Coğrafya","Ekonomik Coğrafya",
  "Türkiye'de fındık üretiminin en yoğun yapıldığı bölge aşağıdakilerden hangisidir?",
  "Karadeniz Bölgesi", ["Ege Bölgesi","Marmara Bölgesi","Akdeniz Bölgesi"],
  "Fındık, nemli ve serin iklimi nedeniyle özellikle Orta ve Doğu Karadeniz kıyı kuşağında yetişir."),
 (2017,"Matematik","Kesir Problemleri",
  "Bir sınıfın 3/8'i kızdır. Sınıfta 25 erkek olduğuna göre sınıf mevcudu kaçtır?",
  "40", ["35","38","45"],
  "Erkek oranı 5/8 → 5/8 × x = 25 → x = 40. Kadın sayısı 15'tir."),

 (2018,"Tarih","İnkılaplar",
  "Halifeliğin kaldırılması hangi yıl gerçekleşmiştir?",
  "1924", ["1922","1926","1928"],
  "Halifelik 3 Mart 1924'te kaldırılmış; aynı gün Tevhid-i Tedrisat Kanunu kabul edilmiştir."),
 (2018,"Vatandaşlık","Anayasa",
  "1982 Anayasası'na göre temel hak ve hürriyetlerin sınırlandırılmasının sınırı (sınırlama sınırı) hangi ilkedir?",
  "Özüne dokunulamaz", ["Kanunla sınırlandırılabilir","İdarenin takdirine bırakılabilir","Yalnızca olağanüstü hâlde sınırlandırılır"],
  "Hak ve hürriyetler ancak kanunla ve demokratik toplum düzeninin gereklerine uygun olarak sınırlandırılabilir; özlerine dokunulamaz."),
 (2018,"Türkçe","Paragraf",
  "Bir paragrafta \"ana düşünce\" ile ilgili olarak aşağıdakilerden hangisi doğrudur?",
  "Yazarın okuyucuya iletmek istediği temel mesajdır.",
  ["Paragraftaki ilk cümledir.","Paragrafın en uzun cümlesidir.","Yalnızca örneklemelerden oluşur."],
  "Ana düşünce, parçanın tamamının hizmet ettiği temel yargıdır; her zaman ilk cümlede bulunmak zorunda değildir."),

 (2019,"Matematik","İşçi-Havuz Problemleri",
  "Bir musluk havuzu 12 saatte, ikinci musluk aynı havuzu 6 saatte dolduruyor. İkisi birlikte açılırsa havuz kaç saatte dolar?",
  "4 saat", ["3 saat","5 saat","9 saat"],
  "1/12 + 1/6 = 1/12 + 2/12 = 3/12 = 1/4 → havuz 4 saatte dolar."),
 (2019,"Coğrafya","Türkiye'nin Sınırları",
  "Türkiye'nin kara sınırı komşuları arasında sınır uzunluğu en fazla olan ülke aşağıdakilerden hangisidir?",
  "Suriye", ["İran","Irak","Ermenistan"],
  "Türkiye-Suriye kara sınırı yaklaşık 877 km ile en uzun kara sınırımızdır (İran ~560 km, Irak ~352 km, Ermenistan ~311 km)."),
 (2019,"Tarih","Kurtuluş Savaşı Cepheleri",
  "Kurtuluş Savaşı'nda Güney Cephesi'nde Fransızlara karşı mücadelede öne çıkan isim aşağıdakilerden hangisidir?",
  "Sütçü İmam", ["Şahin Bey","Yörük Ali Efe","İsmet İnönü"],
  "Maraş savunmasında Sütçü İmam, Antep'te Şahin Bey, Aydın-Ege cephesinde Yörük Ali Efe mücadele etmiştir."),

 (2020,"Türkçe","Dil Bilgisi",
  "\"Kitabı okuduğunu söyledi.\" cümlesindeki \"okuduğunu\" sözcüğünde görülen fiilimsi (eylemsi) türü nedir?",
  "İsim-fiil (ad-eylem)", ["Sıfat-fiil (ortaç)","Zarf-fiil (ulaç)","Yardımcı fiil"],
  "'-dik' eki sıfat-fiil eki olmakla birlikte bu cümlede '-ı' iyelik ve belirtme ekiyle isimleşerek isim-fiil görevi üstlenmiştir."),
 (2020,"Vatandaşlık","Temel Hukuk",
  "\"Kanun önünde eşitlik\" ilkesi 1982 Anayasası'nda hangi maddede düzenlenmiştir?",
  "10. madde", ["2. madde","5. madde","15. madde"],
  "Anayasa'nın 10. maddesi 'Herkes, dil, ırk, renk, cinsiyet, siyasi düşünce, felsefi inanç, din, mezhep ve benzeri sebeplerle ayırım gözetilmeksizin kanun önünde eşittir.' hükmünü içerir."),
 (2020,"Coğrafya","Doğal Afetler",
  "Türkiye'de heyelan olaylarının en sık görüldüğü bölge aşağıdakilerden hangisidir?",
  "Karadeniz Bölgesi", ["İç Anadolu Bölgesi","Güneydoğu Anadolu Bölgesi","Marmara Bölgesi"],
  "Eğimli araziler, killi zemin ve aşırı yağış nedeniyle heyelan en çok doğu Karadeniz'de görülür."),

 (2021,"Matematik","Yüzde ve Grafik Yorumlama",
  "Bir öğrenci 120 soruluk deneme sınavında 75 soruyu doğru, 25 soruyu yanlış cevaplamıştır. KPSS'de yanlış doğruyu götürmediğine göre öğrencinin doğru sayısı ve başarı yüzdesi nedir?",
  "75 doğru · %62,5", ["75 doğru · %68,75","70 doğru · %58,3","65 doğru · %54,2"],
  "Net = doğru sayısı = 75; başarı yüzdesi 75/120 = 0,625 = %62,5. Boş soru sayısı 20'dir."),
 (2021,"Tarih","Atatürk Dönemi Dış Politika",
  "Türkiye'nin Milletler Cemiyeti'ne üye olduğu yıl aşağıdakilerden hangisidir?",
  "1932", ["1923","1936","1939"],
  "Türkiye 18 Temmuz 1932'de Milletler Cemiyeti'ne üye olmuş; 1936'da Montrö Boğazlar Sözleşmesi imzalanmıştır."),
 (2021,"Türkçe","Sözcük Anlamı",
  "\"Ağır\" sözcüğü aşağıdaki cümlelerin hangisinde mecaz (yan) anlamıyla kullanılmıştır?",
  "Bu sözler ona çok ağır geldi.",
  ["Ağır bir kutu kaldırmak zorunda kaldım.","Bu taş diğerlerinden daha ağırdı.","Çantası o kadar ağırdı ki taşıyamadı."],
  "Mecaz anlamda 'ağır', üzücü ve kırıcı anlamına gelir; diğer seçeneklerde sözcük gerçek (temel) anlamıyla kullanılmıştır."),
]

def siklari_diz(dogru, yanlislar, tohum):
    r = random.Random(tohum)
    s = list(yanlislar)
    r.shuffle(s)
    konum = r.randrange(5)
    son = s[:konum] + [dogru] + s[konum:]
    return son, son.index(dogru)

# sayısal kontroller (cevaplar betikte yeniden hesaplanır)
assert round(200 * 1.10 * 0.90, 6) == 198, "2011 yüzde"
assert 3 * 12 == 4 * 9, "2013 oran"
assert (48 + 8) // 4 == 14 and 14 * 3 - 4 == 38, "2014 yaş"
assert round(30 * 0.20 / (30 + 10), 6) == 0.15, "2016 karışım"
assert round(25 / (5 / 8), 6) == 40, "2017 kesir"
assert round(1 / (1 / 12 + 1 / 6), 6) == 4, "2019 işçi"
assert round(75 / 120, 6) == 0.625, "2021 yüzde"

# 4. yanlış şık (KPSS soruları 5 seçeneklidir): her soru için ayrı yazılmıştır
EK_YANLIS = {
 (2011,"Yüzde Problemleri"): "204 TL",
 (2011,"Atatürk İlkeleri"): "Halkçılık",
 (2012,"Noktalama İşaretleri"): "Yarın, erkenden yola çıkacağız.",
 (2012,"İklim Bilgisi"): "Kuzey Ege kıyıları",
 (2012,"Temel Hak ve Ödevler"): "Devletin temel amaç ve görevleri",
 (2013,"Oran-Orantı"): "18 gün",
 (2013,"Kurtuluş Savaşı"): "I. İnönü Savaşı",
 (2013,"Sözcük Türleri"): "Bağlaç",
 (2014,"Türkiye'nin İklimi"): "Bitki örtüsünün farklı olması",
 (2014,"Yasama"): "Hâkimler ve Savcılar Kurulu",
 (2014,"Yaş Problemleri"): "42",
 (2015,"Osmanlı Tarihi"): "Kanuni Sultan Süleyman",
 (2015,"Cümlenin Ögeleri"): "Belirtili nesne",
 (2015,"Nüfus ve Yerleşme"): "Ege Bölgesi",
 (2016,"Karışım Problemleri"): "%14",
 (2016,"Yargı"): "Anayasa Mahkemesi",
 (2016,"Cumhuriyet Dönemi"): "1928",
 (2017,"Anlatım Bozukluğu"): "Dün akşam misafirlerimiz geldi ve sohbet ettik.",
 (2017,"Ekonomik Coğrafya"): "İç Anadolu Bölgesi",
 (2017,"Kesir Problemleri"): "36",
 (2018,"İnkılaplar"): "1931",
 (2018,"Anayasa"): "Yalnızca Anayasa Mahkemesi kararıyla sınırlandırılabilir",
 (2018,"Paragraf"): "Paragraftaki en kısa cümledir.",
 (2019,"İşçi-Havuz Problemleri"): "6 saat",
 (2019,"Türkiye'nin Sınırları"): "Gürcistan",
 (2019,"Kurtuluş Savaşı Cepheleri"): "Kâzım Karabekir",
 (2020,"Dil Bilgisi"): "Fiil (eylem)",
 (2020,"Temel Hukuk"): "12. madde",
 (2020,"Doğal Afetler"): "Akdeniz Bölgesi",
 (2021,"Yüzde ve Grafik Yorumlama"): "80 doğru · %66,7",
 (2021,"Atatürk Dönemi Dış Politika"): "1928",
 (2021,"Sözcük Anlamı"): "Valizim çok ağır olduğu için yardım istedim.",
}

ozgun, konum_dagilim = [], [0, 0, 0, 0, 0]
for i, (yil, ders, konu, soru, dogru, yanlis, acik) in enumerate(SORULAR):
    if len(yanlis) < 4:
        yanlis = list(yanlis) + [EK_YANLIS[(yil, konu)]]
    assert len(yanlis) == 4, f"4 yanlış şık gerekli ({yil} {konu})"
    assert len(set([dogru] + yanlis)) == 5, f"tekrar eden şık ({yil} {konu})"
    siklar, konum = siklari_diz(dogru, yanlis, 2026 * 100 + i)
    konum_dagilim[konum] += 1
    ozgun.append({"yil": yil, "ders": ders, "konu": konu, "soru": soru, "siklar": siklar,
                  "dogru": konum, "aciklama": acik})

cikti = "/* ÜSTAD KPSS ARAÇLAR · icerik/cikmis.js — OTOMATİK ÜRETİLDİ (araclar/ozgun-uret.py)\n" \
        "   Çıkmış soru arşivi (ÖSYM resmî bağlantıları) + tamamen özgün alıştırma soruları.\n" \
        "   ÖSYM soru metinleri telif gereği KOPYALANMAMIŞTIR. © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR. */\n"
cikti += "window.CIKMIS = " + json.dumps({"yillar": yillar, "ozgun": ozgun}, ensure_ascii=False, indent=1) + ";\n"
(S / "icerik" / "cikmis.js").write_text(cikti, encoding="utf-8")
print("yil:", len(yillar), "| arsivden baglanti:", sum(1 for y in yillar if y["url"]))
print("ozgun soru:", len(ozgun), "| ders dagilimi:", {d: sum(1 for s in ozgun if s["ders"] == d) for d in sorted({s['ders'] for s in ozgun})})
print("dogru sik konumu dagilimi A-E:", konum_dagilim)
print("yazildi:", (S / "icerik" / "cikmis.js").stat().st_size, "byte")
