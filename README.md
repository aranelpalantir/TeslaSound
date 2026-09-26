# 🏎️ TeslaSound - Sanal Motor Sesi Kokpiti (EV Engine Sound Cockpit)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Procedural%20Synthesis-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Tesla Browser](https://img.shields.io/badge/Tesla%20In--Car%20Browser-Compatible-red.svg)](https://www.tesla.com)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20with-Cloudflare%20Pages-F38020.svg?logo=cloudflare)](https://teslasound.pages.dev/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-teslasound.pages.dev-success.svg)](https://teslasound.pages.dev/)

**TeslaSound**, başta **Tesla** olmak üzere tüm elektrikli araçlar (EV) için geliştirilmiş gerçek zamanlı, GPS ve ivme duyarlı **sanal motor sesi kokpitidir**.

Herhangi bir harici donanım veya OBD adaptörü gerektirmeden, aracın dahili tarayıcısında (Tesla Browser) veya akıllı telefon/tablet üzerinde çalışır. Aracın gerçek zamanlı GPS hızını ve ivmesini (G-kuvveti) analiz ederek safkan içten yanmalı motor seslerini (V8, V10, V12, Boxer Flat-6, 5 Silindir Turbo ve efsanevi Tofaş SLX / Şahin Varex) **Web Audio API prosedürel ses sentezleme motoru** ile sıfır gecikmeyle üretir.

---

## 🌐 Canlı Demo & Bağlantılar

Uygulamaya doğrudan tarayıcınızdan veya aracınızın ekranından erişebilirsiniz:
- 🚀 **Cloudflare Pages (Canlı Uygulama):** **[https://teslasound.pages.dev/](https://teslasound.pages.dev/)**
- 🐙 **GitHub Açık Kaynak Deposu:** **[https://github.com/aranelpalantir/TeslaSound](https://github.com/aranelpalantir/TeslaSound)**

---

## ✨ Öne Çıkan Özellikler

- 🔊 **Prosedürel Ses Sentezi (Web Audio API):**
  - Hazır ses kayıtları veya tekrarlayan MP3 döngüleri yerine, gerçek zamanlı osilatörler, harmonik frekans modülasyonu, dalga şekillendiriciler (waveshapers) ve egzoz rezonans filtreleri kullanır.
  - Devir değişimleri, gaz tepkisi, egzoz patırtıları (pops & bangs), turbo ıslığı, blow-off valf sesi ve kesici (tatatata) sesleri tamamen dinamik olarak sentezlenir.

- ⚡ **60 FPS Öngörülü Fizik Motoru:**
  - Gerçek zamanlı GPS hızını ve ivme verilerini (m/s²) işler.
  - Gerçekçi vites oranları, devir düşüşleri/artışları, kickdown (ani gazda vites küçültme) ve redline kesici fiziği sunar.
  - 0-130 km/h şehir içi/ara hızlanmalarda agresif vites geçişleri, 130+ km/h otoban sürüşlerinde overdrive vitesler ile 280+ km/h'ye kadar kesintisiz tırmanış.

- 🚗 **Tesla Direksiyon Tekerleği Kontrolü (Paddle Shift):**
  - Tesla ekranında sürüş esnasında direksiyonun sol kaydırma tekerleği (scroll wheel) yukarı kaydırıldığında vites büyütür, aşağı kaydırıldığında vites küçültür.

- 🚨 **F1 / GT3 Shift Lights LED Bar:**
  - Direksiyon üstü yarış arabaları tarzında devir göstergesi (Yeşil ➡️ Sarı ➡️ Kırmızı ➡️ Yanıp Sönen Flaşörler).

- 💥 **3 Kademeli Egzoz Valf Modu:**
  - **Standart:** Sessiz, günlük fabrika çıkış egzoz.
  - **Spor:** Açık valfler, tok homurtu ve ara gaz tepkisi.
  - **Düz Boru / Varex:** Maksimum desibel yırtılma, gaz bırakıldığında seri egzoz patırtıları (backfire / pops & bangs) ve dip gaz kesici.

- 🖥️ **Evde / Test Masası Modu (Test Bench):**
  - Araca binmeden test edebilmeniz için manuel sürüş modu.
  - Ekrandaki Gaz / Fren pedalları veya klavyeden <kbd>W</kbd> (Gaz) ve <kbd>S</kbd> (Fren) tuşlarıyla tam simülasyon.

- 🚀 **Sıfır Bağımlılık & Hızlı Başlangıç:**
  - Node paketleri, derleme adımları veya karmaşık kurulumlar gerektirmez. Saf HTML5, CSS3 ve Vanilla JavaScript.

---

## 🏎️ Araç ve Motor Ses Profilleri

| Araç / Motor | Tip & Özellik | Maks Devir | Karakteristik Ses Detayı |
| :--- | :--- | :--- | :--- |
| **Tofaş Doğan SLX 1.6** | 1.6L 8V SOHC (Abart Egzoz / Düz Boru) | 6,800 RPM | Efsane Tempra motoru, 2. vites bağırtması, çatara patara egzoz patlatması. |
| **Tofaş Şahin S (Varex)** | 1.6L Karbüratörlü (Açık Varex & Kesicili) | 7,000 RPM | Açık Varex düz boru yırtılması, dip gaz kesici (tatatata) ve patırtılar. |
| **Shelby Mustang GT500** | 5.2L Supercharged Crossplane V8 | 7,500 RPM | Tok Amerikan V8 homurtusu ve yüksek devirde yırtıcı kompresör (supercharger) ıslığı. |
| **Porsche 911 GT3 RS** | 4.0L Atmosferik Flat-6 | 9,000 RPM | Safkan atmosferik boksör kükremesi ve 9.000 devir yarış çığlığı. |
| **Lamborghini Huracán** | 5.2L Doğal Emişli V10 | 8,500 RPM | Yırtıcı İtalyan V10 çığlığı, sert DCT vites patlamaları. |
| **Ferrari 812 Superfast** | 6.5L Naturally Aspirated V12 | 8,900 RPM | Safkan F1 senfonisi, yüksek devir harmonikleri ve kusursuz vites geçişleri. |
| **Audi RS3 / Golf R** | 2.5L Turbo Inline-5 / TSI | 7,200 RPM | Tok 5 silindir hırıltısı, anında dolan turbo ıslığı, blow-off (psshhh) ve DSG çatlaması. |
| **Cyber Falcon (Sci-Fi)** | Kuantum İyon Hipersürücü | 14,000 RPM | Alt frekans warp titreşimi ve fütüristik bilimkurgu EV itiş sesi. |

---

## 🎮 Kontroller ve Kullanım Kılavuzu

### Araçta Kullanım (Tesla / EV):
1. Aracınızın ekranındaki tarayıcıdan (veya telefonunuzdan) projeyi açın.
2. Bluetooth ile aracın ses sistemine bağlanın.
3. **"MOTORU ÇALIŞTIR"** butonuna basın ve tarayıcının **GPS (Konum)** erişimine izin verin.
4. Tam ekran moduna geçin.
5. Gaza bastığınızda ve hızlandığınızda ses motor yüküne ve devir oranlarına göre otomatik şekillenecektir!

### Test Masası / Klavye Kısayolları (Masaüstü):
- **Kaynak Seçici:** Test Masası modunu seçin.
- <kbd>W</kbd> veya <kbd>↑</kbd> : Gaz (Hızlanma / Throttle)
- <kbd>S</kbd> veya <kbd>↓</kbd> : Fren (Yavaşlama / Brake)
- **Fare Tekerleği (Scroll):** Manuel modda vites büyütme / küçültme
- **Hız Kaydırıcısı:** İstenilen hıza doğrudan geçiş

---

## 🛠️ Yerel Olarak Çalıştırma

Herhangi bir bağımlılık kurmadan doğrudan çalıştırabilirsiniz:

### Seçenek 1: Python ile
```bash
# Proje dizininde:
python -m http.server 3000
```
Tarayıcınızda açın: `http://localhost:3000`

### Seçenek 2: Node.js / npx ile
```bash
npx serve . -p 3000
```

### Seçenek 3: Doğrudan Tarayıcıda
`index.html` dosyasını doğrudan modern bir tarayıcıda çift tıklayarak açabilirsiniz (GPS özellikleri için yerel HTTP sunucusu veya HTTPS tavsiye edilir).

---

## 📁 Proje Mimarisi

```text
TeslaSound/
├── index.html         # Kokpit arayüzü, göstergeler, LED bar ve modallar
├── styles.css         # Modern cam-morfik (glassmorphic) karanlık tema & duyarlı tasarım
├── audio-engine.js    # Web Audio API tabanlı prosedürel ses sentezleme motoru
├── physics.js         # 60 FPS araç dinamiği, GPS işleme, vites ve devir simülasyonu
├── vehicles.js        # Araç profilleri, şanzıman oranları ve harmonik akustik konfigürasyonları
└── app.js             # UI olay yönetimi, telemetri çizimi ve durum yönetimi
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında açık kaynak olarak lisanslanmıştır.
