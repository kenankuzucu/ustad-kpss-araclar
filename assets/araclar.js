/* ÜSTAD KPSS ARAÇLAR · araclar.js — çekirdek (menü, tema, depo, panel)
   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */
(function () {
  "use strict";
  var A = window.ARAC = window.ARAC || {};

  A.bolumler = [
    { kod: "panel",    ad: "Ana Sayfa",          simg: "🏠", renk: "var(--panel)" },
    { kod: "sayim",    ad: "Sınav Geri Sayımı",  simg: "⏳", renk: "var(--sayim)" },
    { kod: "hesap",    ad: "Net & Puan",         simg: "🧮", renk: "var(--hesap)" },
    { kod: "notlar",   ad: "Notlarım",           simg: "📝", renk: "var(--notlar)" },
    { kod: "guncel",   ad: "2026 Güncel Bilgiler", simg: "📰", renk: "var(--guncel)" },
    { kod: "cikmis",   ad: "Çıkmış Sorular",     simg: "📚", renk: "var(--cikmis)" },
    { kod: "ayarlar",  ad: "Ayarlar",            simg: "⚙️", renk: "var(--ayarlar)" },
    { kod: "hakkinda", ad: "Hakkında & Telif",   simg: "©️", renk: "var(--hakkinda)" }
  ];
  A.temalar = ["turkuaz","badem","lavanta","gul","gokyuzu","nane","kum","karanfil","fistik","antik","gece"];
  A.surum = function () {
    try { if (window.USTAD && window.USTAD.surum) { var v = window.USTAD.surum(); if (v) return v; } } catch (e) {}
    var m = document.querySelector("meta[name=surum]");
    return (m && m.getAttribute("content")) || "1.0";
  };

  /* ---- depo (localStorage) ---- */
  A.koy = function (k, v) { try { localStorage.setItem("kpssarac." + k, JSON.stringify(v)); } catch (e) {} };
  A.al = function (k, vars) {
    try { var s = localStorage.getItem("kpssarac." + k); return s === null ? vars : JSON.parse(s); }
    catch (e) { return vars; }
  };
  A.sil = function (k) { try { localStorage.removeItem("kpssarac." + k); } catch (e) {} };

  A.$ = function (s) { return document.querySelector(s); };
  A.$$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  A.tr = function (metin) { return String(metin).toLocaleUpperCase("tr-TR"); };
  A.tarihYazi = function (t) {
    var a = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    var g = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
    return t.getDate() + " " + a[t.getMonth()] + " " + t.getFullYear() + " · " + g[t.getDay()];
  };
  A.kacis = function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  /* ---- tema / yazı boyutu ---- */
  function temaUygula(kod) {
    document.documentElement.setAttribute("data-tema", kod);
    A.koy("tema", kod);
    A.$$("#temaDugmeleri .dugme").forEach(function (d) {
      d.className = "dugme" + (d.getAttribute("data-tema") === kod ? "" : " ikincil");
    });
  }
  function yaziBoyutUygula(yuzde) {
    document.body.style.fontSize = (15 * yuzde / 100) + "px";
    var e = A.$("#yaziBoyutYazi"); if (e) e.textContent = "%" + yuzde;
    A.koy("yaziboyut", yuzde);
  }

  /* ---- ses ---- */
  A.konus = function (metin) {
    if (!A.al("ses", true)) return;
    try { if (window.USTAD && window.USTAD.konus) { window.USTAD.konus(metin); return; } } catch (e) {}
    try {
      if (!window.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(metin);
      u.lang = "tr-TR"; u.pitch = 0.9; u.rate = 0.98;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e2) {}
  };

  /* ---- bildirim ---- */
  A.bildirim = function (baslik, metin) {
    try { if (window.USTAD && window.USTAD.bildir) { window.USTAD.bildir(baslik + " — " + metin); } } catch (e) {}
    try {
      if (!("Notification" in window)) return "yok";
      if (Notification.permission === "granted") { new Notification(baslik, { body: metin }); return "gönderildi"; }
      return Notification.permission;
    } catch (e2) { return "yok"; }
  };
  A.bildirimSor = function (donus) {
    try { if (!("Notification" in window)) { donus("yok"); return; } Notification.requestPermission().then(donus); }
    catch (e) { donus("hata"); }
  };

  /* ---- ekran gezinme ---- */
  A.git = function (kod) {
    A.$$(".ekran").forEach(function (e) { e.classList.remove("gorunur"); });
    var h = A.$("#ekran-" + kod); if (h) h.classList.add("gorunur");
    A.$$("#menuMaddeler .madde").forEach(function (d) {
      var sec = d.getAttribute("data-kod") === kod;
      d.className = "madde" + (sec ? " secili" : "");
      if (sec) d.style.background = d.getAttribute("data-renk");
      else d.style.background = "";
    });
    A.secili = kod;
    try { if (history.replaceState) history.replaceState(null, "", "#" + kod); else location.hash = kod; } catch (e) {}
    if (A.guncelle) A.guncelle(kod);
    try { window.scrollTo(0, 0); } catch (e) {}
  };

  /* ---- panel karoları ---- */
  function panelCiz() {
    var sayim = null;
    try { sayim = window.SAYIM && SAYIM.siradaki(); } catch (e) {}
    var notSayi = (A.al("notlar", []) || []).length;
    var guncelSayi = (window.GUNCEL && window.GUNCEL.maddeler ? window.GUNCEL.maddeler.length : 0);
    var kartlar = [
      { bas: (sayim ? sayim.gun : "—") + " gün", alt: "sınava kalan", renk: "var(--sayim)", kod: "sayim",
        simg: "⏳", acik: sayim ? sayim.s.ad : "Takvim yükleniyor" },
      { bas: notSayi + " not", alt: "kayıtlı notun", renk: "var(--notlar)", kod: "notlar", simg: "📝",
        acik: "Konu etiketli, aranabilir notlar" },
      { bas: guncelSayi + " bilgi", alt: "2026 güncel madde", renk: "var(--guncel)", kod: "guncel", simg: "📰",
        acik: "Her madde kaynaklıdır" },
      { bas: "2011-2021", alt: "çıkmış soru arşivi", renk: "var(--cikmis)", kod: "cikmis", simg: "📚",
        acik: "ÖSYM resmî kitapçık bağlantıları" }
    ];
    var kap = A.$("#panelKartlar"); if (!kap) return;
    kap.innerHTML = kartlar.map(function (k) {
      return '<div class="kart" style="border-left:5px solid ' + k.renk + ';cursor:pointer" data-git="' + k.kod + '">' +
        '<div style="font-size:22px">' + k.simg + '</div>' +
        '<div style="font-size:24px;font-weight:700;font-variant-numeric:tabular-nums">' + k.bas + '</div>' +
        '<div style="font-size:12.5px;color:var(--soluk)">' + k.alt + '</div>' +
        '<div style="font-size:12.5px;color:var(--soluk);margin-top:7px">' + k.acik + '</div></div>';
    }).join("");
    A.$$("#panelKartlar [data-git]").forEach(function (d) {
      d.addEventListener("click", function () { A.git(d.getAttribute("data-git")); });
    });
    // en yakın sınav özeti (canlı)
    var ps = A.$("#panelSayim");
    if (ps) {
      if (!sayim) { ps.innerHTML = '<p class="aciklama">Takvim yükleniyor…</p>'; }
      else {
        var t = new Date(sayim.s.zaman);
        ps.innerHTML = '<p style="font-size:16px;margin:0 0 6px"><b>' + A.kacis(sayim.s.ad) + "</b></p>" +
          '<p class="aciklama" style="margin:0 0 8px">' + A.tarihYazi(t) +
          (sayim.s.ham && sayim.s.ham.sure ? " · " + sayim.s.ham.sure : "") + "</p>" +
          (sayim.gecti ? '<span class="etiket">bu sınav yapıldı</span>'
            : '<span class="etiket" style="background:#e6f7ef">' + sayim.gun + ' gün kaldı</span>') +
          ' <button class="dugme ikincil kucuk" data-git="sayim">Geri sayımı aç</button>' +
          ' <button class="dugme ikincil kucuk" data-git="hesap">Net hesapla</button>';
        A.$$("#panelSayim [data-git]").forEach(function (d) {
          d.addEventListener("click", function () { A.git(d.getAttribute("data-git")); });
        });
      }
    }
  }

  /* ---- kurulum ---- */
  function kur() {
    // menü
    var m = A.$("#menuMaddeler");
    m.innerHTML = A.bolumler.map(function (b) {
      return '<button class="madde" data-kod="' + b.kod + '" data-renk="' + b.renk + '">' +
        '<span class="nokta" style="background:' + b.renk + '"></span>' + b.simg + " " + b.ad + "</button>";
    }).join("");
    A.$$("#menuMaddeler .madde").forEach(function (d) {
      d.addEventListener("click", function () { A.git(d.getAttribute("data-kod")); });
    });
    // tema düğmeleri
    var td = A.$("#temaDugmeleri");
    if (td) {
      td.innerHTML = A.temalar.map(function (t) {
        return '<button class="dugme ikincil" data-tema="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + "</button>";
      }).join("");
      A.$$("#temaDugmeleri .dugme").forEach(function (d) {
        d.addEventListener("click", function () { temaUygula(d.getAttribute("data-tema")); });
      });
    }
    temaUygula(A.al("tema", "turkuaz"));
    // yazı boyutu
    var yb = A.$("#yaziBoyut");
    if (yb) {
      yb.value = A.al("yaziboyut", 100);
      yaziBoyutUygula(parseInt(yb.value, 10));
      yb.addEventListener("input", function () { yaziBoyutUygula(parseInt(yb.value, 10)); });
    }
    // ses
    var sa = A.$("#sesAc");
    if (sa) { sa.checked = A.al("ses", true); sa.addEventListener("change", function () { A.koy("ses", sa.checked); }); }
    var sd = A.$("#sesDene");
    if (sd) sd.addEventListener("click", function () { A.konus("Merhaba! ÜSTAD KPSS Araçlar sesli okuma hazır."); });
    // kısayol düğmeleri
    A.$$("[data-git]").forEach(function (d) {
      d.addEventListener("click", function () { A.git(d.getAttribute("data-git")); });
    });
    // sürüm
    var s = A.surum();
    ["#surumYazi", "#hakSurum", "#altSurum"].forEach(function (sec) { var e = A.$(sec); if (e) e.textContent = s; });
    // saat
    function saat() { var e = A.$("#saatYazi"); if (e) e.textContent = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }); }
    saat(); setInterval(saat, 20000);
    // veri yedek/sil
    var ty = A.$("#tumYedek");
    if (ty) ty.addEventListener("click", function () {
      var veri = { notlar: A.al("notlar", []), denemeler: A.al("denemeler", []), tema: A.al("tema"), tarih: new Date().toISOString() };
      var b = new Blob([JSON.stringify(veri, null, 1)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = "ustad-kpss-araclar-yedek.json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    var ts = A.$("#tumSil");
    if (ts) ts.addEventListener("click", function () {
      if (!confirm("Notlar ve deneme geçmişi silinecek. Emin misin?")) return;
      A.sil("notlar"); A.sil("denemeler");
      if (window.NOTLAR) NOTLAR.ciz();
      if (window.HESAP) HESAP.gecmisCiz();
      panelCiz();
      alert("Veriler silindi.");
    });
    panelCiz();
    var ilk = (location.hash || "").replace("#", "");
    A.git(A.bolumler.some(function (b) { return b.kod === ilk; }) ? ilk : "panel");
    window.addEventListener("hashchange", function () {
      var k = (location.hash || "").replace("#", "");
      if (A.bolumler.some(function (b) { return b.kod === k; })) A.git(k);
    });
    A.kuruldu = true;
  }

  A.panelCiz = panelCiz;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kur);
  else kur();
})();
