/**
 * Realistic Web Audio API Sound Synthesizer for Champions League Tournament & Stadium Atmosphere
 * Generates authentic whistles, crowd cheers, fanfare, timer heartbeats, and Admin AI alerts.
 */

class TournamentAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studynaija_stadium_audio_muted');
      this.isMuted = saved === 'true';
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('studynaija_stadium_audio_muted', muted ? 'true' : 'false');
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Referee Whistle (Two sharp high-pitch bursts)
   */
  public playWhistle() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Burst 1
      this.createWhistleTone(ctx, now, 0.18, 1850);
      // Burst 2 (longer)
      this.createWhistleTone(ctx, now + 0.22, 0.35, 1920);
    } catch {}
  }

  private createWhistleTone(ctx: AudioContext, startTime: number, duration: number, freq: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.linearRampToValueAtTime(freq + 150, startTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(freq, startTime + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, startTime);
    filter.Q.setValueAtTime(3, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Stadium Crowd Roar & Cheering
   */
  public playCrowdCheer(duration = 2.5) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink noise synthesis for realistic crowd roar
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.6);
      filter.frequency.exponentialRampToValueAtTime(600, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + duration);
    } catch {}
  }

  /**
   * Correct Answer Chime
   */
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch {}
  }

  /**
   * Wrong / Missed Buzzer
   */
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  /**
   * Tension Countdown Clock Ticker (last 10 seconds of a match)
   */
  public playTimerTick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Champions Fanfare for Grande Finale & GOAT Coronation
   */
  public playChampionsFanfare() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Majestic Brass Cadence: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      const durations = [0.18, 0.18, 0.18, 0.24, 0.24, 0.3, 0.8];

      let timeOffset = 0;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + timeOffset);

        const dur = durations[idx];
        gain.gain.setValueAtTime(0.18, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + dur);

        timeOffset += dur * 0.85;
      });

      // Overlay crowd roar at crescendo
      setTimeout(() => {
        this.playCrowdCheer(3.0);
      }, 700);
    } catch {}
  }

  /**
   * The Undisputed GOAT Fanfare & Horn
   */
  public playGoatHorn() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Horn blast
      [220, 277.18, 329.63].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq + 10, now + 0.5);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
      setTimeout(() => {
        this.playCrowdCheer(2.0);
      }, 200);
    } catch {}
  }

  /**
   * Admin AI Privilege Revocation Sweep (Ominous Cyber Alert)
   */
  public playAdminAiRevocationSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.7);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);

      // Followed by double warning ping
      setTimeout(() => {
        [440, 220].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
          g.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.15);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + idx * 0.15);
          o.stop(ctx.currentTime + idx * 0.15 + 0.15);
        });
      }, 500);
    } catch {}
  }

  /**
   * Official UEFA Champions League Anthem Synthesizer
   * Plays the iconic orchestral chords, choir harmonies, string arpeggios,
   * timpani roll, and grand "THE CHAAAMPIONS!" crescendo.
   * Returns a cleanup function to immediately stop all audio when dismissed.
   */
  public playChampionsLeagueAnthem(options?: {
    onPhaseChange?: (phase: 'starball' | 'stadium' | 'crescendo' | 'finished') => void;
  }): () => void {
    if (this.isMuted) return () => {};
    const ctx = this.getAudioContext();
    if (!ctx) return () => {};

    const activeNodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [];
    const activeTimeouts: any[] = [];
    let isStopped = false;

    // Master gain node for graceful fade-out on stop
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    const stopAll = () => {
      if (isStopped) return;
      isStopped = true;
      activeTimeouts.forEach(t => clearTimeout(t));
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        setTimeout(() => {
          activeNodes.forEach(node => {
            try {
              if ('stop' in node && typeof (node as any).stop === 'function') {
                (node as any).stop();
              }
              node.disconnect();
            } catch {}
          });
        }, 150);
      } catch {}
    };

    try {
      const now = ctx.currentTime;

      // 1. Strings Shimmer Arpeggio (Zadok The Priest ascending rapid figures)
      const arpeggioNotes = [
        293.66, 369.99, 440.00, 587.33, 739.99, 880.00, // D4, F#4, A4, D5, F#5, A5
        739.99, 587.33, 440.00, 369.99
      ];
      
      const arpeggioInterval = 0.11; // rapid violin bow
      const totalArpeggios = 40; // 4.4 seconds of ascending strings

      for (let i = 0; i < totalArpeggios; i++) {
        const noteFreq = arpeggioNotes[i % arpeggioNotes.length];
        const noteTime = now + i * arpeggioInterval;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq, noteTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.06, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + arpeggioInterval * 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + arpeggioInterval);
        activeNodes.push(osc, gain, filter);
      }

      // Helper to synthesize rich choral vocal chord
      const playChoirChord = (frequencies: number[], startTime: number, duration: number, volume = 0.14) => {
        frequencies.forEach(freq => {
          // Dual detuned oscillators for choral ensemble thickness
          [-3, 3].forEach(detuneCents => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const formant1 = ctx.createBiquadFilter();
            const formant2 = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);
            osc.detune.setValueAtTime(detuneCents, startTime);

            // Vocal tract formant simulation ("Ah" / "Oh" singing vowel)
            formant1.type = 'bandpass';
            formant1.frequency.setValueAtTime(750, startTime);
            formant1.Q.setValueAtTime(3.2, startTime);

            formant2.type = 'bandpass';
            formant2.frequency.setValueAtTime(1250, startTime);
            formant2.Q.setValueAtTime(2.8, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 0.12);
            gain.gain.setValueAtTime(volume * 0.9, startTime + duration - 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(formant1);
            formant1.connect(formant2);
            formant2.connect(gain);
            gain.connect(masterGain);

            osc.start(startTime);
            osc.stop(startTime + duration);
            activeNodes.push(osc, gain, formant1, formant2);
          });
        });
      };

      // 2. Choral Chord 1 (0.6s - 2.3s): "Ce sont les meilleurs" (A Major / D Major)
      playChoirChord([220.00, 293.66, 369.99, 440.00, 587.33], now + 0.6, 1.8, 0.15);

      // 3. Choral Chord 2 (2.4s - 4.4s): "Sie sind die Besten" (G Major)
      playChoirChord([196.00, 293.66, 392.00, 493.88, 587.33], now + 2.4, 2.0, 0.16);

      // 4. Choral Chord 3 (4.6s - 7.3s): "Les grandes équipes" (E minor -> A Major cadence)
      playChoirChord([164.81, 246.94, 329.63, 392.00, 493.88], now + 4.6, 1.4, 0.15);
      playChoirChord([220.00, 277.18, 329.63, 440.00, 554.37], now + 6.0, 1.4, 0.18);

      // 5. Timpani Drum Roll leading into Climax (7.0s - 8.2s)
      const timpaniHits = 14;
      for (let i = 0; i < timpaniHits; i++) {
        const hitTime = now + 6.8 + (i * 0.08);
        const hitVol = 0.03 + (i / timpaniHits) * 0.24;

        const timpOsc = ctx.createOscillator();
        const timpGain = ctx.createGain();
        timpOsc.type = 'sine';
        timpOsc.frequency.setValueAtTime(65 - (i * 0.8), hitTime);
        timpOsc.frequency.exponentialRampToValueAtTime(45, hitTime + 0.12);

        timpGain.gain.setValueAtTime(hitVol, hitTime);
        timpGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.14);

        timpOsc.connect(timpGain);
        timpGain.connect(masterGain);
        timpOsc.start(hitTime);
        timpOsc.stop(hitTime + 0.15);
        activeNodes.push(timpOsc, timpGain);
      }

      // 6. GRAND CRESCENDO: "THE CHAAAAMPIONS!" (8.1s - 12.0s)
      const climaxTime = now + 8.1;
      const climaxDuration = 3.6;

      // Crash Cymbal at climax hit
      const bufferSize = Math.floor(ctx.sampleRate * 2.5);
      const cymbalBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const cymbalData = cymbalBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        cymbalData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.6));
      }
      const cymbalSource = ctx.createBufferSource();
      cymbalSource.buffer = cymbalBuffer;
      const cymbalFilter = ctx.createBiquadFilter();
      cymbalFilter.type = 'highpass';
      cymbalFilter.frequency.setValueAtTime(4200, climaxTime);
      const cymbalGain = ctx.createGain();
      cymbalGain.gain.setValueAtTime(0.28, climaxTime);
      cymbalGain.gain.exponentialRampToValueAtTime(0.001, climaxTime + 2.4);

      cymbalSource.connect(cymbalFilter);
      cymbalFilter.connect(cymbalGain);
      cymbalGain.connect(masterGain);
      cymbalSource.start(climaxTime);
      activeNodes.push(cymbalSource, cymbalFilter, cymbalGain);

      // Deep Bass & Timpani Cannon hit
      const cannonOsc = ctx.createOscillator();
      const cannonGain = ctx.createGain();
      cannonOsc.type = 'triangle';
      cannonOsc.frequency.setValueAtTime(75, climaxTime);
      cannonOsc.frequency.exponentialRampToValueAtTime(32, climaxTime + 0.6);
      cannonGain.gain.setValueAtTime(0.35, climaxTime);
      cannonGain.gain.exponentialRampToValueAtTime(0.001, climaxTime + 0.9);
      cannonOsc.connect(cannonGain);
      cannonGain.connect(masterGain);
      cannonOsc.start(climaxTime);
      cannonOsc.stop(climaxTime + 0.9);
      activeNodes.push(cannonOsc, cannonGain);

      // Grand Climax Choir & Brass Chords: D Major Fortissimo (D4, F#4, A4, D5, F#5, A5, D6!)
      const grandNotes = [
        146.83, 220.00, 293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66
      ];
      grandNotes.forEach(freq => {
        [-5, 0, 5].forEach(detune => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = freq > 600 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, climaxTime);
          osc.detune.setValueAtTime(detune, climaxTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3800, climaxTime);

          // Sforzando attack, sustained choir vibrato, slow noble release
          gain.gain.setValueAtTime(0.001, climaxTime);
          gain.gain.linearRampToValueAtTime(0.24, climaxTime + 0.15);
          gain.gain.setValueAtTime(0.22, climaxTime + climaxDuration - 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, climaxTime + climaxDuration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(climaxTime);
          osc.stop(climaxTime + climaxDuration);
          activeNodes.push(osc, gain, filter);
        });
      });

      // Cheering 60,000 fan crowd swell at climax
      activeTimeouts.push(setTimeout(() => {
        if (!isStopped) this.playCrowdCheer(4.0);
      }, 8100));

      // Spoken operatic vocal lyrics in French/German/English
      const speakLyrics = (text: string, lang: string, delayMs: number, pitch = 1.0, rate = 0.9) => {
        activeTimeouts.push(setTimeout(() => {
          if (isStopped) return;
          try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && !this.isMuted) {
              const utter = new SpeechSynthesisUtterance(text);
              utter.lang = lang;
              utter.pitch = pitch;
              utter.rate = rate;
              utter.volume = 0.85;
              window.speechSynthesis.speak(utter);
            }
          } catch {}
        }, delayMs));
      };

      speakLyrics("Ce sont les meilleurs", "fr-FR", 600, 1.1, 0.95);
      speakLyrics("Sie sind die Besten", "de-DE", 2400, 1.1, 0.95);
      speakLyrics("Les grandes équipes", "fr-FR", 4600, 1.05, 0.9);
      speakLyrics("The Champions!", "en-GB", 8050, 1.25, 0.85);

      // Phase triggers for visual animations
      if (options?.onPhaseChange) {
        options.onPhaseChange('starball');
        activeTimeouts.push(setTimeout(() => {
          if (!isStopped && options.onPhaseChange) options.onPhaseChange('stadium');
        }, 4500));
        activeTimeouts.push(setTimeout(() => {
          if (!isStopped && options.onPhaseChange) options.onPhaseChange('crescendo');
        }, 8100));
        activeTimeouts.push(setTimeout(() => {
          if (!isStopped && options.onPhaseChange) options.onPhaseChange('finished');
        }, 12000));
      }

    } catch (err) {
      console.warn('Champions League Anthem synthesis error:', err);
    }

    return stopAll;
  }
}

export const tournamentAudio = new TournamentAudioEngine();
