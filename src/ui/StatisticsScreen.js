import { SaveManager } from '../persistence/SaveManager.js';

export class StatisticsScreen {
  constructor(app) {
    this.app = app;
    this.history = SaveManager.getStatsHistory();
  }

  render() {
    let totalMatches = this.history.length;
    let totalGoals = 0;
    let totalShots = 0;

    this.history.forEach(m => {
      totalGoals += (m.homeGoals || 0) + (m.awayGoals || 0);
      totalShots += (m.homeShots || 0) + (m.awayShots || 0);
    });

    const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : 0;

    return `
      <div class="screen" style="max-width: 1000px; margin: 0 auto; width: 100%;">
        <div class="screen-header">
          <div class="screen-title">Estadísticas e Historial</div>
          <div style="display: flex; gap: 12px;">
            ${totalMatches > 0 ? `<button id="btnClearStats" class="btn btn-danger" style="padding: 8px 16px; font-size: 0.85rem;">Borrar Historial</button>` : ''}
            <button id="btnBackToMenu" class="btn btn-secondary">Menú Principal</button>
          </div>
        </div>

        <!-- Global Summary -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Partidos Registrados</div>
            <div style="font-size: 2rem; font-weight: 800; color: #fff;">${totalMatches}</div>
          </div>
          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Goles Anotados</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--accent-green);">${totalGoals}</div>
          </div>
          <div class="card" style="text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Promedio Goles / Partido</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--accent-gold);">${avgGoals}</div>
          </div>
        </div>

        <!-- Match History Table -->
        <div class="card">
          <h3 style="margin-bottom: 16px; font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            Historial de Encuentros Recientes
          </h3>

          ${totalMatches === 0 ? `
            <div style="text-align: center; color: var(--text-muted); padding: 32px;">
              Aún no se han disputado partidos. ¡Juega un partido rápido o compite en la liga para registrar estadísticas!
            </div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Local</th>
                  <th style="text-align: center;">Resultado</th>
                  <th>Visitante</th>
                  <th>Tiros (L / V)</th>
                  <th>Posesión</th>
                </tr>
              </thead>
              <tbody>
                ${this.history.map(m => {
                  const d = new Date(m.date);
                  const dateStr = !isNaN(d.getTime()) ? `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Reciente';
                  return `
                    <tr>
                      <td style="font-size: 0.85rem; color: var(--text-muted);">${dateStr}</td>
                      <td style="font-weight: 600;">${m.homeTeamName}</td>
                      <td style="text-align: center; font-weight: 800; color: var(--accent-gold);">
                        ${m.homeGoals} - ${m.awayGoals}
                      </td>
                      <td style="font-weight: 600;">${m.awayTeamName}</td>
                      <td>${m.homeShots || 0} - ${m.awayShots || 0}</td>
                      <td>${m.homePossession || 50}% / ${m.awayPossession || 50}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBackToMenu = container.querySelector('#btnBackToMenu');
    const btnClearStats = container.querySelector('#btnClearStats');

    btnBackToMenu?.addEventListener('click', () => {
      this.app.navigate('main-menu');
    });

    btnClearStats?.addEventListener('click', () => {
      if (confirm('¿Deseas eliminar todo el historial de partidos guardado?')) {
        SaveManager.clearStatsHistory();
        this.app.renderCurrentScreen();
      }
    });
  }
}
