import { DEFAULT_TEAMS } from '../data/teams.js';

export class TournamentScreen {
  constructor(app) {
    this.app = app;
    this.tournament = this.app.getTournament();
  }

  render() {
    if (!this.tournament) {
      return `
        <div class="screen">
          <div class="screen-header">
            <h1 class="screen-title">LEYENDAS CUP</h1>
            <button id="btnBackMenu" class="btn">⬅️ Menú Principal</button>
          </div>
          <div style="text-align: center; margin-top: 60px;">
            <p style="color: var(--text-muted); margin-bottom: 24px;">No hay un torneo activo en este momento.</p>
            <button id="btnStartCup" class="btn btn-primary" style="font-size: 1rem; padding: 14px 28px;">
              🏆 Iniciar Leyendas Cup (8 Equipos)
            </button>
          </div>
        </div>
      `;
    }

    const stageNames = {
      quarters: 'CUARTOS DE FINAL',
      semis: 'SEMIFINALES',
      final: 'GRAN FINAL',
      completed: 'TORNEO FINALIZADO'
    };

    const userMatch = this.tournament.getUserMatch();
    const isUserEliminated = !userMatch && !this.tournament.completed;

    const renderMatchCard = (m) => {
      const home = DEFAULT_TEAMS.find(t => t.id === m.homeTeamId) || { name: 'Por definir', shortName: 'TBD', primaryColor: '#555' };
      const away = DEFAULT_TEAMS.find(t => t.id === m.awayTeamId) || { name: 'Por definir', shortName: 'TBD', primaryColor: '#555' };
      const isUserGame = m.homeTeamId === this.tournament.userTeamId || m.awayTeamId === this.tournament.userTeamId;

      return `
        <div style="background: ${isUserGame ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)'}; border: 1.5px solid ${isUserGame ? 'var(--accent-green)' : 'var(--border-color)'}; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${home.primaryColor};"></span>
            <span style="font-size:0.75rem; font-weight:700;">${home.shortName || home.name}</span>
          </div>
          <div style="font-weight:900; font-size:0.9rem; color:var(--accent-gold);">
            ${m.played ? `${m.homeGoals} - ${m.awayGoals} ${m.penaltiesHome !== null ? `(${m.penaltiesHome}-${m.penaltiesAway} P)` : ''}` : 'VS'}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.75rem; font-weight:700;">${away.shortName || away.name}</span>
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${away.primaryColor};"></span>
          </div>
        </div>
      `;
    };

    return `
      <div class="screen" style="padding: 18px 24px;">
        <div class="screen-header" style="margin-bottom: 16px;">
          <div>
            <h1 class="screen-title" style="font-size: 1.5rem;">🏆 LEYENDAS CUP 2026</h1>
            <div style="font-size: 0.75rem; color: var(--accent-gold); margin-top: 4px; font-weight: 700;">
              FASE ACTUAL: ${stageNames[this.tournament.currentStage] || this.tournament.currentStage}
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="btnResetCup" class="btn btn-secondary" style="font-size: 0.7rem;">🔄 Reiniciar</button>
            <button id="btnBackMenu" class="btn" style="font-size: 0.7rem;">⬅️ Menú Principal</button>
          </div>
        </div>

        ${this.tournament.completed ? `
          <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid var(--accent-gold); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.4rem; color: var(--accent-gold); margin-bottom: 8px;">👑 ¡CAMPEÓN DE LA LEYENDAS CUP! 👑</h2>
            <p style="font-size: 1.1rem; font-weight: 800; color: #fff;">
              ${(DEFAULT_TEAMS.find(t => t.id === this.tournament.championTeamId) || {}).name || 'CAMPEÓN'}
            </p>
          </div>
        ` : ''}

        ${userMatch && !userMatch.played ? `
          <div style="background: rgba(16, 185, 129, 0.15); border: 2px solid var(--accent-green); border-radius: 10px; padding: 14px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.75rem; color: var(--accent-green); font-weight: 800;">TU PRÓXIMO ENCUENTRO:</div>
              <div style="font-size: 1rem; font-weight: 900; margin-top: 4px;">
                ${(DEFAULT_TEAMS.find(t => t.id === userMatch.homeTeamId) || {}).name} VS ${(DEFAULT_TEAMS.find(t => t.id === userMatch.awayTeamId) || {}).name}
              </div>
            </div>
            <button id="btnPlayCupMatch" class="btn btn-primary" style="font-size: 0.85rem; padding: 10px 20px;">
              ⚽ JUGAR PARTIDO
            </button>
          </div>
        ` : ''}

        <!-- Brackets Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div>
            <h3 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">CUARTOS DE FINAL</h3>
            ${this.tournament.brackets.quarters.map(renderMatchCard).join('')}
          </div>
          <div>
            <h3 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">SEMIFINALES</h3>
            ${this.tournament.brackets.semis.map(renderMatchCard).join('')}
          </div>
          <div>
            <h3 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">GRAN FINAL</h3>
            ${renderMatchCard(this.tournament.brackets.final)}
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBackMenu = container.querySelector('#btnBackMenu');
    btnBackMenu?.addEventListener('click', () => {
      this.app.navigate('main-menu');
    });

    const btnStartCup = container.querySelector('#btnStartCup');
    btnStartCup?.addEventListener('click', () => {
      this.app.navigate('team-select', { mode: 'cup-new' });
    });

    const btnResetCup = container.querySelector('#btnResetCup');
    btnResetCup?.addEventListener('click', () => {
      if (confirm('¿Reiniciar la copa actual y comenzar un nuevo torneo?')) {
        this.app.clearTournament();
        this.app.navigate('team-select', { mode: 'cup-new' });
      }
    });

    const btnPlayCupMatch = container.querySelector('#btnPlayCupMatch');
    btnPlayCupMatch?.addEventListener('click', () => {
      const match = this.tournament.getUserMatch();
      if (!match) return;

      const home = DEFAULT_TEAMS.find(t => t.id === match.homeTeamId);
      const away = DEFAULT_TEAMS.find(t => t.id === match.awayTeamId);

      this.tournament.simulateOtherMatches();
      this.app.saveTournamentState();

      this.app.startMatch(home, away, {
        matchId: match.id,
        isCupMatch: true,
      });
    });
  }
}
