# Pesta Putar

Game browser 3D orisinal dari ide kelas: berjalan pelan melewati lantai licin, memakai baju bagus, menari berputar bersama pangeran, lalu makan setelah capek.

Satu level lengkap, Three.js lokal, karakter geometris orisinal, musik Web Audio dan file MIDI dari komposisi yang sama. Tidak memakai akun, iklan, analytics, mikrofon, atau penyimpanan data pemain. Seluruh aset permainan tersedia lokal.

## Mainkan

Buka `dist/index.html` langsung di Chrome atau Edge, atau jalankan:

```sh
npm start
```

Buka `http://127.0.0.1:3000`, lalu klik **Ayo main**. Klik awal ini juga mengaktifkan audio sesuai aturan browser.

| Kontrol | Tindakan |
| --- | --- |
| Panah / WASD | Berjalan |
| Tahan Shift / tombol kura-kura | Berjalan pelan agar tidak terpeleset |
| Spasi / tombol aksi | Ambil baju, menari, atau makan saat sudah dekat |
| Tombol panah di layar | Tekan dan tahan untuk bergerak |
| Coba lagi | Mengulang langkah saat ini |
| Panah melingkar kanan atas | Mengulang seluruh permainan |
| Nada / volume | Mute dan pengaturan volume |

Setelah mengambil baju, lewati ujung belakang pagar menuju panggung bundar. Menari berputar bersama pangeran adalah tanda berhasil, kemudian lanjutkan ke meja buah.

## Deploy ke Vercel

Import repository ini dengan branch production `main` dan root directory `./`. `vercel.json` sudah menetapkan:

- Framework: **Other** (`null`)
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variables: tidak diperlukan

Build memeriksa file statis yang sudah di-commit; tidak ada framework, bundler, dependency npm, atau layanan server yang perlu dipasang. Pengaturan ini mengikuti [konfigurasi Vercel](https://vercel.com/docs/project-configuration/vercel-json). Menghubungkan repository ke proyek Vercel diperlukan untuk deployment otomatis; commit saja tidak membuat proyek Vercel baru.

## Verifikasi

```sh
npm run build
npm test
```

Build memeriksa aset lokal, sintaks JavaScript, struktur MIDI, dan direktori keluaran. Tes deterministik menjalankan kode game asli dan geometri Three.js dengan DOM/GPU tiruan: terpeleset, jalan pelan, baju, tari, makan, kondisi selesai, retry/reset, pointer, keyboard, mute, dan volume. Tes audio memeriksa satu scheduler, stop/restart tanpa tumpukan suara, serta kecocokan 91 nada antara audio game dan MIDI.

Tes otomatis tidak membuktikan hasil suara terdengar di speaker atau WebGL bekerja pada setiap perangkat. Periksa volume perangkat dan tampilan TV sebelum sesi kelas.

## Berkas

- `dist/`: semua berkas yang dipublikasikan.
- `dist/musik-tari.mid`: komposisi MIDI orisinal yang dapat diunduh.
- `scripts/`: server lokal dan pemeriksaan tanpa dependency tambahan.
- `LICENSE`: lisensi proyek yang sudah ada.
- `dist/vendor/THREE-LICENSE.txt`: lisensi MIT Three.js r158.

Tokoh, ruangan, dan musik dibuat orisinal. Tidak ada karakter, model, atau audio waralaba yang disalin.
