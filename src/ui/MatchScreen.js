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

          <div style="font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.08); border: 1px solid var(--border-color); color: var(--accent-gold);">
            IA: ${this.match.difficulty.toUpperCase()}
          </div>

          <button id="btnPauseMatch" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.85rem;">
            ⏸️ Pausa
          </button>
        </div>

        <!-- Canvas -->
        <div class="canvas-wrapper">
          <canvas id="matchCanvas" width="${PITCH.WIDTH}" height="${PITCH.HEIGHT}"></canvas>
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

    // Start game loop
    this.gameLoop.start();
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
