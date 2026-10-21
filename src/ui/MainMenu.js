export class MainMenu {
  constructor(app) {
    this.app = app;
  }

  render() {
    const hasLeague = this.app.hasSavedLeague();

    return `
      <div class="screen" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at 50% 30%, #17243c 0%, #0b0f19 70%);">
        <div style="margin-bottom: 40px;">
          <h1 style="font-size: 3.5rem; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
            FOOTBALL <span style="color: var(--accent-green);">LEGENDS</span>
          </h1>
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-top: 8px;">
            Simulador de Fútbol 2D & Competición de Liga
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
          <button id="btnQuickMatch" class="btn btn-primary" style="padding: 16px; font-size: 1.1rem;">
            ⚽ Partido Rápido
          </button>
          
          ${hasLeague ? `
            <button id="btnContinueLeague" class="btn" style="border-color: var(--accent-gold); color: var(--accent-gold); padding: 16px; font-size: 1.1rem;">
              🏆 Continuar Liga
            </button>
          ` : ''}

          <button id="btnNewLeague" class="btn" style="padding: 14px;">
            🏆 ${hasLeague ? 'Nueva Liga' : 'Modo Liga'}
          </button>

          <button id="btnTeams" class="btn" style="padding: 14px;">
            🛡️ Equipos y Plantillas
          </button>

          <button id="btnStats" class="btn" style="padding: 14px;">
            📊 Estadísticas
          </button>

          <button id="btnSettings" class="btn" style="padding: 14px;">
            ⚙️ Configuración
          </button>
        </div>

        <div style="position: absolute; bottom: 20px; color: var(--text-muted); font-size: 0.85rem;">
          Versión 1.0.0 Web Edition • Modular & Determinista
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
  }
}
