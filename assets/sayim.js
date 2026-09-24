/* ÜSTAD KPSS ARAÇLAR · sayim.js — sınav geri sayımı + hatırlatıcı
   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */
(function () {
  "use strict";
  var S = window.SAYIM = window.SAYIM || {};

  S.hedefler = function () {
    var t = window.TAKVIM || { sinavlar: [] };
    return t.sinavlar.map(function (s) {
      return { ad: s.ad, zaman: new Date(s.tarih).getTime(), ham: s, tur: "sinav" };
    }).sort(function (a, b) { return a.zaman - b.zaman; });
  };
  S.siradaki = function () {
    var simdi = Date.now(), hs = S.hedefler(), sec = null;
    for (var i = 0; i < hs.length; i++) { if (hs[i].zaman > simdi) { sec = hs[i]; break; } }
    if (!sec) sec = hs[hs.length - 1];
    var kalan = sec.zaman - simdi, gun = Math.floor(kalan / 86400000);
    return { s: sec, gun: gun > 0 ? gun : 0, gecti: kalan <= 0 };
  };

  function sayiYaz(sec, deger) { var e = window.ARAC.$(sec); if (e) e.textContent = deger < 10 ? "0" + deger : String(deger); }

  function tikle() {
    var sd = S.siradaki();
    var e = window.ARAC.$("#sayimHedefAd"); if (e) e.textContent = sd.s.ad;
    var kalan = sd.s.zaman - Date.now();
    if (kalan < 0) kalan = 0;
    var gun = Math.floor(kalan / 86400000),
        sa = Math.floor(kalan % 86400000 / 3600000),
        dk = Math.floor(kalan % 3600000 / 60000),
        sn = Math.floor(kalan % 60000 / 1000);
    sayiYaz("#sbGun", gun); sayiYaz("#sbSaat", sa); sayiYaz("#sbDakika", dk); sayiYaz("#sbSaniye", sn);
    var not = window.ARAC.$("#sayimNot");
    if (not) {
      var t = new Date(sd.s.zaman);
      not.innerHTML = "<b>" + window.ARAC.tarihYazi(t) + "</b> · saat " + (t.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })) +
        (sd.s.ham && sd.s.ham.not ? " · " + sd.s.ham.not : "");
    }
  }

  function listeCiz() {
    var kap = window.ARAC.$("#sayimListe"); if (!kap) return;
    var simdi = Date.now(), hs = S.hedefler(), sirada = S.siradaki();
    kap.innerHTML = hs.map(function (h) {
      var fark = h.zaman - simdi, gecti = fark <= 0;
      var gun = Math.floor(Math.abs(fark) / 86400000);
      var yazi = gecti ? "yapıldı" : gun + " gün " + Math.floor(Math.abs(fark) % 86400000 / 3600000) + " saat";
      return '<div class="hedef' + (gecti ? " gecti" : (h === sirada.s ? " simdi" : "")) + '">' +
        '<div class="hg"><b>' + h.ad + '</b><span>' + window.ARAC.tarihYazi(new Date(h.zaman)) +
        (h.ham && h.ham.sure ? " · " + h.ham.sure : "") + "</span></div>" +
        '<span class="kalan">' + yazi + "</span></div>";
    }).join("");
    var tk = window.TAKVIM || { sonuclar: [] };
    if (tk.sonuclar && tk.sonuclar.length) {
      kap.innerHTML += '<div style="margin-top:14px"><h2 class="kucuk">🎯 Sonuç açıklama tarihleri</h2>' +
        tk.sonuclar.map(function (s) {
          var t = new Date(s.tarih), gecti = t.getTime() < simdi;
          var kalan = Math.floor((t.getTime() - simdi) / 86400000);
          return '<div class="hedef gecti" style="border-left-color:var(--hesap)"><div class="hg"><b>' + s.ad +
            '</b><span>' + window.ARAC.tarihYazi(t) + '</span></div><span class="kalan">' +
            (gecti ? "açıklandı" : kalan + " gün") + "</span></div>";
        }).join("") + "</div>";
    }
  }

  function yapiCiz() {
    var t = window.TAKVIM || {}, y = t.yapi; if (!y) return;
    var e = window.ARAC.$("#yapiAciklama");
    if (e) e.innerHTML = y.oturum + "<br><b>Kural:</b> " + y.kural;
    var tb = window.ARAC.$("#yapiTablo tbody"); if (!tb) return;
    tb.innerHTML = y.testler.map(function (x) {
      return "<tr><td>" + x.ad + "</td><td>" + x.ders + '</td><td class="rakam">' + x.soru + "</td></tr>";
    }).join("") + '<tr><td><b>Toplam</b></td><td>Genel Yetenek + Genel Kültür</td><td class="rakam"><b>' +
      y.testler.reduce(function (a, b) { return a + b.soru; }, 0) + "</b></td></tr>";
  }

  /* sınav günü hatırlatıcıları (APK'da cihaz bildirimi, tarayıcıda izin) */
  S.hatirlatici = function () {
    var sd = S.siradaki();
    if (sd.gecti) { alert("Şu an yaklaşan sınav yok (ÖSYM takvimi güncellenince eklenir)."); return; }
    var kalan = sd.s.zaman - Date.now();
    var plan = [
      { ad: "7 gün kaldı", ms: kalan - 7 * 86400000 },
      { ad: "1 gün kaldı", ms: kalan - 86400000 },
      { ad: "sınav sabahı 07.00", ms: kalan - 3 * 3600000 - 15 * 60000 }
    ];
    window.ARAC.bildirimSor(function (durum) {
      var d = window.ARAC.$("#hatirlaticiDurum");
      if (d) d.textContent = "izin: " + durum;
      var kurulan = 0;
      plan.forEach(function (p) {
        if (p.ms <= 0) return;
        setTimeout(function () {
          window.ARAC.bildirim("ÜSTAD KPSS · " + p.ad, sd.s.ad + " — " + window.ARAC.tarihYazi(new Date(sd.s.zaman)));
        }, p.ms);
        kurulan++;
      });
      window.ARAC.konus("Hatırlatıcı kuruldu. Sınava son " + sd.gun + " gün.");
      alert(kurulan + " hatırlatıcı planlandı (" + sd.s.ad + ").\nNot: Uygulama açıkken/tarayıcı açıkken çalışır; " +
        "APK kurulumunda cihaz bildirimi olarak da gösterilir.");
    });
  };

  function kur() {
    tikle(); listeCiz(); yapiCiz();
    setInterval(function () { tikle(); listeCiz(); }, 1000);
    var h = window.ARAC.$("#hatirlaticiAc");
    if (h) h.addEventListener("click", S.hatirlatici);
    var d = window.ARAC.$("#hatirlaticiDurum");
    if (d) {
      var izin = ("Notification" in window) ? Notification.permission : "desteklenmiyor";
      d.textContent = "durum: " + izin;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kur);
  else kur();
})();
