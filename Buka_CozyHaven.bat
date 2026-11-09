@echo off
title CozyHaven - 2D Relaxed Farming & Life Simulation
color 0A
chcp 65001 >nul

echo ===============================================================================
echo                🌱 SELAMAT DATANG DI COZYHAVEN 🌱
echo        Game Simulasi Pertanian & Kehidupan Santai 2D (Browser)
echo   [Fitur Baru: Multiplayer Server, Voice AI Warga Desa, Peternakan & Dapur]
echo ===============================================================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo [INFO] Menginstal dependensi game untuk pertama kali...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Gagal menginstal paket npm. Pastikan Node.js sudah terinstal.
        pause
        exit /b 1
    )
)

echo [INFO] Memulai WebSocket Multiplayer Server di port 3001...
start "CozyHaven Server" /b node server/server.js

echo [INFO] Memulai server lokal Vite CozyHaven...
echo [INFO] Membuka browser di http://localhost:5173 ...
echo.
echo ===============================================================================
echo  PANDUAN KONTROL & FITUR:
echo  - Bergerak              : WASD atau Panah Arah (atau Virtual D-Pad di HP/Tablet)
echo  - Gunakan Alat/Cangkul     : Spasi (Spacebar)
echo  - Interaksi / Bicara     : E (dengan NPC, Hewan Ternak, Toko, Kotak Kirim)
echo  - Voice AI Warga Desa    : Suara AI unik berbicara otomatis saat dialog NPC
echo  - Peternakan Hewan       : Rawat Ayam & Sapi untuk mengumpulkan Telur & Susu
echo  - Dapur Memasak          : Buat Omelet, Pancake & Sup di Dapur Rumah
echo  - Multiplayer Lounge     : Tombol Multiplayer di HUD atas untuk mabar real-time
echo  - Buka Tas Ransel        : Q (Backpack Inventory)
echo  - Pilih Hotbar 1-9      : Tombol angka 1 sampai 9
echo  - Jurnal Misi (Quest)    : Tab
echo  - Peta Pulau            : M
echo  - Pengaturan & Simpan    : Esc
echo ===============================================================================
echo.

start "" "http://localhost:5173"
call npm run dev

pause
