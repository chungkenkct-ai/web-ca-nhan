/* ========================================================
   EXTRAS.JS — HIỆU ỨNG NÂNG CAO
   1. Visualizer thật (Web Audio) quanh avatar
   2. Tilt 3D cho thẻ profile
   3. Chó con chạy theo con trỏ
   4. Theme theo giờ + thời tiết Hải Dương
   5. Mini-game hứng xương
   ======================================================== */

(function () {
  "use strict";

  const CFG = window.PROFILE_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ======================================================
     1. VISUALIZER THẬT
     ====================================================== */
  function initVisualizer() {
    const canvas = document.getElementById("avatar-viz");
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 240;
    canvas.width = Math.round(SIZE * DPR);
    canvas.height = Math.round(SIZE * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const CENTER = SIZE / 2;
    const BAR_COUNT = 56;
    const INNER_R = 74;

    let freqData = null;
    let phase = 0;

    function draw() {
      requestAnimationFrame(draw);
      if (document.hidden) return;

      const analyser = window.MUSIC_ANALYSER;
      const playing = document.body.classList.contains("audio-playing");

      if (analyser) {
        if (!freqData || freqData.length !== analyser.frequencyBinCount) {
          freqData = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(freqData);
      }

      phase += 0.014;
      ctx.clearRect(0, 0, SIZE, SIZE);

      for (let i = 0; i < BAR_COUNT; i++) {
        // Lấy đối xứng qua trục dọc cho cân
        const half = BAR_COUNT / 2;
        const idx = i < half ? i : BAR_COUNT - i - 1;

        let v;
        if (playing && analyser && freqData) {
          const bin = Math.floor((idx / half) * freqData.length * 0.72);
          v = (freqData[bin] || 0) / 255;
        } else {
          // Chưa phát nhạc: thở nhẹ cho đỡ trống
          v = 0.05 + 0.035 * (0.5 + 0.5 * Math.sin(phase * 1.6 + i * 0.35));
        }

        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;
        // Ngắn lại ở phía dưới để không đè lên tên
        const damp = 0.25 + 0.75 * ((1 - Math.sin(angle)) / 2);
        const len = (8 + v * 36) * damp;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x1 = CENTER + cos * INNER_R;
        const y1 = CENTER + sin * INNER_R;
        const x2 = CENTER + cos * (INNER_R + len);
        const y2 = CENTER + sin * (INNER_R + len);

        const hue = 330 - v * 45;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsla(${hue}, 100%, ${54 + v * 24}%, ${0.3 + v * 0.6})`;
        ctx.shadowColor = `hsla(${hue}, 100%, 62%, 0.85)`;
        ctx.shadowBlur = 5 + v * 10;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
  }

  /* ======================================================
     2. TILT 3D
     ====================================================== */
  function initTilt() {
    if (!canHover || reduceMotion) return;

    const card = document.getElementById("status-card-clickable");
    const avatar = document.querySelector(".avatar-container");
    if (!card && !avatar) return;

    const s = { tx: 0, ty: 0, x: 0, y: 0, raf: 0 };

    function render() {
      s.x = lerp(s.x, s.tx, 0.12);
      s.y = lerp(s.y, s.ty, 0.12);

      if (card) {
        const rx = -s.y * 7;
        const ry = s.x * 9;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
        card.style.setProperty("--mx", `${(50 + s.x * 42).toFixed(1)}%`);
        card.style.setProperty("--my", `${(50 + s.y * 42).toFixed(1)}%`);
      }

      if (avatar) {
        avatar.style.transform = `translate3d(${(s.x * 10).toFixed(2)}px, ${(s.y * 8).toFixed(2)}px, 0) rotateZ(${(s.x * 2).toFixed(2)}deg)`;
      }

      const settled = Math.abs(s.x - s.tx) < 0.002 && Math.abs(s.y - s.ty) < 0.002;
      s.raf = settled ? 0 : requestAnimationFrame(render);
    }

    function kick() {
      if (!s.raf) s.raf = requestAnimationFrame(render);
    }

    document.addEventListener(
      "pointermove",
      (e) => {
        const cx = window.innerWidth / 2 || 1;
        const cy = window.innerHeight / 2 || 1;
        s.tx = clamp((e.clientX - cx) / cx, -1, 1);
        s.ty = clamp((e.clientY - cy) / cy, -1, 1);
        kick();
      },
      { passive: true }
    );

    // Rời khỏi cửa sổ thì trả về giữa
    window.addEventListener("mouseleave", () => {
      s.tx = 0;
      s.ty = 0;
      kick();
    });
  }

  /* ======================================================
     3. CHÓ CON CHẠY THEO CON TRỎ
     ====================================================== */
  function initMascotChase() {
    const mascot = document.getElementById("puppy-mascot");
    if (!mascot || !canHover || reduceMotion) return;

    const wrap = mascot.querySelector(".mascot-avatar-wrap");
    const speech = mascot.querySelector(".mascot-speech");

    let w = 90;
    let h = 90;
    let pos = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let pointer = { x: 0, y: 0 };
    let lastMove = -Infinity;
    let hasMoved = false;
    let sleeping = false;
    let started = false;
    let lastFlip = 1;
    let dirVel = 0;

    function measure() {
      const r = mascot.getBoundingClientRect();
      // Khi mới bật class, element có thể chưa layout xong -> lấy tạm số mặc định
      w = Math.max(70, Math.round(r.width) || 90);
      h = Math.max(70, Math.round(r.height) || 90);
    }

    function restPosition() {
      return {
        x: window.innerWidth - 28 - w,
        y: window.innerHeight - 105 - h,
      };
    }

    function loop(now) {
      requestAnimationFrame(loop);
      if (document.hidden) return;

      const idle = !hasMoved || now - lastMove > 6000;
      if (idle) {
        target = restPosition();
        const dist = Math.hypot(pos.x - target.x, pos.y - target.y);
        // Chỉ ngủ khi đã từng chạy theo chuột và đã về tới chỗ nghỉ
        if (hasMoved && !sleeping && dist < 30) {
          sleeping = true;
          mascot.classList.add("sleeping");
          if (speech) speech.textContent = "💤";
        }
      } else {
        if (sleeping) {
          sleeping = false;
          mascot.classList.remove("sleeping");
          if (speech) speech.textContent = "Gâu gâu! 🐾";
        }
        // Đứng chếch lên trên - bên trái con trỏ, như đang lon ton theo chân
        target = {
          x: clamp(pointer.x - w - 6, 8, window.innerWidth - w - 8),
          y: clamp(pointer.y - h - 6, 8, window.innerHeight - h - 8),
        };
      }

      const prevX = pos.x;
      pos.x = lerp(pos.x, target.x, 0.09);
      pos.y = lerp(pos.y, target.y, 0.09);

      const vx = pos.x - prevX;
      // Làm mượt vận tốc rồi mới lật hướng, tránh lật liên tục khi rung
      dirVel = lerp(dirVel, vx, 0.25);
      if (wrap && Math.abs(dirVel) > 0.35) {
        const flip = dirVel < 0 ? -1 : 1;
        if (flip !== lastFlip) {
          lastFlip = flip;
          wrap.style.transform = `scaleX(${flip})`;
        }
      }

      mascot.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    }

    function begin() {
      mascot.classList.add("chasing-mode");
      // Đo lại sau khi đổi layout (speech bị thu nhỏ)
      requestAnimationFrame(() => {
        measure();
        const rest = restPosition();
        if (!started) {
          pos = { x: rest.x, y: rest.y };
          target = { x: rest.x, y: rest.y };
          started = true;
          mascot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
        requestAnimationFrame(loop);
      });
    }

    document.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        lastMove = performance.now();
        hasMoved = true;
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      measure();
    });

    // Bấm vào chó thì "thức dậy" và chạy theo tiếp
    mascot.addEventListener("click", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      lastMove = performance.now();
      hasMoved = true;
    });

    begin();
  }

  /* ======================================================
     4A. THEME THEO GIỜ
     ====================================================== */
  function initTimeTheme() {
    let hour = new Date().getHours();
    try {
      hour = Number(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          hour12: false,
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date())
      );
    } catch (err) {
      // Trình duyệt cũ không hỗ trợ timeZone -> dùng giờ máy
    }

    const phase =
      hour < 5 ? "night" : hour < 11 ? "morning" : hour < 17 ? "day" : hour < 20 ? "evening" : "night";

    document.documentElement.dataset.time = phase;
    return phase;
  }

  /* ======================================================
     4B. THỜI TIẾT HẢI DƯƠNG (Open-Meteo, không cần API key)
     ====================================================== */
  const WEATHER_META = {
    clear: { icon: "☀️", label: "trời quang" },
    partly: { icon: "⛅", label: "có mây" },
    cloud: { icon: "☁️", label: "nhiều mây" },
    fog: { icon: "🌫️", label: "sương mù" },
    drizzle: { icon: "🌦️", label: "mưa phùn" },
    rain: { icon: "🌧️", label: "mưa" },
    storm: { icon: "⛈️", label: "dông" },
    snow: { icon: "🌨️", label: "tuyết" },
    unknown: { icon: "🌡️", label: "" },
  };

  function codeToKey(code) {
    if (code === 0) return "clear";
    if (code === 1 || code === 2) return "partly";
    if (code === 3) return "cloud";
    if (code === 45 || code === 48) return "fog";
    if ([51, 53, 55, 56, 57].indexOf(code) !== -1) return "drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].indexOf(code) !== -1) return "rain";
    if ([71, 73, 75, 77, 85, 86].indexOf(code) !== -1) return "snow";
    if ([95, 96, 99].indexOf(code) !== -1) return "storm";
    return "unknown";
  }

  function initWeather(fx) {
    const cfg = CFG.weather || {};
    if (cfg.enabled === false) return;

    const lat = typeof cfg.lat === "number" ? cfg.lat : 20.9373;
    const lon = typeof cfg.lon === "number" ? cfg.lon : 106.3145;
    const tz = cfg.timezone || "Asia/Ho_Chi_Minh";
    const chip = document.getElementById("weather-text");

    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      lat +
      "&longitude=" +
      lon +
      "&current=temperature_2m,weather_code,precipitation,is_day&timezone=" +
      encodeURIComponent(tz);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status))))
      .then((data) => {
        clearTimeout(timer);
        const cur = data && data.current;
        if (!cur) return;

        const key = codeToKey(cur.weather_code);
        document.documentElement.dataset.weather = key;

        if (chip) {
          const meta = WEATHER_META[key] || WEATHER_META.unknown;
          chip.textContent = `· ${Math.round(cur.temperature_2m)}° ${meta.icon}`;
          chip.title = `Hải Dương: ${meta.label}`;
        }

        const night =
          cur.is_day === 0 ||
          document.documentElement.dataset.time === "night" ||
          document.documentElement.dataset.time === "evening";

        if (key === "rain" || key === "storm" || key === "drizzle") {
          fx.setMode("rain");
        } else if (night) {
          fx.setMode("stars");
        } else {
          fx.setMode("none");
        }
      })
      .catch((err) => {
        clearTimeout(timer);
        console.warn("Không lấy được thời tiết (vẫn chạy bình thường):", err.message);
      });
  }

  /* ======================================================
     4C. LỚP HIỆU ỨNG MƯA / SAO
     ====================================================== */
  function initWeatherCanvas() {
    const canvas = document.getElementById("weather-canvas");
    const noop = { setMode: function () {} };
    if (!canvas || reduceMotion) return noop;

    const ctx = canvas.getContext("2d");
    if (!ctx) return noop;

    let W = 0;
    let H = 0;
    let mode = "none";
    let drops = [];
    let stars = [];

    function buildStars() {
      stars = [];
      const count = Math.round(clamp((W * H) / 26000, 40, 140));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.8,
          r: Math.random() * 1.3 + 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.1,
        });
      }
    }

    function buildDrops() {
      drops = [];
      const count = Math.round(clamp(W / 9, 60, 200));
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * W,
          y: Math.random() * H,
          len: 10 + Math.random() * 22,
          speed: 7 + Math.random() * 9,
          alpha: 0.15 + Math.random() * 0.45,
        });
      }
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildStars();
      buildDrops();
    }

    function drawRain() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed;
        d.x -= d.speed * 0.14;
        if (d.y > H + 30) {
          d.y = -30;
          d.x = Math.random() * (W + 60);
        }
        if (d.x < -30) d.x = W + 20;
        ctx.strokeStyle = `rgba(168, 208, 255, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * 0.14, d.y + d.len);
        ctx.stroke();
      }
    }

    function drawStars(t) {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${0.25 + tw * 0.6})`;
        ctx.fill();
      }
    }

    let last = 0;
    function loop(t) {
      requestAnimationFrame(loop);
      if (document.hidden || mode === "none") return;
      const dt = Math.min(50, t - last || 16);
      last = t;

      if (mode === "rain") {
        // Vẽ theo nhịp màn hình, tốc độ hạt tính bằng frame (đủ mượt, đủ nhẹ)
        drawRain();
      } else if (mode === "stars") {
        drawStars(t);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(loop);

    return {
      setMode: function (next) {
        if (!next || next === mode) return;
        mode = next;
        canvas.style.opacity = next === "rain" ? "0.5" : next === "stars" ? "0.55" : "0";
        if (next === "none") ctx.clearRect(0, 0, W, H);
      },
    };
  }

  /* ======================================================
     5. MINI-GAME HỨNG XƯƠNG
     ====================================================== */
  function initBoneGame() {
    const overlay = document.getElementById("bone-game");
    const openBtn = document.getElementById("game-btn");
    if (!overlay || !openBtn) return;

    const stage = document.getElementById("bg-stage");
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");
    const veil = document.getElementById("bg-veil");
    const veilTitle = document.getElementById("bg-veil-title");
    const veilSub = document.getElementById("bg-veil-sub");
    const playBtn = document.getElementById("bg-play");
    const closeBtn = document.getElementById("bg-close");
    const scoreEl = document.getElementById("bg-score");
    const bestEl = document.getElementById("bg-best");
    const livesEl = document.getElementById("bg-lives");

    const BEST_KEY = "chungkenkct_bone_best";
    const MAX_LIVES = 3;

    let best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
    bestEl.textContent = String(best);

    let W = 320;
    let H = 200;
    let state = "idle"; // idle | playing | over
    let score = 0;
    let lives = MAX_LIVES;
    let bones = [];
    let pops = [];
    let playerX = 0;
    let spawnTimer = 0;
    let difficulty = 0;
    let raf = 0;
    let lastT = 0;

    function resize() {
      const rect = stage.getBoundingClientRect();
      W = Math.max(260, Math.round(rect.width));
      H = Math.max(180, Math.round(rect.height));
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!playerX) playerX = W / 2;
      playerX = clamp(playerX, 34, W - 34);
    }

    function updateHearts() {
      livesEl.textContent = "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, MAX_LIVES - lives));
    }

    function drawPlayer(px) {
      const py = H - 34;
      ctx.beginPath();
      ctx.ellipse(px, py, 34, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 51, 119, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "26px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐶", px, py - 24);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(255, 51, 119, 0.12)");
      g.addColorStop(1, "rgba(8, 4, 14, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(92, 225, 230, 0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H - 46);
      ctx.lineTo(W, H - 46);
      ctx.stroke();

      const boneSize = Math.round(clamp(H * 0.08, 18, 30));
      ctx.font = `${boneSize}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < bones.length; i++) {
        const b = bones[i];
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillText("🦴", 0, 0);
        ctx.restore();
      }

      drawPlayer(playerX);

      // Điểm bay lên khi hứng được
      for (let i = 0; i < pops.length; i++) {
        const p = pops[i];
        ctx.globalAlpha = Math.max(0, p.life / 700);
        ctx.fillStyle = "#ffd166";
        ctx.font = "700 15px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("+10", p.x, p.y);
        ctx.globalAlpha = 1;
      }
    }

    function spawnBone() {
      bones.push({
        x: 28 + Math.random() * Math.max(1, W - 56),
        y: -30,
        vy: 1.8 + Math.random() * 1.1 + difficulty * 0.06,
        rot: (Math.random() - 0.5) * 0.8,
        spin: (Math.random() - 0.5) * 0.06,
      });
    }

    function update(dt) {
      const k = dt / 16;

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnBone();
        difficulty++;
        spawnTimer = Math.max(360, 950 - difficulty * 22);
      }

      for (let i = bones.length - 1; i >= 0; i--) {
        const b = bones[i];
        b.y += b.vy * k;
        b.rot += b.spin * k;

        const caught = b.y > H - 62 && b.y < H - 12 && Math.abs(b.x - playerX) < 46;
        if (caught) {
          bones.splice(i, 1);
          score += 10;
          scoreEl.textContent = String(score);
          pops.push({ x: b.x, y: H - 90, life: 700 });
          continue;
        }

        if (b.y > H + 30) {
          bones.splice(i, 1);
          lives--;
          updateHearts();
          if (lives <= 0) {
            gameOver();
            return;
          }
        }
      }

      for (let i = pops.length - 1; i >= 0; i--) {
        pops[i].life -= dt;
        pops[i].y -= 0.9 * k;
        if (pops[i].life <= 0) pops.splice(i, 1);
      }
    }

    function loop(t) {
      if (state !== "playing") {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(48, t - lastT || 16);
      lastT = t;
      update(dt);
      if (state === "playing") draw();
    }

    function start() {
      resize();
      state = "playing";
      score = 0;
      lives = MAX_LIVES;
      bones = [];
      pops = [];
      spawnTimer = 260;
      difficulty = 0;
      playerX = W / 2;
      scoreEl.textContent = "0";
      updateHearts();
      veil.classList.remove("game-over");
      veil.style.opacity = "0";
      veil.style.visibility = "hidden";
      lastT = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function gameOver() {
      state = "over";
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (score > best) {
        best = score;
        bestEl.textContent = String(best);
        try {
          localStorage.setItem(BEST_KEY, String(best));
        } catch (err) {
          /* chế độ ẩn danh có thể chặn localStorage */
        }
      }
      veil.classList.add("game-over");
      veilTitle.textContent = score >= best && score > 0 ? `Kỷ lục mới: ${score} điểm! 🏆` : `Hết lượt rồi! ${score} điểm 🦴`;
      veilSub.textContent = `Kỷ lục của bạn: ${best} điểm. Chơi lại nhé?`;
      playBtn.textContent = "Chơi lại";
      veil.style.opacity = "1";
      veil.style.visibility = "visible";
      draw();
    }

    function open() {
      overlay.hidden = false;
      document.body.classList.add("game-open");
      resize();
      state = "idle";
      score = 0;
      lives = MAX_LIVES;
      bones = [];
      pops = [];
      playerX = W / 2;
      scoreEl.textContent = "0";
      updateHearts();
      veilTitle.textContent = "Hứng xương rơi nào! 🐶";
      veilSub.textContent = "Di chuột (hoặc kéo tay) để hứng. Bỏ lỡ 3 lần là thua.";
      playBtn.textContent = "Chơi";
      veil.classList.remove("game-over");
      veil.style.opacity = "1";
      veil.style.visibility = "visible";
      draw();
      closeBtn.focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.classList.remove("game-open");
      state = "idle";
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function movePlayer(clientX) {
      const rect = stage.getBoundingClientRect();
      playerX = clamp(clientX - rect.left, 34, Math.max(34, W - 34));
    }

    stage.addEventListener("pointermove", (e) => movePlayer(e.clientX), { passive: true });
    stage.addEventListener(
      "pointerdown",
      (e) => {
        movePlayer(e.clientX);
        if (state === "idle") start();
      },
      { passive: true }
    );

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      start();
    });
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
    });
    openBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      open();
    });

    // Không để cú click trong game kích hoạt hiệu ứng dấu chân toàn trang
    ["click", "pointerdown", "mousedown"].forEach((type) => {
      overlay.addEventListener(type, (e) => e.stopPropagation());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) close();
    });

    window.addEventListener("resize", () => {
      if (!overlay.hidden) resize();
    });

    // Ẩn tab thì dừng game cho nhẹ máy
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state === "playing") {
        state = "idle";
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        veilTitle.textContent = "Tạm dừng ⏸️";
        veilSub.textContent = "Bấm Chơi để tiếp tục.";
        playBtn.textContent = "Tiếp tục";
        veil.style.opacity = "1";
        veil.style.visibility = "visible";
      }
    });
  }

  /* ======================================================
     6. PANEL BÀI HÁT CÁ NHÂN (tự quét thư mục)
     ====================================================== */
  const COVER_GRADIENTS = [
    "linear-gradient(135deg,#ff3377,#ff8a5c)",
    "linear-gradient(135deg,#5ce1e6,#3b82f6)",
    "linear-gradient(135deg,#a855f7,#ff3377)",
    "linear-gradient(135deg,#f59e0b,#ff3377)",
    "linear-gradient(135deg,#22c55e,#5ce1e6)",
  ];

  function showToast(message) {
    const toast = document.getElementById("copy-toast");
    const msg = document.getElementById("copy-toast-msg");
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function initPersonalSongs() {
    const listEl = document.getElementById("psongs-list");
    if (!listEl) return;

    const countEl = document.getElementById("psongs-count");
    const npBox = document.getElementById("psongs-now-playing");
    const npTitle = document.getElementById("psongs-np-title");
    const npCover = document.getElementById("psongs-np-cover");
    let playingRow = null;

    function renderEmpty(html) {
      listEl.innerHTML = "";
      const box = document.createElement("div");
      box.className = "psongs-empty";
      box.innerHTML = html;
      listEl.appendChild(box);
      if (countEl) countEl.textContent = "0 bài";
    }

    function playSong(song, row, gradient) {
      const player = window.appPlayer;
      if (!player || typeof player.loadTrack !== "function") {
        showToast("Trình phát nhạc chưa sẵn sàng, thử lại nhé 🐾");
        return;
      }

      if (playingRow) playingRow.classList.remove("playing");
      playingRow = row;
      row.classList.add("playing");

      if (npBox) npBox.classList.add("active");
      if (npTitle) npTitle.textContent = song.title;
      if (npCover) npCover.style.background = gradient;

      player.loadTrack({
        title: song.title,
        artist: "Bài hát cá nhân",
        src: song.url,
        cover: "assets/avatar.png",
      });
    }

    function render(songs) {
      listEl.innerHTML = "";

      if (!songs.length) {
        renderEmpty(
          "Chưa có bài nào trong thư mục.<br><span>Bỏ file .mp3 vào assets/bai hat ca nhan/ rồi tải lại trang.</span>"
        );
        return;
      }

      if (countEl) countEl.textContent = songs.length + " bài";

      songs.forEach(function (song, i) {
        const gradient = COVER_GRADIENTS[i % COVER_GRADIENTS.length];

        const row = document.createElement("div");
        row.className = "psong-row";
        row.title = "Phát: " + song.title;

        const num = document.createElement("span");
        num.className = "psong-num";
        num.textContent = String(i + 1).padStart(2, "0");

        const cover = document.createElement("div");
        cover.className = "psong-cover";
        cover.style.background = gradient;
        cover.innerHTML = '<i class="fas fa-music"></i>';

        const title = document.createElement("div");
        title.className = "psong-title";
        title.textContent = song.title;

        const icon = document.createElement("i");
        icon.className = "fas fa-play psong-play-icon";

        row.appendChild(num);
        row.appendChild(cover);
        row.appendChild(title);
        row.appendChild(icon);

        row.addEventListener("click", function () {
          playSong(song, row, gradient);
        });

        listEl.appendChild(row);
      });
    }

    // Ưu tiên API tự quét thư mục; không có (file:// hoặc GitHub Pages) thì dùng config
    fetch("/api/songs", { cache: "no-store" })
      .then(function (res) {
        return res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status));
      })
      .then(function (data) {
        render((data && data.songs) || []);
      })
      .catch(function () {
        const fallback = Array.isArray(CFG.personalSongs) ? CFG.personalSongs : [];
        if (fallback.length) {
          render(
            fallback.map(function (s) {
              return {
                title: s.title || s.file,
                url: "assets/bai hat ca nhan/" + encodeURIComponent(s.file),
              };
            })
          );
        } else {
          renderEmpty(
            "Không đọc được thư mục nhạc.<br><span>Hãy chạy Chay_Trang_Web.bat thay vì mở trực tiếp file HTML.</span>"
          );
        }
      });

    window.addEventListener("music-error", function () {
      showToast("Không tìm thấy file nhạc này 😢");
    });
  }

  /* ======================================================
     KHỞI ĐỘNG
     ====================================================== */
  function boot() {
    try {
      initTimeTheme();
      const fx = initWeatherCanvas();
      initWeather(fx);
      initVisualizer();
      initTilt();
      initMascotChase();
      initBoneGame();
      initPersonalSongs();
    } catch (err) {
      console.error("extras.js gặp lỗi (trang vẫn chạy bình thường):", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
