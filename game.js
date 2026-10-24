/* ========================================================
   GAME.JS — MINI-GAME "CHÓ ĐÀO XƯƠNG"
   Tự tạo nút, khung game và CSS khi chạy.
   Không sửa file nào khác ngoài việc được gắn vào index.html.
   ======================================================== */

(function () {
  "use strict";

  if (document.getElementById("bone-game")) return; // tránh gắn 2 lần

  /* ---------- CSS ---------- */
  var CSS = [
    "#bone-game[hidden]{display:none!important}",
    "body.game-open{overflow:hidden}",

    "#game-btn{position:fixed;top:24px;left:80px;z-index:100}",
    "#game-btn i{color:#ffd166;filter:drop-shadow(0 0 6px rgba(255,209,102,.6))}",

    ".bone-game{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(6,3,10,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}",
    ".bone-panel{width:min(460px,94vw);max-height:94vh;overflow:auto;display:flex;flex-direction:column;gap:12px;padding:20px;border-radius:24px;border:1px solid rgba(255,51,119,.38);background:linear-gradient(160deg,rgba(32,17,47,.97),rgba(10,5,17,.99));box-shadow:0 30px 80px rgba(0,0,0,.72),0 0 60px rgba(255,51,119,.16),inset 0 1px 0 rgba(255,255,255,.06);animation:boneIn .35s cubic-bezier(.16,1,.3,1)}",
    "@keyframes boneIn{from{opacity:0;transform:scale(.94) translateY(14px)}to{opacity:1;transform:none}}",

    ".bone-head{display:flex;align-items:center;gap:12px}",
    ".bone-head img{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(92,225,230,.55);box-shadow:0 0 16px rgba(92,225,230,.35);background:#1a0e26}",
    ".bone-titles{flex:1;min-width:0}",
    ".bone-name{margin:0 0 3px;font-size:1.08rem;letter-spacing:.3px;color:#fff;font-family:'Quicksand',sans-serif;font-weight:800}",
    ".bone-sub{margin:0;font-size:.74rem;color:#b9aecb}",
    ".bone-close{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font-size:.9rem;cursor:pointer;transition:all .25s ease;flex-shrink:0}",
    ".bone-close:hover{background:rgba(255,82,82,.25);border-color:rgba(255,82,82,.6)}",

    ".bone-hud{display:flex;justify-content:space-between;gap:8px;font-size:.74rem;color:#cfc4dd}",
    ".bone-hud b{display:block;margin-top:2px;font-size:1.05rem;color:#ffd166}",
    ".bone-hud .digs b{color:#5ce1e6}",

    ".bone-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}",
    ".bone-cell{position:relative;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:1.3rem;line-height:1;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));color:#fff;cursor:pointer;transition:transform .15s ease,background .2s ease,border-color .2s ease;-webkit-tap-highlight-color:transparent}",
    ".bone-cell:hover:not(.done){transform:translateY(-2px);border-color:rgba(255,51,119,.5)}",
    ".bone-cell:active:not(.done){transform:scale(.95)}",
    ".bone-cell:focus-visible{outline:2px solid #5ce1e6;outline-offset:2px}",
    ".bone-cell::after{content:'🐾';opacity:.16;font-size:1rem}",
    ".bone-cell.done{cursor:default}",
    ".bone-cell.done::after{content:none}",
    ".bone-cell.hint{background:rgba(92,225,230,.07);border-color:rgba(92,225,230,.22)}",
    ".bone-cell.d1{background:rgba(255,51,119,.18);border-color:rgba(255,51,119,.55)}",
    ".bone-cell.d2{background:rgba(255,138,92,.14);border-color:rgba(255,138,92,.45)}",
    ".bone-cell.d3{background:rgba(255,209,102,.1);border-color:rgba(255,209,102,.35)}",
    ".bone-cell.d4{background:rgba(92,225,230,.06);border-color:rgba(92,225,230,.2)}",
    ".bone-cell.bone{background:radial-gradient(circle,rgba(255,209,102,.45),rgba(255,51,119,.2));border-color:#ffd166;box-shadow:0 0 22px rgba(255,209,102,.55);animation:bonePop .45s cubic-bezier(.16,1,.3,1)}",
    ".bone-cell.shake{animation:boneShake .28s ease}",
    ".bone-cell .bone-spark{position:absolute;left:50%;top:50%;font-size:.95rem;pointer-events:none;animation:boneFly .75s ease-out forwards}",
    "@keyframes bonePop{0%{transform:scale(.7)}60%{transform:scale(1.12)}100%{transform:scale(1)}}",
    "@keyframes boneShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}",
    "@keyframes boneFly{from{transform:translate(-50%,-50%) scale(1);opacity:1}to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.5);opacity:0}}",

    ".bone-message{min-height:22px;margin:0;font-size:.82rem;font-weight:600;color:#ffd9e5;text-align:center;transition:color .2s ease}",
    ".bone-message.bad{color:#ff8f8f}",
    ".bone-message.good{color:#ffd166}",

    ".bone-footer{display:flex;align-items:center;justify-content:space-between;gap:12px}",
    ".bone-note{font-size:.68rem;color:rgba(255,255,255,.35);line-height:1.4}",
    ".bone-restart{padding:9px 20px;border:none;border-radius:999px;background:linear-gradient(135deg,#ff3377,#ff8a5c);color:#fff;font-weight:800;font-size:.82rem;letter-spacing:.4px;cursor:pointer;box-shadow:0 8px 22px rgba(255,51,119,.35);transition:transform .15s ease,box-shadow .2s ease;white-space:nowrap}",
    ".bone-restart:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(255,51,119,.5)}",
    ".bone-restart:active{transform:scale(.97)}",

    "@media (max-width:420px){.bone-panel{padding:16px;border-radius:20px}.bone-grid{gap:6px}.bone-cell{font-size:1.1rem;border-radius:12px}}",
    "@media (prefers-reduced-motion:reduce){.bone-cell.bone,.bone-cell.shake,.bone-cell .bone-spark,.bone-panel{animation:none}}",
  ].join("\n");

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---------- NÚT MỞ GAME ---------- */
  var openBtn = document.createElement("button");
  openBtn.id = "game-btn";
  openBtn.className = "icon-btn-round";
  openBtn.type = "button";
  openBtn.title = "Chơi mini-game đào xương";
  openBtn.setAttribute("aria-label", "Chơi mini-game đào xương");
  openBtn.innerHTML = '<i class="fas fa-bone"></i>';
  document.body.appendChild(openBtn);

  /* ---------- KHUNG GAME ---------- */
  var overlay = document.createElement("div");
  overlay.id = "bone-game";
  overlay.className = "bone-game";
  overlay.hidden = true;
  overlay.innerHTML = [
    '<div class="bone-panel" role="dialog" aria-modal="true" aria-label="Mini-game chó đào xương">',
    '  <div class="bone-head">',
    '    <img src="assets/dog_avatar.png" alt="Chú chó" />',
    '    <div class="bone-titles">',
    '      <p class="bone-name">Chó đào xương</p>',
    '      <p class="bone-sub">Đào trúng trong ít lượt nhất</p>',
    "    </div>",
    '    <button class="bone-close" type="button" title="Đóng (Esc)" aria-label="Đóng">✕</button>',
    "  </div>",
    '  <div class="bone-hud">',
    '    <span>Điểm <b class="bone-score">0</b></span>',
    '    <span>Kỷ lục <b class="bone-best">0</b></span>',
    '    <span class="digs">Lượt còn <b class="bone-digs">6</b></span>',
    "  </div>",
    '  <div class="bone-grid" role="grid" aria-label="Lưới đào xương"></div>',
    '  <p class="bone-message">Chó đã giấu xương. Bạn có 6 lần đào.</p>',
    '  <div class="bone-footer">',
    '    <span class="bone-note">Đào sai, chó sẽ nói nóng / lạnh.<br />Hết lượt là thua cả ván.</span>',
    '    <button class="bone-restart" type="button">Chơi lại</button>',
    "  </div>",
    "</div>",
  ].join("\n");
  document.body.appendChild(overlay);

  /* ---------- LUẬT CHƠI ---------- */
  var SIZE = 5;
  var CELLS = SIZE * SIZE;
  var BEST_KEY = "chungkenkct_dig_best";

  var el = {
    grid: overlay.querySelector(".bone-grid"),
    score: overlay.querySelector(".bone-score"),
    best: overlay.querySelector(".bone-best"),
    digs: overlay.querySelector(".bone-digs"),
    message: overlay.querySelector(".bone-message"),
    restart: overlay.querySelector(".bone-restart"),
    close: overlay.querySelector(".bone-close"),
  };

  var buttons = [];
  var state = null;

  var HINTS = [
    { max: 1, icon: "🔥", text: "Rất nóng! Sát ngay đây" },
    { max: 2, icon: "♨️", text: "Nóng — gần lắm rồi" },
    { max: 3, icon: "🌤️", text: "Ấm — còn hơi xa" },
    { max: 99, icon: "❄️", text: "Lạnh — xa tít" },
  ];

  function readBest() {
    try {
      return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
    } catch (err) {
      return 0;
    }
  }

  function saveBest(value) {
    try {
      localStorage.setItem(BEST_KEY, String(value));
    } catch (err) {
      /* trình duyệt có thể chặn */
    }
  }

  function buildGrid() {
    el.grid.innerHTML = "";
    buttons = [];
    for (var i = 0; i < CELLS; i++) {
      (function (index) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "bone-cell";
        b.setAttribute("aria-label", "Ô " + (index + 1));
        b.addEventListener("click", function () {
          dig(index);
        });
        el.grid.appendChild(b);
        buttons.push(b);
      })(i);
    }
  }

  function setMessage(text, tone) {
    el.message.textContent = text;
    el.message.className = "bone-message" + (tone ? " " + tone : "");
  }

  function updateHud() {
    el.score.textContent = String(state.score);
    el.digs.textContent = String(state.digsLeft);
    el.best.textContent = String(Math.max(readBest(), state.score));
  }

  function digDistance(a, b) {
    return Math.abs(Math.floor(a / SIZE) - Math.floor(b / SIZE)) + Math.abs((a % SIZE) - (b % SIZE));
  }

  function hintFor(distance) {
    for (var i = 0; i < HINTS.length; i++) {
      if (distance <= HINTS[i].max) return HINTS[i];
    }
    return HINTS[HINTS.length - 1];
  }

  function paintCell(index) {
    var cell = state.cells[index];
    var b = buttons[index];
    b.className = "bone-cell";
    b.innerHTML = "";
    if (!cell) return;

    b.classList.add("done");
    if (cell.kind === "bone") {
      b.classList.add("bone");
      b.textContent = "🦴";
      b.setAttribute("aria-label", "Xương ở đây!");
    } else {
      b.classList.add("hint", "d" + cell.d);
      b.textContent = cell.icon;
      b.setAttribute("aria-label", cell.text);
    }
  }

  function newRound() {
    state.digsLeft = Math.max(3, 6 - Math.floor((state.round - 1) / 3));
    state.bone = Math.floor(Math.random() * CELLS);
    state.cells = new Array(CELLS).fill(null);
    state.locked = false;

    for (var i = 0; i < CELLS; i++) {
      buttons[i].className = "bone-cell";
      buttons[i].innerHTML = "";
    }

    setMessage("Chó đã giấu xương. Bạn có " + state.digsLeft + " lần đào.", "");
    updateHud();
  }

  function newGame() {
    state = { score: 0, round: 1, over: false, locked: false };
    newRound();
  }

  function burst(index) {
    var b = buttons[index];
    var icons = ["✨", "🦴", "💖", "⭐"];
    for (var i = 0; i < 8; i++) {
      var s = document.createElement("span");
      s.className = "bone-spark";
      s.textContent = icons[i % icons.length];
      var angle = (Math.PI * 2 * i) / 8;
      s.style.setProperty("--dx", Math.cos(angle) * (28 + Math.random() * 18) + "px");
      s.style.setProperty("--dy", Math.sin(angle) * (28 + Math.random() * 18) + "px");
      b.appendChild(s);
      (function (node) {
        setTimeout(function () {
          node.remove();
        }, 800);
      })(s);
    }
  }

  function onFound(index) {
    state.locked = true;
    state.cells[index] = { kind: "bone" };
    paintCell(index);
    burst(index);

    var gained = 100 + state.digsLeft * 25;
    state.score += gained;
    updateHud();

    setMessage("Tìm thấy rồi! +" + gained + " điểm 🦴", "good");

    setTimeout(function () {
      state.round += 1;
      newRound();
    }, 1200);
  }

  function gameOver() {
    state.over = true;
    state.cells[state.bone] = { kind: "bone" };
    paintCell(state.bone);

    if (state.score > readBest()) saveBest(state.score);
    updateHud();

    setMessage("Hết lượt! Xương nằm ở ô được đánh dấu. Điểm: " + state.score, "bad");
  }

  function dig(index) {
    if (!state || state.over || state.locked) return;
    if (state.cells[index]) return;

    if (index === state.bone) {
      onFound(index);
      return;
    }

    var d = digDistance(index, state.bone);
    var hint = hintFor(d);

    state.cells[index] = { kind: "hint", d: d, icon: hint.icon, text: hint.text };
    state.digsLeft -= 1;
    paintCell(index);
    updateHud();

    buttons[index].classList.add("shake");
    setTimeout(function () {
      buttons[index].classList.remove("shake");
    }, 300);

    if (state.digsLeft <= 0) {
      gameOver();
      return;
    }

    setMessage(hint.icon + " " + hint.text + " — còn " + state.digsLeft + " lượt", "");
  }

  /* ---------- MỞ / ĐÓNG ---------- */
  function open() {
    overlay.hidden = false;
    document.body.classList.add("game-open");
    el.best.textContent = String(readBest());
    newGame();
    el.close.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove("game-open");
  }

  openBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    open();
  });
  el.close.addEventListener("click", close);
  el.restart.addEventListener("click", newGame);

  // Không để cú click trong game chạy hiệu ứng dấu chân của trang
  ["click", "pointerdown", "mousedown"].forEach(function (type) {
    overlay.addEventListener(type, function (e) {
      e.stopPropagation();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
    if ((e.key === "g" || e.key === "G") && overlay.hidden) {
      var enter = document.getElementById("enter-overlay");
      if (!enter || enter.classList.contains("fade-out")) open();
    }
  });

  buildGrid();
})();
