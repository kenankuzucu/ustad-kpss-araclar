/* ÜSTAD KPSS ARAÇLAR · cikmis.js — 2011-2021 çıkmış soru arşivi + özgün soru motoru
   Telif kuralı: ÖSYM soru metinleri kopyalanmaz; resmî kitapçığa bağlantı + özgün sorular verilir.
   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */
(function () {
  "use strict";
  var C = window.CIKMISMOD = window.CIKMISMOD || {};
  var A, seciliYil = null, sorular = [], sira = 0, durum = [];

  function veri() { return window.CIKMIS || { yillar: [], ozgun: [] }; }

  C.yilCiz = function () {
    var kap = A.$("#yilDugmeleri"); if (!kap) return;
    kap.innerHTML = veri().yillar.map(function (y) {
      return '<button class="dugme ikincil kucuk" data-yil="' + y.yil + '">' + y.yil + "</button>";
    }).join("");
    A.$$("#yilDugmeleri [data-yil]").forEach(function (b) {
      b.addEventListener("click", function () { C.detay(b.getAttribute("data-yil")); });
    });
    if (veri().yillar.length) C.detay(veri().yillar[veri().yillar.length - 1].yil);
  };

  C.detay = function (yil) {
    seciliYil = yil;
    var y = veri().yillar.filter(function (x) { return String(x.yil) === String(yil); })[0];
    var kap = A.$("#yilDetay"); if (!kap || !y) return;
    A.$$("#yilDugmeleri [data-yil]").forEach(function (b) {
      var sec = b.getAttribute("data-yil") === String(yil);
      b.className = "dugme kucuk" + (sec ? "" : " ikincil");
    });
    kap.innerHTML = '<div class="yil-kutu"><h3>📘 ' + y.yil + " · " + A.kacis(y.tur || "KPSS") + "</h3>" +
      '<div class="yapi">' + A.kacis(y.yapi || "Genel Yetenek-Genel Kültür (60 + 60 soru)") + "</div>" +
      (y.konu ? '<div class="satir" style="margin-top:9px">' + y.konu.map(function (k) {
        return '<span class="etiket">' + A.kacis(k) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="satir" style="margin-top:11px">' +
      (y.arsiv_url ? '<a class="dugme" href="' + A.kacis(y.arsiv_url) + '" target="_blank" rel="noopener" style="text-decoration:none">🏛 ÖSYM resmî kitapçık sayfası</a>' : "") +
      (y.url ? '<a class="dugme ikincil" href="' + A.kacis(y.url) + '" target="_blank" rel="noopener" style="text-decoration:none">📄 ' + y.yil + " kitapçığı (doğrulanmış PDF)</a>"
             : '<span class="etiket">doğrudan PDF bağlantısı doğrulanmadı — resmî sayfadan yıl seç</span>') +
      "</div>" +
      (y.not ? '<p class="aciklama" style="margin-top:9px">' + A.kacis(y.not) + "</p>" : "") + "</div>";
  };

  /* ÖSYM tarzında özgün sorular — anında geri bildirim, ilk cevaptan sonra kilit */
  C.sorulariHazirla = function (ders) {
    var hepsi = (veri().ozgun || []);
    sorular = ders ? hepsi.filter(function (s) { return s.ders === ders; }) : hepsi;
    sira = 0; durum = [];
    C.soruCiz();
  };

  C.soruCiz = function () {
    var kap = A.$("#ozgunAlan"); if (!kap) return;
    if (!sorular.length) { kap.innerHTML = '<p class="aciklama">Bu derste özgün soru bulunamadı.</p>'; return; }
    if (sira >= sorular.length) {
      var d = durum.filter(function (x) { return x; }).length;
      kap.innerHTML = '<div class="kart"><h2 class="kucuk">✅ Set bitti</h2><p class="aciklama">' +
        sorular.length + " sorunun " + d + " tanesini doğru cevapladın. Yüzde " +
        Math.round(d / sorular.length * 100) + ".</p>" +
        '<div class="satir"><button class="dugme" id="tekrarCoz">Baştan çöz</button>' +
        '<button class="dugme ikincil" id="yanlislariCoz">Yanlışları tekrar çöz</button></div></div>';
      A.$("#tekrarCoz").addEventListener("click", function () { C.sorulariHazirla(A.$("#ozgunDersler .dugme:not(.ikincil)") ?
        A.$("#ozgunDersler .dugme:not(.ikincil)").getAttribute("data-ders") : null); });
      A.$("#yanlislariCoz").addEventListener("click", function () {
        var y = sorular.filter(function (s, i) { return !durum[i]; });
        if (!y.length) { alert("Yanlışın yok, hepsini doğru cevapladın. 🎉"); return; }
        sorular = y; durum = []; sira = 0; C.soruCiz();
      });
      A.konus("Set bitti. " + d + " doğru.");
      return;
    }
    var s = sorular[sira];
    kap.innerHTML = '<div class="kart"><div class="satir" style="justify-content:space-between">' +
      '<span class="etiket">' + A.kacis(s.ders) + " · " + A.kacis(s.konu) + "</span>" +
      '<span class="etiket">Soru ' + (sira + 1) + " / " + sorular.length + "</span></div>" +
      '<p style="font-size:15px;line-height:1.6;margin:12px 0">' + A.kacis(s.soru) + "</p>" +
      '<div id="siklar">' + s.siklar.map(function (k, i) {
        return '<button class="dugme ikincil" data-sik="' + i + '" style="display:block;width:100%;text-align:left;margin-bottom:7px">' +
          "ABCDE".charAt(i) + ") " + A.kacis(k) + "</button>";
      }).join("") + "</div>" +
      '<div id="geriBildirim" style="margin-top:10px"></div>' +
      '<div class="satir" style="margin-top:10px"><button class="dugme" id="sonrakiSoru" style="display:none">Sonraki soru →</button></div></div>';
    var cevaplandi = false;
    A.$$("#siklar [data-sik]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (cevaplandi) return;
        cevaplandi = true;
        var verilen = parseInt(b.getAttribute("data-sik"), 10);
        var dogru = verilen === s.dogru;
        durum[sira] = dogru;
        A.$$("#siklar [data-sik]").forEach(function (c) {
          var i = parseInt(c.getAttribute("data-sik"), 10);
          if (i === s.dogru) { c.style.background = "#12a150"; c.style.color = "#fff"; c.style.borderColor = "#12a150"; }
          else if (i === verilen) { c.style.background = "#dc2626"; c.style.color = "#fff"; c.style.borderColor = "#dc2626"; }
          else c.style.opacity = "0.6";
        });
        var g = A.$("#geriBildirim");
        g.innerHTML = '<div class="sonuc-kutu" style="border-left:5px solid ' + (dogru ? "#12a150" : "#dc2626") + '">' +
          "<b>" + (dogru ? "✔ Doğru cevap verdin." : "✘ Yanlış. Doğru cevap: " + "ABCDE".charAt(s.dogru) + ") " + A.kacis(s.siklar[s.dogru])) + "</b>" +
          (s.aciklama ? "<div style='margin-top:6px;font-size:13.5px'>" + A.kacis(s.aciklama) + "</div>" : "") + "</div>";
        A.$("#sonrakiSoru").style.display = "";
        A.konus(dogru ? "Doğru cevap verdiniz." : "Yanlış. Doğru cevap " + "ABCDE".charAt(s.dogru) + ".");
      });
    });
    A.$("#sonrakiSoru").addEventListener("click", function () { sira++; C.soruCiz(); });
  };

  function kur() {
    A = window.ARAC;
    C.yilCiz();
    var dersler = [];
    (veri().ozgun || []).forEach(function (s) { if (dersler.indexOf(s.ders) < 0) dersler.push(s.ders); });
    var kap = A.$("#ozgunDersler");
    if (kap) {
      kap.innerHTML = '<button class="dugme" data-ders="">Tümü (' + (veri().ozgun || []).length + ")</button>" +
        dersler.map(function (d) {
          var n = (veri().ozgun || []).filter(function (s) { return s.ders === d; }).length;
          return '<button class="dugme ikincil" data-ders="' + A.kacis(d) + '">' + A.kacis(d) + " (" + n + ")</button>";
        }).join("");
      A.$$("#ozgunDersler [data-ders]").forEach(function (b) {
        b.addEventListener("click", function () {
          A.$$("#ozgunDersler .dugme").forEach(function (x) { x.className = "dugme ikincil"; });
          b.className = "dugme";
          C.sorulariHazirla(b.getAttribute("data-ders") || null);
        });
      });
    }
    C.sorulariHazirla(null);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kur);
  else kur();
})();
