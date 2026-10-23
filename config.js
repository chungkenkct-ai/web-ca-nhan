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
      name: "Facebook",
      icon: "fab fa-facebook-f",
      url: "https://facebook.com",
      color: "#1877f2",
    },
    {
      name: "Instagram",
      icon: "fab fa-instagram",
      url: "https://instagram.com",
      color: "#e4405f",
    },
    {
      name: "Discord",
      icon: "fab fa-discord",
      url: "https://discord.com/users/1537015363714424863",
      color: "#5865f2",
    },
    {
      name: "TikTok",
      icon: "fab fa-tiktok",
      url: "https://tiktok.com",
      color: "#00f2fe",
    },
    {
      name: "Spotify",
      icon: "fab fa-spotify",
      url: "https://spotify.com",
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
};

