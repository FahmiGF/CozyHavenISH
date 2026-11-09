# 🌱 CozyHaven — 2D Relaxed Farming & Life Simulation

**CozyHaven** adalah game simulasi pertanian dan kehidupan pedesaan santai 2D berbasis peramban web (*browser game*) yang dibangun dengan **Phaser 3.88.2**, **React 18**, **TypeScript**, dan **Tailwind CSS**.

Game ini mengusung visual pixel art prosedural 100% original, efek suara dan musik arpeggio dinamis dari synthesizer **Web Audio API** tanpa ketergantungan aset berhak cipta pihak ketiga, serta sistem persistensi *local-first* yang tangguh.

---

## 🎮 Cara Menjalankan Game

### Opsi 1: 1-Click Launcher (Windows)
Cukup klik dua kali file **`Buka_CozyHaven.bat`** di folder utama atau di dalam folder `cozyhaven`. File batch akan secara otomatis menginstal dependensi (bila belum ada), menyalakan Vite development server, dan membuka browser di `http://localhost:5173`.

### Opsi 2: Command Line (CLI)
Pastikan telah menginstal [Node.js](https://nodejs.org/) (v18+ direkomendasikan):
```bash
# 1. Pindah ke direktori proyek
cd cozyhaven

# 2. Instal paket dependensi
npm install

# 3. Jalankan development server
npm run dev
# Buka http://localhost:5173 di browser Anda

# 4. Menjalankan automated test suite
npm test

# 5. Membangun bundle produksi
npm run build
```

---

## 🌟 Fitur Utama CozyHaven

### 1. Pertanian Dinamis & Siklus Tanaman
- **Pengolahan Tanah**: Gunakan cangkul (*Garden Hoe*) untuk mencangkul tanah meadow.
- **Penyiraman**: Siram petak tanah setiap hari dengan *Watering Can*. Tanah berair akan berkilau dan menyerap kelembapan secara visual.
- **Pertumbuhan 4 Tahap**: Bibit (*seed*) -> Tunas (*sprout*) -> Tanaman Tumbuh (*growing*) -> Siap Panen (*harvestable*).
- **8 Ragam Tanaman**: Turnip, Carrot, Potato, Tomato, Strawberry, Pumpkin, Sunflower, dan Blue Rose.
- **Mekanik Tanaman Panen Berulang**: Tomat dan Strawberry tidak mati saat dipanen melainkan kembali ke tahap berbunga untuk panen berkala.
- **Tingkat Kualitas Hasil Panen**: Peluang panen Normal, Silver (★), Gold (★), hingga Iridium (★) dengan nilai jual dan pemulihan energi berlipat ganda.
- **Irigasi Otomatis (Sprinkler)**: Letakkan alat penyiram otomatis di tengah petak tanaman untuk menyiram 4 petak sekitarnya setiap pagi.

### 2. Dunia Dinamis, Jam & Kalender 4 Musim
- **Jam Real-Time**: Waktu berjalan santai (setiap 5 detik dunia nyata = 10 menit waktu game).
- **4 Periode Waktu Visual**: Pagi (*dawn* berwarna pastel lembut), Siang (*bright day*), Senja (*golden amber sunset*), dan Malam (*midnight blue twilight*).
- **Sistem Cuaca**: Cerah (*sunny*), Hujan (*rainy* dengan efek partikel air yang menyiram seluruh ladang otomatis), Berawan (*cloudy*), dan Berkabut (*foggy*).
- **Kalender 28 Hari**: Siklus 4 musim (Musim Semi, Panas, Gugur, Dingin) dengan penanda ulang tahun warga desa dan festival musiman.

### 3. Kehidupan Sosial 7 Penduduk Desa (NPCs)
Setiap penduduk desa memiliki kepribadian unik, visual spritesheet buatan sendiri, jadwal harian yang dinamis, jalur dialog bercabang, dan preferensi hadiah:
- **Milo**: Petani desa yang ramah dan mencintai tanaman umbi (*Loved: Turnip, Potato, Pumpkin*).
- **Luna**: Ahli botani dan penjual bunga yang anggun (*Loved: Sunflower, Blue Rose, Wild Berry*).
- **Oliver**: Nelayan pantai yang sabar dan bijaksana (*Loved: Moonlight Salmon, Rainbow Trout, Seashell*).
- **Poppy**: Pemilik kafe dan pembuat kue yang ceria (*Loved: Strawberry, Apple Pie, Pumpkin*).
- **Theo**: Penjelajah pulau dan penangkap serangga (*Loved: Dragonfly, Firefly, Iron Ore*).
- **Maple**: Pemilik General Store yang hangat dan teliti (*Loved: Carrot, Tomato, Rustic Chair*).
- **Nori**: Pelukis pemandangan desa yang pemalu (*Loved: Blue Rose, Dragonfly, Potted Fern*).

### 4. Suara AI Unik untuk 7 Penduduk Desa (Voice AI Engine)
Setiap penduduk desa kini memiliki suara AI yang disintesis secara dinamis sesuai latar belakang, usia, dan kepribadian:
- **Milo**: Suara bariton hangat dan membumi (pitch 0.82) dengan sapaan khas pagi hari yang penuh semangat.
- **Luna**: Suara lembut penuh pesona (pitch 1.28) dengan tempo santai yang berbicara tentang misteri bunga dan malam.
- **Oliver**: Suara bas dalam dan tenang (pitch 0.62) khas pelaut berpengalaman.
- **Poppy**: Suara ceria, riang, dan bersemangat tinggi (pitch 1.38, tempo cepat) khas pembuat kue kafe.
- **Theo**: Suara petualang penuh energi dan rasa ingin tahu ilmiah (pitch 1.08).
- **Maple**: Suara keibuan yang ramah dan bijaksana (pitch 0.95).
- **Nori**: Suara lembut pemalu dan puitis (pitch 1.15, tempo lambat) khas pelukis alam.
- **Fitur Audio Visualizer & Fallback Formant**: Dialog dilengkapi visualizer gelombang suara, tombol replay suara, toggle on/off, dan synthesizer formant Web Audio API.

### 5. Peternakan Hewan (Animal Husbandry)
- **Ayam & Sapi di Padang Rumput**: Rawat ayam *Daisy* dan *Pippin* serta sapi *Buttercup* di area peternakan ladang.
- **Interaksi Kasih Sayang (Petting)**: Usap hewan setiap hari untuk meningkatkan poin persahabatan (*Friendship Hearts*).
- **Pengumpulan Produk Hewan**: Kumpulkan Telur Segar (*Fresh Farm Egg*) dan Susu Murni (*Creamy Milk*) yang muncul di atas kepala hewan setiap pagi. Kualitas produk (Normal, Silver, Gold) meningkat seiring persahabatan.

### 6. Dapur Memasak Pondok (Kitchen Cooking)
- **Kompor Dapur Interaktif**: Dekati kompor dapur di dalam pondok rumah atau buka melalui tombol Kitchen di HUD.
- **Buku Resep Pulau**: Buat berbagai hidangan lezat menggunakan hasil panen ladang dan produk peternakan:
  - *Golden Farm Omelet* (Telur + Tomat) -> Memulihkan +55 Energi
  - *Fluffy Berry Pancakes* (Telur + Susu + Strawberry) -> Memulihkan +75 Energi
  - *Hearty Harvest Stew* (Kentang + Wortel + Tomat) -> Memulihkan +100 Energi (Full Restore!)
  - *Harvest Garden Salad* (Wortel + Tomat) -> Memulihkan +45 Energi

### 7. Multiplayer Real-time (WebSocket Server)
- **Server WebSocket Bawaan**: Berjalan di port 3001 (`cozyhaven/server/server.js`) dengan arsitektur clustering room.
- **Sinkronisasi Pergerakan & Aksi Dunia**: Pergerakan pemain disinkronkan secara mulus (ter-throttle di 20Hz untuk performa tinggi), termasuk aksi mencangkul, menyiram, menanam bibit, dan memanen tanaman secara real-time.
- **Lounge Multiplayer & Obrolan Langsung (In-Game Chat)**: Bergabung ke kode room bersama teman, lihat daftar tetangga yang online, kirim pesan obrolan, dan gunakan gelembung emotikon (*emote bubbles*) yang melayang di atas karakter!
- **Mode Solo Tetap Lancar**: Game tetap 100% playable secara offline jika server tidak aktif, dan menghubungkan koneksi secara instan begitu diinginkan.

### 8. Dekorasi Rumah & Penataan Furnitur
- Masuk ke dalam pondok (*Cottage*) melalui pintu depan.
- Mode dekorasi grid interaktif: pasang kursi kayu, meja makan, tempat tidur kanopi, rak buku, tanaman hias, dan lampu lantai.
- Rotasi furnitur 4 arah (0°, 90°, 180°, 270°) dan pengecekan tabrakan otomatis (*collision check*).
- Furnitur dapat dipungut kembali ke dalam tas ransel kapan saja.

### 5. Sistem Ekonomi Ganda
- **Maple's General Store**: Tempat membeli bibit tanaman, perkakas, dan perabotan rumah, serta menjual barang secara langsung.
- **Shipping Bin (Kotak Pengiriman Ladang)**: Masukkan hasil panen dan forage kapan saja. Pendapatan akan dikalkulasi saat tidur malam dan diserahkan dalam bentuk *Morning Earnings Appraisal Report* saat fajar menyingsing.

### 6. Minigame Memancing & Menangkap Serangga
- **Memancing**: Lempar joran ke sungai, danau, atau laut. Minigame menarik tali pancing (*reeling tension bar*) yang adiktif dengan ikan musiman seperti Blue Carp, Sun Bass, Moonlight Salmon, dan Rainbow Trout legendaris.
- **Jaring Serangga**: Ayunkan jaring serangga untuk menangkap Kupu-kupu, Kumbang Koksi, Capung Zamrud, dan Kunang-kunang malam hari.
- **Museum Komunitas**: Donasikan spesimen langka ikan, serangga, dan botani ke galeri museum pulau untuk mendapatkan insentif koin!

### 7. Persistensi & Manajemen Save File
- 3 slot penyimpanan lokal (*Local Storage*) independen.
- Auto-save otomatis setiap kali pemain tidur malam di tempat tidur.
- Fitur **Export & Import file JSON** untuk mencadangkan atau memindahkan save game antar perangkat secara aman.

### 8. Dukungan Multi-Platform (Desktop & Mobile)
- Kontrol keyboard & mouse lengkap di Desktop.
- Virtual D-Pad dan tombol aksi sentuh (*on-screen touch controls*) responsif di perangkat layar sentuh/ponsel.

---

## ⌨️ Panduan Tombol Kontrol (Desktop)

| Tombol | Fungsi |
| :--- | :--- |
| **W, A, S, D** / **Panah** | Menggerakkan karakter 8 arah |
| **Spasi (Spacebar)** | Menggunakan alat yang aktif (Cangkul, Alat Siram, Tanam Bibit, Mancing, Jaring) |
| **E** | Interaksi (Bicara dengan NPC, Buka Toko, Masuk Rumah, Buka Kotak Kirim, Pungut Forage) |
| **1 – 9** | Memilih alat/item di slot Hotbar bawah secara instan |
| **Q** | Membuka / Menutup Tas Ransel (Backpack Inventory 24 Slot) |
| **Tab** | Membuka / Menutup Jurnal Misi & Prestasi (Quest Journal) |
| **M** | Membuka Peta Interaktif Pulau CozyHaven |
| **Esc** | Membuka Menu Pengaturan, Volume Audio, dan Slot Penyimpanan |

---

## 🧪 Pengujian Otomatis (Automated Testing)

CozyHaven dilengkapi dengan suite pengujian unit berbasis **Vitest**:
```bash
npm test
```
**Cakupan pengujian (31 unit tests passed 100%):**
- `farming.test.ts`: Pencangkulan, tanam bibit, siram air, tahap pertumbuhan per malam, dan pemanenan.
- `economy.test.ts`: Pembelian toko, penjualan langsung, kalkulasi pengiriman malam hari, dan pengganda kualitas (*quality multiplier*).
- `inventory.test.ts`: Kapasitas 24 slot, penumpukan item (*stacking*), pemisahan kualitas, swap slot, dan seleksi hotbar.
- `npc.test.ts`: Pertambahan hati persahabatan, pemberian hadiah yang disukai/dibenci, dan reset limit interaksi harian.
- `quests.test.ts`: Pelacakan target misi dinamis dan klaim hadiah anti-duplikasi.
- `animals_and_cooking.test.ts`: Inisialisasi hewan peternakan, interaksi kasih sayang (+persahabatan), pengumpulan telur & susu, pengecekan bahan resep, dan memasak hidangan.
- `voice_and_multiplayer.test.ts`: Profil suara unik dan formant tone untuk 7 NPC, pemilihan catchphrase sesuai waktu, toggle voice AI, dan inisialisasi state multiplayer client.
- `save.test.ts`: Penyimpanan 3 slot lokal dan export/import JSON.

---

## 🏗️ Struktur Direktori Proyek

```
cozyhaven/
├── index.html                      # Titik masuk HTML5 Canvas & Web Fonts
├── package.json                    # Konfigurasi dependensi dan skrip proyek
├── vite.config.ts                  # Konfigurasi Vite & Rollup code-splitting chunks
├── tailwind.config.js              # Desain palet warna CozyHaven (Haven, CozyGreen, Wood)
├── Buka_CozyHaven.bat              # Script launcher Windows 1-klik
├── src/
│   ├── main.tsx                    # Entry React root
│   ├── App.tsx                     # Harness integrasi Phaser 3 + React HUD
│   ├── index.css                   # Custom style Tailwind & pixel-art rendering
│   ├── types/                      # Type definitions & data catalog
│   │   ├── items.ts                # Katalog 30+ perkakas, bibit, hasil panen, material, furnitur
│   │   ├── crops.ts                # Definisi tanaman, musim, regrow, dan tahap tumbuh
│   │   ├── npcs.ts                 # Profil 7 NPC, jadwal jam harian, dialog & hadiah favorit
│   │   ├── quests.ts               # Definisi quest utama & harian
│   │   ├── furniture.ts            # Tipe penataan furnitur grid & rotasi
│   │   └── game.ts                 # Schema penyimpanan save game, waktu, dan cuaca
│   ├── domain/                     # Business Logic Layer (Decoupled dari UI)
│   │   ├── GameState.ts            # State manager sentral, farming logic, economy, save/load
│   │   ├── EventBus.ts             # Typed event emitter untuk komunikasi Phaser <-> React
│   │   └── SoundSynth.ts           # Synthesizer Web Audio API untuk BGM & efek suara (SFX)
│   ├── game/                       # Phaser 3 Game Engine Layer
│   │   ├── CozyHavenGame.ts        # Konfigurasi Phaser Game instance
│   │   ├── assets/
│   │   │   └── ProceduralTextures.ts # Generator tekstur pixel art kanvas 100% original
│   │   └── scenes/
│   │       ├── BootScene.ts        # Scene inisialisasi tekstur & animasi karakter
│   │       ├── WorldScene.ts       # Scene peta luar ruangan (Farm & Village)
│   │       └── HouseScene.ts       # Scene interior rumah & mode penataan dekorasi
│   ├── ui/                         # React HUD & Dialog Overlays
│   │   ├── HUD.tsx                 # Status bar atas: Jam, Musim, Cuaca, Energi, Koin, Menu
│   │   ├── Hotbar.tsx              # Quick hotbar 9 slot bawah dengan seleksi numerik
│   │   ├── InteractionPrompt.tsx   # Tooltip prompt interaksi mengambang
│   │   ├── VirtualControls.tsx     # Virtual D-Pad & Tombol aksi untuk perangkat mobile
│   │   └── modals/                 # Dialog modal jendela game
│   │       ├── InventoryModal.tsx  # Tas ransel, inspeksi item, sortir, makan
│   │       ├── ShopModal.tsx       # Toko serba ada Maple (Beli & Jual)
│   │       ├── ShippingBinModal.tsx# Kotak kirim hasil panen semalam
│   │       ├── DialogueModal.tsx   # Dialog NPC bercabang & menu hadiah
│   │       ├── QuestModal.tsx      # Jurnal pelacakan misi & klaim hadiah
│   │       ├── MuseumModal.tsx     # Indeks donasi museum akuarium, serangga, botani
│   │       ├── MapModal.tsx        # Peta navigasi visual pulau
│   │       ├── CalendarModal.tsx   # Kalender 28 hari dan jadwal ulang tahun warga
│   │       ├── FishingModal.tsx    # Minigame memancing reel & hook
│   │       ├── SettingsModal.tsx   # Pengaturan volume audio, save slots, export/import JSON
│   │       ├── SleepConfirmModal.tsx # Konfirmasi tidur di tempat tidur
│   │       └── ShippingReportModal.tsx # Laporan penghasilan koin pagi hari
│   └── __tests__/                  # Automated Unit Test Suites (Vitest)
│       ├── farming.test.ts
│       ├── economy.test.ts
│       ├── inventory.test.ts
│       ├── npc.test.ts
│       ├── quests.test.ts
│       └── save.test.ts
└── docs/
    ├── ARCHITECTURE.md             # Dokumen arsitektur teknis & desain sistem
    └── GAMEPLAY_GUIDE.md           # Panduan lengkap gameplay dan tips bertani
```

---

## 📜 Lisensi
Dikembangkan sebagai proyek orisinal berbasis open-source. Semua kode, sistem suara prosedural, dan tekstur dibuat secara matematis/kanvas tanpa menggunakan aset berhak cipta pihak ketiga.
