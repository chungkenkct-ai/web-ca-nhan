// ========================================================
// TRÌNH PHÁT NHẠC (MUSIC PLAYER) - PHONG CÁCH GUNS.LOL
// ========================================================

class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.isPlaying = false;
    this.isMuted = false;
    this.isLoop = true;

    // Elements
    this.playBtn = document.getElementById("player-play-btn");
    this.playIcon = document.getElementById("player-play-icon");
    this.prevBtn = document.getElementById("player-prev-btn");
    this.nextBtn = document.getElementById("player-next-btn");
    this.loopBtn = document.getElementById("player-loop-btn");
    this.muteTopBtn = document.getElementById("top-mute-btn");
    this.muteTopIcon = document.getElementById("top-mute-icon");

    this.progressBar = document.getElementById("player-progress");
    this.progressContainer = document.getElementById("player-progress-container");
    this.currentTimeEl = document.getElementById("player-current-time");
    this.durationEl = document.getElementById("player-duration");

    this.volumeSlider = document.getElementById("player-volume");
    this.volumeIcon = document.getElementById("player-volume-icon");

    this.titleEl = document.getElementById("player-title");
    this.artistEl = document.getElementById("player-artist");
    this.coverEl = document.getElementById("player-cover");
    this.discWrapper = document.getElementById("player-disc-wrapper");

    this.visualizerBars = document.querySelectorAll(".eq-bar");

    this.init();
  }

  init() {
    const musicConfig = window.PROFILE_CONFIG?.music || {
      title: "Lofi Chill Study Beat",
      artist: "TiTiw's Playlist",
      src: "assets/music.mp3",
      cover: "assets/avatar.png"
    };

    this.audio.src = musicConfig.src;
    this.audio.loop = this.isLoop;

    if (this.titleEl) this.titleEl.textContent = musicConfig.title;
    if (this.artistEl) this.artistEl.textContent = musicConfig.artist;
    if (this.coverEl) this.coverEl.src = musicConfig.cover;

    this.bindEvents();
    this.setupVisualizer();
  }

  bindEvents() {
    // Play / Pause
    if (this.playBtn) {
      this.playBtn.addEventListener("click", () => this.togglePlay());
    }

    // Top mute quick button
    if (this.muteTopBtn) {
      this.muteTopBtn.addEventListener("click", () => this.toggleMute());
    }

    // Loop
    if (this.loopBtn) {
      this.loopBtn.addEventListener("click", () => {
        this.isLoop = !this.isLoop;
        this.audio.loop = this.isLoop;
        this.loopBtn.classList.toggle("active", this.isLoop);
      });
    }

    // Next / Prev (replay)
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        this.audio.currentTime = 0;
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        this.audio.currentTime = 0;
      });
    }

    // Time update
    this.audio.addEventListener("timeupdate", () => this.updateProgress());
    this.audio.addEventListener("loadedmetadata", () => {
      if (this.durationEl && isFinite(this.audio.duration)) {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
      }
    });
    this.audio.addEventListener("durationchange", () => {
      if (this.durationEl && isFinite(this.audio.duration)) {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
      }
    });

    // Seek on progress bar click
    if (this.progressContainer) {
      this.progressContainer.addEventListener("click", (e) => {
        const rect = this.progressContainer.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (this.audio.duration && isFinite(this.audio.duration)) {
          this.audio.currentTime = clickRatio * this.audio.duration;
        }
      });
    }

    // Volume control
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        this.audio.volume = val;
        this.isMuted = val === 0;
        this.updateVolumeUI();
      });
    }

    if (this.volumeIcon) {
      this.volumeIcon.addEventListener("click", () => this.toggleMute());
    }

    // Ended
    this.audio.addEventListener("ended", () => {
      if (!this.isLoop) {
        this.pause();
      }
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayStateUI(true);
    }).catch(err => {
      console.warn("Autoplay was prevented:", err);
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayStateUI(false);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.updateVolumeUI();
  }

  updatePlayStateUI(isPlaying) {
    if (this.playIcon) {
      this.playIcon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
    }
    if (this.discWrapper) {
      this.discWrapper.classList.toggle("spinning", isPlaying);
    }
    document.body.classList.toggle("audio-playing", isPlaying);
  }

  updateVolumeUI() {
    const isMuted = this.isMuted || this.audio.volume === 0;

    if (this.muteTopIcon) {
      this.muteTopIcon.className = isMuted ? "fas fa-volume-mute" : "fas fa-volume-up";
    }
    if (this.volumeIcon) {
      this.volumeIcon.className = isMuted ? "fas fa-volume-mute" : (this.audio.volume < 0.5 ? "fas fa-volume-down" : "fas fa-volume-up");
    }
    if (this.muteTopBtn) {
      this.muteTopBtn.classList.toggle("muted", isMuted);
    }
    if (this.volumeSlider && isMuted) {
      this.volumeSlider.value = 0;
    } else if (this.volumeSlider && !isMuted && this.audio.volume === 0) {
      this.audio.volume = 0.7;
      this.volumeSlider.value = 0.7;
    }
  }

  updateProgress() {
    const duration = this.audio.duration;
    const current = this.audio.currentTime;

    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(current);
    }

    if (duration && isFinite(duration)) {
      const percent = Math.min(100, Math.max(0, (current / duration) * 100));
      if (this.progressBar) {
        this.progressBar.style.width = `${percent}%`;
      }
      if (this.durationEl) {
        this.durationEl.textContent = this.formatTime(duration);
      }
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  setupVisualizer() {
    // Sóng âm giả lập nhảy mượt mà khi phát nhạc
    const animateVisualizer = () => {
      if (this.isPlaying && !this.isMuted) {
        this.visualizerBars.forEach((bar) => {
          const h = Math.floor(Math.random() * 20) + 4;
          bar.style.height = `${h}px`;
        });
      } else {
        this.visualizerBars.forEach((bar) => {
          bar.style.height = `3px`;
        });
      }
      setTimeout(animateVisualizer, 100);
    };
    animateVisualizer();
  }
}

window.MusicPlayer = MusicPlayer;
