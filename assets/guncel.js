/* ÜSTAD KPSS ARAÇLAR · guncel.js — 2026 güncel bilgiler + hızlı tekrar
   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */
(function () {
  "use strict";
  var G = window.GUNCELMOD = window.GUNCELMOD || {};
  var A;

  function maddeler() { return (window.GUNCEL && window.GUNCEL.maddeler) ? window.GUNCEL.maddeler : []; }
  G.say = function () { return maddeler().length; };

  function filtrele() {
    var q = (A.$("#guncelArama").value || "").toLocaleLowerCase("tr-TR");
    var f = A.$("#guncelFiltre").value;
    return maddeler().filter(function (m) {
      if (f && m.konu !== f) return false;
      if (!q) return true;
      return (m.konu + " " + m.bilgi + " " + (m.etiketler || "")).toLocaleLowerCase("tr-TR").indexOf(q) >= 0;
    });
  }

  G.ciz = function () {
    var kap = A.$("#guncelListe"); if (!kap) return;
    var liste = filtrele();
    var ozet = A.$("#guncelOzet");
    if (ozet) ozet.textContent = maddeler().length + " güncel bilgi · " + liste.length + " gösteriliyor · derleme: " +
      ((window.GUNCEL && window.GUNCEL.derleme) || "-");
    if (!liste.length) {
      kap.innerHTML = '<div class="kart"><p class="aciklama">Kayıt yok. (Güncel bilgi paketi yüklenirken bu alan boş kalabilir.)</p></div>';
      return;
    }
    kap.innerHTML = liste.map(function (m, i) {
      return '<div class="guncel" data-madde="' + i + '">' +
        "<h3>" + A.kacis(m.konu) + (m.guvenilirlik === "orta" ? ' <span class="etiket">tek kaynak</span>' : "") + "</h3>" +
        "<p>" + A.kacis(m.bilgi) + "</p>" +
        (m.tarih ? '<span class="etiket">' + A.kacis(m.tarih) + "</span> " : "") +
        (m.kaynak_url ? '<a href="' + A.kacis(m.kaynak_url) + '" target="_blank" rel="noopener">kaynak: ' +
          A.kacis(m.kaynak_ad || "bağlantı") + "</a>" : "") +
        ' <button class="dugme ikincil kucuk" data-oku="' + i + '">🔊 Oku</button></div>';
    }).join("");
    A.$$("#guncelListe [data-oku]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = liste[parseInt(b.getAttribute("data-oku"), 10)];
        if (m) A.konus(m.konu + ". " + m.bilgi);
      });
    });
  };

  G.filtreDoldur = function () {
    var s = A.$("#guncelFiltre"); if (!s) return;
    var konular = [];
    maddeler().forEach(function (m) { if (m.konu && konular.indexOf(m.konu) < 0) konular.push(m.konu); });
    s.innerHTML = '<option value="">Tüm konular</option>' + konular.map(function (k) { return '<option>' + A.kacis(k) + "</option>"; }).join("");
  };

  /* Hızlı tekrar: 10 kart, "biliyorum / tekrar" — bilinmeyenler sona eklenir */
  G.quiz = function () {
    var kap = A.$("#guncelQuizAlan"); if (!kap) return;
    var hepsi = maddeler().slice();
    if (hepsi.length < 4) { alert("Güncel bilgi paketi yüklenmeden tekrar başlatılamaz."); return; }
    var sec = [];
    var kopya = hepsi.slice();
    while (sec.length < 10 && kopya.length) sec.push(kopya.splice(Math.floor(Math.random() * kopya.length), 1)[0]);
    var i = 0, bilinen = 0;
    function kart() {
      if (i >= sec.length) {
        kap.innerHTML = '<h2 class="kucuk">🎯 Tekrar bitti</h2><p class="aciklama">' + sec.length +
          " kartın " + bilinen + " tanesini biliyordun. " + (sec.length - bilinen) + " kart tekrar listesinde.</p>" +
          '<button class="dugme" id="quizKapat">Kapat</button>';
        A.$("#quizKapat").addEventListener("click", function () { kap.style.display = "none"; kap.innerHTML = ""; });
        A.konus("Tekrar bitti. " + bilinen + " kart bildin.");
        return;
      }
      var m = sec[i];
      kap.innerHTML = '<h2 class="kucuk">Kart ' + (i + 1) + " / " + sec.length + '</h2>' +
        '<div class="guncel"><h3>' + A.kacis(m.konu) + "</h3>" +
        '<p class="aciklama">Önce hatırlamaya çalış, sonra aç.</p>' +
        '<div id="quizCevap" style="display:none"><p>' + A.kacis(m.bilgi) + "</p>" +
        (m.kaynak_url ? '<a href="' + A.kacis(m.kaynak_url) + '" target="_blank" rel="noopener">kaynak: ' + A.kacis(m.kaynak_ad || "") + "</a>" : "") +
        "</div>" +
        '<div class="satir" style="margin-top:10px">' +
        '<button class="dugme" id="quizAc">Cevabı göster</button>' +
        '<button class="dugme ikincil" id="quizBil" style="display:none">✔ Biliyorum</button>' +
        '<button class="dugme ikincil" id="quizTekrar" style="display:none">🔁 Tekrar et</button>' +
        "</div></div>";
      A.$("#quizAc").addEventListener("click", function () {
        A.$("#quizCevap").style.display = "block";
        A.$("#quizAc").style.display = "none"; A.$("#quizBil").style.display = ""; A.$("#quizTekrar").style.display = "";
      });
      A.$("#quizBil").addEventListener("click", function () { bilinen++; i++; kart(); });
      A.$("#quizTekrar").addEventListener("click", function () { sec.push(m); i++; kart(); });
    }
    kap.style.display = ""; kart();
  };

  function kur() {
    A = window.ARAC;
    G.filtreDoldur(); G.ciz();
    var a = A.$("#guncelArama"); if (a) a.addEventListener("input", G.ciz);
    var f = A.$("#guncelFiltre"); if (f) f.addEventListener("change", G.ciz);
    var q = A.$("#guncelQuiz"); if (q) q.addEventListener("click", G.quiz);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kur);
  else kur();
})();
