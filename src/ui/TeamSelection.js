import { DEFAULT_TEAMS } from '../data/teams.js';
import { DIFFICULTY } from '../utils/constants.js';

export class TeamSelection {
  constructor(app, context = {}) {
    this.app = app;
    this.mode = context.mode || 'quick';
    this.teams = DEFAULT_TEAMS;

    this.selectedHomeIndex = 0;
    this.selectedAwayIndex = 1;
    this.selectedUserLeagueIndex = 0;
    this.selectedDifficulty = this.app.getSettings().difficulty || DIFFICULTY.NORMAL;
  }

  render() {
    const isLeagueMode = this.mode === 'league-new';

    return `
      <div class="screen">
        <div class="screen-header">
          <div class="screen-title">
            ${isLeagueMode ? 'Selección de Club para el Modo Liga' : 'Configurar Partido Rápido'}
          </div>
          <button id="btnBack" class="btn btn-secondary">← Volver al Menú</button>
        </div>

        ${isLeagueMode ? this.renderLeagueSelection() : this.renderQuickMatchSelection()}

        ${!isLeagueMode ? `
          <!-- SELECTOR DE NIVEL DE DIFICULTAD DIRECTO EN PARTIDO RÁPIDO -->
          <div style="max-width: 600px; margin: 24px auto 0 auto; width: 100%; text-align: center;" class="card">
            <label style="display: block; font-size: 0.85rem; color: var(--accent-gold); font-weight: bold; margin-bottom: 8px;">
              ⚡ NIVEL DE DIFICULTAD DE LA IA:
            </label>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <button type="button" class="btn diff-btn ${this.selectedDifficulty === DIFFICULTY.EASY ? 'btn-primary' : ''}" data-diff="${DIFFICULTY.EASY}">
                FÁCIL
              </button>
              <button type="button" class="btn diff-btn ${this.selectedDifficulty === DIFFICULTY.NORMAL ? 'btn-primary' : ''}" data-diff="${DIFFICULTY.NORMAL}">
                NORMAL
              </button>
              <button type="button" class="btn diff-btn ${this.selectedDifficulty === DIFFICULTY.HARD ? 'btn-primary' : ''}" data-diff="${DIFFICULTY.HARD}">
                DIFÍCIL
              </button>
            </div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: center; margin-top: 24px;">
          <button id="btnStart" class="btn btn-primary" style="padding: 16px 48px; font-size: 1.1rem;">
            ${isLeagueMode ? 'Comenzar Temporada' : '¡Comenzar Partido!'}
          </button>
        </div>
      </div>
    `;
  }

  renderQuickMatchSelection() {
    const homeTeam = this.teams[this.selectedHomeIndex];
    const awayTeam = this.teams[this.selectedAwayIndex];

    return `
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 30px; align-items: start; max-width: 1100px; margin: 0 auto; width: 100%;">
        <!-- Local -->
        <div class="card" style="border-top: 4px solid ${homeTeam.primaryColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span style="font-weight: 700; color: var(--accent-green);">EQUIPO LOCAL</span>
            <span style="font-size: 1.2rem; font-weight: 800;">${homeTeam.overall} OVR</span>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Club Local:</label>
            <select id="selectHome" class="btn" style="width: 100%; text-align: left;">
              ${this.teams.map((t, i) => `
                <option value="${i}" ${i === this.selectedHomeIndex ? 'selected' : ''}>${t.name} (${t.overall})</option>
              `).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <div style="flex: 1; height: 16px; border-radius: 4px; background: ${homeTeam.primaryColor};"></div>
            <div style="flex: 1; height: 16px; border-radius: 4px; background: ${homeTeam.secondaryColor}; border: 1px solid var(--border-color);"></div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span>Ataque</span><span>${homeTeam.attack}</span>
              </div>
              <div style="height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
                <div style="width: ${homeTeam.attack}%; height: 100%; background: #ef4444;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span>Defensa</span><span>${homeTeam.defense}</span>
              </div>
              <div style="height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
                <div style="width: ${homeTeam.defense}%; height: 100%; background: #3b82f6;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span>Velocidad</span><span>${homeTeam.speed}</span>
              </div>
              <div style="height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
                <div style="width: ${homeTeam.speed}%; height: 100%; background: #10b981;"></div>
              </div>
            </div>
          </div>
        </div>

        <div style="align-self: center; font-size: 1.8rem; font-weight: 900; color: var(--text-muted);">
          VS
        </div>

        <!-- Visitante -->
        <div class="card" style="border-top: 4px solid ${awayTeam.primaryColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span style="font-weight: 700; color: #60a5fa;">EQUIPO VISITANTE</span>
            <span style="font-size: 1.2rem; font-weight: 800;">${awayTeam.overall} OVR</span>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Club Visitante:</label>
            <select id="selectAway" class="btn" style="width: 100%; text-align: left;">
              ${this.teams.map((t, i) => `
                <option value="${i}" ${i === this.selectedAwayIndex ? 'selected' : ''}>${t.name} (${t.overall})</option>
              `).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <div style="flex: 1; height: 16px; border-radius: 4px; background: ${awayTeam.primaryColor};"></div>
            <div style="flex: 1; height: 16px; border-radius: 4px; background: ${awayTeam.secondaryColor}; border: 1px solid var(--border-color);"></div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span>Ataque</span><span>${awayTeam.attack}</span>
              </div>
              <div style="height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
                <div style="width: ${awayTeam.attack}%; height: 100%; background: #ef4444;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span>Defensa</span><span>${awayTeam.defense}</span>
              </div>
              <div style="height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
                <div style="width: ${awayTeam.defense}%; height: 100%; background: #3b82f6;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span>Velocidad</span><span>${awayTeam.speed}</span>
              </div>
              <div style="height: 6px; background: var(--bg-card); border-radius: 3px; overflow: hidden;">
                <div style="width: ${awayTeam.speed}%; height: 100%; background: #10b981;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderLeagueSelection() {
    return `
      <div style="max-width: 900px; margin: 0 auto; width: 100%;">
        <p style="color: var(--text-muted); margin-bottom: 20px; text-align: center; font-size: 0.75rem;">
          Elige el club que dirigirás durante la Liga de Leyendas.
        </p>

        <div class="teams-grid">
          ${this.teams.map((team, idx) => `
            <div class="team-card ${idx === this.selectedUserLeagueIndex ? 'selected' : ''}" data-idx="${idx}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 0.85rem;">${team.name}</span>
                <span style="font-weight: 800; color: var(--accent-gold); font-size: 0.85rem;">${team.overall}</span>
              </div>
              <div style="display: flex; gap: 6px; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="flex: 1; background: ${team.primaryColor};"></div>
                <div style="flex: 1; background: ${team.secondaryColor};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
                <span>ATK ${team.attack}</span>
                <span>DEF ${team.defense}</span>
                <span>VEL ${team.speed}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBack = container.querySelector('#btnBack');
    const btnStart = container.querySelector('#btnStart');
    const selectHome = container.querySelector('#selectHome');
    const selectAway = container.querySelector('#selectAway');

    btnBack?.addEventListener('click', () => {
      this.app.navigate('main-menu');
    });

    // Selector interactivo de dificultad en pantalla
    const diffButtons = container.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDifficulty = btn.dataset.diff;
        diffButtons.forEach(b => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
      });
    });

    if (this.mode === 'league-new') {
      const cards = container.querySelectorAll('.team-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          this.selectedUserLeagueIndex = parseInt(card.dataset.idx, 10);
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });

      btnStart?.addEventListener('click', () => {
        const userTeam = this.teams[this.selectedUserLeagueIndex];
        this.app.startNewLeague(userTeam.id);
      });
    } else {
      selectHome?.addEventListener('change', (e) => {
        this.selectedHomeIndex = parseInt(e.target.value, 10);
        this.app.renderCurrentScreen();
      });

      selectAway?.addEventListener('change', (e) => {
        this.selectedAwayIndex = parseInt(e.target.value, 10);
        this.app.renderCurrentScreen();
      });

      btnStart?.addEventListener('click', () => {
        if (this.selectedHomeIndex === this.selectedAwayIndex) {
          alert('Por favor selecciona dos equipos diferentes para disputar el partido.');
          return;
        }
        const homeTeam = this.teams[this.selectedHomeIndex];
        const awayTeam = this.teams[this.selectedAwayIndex];
        this.app.startMatch(homeTeam, awayTeam, {
          mode: 'quick',
          difficulty: this.selectedDifficulty,
        });
      });
    }
  }
}
