/**
 * Main Application Orchestrator for Ngũ Phúc Kỳ Duyên
 * Manages screen transitions, fragment collection, grand finale,
 * particle confetti/fireworks, and birthday voice audio.
 */

class AppManager {
  constructor() {
    this.collectedFragments = new Set();
    this.games = {};
    this.activeScreen = 'screen-hub';
    this.ambientCanvas = null;
    this.ambientCtx = null;
    this.particles = [];
    this.isCelebrationMode = false;

    this.init();
  }

  init() {
    this.loadState();
    this.setupNavigation();
    this.setupAmbientCanvas();
    this.setupAudioControls();
    this.setupFinaleControls();
    this.initMiniGames();
    this.updateFragmentUI();
  }

  loadState() {
    try {
      const savedFragments = localStorage.getItem('npkd_fragments');
      if (savedFragments) {
        JSON.parse(savedFragments).forEach(num => this.collectedFragments.add(num));
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('npkd_fragments', JSON.stringify(Array.from(this.collectedFragments)));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  setupNavigation() {
    // Hub cards trigger game screens
    document.querySelectorAll('.play-trigger').forEach(btn => {
      btn.onclick = () => {
        const gameType = btn.getAttribute('data-target');
        window.folkAudio.playClack();
        this.navigateToGame(gameType);
      };
    });

    // Back to hub buttons
    document.querySelectorAll('.btn-back-hub').forEach(btn => {
      btn.onclick = () => {
        window.folkAudio.playClack();
        this.pauseVoiceAudio();
        this.showScreen('screen-hub');
      };
    });

    // Go to cake finale button
    const btnGoCake = document.getElementById('btn-go-cake');
    if (btnGoCake) {
      btnGoCake.onclick = () => {
        window.folkAudio.playClack();
        this.openGrandFinale();
      };
    }
  }

  navigateToGame(gameType) {
    const screenMap = {
      puzzle: 'screen-game-puzzle',
      hanoi: 'screen-game-hanoi',
      lights: 'screen-game-lights',
      watersort: 'screen-game-watersort',
      unblock: 'screen-game-unblock'
    };

    const targetScreen = screenMap[gameType];
    if (targetScreen) {
      this.showScreen(targetScreen);
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.activeScreen = screenId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  initMiniGames() {
    // 1. Jigsaw 50 Tiles (User photo)
    this.games.puzzle = new JigsawPuzzleGame('puzzle-board', (pieceId) => {
      this.onGameWin(1, 'Mảnh I: Bệ Bánh Ngũ Thường', 'Ghép hoàn tất 50 khối ảnh kỷ niệm tuyệt đẹp!');
    });

    // 2. Tower of Hanoi (4 disks)
    this.games.hanoi = new HanoiGame((pieceId) => {
      this.onGameWin(2, 'Mảnh II: Thân Bánh Thọ Lộc', 'Tứ tầng tháp gốm chuyển dời thuận lợi, mang phúc khí tràn đầy!');
    });

    // 3. Lights Out (3x3)
    this.games.lights = new LightsOutGame('lights-board', (pieceId) => {
      this.onGameWin(3, 'Mảnh III: Tầng Bánh Phú Quý', 'Cửu đăng hoa nở sáng rực, tụ họp tinh hoa đất trời!');
    });

    // 4. Water Sort (6 colors, 8 units each)
    this.games.watersort = new WaterSortGame('watersort-tubes-area', (pieceId) => {
      this.onGameWin(4, 'Mảnh IV: Kem Gấm Cát Tường', 'Ngũ sắc lưu ly tinh thuần, quy về từng lớp gấm ngọt ngào!');
    });

    // 5. Unblock Wood (Klotski)
    this.games.unblock = new UnblockWoodGame('unblock-board', (pieceId) => {
      this.onGameWin(5, 'Mảnh V: Nến Thần Chúc Phúc', 'Khối mộc thoát hiểm thênh thang, thắp sáng ngọn nến mừng tuổi mới!');
    });
  }

  onGameWin(fragmentNum, title, desc) {
    this.collectedFragments.add(fragmentNum);
    this.saveState();
    this.updateFragmentUI();

    // Trigger celebration effects
    this.spawnFireworkBurst(window.innerWidth / 2, window.innerHeight / 2, 40);

    // Show Reward Modal
    const modal = document.getElementById('modal-fragment-reward');
    const rewardTitle = document.getElementById('reward-title');
    const rewardDesc = document.getElementById('reward-desc');
    const rewardVisual = document.getElementById('reward-fragment-visual');

    if (rewardTitle) rewardTitle.textContent = title;
    if (rewardDesc) rewardDesc.textContent = desc;

    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];
    if (rewardVisual) rewardVisual.textContent = `Mảnh ${romanNumerals[fragmentNum]}`;

    if (modal) modal.classList.remove('hidden');

    const btnContinue = document.getElementById('btn-continue-journey');
    if (btnContinue) {
      btnContinue.onclick = () => {
        if (modal) modal.classList.add('hidden');
        window.folkAudio.playClack();
        if (this.collectedFragments.size === 5) {
          this.openGrandFinale();
        } else {
          this.showScreen('screen-hub');
        }
      };
    }
  }

  updateFragmentUI() {
    const count = this.collectedFragments.size;
    const countEl = document.getElementById('collected-count');
    if (countEl) countEl.textContent = `${count}/5`;

    // Update slots
    for (let i = 1; i <= 5; i++) {
      const slot = document.querySelector(`.frag-slot[data-index="${i}"]`);
      if (slot) {
        if (this.collectedFragments.has(i)) {
          slot.classList.add('collected');
        } else {
          slot.classList.remove('collected');
        }
      }
    }

    // Update hub cards badges
    const gameKeys = ['', 'puzzle', 'hanoi', 'lights', 'watersort', 'unblock'];
    for (let i = 1; i <= 5; i++) {
      const badge = document.getElementById(`badge-${gameKeys[i]}`);
      if (badge) {
        if (this.collectedFragments.has(i)) {
          badge.textContent = '✔ Đã Thu Thập';
          badge.classList.add('done');
        } else {
          badge.textContent = 'Chưa xong';
          badge.classList.remove('done');
        }
      }
    }

    // Enable/disable Cake Finale Button
    const btnGoCake = document.getElementById('btn-go-cake');
    if (btnGoCake) {
      if (count === 5) {
        btnGoCake.removeAttribute('disabled');
        btnGoCake.textContent = '🎂 KHAI MỞ BÁNH SINH NHẬT!';
      } else {
        btnGoCake.setAttribute('disabled', 'true');
        btnGoCake.textContent = `🎂 Mở Bánh (${count}/5 Mảnh)`;
      }
    }
  }

  openGrandFinale() {
    this.showScreen('screen-grand-finale');
    this.isCelebrationMode = true;

    // Sequential cake layers reveal animation
    for (let i = 1; i <= 5; i++) {
      const layer = document.getElementById(`cake-part-${i}`);
      if (layer) {
        layer.style.opacity = '0';
        layer.style.transform = 'translateY(-20px) scale(0.9)';
        setTimeout(() => {
          layer.style.opacity = '1';
          layer.style.transform = 'translateY(0) scale(1)';
          window.folkAudio.playChime(350 + i * 80, 0.4);
        }, i * 350);
      }
    }

    // Play the user-uploaded voice audio!
    setTimeout(() => {
      this.playVoiceAudio();
    }, 1800);

    // Continuous festive fireworks
    this.triggerGrandFireworks();
  }

  playVoiceAudio() {
    const voiceAudio = document.getElementById('birthday-voice-audio');
    const audioStatusText = document.getElementById('audio-status-text');
    if (!voiceAudio) return;

    voiceAudio.currentTime = 0;
    voiceAudio.volume = 1.0;

    const playPromise = voiceAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (audioStatusText) audioStatusText.textContent = 'Đang phát lời chúc sinh nhật...';
        })
        .catch(err => {
          console.log('Autoplay waiting for gesture', err);
          if (audioStatusText) audioStatusText.textContent = 'Bấm nút bên dưới để nghe lời chúc sinh nhật';
        });
    }

    voiceAudio.onended = () => {
      if (audioStatusText) audioStatusText.textContent = 'Đã phát xong lời chúc sinh nhật!';
    };
  }

  pauseVoiceAudio() {
    const voiceAudio = document.getElementById('birthday-voice-audio');
    if (voiceAudio && !voiceAudio.paused) {
      voiceAudio.pause();
    }
  }

  setupFinaleControls() {
    const btnReplay = document.getElementById('btn-replay-voice');
    if (btnReplay) {
      btnReplay.onclick = () => {
        window.folkAudio.playClack();
        this.playVoiceAudio();
      };
    }

    const btnBlow = document.getElementById('btn-blow-candles');
    if (btnBlow) {
      btnBlow.onclick = () => {
        const flames = document.querySelectorAll('.flame, .flame-inner');
        flames.forEach(f => (f.style.display = 'none'));
        window.folkAudio.playChime(784, 0.6);
        btnBlow.textContent = '✨ Ước Nguyện Thành Hiện Thực!';
        btnBlow.setAttribute('disabled', 'true');

        // Spawn extra magical burst
        this.spawnFireworkBurst(window.innerWidth / 2, window.innerHeight * 0.4, 60);

        // Relight with golden magic after 3.5s
        setTimeout(() => {
          flames.forEach(f => (f.style.display = 'block'));
          btnBlow.textContent = '🎂 Thổi Nến Ước Nguyện';
          btnBlow.removeAttribute('disabled');
        }, 3500);
      };
    }
  }

  setupAudioControls() {
    const btnToggle = document.getElementById('btn-audio-toggle');
    if (btnToggle) {
      btnToggle.onclick = () => {
        const isMuted = window.folkAudio.toggleMute();
        btnToggle.textContent = isMuted ? '🔇' : '🔊';

        const voiceAudio = document.getElementById('birthday-voice-audio');
        if (voiceAudio) {
          voiceAudio.muted = isMuted;
        }
      };
    }
  }

  /* ================= AMBIENT CANVAS & FIREWORKS ================= */
  setupAmbientCanvas() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    if (!this.ambientCanvas) return;
    this.ambientCtx = this.ambientCanvas.getContext('2d');

    const resize = () => {
      this.ambientCanvas.width = window.innerWidth;
      this.ambientCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    requestAnimationFrame(() => this.renderParticles());

    setInterval(() => {
      if (!this.isCelebrationMode && this.particles.length < 25) {
        this.particles.push({
          x: Math.random() * this.ambientCanvas.width,
          y: this.ambientCanvas.height + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 1.2 + 0.5),
          radius: Math.random() * 2.5 + 1.5,
          color: Math.random() > 0.5 ? '#e8b042' : '#cf443b',
          alpha: 0.8,
          decay: 0.003
        });
      }
    }, 400);
  }

  spawnFireworkBurst(x, y, count = 35) {
    const colors = ['#e8b042', '#cf443b', '#2b583f', '#ffd152', '#fbf5e6', '#23495d'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008,
        gravity: 0.05
      });
    }
  }

  triggerGrandFireworks() {
    let count = 0;
    const interval = setInterval(() => {
      if (this.activeScreen !== 'screen-grand-finale' || count > 15) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
      const y = Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.1;
      this.spawnFireworkBurst(x, y, 40);
      window.folkAudio.playChime(500 + Math.random() * 400, 0.3);
      count++;
    }, 800);
  }

  renderParticles() {
    const ctx = this.ambientCtx;
    if (!ctx) return;
    const w = this.ambientCanvas.width;
    const h = this.ambientCanvas.height;

    ctx.clearRect(0, 0, w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(() => this.renderParticles());
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppManager();
});
