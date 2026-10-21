import { PITCH, GAME_STATES } from '../utils/constants.js';

export class MatchRules {
  /**
   * REGLA 10: EL GOL MARCADO
   * Se habrá marcado un gol cuando el balón haya cruzado completamente la línea de meta
   * entre los postes del arco.
   */
  static checkGoal(ball, pitchWidth = PITCH.WIDTH, pitchHeight = PITCH.HEIGHT, goalWidth = PITCH.GOAL_WIDTH) {
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const goalTop = (pitchHeight - goalWidth) / 2;
    const goalBottom = (pitchHeight + goalWidth) / 2;

    const isWithinGoalHeight = ball.y >= goalTop && ball.y <= goalBottom;

    if (isWithinGoalHeight) {
      if (ball.x + ball.radius < fieldLeft) {
        return 'away';
      }
      if (ball.x - ball.radius > fieldRight) {
        return 'home';
      }
    }

    return null;
  }

  /**
   * REGLAS 9, 15, 16 Y 17: BALÓN FUERA DEL TERRENO DE JUEGO
   * Detecta con precisión cuándo el balón cruza completamente las líneas laterales
   * superior, inferior o de fondo para pitar los saques de banda, meta o córner.
   */
  static checkOutOfBounds(ball, pitchWidth = PITCH.WIDTH, pitchHeight = PITCH.HEIGHT, goalWidth = PITCH.GOAL_WIDTH) {
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const goalTop = (pitchHeight - goalWidth) / 2;
    const goalBottom = (pitchHeight + goalWidth) / 2;

    // 1. REGLA 15: SAQUE DE BANDA (Línea lateral superior y lateral inferior)
    // El balón sale completamente del rectángulo de juego por las bandas
    if (ball.y - ball.radius <= 4) {
      return {
        type: GAME_STATES.THROW_IN,
        x: Math.max(fieldLeft + 25, Math.min(fieldRight - 25, ball.x)),
        y: 12,
        awardedTeam: ball.lastTouchedTeamId,
      };
    }
    if (ball.y + ball.radius >= pitchHeight - 4) {
      return {
        type: GAME_STATES.THROW_IN,
        x: Math.max(fieldLeft + 25, Math.min(fieldRight - 25, ball.x)),
        y: pitchHeight - 12,
        awardedTeam: ball.lastTouchedTeamId,
      };
    }

    // 2. LÍNEAS DE FONDO (Fuera de la portería)
    // Línea de fondo izquierda
    if (ball.x - ball.radius <= fieldLeft && (ball.y < goalTop || ball.y > goalBottom)) {
      const lastTeamWasHome = ball.lastTouchedPlayer?.isHome;
      if (lastTeamWasHome) {
        return {
          type: GAME_STATES.CORNER_KICK,
          side: 'left',
          cornerY: ball.y < pitchHeight / 2 ? 14 : pitchHeight - 14,
          cornerX: fieldLeft + 6,
          awardedSide: 'away',
        };
      } else {
        return {
          type: GAME_STATES.GOAL_KICK,
          side: 'left',
          x: fieldLeft + 70,
          y: pitchHeight / 2,
          awardedSide: 'home',
        };
      }
    }

    // Línea de fondo derecha
    if (ball.x + ball.radius >= fieldRight && (ball.y < goalTop || ball.y > goalBottom)) {
      const lastTeamWasHome = ball.lastTouchedPlayer?.isHome;
      if (lastTeamWasHome) {
        return {
          type: GAME_STATES.GOAL_KICK,
          side: 'right',
          x: fieldRight - 70,
          y: pitchHeight / 2,
          awardedSide: 'away',
        };
      } else {
        return {
          type: GAME_STATES.CORNER_KICK,
          side: 'right',
          cornerY: ball.y < pitchHeight / 2 ? 14 : pitchHeight - 14,
          cornerX: fieldRight - 6,
          awardedSide: 'home',
        };
      }
    }

    return null;
  }
}
