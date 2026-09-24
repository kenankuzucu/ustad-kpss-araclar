# -*- coding: utf-8 -*-
"""ÜSTAD KPSS ARAÇLAR · GitHub yayınlama (kenankuzucu/ustad-kpss-araclar).
- Depo yoksa oluşturur (herkese açık: Kenan'ın kuralı — APK dosyaları açık ve linkli olsun).
- main dalını iter, Pages'i açar, sürüm (release) yayınlar ve APK'yı ek yükler.
- Her adımdan sonra uzaktan DOĞRULAMA yapar (iddia değil ölçüm).
Kullanım: python araclar/yayinla.py [sürüm]
"""
import json, os, pathlib, subprocess, sys, time, urllib.request, urllib.error, hashlib

S = pathlib.Path(__file__).resolve().parent.parent
TOKEN = None
for satir in (pathlib.Path.home() / "AppData/Local/hermes/.env").read_text(encoding="utf-8", errors="replace").splitlines():
    if satir.strip().startswith("GITHUB_TOKEN"):
        TOKEN = satir.split("=", 1)[1].strip().strip('"').strip("'")
if not TOKEN:
    sys.exit("GITHUB_TOKEN bulunamadı (~/AppData/Local/hermes/.env)")

KULLANICI = "kenankuzucu"
DEPO = "ustad-kpss-araclar"
SURUM = sys.argv[1] if len(sys.argv) > 1 else "v1.0"
API = "https://api.github.com"

def istek(yol, veri=None, yontem=None, ham=False, tip="application/json"):
    u = yol if yol.startswith("http") else API + yol
    govde = None
    basliklar = {"Authorization": "Bearer " + TOKEN, "Accept": "application/vnd.github+json",
                 "User-Agent": "ustad-kpss-araclar-yayinla"}
    if veri is not None:
        if tip == "application/json":
            govde = json.dumps(veri).encode()
        else:
            govde = veri
            basliklar["Content-Type"] = tip
    r = urllib.request.Request(u, data=govde, headers=basliklar, method=yontem or ("POST" if govde else "GET"))
    try:
        with urllib.request.urlopen(r, timeout=90) as y:
            g = y.read()
            return y.status, (g if ham else (json.loads(g) if g else None))
    except urllib.error.HTTPError as e:
        return e.code, (e.read() if ham else e.read().decode("utf-8", "replace"))

# 1) depo var mı
durum, cevap = istek(f"/repos/{KULLANICI}/{DEPO}")
if durum == 200:
    print("depo var :", cevap["html_url"], "| private:", cevap["private"])
else:
    durum2, cevap2 = istek("/user/repos", {
        "name": DEPO, "private": False,
        "description": "ÜSTAD KPSS ARAÇLAR — sınav geri sayımı, net & puan hesabı, notlar, 2026 güncel bilgiler ve 2011-2021 çıkmış soru arşivi (Kenan Kuzucu)",
        "has_issues": False, "has_wiki": False, "has_projects": False, "auto_init": False})
    if durum2 not in (201, 200):
        sys.exit("depo oluşturulamadı: %s %s" % (durum2, cevap2))
    print("depo oluşturuldu:", cevap2["html_url"])

# 2) git: commit + push
def git(*a, **kw):
    p = subprocess.run(["git", "-C", str(S)] + list(a), capture_output=True, text=True, **kw)
    print("$ git", " ".join(a), "→", p.returncode, (p.stdout or p.stderr).strip()[:300])
    return p

git("add", "-A")
p = git("commit", "-m", "ÜSTAD KPSS ARAÇLAR %s — geri sayım, net & puan, notlar, 2026 güncel bilgiler, çıkmış soru arşivi" % SURUM)
uzak = "https://kenankuzucu:%s@github.com/%s/%s.git" % (TOKEN, KULLANICI, DEPO)
git("remote", "remove", "origin") if subprocess.run(["git", "-C", str(S), "remote"], capture_output=True, text=True).stdout.find("origin") >= 0 else None
git("remote", "add", "origin", uzak)
git("branch", "-M", "main")
ph = git("push", "-u", "origin", "main", "--force")
print("--- uzak ile yerel karşılaştırma ---")
durum, uzak_cevap = istek(f"/repos/{KULLANICI}/{DEPO}/commits/main")
yerel = subprocess.run(["git", "-C", str(S), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
if durum == 200:
    print("uzak HEAD :", uzak_cevap["sha"])
    print("yerel HEAD:", yerel)
    print("EŞLEŞME   :", "✔ aynı" if uzak_cevap["sha"] == yerel else "✘ FARKLI")
else:
    print("uzak HEAD okunamadı:", durum, uzak_cevap)
