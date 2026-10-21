// Motor de audio procedural y síntesis de voz (Web Audio API + SpeechSynthesis)
// No requiere archivos externos pesados: funciona 100% en el navegador de inmediato.

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Grito eufórico de GOL con narrador en español y ovación del estadio
  playGoalCelebration() {
    this.init();

    // 1. Narrador de fútbol enérgico ("¡¡¡GOOOOOOL!!!")
    if (this.speechAvailable && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel(); // Detener audios anteriores
        const phrases = [
          '¡¡GOOOOOOOOOOOOL!! ¡Qué golazo!',
          '¡¡GOOOOOOOL!! ¡Adentro!',
          '¡¡GOOOOOOOOOOOOLAZO!! ¡Tremendo gol!',
          '¡¡GOOOOOOOL!! ¡Infló las redes!'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'es-ES';
        utterance.rate = 1.15;
        utterance.pitch = 1.35;
        utterance.volume = 1.0;

        // Intentar usar voz en español si está disponible
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es'));
        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }

    // 2. Ruido del estadio / Ovación eufórica de la hinchada con sintetizador
    if (this.ctx) {
      try {
        const now = this.ctx.currentTime;
        const dur = 2.5;

        // Generador de ruido blanco filtrado (emula la explosión de la tribuna)
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filtro pasa banda para darle acústica de estadio
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + dur);
        filter.Q.setValueAtTime(1.2, now);

        // Ganancia con envolvente de explosión
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + dur);

        // Claxon / Corneta festiva de estadio
        const hornOsc = this.ctx.createOscillator();
        const hornGain = this.ctx.createGain();
        hornOsc.type = 'sawtooth';
        hornOsc.frequency.setValueAtTime(320, now);
        hornOsc.frequency.linearRampToValueAtTime(360, now + 0.6);
        hornGain.gain.setValueAtTime(0.18, now);
        hornGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        hornOsc.connect(hornGain);
        hornGain.connect(this.ctx.destination);
        hornOsc.start(now);
        hornOsc.stop(now + 0.8);
      } catch (e) {
        console.warn('AudioContext synth error:', e);
      }
    }
  }

  // Sonido de zapatazo / disparo fuerte al balón
  playKick() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // Pitazo del árbitro (¡Piiiiip!)
  playWhistle() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.linearRampToValueAtTime(2800, now + 0.08);
      osc.frequency.linearRampToValueAtTime(2500, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const sound = new SoundFX();
