import { GameLoop } from '../game/GameLoop.js';
import { Match } from '../game/Match.js';
import { Controls } from '../game/Controls.js';
import { GAME_STATES, PITCH } from '../utils/constants.js';

export class MatchScreen {
  constructor(app, context = {}) {
    this.app = app;
    this.context = context; // { homeTeam, awayTeam, matchId, isLeagueMatch }
    this.controls = new Controls();

    const settings = this.app.getSettings();
    const matchDifficulty = context.difficulty || settings.difficulty;
    this.match = new Match(context.homeTeam, context.awayTeam, {
      matchId: context.matchId,
      durationMinutes: settings.matchDurationMinutes || 3,
      difficulty: matchDifficulty,
    });

    this.isPaused = false;
    this.gameLoop = new GameLoop(this.update.bind(this), this.renderCanvas.bind(this));
  }

  render() {
    return `
      <div class="match-container">
        <!-- HUD -->
        <div class="match-hud">
          <div class="hud-team">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${this.context.homeTeam.primaryColor};"></span>
            <span>${this.context.homeTeam.shortName || this.context.homeTeam.name}</span>
          </div>

          <div class="hud-score" id="hudScore">
            0 - 0
          </div>

          <div class="hud-team">
            <span>${this.context.awayTeam.shortName || this.context.awayTeam.name}</span>
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${this.context.awayTeam.primaryColor};"></span>
          </div>

          <div class="hud-timer" id="hudTimer">
            00:00
          </div>

          <!-- Píldora de eventos en el HUD (Fuera del Canvas, 100% despejado) -->
          <div id="hudMatchEvent" style="display: none; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 4px; background: rgba(16, 185, 129, 0.2); border: 1.5px solid var(--accent-green); color: #10b981; letter-spacing: 0.5px;">
          </div>

          <div style="font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.08); border: 1px solid var(--border-color); color: var(--accent-gold);">
            IA: ${this.match.difficulty.toUpperCase()}
          </div>

          <button id="btnPauseMatch" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.85rem;">
            ⏸️ Pausa
          </button>
        </div>

        <!-- Canvas Wrapper -->
        <div class="canvas-wrapper">
          <canvas id="matchCanvas" width="${PITCH.WIDTH}" height="${PITCH.HEIGHT}"></canvas>

          <!-- Capa de Controles Táctiles para Móviles / Celular -->
          <div class="touch-controls-layer" id="touchControlsLayer">
            <!-- Joystick Virtual (Izquierda) -->
            <div class="touch-joystick-zone" id="touchJoystickZone">
              <div class="joystick-base" id="joystickBase">
                <div class="joystick-knob" id="joystickKnob"></div>
              </div>
            </div>

            <!-- Botones de Acción (Derecha) -->
            <div class="touch-actions-zone">
              <div class="touch-actions-top-row">
                <button type="button" class="touch-action-btn btn-action-switch" data-action="switchPlayer" title="Cambiar Jugador">
                  <span class="btn-main-label">🔄</span>
                  <span class="btn-sub-label">CAMBIAR</span>
                </button>
                <button type="button" class="touch-action-btn btn-action-dribble" data-action="dribble" title="Regate / Quiebre">
                  <span class="btn-main-label">⚡</span>
                  <span class="btn-sub-label">REGATE</span>
                </button>
                <button type="button" class="touch-action-btn btn-action-chip" data-action="chipShot" title="Vaselina">
                  <span class="btn-main-label">🎯</span>
                  <span class="btn-sub-label">VASELINA</span>
                </button>
              </div>

              <div class="touch-actions-main-row">
                <button type="button" class="touch-action-btn btn-action-slide" data-action="slideTackle" title="Barrida">
                  <span class="btn-main-label">🦶</span>
                  <span class="btn-sub-label">BARRIDA</span>
                </button>
                <button type="button" class="touch-action-btn btn-action-pass" data-action="pass" title="Pase">
                  <span class="btn-main-label">A</span>
                  <span class="btn-sub-label">PASE</span>
                </button>
                <button type="button" class="touch-action-btn btn-action-shoot" data-action="shoot" data-action-alt="steal" title="Disparo / Quitar">
                  <span class="btn-main-label">B</span>
                  <span class="btn-sub-label">TIRO/ROBO</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls Hint Bar -->
        <div class="controls-hint-bar">
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Moverse</span>
          <span><kbd>ESPACIO</kbd> / <kbd>J</kbd> Disparar / <strong style="color:var(--accent-green)">Quitar Balón</strong></span>
          <span><kbd>I</kbd> Barrida</span>
          <span><kbd>L</kbd> Jugada</span>
          <span><kbd>U</kbd> Vaselina</span>
          <span><kbd>O</kbd> Rosca</span>
          <span style="color: var(--accent-gold); font-weight: 700;"><kbd>Q</kbd> / <kbd>TAB</kbd> Cambiar</span>
          <span><kbd>1</kbd>-<kbd>5</kbd> Seleccionar</span>
        </div>

        <!-- Pause Modal -->
        <div id="pauseModal" class="overlay" style="display: none;">
          <div class="modal-content">
            <h2 style="font-size: 1.8rem; margin-bottom: 8px;">JUEGO EN PAUSA</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">El encuentro se encuentra detenido</p>

            <div style="display: flex; flex-direction: column; gap: 12px; width: 260px; margin: 0 auto;">
              <button id="btnResume" class="btn btn-primary">▶️ Continuar Partido</button>
              <button id="btnRestart" class="btn">🔄 Reiniciar Partido</button>
              <button id="btnQuitMatch" class="btn btn-danger">🚪 Salir al Menú</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    this.canvas = container.querySelector('#matchCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.hudScore = container.querySelector('#hudScore');
    this.hudTimer = container.querySelector('#hudTimer');
    this.hudMatchEvent = container.querySelector('#hudMatchEvent');
    this.pauseModal = container.querySelector('#pauseModal');

    const btnPause = container.querySelector('#btnPauseMatch');
    const btnResume = container.querySelector('#btnResume');
    const btnRestart = container.querySelector('#btnRestart');
    const btnQuitMatch = container.querySelector('#btnQuitMatch');

    btnPause?.addEventListener('click', () => this.togglePause(true));
    btnResume?.addEventListener('click', () => this.togglePause(false));

    btnRestart?.addEventListener('click', () => {
      if (confirm('¿Reiniciar el partido actual?')) {
        this.cleanup();
        this.app.startMatch(this.context.homeTeam, this.context.awayTeam, this.context);
      }
    });

    btnQuitMatch?.addEventListener('click', () => {
      if (confirm('¿Deseas salir del partido? Se perderá el resultado en curso.')) {
        this.cleanup();
        this.app.navigate(this.context.isLeagueMatch ? 'league' : 'main-menu');
      }
    });

    // SELECCIÓN DE JUGADOR DIRECTA CON UN CLIC DEL RATÓN
    this.canvas?.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      this.match.selectPlayerAtCoordinates(clickX, clickY);
    });

    // Detección de dispositivo táctil / móvil
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

    // Setup Controles Táctiles (solo si es dispositivo táctil)
    if (this.isTouchDevice) {
      container.querySelector('#touchControlsLayer')?.classList.add('touch-active');
      this.setupTouchControls(container);
    } else {
      const touchLayer = container.querySelector('#touchControlsLayer');
      if (touchLayer) touchLayer.style.display = 'none';
    }

    // Start game loop
    this.gameLoop.start();
  }

  setupTouchControls(container) {
    const joystickZone = container.querySelector('#touchJoystickZone');
    const joystickBase = container.querySelector('#joystickBase');
    const joystickKnob = container.querySelector('#joystickKnob');

    if (joystickZone && joystickBase && joystickKnob) {
      let touchId = null;
      let baseRect = null;
      let centerX = 0;
      let centerY = 0;
      const maxRadius = 45;

      const handleTouchStart = (e) => {
        if (touchId !== null) return;
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        baseRect = joystickBase.getBoundingClientRect();
        centerX = baseRect.left + baseRect.width / 2;
        centerY = baseRect.top + baseRect.height / 2;
        updateKnob(touch.clientX, touch.clientY);
        e.preventDefault();
      };

      const handleTouchMove = (e) => {
        if (touchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchId) {
            updateKnob(touch.clientX, touch.clientY);
            e.preventDefault();
            break;
          }
        }
      };

      const handleTouchEnd = (e) => {
        if (touchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            touchId = null;
            joystickKnob.style.transform = `translate(0px, 0px)`;
            this.controls.setTouchMovement(0, 0);
            e.preventDefault();
            break;
          }
        }
      };

      const updateKnob = (clientX, clientY) => {
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        const clampedDist = Math.min(dist, maxRadius);
        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;

        joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

        // Normalizar de 0 a 1 para el movimiento
        const normDist = clampedDist / maxRadius;
        this.controls.setTouchMovement(Math.cos(angle) * normDist, Math.sin(angle) * normDist);
      };

      joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
      joystickZone.addEventListener('touchmove', handleTouchMove, { passive: false });
      joystickZone.addEventListener('touchend', handleTouchEnd, { passive: false });
      joystickZone.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    // Botones de acción táctiles
    const actionButtons = container.querySelectorAll('.touch-action-btn');
    actionButtons.forEach(btn => {
      const action = btn.dataset.action;
      const altAction = btn.dataset.actionAlt;

      const press = (e) => {
        e.preventDefault();
        btn.classList.add('active');
        if (action) this.controls.setVirtualButton(action, true);
        if (altAction) this.controls.setVirtualButton(altAction, true);
      };

      const release = (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        if (action) this.controls.setVirtualButton(action, false);
        if (altAction) this.controls.setVirtualButton(altAction, false);
      };

      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('touchcancel', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    });
  }

  togglePause(shouldPause) {
    this.isPaused = shouldPause;
    if (this.isPaused) {
      this.match.pause();
      if (this.pauseModal) this.pauseModal.style.display = 'flex';
    } else {
      this.match.resume();
      if (this.pauseModal) this.pauseModal.style.display = 'none';
    }
  }

  update(dt) {
    if (this.controls.wasActionJustPressed('pause')) {
      this.togglePause(!this.isPaused);
      return;
    }

    if (!this.isPaused) {
      this.match.handleUserControls(this.controls, dt);
      this.match.update(dt);
      this.controls.clearFrame();

      // Update HUD
      if (this.hudScore) {
        this.hudScore.textContent = `${this.match.stats.homeGoals} - ${this.match.stats.awayGoals}`;
      }
      if (this.hudTimer) {
        const min = this.match.getSimulatedMinute();
        this.hudTimer.textContent = `${min.toString().padStart(2, '0')}:00'`;
      }

      // Avisos deportivos limpios en la barra superior HUD (cero invasión a la cancha)
      if (this.hudMatchEvent) {
        if (this.match.notification) {
          this.hudMatchEvent.textContent = `${this.match.notification.text} ${this.match.notification.subtitle ? '• ' + this.match.notification.subtitle : ''}`;
          this.hudMatchEvent.style.display = 'block';
          if (this.match.notification.isGoal) {
            this.hudMatchEvent.style.color = '#ffd700';
            this.hudMatchEvent.style.borderColor = '#ffd700';
            this.hudMatchEvent.style.background = 'rgba(245, 158, 11, 0.25)';
          } else {
            this.hudMatchEvent.style.color = '#10b981';
            this.hudMatchEvent.style.borderColor = '#10b981';
            this.hudMatchEvent.style.background = 'rgba(16, 185, 129, 0.2)';
          }
        } else {
          this.hudMatchEvent.style.display = 'none';
        }
      }

      // Check match finish
      if (this.match.state === GAME_STATES.FINISHED) {
        this.onMatchFinished();
      }
    }
  }

  onMatchFinished() {
    this.cleanup();
    const finalStats = this.match.stats.toJSON();
    this.app.onMatchCompleted(finalStats, this.context);
  }

  renderCanvas() {
    if (!this.ctx) return;
    this.match.render(this.ctx);
  }

  cleanup() {
    this.gameLoop.stop();
    this.controls.destroy();
  }
}
