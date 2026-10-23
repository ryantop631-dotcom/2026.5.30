/**
 * Web Audio API Robotic Sound Synthesizer
 * Generates custom 8-bit retro robotic fanfare and sound effects without external audio files.
 */

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a cheerful retro robotic victory fanfare (5-note power-up arpeggio + vibrato chime)
   */
  public playRobotFanfare(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Master compressor & limiter to keep volume safe and punchy
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, now);
      compressor.knee.setValueAtTime(40, now);
      compressor.ratio.setValueAtTime(12, now);
      compressor.attack.setValueAtTime(0, now);
      compressor.release.setValueAtTime(0.25, now);
      compressor.connect(ctx.destination);

      // Sequence of notes for the 5-press easter egg celebration:
      // C5 (523.25), E5 (659.25), G5 (783.99), B5 (987.77), C6 (1046.50), E6 (1318.51)
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.12, type: 'square' as OscillatorType },
        { freq: 659.25, time: 0.11, dur: 0.12, type: 'square' as OscillatorType },
        { freq: 783.99, time: 0.22, dur: 0.12, type: 'square' as OscillatorType },
        { freq: 987.77, time: 0.33, dur: 0.14, type: 'triangle' as OscillatorType },
        { freq: 1046.50, time: 0.46, dur: 0.35, type: 'sine' as OscillatorType },
        { freq: 1318.51, time: 0.58, dur: 0.55, type: 'triangle' as OscillatorType }
      ];

      notes.forEach(({ freq, time, dur, type }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + time);

        // Robotic pitch bend / modulation for final notes
        if (freq >= 1046) {
          osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + time + dur * 0.5);
          osc.frequency.exponentialRampToValueAtTime(freq, now + time + dur);
        }

        // Envelope: fast punch attack, smooth exponential decay
        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.linearRampToValueAtTime(0.25, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(compressor);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });

      // Ambient robo-laser blip overlay
      const blipOsc = ctx.createOscillator();
      const blipGain = ctx.createGain();
      blipOsc.type = 'sawtooth';
      blipOsc.frequency.setValueAtTime(2200, now + 0.45);
      blipOsc.frequency.exponentialRampToValueAtTime(440, now + 0.85);

      blipGain.gain.setValueAtTime(0.12, now + 0.45);
      blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      blipOsc.connect(blipGain);
      blipGain.connect(compressor);

      blipOsc.start(now + 0.45);
      blipOsc.stop(now + 0.86);

    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  /**
   * Plays a short single interactive tick sound for key presses
   */
  public playKeyTick(step: number): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch rises with each step from 1 to 4
      const baseFreq = 440 + step * 120;
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  /**
   * Plays a cheerful success chime for successful login or saves
   */
  public playSuccess(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // ignore
    }
  }

  /**
   * Plays a gentle buzzing sound for invalid credentials or input errors
   */
  public playError(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(160, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // ignore
    }
  }

  /**
   * Plays a quick descending sound when exiting or deleting
   */
  public playTrash(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // ignore
    }
  }

  /**
   * Plays a subtle, tactile click sound for buttons and toggles
   */
  public playClick(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  // -------------------------------------------------------------
  // BACKGROUND MUSIC (BGM) SYNTHESIZER
  // Recreates the energetic upbeat dance pop melody and bass groove from the provided track
  // Key: C Major / A Minor, 126 BPM, 4/4 time
  // -------------------------------------------------------------
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private bgmGainNode: GainNode | null = null;
  private bgmVolume: number = 0.5; // default 50%

  public isBackgroundMusicPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmGainNode) {
      try {
        const ctx = this.getAudioContext();
        // Master volume factor: max 0.25
        this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.25, ctx.currentTime);
      } catch {
        // ignore
      }
    }
  }

  public toggleBackgroundMusic(): boolean {
    if (this.isBgmPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  public startBackgroundMusic(): void {
    if (this.isBgmPlaying) return;
    try {
      const ctx = this.getAudioContext();
      this.isBgmPlaying = true;
      this.bgmStep = 0;

      // Master BGM gain control
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.25, ctx.currentTime);
      this.bgmGainNode.connect(ctx.destination);

      // 126 BPM => 1 beat = 60/126 = 0.476s. 16th note step = 0.476/4 ≈ 0.119s
      const stepDuration = (60 / 126) / 4;

      // 64-step loop (4 bars of catchy upbeat electro dance pop)
      // Melody Lead Notes (Frequencies in Hz):
      // G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5
      const melodyPattern: (number | null)[] = [
        // Bar 1 (C Major hook)
        783.99, null, 880.00, null, 1046.50, null, 880.00, 783.99,
        null, 659.25, null, 783.99, 659.25, null, 587.33, null,
        // Bar 2 (Am / G transition)
        659.25, null, 783.99, null, 880.00, 1046.50, null, 880.00,
        783.99, null, 659.25, 587.33, 523.25, null, 659.25, null,
        // Bar 3 (F Major bounce)
        523.25, null, 587.33, 659.25, null, 783.99, null, 880.00,
        null, 1046.50, 880.00, null, 783.99, null, 659.25, null,
        // Bar 4 (G Major turnaround)
        587.33, null, 659.25, null, 783.99, 880.00, 1046.50, null,
        1174.66, null, 1046.50, null, 880.00, null, 783.99, null
      ];

      // Harmony / Arpeggio Chords
      const harmonyPattern: (number | null)[] = [
        // Bar 1 (C maj chord notes: E5, G5)
        523.25, 659.25, 523.25, 783.99, 523.25, 659.25, 523.25, 783.99,
        523.25, 659.25, 523.25, 783.99, 523.25, 659.25, 523.25, 783.99,
        // Bar 2 (Am chord notes: E5, A5)
        440.00, 659.25, 440.00, 880.00, 440.00, 659.25, 440.00, 880.00,
        440.00, 659.25, 440.00, 880.00, 440.00, 659.25, 440.00, 880.00,
        // Bar 3 (F maj chord notes: F4, A4, C5)
        349.23, 440.00, 523.25, 440.00, 349.23, 440.00, 523.25, 440.00,
        349.23, 440.00, 523.25, 440.00, 349.23, 440.00, 523.25, 440.00,
        // Bar 4 (G maj chord notes: G4, B4, D5)
        392.00, 493.88, 587.33, 493.88, 392.00, 493.88, 587.33, 493.88,
        392.00, 493.88, 587.33, 493.88, 392.00, 493.88, 587.33, 493.88
      ];

      // Bassline (Funky dance electro bass)
      const bassPattern: (number | null)[] = [
        // Bar 1 (C2)
        130.81, null, 130.81, null, 130.81, null, 130.81, 146.83,
        130.81, null, 130.81, null, 130.81, null, 146.83, null,
        // Bar 2 (A1)
        110.00, null, 110.00, null, 110.00, null, 110.00, 123.47,
        110.00, null, 110.00, null, 110.00, null, 123.47, null,
        // Bar 3 (F1)
        87.31, null, 87.31, null, 87.31, null, 87.31, 98.00,
        87.31, null, 87.31, null, 87.31, null, 98.00, null,
        // Bar 4 (G1)
        98.00, null, 98.00, null, 98.00, null, 98.00, 110.00,
        98.00, null, 98.00, null, 98.00, null, 123.47, null
      ];

      const playStep = () => {
        if (!this.isBgmPlaying) return;
        const now = ctx.currentTime;
        const currentStep = this.bgmStep % 64;

        // 1. Synth Melody Lead
        const noteFreq = melodyPattern[currentStep];
        if (noteFreq && this.bgmGainNode) {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const noteGain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(noteFreq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2400, now);
          filter.frequency.exponentialRampToValueAtTime(800, now + stepDuration * 1.5);

          noteGain.gain.setValueAtTime(0.24, now);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.6);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGainNode);

          osc.start(now);
          osc.stop(now + stepDuration * 1.8);
        }

        // 2. Chords / Arpeggio layer
        const harmFreq = harmonyPattern[currentStep];
        if (harmFreq && this.bgmGainNode && currentStep % 2 === 0) {
          const oscHarm = ctx.createOscillator();
          const harmGain = ctx.createGain();

          oscHarm.type = 'sine';
          oscHarm.frequency.setValueAtTime(harmFreq, now);

          harmGain.gain.setValueAtTime(0.08, now);
          harmGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.2);

          oscHarm.connect(harmGain);
          harmGain.connect(this.bgmGainNode);

          oscHarm.start(now);
          oscHarm.stop(now + stepDuration * 1.3);
        }

        // 3. Synth Bass
        const bassFreq = bassPattern[currentStep];
        if (bassFreq && this.bgmGainNode) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();

          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          bassGain.gain.setValueAtTime(0.38, now);
          bassGain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration * 1.4);

          bassOsc.connect(bassGain);
          bassGain.connect(this.bgmGainNode);

          bassOsc.start(now);
          bassOsc.stop(now + stepDuration * 1.5);
        }

        // 4. Drums & Percussion
        // Kick on every beat (steps 0, 4, 8, 12, 16, 20, 24, 28, 32...)
        if (currentStep % 4 === 0 && this.bgmGainNode) {
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();

          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(145, now);
          kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.12);

          kickGain.gain.setValueAtTime(0.42, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          kickOsc.connect(kickGain);
          kickGain.connect(this.bgmGainNode);

          kickOsc.start(now);
          kickOsc.stop(now + 0.14);
        }

        // Snare / Clap on beats 2 and 4 (steps 4, 12, 20, 28, 36...)
        if (currentStep % 8 === 4 && this.bgmGainNode) {
          const snareOsc = ctx.createOscillator();
          const snareGain = ctx.createGain();

          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(230, now);

          snareGain.gain.setValueAtTime(0.2, now);
          snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          snareOsc.connect(snareGain);
          snareGain.connect(this.bgmGainNode);

          snareOsc.start(now);
          snareOsc.stop(now + 0.1);
        }

        // Crisp Hi-Hat on off-beats (steps 2, 6, 10, 14, 18, 22, 26, 30...)
        if (currentStep % 4 === 2 && this.bgmGainNode) {
          const hatOsc = ctx.createOscillator();
          const hatGain = ctx.createGain();

          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(7500, now);

          hatGain.gain.setValueAtTime(0.045, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          hatOsc.connect(hatGain);
          hatGain.connect(this.bgmGainNode);

          hatOsc.start(now);
          hatOsc.stop(now + 0.045);
        }

        this.bgmStep++;
      };

      // Interval ticker for 16th notes
      this.bgmTimer = window.setInterval(playStep, stepDuration * 1000);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  public stopBackgroundMusic(): void {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGainNode) {
      try {
        const ctx = this.getAudioContext();
        this.bgmGainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      } catch {
        // ignore
      }
      this.bgmGainNode = null;
    }
  }
}

export const soundEngine = new SoundEngine();
