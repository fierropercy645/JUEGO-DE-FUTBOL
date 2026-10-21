export class CollisionSystem {
  static checkPlayerBall(player, ball, onTackleSuccess) {
    if (player.kickCooldown > 0) return false;

    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.hypot(dx, dy);
    // Margen amplio de intercepción para que se sienta gratificante y fluido
    const interceptDist = player.radius + ball.radius + (player.isControlled ? 14 : 7);

    if (dist < interceptDist) {
      if (ball.owner) {
        if (ball.owner === player) return false;

        // Si el usuario es quien disputa con su jugador controlado,
        // tiene gran prioridad para robar el balón cuerpo a cuerpo
        if (player.isControlled) {
          ball.setOwner(player);
          player.controlTimer = 0.6; // Asegura posesión para salir jugando
          player.kickCooldown = 0.15;
          if (onTackleSuccess) onTackleSuccess(player);
          return true;
        }

        if (ball.owner.controlTimer > 0) {
          return false;
        }

        const tacklerDef = player.defense || 70;
        const holderCtrl = ball.owner.ballControl || 70;
        const tackleChance = (tacklerDef / (tacklerDef + holderCtrl)) * 0.12;

        if (Math.random() < tackleChance) {
          ball.setOwner(player);
          player.controlTimer = 0.5;
          if (onTackleSuccess) onTackleSuccess(player);
          return true;
        }
      } else {
        ball.setOwner(player);
        player.controlTimer = 0.4;
        return true;
      }
    }
    return false;
  }

  static separatePlayers(players) {
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = p1.radius + p2.radius + 4;

        if (dist < minDist && dist > 0.001) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;

          p1.x -= nx * overlap;
          p1.y -= ny * overlap;
          p2.x += nx * overlap;
          p2.y += ny * overlap;
        }
      }
    }
  }

  /**
   * PARADA Y ATRAPADA DEL ARQUERO:
   * El arquero atrapa el balón (tapada de gol y retención en sus manos).
   */
  static checkGoalkeeperSave(gk, ball, onSave, difficulty = 'normal') {
    if (gk.kickCooldown > 0) return false;

    // Si el tiro viene muy elevado (vaselina / sombrerito U), pasa por arriba del arquero y es gol
    if (ball.altitude > 8.0) {
      return false;
    }

    const dx = ball.x - gk.x;
    const dy = ball.y - gk.y;
    const dist = Math.hypot(dx, dy);
    
    // Alcance realista de los brazos del arquero
    let saveRadius = gk.radius + ball.radius + 10;
    let saveProbability = 0.70;

    if (difficulty === 'facil') {
      saveRadius = gk.radius + ball.radius + 4;
      saveProbability = 0.40; // En fácil, la gran mayoría de tiros bien colocados son gol
    } else if (difficulty === 'dificil') {
      saveRadius = gk.radius + ball.radius + 16;
      saveProbability = 0.82;
    }

    // Tiros esquinados o tiros potentes difíciles de tapar
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    if (ballSpeed > 14.0) {
      saveProbability *= 0.65; // Cañonazos potentes fusilan al arquero
    }
    if (Math.abs(ball.curveSpinY) > 0.1) {
      saveProbability *= 0.75; // Tiros con rosca son más difíciles
    }

    if (dist < saveRadius && !ball.owner) {
      // Si el balón viene con trayectoria hacia el arco
      if (ballSpeed > 0.6) {
        if (Math.random() < saveProbability) {
          // Atrapa el balón con seguridad en sus manos
          ball.setOwner(gk);
          gk.controlTimer = 1.0;
          gk.gkHoldTimer = 1.0;
          if (onSave) onSave(gk);
          return true;
        } else {
          // Si no la retiene, rebote o desvío imperfecto hacia un lado
          ball.vx = -ball.vx * 0.45;
          ball.vy = (Math.random() - 0.5) * 6.0;
          gk.kickCooldown = 0.5;
        }
      }
    }
    return false;
  }
}
