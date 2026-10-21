export class MainMenu {
  constructor(app) {
    this.app = app;
  }

  render() {
    const hasLeague = this.app.hasSavedLeague();

    return `
      <div class="screen main-cover-screen">
        <!-- Luces y Efectos de Estadio de Fondo -->
        <div class="stadium-spotlights"></div>
        <div class="stadium-crowd-silhouette"></div>

        <div class="cover-content">
          <!-- Insignia / Badge de torneo -->
          <div class="cover-badge">
            <span class="badge-icon">⚽</span>
            <span class="badge-text">COPA DE LEYENDAS 2026 • ARCADE PRO</span>
            <span class="badge-icon">⭐</span>
          </div>

          <!-- Título Portada 3D Impactante -->
          <div class="cover-title-container">
            <h1 class="cover-title-main">
              FOOTBALL
              <span class="cover-title-glow">LEGENDS</span>
            </h1>
            <div class="cover-subtitle">
              EL SIMULADOR DE FÚTBOL DEFINITIVO • GOLAZOS, VASELINAS Y PENALES
            </div>
          </div>

          <!-- Puntos destacados / Features de Portada -->
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
            <span>Desarrollado con HTML5 Canvas • Sonido y Físicas en Tiempo Real</span>
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
  }
}
