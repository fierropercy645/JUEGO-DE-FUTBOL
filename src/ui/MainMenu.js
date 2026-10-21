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

    const loop = () => {
      t += 0.022;
      const progress = (t % 4.0) / 4.0; // Ciclo continuo de 4.0s

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

      // Graderías en el horizonte
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, H * 0.52, W, H * 0.12);
      // Luces de flashes en la tribuna
      for (let i = 0; i < 16; i++) {
        if (Math.sin(t * 12 + i * 3) > 0.88) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect((i * 61 + (t * 20)) % W, H * 0.54 + (i % 3) * 6, 3, 3);
        }
      }

      // Césped verde iluminado con perspectiva
      const pitchGrad = ctx.createLinearGradient(0, H * 0.60, 0, H);
      pitchGrad.addColorStop(0, '#047857');
      pitchGrad.addColorStop(0.5, '#059669');
      pitchGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = pitchGrad;
      ctx.fillRect(0, H * 0.60, W, H * 0.40);

      // Líneas reglamentarias en el césped
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Línea de meta y área
      ctx.moveTo(W * 0.15, H * 0.85);
      ctx.lineTo(W * 0.85, H * 0.85);
      ctx.stroke();

      // Punto penal
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(W * 0.42, H * 0.85, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Portería / Arco profesional iluminado a la derecha
      const goalX = W * 0.84;
      const goalY = H * 0.62;
      const goalW = 75;
      const goalH = 130;

      // Sombra del arco
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(goalX, goalY + goalH - 8, goalW, 16);

      // Malla del arco tejida
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

      // Postes y travesaño metálico
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(goalX, goalY + goalH);
      ctx.lineTo(goalX, goalY);
      ctx.lineTo(goalX + goalW, goalY + 8);
      ctx.stroke();

      // ==========================================
      // FASE DE ANIMACIÓN: JUGADOR HACIENDO GOLAZO
      // ==========================================
      const strikerOriginX = W * 0.34;
      const strikerGroundY = H * 0.82;
      let strikerX = strikerOriginX;
      let strikerY = strikerGroundY;
      let strikerAngle = 0;

      if (progress < 0.30) {
        // Fase 1: Carrera veloz hacia el balón
        const p = progress / 0.30;
        strikerX = strikerOriginX + p * 60;
        strikerY = strikerGroundY - Math.abs(Math.sin(p * Math.PI * 4)) * 6;
        strikerAngle = 0.15;
      } else if (progress < 0.62) {
        // Fase 2: Salto acrobático de chilena y patada en el aire
        const p = (progress - 0.30) / 0.32;
        strikerX = strikerOriginX + 60 + p * 20;
        strikerY = strikerGroundY - Math.sin(p * Math.PI) * 55;
        strikerAngle = -p * Math.PI * 1.4;
      } else {
        // Fase 3: Aterrizaje y celebración con los puños arriba
        const p = (progress - 0.62) / 0.38;
        strikerX = strikerOriginX + 80;
        strikerY = strikerGroundY - Math.abs(Math.sin(p * Math.PI * 3)) * 8;
        strikerAngle = 0;
      }

      // Render del futbolista que remata
      ctx.save();
      ctx.translate(strikerX, strikerY);
      ctx.rotate(strikerAngle);

      // Sombra en césped
      if (strikerY >= strikerGroundY - 10) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cuerpo / Camiseta deportiva número 10
      ctx.fillStyle = '#2563eb'; // Azul rey
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-9, -10, 18, 16, 4);
      else ctx.rect(-9, -10, 18, 16);
      ctx.fill();

      // Cuello amarillo
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

      // Pelo
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(0, -20, 7, Math.PI, Math.PI * 2);
      ctx.fill();

      // Piernas estiradas disparando
      ctx.fillStyle = '#ffcca3';
      ctx.fillRect(progress >= 0.30 && progress < 0.62 ? 4 : -6, 14, 5, 12);
      ctx.fillRect(progress >= 0.30 && progress < 0.62 ? 10 : 2, 14, 5, 12);

      // Botines dorados
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(progress >= 0.30 && progress < 0.62 ? 8 : -8, 24, 7, 4);
      ctx.fillRect(progress >= 0.30 && progress < 0.62 ? 14 : 2, 24, 7, 4);

      // Brazos festivos
      if (progress >= 0.62) {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-14, -18, 5, 14);
        ctx.fillRect(9, -18, 5, 14);
      }
      ctx.restore();

      // ==========================================
      // FASE DEL BALÓN CON TRAYECTORIA Y FUEGO
      // ==========================================
      let ballX = W * 0.22;
      let ballY = H * 0.80;

      if (progress < 0.30) {
        // Balón rodando o botando hacia la zona del rematador
        const p = progress / 0.30;
        ballX = W * 0.22 + p * (W * 0.18);
        ballY = H * 0.80 - Math.sin(p * Math.PI) * 24;
      } else if (progress < 0.66) {
        // Balón impactado que vuela como misil con curva hacia la escuadra
        const p = (progress - 0.30) / 0.36;
        ballX = (W * 0.40) + p * (goalX - (W * 0.40) + 12);
        ballY = (H * 0.72) - Math.sin(p * Math.PI * 0.65) * 60;
      } else {
        // Balón inflando la red sacudiéndose
        ballX = goalX + 22;
        ballY = (goalY + 28) + Math.sin(t * 14) * 4;
      }

      // Estela de fuego del bólido
      if (progress > 0.30 && progress < 0.75) {
        ctx.save();
        for (let s = 1; s <= 4; s++) {
          ctx.beginPath();
          ctx.arc(ballX - s * 9, ballY + s * 2, Math.max(2, 8 - s * 1.5), 0, Math.PI * 2);
          ctx.fillStyle = s === 1 ? 'rgba(255, 230, 0, 0.7)' : 'rgba(255, 100, 0, 0.4)';
          ctx.fill();
        }
        ctx.restore();
      }

      // Render del balón esférico
      ctx.save();
      ctx.translate(ballX, ballY);
      ctx.rotate(t * 12);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // ARQUERO RIVAL VOLANDO AL ÁNGULO
      // ==========================================
      const gkBaseX = goalX - 35;
      const gkBaseY = goalY + goalH - 18;
      let gkX = gkBaseX;
      let gkY = gkBaseY;
      let gkAngle = 0;

      if (progress > 0.40 && progress < 0.78) {
        // Plancha desesperada hacia la escuadra
        const p = (progress - 0.40) / 0.38;
        gkX = gkBaseX + p * 18;
        gkY = gkBaseY - Math.sin(p * Math.PI * 0.9) * 50;
        gkAngle = -0.55;
      }

      ctx.save();
      ctx.translate(gkX, gkY);
      ctx.rotate(gkAngle);

      // Buzo naranja de arquero
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-8, -8, 16, 14, 3);
      else ctx.rect(-8, -8, 16, 14);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#ffcca3';
      ctx.beginPath();
      ctx.arc(0, -15, 6, 0, Math.PI * 2);
      ctx.fill();

      // Guantes verdes fosforescentes volando
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(8, -12, 6, 6);
      ctx.fillRect(8, -2, 6, 6);

      ctx.restore();

      // ==========================================
      // RÓTULO DINÁMICO DE GOLAZO AL ENTRAR EL BALÓN
      // ==========================================
      if (progress > 0.64) {
        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffd700';
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ ¡¡¡GOOOOOOOOOOOOOLAZO DE CHILENA!!! ⚡', W / 2, H * 0.42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('¡Al ángulo de la escuadra imposible para el arquero!', W / 2, H * 0.47);
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
