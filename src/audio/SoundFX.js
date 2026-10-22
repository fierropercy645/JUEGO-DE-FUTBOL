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

  // Grito eufórico de GOL con narrador en español latino y ovación vibrante del estadio
  playGoalCelebration() {
    this.init();

    // 1. Narrador de fútbol enérgico ("¡¡¡GOOOOOOL!!!") con voz humana y entonación apasionada
    if (this.speechAvailable && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel(); // Detener cualquier audio previo
        const phrases = [
          '¡¡GOOOOOOOOOOOOOOOOOOL!! ¡Goooooool, qué golazo impresionante!',
          '¡¡GOOOOOOOOOOOOOL!! ¡Gol, gol, gol, adentrooooo!',
          '¡¡GOOOOOOOOOOOOOOOOOOL!! ¡Qué definición magistral, golazo tremendo!',
          '¡¡GOOOOOOOOOOOOL!! ¡Golazo descomunal, explota el estadio!'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'es-419'; // Español latinoamericano apasionado o 'es-ES'
        utterance.rate = 1.05; // Velocidad natural con fuerza
        utterance.pitch = 1.15; // Tono vibrante sin sonar robótico ni agudo
        utterance.volume = 1.0;

        // Buscar la voz en español de mejor calidad instalada en el dispositivo
        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => (v.lang.startsWith('es') || v.lang.includes('Spanish')) && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Sabina') || v.name.includes('Jorge') || v.name.includes('Raul')))
          || voices.find(v => v.lang.startsWith('es'));
        
        if (bestVoice) {
          utterance.voice = bestVoice;
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
        const dur = 3.2;

        // Generador de ruido blanco filtrado (emula la explosión monumental de la tribuna)
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filtro pasa banda para darle acústica de caldera de estadio
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(450, now + dur);

        // Ganancia con envolvente de explosión
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.65, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + dur);

        // Claxon / Corneta festiva de estadio (Doble toque festivo de gol)
        [0, 0.45].forEach(delay => {
          const hornOsc = this.ctx.createOscillator();
          const hornGain = this.ctx.createGain();
          hornOsc.type = 'sawtooth';
          hornOsc.frequency.setValueAtTime(340, now + delay);
          hornOsc.frequency.linearRampToValueAtTime(380, now + delay + 0.35);
          hornGain.gain.setValueAtTime(0.22, now + delay);
          hornGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);

          hornOsc.connect(hornGain);
          hornGain.connect(this.ctx.destination);
          hornOsc.start(now + delay);
          hornOsc.stop(now + delay + 0.4);
        });
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
