class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private intervalId: number | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 440, type: OscillatorType = 'sine', duration = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  startBGM() {
    if (this.isMuted) return;
    this.init();
    this.stopBGM();

    if (!this.ctx) return;

    // A simple, pulsing 8-bit style bassline loop using setInterval
    const notes = [130.81, 130.81, 155.56, 130.81, 196.00, 174.61];
    let step = 0;

    this.intervalId = window.setInterval(() => {
      this.playBeep(notes[step], 'square', 0.15);
      step = (step + 1) % notes.length;
    }, 250);
  }

  stopBGM() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
