import { distance, normalize } from '../utils/math.js';
import { DIFFICULTY, PITCH } from '../utils/constants.js';

export class GoalkeeperAI {
  /**
   * IA Especializada del Arquero:
   * 1. Posicionamiento dinámico achicando ángulos de tiro.
   * 2. Recibe y tapa el balón.
   * 3. Tras atajar, despeja/envía el balón con un saque largo hacia sus compañeros de campo.
   */
  static update(gk, ball, pitchWidth, pitchHeight, difficulty = DIFFICULTY.NORMAL, executePassCb, dt = 0.016) {
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

    // SI EL ARQUERO TIENE EL BALÓN (LO RECIBIÓ O ATRAPÓ TRAS ATAJAR):
    if (ball.owner === gk) {
      if (gk.gkHoldTimer === undefined || gk.gkHoldTimer === null) {
        gk.gkHoldTimer = 1.1;
      }
      gk.gkHoldTimer -= dt;

      // El arquero se asegura el balón con ambas manos sin moverse
      gk.vx = 0;
      gk.vy = 0;

      // Mantener el balón seguro bien pegado al arquero
      ball.x = gk.x + (isHome ? 12 : -12);
      ball.y = gk.y;
      ball.vx = 0;
      ball.vy = 0;

      if (gk.gkHoldTimer <= 0) {
        gk.gkHoldTimer = null;
        // DISPARAR / ENVIAR EL BALÓN CON UN DESPEJE FUERTE Y PRECISO HACIA EL CAMPO RIVAL
        const kickDirX = isHome ? 1 : -1;
        const kickDirY = (Math.random() - 0.5) * 0.35;
        const sendPower = 13.5 + (gk.shotPower / 100) * 3.5; // Saque largo

        gk.triggerShootAnimation();
        ball.kick(kickDirX * sendPower, kickDirY * sendPower, gk, {
          altitude: 9.0,
          verticalVelocity: 5.5,
        });
        gk.kickCooldown = 0.6;
      }
      return;
    }

    // Altura del arquero siguiendo el balón con zona muerta
    const minY = goalY - 50;
    const maxY = goalY + 50;
    const clampedBallY = Math.max(minY, Math.min(maxY, ball.y));
    const targetY = (Math.abs(clampedBallY - gk.y) > 16) ? clampedBallY : gk.y;

    // El arquero cubre activamente la trayectoria del balón y achica con inteligencia
    let targetX = goalX;
    const distToBall = distance(gk.x, gk.y, ball.x, ball.y);
    const inPenaltyZone = isHome
      ? (ball.x > fieldLeft && ball.x < fieldLeft + 160)
      : (ball.x < fieldRight && ball.x > fieldRight - 160);

    if (inPenaltyZone && distToBall < 110 && !ball.owner) {
      targetX = isHome ? goalX + 35 : goalX - 35;
    }

    const dir = normalize(targetX - gk.x, targetY - gk.y);
    const moveDist = distance(gk.x, gk.y, targetX, targetY);

    // ACTIVACIÓN DE VUELO / ESTIRADA / DIVE:
    // Si el balón viene disparado con velocidad hacia el arco
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    const isHeadingToGK = isHome ? ball.vx < -2.5 : ball.vx > 2.5;
    if (isHeadingToGK && distToBall < 160 && !gk.isDiving) {
      const diffY = ball.y - gk.y;
      if (Math.abs(diffY) > 12) {
        gk.triggerDive(diffY > 0 ? 1 : -1, 0.65);
      }
    }

    if (moveDist > 6) {
      const spd = (gk.speed / 100) * 3.1 * speedFactor;
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
