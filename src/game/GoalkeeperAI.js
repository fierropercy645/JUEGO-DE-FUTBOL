import { distance, normalize } from '../utils/math.js';
import { DIFFICULTY, PITCH } from '../utils/constants.js';

export class GoalkeeperAI {
  /**
   * IA Especializada del Arquero:
   * 1. Posicionamiento dinámico achicando ángulos de tiro.
   * 2. Recibe y tapa el balón.
   * 3. Tras atajar, despeja/envía el balón con un saque largo hacia sus compañeros de campo.
   */
  static update(gk, ball, pitchWidth, pitchHeight, difficulty = DIFFICULTY.NORMAL, executePassCb) {
    const isHome = gk.isHome;
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const goalX = isHome ? fieldLeft + 15 : fieldRight - 15;
    const goalY = pitchHeight / 2;

    let speedFactor = 0.85;
    if (difficulty === DIFFICULTY.EASY) {
      speedFactor = 0.45; // El arquero fácil es lento y concede muchos goles
    } else if (difficulty === DIFFICULTY.HARD) {
      speedFactor = 1.15; // Ágil pero humano
    }

    // SI EL ARQUERO TIENE EL BALÓN (LO RECIBIÓ O TIENTA TRAS ATAJAR):
    if (ball.owner === gk) {
      if (!gk.gkHoldTimer) gk.gkHoldTimer = 1.0;
      gk.gkHoldTimer -= 0.016; // Aproximadamente 60fps dt

      // Detenerse un breve momento para afianzar el agarre y luego enviar el balón
      gk.vx = 0;
      gk.vy = 0;

      if (gk.gkHoldTimer <= 0) {
        gk.gkHoldTimer = null;
        // Enviar el balón con potencia hacia el campo rival
        const kickDirX = isHome ? 1 : -1;
        const kickDirY = (Math.random() - 0.5) * 0.4;
        const sendPower = 11.0 + (gk.shotPower / 100) * 3.0; // Despeje largo

        ball.kick(kickDirX * sendPower, kickDirY * sendPower, gk);
        gk.kickCooldown = 0.8;
      }
      return;
    }

    // Altura del arquero siguiendo el balón con zona muerta
    const minY = goalY - 50;
    const maxY = goalY + 50;
    const clampedBallY = Math.max(minY, Math.min(maxY, ball.y));
    const targetY = (Math.abs(clampedBallY - gk.y) > 16) ? clampedBallY : gk.y;

    // El arquero se mantiene en su línea de gol; solo achica moderadamente si el balón entra a su área chica
    let targetX = goalX;
    const distToBall = distance(gk.x, gk.y, ball.x, ball.y);
    const inPenaltyZone = isHome
      ? (ball.x > fieldLeft && ball.x < fieldLeft + 120)
      : (ball.x < fieldRight && ball.x > fieldRight - 120);

    if (inPenaltyZone && distToBall < 70 && !ball.owner) {
      targetX = isHome ? goalX + 25 : goalX - 25;
    }

    const dir = normalize(targetX - gk.x, targetY - gk.y);
    const moveDist = distance(gk.x, gk.y, targetX, targetY);

    // ACTIVACIÓN DE VUELO / ESTIRADA / DIVE:
    // Si el balón viene disparado con velocidad hacia el arco
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    const isHeadingToGK = isHome ? ball.vx < -4.0 : ball.vx > 4.0;
    if (isHeadingToGK && distToBall < 130 && !gk.isDiving) {
      const diffY = ball.y - gk.y;
      if (Math.abs(diffY) > 18) {
        gk.triggerDive(diffY > 0 ? 1 : -1, 0.60);
      }
    }

    if (moveDist > 12) {
      const spd = (gk.speed / 100) * 2.8 * speedFactor;
      gk.vx = dir.x * spd;
      gk.vy = dir.y * spd;
      gk.facingX = isHome ? 1 : -1;
      gk.facingY = dir.y;
    } else {
      gk.vx = 0;
      gk.vy = 0;
      gk.facingX = isHome ? 1 : -1;
      gk.facingY = 0;
    }
  }
}
