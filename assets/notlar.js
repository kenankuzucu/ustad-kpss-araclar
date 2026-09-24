/* ÜSTAD KPSS ARAÇLAR · notlar.js — not defteri (ekle, ara, filtrele, yedekle)
   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */
(function () {
  "use strict";
  var N = window.NOTLAR = window.NOTLAR || {};
  var A;

  N.listele = function () { return A.al("notlar", []); };

  N.ciz = function () {
    var kap = A.$("#notListe"); if (!kap) return;
    var hepsi = N.listele();
    var q = (A.$("#notArama").value || "").toLocaleLowerCase("tr-TR");
    var f = A.$("#notFiltre").value;
    var liste = hepsi.filter(function (n) {
      if (f && n.ders !== f) return false;
      if (!q) return true;
      return (n.baslik + " " + n.govde + " " + n.ders).toLocaleLowerCase("tr-TR").indexOf(q) >= 0;
    }).sort(function (a, b) { return b.tarih - a.tarih; });
    var sayi = A.$("#notSayi"); if (sayi) sayi.textContent = hepsi.length + " not" + (liste.length !== hepsi.length ? " · " + liste.length + " gösteriliyor" : "");
    if (!liste.length) {
      kap.innerHTML = '<div class="kart"><p class="aciklama">' +
        (hepsi.length ? "Aramaya uyan not yok." : "Henüz not eklemedin. Yukarıdan başlık, ders ve not yazıp kaydet.") + "</p></div>";
      return;
    }
    kap.innerHTML = liste.map(function (n) {
      return '<div class="not"><h3>' + A.kacis(n.baslik || "(başlıksız)") + "</h3>" +
        '<div class="govde">' + A.kacis(n.govde) + "</div>" +
        '<div class="meta"><span class="etiket">' + A.kacis(n.ders) + "</span>" +
        "<span>" + new Date(n.tarih).toLocaleString("tr-TR") + "</span>" +
        '<span>' + (n.govde || "").length + " karakter</span>" +
        '<button class="dugme ikincil kucuk" data-oku="' + n.id + '">🔊 Oku</button>' +
        '<button class="dugme ikincil kucuk" data-duzenle="' + n.id + '">✏️ Düzenle</button>' +
        '<button class="dugme ikincil kucuk" data-sil="' + n.id + '">🗑 Sil</button></div></div>';
    }).join("");
    A.$$("#notListe [data-sil]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Not silinsin mi?")) return;
        A.koy("notlar", N.listele().filter(function (x) { return x.id !== b.getAttribute("data-sil"); }));
        N.ciz(); A.panelCiz();
      });
    });
    A.$$("#notListe [data-oku]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = N.listele().filter(function (x) { return x.id === b.getAttribute("data-oku"); })[0];
        if (n) A.konus(n.baslik + ". " + n.govde);
      });
    });
    A.$$("#notListe [data-duzenle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = N.listele().filter(function (x) { return x.id === b.getAttribute("data-duzenle"); })[0];
        if (!n) return;
        A.$("#notBaslik").value = n.baslik; A.$("#notDers").value = n.ders; A.$("#notGovde").value = n.govde;
        A.$("#notBaslik").setAttribute("data-duzenlenen", n.id);
        A.$("#notEkle").textContent = "Değişiklikleri kaydet";
        A.$("#notBaslik").focus();
      });
    });
  };

  N.ekle = function () {
    var baslik = A.$("#notBaslik").value.trim(), govde = A.$("#notGovde").value.trim(), ders = A.$("#notDers").value;
    if (!govde) { alert("Not metni boş olamaz."); return; }
    var duzenlenen = A.$("#notBaslik").getAttribute("data-duzenlenen");
    var liste = N.listele();
    if (duzenlenen) {
      liste.forEach(function (n) { if (n.id === duzenlenen) { n.baslik = baslik; n.govde = govde; n.ders = ders; n.tarih = Date.now(); } });
      A.$("#notBaslik").removeAttribute("data-duzenlenen");
      A.$("#notEkle").textContent = "Notu kaydet";
    } else {
      liste.push({ id: "n" + Date.now(), baslik: baslik, govde: govde, ders: ders, tarih: Date.now() });
    }
    A.koy("notlar", liste);
    N.temizle(); N.ciz(); A.panelCiz();
  };

  N.temizle = function () {
    A.$("#notBaslik").value = ""; A.$("#notGovde").value = "";
    A.$("#notBaslik").removeAttribute("data-duzenlenen");
    A.$("#notEkle").textContent = "Notu kaydet";
  };

  N.yedek = function () {
    var b = new Blob([JSON.stringify({ notlar: N.listele(), tarih: new Date().toISOString() }, null, 1)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = "ustad-kpss-notlarim.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  N.geriYukle = function (dosya) {
    var o = new FileReader();
    o.onload = function () {
      try {
        var v = JSON.parse(o.result);
        var gelen = v.notlar || v;
        if (!gelen.length) throw new Error("boş");
        var mevcut = N.listele();
        var yeni = gelen.filter(function (g) { return !mevcut.some(function (m) { return m.id === g.id; }); });
        A.koy("notlar", mevcut.concat(yeni));
        N.ciz(); A.panelCiz();
        alert(yeni.length + " not eklendi (mevcut " + mevcut.length + " not korundu).");
      } catch (e) { alert("Dosya okunamadı: " + e.message); }
    };
    o.readAsText(dosya);
  };

  function kur() {
    A = window.ARAC;
    var e = A.$("#notEkle"); if (e) e.addEventListener("click", N.ekle);
    var t = A.$("#notTemizle"); if (t) t.addEventListener("click", N.temizle);
    var a = A.$("#notArama"); if (a) a.addEventListener("input", N.ciz);
    var f = A.$("#notFiltre"); if (f) f.addEventListener("change", N.ciz);
    var y = A.$("#notYedek"); if (y) y.addEventListener("click", N.yedek);
    var g = A.$("#notGeri"), d = A.$("#notDosya");
    if (g && d) { g.addEventListener("click", function () { d.click(); }); d.addEventListener("change", function () { if (d.files[0]) N.geriYukle(d.files[0]); }); }
    N.ciz();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kur);
  else kur();
})();
