# Profile (Vite + React)

## Chạy thử
```bash
npm install
npm run dev
```

## Cần làm trước khi deploy
1. Đặt video nền NYC vào `public/bg.mp4` (nên nén ≤ 15–20MB, 1080p, H.264). Video luôn tắt tiếng.
   Đặt nhạc nền vào `public/bgm.mp3` và sửa `music.tracks` trong `src/config.js` (tên bài, link ảnh thumbnail `cover`).
2. (Tuỳ chọn) đặt ảnh đại diện vào `public/avatar.jpg`. Xoá dòng `avatar` trong `src/config.js` nếu muốn dùng avatar Discord.
3. Sửa `src/config.js`: tên, bio, link mạng xã hội, **Discord User ID**.
   - Tham gia server https://discord.gg/lanyard để hiện trạng thái Discord/Spotify realtime.
4. Bật/tắt 3D theo chuột: `CONFIG.tilt.enabled` trong `src/config.js`.

## Deploy GitHub Pages
1. Tạo repo, push toàn bộ code lên nhánh `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Mỗi lần push, workflow `.github/workflows/deploy.yml` tự build và deploy.
