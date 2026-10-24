/* ========================================================
   SKY-FX.JS — SAO BĂNG + BỤI SÁNG
   Tự tạo canvas, không cần CSS, không đụng file khác.
   Tinh chỉnh: xem object CFG bên dưới.
   ======================================================== */

(function () {
  "use strict";

  // Người dùng tắt hiệu ứng chuyển động thì thôi
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CFG = {
    burst: 6, // số sao băng mỗi đợt
    spacingMin: 200, // cách nhau trong đợt (ms)
    spacingMax: 380,
    waveGapMin: 7000, // nghỉ giữa 2 đợt (ms)
    waveGapMax: 13000,
    dust: 30, // số hạt bụi sáng
    bigChance: 0.18, // tỉ lệ sao băng to
    huePink: 330,
    hueCyan: 190,
  };

  if (window.innerWidth < 640) {
    CFG.dust = 18;
    CFG.burst = 4;
    CFG.waveGapMin = 9000;
    CFG.waveGapMax = 16000;
  }

  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  var canvas = document.createElement("canvas");
  canvas.id = "sky-fx";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "1";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 0;
  var H = 0;
  var dust = [];
  var meteors = [];
  var pending = []; // thời điểm rơi của từng sao băng trong đợt
  var nextWaveAt = 0;

  function scheduleWave(now) {
    var at = now + 400;
    for (var i = 0; i < CFG.burst; i++) {
      pending.push(at);
      at += CFG.spacingMin + Math.random() * (CFG.spacingMax - CFG.spacingMin);
    }
    nextWaveAt = at + CFG.waveGapMin + Math.random() * (CFG.waveGapMax - CFG.waveGapMin);
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedDust();
  }

  function seedDust() {
    dust = [];
    for (var i = 0; i < CFG.dust; i++) {
      dust.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.7 + Math.random() * 1.8,
        a: 0.18 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.014,
        vy: -0.004 - Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.2,
        hue: Math.random() > 0.55 ? CFG.hueCyan : CFG.huePink,
      });
    }
  }

  function spawnMeteor() {
    var angle = (145 + (Math.random() - 0.5) * 26) * (Math.PI / 180); // chéo xuống trái
    var speed = 600 + Math.random() * 460;
    var big = Math.random() < CFG.bigChance;

    meteors.push({
      x: W * (0.15 + Math.random() * 1.0),
      y: -80 - Math.random() * 200,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      tail: big ? 0.36 : 0.28, // thời gian (giây) để vẽ đuôi
      width: big ? 4 : 2.6,
      hue: big ? CFG.huePink : Math.random() < 0.5 ? CFG.hueCyan : CFG.huePink,
      alpha: 1,
    });
  }

  function drawDust(t) {
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      d.x += d.vx * 16;
      d.y += d.vy * 16;

      if (d.y < -10) {
        d.y = H + 10;
        d.x = Math.random() * W;
      }
      if (d.x < -10) d.x = W + 10;
      if (d.x > W + 10) d.x = -10;

      var tw = 0.55 + 0.45 * Math.sin(t * 0.001 * d.speed + d.phase);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + d.hue + ", 90%, 82%, " + (d.a * tw).toFixed(3) + ")";
      ctx.fill();
    }
  }

  function drawMeteor(m) {
    var tx = m.x - m.vx * m.tail;
    var ty = m.y - m.vy * m.tail;

    // Quầng sáng mờ phía sau cho nổi trên nền video
    ctx.save();
    ctx.strokeStyle = "hsla(" + m.hue + ", 100%, 80%, 0.2)";
    ctx.lineWidth = m.width * 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    var grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
    grad.addColorStop(0, "hsla(" + m.hue + ", 100%, 99%, 1)");
    grad.addColorStop(0.25, "hsla(" + m.hue + ", 100%, 86%, 0.9)");
    grad.addColorStop(0.6, "hsla(" + m.hue + ", 100%, 72%, 0.35)");
    grad.addColorStop(1, "hsla(" + m.hue + ", 100%, 62%, 0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = m.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Đầu sao băng sáng hơn
    ctx.save();
    ctx.shadowColor = "hsla(" + m.hue + ", 100%, 80%, 1)";
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.width * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = "hsla(" + m.hue + ", 100%, 99%, 1)";
    ctx.fill();
    ctx.restore();
  }

  var last = performance.now();
  function loop(t) {
    requestAnimationFrame(loop);
    if (document.hidden) return;

    var gap = t - last;
    // Vừa quay lại sau khi ẩn tab: bỏ đợt cũ, hẹn đợt mới
    if (gap > 500) {
      pending.length = 0;
      nextWaveAt = t + 800;
    }

    var dt = Math.min(50, gap || 16);
    last = t;

    ctx.clearRect(0, 0, W, H);

    drawDust(t);

    // Đợt sao băng: rơi lần lượt theo lịch đã hẹn
    while (pending.length && t >= pending[0]) {
      pending.shift();
      spawnMeteor();
    }
    if (t >= nextWaveAt) scheduleWave(t);

    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.x += (m.vx * dt) / 1000;
      m.y += (m.vy * dt) / 1000;

      if (m.x < -320 || m.y > H + 320) {
        meteors.splice(i, 1);
        continue;
      }

      drawMeteor(m);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  nextWaveAt = performance.now() + 600; // đợt đầu tới sớm
  requestAnimationFrame(loop);
})();
