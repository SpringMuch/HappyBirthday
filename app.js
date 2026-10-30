/**
 * Main Application Orchestrator for Đêm Sao Hoàng Kim • Tuổi 21
 * Features:
 * - Interactive Starry Night Sky (Twinkling Stars, Cross-flares, Shooting Stars)
 * - Poetic Interactive Stardust Trail on Mouse/Touch
 * - Royal 21st Birthday Intro Envelope Seal
 * - 5 Celestial Mini-Games & Fragment Collection
 * - Grand Finale with 24K Gold "21" Cake, Real Microphone Blow Detection,
 *   Voice Audio Wave Indicator & Interactive Wishing Stars
 */

class AppManager {
  constructor() {
    this.collectedFragments = new Set();
    this.games = {};
    this.activeScreen = 'screen-hub';
    this.ambientCanvas = null;
    this.ambientCtx = null;

    // Celestial Canvas Entities
    this.stars = [];
    this.shootingStars = [];
    this.particles = [];
    this.isCelebrationMode = false;

    // Microphone Blow Detection State
    this.micStream = null;
    this.micAnalyser = null;
    this.micListening = false;
    this.candlesLit = true;

    // Curated 21st Birthday Wishes for Him
    this.birthdayWishes = [
    '✦ Chào mừng cưng đến với tuổi 21 — một chương mới của thanh xuân! Chúc cưng luôn vững vàng trước sóng gió, tự tin theo đuổi ước mơ và trở thành phiên bản tuyệt vời nhất của chính mình. Happy Birthday!',
    '✦ Mong tuổi 21 của cưng sẽ rực rỡ như dải ngân hà, tự do như những vì sao và ngập tràn những điều tốt đẹp. Chúc chàng trai đặc biệt này luôn giữ được nhiệt huyết, lòng can đảm và nụ cười thật tươi trên hành trình phía trước!',
    '✦ Happy 21st Birthday! Chúc mọi ước mơ cưng ấp ủ đều có ngày đơm hoa kết trái, mọi nỗ lực đều được đền đáp xứng đáng và mỗi bước chân đều đưa cưng đến gần hơn với cuộc sống mà cưng hằng mong muốn.',
    '✦ Tuổi 21 là thời điểm tuyệt vời để bắt đầu những hành trình lớn lao. Mong cưng đủ bản lĩnh để vượt qua thử thách, đủ kiên trì để theo đuổi đam mê và đủ bình thản để tận hưởng những điều giản dị nhưng quý giá trong cuộc sống.',
    '✦ Chúc cưng tuổi mới có sức khỏe để đi xa, có may mắn để gặp những cơ hội tốt, có tài năng để tạo nên thành tựu và có những người chân thành luôn đồng hành trên mọi chặng đường. Mong cuộc đời sẽ dịu dàng với cưng theo cách đẹp nhất!',
    '✦ Rồi chúng ta sẽ đi qua thêm nhiều mùa sinh nhật, chứng kiến biết bao đổi thay và viết nên những câu chuyện mới. Mong rằng khi nhìn lại tuổi 21, cưng sẽ mỉm cười vì đã sống hết mình, yêu thương chân thành và có thật nhiều kỷ niệm đáng nhớ.',
    '✦ Nếu mỗi người đều là một vì sao, mong cưng sẽ luôn tỏa sáng theo cách riêng của mình — không cần rực rỡ hơn bất kỳ ai, chỉ cần không ngừng tiến về phía trước và sống một cuộc đời khiến chính mình tự hào. Chúc mừng sinh nhật tuổi 21!'
  ];
    this.wishIndex = 0;

    this.init();
  }

  init() {
    this.loadState();
    this.setupIntroOverlay();
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

  /* ================= INTRO ROYAL ENVELOPE ================= */
  setupIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    const btnOpen = document.getElementById('btn-open-envelope');
    if (!overlay || !btnOpen) return;

    btnOpen.onclick = (e) => {
      window.folkAudio.resume();
      window.folkAudio.playChime(523.25, 0.7);
      setTimeout(() => window.folkAudio.playChime(659.25, 0.7), 140);
      setTimeout(() => window.folkAudio.playChime(783.99, 0.9), 280);

      const rect = btnOpen.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.spawnFireworkBurst(cx, cy, 55);
      this.spawnShootingStar();

      overlay.classList.add('opening');
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 750);
    };
  }

  /* ================= NAVIGATION ================= */
  setupNavigation() {
    document.querySelectorAll('.play-trigger').forEach(btn => {
      btn.onclick = () => {
        const gameType = btn.getAttribute('data-target');
        window.folkAudio.playClack();
        this.navigateToGame(gameType);
      };
    });

    document.querySelectorAll('.btn-back-hub').forEach(btn => {
      btn.onclick = () => {
        window.folkAudio.playClack();
        this.pauseVoiceAudio();
        this.stopMicBlowDetection();
        this.showScreen('screen-hub');
      };
    });

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
      if (gameType === 'unblock' && this.games.unblock) {
        setTimeout(() => this.games.unblock.render(), 60);
      }
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
    this.games.puzzle = new JigsawPuzzleGame('puzzle-board', () => {
      this.onGameWin(1, 'Tinh Cầu I: Đế Pha Lê Hoàng Kim', 'Tuyệt tác 50 mảnh ghép kỷ niệm của chúng ta đã hoàn thiện rực rỡ dưới ánh sao!');
    });

    // 2. Tower of Hanoi (4 disks)
    this.games.hanoi = new HanoiGame(() => {
      this.onGameWin(2, 'Tinh Cầu II: Tầng Bánh Ngân Hà', '4 tầng đĩa ánh sáng thiên hà đã quy tụ, mang theo bản lĩnh và trí tuệ tuổi 21!');
    });

    // 3. Lights Out (3x3)
    this.games.lights = new LightsOutGame('lights-board', () => {
      this.onGameWin(3, 'Tinh Cầu III: Tầng Bánh Hoàng Gia', 'Chòm sao Bắc Đẩu 9 ngôi đã bừng sáng rực rỡ, dẫn lối vạn điều may mắn!');
    });

    // 4. Water Sort (6 tubes total)
    this.games.watersort = new WaterSortGame('watersort-tubes-area', () => {
      this.onGameWin(4, 'Tinh Cầu IV: Vương Miện Ánh Sao', '6 ống pha lê tinh vân đã hội tụ thuần khiết, kết tinh ngọt ngào cho tuổi mới!');
    });

    // 5. Unblock Royal Vault
    this.games.unblock = new UnblockWoodGame('unblock-board', () => {
      this.onGameWin(5, 'Tinh Cầu V: Nến Hoàng Kim Tuổi 21', 'Cổng Ánh Sao đã mở! Cặp nến số 21 mạ vàng đã sẵn sàng tỏa sáng!');
    });
  }

  onGameWin(fragmentNum, title, desc) {
    this.collectedFragments.add(fragmentNum);
    this.saveState();
    this.updateFragmentUI();

    this.spawnFireworkBurst(window.innerWidth / 2, window.innerHeight / 2, 55);
    this.spawnShootingStar();

    const modal = document.getElementById('modal-fragment-reward');
    const rewardTitle = document.getElementById('reward-title');
    const rewardDesc = document.getElementById('reward-desc');
    const rewardVisual = document.getElementById('reward-fragment-visual');

    if (rewardTitle) rewardTitle.textContent = title;
    if (rewardDesc) rewardDesc.textContent = desc;

    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];
    if (rewardVisual) rewardVisual.innerHTML = `<span>★ ${romanNumerals[fragmentNum]}</span>`;

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

    const gameKeys = ['', 'puzzle', 'hanoi', 'lights', 'watersort', 'unblock'];
    for (let i = 1; i <= 5; i++) {
      const badge = document.getElementById(`badge-${gameKeys[i]}`);
      if (badge) {
        if (this.collectedFragments.has(i)) {
          badge.textContent = '★ Đã Mở Khóa';
          badge.classList.add('done');
        } else {
          badge.textContent = 'Chưa mở';
          badge.classList.remove('done');
        }
      }
    }

    const btnGoCake = document.getElementById('btn-go-cake');
    if (btnGoCake) {
      if (count === 5) {
        btnGoCake.removeAttribute('disabled');
        btnGoCake.textContent = '🎂 KHAI MỞ BÁNH TUỔI 21!';
      } else {
        btnGoCake.setAttribute('disabled', 'true');
        btnGoCake.textContent = `🎂 Mở Bánh (${count}/5 Tinh Cầu)`;
      }
    }
  }

  /* ================= GRAND FINALE: CAKE, VOICE, MIC BLOW & WISHING STARS ================= */
  openGrandFinale() {
    this.showScreen('screen-grand-finale');
    this.isCelebrationMode = true;
    this.relightCandles();

    // Sequential cake layers reveal animation
    for (let i = 1; i <= 5; i++) {
      const layer = document.getElementById(`cake-part-${i}`);
      if (layer) {
        layer.style.opacity = '0';
        layer.style.transform = 'translateY(-24px) scale(0.92)';
        setTimeout(() => {
          layer.style.opacity = '1';
          layer.style.transform = 'translateY(0) scale(1)';
          window.folkAudio.playChime(380 + i * 90, 0.45);
        }, i * 340);
      }
    }

    // Play the user-uploaded voice audio!
    setTimeout(() => {
      this.playVoiceAudio();
    }, 1800);

    // Spawn initial floating wishing stars
    for (let k = 0; k < 5; k++) {
      setTimeout(() => this.spawnWishingStar(), k * 900);
    }

    // Continuous festive fireworks
    this.triggerGrandFireworks();
  }

  playVoiceAudio() {
    const voiceAudio = document.getElementById('birthday-voice-audio');
    const audioStatusText = document.getElementById('audio-status-text');
    const waveBars = document.getElementById('voice-wave-bars');
    if (!voiceAudio) return;

    voiceAudio.currentTime = 0;
    voiceAudio.volume = 1.0;

    const playPromise = voiceAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (audioStatusText) audioStatusText.textContent = 'Đang phát lời chúc sinh nhật tuổi 21...';
          waveBars?.classList.add('playing');
        })
        .catch(() => {
          if (audioStatusText) audioStatusText.textContent = 'Bấm "Nghe Lại Lời Chúc" bên dưới để phát âm thanh';
          waveBars?.classList.remove('playing');
        });
    }

    voiceAudio.onended = () => {
      if (audioStatusText) audioStatusText.textContent = 'Đã phát trọn vẹn lời chúc sinh nhật! ❤️';
      waveBars?.classList.remove('playing');
    };
  }

  pauseVoiceAudio() {
    const voiceAudio = document.getElementById('birthday-voice-audio');
    const waveBars = document.getElementById('voice-wave-bars');
    if (voiceAudio && !voiceAudio.paused) {
      voiceAudio.pause();
    }
    waveBars?.classList.remove('playing');
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
        if (this.candlesLit) {
          this.extinguishCandles();
        } else {
          this.relightCandles();
        }
      };
    }

    const btnMic = document.getElementById('btn-mic-blow');
    if (btnMic) {
      btnMic.onclick = () => {
        this.startMicBlowDetection();
      };
    }

    const btnLantern = document.getElementById('btn-spawn-lantern');
    if (btnLantern) {
      btnLantern.onclick = () => {
        window.folkAudio.playChime(660, 0.4);
        this.spawnWishingStar(true);
      };
    }
  }

  extinguishCandles() {
    if (!this.candlesLit) return;
    this.candlesLit = false;

    const f1 = document.getElementById('flame-group-1');
    const f2 = document.getElementById('flame-group-2');
    const smoke = document.getElementById('candle-smoke-group');
    const btnBlow = document.getElementById('btn-blow-candles');
    const toast = document.getElementById('wish-star-toast');

    if (f1) f1.classList.add('blown-out');
    if (f2) f2.classList.add('blown-out');
    if (smoke) smoke.classList.remove('hidden');

    if (btnBlow) {
      btnBlow.textContent = '🔥 Thắp Sáng Lại Nến 21';
    }
    if (toast) {
      toast.innerHTML = '🎉 <strong>CHÚC MỪNG SINH NHẬT 21 TUỔI!</strong> Điều ước tuổi 21 của cưng đã bay lên bầu trời sao! <strong>LOVE YOU, Babe!</strong>';
      toast.classList.add('highlight-wish');
    }

    window.folkAudio.playChime(523.25, 0.5);
    setTimeout(() => window.folkAudio.playChime(659.25, 0.5), 150);
    setTimeout(() => window.folkAudio.playChime(783.99, 0.6), 300);
    setTimeout(() => window.folkAudio.playChime(1046.5, 0.9), 450);

    // Grand celebratory fireworks & wishing stars
    this.spawnFireworkBurst(window.innerWidth / 2, window.innerHeight * 0.35, 75);
    this.spawnShootingStar();
    this.triggerGrandFireworks();
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.spawnWishingStar(), i * 350);
    }

    this.stopMicBlowDetection();
  }

  relightCandles() {
    this.candlesLit = true;
    const f1 = document.getElementById('flame-group-1');
    const f2 = document.getElementById('flame-group-2');
    const smoke = document.getElementById('candle-smoke-group');
    const btnBlow = document.getElementById('btn-blow-candles');

    if (f1) f1.classList.remove('blown-out');
    if (f2) f2.classList.remove('blown-out');
    if (smoke) smoke.classList.add('hidden');
    if (btnBlow) {
      btnBlow.textContent = '🎂 Thổi Nến Ước Nguyện Tuổi 21';
    }
  }

  async startMicBlowDetection() {
    const btnMic = document.getElementById('btn-mic-blow');
    const toast = document.getElementById('wish-star-toast');

    if (this.micListening) {
      this.stopMicBlowDetection();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (toast) toast.textContent = '⚠️ Trình duyệt không hỗ trợ Micro, hãy bấm nút "🎂 Thổi Nến Ước Nguyện Tuổi 21" nhé!';
      return;
    }

    try {
      this.relightCandles();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;
      this.micListening = true;

      if (btnMic) {
        btnMic.textContent = '🌬️ Đang Lắng Nghe... Hãy Thổi Vào Mic!';
        btnMic.classList.add('listening');
      }
      if (toast) {
        toast.textContent = '🌬️ Hãy thổi một hơi thật mạnh vào Micro điện thoại/máy tính để tắt nến số 21!';
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      this.micAnalyser = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let blowFrames = 0;

      const checkBlow = () => {
        if (!this.micListening || !this.candlesLit) return;
        analyser.getByteFrequencyData(dataArray);

        // Low-frequency wind/breath energy
        let sum = 0;
        for (let i = 0; i < 35; i++) {
          sum += dataArray[i];
        }
        const avg = sum / 35;

        if (avg > 58) {
          blowFrames++;
          if (blowFrames >= 5) {
            this.extinguishCandles();
            return;
          }
        } else {
          blowFrames = Math.max(0, blowFrames - 1);
        }

        requestAnimationFrame(checkBlow);
      };

      requestAnimationFrame(checkBlow);
    } catch (err) {
      if (toast) {
        toast.textContent = '✨ Bạn có thể bấm trực tiếp nút "🎂 Thổi Nến Ước Nguyện Tuổi 21" để thổi nến nhé!';
      }
    }
  }

  stopMicBlowDetection() {
    this.micListening = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    const btnMic = document.getElementById('btn-mic-blow');
    if (btnMic) {
      btnMic.textContent = '🎤 Thổi Nến Bằng Hơi Thở (Mic)';
      btnMic.classList.remove('listening');
    }
  }

  spawnWishingStar(showImmediateWish = false) {
    const container = document.getElementById('wishing-stars-container');
    const toast = document.getElementById('wish-star-toast');
    if (!container) return;

    const starEl = document.createElement('div');
    starEl.className = 'floating-wish-star';
    starEl.style.left = `${10 + Math.random() * 80}%`;
    starEl.style.animationDuration = `${8 + Math.random() * 5}s`;
    starEl.innerHTML = `
      <div class="wish-lantern-core">★</div>
      <span class="wish-lantern-label">Ước Nguyện</span>
    `;

    const showWish = (e) => {
      const msg = this.birthdayWishes[this.wishIndex % this.birthdayWishes.length];
      this.wishIndex++;
      if (toast) {
        toast.textContent = msg;
        toast.classList.add('highlight-wish');
      }
      window.folkAudio.playChime(700 + Math.random() * 250, 0.45);
      const x = e?.clientX || window.innerWidth / 2;
      const y = e?.clientY || window.innerHeight * 0.4;
      this.spawnFireworkBurst(x, y, 28);
      starEl.remove();
    };

    starEl.onclick = showWish;
    container.appendChild(starEl);

    if (showImmediateWish) {
      const msg = this.birthdayWishes[this.wishIndex % this.birthdayWishes.length];
      this.wishIndex++;
      if (toast) {
        toast.textContent = msg;
        toast.classList.add('highlight-wish');
      }
    }

    setTimeout(() => {
      starEl.remove();
    }, 13000);
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

  /* ================= CELESTIAL STARRY NIGHT CANVAS & FIREWORKS ================= */
  setupAmbientCanvas() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    if (!this.ambientCanvas) return;
    this.ambientCtx = this.ambientCanvas.getContext('2d');

    const initStars = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.ambientCanvas.width = w;
      this.ambientCanvas.height = h;

      const starColors = ['#ffffff', '#fff3b0', '#f5d77f', '#38bdf8', '#cbd5e1'];
      const starCount = Math.min(160, Math.floor((w * h) / 7500) + 70);
      this.stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.8 + 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.008,
        isCrossStar: Math.random() < 0.14
      }));
    };

    window.addEventListener('resize', initStars);
    initStars();

    // Interactive Stardust Trail on Pointer / Touch Move
    window.addEventListener('pointermove', (e) => {
      if (Math.random() > 0.45) return;
      const trailColors = ['#f5d77f', '#fff8d6', '#38bdf8', '#ffffff'];
      this.particles.push({
        x: e.clientX + (Math.random() - 0.5) * 10,
        y: e.clientY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9 - 0.3,
        radius: Math.random() * 2.2 + 0.8,
        color: trailColors[Math.floor(Math.random() * trailColors.length)],
        alpha: 0.9,
        decay: 0.022
      });
    });

    // Periodic Shooting Stars across the night sky
    setInterval(() => {
      if (Math.random() < 0.7) {
        this.spawnShootingStar();
      }
    }, 4500);

    // Gentle rising golden stardust motes
    setInterval(() => {
      if (this.particles.length < 40) {
        this.particles.push({
          x: Math.random() * this.ambientCanvas.width,
          y: this.ambientCanvas.height + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(Math.random() * 0.8 + 0.3),
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.35 ? '#f5d77f' : '#38bdf8',
          alpha: 0.65,
          decay: 0.0025
        });
      }
    }, 500);

    requestAnimationFrame(() => this.renderCelestialSky());
  }

  spawnShootingStar() {
    if (!this.ambientCanvas) return;
    const w = this.ambientCanvas.width;
    const h = this.ambientCanvas.height;

    this.shootingStars.push({
      x: Math.random() * (w * 0.75) + w * 0.1,
      y: Math.random() * (h * 0.35) + 20,
      vx: -(Math.random() * 6 + 7),
      vy: Math.random() * 3.5 + 3,
      len: Math.random() * 80 + 60,
      alpha: 1,
      decay: 0.018
    });
  }

  spawnFireworkBurst(x, y, count = 40) {
    const colors = ['#f5d77f', '#fff8d6', '#38bdf8', '#d4af37', '#a855f7', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
      const speed = Math.random() * 4.5 + 1.8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.8 + 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.014 + 0.009,
        gravity: 0.04
      });
    }
  }

  triggerGrandFireworks() {
    let count = 0;
    const interval = setInterval(() => {
      if (this.activeScreen !== 'screen-grand-finale' || count > 16) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
      const y = Math.random() * (window.innerHeight * 0.45) + window.innerHeight * 0.08;
      this.spawnFireworkBurst(x, y, 44);
      window.folkAudio.playChime(520 + Math.random() * 420, 0.3);
      count++;
    }, 850);
  }

  renderCelestialSky() {
    const ctx = this.ambientCtx;
    if (!ctx) return;
    const w = this.ambientCanvas.width;
    const h = this.ambientCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Render Twinkling Stars & 4-Point Starlight Flares
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.phase += s.speed;
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.phase));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();

      if (s.isCrossStar && alpha > 0.75) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.8;
        const flare = s.radius * 4.2;
        ctx.beginPath();
        ctx.moveTo(s.x - flare, s.y);
        ctx.lineTo(s.x + flare, s.y);
        ctx.moveTo(s.x, s.y - flare);
        ctx.lineTo(s.x, s.y + flare);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Render Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const st = this.shootingStars[i];
      st.x += st.vx;
      st.y += st.vy;
      st.alpha -= st.decay;

      if (st.alpha <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      const tailX = st.x - st.vx * (st.len / 10);
      const tailY = st.y - st.vy * (st.len / 10);
      const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 248, 214, ${st.alpha})`);
      grad.addColorStop(0.4, `rgba(229, 193, 88, ${st.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Render Stardust Trail & Firework Particles
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
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(() => this.renderCelestialSky());
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppManager();
});
