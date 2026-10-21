// ========================================================
// HIỆU ỨNG NỀN ĐỘNG: ĐƯỜNG HẦM TRÁI TIM NEON 3D (HEART TUNNEL)
// ========================================================

(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  // Số lượng vòng tim trong đường hầm
  const HEART_COUNT = 14;
  let tunnelOffset = 0;
  const tunnelSpeed = 0.006; // Tốc độ bay xuyên đường hầm

  // Mảng các hạt ánh sáng / vệt sao bay ra từ tâm
  const PARTICLE_COUNT = 90;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * 1000,
      len: Math.random() * 18 + 6,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.3 ? "rgba(255, 175, 204, " : "rgba(255, 255, 255, "
    });
  }

  // Hàm vẽ 1 hình trái tim toán học hoàn mỹ
  // x(t) = 16 sin^3(t)
  // y(t) = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
  function drawHeartPath(context, cx, cy, scale) {
    context.beginPath();
    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const px = cx + x * scale;
      const py = cy + y * scale;
      if (i === 0) {
        context.moveTo(px, py);
      } else {
        context.lineTo(px, py);
      }
    }
    context.closePath();
  }

  function render() {
    // Di chuyển tâm nhẹ theo chuột để tạo cảm giác 3D
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    const cx = width / 2 + (mouseX - width / 2) * 0.08;
    const cy = height / 2 + (mouseY - height / 2) * 0.08 - 15;

    // Nền tối huyền ảo
    ctx.fillStyle = "#0a060e";
    ctx.fillRect(0, 0, width, height);

    // Ánh sáng hồng tỏa ở trung tâm (Ambient glow)
    const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.7);
    radialGlow.addColorStop(0, "rgba(255, 75, 130, 0.18)");
    radialGlow.addColorStop(0.4, "rgba(180, 40, 90, 0.08)");
    radialGlow.addColorStop(1, "rgba(10, 6, 14, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // 1. VẼ CÁC VỆT ÁNH SÁNG BAY (WARP PARTICLES)
    // ==========================================
    ctx.save();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.z -= 7; // Di chuyển lại gần camera
      if (p.z <= 0) {
        p.z = 1000;
        p.x = (Math.random() - 0.5) * width;
        p.y = (Math.random() - 0.5) * height;
      }

      const k = 400 / p.z;
      const px = cx + p.x * k;
      const py = cy + p.y * k;

      if (px < 0 || px > width || py < 0 || py > height) continue;

      // Độ mờ tăng dần khi lại gần
      const alpha = Math.min(1, (1000 - p.z) / 600) * 0.75;
      const prevK = 400 / (p.z + p.len);
      const prevX = cx + p.x * prevK;
      const prevY = cy + p.y * prevK;

      ctx.strokeStyle = p.color + alpha + ")";
      ctx.lineWidth = Math.max(0.8, (1 - p.z / 1000) * p.size);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    ctx.restore();

    // ==========================================
    // 2. VẼ ĐƯỜNG HẦM TRÁI TIM NEON (HEART TUNNEL)
    // ==========================================
    tunnelOffset = (tunnelOffset + tunnelSpeed) % 1;

    for (let i = 0; i < HEART_COUNT; i++) {
      // Phân bổ khoảng cách theo hàm mũ để tạo chiều sâu 3D
      const fraction = (i + tunnelOffset) / HEART_COUNT;
      // Exponential scale
      const scale = Math.pow(fraction, 2.5) * (Math.max(width, height) * 0.075);

      if (scale < 1.5) continue;

      // Độ mờ: xuất hiện dần từ tâm, rõ rệt ở giữa và mờ dần khi sát mép
      let alpha = 1;
      if (fraction < 0.25) {
        alpha = fraction / 0.25;
      } else if (fraction > 0.8) {
        alpha = (1 - fraction) / 0.2;
      }

      alpha = Math.max(0, Math.min(1, alpha)) * 0.85;

      ctx.save();
      // Hiệu ứng phát sáng neon
      ctx.shadowColor = "#ff3377";
      ctx.shadowBlur = Math.min(25, scale * 0.4 + 6);

      // Màu sắc viền trái tim: hồng neon lung linh
      const r = 255;
      const g = Math.floor(130 + fraction * 70);
      const b = Math.floor(170 + fraction * 60);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

      // Độ dày nét viền trái tim
      ctx.lineWidth = Math.min(4.5, Math.max(1.2, fraction * 3.8));

      drawHeartPath(ctx, cx, cy, scale);
      ctx.stroke();

      // Vẽ thêm một viền mỏng trắng phụ bên trong để tạo điểm highlight viền sáng
      if (fraction > 0.3) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = Math.max(0.6, fraction * 1.5);
        ctx.stroke();
      }

      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
