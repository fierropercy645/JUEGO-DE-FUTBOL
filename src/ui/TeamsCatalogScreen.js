import { DEFAULT_TEAMS } from '../data/teams.js';

export class TeamsCatalogScreen {
  constructor(app) {
    this.app = app;
    this.teams = DEFAULT_TEAMS;
    this.selectedTeamIndex = 0;
  }

  render() {
    const team = this.teams[this.selectedTeamIndex];

    return `
      <div class="screen" style="max-width: 1100px; margin: 0 auto; width: 100%;">
        <div class="screen-header">
          <div class="screen-title">Catálogo de Equipos y Plantillas</div>
          <button id="btnBackToMenu" class="btn btn-secondary">Menú Principal</button>
        </div>

        <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start;">
          <!-- Team List -->
          <div class="card" style="padding: 16px;">
            <h4 style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 12px;">Clubes Oficiales</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${this.teams.map((t, idx) => `
                <div class="team-list-item ${idx === this.selectedTeamIndex ? 'active' : ''}" data-idx="${idx}" style="padding: 10px 14px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: ${idx === this.selectedTeamIndex ? 'var(--bg-card-hover)' : 'transparent'}; border: 1px solid ${idx === this.selectedTeamIndex ? 'var(--accent-green)' : 'transparent'};">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${t.primaryColor};"></span>
                    <span style="font-weight: 600;">${t.name}</span>
                  </div>
                  <span style="font-weight: 800; font-size: 0.85rem; color: var(--accent-gold);">${t.overall}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Team Details & Roster -->
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
              <div>
                <h2 style="font-size: 1.6rem; font-weight: 800;">${team.name}</h2>
                <div style="color: var(--text-muted); font-size: 0.9rem;">Formación base: ${team.formation}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 2rem; font-weight: 900; color: var(--accent-gold);">${team.overall}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">VALORACIÓN GENERAL</div>
              </div>
            </div>

            <!-- Team Attributes -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
              <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8rem; color: var(--text-muted);">Ataque</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444;">${team.attack}</div>
              </div>
              <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8rem; color: var(--text-muted);">Defensa</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #3b82f6;">${team.defense}</div>
              </div>
              <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.8rem; color: var(--text-muted);">Velocidad</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #10b981;">${team.speed}</div>
              </div>
            </div>

            <!-- Players Table -->
            <h4 style="margin-bottom: 12px; font-size: 1rem;">Plantilla de Jugadores (5 Titulares)</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Dorsal</th>
                  <th>Nombre</th>
                  <th>Pos</th>
                  <th>OVR</th>
                  <th>VEL</th>
                  <th>PAS</th>
                  <th>TIR</th>
                  <th>DEF</th>
                  <th>CTR</th>
                </tr>
              </thead>
              <tbody>
                ${team.players.map(p => `
                  <tr>
                    <td style="font-weight: 800; color: var(--accent-gold);">#${p.number}</td>
                    <td style="font-weight: 600;">${p.name}</td>
                    <td><span class="table-badge" style="background: var(--bg-card);">${p.position}</span></td>
                    <td style="font-weight: 800;">${p.overall}</td>
                    <td>${p.speed}</td>
                    <td>${p.pass}</td>
                    <td>${p.shotPower}</td>
                    <td>${p.defense}</td>
                    <td>${p.ballControl}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBack = container.querySelector('#btnBackToMenu');
    btnBack?.addEventListener('click', () => {
      this.app.navigate('main-menu');
    });

    const items = container.querySelectorAll('.team-list-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedTeamIndex = parseInt(item.dataset.idx, 10);
        this.app.renderCurrentScreen();
      });
    });
  }
}
