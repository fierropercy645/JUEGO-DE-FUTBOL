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

    // Velocidades 1:1 basadas estrictamente en los atributos del jugador en TODOS los modos
    // El orden táctico, la marca individual y la cobertura de zona aplican de manera uniforme
    let speedFactor = 1.0;
    let shootChance = 0.045;
    let passChance = 0.045;
    let shootRange = 260;

    if (difficulty === DIFFICULTY.EASY) {
      speedFactor = 0.95; // Competitivo y divertido sin efecto enjambre
      shootChance = 0.035;
      passChance = 0.035;
    } else if (difficulty === DIFFICULTY.HARD) {
      speedFactor = 1.05; // Marcaje estricto y buen criterio
      shootChance = 0.06;
      passChance = 0.055;
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

    // 2. ASIGNACIÓN TÁCTICA DEFENSIVA PROFESIONAL (CERO EFECTO ENJAMBRE / MONTÓN)
    // Solo UN jugador asignado presiona directamente al poseedor del balón.
    // Los demás defienden sus zonas, cierran líneas de pase o marcan a los receptores.
    const outfieldTeammates = team.players.filter(p => p.position !== 'GK');
    let singlePresser = outfieldTeammates[0];
    let minBallDist = Infinity;
    outfieldTeammates.forEach(p => {
      const d = distance(p.x, p.y, ball.x, ball.y);
      if (d < minBallDist) {
        minBallDist = d;
        singlePresser = p;
      }
    });

    const isDesignatedPresser = (singlePresser === player);

    // Solo el jugador asignado va activamente a presionar si el rival tiene el balón
    if (isDesignatedPresser && !teamHasBall) {
      const distFromHome = distance(player.homeX, player.homeY, ball.x, ball.y);
      // El defensor no abandona su retaguardia si el balón está lejos; el medio o delantero presiona
      const maxAllowedPursuit = player.position === 'DEF' ? 190 : 340;

      if (distFromHome < maxAllowedPursuit) {
        let dir = normalize(ball.x - player.x, ball.y - player.y);

        // Desvío anticolisión: Si hay un compañero muy pegado en la misma trayectoria, rodearlo
        const nearbyTeammate = outfieldTeammates.find(m => m !== player && distance(m.x, m.y, player.x, player.y) < 28);
        if (nearbyTeammate) {
          const sideX = -(nearbyTeammate.y - player.y);
          const sideY = (nearbyTeammate.x - player.x);
          const sideDir = normalize(sideX, sideY);
          dir = {
            x: dir.x * 0.7 + sideDir.x * 0.5,
            y: dir.y * 0.7 + sideDir.y * 0.5
          };
        }

        // Trote o carrera controlada para disputar sin regalarse
        const spd = (player.speed / 100) * 2.5 * speedFactor;
        player.vx = dir.x * spd;
        player.vy = dir.y * spd;
        player.facingX = dir.x;
        player.facingY = dir.y;
        return;
      }
    }

    // 3. MOVIMIENTO TÁCTICO COLECTIVO EQUILIBRADO (MANTENER LA LÍNEA Y ESTRUCTURA)
    // Los defensas se quedan cubriendo su arco, los medios distribuyen y los delanteros buscan el espacio
    let targetX = player.homeX;
    let targetY = player.homeY;

    // Escalonamiento defensivo vertical según la altura del balón
    const ballOffsetFactorY = player.position === 'DEF' ? 0.22 : 0.35;
    const shiftY = (ball.y - pitchHeight / 2) * ballOffsetFactorY;
    targetY = player.homeY + shiftY;

    if (teamHasBall) {
      // EN ATAQUE: Abrir la cancha y adelantar líneas
      if (player.position === 'DEF') {
        targetX = player.isHome ? player.homeX + 70 : player.homeX - 70;
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX + 110 : player.homeX - 110;
      } else if (player.position === 'FWD') {
        targetX = player.isHome ? Math.min(fieldRight - 60, player.homeX + 130) : Math.max(fieldLeft + 60, player.homeX - 130);
      }
    } else {
      // EN DEFENSA: Mantener la muralla firme cubriendo la portería propia
      if (player.position === 'DEF') {
        // El defensa NUNCA sale a lo loco; se queda protegiendo el área penal
        targetX = player.isHome ? Math.max(fieldLeft + 45, player.homeX - 15) : Math.min(fieldRight - 45, player.homeX + 15);
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX - 30 : player.homeX + 30;
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
