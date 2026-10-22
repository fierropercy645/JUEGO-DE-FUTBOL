export class ResultsScreen {
  constructor(app, context = {}) {
    this.app = app;
    this.stats = context.stats || {};
    this.matchContext = context.matchContext || {};
  }

  render() {
    const s = this.stats;
    const isDraw = s.homeGoals === s.awayGoals;
    const homeWon = s.homeGoals > s.awayGoals;
    let resultMessage = '¡EMPATE!';
    if (homeWon) resultMessage = `¡VICTORIA DE ${s.homeTeamName.toUpperCase()}!`;
    if (!homeWon && !isDraw) resultMessage = `¡VICTORIA DE ${s.awayTeamName.toUpperCase()}!`;

    return `
      <div class="screen" style="max-width: 900px; margin: 0 auto; width: 100%;">
        <div class="screen-header">
          <div class="screen-title">Informe Final del Partido</div>
          <button id="btnBackToMenu" class="btn btn-secondary">Menú Principal</button>
        </div>

        <div class="card" style="text-align: center; margin-bottom: 24px; padding: 32px;">
          <div style="font-size: 1.1rem; color: var(--accent-gold); font-weight: 700; margin-bottom: 12px;">
            ${resultMessage}
          </div>

          <div style="display: flex; justify-content: center; align-items: center; gap: 40px; margin: 16px 0;">
            <div style="font-size: 1.8rem; font-weight: 800; flex: 1; text-align: right;">
              ${s.homeTeamName}
            </div>

            <div style="font-size: 3.5rem; font-weight: 900; background: var(--bg-card); padding: 8px 24px; border-radius: 12px; border: 1px solid var(--border-color); color: #fff;">
              ${s.homeGoals} - ${s.awayGoals}
            </div>

            <div style="font-size: 1.8rem; font-weight: 800; flex: 1; text-align: left;">
              ${s.awayTeamName}
            </div>
          </div>

          <!-- Goal scorers list -->
          <div style="margin-top: 16px; font-size: 0.9rem; color: var(--text-muted);">
            ${s.goals && s.goals.length > 0 ? s.goals.map(g => `
              <div>⚽ ${g.scorerName} (${g.minute}')</div>
            `).join('') : '<div>Sin goles durante el encuentro</div>'}
          </div>
        </div>

        <!-- Detailed Match Stats -->
        <div class="card" style="margin-bottom: 24px;">
          <h3 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Estadísticas del Encuentro</h3>
          
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${this.renderStatBar('Posesión del Balón', `${s.homePossession || 50}%`, `${s.awayPossession || 50}%`, s.homePossession || 50)}
            ${this.renderStatBar('Disparos Totales', s.homeShots || 0, s.awayShots || 0)}
            ${this.renderStatBar('Disparos a Puerta', s.homeShotsOnTarget || 0, s.awayShotsOnTarget || 0)}
            ${this.renderStatBar('Pases Intentados', s.homePassesAttempted || 0, s.awayPassesAttempted || 0)}
            ${this.renderStatBar('Intercepciones', s.homeInterceptions || 0, s.awayInterceptions || 0)}
            ${this.renderStatBar('Paradas del Portero', s.homeSaves || 0, s.awaySaves || 0)}
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; justify-content: center; gap: 16px;">
          ${this.matchContext.isLeagueMatch ? `
            <button id="btnContinueLeague" class="btn btn-primary" style="padding: 14px 28px;">
              🏆 Volver a la Jornada de Liga
            </button>
          ` : (this.matchContext.isCupMatch ? `
            <button id="btnContinueCup" class="btn btn-primary" style="padding: 14px 28px;">
              🥇 Continuar Leyendas Cup
            </button>
          ` : `
            <button id="btnRematch" class="btn btn-primary" style="padding: 14px 28px;">
              🔄 Jugar Revancha
            </button>
          `)}
          <button id="btnReturn" class="btn" style="padding: 14px 28px;">
            🏠 Volver al Menú
          </button>
        </div>
      </div>
    `;
  }

  renderStatBar(label, homeVal, awayVal, barPercent = null) {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; margin-bottom: 4px;">
          <span>${homeVal}</span>
          <span style="color: var(--text-muted);">${label}</span>
          <span>${awayVal}</span>
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBackToMenu = container.querySelector('#btnBackToMenu');
    const btnReturn = container.querySelector('#btnReturn');
    const btnRematch = container.querySelector('#btnRematch');
    const btnContinueLeague = container.querySelector('#btnContinueLeague');
    const btnContinueCup = container.querySelector('#btnContinueCup');

    const goMenu = () => this.app.navigate('main-menu');
    btnBackToMenu?.addEventListener('click', goMenu);
    btnReturn?.addEventListener('click', goMenu);

    btnRematch?.addEventListener('click', () => {
      this.app.startMatch(this.matchContext.homeTeam, this.matchContext.awayTeam, this.matchContext);
    });

    btnContinueLeague?.addEventListener('click', () => {
      this.app.navigate('league');
    });

    btnContinueCup?.addEventListener('click', () => {
      this.app.navigate('tournament');
    });
  }
}
