import { SaveManager } from '../persistence/SaveManager.js';
import { DIFFICULTY } from '../utils/constants.js';

export class SettingsScreen {
  constructor(app) {
    this.app = app;
    this.settings = this.app.getSettings();
  }

  render() {
    return `
      <div class="screen" style="max-width: 700px; margin: 0 auto; width: 100%;">
        <div class="screen-header">
          <div class="screen-title">Configuración del Juego</div>
          <button id="btnBackToMenu" class="btn btn-secondary">Menú Principal</button>
        </div>

        <div class="card" style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Match Duration -->
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 8px;">
              Duración del Partido (Minutos en tiempo real)
            </label>
            <select id="selectDuration" class="btn" style="width: 100%; text-align: left;">
              <option value="1" ${this.settings.matchDurationMinutes === 1 ? 'selected' : ''}>1 minuto (Demostración exprés)</option>
              <option value="2" ${this.settings.matchDurationMinutes === 2 ? 'selected' : ''}>2 minutos (Rápido)</option>
              <option value="3" ${this.settings.matchDurationMinutes === 3 ? 'selected' : ''}>3 minutos (Equilibrado / Recomendado)</option>
              <option value="5" ${this.settings.matchDurationMinutes === 5 ? 'selected' : ''}>5 minutos (Estándar)</option>
            </select>
          </div>

          <!-- Difficulty -->
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 8px;">
              Nivel de Dificultad de la IA
            </label>
            <select id="selectDifficulty" class="btn" style="width: 100%; text-align: left;">
              <option value="${DIFFICULTY.EASY}" ${this.settings.difficulty === DIFFICULTY.EASY ? 'selected' : ''}>Fácil (Menor presión rival y portero tolerante)</option>
              <option value="${DIFFICULTY.NORMAL}" ${this.settings.difficulty === DIFFICULTY.NORMAL ? 'selected' : ''}>Normal (Comportamiento equilibrado)</option>
              <option value="${DIFFICULTY.HARD}" ${this.settings.difficulty === DIFFICULTY.HARD ? 'selected' : ''}>Difícil (Presión intensa y alta precisión)</option>
            </select>
          </div>

          <!-- Controls hint -->
          <div>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="checkHints" ${this.settings.showControlsHelp ? 'checked' : ''} style="width: 18px; height: 18px;">
              <span style="font-weight: 600;">Mostrar barra de atajos de control durante el partido</span>
            </label>
          </div>

          <!-- Save Notification -->
          <div id="saveFeedback" style="color: var(--accent-green); font-weight: bold; font-size: 0.9rem; min-height: 20px;"></div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
            <button id="btnSaveSettings" class="btn btn-primary" style="padding: 12px 32px;">
              Guardar Preferencias
            </button>
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    const btnBackToMenu = container.querySelector('#btnBackToMenu');
    const btnSave = container.querySelector('#btnSaveSettings');
    const selectDuration = container.querySelector('#selectDuration');
    const selectDifficulty = container.querySelector('#selectDifficulty');
    const checkHints = container.querySelector('#checkHints');
    const feedback = container.querySelector('#saveFeedback');

    btnBackToMenu?.addEventListener('click', () => {
      this.app.navigate('main-menu');
    });

    btnSave?.addEventListener('click', () => {
      const newSettings = {
        ...this.settings,
        matchDurationMinutes: parseInt(selectDuration.value, 10),
        difficulty: selectDifficulty.value,
        showControlsHelp: checkHints.checked,
      };

      SaveManager.saveSettings(newSettings);
      this.app.updateSettings(newSettings);

      if (feedback) {
        feedback.textContent = '✓ Configuración guardada correctamente en LocalStorage.';
        setTimeout(() => {
          if (feedback) feedback.textContent = '';
        }, 3000);
      }
    });
  }
}
