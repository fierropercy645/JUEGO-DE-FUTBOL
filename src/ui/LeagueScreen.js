export class LeagueScreen {
  constructor(app) {
    this.app = app;
    this.league = this.app.getLeague();
  }

  render() {
    if (!this.league) {
      return `
        <div class="screen" style="align-items: center; justify-content: center; text-align: center;">
          <h2>No hay ninguna competición de liga activa</h2>
          <p style="color: var(--text-muted); margin: 12px 0 24px;">Inicia una nueva temporada desde el menú principal.</p>
          <button id="btnGoHome" class="btn btn-primary">Volver al Menú</button>
        </div>
      `;
    }

    const standings = this.league.getStandings();
    const currentMatches = this.league.getCurrentRoundMatches();
    const userMatch = this.league.getUserMatchForCurrentRound();
    const userTeam = this.league.teams.find(t => t.id === this.league.userTeamId);

    const isChampion = this.league.completed && standings.length > 0 && standings[0].teamId === this.league.userTeamId;
    const championTeam = standings.length > 0 ? this.league.teams.find(t => t.id === standings[0].teamId) : null;

    return `
      <div class="screen" style="max-width: 1200px; margin: 0 auto; width: 100%; position: relative;">
        <!-- Modal / Celebración de Campeón de la Liga -->
        ${isChampion ? `
          <div class="champion-modal-overlay">
            <div class="confetti-container">
              ${Array.from({ length: 40 }).map((_, i) => `
                <div class="confetti" style="
                  left: ${Math.random() * 100}%;
                  animation-delay: ${Math.random() * 2}s;
                  background-color: ${['#ffd700', '#10b981', '#3b82f6', '#ef4444', '#ec4899', '#ffffff'][i % 6]};
                "></div>
              `).join('')}
            </div>

            <div class="champion-card">
              <div class="trophy-glow-wrapper">
                <div class="trophy-glow"></div>
                <div class="trophy-emoji">🏆</div>
              </div>

              <div class="champion-badge">⭐ ¡¡¡SOMOS CAMPEONES!!! ⭐</div>
              <h1 class="champion-title">¡¡GANAMOS, GANAMOS!!</h1>
              <p class="champion-subtitle">
                ¡Felicidades! <strong>${userTeam ? userTeam.name.toUpperCase() : 'TU CLUB'}</strong> se ha coronado como el Máximo Campeón de la <strong>${this.league.name}</strong>.
              </p>

              <div class="champion-stats-row">
                <div class="champ-stat-box">
                  <span class="champ-stat-val">${standings[0].pts}</span>
                  <span class="champ-stat-lbl">PUNTOS</span>
                </div>
                <div class="champ-stat-box">
                  <span class="champ-stat-val">${standings[0].pg}</span>
                  <span class="champ-stat-lbl">VICTORIAS</span>
                </div>
                <div class="champ-stat-box">
                  <span class="champ-stat-val">${standings[0].gf}</span>
                  <span class="champ-stat-lbl">GOLES</span>
                </div>
              </div>

              <div class="champion-actions">
                <button id="btnCloseCelebration" class="btn btn-primary" style="padding: 16px 36px; font-size: 1rem; box-shadow: 0 0 25px rgba(245, 158, 11, 0.6);">
                  🎉 ¡VIVA EL CAMPEÓN! Ver Tabla
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="screen-header">
          <div>
            <div class="screen-title">${this.league.name}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px;">
              Tu club: <strong style="color: var(--accent-gold);">${userTeam ? userTeam.name : 'N/A'}</strong> • Jornada ${this.league.currentRound} de ${this.league.rounds.length}
              ${this.league.completed ? (isChampion ? ' • <span style="color: #ffd700; font-weight: bold;">👑 ¡ERES EL CAMPEÓN! 🏆</span>' : ' • <span style="color: #10b981; font-weight: bold;">TEMPORADA FINALIZADA</span>') : ''}
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="btnResetLeague" class="btn btn-danger" style="padding: 8px 16px; font-size: 0.85rem;">Reiniciar Temporada</button>
            <button id="btnBackToMenu" class="btn btn-secondary">Menú Principal</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start;">
          <!-- Left Column: Standings Table -->
          <div class="card">
            <h3 style="margin-bottom: 16px; font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              📊 Tabla de Posiciones
            </h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Club</th>
                  <th>PJ</th>
                  <th>PG</th>
                  <th>PE</th>
                  <th>PP</th>
                  <th>GF</th>
                  <th>GC</th>
                  <th>DG</th>
                  <th style="color: #fff;">PTS</th>
                </tr>
              </thead>
              <tbody>
                ${standings.map((st, idx) => {
                  const isUser = st.teamId === this.league.userTeamId;
                  return `
                    <tr style="${isUser ? 'background: rgba(245, 158, 11, 0.12); font-weight: bold;' : ''}">
                      <td>${idx + 1}</td>
                      <td>
                        ${st.teamName} ${isUser ? '<span class="table-badge badge-user">TÚ</span>' : ''}
                      </td>
                      <td>${st.pj}</td>
                      <td>${st.pg}</td>
                      <td>${st.pe}</td>
                      <td>${st.pp}</td>
                      <td>${st.gf}</td>
                      <td>${st.gc}</td>
                      <td>${st.dg > 0 ? `+${st.dg}` : st.dg}</td>
                      <td style="color: var(--accent-gold); font-weight: 800;">${st.pts}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Right Column: Current Round Fixtures -->
          <div class="card">
            <h3 style="margin-bottom: 16px; font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              📅 Jornada ${this.league.currentRound}
            </h3>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
              ${currentMatches.map(m => {
                const home = this.league.teams.find(t => t.id === m.homeTeamId);
                const away = this.league.teams.find(t => t.id === m.awayTeamId);
                const isUserMatch = m.homeTeamId === this.league.userTeamId || m.awayTeamId === this.league.userTeamId;

                return `
                  <div style="background: var(--bg-card); padding: 12px 16px; border-radius: 8px; border: 1px solid ${isUserMatch ? 'var(--accent-gold)' : 'var(--border-color)'}; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1; text-align: right; font-weight: ${m.homeTeamId === this.league.userTeamId ? 'bold' : 'normal'};">
                      ${home ? home.name : m.homeTeamId}
                    </div>

                    <div style="margin: 0 16px; font-weight: 800; background: #0b0f19; padding: 4px 12px; border-radius: 4px; border: 1px solid var(--border-color);">
                      ${m.played ? `${m.homeGoals} - ${m.awayGoals}` : 'VS'}
                    </div>

                    <div style="flex: 1; text-align: left; font-weight: ${m.awayTeamId === this.league.userTeamId ? 'bold' : 'normal'};">
                      ${away ? away.name : m.awayTeamId}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Match Actions -->
            ${!this.league.completed ? `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${userMatch && !userMatch.played ? `
                  <button id="btnPlayMatch" class="btn btn-primary" style="padding: 14px;">
                    ⚽ Jugar Partido de la Jornada
                  </button>
                ` : ''}

                <button id="btnSimulateRound" class="btn" style="padding: 12px;">
                  ⚡ Simular Resto de la Jornada
                </button>
              </div>
            ` : `
              <div style="text-align: center; color: var(--accent-gold); font-weight: bold; padding: 16px; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--accent-gold); border-radius: 8px;">
                ${isChampion ? '🏆 ¡ERES EL CAMPEÓN DE LA LIGA! Disfruta la gloria del título.' : `🏆 Temporada finalizada. Campeón: ${championTeam ? championTeam.name : 'N/A'}`}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBackToMenu = container.querySelector('#btnBackToMenu');
    const btnGoHome = container.querySelector('#btnGoHome');
    const btnPlayMatch = container.querySelector('#btnPlayMatch');
    const btnSimulateRound = container.querySelector('#btnSimulateRound');
    const btnResetLeague = container.querySelector('#btnResetLeague');
    const btnCloseCelebration = container.querySelector('#btnCloseCelebration');

    btnCloseCelebration?.addEventListener('click', () => {
      const modal = container.querySelector('.champion-modal-overlay');
      if (modal) modal.style.display = 'none';
    });

    const goHome = () => this.app.navigate('main-menu');
    btnBackToMenu?.addEventListener('click', goHome);
    btnGoHome?.addEventListener('click', goHome);

    btnPlayMatch?.addEventListener('click', () => {
      const userMatch = this.league.getUserMatchForCurrentRound();
      if (!userMatch) return;
      const homeTeam = this.league.teams.find(t => t.id === userMatch.homeTeamId);
      const awayTeam = this.league.teams.find(t => t.id === userMatch.awayTeamId);

      this.app.startMatch(homeTeam, awayTeam, {
        isLeagueMatch: true,
        matchId: userMatch.id,
      });
    });

    btnSimulateRound?.addEventListener('click', () => {
      this.league.simulatePendingMatchesInCurrentRound();
      this.app.saveLeagueState();
      this.app.renderCurrentScreen();
    });

    btnResetLeague?.addEventListener('click', () => {
      if (confirm('¿Estás seguro de reiniciar la liga? Se perderá todo el calendario y progreso actual.')) {
        this.app.clearLeague();
        this.app.navigate('main-menu');
      }
    });
  }
}
