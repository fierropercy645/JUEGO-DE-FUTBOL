import { distance, normalize } from '../utils/math.js';
import { DIFFICULTY, PITCH } from '../utils/constants.js';

export class PlayerAI {
  /**
   * IA Táctica con balance real de dificultad:
   * - FÁCIL: Menor velocidad de reacción, tiros suaves y marcas pasivas.
   * - NORMAL: Fútbol equilibrado, presión moderada y tiros bien calculados.
   * - DIFÍCIL: Marcaje asfixiante, anticipación, barridas y remates demoledores.
   */
  static update(player, ball, team, opponentTeam, pitchWidth, pitchHeight, difficulty = DIFFICULTY.NORMAL, executePassCb, executeShootCb) {
    if (player.position === 'GK') return;

    // Velocidades 1:1 basadas estrictamente en los atributos de velocidad del jugador
    let speedFactor = 1.0;
    let shootChance = 0.04;
    let pressDistance = 280;
    let passChance = 0.025;
    let slideChance = 0.02;
    let shootRange = 290;

    if (difficulty === DIFFICULTY.EASY) {
      speedFactor = 0.85; // Ligera ventaja para el usuario
      shootChance = 0.015;
      pressDistance = 180;
      passChance = 0.015;
    } else if (difficulty === DIFFICULTY.HARD) {
      speedFactor = 1.15; // Rival picante y competitivo
      shootChance = 0.07;
      pressDistance = 420;
      passChance = 0.04;
    }

    const hasBall = ball.owner === player;
    const teamHasBall = ball.owner && ball.owner.teamId === player.teamId;

    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;

    // 1. SI ESTE JUGADOR TIENE EL BALÓN:
    if (hasBall) {
      const oppGoalX = player.isHome ? fieldRight : fieldLeft;
      const oppGoalY = pitchHeight / 2;
      const distToGoal = distance(player.x, player.y, oppGoalX, oppGoalY);

      // Decisión de disparo inteligente de la IA si está en zona de ataque
      if (distToGoal < shootRange) {
        if (Math.random() < shootChance) {
          executeShootCb(player);
          return;
        }
      }

      // Si está mano a mano muy cerca del arco (< 140px), disparar con alta contundencia
      if (distToGoal < 150 && Math.random() < 0.12) {
        executeShootCb(player);
        return;
      }

      // Pase si hay compañero en mejor posición adelantada
      if (Math.random() < passChance) {
        const mates = team.players.filter(p => p !== player && p.position !== 'GK');
        const forwardMates = mates.filter(m => (player.isHome ? m.x > player.x : m.x < player.x));
        if (forwardMates.length > 0) {
          executePassCb(player);
          return;
        }
      }

      // Conducir enfilando hacia el arco rival con la misma base que el usuario
      const dirToGoal = normalize(oppGoalX - player.x, oppGoalY - player.y);
      const spd = (player.speed / 100) * 2.55 * speedFactor;
      player.vx = dirToGoal.x * spd;
      player.vy = dirToGoal.y * spd;
      player.facingX = dirToGoal.x;
      player.facingY = dirToGoal.y;
      return;
    }

    // 2. BUSCAR AL DEFENSOR MÁS CERCANO (O MÚLTIPLES EN DIFÍCIL)
    const outfieldTeammates = team.players.filter(p => p.position !== 'GK');
    let closestToBall = outfieldTeammates[0];
    let minBallDist = Infinity;
    outfieldTeammates.forEach(p => {
      const d = distance(p.x, p.y, ball.x, ball.y);
      if (d < minBallDist) {
        minBallDist = d;
        closestToBall = p;
      }
    });

    const isDesignatedPresser = (closestToBall === player) || (difficulty === DIFFICULTY.HARD && minBallDist < 250);

    if (isDesignatedPresser && !teamHasBall) {
      const distFromHome = distance(player.homeX, player.homeY, ball.x, ball.y);
      if (distFromHome < pressDistance || player.position === 'FWD' || difficulty === DIFFICULTY.HARD) {
        const dir = normalize(ball.x - player.x, ball.y - player.y);
        // Cuando persigue el balón usa sprint proporcional idéntico al usuario
        const spd = (player.speed / 100) * 2.85 * speedFactor;
        player.vx = dir.x * spd;
        player.vy = dir.y * spd;
        player.facingX = dir.x;
        player.facingY = dir.y;
        return;
      }
    }

    // 3. MOVIMIENTO TÁCTICO COLECTIVO CON HISTÉRESIS (EVITA TEMBLORES)
    let targetX = player.homeX;
    let targetY = player.homeY;

    // Reducir la oscilación por movimiento continuo del balón
    const ballOffsetFactorY = player.position === 'DEF' ? 0.20 : 0.35;
    const shiftY = (ball.y - pitchHeight / 2) * ballOffsetFactorY;
    targetY = player.homeY + shiftY;

    if (teamHasBall) {
      if (player.position === 'DEF') {
        targetX = player.isHome ? player.homeX + 70 : player.homeX - 70;
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX + 110 : player.homeX - 110;
      } else if (player.position === 'FWD') {
        targetX = player.isHome ? Math.min(fieldRight - 60, player.homeX + 130) : Math.max(fieldLeft + 60, player.homeX - 130);
      }
    } else {
      if (player.position === 'DEF') {
        targetX = player.isHome ? Math.max(fieldLeft + 50, player.homeX - 30) : Math.min(fieldRight - 50, player.homeX + 30);
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX - 50 : player.homeX + 50;
      } else if (player.position === 'FWD') {
        targetX = player.homeX;
      }
    }

    const distToTarget = distance(player.x, player.y, targetX, targetY);
    // Zona muerta amplia para que el jugador se quede firme y tranquilo en su posición
    if (distToTarget > 32) {
      const dir = normalize(targetX - player.x, targetY - player.y);
      const spd = (player.speed / 100) * 2.2 * speedFactor;
      player.vx = dir.x * spd;
      player.vy = dir.y * spd;
      player.facingX = dir.x;
      player.facingY = dir.y;
    } else {
      // Frenado suave hacia cero sin sacudidas
      player.vx *= 0.5;
      player.vy *= 0.5;
      if (Math.hypot(player.vx, player.vy) < 0.1) {
        player.vx = 0;
        player.vy = 0;
      }
      player.facingX = player.isHome ? 1 : -1;
      player.facingY = 0;
    }
  }
}
