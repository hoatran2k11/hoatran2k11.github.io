// =====================================================================
//  CHỈNH TẠI ĐÂY – mọi thứ cần sửa đều nằm trong file này
// =====================================================================

export const CONFIG = {
  // ---- Hiệu ứng 3D nghiêng theo chuột: true = bật, false = tắt ----
  tilt: {
    enabled: true,
    maxDeg: 9,        // góc nghiêng tối đa (độ)
    perspective: 1100 // càng nhỏ càng "sâu"
  },

  // ---- Hiệu ứng blur (kính mờ): enabled true = có blur, false = trong suốt không blur ----
  blur: {
    enabled: true,
    amount: 5, // độ mờ của card chính (px); các thẻ nhỏ tự lấy ~45% giá trị này
  },

  // ---- Video nền: đặt file vào public/bg.mp4 ----
  video: {
    src: 'https://res.cloudinary.com/proqrhh8/video/upload/v1795444024/bg.mp4',
    // ảnh hiện trong lúc video đang tải (tuỳ chọn, đặt vào public/)
    poster: '',
  },

  // ---- Màn hình "chạm để vào" (cũng là lúc bắt đầu phát nhạc từ video) ----
  gate: {
    enabled: true,
    text: 'Click if you want learn more ...',
  },

  // ---- Âm thanh (video nền luôn tắt tiếng, chỉ phát nhạc ở `music`) ----
  audio: {
    showMuteButton: false, // nút loa ở góc trên bên trái: true = hiện, false = ẩn
    volume: 0.2, // 0 .. 1
  },

  // ---- Nhạc nền (BGM): thẻ điều khiển nằm bên cạnh thẻ Discord ----
  // Đặt file nhạc vào public/ (vd: public/bgm.mp3) rồi điền tên file vào `src`.
  // `cover` là link ảnh thumbnail (https://...) hoặc tên file trong public/.
  // Muốn nhiều bài thì thêm nhiều object; nút trước/sau sẽ chuyển bài.
  music: {
    tracks: [
      {
        src: 'bgm.mp3',
        title: 'sunset - miroki',
        cover: 'cover.png',
      },
    ],
  },

  // ---- Thông tin hiển thị ----
  name: 'Hoa Tran',
  nickname: 'aoh2011', // hiện dưới tên dạng @aoh2011, để '' nếu không muốn hiện
  bio: "chasing sunsets & bad decisions",
  location: 'Thai Binh City',

  // ---- Discord (lấy realtime qua Lanyard) ----
  // 1. Vào https://discord.gg/lanyard và tham gia server (bắt buộc để Lanyard theo dõi bạn)
  // 2. Bật Developer Mode trong Discord > chuột phải vào avatar > Copy User ID
  discord: {
    userId: '1329735274955018271', // <-- THAY BẰNG ID DISCORD CỦA BẠN
    fallbackName: 'aoh2011',     // hiện tạm khi chưa tải được
    pollMs: 15000,                 // tần suất cập nhật (ms)
  },

  // Avatar chính (đặt file vào public/avatar.jpg). Bỏ trống => dùng avatar Discord
  avatar: '',

  // ---- Các liên kết mạng xã hội (xoá dòng nào nếu không muốn hiện) ----
  links: [
    { type: 'facebook',   url: 'https://web.facebook.com/aoh2011/' },
    { type: 'instagram',  url: 'https://www.instagram.com/aoh.2011' },
    { type: 'spotify',    url: 'https://open.spotify.com/user/31nj6cw7hzaufbydpmcnxnajs5a4' },
    { type: 'soundcloud', url: 'https://soundcloud.com/aoh20119' },
    { type: 'discord',    url: 'https://discord.gg/bhYstR4yQx' },
  ],
}
