export class MainMenu {
  constructor(app) {
    this.app = app;
  }

  render() {
    const hasLeague = this.app.hasSavedLeague();

    return `
      <div class="screen main-cover-screen">
        <!-- Canvas gigante de estadio y golazo de fondo / portada inmersiva -->
        <canvas id="coverCanvas" width="960" height="580" class="cover-hero-canvas"></canvas>

        <!-- Capa de oscurecimiento suave para legibilidad de botones -->
        <div class="cover-hero-overlay"></div>

        <div class="cover-content">
          <!-- Insignia de torneo superior -->
          <div class="cover-badge">
            <span class="badge-icon">⚽</span>
            <span class="badge-text">FOOTBALL LEGENDS 2026 • ARCADE PRO</span>
            <span class="badge-icon">⭐</span>
          </div>

          <!-- Título Portada 3D Impactante -->
          <div class="cover-title-container">
            <h1 class="cover-title-main">
              FOOTBALL
              <span class="cover-title-glow">LEGENDS</span>
            </h1>
            <div class="cover-subtitle">
              ¡EL GOLAZO DEFINITIVO! • CAÑONAZOS, CHILENAS Y ATAJADAS EN VIVO
            </div>
          </div>

          <!-- Puntos destacados de portada -->
          <div class="cover-features">
            <div class="feat-pill">⚡ FÍSICA CON COMBA</div>
            <div class="feat-pill">🧤 ATAJADAS DE ARQUERO</div>
            <div class="feat-pill">🔥 TIROS CON POTENCIA</div>
            <div class="feat-pill">🏆 MODO LIGA COMPLETO</div>
          </div>

          <!-- Menú de Acciones Principal -->
          <div class="cover-menu-actions">
            <button id="btnQuickMatch" class="btn btn-primary btn-cover-start">
              <span style="font-size: 1.3rem;">⚽</span> ¡JUGAR PARTIDO RÁPIDO!
            </button>
            
            ${hasLeague ? `
              <button id="btnContinueLeague" class="btn btn-cover-league">
                🏆 CONTINUAR LIGA DE CAMPEONES
              </button>
            ` : ''}

            <div class="cover-secondary-grid">
              <button id="btnNewLeague" class="btn">
                🏆 ${hasLeague ? 'Nueva Liga' : 'Modo Liga'}
              </button>
              <button id="btnTeams" class="btn">
                🛡️ Plantillas
              </button>
              <button id="btnStats" class="btn">
                📊 Récords
              </button>
              <button id="btnSettings" class="btn">
                ⚙️ Opciones
              </button>
            </div>
          </div>

          <!-- Pie de página -->
          <div class="cover-footer">
            <span>Disfruta el simulador en HTML5 Canvas con físicas y sonido en tiempo real</span>
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnQuickMatch = container.querySelector('#btnQuickMatch');
    const btnContinueLeague = container.querySelector('#btnContinueLeague');
    const btnNewLeague = container.querySelector('#btnNewLeague');
    const btnTeams = container.querySelector('#btnTeams');
    const btnStats = container.querySelector('#btnStats');
    const btnSettings = container.querySelector('#btnSettings');

    btnQuickMatch?.addEventListener('click', () => {
      this.app.navigate('team-select', { mode: 'quick' });
    });

    btnContinueLeague?.addEventListener('click', () => {
      this.app.navigate('league');
    });

    btnNewLeague?.addEventListener('click', () => {
      if (this.app.hasSavedLeague()) {
        if (confirm('¿Deseas iniciar una nueva temporada? Se reiniciará la liga actual.')) {
          this.app.navigate('team-select', { mode: 'league-new' });
        }
      } else {
        this.app.navigate('team-select', { mode: 'league-new' });
      }
    });

    btnTeams?.addEventListener('click', () => {
      this.app.navigate('teams-catalog');
    });

    btnStats?.addEventListener('click', () => {
      this.app.navigate('stats');
    });

    btnSettings?.addEventListener('click', () => {
      this.app.navigate('settings');
    });

    // Iniciar Animación de Golazo en el Canvas de Portada
    this.startCoverAnimation(container);
  }

  startCoverAnimation(container) {
    const canvas = container.querySelector('#coverCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    let animId = null;

    // Cuatro jugadas maestras que van rotando en bucle:
    // 0: Golazo acrobático de Chilena al ángulo
    // 1: Dribble quiebre 1v1 y Cañonazo fusilando la red
    // 2: Vaselina / Sombrerito picado por arriba del arquero
    // 3: ¡ATAJADÓN MONUMENTAL! El arquero vuela en cámara lenta, tapa el tiro, retiene el balón y despeja
    const plays = [
      {
        title: '⚡ ¡¡¡GOOOOOOOOOOOOLAZO DE CHILENA!!! ⚡',
        subtitle: '¡Pirueta acrobática al ángulo de la escuadra!'
      },
      {
        title: '💥 ¡¡QUÉ CAÑONAZO IMPARABLE!! 💥',
        subtitle: '¡Dejó sentado al defensa y fusiló las redes!'
      },
      {
        title: '🎩 ¡¡¡OBRA DE ARTE / VASELINA!!! 🎩',
        subtitle: '¡La picó con sutileza por encima del arquero!'
      },
      {
        title: '🧤 ¡¡ATAJADA ÉPICA Y DESPEJE DEL ARQUERO!! 🧤',
        subtitle: '¡Vuelo felino al ángulo, retención en dos manos y contraataque!'
      }
    ];

    const playDuration = 4.2; // segundos por jugada

    const loop = () => {
      t += 0.022;
      const totalTime = t;
      const playIndex = Math.floor((totalTime / playDuration)) % plays.length;
      const progress = ((totalTime % playDuration)) / playDuration; // 0.0 a 1.0 de la jugada actual
      const currentPlay = plays[playIndex];

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // 1. Cielo nocturno y gradiente de estadio épico
      const skyGrad = ctx.createRadialGradient(W / 2, H * 0.35, 50, W / 2, H * 0.35, W * 0.7);
      skyGrad.addColorStop(0, '#1e293b');
      skyGrad.addColorStop(0.5, '#0f172a');
      skyGrad.addColorStop(1, '#020617');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Focos de estadio que iluminan la cancha
      const spotGrad1 = ctx.createRadialGradient(160, 40, 5, 260, 280, 320);
      spotGrad1.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      spotGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGrad1;
      ctx.fillRect(0, 0, W, H);

      const spotGrad2 = ctx.createRadialGradient(W - 160, 40, 5, W - 260, 280, 320);
      spotGrad2.addColorStop(0, 'rgba(250, 204, 21, 0.30)');
      spotGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGrad2;
      ctx.fillRect(0, 0, W, H);

      // Graderías en el horizonte con flashes
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, H * 0.52, W, H * 0.12);
      for (let i = 0; i < 18; i++) {
        if (Math.sin(t * 14 + i * 3.5) > 0.85) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect((i * 57 + (t * 22)) % W, H * 0.54 + (i % 3) * 6, 3, 3);
        }
      }

      // Césped verde iluminado con perspectiva
      const pitchGrad = ctx.createLinearGradient(0, H * 0.60, 0, H);
      pitchGrad.addColorStop(0, '#047857');
      pitchGrad.addColorStop(0.5, '#059669');
      pitchGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = pitchGrad;
      ctx.fillRect(0, H * 0.60, W, H * 0.40);

      // Líneas reglamentarias
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.12, H * 0.85);
      ctx.lineTo(W * 0.88, H * 0.85);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(W * 0.40, H * 0.85, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Portería a la derecha
      const goalX = W * 0.84;
      const goalY = H * 0.62;
      const goalW = 75;
      const goalH = 130;

      // Sombra del arco
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(goalX, goalY + goalH - 8, goalW, 16);

      // Red del arco tejida
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      for (let gx = goalX; gx <= goalX + goalW; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx, goalY);
        ctx.lineTo(gx, goalY + goalH);
        ctx.stroke();
      }
      for (let gy = goalY; gy <= goalY + goalH; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(goalX, gy);
        ctx.lineTo(goalX + goalW, gy);
        ctx.stroke();
      }

      // Postes y travesaño
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(goalX, goalY + goalH);
      ctx.lineTo(goalX, goalY);
      ctx.lineTo(goalX + goalW, goalY + 8);
      ctx.stroke();

      // ==============================================================
      // JUGADOR ATACANTE, DEFENSA Y BALÓN SEGÚN LA JUGADA ACTUAL
      // ==============================================================
      const strikerGroundY = H * 0.82;
      let strikerX = W * 0.35;
      let strikerY = strikerGroundY;
      let strikerAngle = 0;

      let ballX = W * 0.22;
      let ballY = H * 0.80;

      let gkX = goalX - 35;
      let gkY = goalY + goalH - 18;
      let gkAngle = 0;

      // --- JUGADA 0: CHILENA AL ÁNGULO ---
      if (playIndex === 0) {
        if (progress < 0.30) {
          const p = progress / 0.30;
          strikerX = (W * 0.34) + p * 60;
          strikerY = strikerGroundY - Math.abs(Math.sin(p * Math.PI * 4)) * 6;
          strikerAngle = 0.15;
          ballX = (W * 0.22) + p * (W * 0.18);
          ballY = (H * 0.80) - Math.sin(p * Math.PI) * 24;
        } else if (progress < 0.62) {
          const p = (progress - 0.30) / 0.32;
          strikerX = (W * 0.34) + 60 + p * 20;
          strikerY = strikerGroundY - Math.sin(p * Math.PI) * 55;
          strikerAngle = -p * Math.PI * 1.4;

          const bp = (progress - 0.30) / 0.34;
          ballX = (W * 0.40) + bp * (goalX - (W * 0.40) + 12);
          ballY = (H * 0.72) - Math.sin(bp * Math.PI * 0.65) * 60;

          if (progress > 0.40) {
            const gkp = (progress - 0.40) / 0.35;
            gkY = (goalY + goalH - 18) - Math.sin(gkp * Math.PI * 0.9) * 50;
            gkAngle = -0.55;
          }
        } else {
          strikerX = (W * 0.34) + 80;
          strikerY = strikerGroundY;
          strikerAngle = 0;
          ballX = goalX + 22;
          ballY = (goalY + 28) + Math.sin(t * 14) * 4;
        }
      }

      // --- JUGADA 1: QUIEBRE 1V1 AL DEFENSA Y CAÑONAZO FUSILADOR ---
      else if (playIndex === 1) {
        // Defensa rival que intenta marcar
        const defBaseX = W * 0.48;
        const defY = strikerGroundY;
        let defX = defBaseX;
        let defStunned = false;

        if (progress < 0.25) {
          const p = progress / 0.25;
          strikerX = (W * 0.28) + p * 80;
          ballX = strikerX + 12;
          ballY = H * 0.84;
        } else if (progress < 0.45) {
          // Quiebre elástico de regate
          const p = (progress - 0.25) / 0.20;
          strikerX = (W * 0.28) + 80 + p * 60;
          strikerY = strikerGroundY - Math.sin(p * Math.PI) * 16;
          ballX = strikerX + 14;
          ballY = H * 0.82;
          defStunned = true;
          defX = defBaseX - p * 15;
        } else if (progress < 0.70) {
          // Zapatazo misil rasante al palo
          const bp = (progress - 0.45) / 0.25;
          strikerX = (W * 0.50);
          strikerY = strikerGroundY;
          ballX = (W * 0.52) + bp * (goalX - (W * 0.52) + 10);
          ballY = (H * 0.82) - bp * 10;
          defStunned = true;

          // Arquero intenta estirarse abajo
          const gkp = (progress - 0.45) / 0.25;
          gkY = (goalY + goalH - 18) + Math.sin(gkp * Math.PI * 0.5) * 8;
          gkAngle = -0.3;
        } else {
          strikerX = (W * 0.50);
          strikerY = strikerGroundY;
          ballX = goalX + 22;
          ballY = (goalY + goalH - 24) + Math.sin(t * 12) * 3;
          defStunned = true;
        }

        // Render del defensa burlado en el suelo
        ctx.save();
        ctx.translate(defX, defY + (defStunned ? 10 : 0));
        if (defStunned) ctx.rotate(Math.PI / 2.3);
        ctx.fillStyle = '#dc2626'; // Camiseta roja
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-8, -8, 16, 14, 3);
        else ctx.rect(-8, -8, 16, 14);
        ctx.fill();
        ctx.fillStyle = '#ffcca3';
        ctx.beginPath();
        ctx.arc(0, -14, 6, 0, Math.PI * 2);
        ctx.fill();
        if (defStunned) {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('💫😵💫', -10, -22);
        }
        ctx.restore();
      }

      // --- JUGADA 2: VASELINA / SOMBRERITO PICADO CON CLASE ---
      else if (playIndex === 2) {
        if (progress < 0.35) {
          // Conducción mano a mano
          const p = progress / 0.35;
          strikerX = (W * 0.30) + p * 110;
          strikerY = strikerGroundY;
          ballX = strikerX + 12;
          ballY = H * 0.84;
          // Arquero sale a achicar desesperado
          gkX = (goalX - 35) - p * 40;
        } else if (progress < 0.72) {
          // Toque suave picado por arriba del arquero
          const bp = (progress - 0.35) / 0.37;
          strikerX = (W * 0.41);
          strikerY = strikerGroundY;

          ballX = (W * 0.43) + bp * (goalX - (W * 0.43) + 12);
          // Trayectoria parabólica alta por arriba de la cabeza del arquero
          ballY = (H * 0.82) - Math.sin(bp * Math.PI) * 95;

          // Arquero mira hacia atrás impotente
          gkX = goalX - 75;
          gkAngle = 0.2;
        } else {
          strikerX = (W * 0.41);
          strikerY = strikerGroundY;
          ballX = goalX + 20;
          ballY = (goalY + 45) + Math.sin(t * 10) * 3;
          gkX = goalX - 75;
        }
      }

      // --- JUGADA 3: PARADÓN DEL ARQUERO, RETENCIÓN Y SAQUE/DISPARO POTENTE ---
      else {
        if (progress < 0.30) {
          // Delantero enfila y saca cañonazo al ángulo
          const p = progress / 0.30;
          strikerX = (W * 0.32) + p * 60;
          strikerY = strikerGroundY;
          ballX = strikerX + 10;
          ballY = H * 0.84;
        } else if (progress < 0.58) {
          // Balón va disparado al ángulo superior del arco
          const bp = (progress - 0.30) / 0.28;
          strikerX = (W * 0.38);
          strikerY = strikerGroundY;
          const targetFlyX = goalX - 25;
          const targetFlyY = goalY + 30;

          ballX = (W * 0.40) + bp * (targetFlyX - (W * 0.40));
          ballY = (H * 0.82) - Math.sin(bp * Math.PI * 0.5) * 80;

          // Arquero vuela estirándose en el aire hacia el ángulo
          gkX = (goalX - 45) + bp * 20;
          gkY = (goalY + goalH - 18) - Math.sin(bp * Math.PI * 0.95) * 85;
          gkAngle = -0.75;
        } else if (progress < 0.78) {
          // El arquero aterriza de pie con el balón seguro en sus dos guantes
          const landP = (progress - 0.58) / 0.20;
          strikerX = (W * 0.38);
          gkX = goalX - 35;
          gkY = (goalY + goalH - 18);
          gkAngle = 0;
          ballX = gkX + 6;
          ballY = gkY - 6;
        } else {
          // El arquero envía y dispara un saque volea fortísimo hacia adelante
          const kickP = (progress - 0.78) / 0.22;
          strikerX = (W * 0.38);
          gkX = goalX - 35;
          gkY = goalY + goalH - 18;
          gkAngle = 0.25;

          // Balón vuela alto en contragolpe
          ballX = (goalX - 35) - kickP * (W * 0.65);
          ballY = (goalY + goalH - 18) - Math.sin(kickP * Math.PI) * 110;
        }
      }

      // Render del futbolista que remata
      ctx.save();
      ctx.translate(strikerX, strikerY);
      ctx.rotate(strikerAngle);

      if (strikerY >= strikerGroundY - 10) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Camiseta azul número 10
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-9, -10, 18, 16, 4);
      else ctx.rect(-9, -10, 18, 16);
      ctx.fill();

      // Cuello dorado
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-3, -10, 6, 4);

      // Shorts blancos
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8, 6, 16, 8);

      // Cabeza
      ctx.fillStyle = '#ffcca3';
      ctx.beginPath();
      ctx.arc(0, -18, 7, 0, Math.PI * 2);
      ctx.fill();

      // Cabello
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(0, -20, 7, Math.PI, Math.PI * 2);
      ctx.fill();

      // Piernas
      const legKicking = (playIndex === 0 && progress >= 0.30 && progress < 0.62);
      ctx.fillStyle = '#ffcca3';
      ctx.fillRect(legKicking ? 4 : -6, 14, 5, 12);
      ctx.fillRect(legKicking ? 10 : 2, 14, 5, 12);

      // Botines dorados
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(legKicking ? 8 : -8, 24, 7, 4);
      ctx.fillRect(legKicking ? 14 : 2, 24, 7, 4);

      // Festejo con brazos arriba en el gol
      if (progress >= 0.68) {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-14, -18, 5, 14);
        ctx.fillRect(9, -18, 5, 14);
      }
      ctx.restore();

      // Estela de fuego del balón
      if (progress > 0.32 && progress < 0.75) {
        ctx.save();
        for (let s = 1; s <= 4; s++) {
          ctx.beginPath();
          ctx.arc(ballX - s * 9, ballY + s * 1.5, Math.max(2, 8 - s * 1.5), 0, Math.PI * 2);
          ctx.fillStyle = s === 1 ? 'rgba(255, 230, 0, 0.7)' : 'rgba(255, 100, 0, 0.4)';
          ctx.fill();
        }
        ctx.restore();
      }

      // Render del balón esférico
      ctx.save();
      ctx.translate(ballX, ballY);
      ctx.rotate(t * 14);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render del arquero rival
      ctx.save();
      ctx.translate(gkX, gkY);
      ctx.rotate(gkAngle);
      ctx.fillStyle = '#ea580c'; // Naranja
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-8, -8, 16, 14, 3);
      else ctx.rect(-8, -8, 16, 14);
      ctx.fill();
      ctx.fillStyle = '#ffcca3';
      ctx.beginPath();
      ctx.arc(0, -15, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e'; // Guantes verdes
      ctx.fillRect(8, -12, 6, 6);
      ctx.fillRect(8, -2, 6, 6);
      ctx.restore();

      // ==========================================
      // RÓTULO DINÁMICO DE GOLAZO SEGÚN LA JUGADA
      // ==========================================
      if (progress > 0.65) {
        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffd700';
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentPlay.title, W / 2, H * 0.42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(currentPlay.subtitle, W / 2, H * 0.47);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    this.animId = animId;
  }

  cleanup() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}
