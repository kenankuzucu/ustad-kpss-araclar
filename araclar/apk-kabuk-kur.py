# -*- coding: utf-8 -*-
"""ÜSTAD KPSS ARAÇLAR · APK kabuğunu hazırlar (AndroidBuild/ustad-kpss-araclar-app).
KOÇ PRO kabuğundan türetilir: paket adı, uygulama adı, sürüm ve simge kaynağı değiştirilir.
Kullanım: python araclar/apk-kabuk-kur.py
"""
import pathlib, re, shutil, sys

HOME = pathlib.Path.home()
KAYNAK = HOME / "AndroidBuild/ustad-koc-pro-app"
HEDEF = HOME / "AndroidBuild/ustad-kpss-araclar-app"
ESKI_PAKET = "ustadkocpro"
YENI_PAKET = "ustadkpssaraclar"
UYGULAMA_ADI = "ÜSTAD KPSS ARAÇLAR"
SURUM_ADI = "1.0"
SURUM_KODU = 1
LOGO = r"C:\Users\kenan\OneDrive\Desktop\USTAD-KPSS-ARACLAR\tasarim\ustad-kafa.png"

if not KAYNAK.exists():
    sys.exit("kaynak kabuk yok: " + str(KAYNAK))

if HEDEF.exists():
    shutil.rmtree(HEDEF)
shutil.copytree(KAYNAK, HEDEF, ignore=shutil.ignore_patterns("build", "assets"))

eski_pkg_yol = HEDEF / "src/tr/com/ustadkenankuzucu" / ESKI_PAKET
yeni_pkg_yol = HEDEF / "src/tr/com/ustadkenankuzucu" / YENI_PAKET
eski_pkg_yol.rename(yeni_pkg_yol)
degisen = 0
for f in list(yeni_pkg_yol.glob("*.java")) + list(HEDEF.glob("*.py")) + [HEDEF / "AndroidManifest.xml"]:
    if not f.exists():
        continue
    s = f.read_text(encoding="utf-8", errors="replace")
    yeni = s.replace(ESKI_PAKET, YENI_PAKET)
    if f.suffix == ".py":                                  # arac-simge.py: logo + başlık
        yeni = re.sub(r'LOGO = r"[^"]*"', lambda _m: 'LOGO = r"%s"' % LOGO, yeni)
        yeni = yeni.replace("ÜSTAD KPSS-B", "ÜSTAD KPSS ARAÇLAR").replace("KOÇ PRO", "KPSS ARAÇLAR")
        yeni = yeni.replace("ustad-motor-app", "ustad-kpss-araclar-app")
    if yeni != s:
        f.write_text(yeni, encoding="utf-8")
        degisen += 1

(HEDEF / "AndroidManifest.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n'
    '<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n'
    '    package="tr.com.ustadkenankuzucu.%s"\n'
    '    android:versionCode="%d"\n'
    '    android:versionName="%s">\n\n'
    '    <!-- Dış bağlantılar (ÖSYM kitapçıkları, kaynak haberler) ve canlı beslemeler için -->\n'
    '    <uses-permission android:name="android.permission.INTERNET" />\n'
    '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n'
    '    <uses-permission android:name="android.permission.VIBRATE" />\n'
    '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n\n'
    '    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n\n'
    '    <application\n'
    '        android:label="@string/uygulama_adi"\n'
    '        android:icon="@mipmap/ic_launcher"\n'
    '        android:roundIcon="@mipmap/ic_launcher_round"\n'
    '        android:theme="@style/UygulamaTemasi"\n'
    '        android:hardwareAccelerated="true"\n'
    '        android:allowBackup="true"\n'
    '        android:usesCleartextTraffic="true"\n'
    '        android:supportsRtl="false">\n\n'
    '        <activity\n'
    '            android:name=".MainActivity"\n'
    '            android:exported="true"\n'
    '            android:launchMode="singleTop"\n'
    '            android:screenOrientation="portrait"\n'
    '            android:configChanges="orientation|screenSize|smallestScreenSize|keyboardHidden|screenLayout|uiMode|density|fontScale"\n'
    '            android:windowSoftInputMode="adjustResize">\n'
    '            <intent-filter>\n'
    '                <action android:name="android.intent.action.MAIN" />\n'
    '                <category android:name="android.intent.category.LAUNCHER" />\n'
    '            </intent-filter>\n'
    '        </activity>\n'
    '    </application>\n'
    '</manifest>\n' % (YENI_PAKET, SURUM_KODU, SURUM_ADI), encoding="utf-8")

(HEDEF / "res/values/strings.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\r\n<resources>\r\n'
    '    <string name="uygulama_adi">%s</string>\r\n'
    '    <string name="telif">© 2026 Kenan Kuzucu · Tüm hakları saklıdır. 5846 sayılı FSEK kapsamında korunur. '
    'İzinsiz çoğaltma, kopyalama, satış ve dağıtım yasaktır.</string>\r\n</resources>\r\n' % UYGULAMA_ADI,
    encoding="utf-8")

print("kabuk hazır:", HEDEF)
print("paket    :", "tr.com.ustadkenankuzucu." + YENI_PAKET, "· sürüm", SURUM_ADI, "(kod %d)" % SURUM_KODU)
print("ad       :", UYGULAMA_ADI)
print("değişen  :", degisen, "dosya (paket adı/başlık)")
print("java     :", [p.name for p in yeni_pkg_yol.glob("*.java")])
