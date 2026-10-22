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

    // 2. SISTEMA DEFENSIVO ACTIVO DE FÚTBOL REAL:
    // Si el rival tiene el balón:
    // A) El más cercano (presser) sale a marcar y robar activamente el balón.
    // B) El DEFENSA se interpone entre el balón y su portería (cerrando la línea de tiro).
    // C) Los MEDIOCAMPISTAS / DELANTEROS basculan y persiguen cerrando espacios.
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

    if (!teamHasBall) {
      // CASO A: Eres el jugador designado para presionar -> Presiona el balón
      if (isDesignatedPresser) {
        let dir = normalize(ball.x - player.x, ball.y - player.y);

        // Desvío anticolisión: si hay un compañero cerca, rodearlo ligeramente
        const nearbyTeammate = outfieldTeammates.find(m => m !== player && distance(m.x, m.y, player.x, player.y) < 26);
        if (nearbyTeammate) {
          const sideX = -(nearbyTeammate.y - player.y);
          const sideY = (nearbyTeammate.x - player.x);
          const sideDir = normalize(sideX, sideY);
          dir = {
            x: dir.x * 0.75 + sideDir.x * 0.45,
            y: dir.y * 0.75 + sideDir.y * 0.45
          };
        }

        const spd = (player.speed / 100) * 2.65 * speedFactor;
        player.vx = dir.x * spd;
        player.vy = dir.y * spd;
        player.facingX = dir.x;
        player.facingY = dir.y;
        return;
      }

      // CASO B: El DEFENSA (DEF) NUNCA ataca al bulto ni va al balón.
      // Se queda atrás haciendo cobertura posicional cubriendo la línea hacia el arco.
      if (player.position === 'DEF') {
        const ownGoalX = player.isHome ? fieldLeft + 35 : fieldRight - 35;
        const ownGoalY = pitchHeight / 2;

        // Se planta firme protegiendo el centro del área penal
        const blockX = ownGoalX + (ball.x - ownGoalX) * 0.35;
        const blockY = ownGoalY + (ball.y - ownGoalY) * 0.50;

        const dToBlock = distance(player.x, player.y, blockX, blockY);
        if (dToBlock > 12) {
          const dir = normalize(blockX - player.x, blockY - player.y);
          const spd = (player.speed / 100) * 2.4 * speedFactor;
          player.vx = dir.x * spd;
          player.vy = dir.y * spd;
          player.facingX = normalize(ball.x - player.x, ball.y - player.y).x;
          player.facingY = normalize(ball.x - player.x, ball.y - player.y).y;
          return;
        } else {
          player.vx *= 0.5;
          player.vy *= 0.5;
          player.facingX = normalize(ball.x - player.x, ball.y - player.y).x;
          player.facingY = normalize(ball.x - player.x, ball.y - player.y).y;
          return;
        }
      }

      // CASO C: LOS DEMÁS JUGADORES (MED / FWD no asignados)
      // NO van al balón: retroceden ordenadamente a su posición táctica de espera
      // para cortar pases y esperar el despeje o recuperación.
    }

    // 3. MOVIMIENTO TÁCTICO COLECTIVO DINÁMICO (CUANDO TU EQUIPO ATACA O SE REPLIEGA)
    let targetX = player.homeX;
    let targetY = player.homeY;

    // Basculación continua con la altura del balón para cerrar líneas
    const shiftY = (ball.y - pitchHeight / 2) * 0.55;
    targetY = player.homeY + shiftY;

    if (teamHasBall) {
      // EN ATAQUE: Desmarcarse y adelantar
      if (player.position === 'DEF') {
        targetX = player.isHome ? player.homeX + 80 : player.homeX - 80;
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX + 130 : player.homeX - 130;
      } else if (player.position === 'FWD') {
        targetX = player.isHome ? Math.min(fieldRight - 50, player.homeX + 150) : Math.max(fieldLeft + 50, player.homeX - 150);
      }
    } else {
      // EN DEFENSA: Mantener la formación sin adelantar ni amontonarse
      if (player.position === 'DEF') {
        targetX = player.isHome ? fieldLeft + 75 : fieldRight - 75;
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX - 25 : player.homeX + 25;
      } else if (player.position === 'FWD') {
        targetX = player.homeX;
      }
    }

    const distToTarget = distance(player.x, player.y, targetX, targetY);
    if (distToTarget > 16) {
      const dir = normalize(targetX - player.x, targetY - player.y);
      const spd = (player.speed / 100) * 2.35 * speedFactor;
      player.vx = dir.x * spd;
      player.vy = dir.y * spd;
      player.facingX = dir.x;
      player.facingY = dir.y;
    } else {
      player.vx *= 0.5;
      player.vy *= 0.5;
      if (Math.hypot(player.vx, player.vy) < 0.1) {
        player.vx = 0;
        player.vy = 0;
      }
      player.facingX = normalize(ball.x - player.x, ball.y - player.y).x;
      player.facingY = normalize(ball.x - player.x, ball.y - player.y).y;
    }
  }
}
