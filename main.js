// ========================================================
// LOGIC CHÍNH: KHỞI TẠO DỮ LIỆU & HIỆU ỨNG TƯƠNG TÁC
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const config = window.PROFILE_CONFIG || {};

  // 1. Áp dụng thông tin Profile
  if (config.profile) {
    const nameEl = document.getElementById("profile-name");
    const handleEl = document.getElementById("profile-handle");
    const locationEl = document.getElementById("profile-location");
    const avatarEl = document.getElementById("profile-avatar");
    const viewsEl = document.getElementById("profile-views");

    if (nameEl) nameEl.textContent = config.profile.name;
    if (handleEl) handleEl.textContent = config.profile.handle;
    if (locationEl) locationEl.textContent = config.profile.location;
    if (avatarEl) avatarEl.src = config.profile.avatar;
    if (viewsEl) viewsEl.textContent = config.profile.views;
  }

  // 2. Áp dụng thẻ trạng thái (Discord Status Card)
  if (config.statusCard) {
    const cardAvatar = document.getElementById("status-avatar");
    const cardUsername = document.getElementById("status-username");
    const cardBadge = document.getElementById("status-badge");
    const cardText = document.getElementById("status-text");
    const cardDot = document.getElementById("status-online-dot");

    if (cardAvatar) cardAvatar.src = config.statusCard.avatar;
    if (cardUsername) cardUsername.textContent = config.statusCard.username;
    if (cardBadge) cardBadge.textContent = config.statusCard.badge;
    if (cardText) cardText.textContent = config.statusCard.statusText;
    if (cardDot)
      cardDot.style.display = config.statusCard.isOnline ? "block" : "none";
  }

  // 3. Hiển thị danh sách mạng xã hội
  const socialsContainer = document.getElementById("socials-container");
  if (socialsContainer && config.socials) {
    socialsContainer.innerHTML = "";
    config.socials.forEach((social) => {
      const a = document.createElement("a");
      a.href = social.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "social-btn";
      a.title = social.name;
      a.style.setProperty("--hover-color", social.color || "#ff4d94");

      const icon = document.createElement("i");
      icon.className = social.icon;
      a.appendChild(icon);

      socialsContainer.appendChild(a);
    });
  }

  // 4. Cấu hình & Kích hoạt Video nền
  const bgVideo = document.getElementById("bg-video");
  if (bgVideo) {
    if (config.background?.poster) {
      bgVideo.poster = config.background.poster;
    }
    if (config.background?.video) {
      const source = bgVideo.querySelector("source");
      if (source && !source.src.endsWith(config.background.video)) {
        source.src = config.background.video;
        bgVideo.load();
      }
    }
    // Cố gắng phát video nền chế độ muted
    bgVideo.play().catch(() => {
      // Trình duyệt sẽ cho phép phát sau cú click đầu tiên
    });
  }

  // 5. Khởi tạo Trình phát nhạc
  const player = new window.MusicPlayer();

  // 6. Màn hình "Click anywhere to enter"
  const enterOverlay = document.getElementById("enter-overlay");
  if (enterOverlay) {
    enterOverlay.addEventListener("click", () => {
      enterOverlay.classList.add("fade-out");
      setTimeout(() => {
        enterOverlay.style.display = "none";
      }, 700);

      // Đảm bảo video nền tiếp tục phát mượt mà
      if (bgVideo && bgVideo.paused) {
        bgVideo.play().catch(() => {});
      }

      // Tự động phát nhạc khi vào trang
      player.play();
    });
  }

  // ========================================================
  // 7. HIỆU ỨNG DẤU CHÂN CHÓ BƯỚC ĐI CÙNG CHUỘT (PAW TRAIL)
  // ========================================================
  let lastX = 0;
  let lastY = 0;
  let isLeftPaw = false;
  let isFirstMove = true;
  const STEP_DISTANCE = 30; // Mỗi 30px di chuyển chuột sẽ in 1 dấu chân chó

  const pawSvgString = `
    <svg viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="pawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#5ce1e6"/>
          <stop offset="100%" stop-color="#ff758c"/>
        </linearGradient>
      </defs>
      <path d="M 18 17 C 13.5 17 10 20 10.5 24.5 C 11 28 14 30 18 30 C 22 30 25 28 25.5 24.5 C 26 20 22.5 17 18 17 Z" fill="url(#pawGrad)"/>
      <ellipse cx="8" cy="16" rx="2.6" ry="3.8" transform="rotate(-32 8 16)" fill="url(#pawGrad)"/>
      <ellipse cx="13.5" cy="11.5" rx="3" ry="4.3" transform="rotate(-12 13.5 11.5)" fill="url(#pawGrad)"/>
      <ellipse cx="22.5" cy="11.5" rx="3" ry="4.3" transform="rotate(12 22.5 11.5)" fill="url(#pawGrad)"/>
      <ellipse cx="28" cy="16" rx="2.6" ry="3.8" transform="rotate(32 28 16)" fill="url(#pawGrad)"/>
    </svg>
  `;

  document.addEventListener("mousemove", (e) => {
    const curX = e.clientX;
    const curY = e.clientY;

    if (isFirstMove) {
      lastX = curX;
      lastY = curY;
      isFirstMove = false;
      return;
    }

    const dx = curX - lastX;
    const dy = curY - lastY;
    const dist = Math.hypot(dx, dy);

    if (dist >= STEP_DISTANCE) {
      // Góc xoay hướng dấu chân theo chiều chuột di chuyển
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = angleRad * (180 / Math.PI) + 90;

      // Độ lệch bước chân trái / phải (như chú cún bước đi 2 chân xen kẽ)
      const offsetDist = isLeftPaw ? -9 : 9;
      isLeftPaw = !isLeftPaw;

      const perpAngle = angleRad + Math.PI / 2;
      const spawnX = curX + Math.cos(perpAngle) * offsetDist;
      const spawnY = curY + Math.sin(perpAngle) * offsetDist;

      createPawStep(spawnX, spawnY, angleDeg);

      lastX = curX;
      lastY = curY;
    }
  });

  function createPawStep(x, y, angle) {
    const paw = document.createElement("div");
    paw.className = "dog-paw-trail";
    paw.innerHTML = pawSvgString;
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    paw.style.setProperty("--rot", `${angle}deg`);
    paw.style.setProperty("--paw-glow", isLeftPaw ? "#5ce1e6" : "#ff6b8b");

    document.body.appendChild(paw);

    // Hạt bụi sao li ti
    if (Math.random() > 0.4) {
      createSparkle(
        x + (Math.random() - 0.5) * 16,
        y + (Math.random() - 0.5) * 16,
      );
    }

    setTimeout(() => {
      paw.remove();
    }, 950);
  }

  function createSparkle(x, y) {
    const sparkle = document.createElement("div");
    sparkle.className = "paw-sparkle";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.setProperty("--dx", `${(Math.random() - 0.5) * 20}px`);
    sparkle.style.setProperty("--dy", `${(Math.random() - 0.5) * 20 - 10}px`);
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 650);
  }

  // ========================================================
  // 8. HIỆU ỨNG CLICK BẮN VẾT CHÂN & KHÚC XƯƠNG CUTE
  // ========================================================
  document.addEventListener("click", (e) => {
    // Không bắn hiệu ứng nếu bấm trúng các nút tương tác
    if (
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("a")
    ) {
      return;
    }

    createPawBurst(e.clientX, e.clientY);
  });

  function createPawBurst(x, y) {
    const icons = ["🐾", "🦴", "✨", "🐾", "♥", "🦴"];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "floating-paw-burst";
      el.innerHTML = icons[i % icons.length];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = Math.random() * 45 + 25;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 25;
      const rot = (Math.random() - 0.5) * 60;
      const size = Math.random() * 8 + 14;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.fontSize = `${size}px`;
      el.style.setProperty("--tx", `${tx}px`);
      el.style.setProperty("--ty", `${ty}px`);
      el.style.setProperty("--rot", `${rot}deg`);

      document.body.appendChild(el);

      setTimeout(() => {
        el.remove();
      }, 900);
    }
  }

  // ========================================================
  // 9. LƯỢT XEM THẬT TỪ API (HỖ TRỢ TỐT CẢ GITHUB PAGES)
  // ========================================================
  const viewsEl = document.getElementById("profile-views");
  const viewsBadge = document.getElementById("views-counter-badge");

  async function fetchRealViews() {
    if (!viewsEl) return;

    // Lấy số đếm đã lưu trước đó nếu có
    const cached = localStorage.getItem("chungkenkct_bio_views");
    if (cached) {
      viewsEl.textContent = Number(cached).toLocaleString("vi-VN");
    }

    try {
      // API đếm lượt truy cập thực tế miễn phí, hoạt động trơn tru trên GitHub Pages
      const res = await fetch(
        "https://countapi.mileshilliard.com/api/v1/hit/chungkenkct_bio_views",
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.value) {
          const newCount = Number(data.value);
          animateCounter(viewsEl, cached ? Number(cached) : 1, newCount);
          localStorage.setItem("chungkenkct_bio_views", newCount);
        }
      }
    } catch (err) {
      console.warn(
        "Could not reach visitor counter API, using local storage counter:",
        err,
      );
      // Fallback nếu ngoại tuyến: tăng nhẹ bộ đếm local
      let count = Number(cached || config.profile?.views || 89) + 1;
      localStorage.setItem("chungkenkct_bio_views", count);
      viewsEl.textContent = count.toLocaleString("vi-VN");
    }
  }

  function animateCounter(el, start, end) {
    if (start === end) {
      el.textContent = end.toLocaleString("vi-VN");
      return;
    }
    const duration = 1200;
    const startTime = performance.now();

    function updateNum(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.floor(start + (end - start) * easeProgress);
      el.textContent = current.toLocaleString("vi-VN");

      if (progress < 1) {
        requestAnimationFrame(updateNum);
      } else {
        el.classList.add("views-pop");
        setTimeout(() => el.classList.remove("views-pop"), 500);
      }
    }
    requestAnimationFrame(updateNum);
  }

  fetchRealViews();

  if (viewsBadge) {
    viewsBadge.addEventListener("click", () => {
      viewsBadge.classList.add("views-pop");
      setTimeout(() => viewsBadge.classList.remove("views-pop"), 400);
    });
  }

  // ========================================================
  // 10. DÒNG CHỮ GÕ TỰ ĐỘNG (TYPEWRITER QUOTE)
  // ========================================================
  function initTypewriter() {
    const textEl = document.getElementById("quote-text");
    if (!textEl) return;

    const quotes = [
      "🐾 Chú chó xanh thân thiện & đáng yêu",
      "🎧 Đang chill cùng bài hát: Thương Nhau Đến Thế",
      "✨ Chúc bạn có một ngày tràn đầy năng lượng & niềm vui!",
      "🐶 Hãy thử chạm vào chú cún con góc màn hình nha!",
      "💖 Cảm ơn bạn vì đã ghé thăm ngôi nhà nhỏ của mình",
    ];

    let qIndex = 0;
    let cIndex = 0;
    let deleting = false;

    function tick() {
      const current = quotes[qIndex];

      if (deleting) {
        textEl.textContent = current.substring(0, cIndex - 1);
        cIndex--;
      } else {
        textEl.textContent = current.substring(0, cIndex + 1);
        cIndex++;
      }

      let speed = deleting ? 25 : 55;

      if (!deleting && cIndex === current.length) {
        speed = 2400; // Dừng lại đọc
        deleting = true;
      } else if (deleting && cIndex === 0) {
        deleting = false;
        qIndex = (qIndex + 1) % quotes.length;
        speed = 500;
      }

      setTimeout(tick, speed);
    }

    tick();
  }

  initTypewriter();

  // ========================================================
  // 11. THÚ CƯNG ẢO MINI TƯƠNG TÁC (PUPPY MASCOT)
  // ========================================================
  function initPuppyMascot() {
    const mascot = document.getElementById("puppy-mascot");
    const speech = document.getElementById("mascot-speech");
    if (!mascot || !speech) return;

    const dialogues = [
      "Gâu gâu! Chào bạn nha 🐾",
      "Nhạc cuốn quá phải không bạn 🎧",
      "Chúc bạn một ngày tuyệt vời ✨",
      "Bấm vào tớ nữa đi gâu gâu! 🦴",
      "Gâu gâu! Cảm ơn bạn đã ghé thăm 💖",
      "Tớ là bạn thân của ChungKenkCt nè 🐶",
    ];

    let dIndex = 0;
    mascot.addEventListener("click", (e) => {
      e.stopPropagation();
      dIndex = (dIndex + 1) % dialogues.length;
      speech.textContent = dialogues[dIndex];

      // Hiệu ứng nảy thoại
      speech.style.animation = "none";
      void speech.offsetWidth;
      speech.style.animation = "fadeInPop 0.35s ease";

      // Bắn ra khúc xương và tim
      createPawBurst(e.clientX, e.clientY);
    });
  }

  initPuppyMascot();

  // ========================================================
  // 12. BẤM VÀO DISCORD ĐỂ SAO CHÉP (COPY DISCORD LINK)
  // ========================================================
  function initDiscordCopy() {
    const card = document.getElementById("status-card-clickable");
    const toast = document.getElementById("copy-toast");
    if (!card) return;

    card.addEventListener("click", () => {
      const linkToCopy =
        config.statusCard?.copyText ||
        config.statusCard?.discordUrl ||
        "https://discord.com/users/1537015363714424863";

      // Hàm copy tương thích tốt trên cả HTTP/HTTPS/Local file
      const performCopy = () => {
        if (navigator.clipboard && window.isSecureContext) {
          return navigator.clipboard.writeText(linkToCopy);
        }
        return new Promise((resolve, reject) => {
          const ta = document.createElement("textarea");
          ta.value = linkToCopy;
          ta.style.position = "fixed";
          ta.style.left = "-999999px";
          ta.style.top = "-999999px";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          try {
            const successful = document.execCommand("copy");
            successful ? resolve() : reject(new Error("Copy failed"));
          } catch (err) {
            reject(err);
          } finally {
            ta.remove();
          }
        });
      };

      performCopy()
        .then(() => {
          if (toast) {
            toast.classList.add("show");
            setTimeout(() => {
              toast.classList.remove("show");
            }, 2500);
          }
        })
        .catch((err) => {
          console.error("Không thể sao chép:", err);
        });
    });
  }

  initDiscordCopy();
});
