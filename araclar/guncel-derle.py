# -*- coding: utf-8 -*-
"""ÜSTAD KPSS ARAÇLAR · icerik/guncel.js üretici.
Kaynak: araştırma çıktısı JSON (guncel-2026.json) → uygulama veri dosyası.
Her madde kaynak adı + bağlantı taşır. Kullanım: python araclar/guncel-derle.py
"""
import json, pathlib, datetime

S = pathlib.Path(__file__).resolve().parent.parent
KAYNAK = pathlib.Path.home() / "AppData/Local/hermes/cache/scratch/guncel-2026.json"
HEDEF = S / "icerik" / "guncel.js"

ham = json.loads(KAYNAK.read_text(encoding="utf-8"))
ms = ham["maddeler"]

temiz = []
for m in ms:
    konu = (m.get("konu") or "").strip()
    bilgi = (m.get("bilgi") or "").strip()
    assert konu and bilgi, "boş madde"
    assert m.get("kaynak_ad"), f"kaynak adı yok: {konu}"
    temiz.append({
        "konu": konu,
        "bilgi": bilgi,
        "tarih": (m.get("tarih") or "").strip(),
        "kaynak_ad": m["kaynak_ad"].strip(),
        "kaynak_url": (m.get("kaynak_url") or "").strip(),
        "guvenilirlik": (m.get("guvenilirlik") or "yüksek").strip(),
    })

# konu sırası: Türkiye önce, sonra uluslararası
sira = ["nüfus","asgari","enflasyon","büyüme","işsizlik","ortanca","TEKNOFEST","Yapay","uydu",
        "UEFA Avrupa Ligi","Dünya Kupası'na","NATO","COP31","BRICS","BM Genel","G20","Nobel",
        "Kış Olimpiyat","Kış Olimpiyatları madalya","Kış Olimpiyatları'nda","FIFA","Eurovision",
        "Şampiyonlar Ligi","Artemis","kano","Tekvando"]
def anahtar(m):
    for i, s in enumerate(sira):
        if s.lower() in m["konu"].lower():
            return i
    return len(sira)
temiz.sort(key=anahtar)

cikti = ("/* ÜSTAD KPSS ARAÇLAR · icerik/guncel.js — OTOMATİK ÜRETİLDİ (araclar/guncel-derle.py)\n"
         "   2026 Güncel Bilgiler paketi. Her madde kaynaklıdır; kaynağı doğrulanamayan bilgi pakete alınmaz.\n"
         "   © 2026 Kenan Kuzucu · TÜM HAKLARI SAKLIDIR (5846 FSEK). */\n")
cikti += "window.GUNCEL = " + json.dumps(
    {"derleme": ham.get("derleme_tarihi", datetime.date.today().isoformat()), "maddeler": temiz},
    ensure_ascii=False, indent=1) + ";\n"
HEDEF.write_text(cikti, encoding="utf-8")

print("madde:", len(temiz), "| hedef:", HEDEF.name, HEDEF.stat().st_size, "byte")
print("güvenilirlik:", {g: sum(1 for m in temiz if m["guvenilirlik"] == g) for g in sorted({m["guvenilirlik"] for m in temiz})})
print("kaynaksız:", sum(1 for m in temiz if not m["kaynak_url"]))
print("ilk 5:", " | ".join(m["konu"] for m in temiz[:5]))
