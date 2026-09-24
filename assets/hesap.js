/* ÜSTAD KPSS ARAÇLAR · hesap.js — net + gösterge puan + deneme geçmişi
   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */
(function () {
  "use strict";
  var H = window.HESAP = window.HESAP || {};
  var A;

  /* Gösterge puan varsayımı (AÇIKÇA bildirilir, resmî puan DEĞİLDİR):
     GY-GK oturumunda adayların ortalama doğru sayısı ~55, standart sapma ~15 kabul edilir;
     ÖSYM standart puanı ortalama 50 / SS 10 olacak şekilde doğrusal eşlenir. */
  H.VARSAYIM = { ortalama: 55, ss: 15, puanOrt: 50, puanSS: 10 };
  H.gosterge = function (toplamDogru) {
    var v = H.VARSAYIM;
    var p = v.puanOrt + v.puanSS * (toplamDogru - v.ortalama) / v.ss;
    if (p < 0) p = 0; if (p > 100) p = 100;
    return Math.round(p * 10) / 10;
  };

  function sayi(sec) { var e = A.$(sec); var v = parseInt(e && e.value ? e.value : "0", 10); return isNaN(v) ? 0 : v; }
  function bos(sec, dogru, yanlis, toplam) {
    var e = A.$(sec); if (!e) return;
    var b = toplam - dogru - yanlis;
    e.textContent = "boş: " + (b < 0 ? "!" : b);
    e.style.background = b < 0 ? "#ffd9d9" : "";
  }

  function oku() {
    var gyD = sayi("#gyDogru"), gyY = sayi("#gyYanlis"), gkD = sayi("#gkDogru"), gkY = sayi("#gkYanlis");
    var hata = [];
    if (gyD + gyY > 60) hata.push("Genel Yetenek: doğru + yanlış 60'ı geçemez.");
    if (gkD + gkY > 60) hata.push("Genel Kültür: doğru + yanlış 60'ı geçemez.");
    return { gyD: gyD, gyY: gyY, gkD: gkD, gkY: gkY, tDogru: gyD + gkD, tYanlis: gyY + gkY, hata: hata };
  }

  H.hesapla = function (sessiz) {
    bosGuncelle();
    var o = oku(), kap = A.$("#hesapSonuc");
    if (o.hata.length) {
      if (kap) kap.innerHTML = '<span style="color:#c62828">✘ ' + o.hata.join(" ") + "</span>";
      return null;
    }
    var yuzde = Math.round(o.tDogru / 120 * 1000) / 10;
    var hedef = sayi("#hedefDogru");
    var fark = o.tDogru - hedef;
    var puan = H.gosterge(o.tDogru);
    var gyYuzde = Math.round(o.gyD / 60 * 1000) / 10, gkYuzde = Math.round(o.gkD / 60 * 1000) / 10;
    if (kap) {
      kap.innerHTML =
        '<div class="satir" style="gap:18px;align-items:flex-end">' +
          '<div><span class="etiket">TOPLAM DOĞRU</span><div><b class="buyuk">' + o.tDogru + '</b> / 120</div></div>' +
          '<div><span class="etiket">NET (KPSS: yanlış götürmez)</span><div><b class="buyuk">' + o.tDogru + "</b></div></div>" +
          '<div><span class="etiket">YÜZDE</span><div><b class="buyuk">' + yuzde + "%</b></div></div>" +
          '<div><span class="etiket">GÖSTERGE PUAN*</span><div><b class="buyuk">' + puan + "</b></div></div>" +
        "</div>" +
        '<table style="margin-top:12px"><thead><tr><th>Test</th><th>Doğru</th><th>Yanlış</th><th>Boş</th><th>Yüzde</th></tr></thead><tbody>' +
        "<tr><td>Genel Yetenek</td><td class='rakam'>" + o.gyD + "</td><td class='rakam'>" + o.gyY + "</td><td class='rakam'>" +
          (60 - o.gyD - o.gyY) + "</td><td class='rakam'>" + gyYuzde + "%</td></tr>" +
        "<tr><td>Genel Kültür</td><td class='rakam'>" + o.gkD + "</td><td class='rakam'>" + o.gkY + "</td><td class='rakam'>" +
          (60 - o.gkD - o.gkY) + "</td><td class='rakam'>" + gkYuzde + "%</td></tr>" +
        "</tbody></table>" +
        '<p class="aciklama" style="margin-top:10px">' +
        (fark >= 0 ? "🎯 Hedefini (" + hedef + " doğru) <b>" + fark + " doğru</b> aştın."
                   : "🎯 Hedefe <b>" + Math.abs(fark) + " doğru</b> kaldı (hedef " + hedef + ").") +
        "</p>" +
        '<p class="aciklama">* Gösterge puan varsayımla hesaplanır: ortalama ' + H.VARSAYIM.ortalama +
        " doğru, standart sapma " + H.VARSAYIM.ss + " → standart puan (ort. " + H.VARSAYIM.puanOrt +
        "/SS " + H.VARSAYIM.puanSS + "). Resmî KPSS puanı yalnızca ÖSYM sonuç belgesinde geçerlidir.</p>";
    }
    if (!sessiz) A.konus("Toplam " + o.tDogru + " doğru. Yüzde " + yuzde + ".");
    return o;
  };

  H.gecmisCiz = function () {
    var kap = A.$("#denemeGecmis"); if (!kap) return;
    var g = A.al("denemeler", []);
    if (!g.length) { kap.innerHTML = '<p class="aciklama">Henüz kayıtlı deneme yok. Yukarıda sayıları girip <b>Bu denemeyi kaydet</b>\'e bas.</p>'; return; }
    var enIyi = g.reduce(function (a, b) { return b.tDogru > a.tDogru ? b : a; }, g[0]);
    kap.innerHTML = '<p class="aciklama">Toplam ' + g.length + " deneme · en iyi: <b>" + enIyi.tDogru +
      " doğru</b> (" + new Date(enIyi.tarih).toLocaleDateString("tr-TR") + ")</p>" +
      '<table><thead><tr><th>#</th><th>Tarih</th><th>GY</th><th>GK</th><th>Doğru</th><th>Yüzde</th><th>Gösterge</th><th></th></tr></thead><tbody>' +
      g.slice().reverse().map(function (d, i) {
        return "<tr><td class='rakam'>" + (g.length - i) + "</td><td>" + new Date(d.tarih).toLocaleDateString("tr-TR") +
          "</td><td class='rakam'>" + d.gyD + "</td><td class='rakam'>" + d.gkD + "</td><td class='rakam'><b>" + d.tDogru +
          "</b></td><td class='rakam'>" + d.yuzde + "%</td><td class='rakam'>" + d.gosterge + "</td>" +
          '<td><button class="dugme ikincil kucuk" data-sil="' + d.id + '">sil</button></td></tr>';
      }).join("") + "</tbody></table>";
    A.$$("#denemeGecmis [data-sil]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-sil");
        A.koy("denemeler", A.al("denemeler", []).filter(function (x) { return x.id !== id; }));
        H.gecmisCiz(); A.panelCiz();
      });
    });
  };

  H.kaydet = function () {
    var o = H.hesapla(true);
    if (!o) { alert("Önce doğru/yanlış sayılarını düzelt."); return; }
    var g = A.al("denemeler", []);
    g.push({ id: "d" + Date.now(), tarih: new Date().toISOString(), gyD: o.gyD, gyY: o.gyY, gkD: o.gkD, gkY: o.gkY,
             tDogru: o.tDogru, yuzde: Math.round(o.tDogru / 120 * 1000) / 10, gosterge: H.gosterge(o.tDogru) });
    A.koy("denemeler", g);
    H.gecmisCiz(); A.panelCiz();
    alert("Deneme kaydedildi (" + o.tDogru + " doğru).");
  };

  H.temizle = function () {
    ["#gyDogru", "#gyYanlis", "#gkDogru", "#gkYanlis"].forEach(function (s) { var e = A.$(s); if (e) e.value = 0; });
    bosGuncelle();
    var k = A.$("#hesapSonuc"); if (k) k.innerHTML = "Doğru ve yanlış sayılarını girip <b>Hesapla</b>'ya bas.";
  };

  function bosGuncelle() { bos("#gyBos", sayi("#gyDogru"), sayi("#gyYanlis"), 60); bos("#gkBos", sayi("#gkDogru"), sayi("#gkYanlis"), 60); }

  function kur(g) {
    A = window.ARAC;
    ["#gyDogru", "#gyYanlis", "#gkDogru", "#gkYanlis"].forEach(function (s) {
      var e = A.$(s); if (e) e.addEventListener("input", function () { bosGuncelle(); H.hesapla(true); });
    });
    var b = A.$("#hesapla"); if (b) b.addEventListener("click", function () { H.hesapla(false); });
    var k = A.$("#denemeKaydet"); if (k) k.addEventListener("click", H.kaydet);
    var t = A.$("#temizle"); if (t) t.addEventListener("click", H.temizle);
    bosGuncelle(); H.gecmisCiz();
    if (g) A.guncelle = g;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { kur(); });
  else kur();
})();
