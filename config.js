// ========================================================
// CẤU HÌNH TRANG WEB CÁ NHÂN (DỄ DÀNG TÙY CHỈNH)
// Bạn có thể thay đổi các thông tin bên dưới theo ý thích!
// ========================================================

window.PROFILE_CONFIG = {
  // Thông tin cá nhân
  profile: {
    name: "ChungKenkCt", // Tên hiển thị phát sáng
    handle: "Chú chó xanh", // Biệt danh / Handle
    location: "Hải Dương", // Vị trí (hiển thị cạnh icon 📍)
    avatar: "assets/avatar.png", // Đường dẫn ảnh đại diện chính (Anime boy mắt đỏ/vàng cực ngầu)
    views: 89, // Lượt xem ban đầu (sẽ tự động tăng nhẹ)
  },

  // Video nền đằng sau
  background: {
    video: "assets/bg_video.mp4", // File video nền MP4
    poster: "assets/avatar.png", // Ảnh hiển thị khi chưa load xong video
  },

  // Thời tiết hiển thị cạnh vị trí (Open-Meteo: miễn phí, không cần API key)
  // Đổi toạ độ ở đây nếu bạn chuyển nhà
  weather: {
    enabled: true,
    label: "Hải Dương", // Tên hiển thị trong tooltip
    lat: 20.9373, // Vĩ độ Hải Dương
    lon: 106.3145, // Kinh độ Hải Dương
    timezone: "Asia/Ho_Chi_Minh", // Múi giờ dùng để chia sáng/trưa/tối
  },

  // Trạng thái mini card (phong cách Discord / Bio card)
  statusCard: {
    avatar: "assets/dog_avatar.png", // Ảnh đại diện Discord: Chú chó con đáng yêu đeo tai nghe AI
    username: "Bầu Trời Xanh", // Tên hiển thị trên Discord card
    badge: "🦴", // Icon huy hiệu
    statusText: "🐾 Chú chó xanh thân yêu", // Dòng trạng thái
    isOnline: true, // Chấm xanh trạng thái Online
    discordUrl: "https://discord.com/users/1537015363714424863", // Link hồ sơ Discord
    copyText: "https://discord.com/users/1537015363714424863", // Nội dung sao chép khi bấm vào thẻ
  },

  // Danh sách mạng xã hội
  socials: [
    {
      name: "Discord",
      icon: "fab fa-discord",
      url: "https://discord.com/users/1537015363714424863",
      color: "#5865f2",
    },
    {
      name: "TikTok",
      icon: "fab fa-tiktok",
      url: "https://www.tiktok.com/@nguyenvanchung1906?_r=1&_t=ZS-9Amd7ebOQzA",
      color: "#00f2fe",
    },
    {
      name: "Spotify",
      icon: "fab fa-spotify",
      url: "https://open.spotify.com/user/123456789",
      color: "#1ed760",
    },
  ],


  // Cấu hình bài hát cho thanh phát nhạc phía dưới (Chọn bản 320kbps chất lượng cao nhất)
  music: {
    title: "Thương Nhau Đến Thế (Jerk Drill)", // Tên bài hát
    artist: "Gia Huy x Prod Young Tachi", // Ca sĩ / Producer
    src: "assets/thuong_nhau_den_the_320k.mp3", // File nhạc MP3 320kbps
    cover: "assets/avatar.png", // Ảnh đĩa nhạc xoay
  },

  // ========================================================
  // BÀI HÁT CÁ NHÂN (tự ghi âm) - Thay tên file vào đây!
  // Để file nhạc vào thư mục: assets/bai hat ca nhan/
  // ========================================================
  personalSongs: [
    { title: "Bài hát 1",  file: "bai_hat_1.mp3" },
    { title: "Bài hát 2",  file: "bai_hat_2.mp3" },
    { title: "Bài hát 3",  file: "bai_hat_3.mp3" },
    { title: "Bài hát 4",  file: "bai_hat_4.mp3" },
    { title: "Bài hát 5",  file: "bai_hat_5.mp3" },
    { title: "Bài hát 6",  file: "bai_hat_6.mp3" },
    { title: "Bài hát 7",  file: "bai_hat_7.mp3" },
    { title: "Bài hát 8",  file: "bai_hat_8.mp3" },
    { title: "Bài hát 9",  file: "bai_hat_9.mp3" },
    { title: "Bài hát 10", file: "bai_hat_10.mp3" },
  ],
};
