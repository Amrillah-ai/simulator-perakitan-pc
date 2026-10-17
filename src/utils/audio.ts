/**
 * Procedural Web Audio Engine for PC Master Sim 3D
 * Zero external audio files (100% generated via AudioContext oscillators and noise buffers)
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private fanGain: GainNode | null = null;
  private fanOsc: OscillatorNode | null = null;
  private fanNoise: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted && this.fanGain) {
      this.fanGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playErrorBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.linearRampToValueAtTime(130, now + 0.14);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.linearRampToValueAtTime(160, now + 0.14);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  // Precision Target Miss error sound (when clicking outside pulsing marker)
  public playTargetMiss() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 0.18);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(200, now);
    osc2.frequency.linearRampToValueAtTime(110, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  // Mechanical Jam sound when CPU lever is forced with misaligned orientation
  public playMechanicalJam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // RAM Dual-Click: Click 1 (Top Latch Contact)
  public playRamClickFirst() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // RAM Dual-Click: Click 2 (Bottom Latch Full Lock - Deeper, firmer tone)
  public playRamClickSecond() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Crisp double notch lock
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1100, now + 0.025);
    osc2.frequency.exponentialRampToValueAtTime(280, now + 0.08);
    gain2.gain.setValueAtTime(0.45, now + 0.025);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.025);
    osc2.stop(now + 0.08);
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playSnap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // First click (initial latch contact)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.03);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.03);

    // Second click (firm mechanical lock 50ms later)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.09);
    gain2.gain.setValueAtTime(0.5, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.09);
  }

  public playLeverLatch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playScrewdriverRatchet() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Series of 4 quick metallic ticks
    for (let i = 0; i < 4; i++) {
      const tickTime = now + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400 + i * 200, tickTime);
      gain.gain.setValueAtTime(0.25, tickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(tickTime);
      osc.stop(tickTime + 0.025);
    }
  }

  public playPasteSquish() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low frequency squish noise
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playPowerClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPostBeep(type: 'success' | 'cpu' | 'ram' | 'vga') {
    if (this.isMuted) return;
    this.initCtx();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'success') {
      // Classic 1 short AMI BIOS beep (880Hz, 150ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.3, now + 0.1);
      gain.gain.setValueAtTime(0.3, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.1);
      osc.stop(now + 0.27);
    } else if (type === 'cpu') {
      // 1 long continuous low pitch beep (CPU error)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.35, now + 0.1);
      gain.gain.setValueAtTime(0.35, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.1);
      osc.stop(now + 0.85);
    } else if (type === 'ram') {
      // 3 long beeps (Memory parity / missing RAM)
      for (let i = 0; i < 3; i++) {
        const start = now + 0.1 + i * 0.4;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(660, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.setValueAtTime(0.35, start + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.27);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.27);
      }
    } else if (type === 'vga') {
      // 1 long, 2 short beeps (Video error)
      const times = [
        { t: 0.1, d: 0.35, f: 750 },
        { t: 0.55, d: 0.12, f: 750 },
        { t: 0.75, d: 0.12, f: 750 },
      ];
      times.forEach((item) => {
        const start = now + item.t;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(item.f, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.setValueAtTime(0.35, start + item.d - 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + item.d);
      });
    }
  }

  public startFanHum() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.fanGain) return; // already humming

    const now = this.ctx.currentTime;
    this.fanGain = this.ctx.createGain();
    this.fanGain.gain.setValueAtTime(0.001, now);
    this.fanGain.gain.linearRampToValueAtTime(0.06, now + 1.2); // smooth fan ramp up

    // Low pitch motor hum
    this.fanOsc = this.ctx.createOscillator();
    this.fanOsc.type = 'sine';
    this.fanOsc.frequency.setValueAtTime(90, now);
    this.fanOsc.frequency.linearRampToValueAtTime(140, now + 1.2);

    // Filtered airflow noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.fanNoise = this.ctx.createBufferSource();
    this.fanNoise.buffer = noiseBuffer;
    this.fanNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(350, now);

    if (this.fanGain && this.ctx && this.fanOsc && this.fanNoise) {
      this.fanOsc.connect(this.fanGain);
      this.fanNoise.connect(noiseFilter);
      noiseFilter.connect(this.fanGain);

      this.fanGain.connect(this.ctx.destination);

      this.fanOsc.start(now);
      this.fanNoise.start(now);
    }
  }

  public stopFanHum() {
    if (!this.ctx || !this.fanGain) return;
    const now = this.ctx.currentTime;
    this.fanGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
    setTimeout(() => {
      try {
        this.fanOsc?.stop();
        this.fanNoise?.stop();
        this.fanOsc?.disconnect();
        this.fanNoise?.disconnect();
        this.fanGain?.disconnect();
      } catch {
        // ignore already stopped
      }
      this.fanOsc = null;
      this.fanNoise = null;
      this.fanGain = null;
    }, 650);
  }
}

export const sound = new SoundEngine();
