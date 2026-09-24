/* ÜSTAD KPSS ARAÇLAR · test.js — kendi kendini test (yalnızca ?test=1 ile çalışır)
   Kullanım: index.html?test=1  → sonuçlar sayfada ve document.title içinde görünür. */
(function () {
  "use strict";
  if (location.search.indexOf("test=1") < 0) return;
  var sonuc = [];
  function ok(ad, kosul, ek) { sonuc.push((kosul ? "✔" : "✘") + " " + ad + (ek ? " → " + ek : "")); return !!kosul; }

  window.addEventListener("load", function () {
    setTimeout(function () {
      var A = window.ARAC;
      // 1) takvim
      var tk = window.TAKVIM || {};
      ok("takvim: sınav listesi var", (tk.sinavlar || []).length >= 3, (tk.sinavlar || []).length + " kayıt");
      var sirali = (tk.sinavlar || []).every(function (s, i, a) { return i === 0 || new Date(a[i - 1].tarih) <= new Date(s.tarih); });
      ok("takvim: tarihler sıralı", sirali);
      ok("takvim: her kayıtta tarih/saat geçerli", (tk.sinavlar || []).every(function (s) { return !isNaN(new Date(s.tarih).getTime()); }));
      // 2) geri sayım
      var sd = window.SAYIM.siradaki();
      ok("sayım: sıradaki sınav seçildi", !!sd.s, sd.s.ad);
      ok("sayım: gün sayısı geçerli", sd.gun >= 0 && sd.gun < 400, sd.gun + " gün");
      ok("sayım: DOM'a yazıldı", /^\d\d$/.test(A.$("#sbGun").textContent), "sbGun=" + A.$("#sbGun").textContent);
      // 3) puan göstergesi
      ok("hesap: 55 doğru → 50,0", window.HESAP.gosterge(55) === 50, String(window.HESAP.gosterge(55)));
      ok("hesap: 70 doğru → 60,0", window.HESAP.gosterge(70) === 60, String(window.HESAP.gosterge(70)));
      ok("hesap: 120 doğru üst sınırda", window.HESAP.gosterge(120) <= 100, String(window.HESAP.gosterge(120)));
      ok("hesap: 0 doğru alt sınırda", window.HESAP.gosterge(0) >= 0, String(window.HESAP.gosterge(0)));
      // 4) net hesaplama akışı (gerçek DOM girişi)
      A.$("#gyDogru").value = 45; A.$("#gyYanlis").value = 10;
      A.$("#gkDogru").value = 40; A.$("#gkYanlis").value = 15;
      var o = window.HESAP.hesapla(true);
      ok("hesap: net = doğru (85)", o && o.tDogru === 85, o ? String(o.tDogru) : "null");
      ok("hesap: sonuç kutusu doldu", A.$("#hesapSonuc").innerHTML.indexOf("85") > 0);
      ok("hesap: boş = 60-doğru-yanlış", A.$("#gyBos").textContent.trim() === "boş: 5", A.$("#gyBos").textContent.trim());
      A.$("#gyYanlis").value = 90; var hata = window.HESAP.hesapla(true);
      ok("hesap: sınır aşımı engellendi", hata === null && A.$("#hesapSonuc").innerHTML.indexOf("✘") >= 0);
      A.$("#gyYanlis").value = 10;
      // 5) notlar
      A.$("#notBaslik").value = "Test Notu"; A.$("#notGovde").value = "Deneme amaçlı not metni.";
      window.NOTLAR.ekle();
      ok("notlar: kayıt eklendi", window.NOTLAR.listele().length >= 1, window.NOTLAR.listele().length + " not");
      ok("notlar: listeye yazıldı", A.$("#notListe").innerHTML.indexOf("Test Notu") > 0);
      A.$("#notArama").value = "bulunmayan-kelime"; window.NOTLAR.ciz();
      ok("notlar: arama filtreliyor", A.$("#notListe").innerHTML.indexOf("Test Notu") < 0);
      A.$("#notArama").value = ""; window.NOTLAR.ciz();
      var hepsi = window.NOTLAR.listele().filter(function (n) { return n.baslik === "Test Notu"; });
      A.koy("notlar", window.NOTLAR.listele().filter(function (n) { return n.baslik !== "Test Notu"; }));
      window.NOTLAR.ciz();
      ok("notlar: test kaydı temizlendi", hepsi.length >= 1);
      // 6) çıkmış sorular verisi
      var C = window.CIKMIS || { yillar: [], ozgun: [] };
      ok("çıkmış: 2011-2021 yıl listesi", C.yillar.length === 11 && C.yillar[0].yil === 2011 && C.yillar[10].yil === 2021, C.yillar.length + " yıl");
      var sikHatasi = C.ozgun.filter(function (s) {
        var hepsi2 = s.siklar.concat([s.siklar[s.dogru]]);
        return s.siklar.length !== 5 || new Set(s.siklar).size !== 5 || s.dogru < 0 || s.dogru > 4 || !s.soru || !s.aciklama;
      });
      ok("çıkmış: her soru 5 benzersiz şık + doğru indeks + açıklama", sikHatasi.length === 0,
         sikHatasi.length ? sikHatasi.length + " hatalı: " + sikHatasi[0].konu : C.ozgun.length + " soru temiz");
      var xsay = (C.ozgun || []).filter(function (s) { return /ÖSYM|çıkmış soru kitapçığı/.test(s.soru); }).length;
      ok("çıkmış: soru metinlerinde kopya izi yok", xsay === 0, xsay + " şüpheli");
      // 7) menü & ekranlar
      ok("arayüz: 8 menü maddesi", A.$$("#menuMaddeler .madde").length === 8, A.$$("#menuMaddeler .madde").length + "");
      ok("arayüz: 8 ekran var", A.$$(".ekran").length === 8, A.$$(".ekran").length + "");
      ok("arayüz: tema düğmeleri 11", A.$$("#temaDugmeleri .dugme").length === 11, A.$$("#temaDugmeleri .dugme").length + "");
      // sonuç tablosu
      var kap = document.createElement("div");
      kap.id = "testSonuc";
      kap.style.cssText = "position:fixed;inset:0;background:#fff;z-index:9999;padding:18px;overflow:auto;font:14px/1.7 monospace";
      kap.innerHTML = "<h2>ÜSTAD KPSS ARAÇLAR · kendi kendini test</h2>" + sonuc.map(function (s) { return "<div>" + s + "</div>"; }).join("") +
        "<hr><b>" + sonuc.filter(function (s) { return s.indexOf("✔") === 0; }).length + " / " + sonuc.length + " test geçti</b> " +
        (sonuc.some(function (s) { return s.indexOf("✘") === 0; }) ? "— BAŞARISIZ VAR" : "— HEPSİ TAMAM");
      document.body.appendChild(kap);
      document.title = "TEST " + sonuc.filter(function (s) { return s.indexOf("✔") === 0; }).length + "/" + sonuc.length;
    }, 400);
  });
})();
