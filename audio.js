/**
 * Audio Engine using Web Audio API
 * Generates traditional folk sounds (gong, bamboo click, chime) 
 * and plays Happy Birthday song with acoustic folk timbre!
 */

class FolkAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingSong = false;
    this.songTimeoutIds = [];
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlayingSong) {
      this.stopHappyBirthday();
    }
    return this.isMuted;
  }

  // Traditional bamboo clack / gõ phách
  playClack() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Bell chime / tiếng chuông đồng dân gian
  playChime(freq = 523.25, duration = 0.8) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, t); // harmonic shimmer

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Victory gong / tiếng chiêng mừng công
  playGong() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [180, 275, 410, 560];
    
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, t);

      const amp = 0.25 / (i + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.5);
    });
  }

  // Water pouring sound for game 4
  playWaterPour() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Happy Birthday Folk Synthesis
  playHappyBirthday() {
    this.stopHappyBirthday();
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    this.isPlayingSong = true;

    // F4, G4, A4, Bb4, C5, D5, E5, F5
    const notes = {
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.00,
      A4: 440.00,
      Bb4: 466.16,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      F5: 698.46,
      G5: 783.99
    };

    // Note name, beat length (1 beat ~ 420ms)
    const melody = [
      { note: 'C4', beats: 0.75 },
      { note: 'C4', beats: 0.25 },
      { note: 'D4', beats: 1.0 },
      { note: 'C4', beats: 1.0 },
      { note: 'F4', beats: 1.0 },
      { note: 'E4', beats: 2.0 },

      { note: 'C4', beats: 0.75 },
      { note: 'C4', beats: 0.25 },
      { note: 'D4', beats: 1.0 },
      { note: 'C4', beats: 1.0 },
      { note: 'G4', beats: 1.0 },
      { note: 'F4', beats: 2.0 },

      { note: 'C4', beats: 0.75 },
      { note: 'C4', beats: 0.25 },
      { note: 'C5', beats: 1.0 },
      { note: 'A4', beats: 1.0 },
      { note: 'F4', beats: 1.0 },
      { note: 'E4', beats: 1.0 },
      { note: 'D4', beats: 1.5 },

      { note: 'Bb4', beats: 0.75 },
      { note: 'Bb4', beats: 0.25 },
      { note: 'A4', beats: 1.0 },
      { note: 'F4', beats: 1.0 },
      { note: 'G4', beats: 1.0 },
      { note: 'F4', beats: 2.5 }
    ];

    const beatDurationMs = 450;
    let accumulatedTimeMs = 0;

    melody.forEach((item, index) => {
      const tid = setTimeout(() => {
        if (!this.isPlayingSong || this.isMuted) return;
        this.playMelodyNote(notes[item.note], (item.beats * beatDurationMs) / 1000);
      }, accumulatedTimeMs);

      this.songTimeoutIds.push(tid);
      accumulatedTimeMs += item.beats * beatDurationMs;
    });

    // End marker
    const finalTid = setTimeout(() => {
      this.isPlayingSong = false;
      this.playGong();
    }, accumulatedTimeMs + 500);
    this.songTimeoutIds.push(finalTid);
  }

  playMelodyNote(frequency, duration) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Traditional chime-like marimba/guzheng acoustic pluck
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, t);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(frequency * 2, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.95);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + duration);
    subOsc.stop(t + duration);
  }

  stopHappyBirthday() {
    this.isPlayingSong = false;
    this.songTimeoutIds.forEach(id => clearTimeout(id));
    this.songTimeoutIds = [];
  }
}

// Global audio singleton
window.folkAudio = new FolkAudioEngine();
