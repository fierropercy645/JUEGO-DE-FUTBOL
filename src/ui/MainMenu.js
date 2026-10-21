export class MainMenu {
  constructor(app) {
    this.app = app;
  }

  render() {
    const hasLeague = this.app.hasSavedLeague();

    return `
      <div class="screen main-cover-screen">
        <!-- Luces y Efectos de Estadio de Fondo -->
        <div class="stadium-spotlights"></div>
        <div class="stadium-crowd-silhouette"></div>

        <div class="cover-content">
          <!-- Insignia / Badge de torneo -->
          <div class="cover-badge">
            <span class="badge-icon">⚽</span>
            <span class="badge-text">COPA DE LEYENDAS 2026 • ARCADE PRO</span>
            <span class="badge-icon">⭐</span>
          </div>

          <!-- Título Portada 3D Impactante -->
          <div class="cover-title-container">
            <h1 class="cover-title-main">
              FOOTBALL
              <span class="cover-title-glow">LEGENDS</span>
            </h1>
            <div class="cover-subtitle">
              EL SIMULADOR DE FÚTBOL DEFINITIVO • GOLAZOS, VASELINAS Y PENALES
            </div>
          </div>

          <!-- MINI CANCHA CON ANIMACIÓN DE CHILENA / GOLAZO ESPECTACULAR EN VIVO -->
          <div class="cover-animation-card">
            <canvas id="coverCanvas" width="460" height="150" class="cover-live-canvas"></canvas>
            <div class="cover-anim-badge">🔥 JUGADA MAESTRA • CHILENA AL ÁNGULO 🔥</div>
          </div>

          <!-- Puntos destacados / Features de Portada -->
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
            <span>Desarrollado con HTML5 Canvas • Sonido y Físicas en Tiempo Real</span>
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

    const loop = () => {
      t += 0.025;
      const progress = (t % 3.8) / 3.8; // Ciclo de 3.8s

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo de césped mini estadio
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const turfGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      turfGrad.addColorStop(0, '#064e3b');
      turfGrad.addColorStop(0.5, '#047857');
      turfGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = turfGrad;
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Líneas de césped
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 10);
      ctx.lineTo(canvas.width / 2, canvas.height - 10);
      ctx.stroke();

      // Arco derecho
      const goalX = canvas.width - 26;
      const goalY = 40;
      const goalH = 70;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(goalX, goalY, 4, goalH);
      // Red del arco
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let gy = goalY; gy <= goalY + goalH; gy += 8) {
        ctx.beginPath();
        ctx.moveTo(goalX, gy);
        ctx.lineTo(goalX + 14, gy);
        ctx.stroke();
      }

      // 1. Futbolista Delantero Estrella (Chilena / Tijera acrobática)
      const strikerX = 140;
      const strikerBaseY = 85;
      let strikerY = strikerBaseY;
      let strikerRot = 0;

      if (progress < 0.35) {
        // En carrera preparatoria
        strikerY = strikerBaseY;
        strikerRot = 0;
      } else if (progress < 0.65) {
        // Salto y pirueta de chilena en el aire
        const jumpP = (progress - 0.35) / 0.3;
        strikerY = strikerBaseY - Math.sin(jumpP * Math.PI) * 24;
        strikerRot = -jumpP * Math.PI * 1.3;
      } else {
        // Caída celebrando
        strikerY = strikerBaseY;
        strikerRot = 0;
      }

      ctx.save();
      ctx.translate(strikerX, strikerY);
      ctx.rotate(strikerRot);

      // Cuerpo delantero
      ctx.fillStyle = '#3b82f6'; // Azul
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-7, -6, 14, 10, 2);
      else ctx.rect(-7, -6, 14, 10);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#ffcca3';
      ctx.beginPath();
      ctx.arc(0, -11, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pierna pateando hacia atrás
      ctx.fillStyle = '#10b981';
      ctx.fillRect(2, 4, 10, 4);
      ctx.restore();

      // 2. Balón con cometa hacia el ángulo
      let ballX = 60;
      let ballY = 90;

      if (progress < 0.35) {
        // Centro flotando hacia el delantero
        const p = progress / 0.35;
        ballX = 60 + p * 80;
        ballY = 90 - Math.sin(p * Math.PI) * 35;
      } else if (progress < 0.70) {
        // Zapatazo de chilena al ángulo derecho
        const p = (progress - 0.35) / 0.35;
        ballX = 140 + p * (goalX - 140);
        ballY = 65 - Math.sin(p * Math.PI * 0.5) * 15;
      } else {
        // Balón inflando la red
        ballX = goalX + 6;
        ballY = 50 + Math.sin(t * 8) * 4;
      }

      // Estela de fuego del balón
      if (progress > 0.35 && progress < 0.75) {
        ctx.fillStyle = 'rgba(255, 180, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(ballX - 10, ballY + 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Balón esférico
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 2, 0, Math.PI * 2);
      ctx.fill();

      // 3. Arquero rival volando para tapar
      const gkX = goalX - 25;
      let gkY = 75;
      let gkRot = 0;

      if (progress > 0.45 && progress < 0.80) {
        // Plancha desesperada al ángulo
        const p = (progress - 0.45) / 0.35;
        gkY = 75 - Math.sin(p * Math.PI * 0.8) * 22;
        gkRot = -0.4;
      }

      ctx.save();
      ctx.translate(gkX, gkY);
      ctx.rotate(gkRot);
      ctx.fillStyle = '#f97316'; // Arquero naranja
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-6, -5, 12, 9, 2);
      else ctx.rect(-6, -5, 12, 9);
      ctx.fill();
      // Guantes verdes
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(6, -6, 4, 4);
      ctx.fillRect(6, 1, 4, 4);
      ctx.restore();

      // 4. Cartel de GOLAZO cuando entra el balón
      if (progress > 0.68) {
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fillText('⚽ ¡GOLAZOOOO DE CHILENA! ⚽', canvas.width / 2, 34);
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
