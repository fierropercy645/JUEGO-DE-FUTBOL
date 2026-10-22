import { distance, normalize } from '../utils/math.js';
import { DIFFICULTY, PITCH } from '../utils/constants.js';

export class PlayerAI {
  /**
   * IA Táctica Avanzada con Desmarques, Pases Filtrados y Defensa Zonal Inteligente:
   * - FÁCIL: Menor velocidad de reacción, tiros suaves y marcas con mayor margen de error.
   * - NORMAL: Fútbol equilibrado, presión moderada, desmarques fluidos y tiros bien calculados.
   * - DIFÍCIL: Marcaje asfixiante, anticipación, repliegue ordenado, desmarques de ruptura y remates demoledores.
   *
   * @param {Player} player - Jugador evaluado
   * @param {Ball} ball - Balón del partido
   * @param {Team} team - Equipo del jugador
   * @param {Team} opponentTeam - Equipo rival
   * @param {number} pitchWidth - Ancho del campo
   * @param {number} pitchHeight - Alto del campo
   * @param {string} difficulty - Nivel de dificultad
   * @param {Function} executePassCb - Callback de pase
   * @param {Function} executeShootCb - Callback de tiro
   * @param {Object} [matchContext] - Contexto de partido { scoreDiff, isLateGame, timeRatio }
   */
  static update(
    player,
    ball,
    team,
    opponentTeam,
    pitchWidth,
    pitchHeight,
    difficulty = DIFFICULTY.NORMAL,
    executePassCb,
    executeShootCb,
    matchContext = {}
  ) {
    if (player.position === 'GK') return;

    // Velocidades 1:1 basadas estrictamente en los atributos del jugador en TODOS los modos
    let speedFactor = 1.0;
    let shootChance = 0.05;
    let passChance = 0.065;
    let shootRange = 260;

    if (difficulty === DIFFICULTY.EASY) {
      speedFactor = 0.95;
      shootChance = 0.035;
      passChance = 0.045;
    } else if (difficulty === DIFFICULTY.HARD) {
      speedFactor = 1.05;
      shootChance = 0.075;
      passChance = 0.085;
    }

    // Adaptación táctica contextual por marcador y minutos restantes
    const scoreDiff = matchContext.scoreDiff || 0; // > 0 ganando, < 0 perdiendo
    const isLateGame = !!matchContext.isLateGame;

    if (scoreDiff < 0 && isLateGame) {
      // Necesidad imperiosa de empatar/remontar: mayor agresividad ofensiva
      shootChance += 0.03;
      passChance += 0.02;
    } else if (scoreDiff > 0 && isLateGame) {
      // Protegiendo el resultado: pases más conservadores, tiros con mayor seguridad
      shootRange = 220;
    }

    const hasBall = ball.owner === player;
    const teamHasBall = ball.owner && ball.owner.teamId === player.teamId;

    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const oppGoalX = player.isHome ? fieldRight : fieldLeft;
    const oppGoalY = pitchHeight / 2;

    // 1. SI ESTE JUGADOR TIENE EL BALÓN (TOMA DE DECISIONES OFENSIVA):
    if (hasBall) {
      const distToGoal = distance(player.x, player.y, oppGoalX, oppGoalY);

      // Decisión de disparo inteligente de la IA si está en zona de ataque
      if (distToGoal < shootRange) {
        if (Math.random() < shootChance) {
          executeShootCb(player);
          return;
        }
      }

      // Si está mano a mano muy cerca del arco (< 150px), disparar con alta contundencia
      if (distToGoal < 150 && Math.random() < 0.16) {
        executeShootCb(player);
        return;
      }

      // Pase asociativo inteligente: buscar compañeros desmarcados o picando al espacio
      if (Math.random() < passChance) {
        const mates = team.players.filter(p => p !== player && p.position !== 'GK');
        let bestMate = null;
        let bestScore = -Infinity;

        mates.forEach(m => {
          const advance = player.isHome ? (m.x - player.x) : (player.x - m.x);
          const distToM = distance(player.x, player.y, m.x, m.y);
          if (distToM < 25) return; // Muy encima

          // Comprobar si hay un rival marcándolo de cerca
          const oppNearMate = opponentTeam.players.some(opp => distance(opp.x, opp.y, m.x, m.y) < 36);

          // Ponderar desmarque hacia adelante y línea despejada
          let score = advance * 1.5 - (oppNearMate ? 60 : 0) - (distToM / 8);
          if (m.position === 'FWD') score += 25; // Priorizar alimentar al delantero

          if (score > bestScore && (!oppNearMate || advance > 40)) {
            bestScore = score;
            bestMate = m;
          }
        });

        if (bestMate && bestScore > 0) {
          executePassCb(player);
          return;
        }
      }

      // Conducir enfilando hacia el arco rival
      const dirToGoal = normalize(oppGoalX - player.x, oppGoalY - player.y);
      const spd = (player.speed / 100) * 2.55 * speedFactor;
      player.vx = dirToGoal.x * spd;
      player.vy = dirToGoal.y * spd;
      player.facingX = dirToGoal.x;
      player.facingY = dirToGoal.y;
      return;
    }

    // 2. SISTEMA DEFENSIVO ACTIVO DE FÚTBOL REAL:
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

      // CASO B: El DEFENSA (DEF) cubre el área y marca al atacante desmarcado más peligroso
      if (player.position === 'DEF') {
        const ownGoalX = player.isHome ? fieldLeft + 35 : fieldRight - 35;
        const ownGoalY = pitchHeight / 2;

        // Buscar si hay un atacante rival infiltrado cerca de nuestra área sin marca directa
        const dangerousOpponent = opponentTeam.players.find(opp => {
          if (opp.position === 'GK') return false;
          const distToOwnGoal = distance(opp.x, opp.y, ownGoalX, ownGoalY);
          return distToOwnGoal < 220;
        });

        let blockX = ownGoalX + (ball.x - ownGoalX) * 0.35;
        let blockY = ownGoalY + (ball.y - ownGoalY) * 0.50;

        // Si hay un atacante peligroso en el área, hacer cobertura intermedia
        if (dangerousOpponent) {
          blockX = (blockX * 0.6) + (dangerousOpponent.x * 0.4);
          blockY = (blockY * 0.5) + (dangerousOpponent.y * 0.5);
        }

        const dToBlock = distance(player.x, player.y, blockX, blockY);
        if (dToBlock > 12) {
          const dir = normalize(blockX - player.x, blockY - player.y);
          const spd = (player.speed / 100) * 2.45 * speedFactor;
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
    }

    // 3. MOVIMIENTO TÁCTICO COLECTIVO DINÁMICO (DESMARQUES EN ATAQUE Y REPLIEGUE EN DEFENSA)
    let targetX = player.homeX;
    let targetY = player.homeY;

    // Basculación continua con la altura del balón para cerrar líneas dentro del campo
    const shiftY = (ball.y - pitchHeight / 2) * 0.45;
    targetY = player.homeY + shiftY;

    if (teamHasBall) {
      // EN ATAQUE: DESMARQUES INTELIGENTES
      // Los jugadores no se quedan estáticos: tiran diagonales hacia espacios libres
      if (player.position === 'DEF') {
        targetX = player.isHome ? player.homeX + 75 : player.homeX - 75;
      } else if (player.position === 'MID') {
        // El mediocampista ofrece línea de apoyo escalonada
        targetX = player.isHome ? player.homeX + 115 : player.homeX - 115;
        // Si el balón está muy escorado a una banda, el medio bascula al centro para el pase atrás
        if (Math.abs(ball.y - pitchHeight / 2) > 90) {
          targetY = pitchHeight / 2 + (player.homeY - pitchHeight / 2) * 0.5;
        }
      } else if (player.position === 'FWD') {
        // DESMARQUE DE RUPTURA: Picar a la espalda de la defensa hacia el área rival
        const forwardAdv = player.isHome ? 145 : -145;
        targetX = player.isHome
          ? Math.min(fieldRight - 65, player.homeX + forwardAdv)
          : Math.max(fieldLeft + 65, player.homeX + forwardAdv);

        // Desmarque diagonal inteligente: alejarse del defensa rival más cercano
        const nearestDefender = opponentTeam.players.find(opp => opp.position === 'DEF');
        if (nearestDefender) {
          const dy = player.y - nearestDefender.y;
          // Si el defensa está a la misma altura, el delantero se abre o pica al segundo palo
          const diagonalSign = dy >= 0 ? 1 : -1;
          targetY += diagonalSign * 45;
        }
      }

      // Si el equipo va perdiendo al final, adelantar aún más el bloque ofensivo
      if (scoreDiff < 0 && isLateGame) {
        targetX += player.isHome ? 30 : -30;
      }
    } else {
      // EN DEFENSA: Mantener la formación sin adelantar ni amontonarse dentro del campo
      if (player.position === 'DEF') {
        targetX = player.isHome ? fieldLeft + 90 : fieldRight - 90;
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX - 25 : player.homeX + 25;
      } else if (player.position === 'FWD') {
        targetX = player.homeX;
      }

      // Si el equipo va ganando al final, repliegue intensivo de todas las líneas
      if (scoreDiff > 0 && isLateGame) {
        targetX += player.isHome ? -35 : 35;
      }
    }

    // Asegurar que el objetivo táctico nunca esté fuera de la cancha
    targetX = Math.max(fieldLeft + 30, Math.min(fieldRight - 30, targetX));
    targetY = Math.max(30, Math.min(pitchHeight - 30, targetY));

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
