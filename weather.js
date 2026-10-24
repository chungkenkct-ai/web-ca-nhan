/* ========================================================
   WEATHER.JS — THỜI TIẾT THEO TOẠ ĐỘ + KHÔNG KHÍ THEO GIỜ
   - Hiện nhiệt độ + icon cạnh vị trí
   - Ban đêm: sao trời, tông tối
   - Trời mưa: mưa rơi, tông lạnh
   Dùng Open-Meteo (miễn phí, không cần API key)
   ======================================================== */

(function () {
  "use strict";

  const CFG = window.PROFILE_CONFIG || {};
  const CONFIG = CFG.weather || {};
  if (CONFIG.enabled === false) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

  const LAT = typeof CONFIG.lat === "number" ? CONFIG.lat : 20.9373;
  const LON = typeof CONFIG.lon === "number" ? CONFIG.lon : 106.3145;
  const TZ = CONFIG.timezone || "Asia/Ho_Chi_Minh";
  const LABEL = CONFIG.label || "Hải Dương";

  /* ---------- 1. KHÔNG KHÍ THEO GIỜ ---------- */
  function currentHour() {
    try {
      return Number(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          hour12: false,
          timeZone: TZ,
        }).format(new Date())
      );
    } catch (err) {
      return new Date().getHours();
    }
  }

  function phaseOf(hour) {
    if (hour < 5) return "night";
    if (hour < 11) return "morning";
    if (hour < 17) return "day";
    if (hour < 20) return "evening";
    return "night";
  }

  let phase = phaseOf(currentHour());
  document.documentElement.dataset.time = phase;

  /* ---------- 2. LỚP MƯA / SAO ---------- */
  function createSky() {
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

        ctx.strokeStyle = "rgba(168, 208, 255, " + d.alpha + ")";
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
        ctx.fillStyle = "rgba(220, 235, 255, " + (0.25 + tw * 0.6).toFixed(3) + ")";
        ctx.fill();
      }
    }

    function loop(t) {
      requestAnimationFrame(loop);
      if (document.hidden || mode === "none") return;
      if (mode === "rain") drawRain();
      else if (mode === "stars") drawStars(t);
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

  /* ---------- 3. MÃ THỜI TIẾT ---------- */
  const WEATHER_META = {
    clear: { icon: "☀️", label: "trời quang" },
    partly: { icon: "⛅", label: "có mây" },
    cloud: { icon: "☁️", label: "nhiều mây" },
    fog: { icon: "🌫️", label: "sương mù" },
    drizzle: { icon: "🌦️", label: "mưa phùn" },
    rain: { icon: "🌧️", label: "mưa" },
    storm: { icon: "⛈️", label: "dông" },
    snow: { icon: "🌨️", label: "tuyết" },
    unknown: { icon: "🌡️", label: "đang cập nhật" },
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

  /* ---------- 4. LẤY THỜI TIẾT ---------- */
  const sky = createSky();
  const chip = document.getElementById("weather-text");

  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" + LAT +
    "&longitude=" + LON +
    "&current=temperature_2m,weather_code,is_day,precipitation&timezone=" +
    encodeURIComponent(TZ);

  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, 7000);

  fetch(url, { signal: controller.signal })
    .then(function (res) {
      return res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status));
    })
    .then(function (data) {
      clearTimeout(timer);
      const cur = data && data.current;
      if (!cur) return;

      const key = codeToKey(cur.weather_code);
      const meta = WEATHER_META[key] || WEATHER_META.unknown;

      document.documentElement.dataset.weather = key;

      if (chip) {
        chip.textContent = "· " + Math.round(cur.temperature_2m) + "° " + meta.icon;
        chip.title = LABEL + ": " + meta.label;
      }

      // Ban đêm do API báo (đề phòng lệch múi giờ máy)
      if (cur.is_day === 0) {
        phase = "night";
        document.documentElement.dataset.time = phase;
      }

      if (key === "rain" || key === "storm" || key === "drizzle") {
        sky.setMode("rain");
      } else if (phase === "night" || phase === "evening") {
        sky.setMode("stars");
      } else {
        sky.setMode("none");
      }
    })
    .catch(function (err) {
      clearTimeout(timer);
      // Mất mạng vẫn giữ không khí theo giờ, chỉ thiếu số nhiệt độ
      console.warn("Không lấy được thời tiết (trang vẫn chạy bình thường):", err.message);
      if (phase === "night" || phase === "evening") sky.setMode("stars");
    });
})();
