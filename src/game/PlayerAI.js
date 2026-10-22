import { distance, normalize } from '../utils/math.js';
import { DIFFICULTY, PITCH } from '../utils/constants.js';

export class PlayerAI {
  /**
   * IA Táctica Inteligente:
   * - Decisiones orgánicas de pase, tiro, desmarque y repliegue basadas en visión periférica y presión rival.
   * - Lectura de carriles libres para evitar conducciones mecánicas o robos predecibles.
   * - Temporización de remates según ángulo y distancia a portería.
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

    let speedFactor = 1.0;
    let shootChance = 0.055;
    let passChance = 0.075;
    let shootRange = 270;
    let tackleUrgency = 0.008;

    if (difficulty === DIFFICULTY.EASY) {
      speedFactor = 0.95;
      shootChance = 0.035;
      passChance = 0.05;
      shootRange = 230;
      tackleUrgency = 0.004;
    } else if (difficulty === DIFFICULTY.HARD) {
      speedFactor = 1.05;
      shootChance = 0.085;
      passChance = 0.095;
      shootRange = 290;
      tackleUrgency = 0.015;
    }

    const scoreDiff = matchContext.scoreDiff || 0; // > 0 ganando, < 0 perdiendo
    const isLateGame = !!matchContext.isLateGame;

    if (scoreDiff < 0 && isLateGame) {
      shootChance += 0.035;
      passChance += 0.025;
      shootRange += 30;
    } else if (scoreDiff > 0 && isLateGame) {
      shootRange = 220;
      passChance += 0.02; // Priorizar posesión
    }

    const hasBall = ball.owner === player;
    const teamHasBall = ball.owner && ball.owner.teamId === player.teamId;

    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const oppGoalX = player.isHome ? fieldRight : fieldLeft;
    const oppGoalY = pitchHeight / 2;

    // 1. SI ESTE JUGADOR TIENE EL BALÓN (TOMA DE DECISIÓN OFENSIVA CON CRITERIO):
    if (hasBall) {
      const distToGoal = distance(player.x, player.y, oppGoalX, oppGoalY);

      // Evaluación de presión rival inmediata sobre el poseedor
      const nearestRival = opponentTeam.players
        .filter(opp => opp.position !== 'GK')
        .reduce((closest, opp) => {
          const d = distance(player.x, player.y, opp.x, opp.y);
          return d < closest.dist ? { player: opp, dist: d } : closest;
        }, { player: null, dist: Infinity });

      const isUnderHeavyPressure = nearestRival.dist < 42;

      // DISPARO A PUERTA:
      // Si está en rango y tiene ángulo limpio hacia los tres palos
      if (distToGoal < shootRange) {
        const goalAngle = Math.abs(oppGoalY - player.y) / Math.max(1, Math.abs(oppGoalX - player.x));
        const hasGoodAngle = goalAngle < 1.1; // No patear desde el córner sin ángulo

        if (hasGoodAngle && (Math.random() < shootChance || (distToGoal < 155 && Math.random() < 0.22))) {
          executeShootCb(player);
          return;
        }
      }

      // PASE INTELIGENTE:
      // Si un rival presiona fuertemente o si detecta un compañero en posición superior
      const shouldLookForPass = isUnderHeavyPressure || Math.random() < passChance;
      if (shouldLookForPass) {
        const mates = team.players.filter(p => p !== player && p.position !== 'GK');
        let bestMate = null;
        let bestScore = -Infinity;

        mates.forEach(m => {
          const advance = player.isHome ? (m.x - player.x) : (player.x - m.x);
          const distToM = distance(player.x, player.y, m.x, m.y);
          if (distToM < 26) return; // Muy pegado

          // Medir si el compañero está libre de marca
          const oppNearMate = opponentTeam.players.some(opp => distance(opp.x, opp.y, m.x, m.y) < 38);

          // Verificar si hay un oponente entre la línea de pase
          const isInterceptionRisk = opponentTeam.players.some(opp => {
            const d1 = distance(player.x, player.y, opp.x, opp.y);
            const d2 = distance(opp.x, opp.y, m.x, m.y);
            return (d1 + d2) < (distToM + 22);
          });

          let score = advance * 1.8 - (distToM / 7) - (oppNearMate ? 45 : 0) - (isInterceptionRisk ? 55 : 0);
          if (m.position === 'FWD') score += 20;

          if (score > bestScore) {
            bestScore = score;
            bestMate = m;
          }
        });

        if (bestMate && (bestScore > -15 || isUnderHeavyPressure)) {
          executePassCb(player);
          return;
        }
      }

      // CONDUCCIÓN CON ESQUIVE DINÁMICO:
      // Si hay un rival bloqueando directamente el camino hacia el arco, esquivarlo por una banda
      let dirToGoal = normalize(oppGoalX - player.x, oppGoalY - player.y);
      if (isUnderHeavyPressure && nearestRival.player) {
        const dodgeY = player.y >= nearestRival.player.y ? 1 : -1;
        dirToGoal = normalize(dirToGoal.x * 0.7, dirToGoal.y * 0.7 + dodgeY * 0.5);
      }

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

        const dangerousOpponent = opponentTeam.players.find(opp => {
          if (opp.position === 'GK') return false;
          const distToOwnGoal = distance(opp.x, opp.y, ownGoalX, ownGoalY);
          return distToOwnGoal < 230;
        });

        let blockX = ownGoalX + (ball.x - ownGoalX) * 0.35;
        let blockY = ownGoalY + (ball.y - ownGoalY) * 0.50;

        if (dangerousOpponent) {
          blockX = (blockX * 0.55) + (dangerousOpponent.x * 0.45);
          blockY = (blockY * 0.45) + (dangerousOpponent.y * 0.55);
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
      if (player.position === 'DEF') {
        targetX = player.isHome ? player.homeX + 75 : player.homeX - 75;
      } else if (player.position === 'MID') {
        targetX = player.isHome ? player.homeX + 115 : player.homeX - 115;
        if (Math.abs(ball.y - pitchHeight / 2) > 90) {
          targetY = pitchHeight / 2 + (player.homeY - pitchHeight / 2) * 0.5;
        }
      } else if (player.position === 'FWD') {
        const forwardAdv = player.isHome ? 145 : -145;
        targetX = player.isHome
          ? Math.min(fieldRight - 65, player.homeX + forwardAdv)
          : Math.max(fieldLeft + 65, player.homeX + forwardAdv);

        const nearestDefender = opponentTeam.players.find(opp => opp.position === 'DEF');
        if (nearestDefender) {
          const dy = player.y - nearestDefender.y;
          const diagonalSign = dy >= 0 ? 1 : -1;
          targetY += diagonalSign * 45;
        }
      }

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
