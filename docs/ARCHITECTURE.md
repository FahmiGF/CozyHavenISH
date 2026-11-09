# 🏛️ CozyHaven — Technical Architecture & System Design

Dokumen ini menjelaskan arsitektur perangkat lunak, pola desain, alur data (*data flow*), dan strategi performa yang diimplementasikan pada proyek **CozyHaven**.

---

## 1. Ikhtisar Arsitektur (*High-Level Architecture*)

CozyHaven menerapkan arsitektur **Decoupled Hybrid Engine** yang memisahkan tanggung jawab rendering real-time dengan antarmuka pengguna:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                              │
│              (Keyboard, Mouse, Touch / Virtual D-Pad)                 │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │     PHASER 3 ENGINE    │       │     REACT 18 UI / HUD  │
       │  (WebGL / 2D Canvas)   │       │   (Tailwind CSS DOM)   │
       │                        │       │                        │
       │ - World & House Scene  │       │ - Top Status Bar (HUD) │
       │ - Arcade Physics Body  │       │ - 9-Slot Quick Hotbar  │
       │ - Depth Y-Sorting      │       │ - Floating Prompts     │
       │ - Dynamic Lighting Tint│       │ - Fullscreen Modals    │
       │ - Weather Particles    │       │ - Virtual Mobile D-Pad │
       └───────────┬────────────┘       └────────────┬───────────┘
                   │                                 │
                   │    Bi-Directional EventBus      │
                   └────────────────◄►───────────────┘
                                     │
                                     ▼
                   ┌──────────────────────────────────┐
                   │       DOMAIN STATE MANAGER       │
                   │          (GameState.ts)          │
                   │                                  │
                   │ - Farming & Crop Lifecycle Logic │
                   │ - Inventory & Stacking Rules     │
                   │ - Dual Economy & Shipping Bin    │
                   │ - NPC Schedules & Friendship     │
                   │ - Quest Engine & Progression     │
                   │ - Local-First Persistence Engine │
                   └─────────────────┬────────────────┘
                                     │
                                     ▼
                   ┌──────────────────────────────────┐
                   │    PROCEDURAL AUDIO SYNTHESIZER  │
                   │          (SoundSynth.ts)         │
                   │ - Dynamic Pentatonic BGM Loops   │
                   │ - Real-Time Procedural SFX (Web) │
                   └──────────────────────────────────┘
```

### Keunggulan Desain Ini:
1. **Pemisahan Tanggung Jawab (*Separation of Concerns*)**:
   Phaser 3 hanya bertanggung jawab atas rendering sprite grafis, kamera, tabrakan (*AABB collision*), partikel cuaca, dan transisi map. Sementara itu, React 18 menangani antarmuka yang dinamis, aksesibilitas DOM, tipografi, dan navigasi modal responsif.
2. **Keterujian Unit (*Unit Testability*)**:
   Karena `GameState.ts` murni ditulis dalam TypeScript tanpa ketergantungan pada objek internal Phaser atau DOM window Canvas, seluruh aturan bisnis game (pertanian, ekonomi, inventaris, quest, save/load) dapat diuji secara otomatis dan cepat menggunakan **Vitest** dalam hitungan milidetik.
3. **Komunikasi Bebas Keterikatan (*Decoupled Pub/Sub*)**:
   Modul berkomunikasi melalui `EventBus.ts` yang diketik ketat (*type-safe*), mencegah keterikatan langsung (*tight coupling*) antara scene grafis dan komponen React.

---

## 2. Lapisan Domain (*Business Logic Layer*)

### `GameStateManager` (`src/domain/GameState.ts`)
Mengimplementasikan pola **Singleton Pattern** yang menyimpan `GameSaveData`.

- **Time Loop & Kalender**:
  Setiap 5 detik dunia nyata, interval memicu penambahan 10 menit waktu game.
  - Pagi (06:00 - 12:00)
  - Siang (12:00 - 17:00)
  - Senja (17:00 - 20:00)
  - Malam (20:00 - 02:00)
  Jika jam mencapai 02:00 (jam 26), pemain akan pingsan karena kelelahan (*exhaustion*) dan terbangun jam 06:00 dengan energi awal 60%.
- **Siklus Tanaman Semalam (*Overnight Crop Growth*)**:
  Saat pemain tidur atau hari berganti:
  1. Mengecek semua furnitur `sprinkler` yang ditempatkan di ladang. Petak tanah yang bersebelahan (atas, bawah, kiri, kanan) secara otomatis disiram air (`watered = true`).
  2. Semua tanaman yang disiram pada hari itu akan bertambah hari tanamnya (`daysPlanted += 1`).
  3. Menghitung tahapan pertumbuhan `targetStage = Math.floor(daysPlanted / daysPerStage)`.
  4. Ketika mencapai tahap akhir, tanaman ditandai siap panen (`isHarvestable = true`).
  5. Tanah mengering kembali untuk hari berikutnya kecuali cuaca hari berikutnya adalah hujan (`rainy`).
- **Sistem Pengiriman Malam (*Overnight Shipping Calculation*)**:
  Barang di dalam `shippingBin` dihitung dengan mempertimbangkan pengganda kualitas:
  - Normal: `1.0x`
  - Silver: `1.25x`
  - Gold: `1.5x`
  - Iridium: `2.0x`
  Total koin ditambahkan ke saldo pemain dan laporan `DayEarningsReport` dikirim ke modal pagi hari.

---

## 3. Sistem Grafis & Tekstur Prosedural

### `ProceduralTextures.ts`
Untuk memastikan game dapat dimuat secara instan tanpa risiko *404 missing asset*, *slow CDN*, atau isu hak cipta:
- Semua tekstur digambar secara prosedural ke dalam elemen HTML5 Canvas terisolasi dengan `imageSmoothingEnabled = false` untuk mempertahankan ketajaman pixel-art.
- Kanvas kemudian didaftarkan ke `scene.textures` Phaser:
  - **Tile Lingkungan (32x32)**: `tile_grass`, `tile_dirt`, `tile_tilled`, `tile_tilled_watered`, `tile_water`, `tile_sand`, `tile_path`, `tile_wood_floor`, `tile_wall_wood`.
  - **Objek Besar**: Rumah pondok (96x80), Toko desa (96x80), Pohon apel (48x64), Batuan tambang (32x32), Kotak pengiriman (32x32).
  - **Karakter Pemain (64x96)**: Spritesheet 4 arah (bawah, kiri, kanan, atas) dengan 4 frame animasi berjalan dan bayangan lembut.
  - **7 Penduduk Desa (64x96 per NPC)**: Memiliki warna rambut, baju, dan proporsi unik sesuai kepribadian masing-masing.
  - **8 Tanaman (16x16 x 4 tahap)**: Total 32 sprite tanaman yang menunjukkan tunas, daun lebat, hingga buah/bunga matang.
  - **Perkakas & Item (24x24)**: Ikon cangkul, alat siram, kapak, beliung, joran, jaring, mineral, ikan, dan serangga.

---

## 4. Sistem Audio Prosedural (`SoundSynth.ts`)

Menggunakan **Web Audio API** browser tanpa memerlukan file audio `.mp3` atau `.wav` eksternal:
- **SFX Real-Time**:
  - `hoe`: Osilator gelombang segitiga dengan frekuensi pitch menurun cepat (140Hz -> 50Hz) mensimulasikan hantaman cangkul ke tanah.
  - `water`: Osilator sinus beresonansi frekuensi naik (450Hz -> 800Hz) mensimulasikan cipratan air segar.
  - `harvest`: Arpeggio 4 nada ceria (C5, E5, G5, C6).
  - `coin`: Dua nada logam harmonik tinggi (B5 & E6).
  - `dialogue`: Nada segitiga berfrekuensi acak ringan (320Hz - 440Hz) menyerupai suara percakapan karakter gaya animal crossing.
  - `fanfare`: Harmoni kuartet akord perayaan (A4, C#5, E5, A5).
- **Ambient Acoustic BGM**:
  - Memainkan progresi akord pentatonik yang menenangkan (C Mayor - G Mayor - A Minor - F Mayor) pada siang hari, dan akord lembut (Am7 - Fmaj7 - G7 - Cmaj7) pada malam hari.
  - Menggunakan teknik envelope ADSR eksponensial untuk menghasilkan nada marimba/kalimba yang hangat.

---

## 5. Optimalisasi Bundle & Performa Produksi

Pada file `vite.config.ts`, Rollup dikonfigurasi dengan pemisahan chunk (*manual code-splitting*):
- `phaser`: Dipisahkan ke dalam bundle khusus `phaser-*.js` (1.47 MB).
- `vendor`: Pustaka React, ReactDOM, dan ikon Lucide dipisahkan ke `vendor-*.js` (165 KB).
- `index`: Kode aplikasi inti dan logika domain dipisahkan ke `index-*.js` (147 KB).

Hasil:
- Ukuran gzip total sangat ringkas (~420 KB total).
- Game dapat dimuat dalam waktu kurang dari 1 detik di peramban web modern.
- Rendering canvas mencapai 60 FPS stabil berkat pemanfaatan Arcade Physics AABB ringan.

---

## 7. Sistem Navigasi Cerdas & Pathfinding Grid A* (`Pathfinder.ts`)

Untuk memungkinkan NPC bernavigasi secara mandiri mengitari rintangan alam (pohon, air, bangunan, bebatuan), CozyHaven mengimplementasikan algoritma **A* Grid Search**:

```
┌────────────────────────────────────────────────────────┐
│               COZYHAVEN GRID PATHFINDER                │
│             (src/game/ai/Pathfinder.ts)                │
│                                                        │
│ - Heuristik Manhattan Distance (|x1 - x2| + |y1 - y2|) │
│ - Open/Closed Node Set Maps untuk efisiensi O(1) lookup │
│ - Dynamic Walkable Query (walkableGrid[ty][tx])        │
│ - Spiral Neighbor Search untuk tujuan terblokir        │
│ - Random Radius Wander Point untuk patroli santai      │
└────────────────────────────────────────────────────────┘
```

### Karakteristik & Performa:
1. **Pemeriksaan Cepat**: Algoritma dibatasi maksimal 600 node evaluasi per pencarian jalur, menjaga waktu eksekusi di bawah 1ms pada perangkat berdaya rendah.
2. **Spiral Neighbor Search**: Apabila NPC diarahkan ke petak yang kebetulan tertutup rintangan atau di dekat pemain, fungsi `findNearestWalkable()` secara otomatis mencari petak terdekat yang aman dalam radius spiral 1-4 petak.
3. **Wandering State Machine**: Ketika NPC berada dalam kondisi santai (`state === 'idle'`), timer acak memicu NPC memilih titik tetangga acak dalam radius 2 petak di sekitar pos rutinitasnya menggunakan `findRandomWalkableAround()`, menciptakan pergerakan alami seperti warga desa sungguhan.
4. **Respon Percakapan Seketika**: Saat pemain mengajak bicara (`[E] Talk`), NPC langsung menghentikan langkahnya, menghadap langsung ke arah pemain, dan memutar animasi wajah ramah.

---

## 8. Arsitektur Multi-Zona & Penambangan Sumber Daya

Peta CozyHaven dirancang dengan sistem **Zone Swapping & Coordinated Boundaries**:
- **5 Zona Terhubung**: `farm`, `village`, `beach`, `forest`, `mine`.
- **Manajemen State Terpusat**: `gameState.setActiveMap(mapId)` memastikan data pemain, cuaca, siklus waktu, dan rutinitas warga desa tetap tersinkronisasi lintas zona.
- **Node Tambang Interaktif**:
  - Batuan dan urat mineral dimodelkan sebagai entitas fisik arcade physics yang dapat dipukul beberapa kali (*hits left*).
  - Mengayunkan beliung memicu efek deformasi skala yoyo, denting osilator audio ganda (*triangle + square*), partikel pecahan batu, dan konsumsi energi.
  - Saat hancur, node memberikan material tambang ke ransel dan membuka jalur di grid pathfinding.
- **Pemandian Air Panas (*Hot Springs*)**:
  - Wilayah kolam pada `forest` mendeteksi keberadaan karakter pemain dan meregenerasi energi (+3 energi/detik) dengan batas atas `maxEnergy`, memicu efek osilator sinus gelembung relaksasi secara periodik.

---

## 9. Mesin Panduan Pemula Interaktif 8-Tahap (`TutorialStage`)

Disematkan langsung pada `GameState.ts` dan antarmuka HUD:
- Schema `TutorialProgress` menyimpan tahap saat ini, progress kuantitatif, status komplesi, dan opsi dismiss.
- Terpicu secara otomatis (*event-driven hooks*) saat pemain melakukan aktivitas pertama kali: melangkah 15 langkah (`move`), berbicara dengan NPC (`talk`), mencangkul (`till`), menanam (`plant`), menyiram (`water`), menjelajah zona baru (`explore`), dan menambang bijih (`mine`).
- Memberikan umpan balik instan melalui bilah progress, animasi fanfare audio, notifikasi reward, dan koin Haven.

Multiplayer dirancang menggunakan protokol **WebSocket (`ws`)** berkecepatan tinggi dengan server mandiri pada port 3001:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COZYHAVEN WEBSOCKET SERVER                      │
│                           (server/server.js)                           │
│                                                                        │
│  - Room Clustering Map (e.g. 'haven-main', private room codes)         │
│  - Shared World State Sync (tilled tiles, planted crops)               │
│  - Broadcast Engine (JOIN, MOVE, ACTION, CHAT, PING/PONG)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  WebSocket frames
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         MULTIPLAYER CLIENT                             │
│                    (src/network/MultiplayerClient.ts)                  │
│                                                                        │
│  - 20Hz Throttled Position Packets (interval 50ms)                     │
│  - Linear Interpolation (Linear Lerp 0.25) for smooth remote movement  │
│  - Local Action Hook listener to auto-broadcast till/water/plant/harvest│
│  - Floating Chat & Emote Bubble Renderer over remote avatars           │
└────────────────────────────────────────────────────────────────────────┘
```

### Optimalisasi Performa Jaringan:
1. **Network Throttling 20Hz**: Posisi pemain dibatasi maksimal 20 pengiriman per detik untuk mencegah packet flooding pada browser dan CPU.
2. **Linear Interpolation (Lerp)**: Posisi pemain remote diinterpolasi secara halus di setiap frame Phaser (`Phaser.Math.Linear`) sehingga pergerakan terlihat lembut 60 FPS tanpa jeda patah-patah (*jitter*).
3. **Graceful Offline Fallback**: Klien bermain normal 100% secara offline jika server lokal tidak dinyalakan.

---

## 7. Personality-Driven Voice AI Engine

Sistem suara karakter mengkombinasikan teknologi hybrid:

1. **Browser SpeechSynthesis Heuristics**:
   - Memilih suara terbaik dari profil suara sistem operasi pengguna (mengutamakan aksen, gender, dan karakter alami).
   - Menyesuaikan *pitch* (0.62 s.d. 1.38) dan *speech rate* (0.80 s.d. 1.14) yang unik untuk setiap warga desa:
     - *Milo*: 0.82 (Bariton ramah petani)
     - *Luna*: 1.28 (Soprano lembut mistis)
     - *Oliver*: 0.62 (Bas dalam pelaut)
     - *Poppy*: 1.38 (Ceria tempo tinggi)
     - *Theo*: 1.08 (Enerjik petualang)
     - *Maple*: 0.95 (Keibuan hangat)
     - *Nori*: 1.15 (Puitis lembut pelukis)
2. **Formant Babble Synthesizer (Web Audio API Fallback)**:
   - Osilator gelombang segitiga dengan bandpass filter (Q: 3.0) yang menghasilkan kicauan formant vokal retro 120ms selaras saat karakter berbicara.
3. **Audio Waveform Visualizer**:
   - Komponen React `DialogueModal.tsx` menampilkan animasi gelombang frekuensi dinamis saat AI berbicara, tombol putar ulang (*replay*), dan toggle bisukan suara (*mute*).

---

## 8. Sistem Peternakan Hewan & Dapur Memasak

1. **Peternakan Hewan (`animals.ts`)**:
   - Hewan ternak memiliki posisi map, tingkat persahabatan (0–1000), status kasih sayang harian (*petToday*), dan kesiapan hasil produksi (*hasProduct*).
   - Setiap pagi, siklus semalam menyegarkan ketersediaan telur dan susu segar.
2. **Dapur Memasak (`cooking.ts`)**:
   - Mengkombinasikan bahan-bahan mentah dari hasil panen (tomat, kentang, wortel, strawberry) dan peternakan (telur, susu).
   - Menghasilkan hidangan lezat dengan bonus pemulihan stamina instan (45 hingga 100 energi).
