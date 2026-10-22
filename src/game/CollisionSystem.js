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
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let dist = Math.hypot(dx, dy);
        const minDist = p1.radius + p2.radius + 6;

        // Si están superpuestos o exactamente en el mismo pixel (evita trabas/bugs)
        if (dist < 0.01) {
          dx = (Math.random() - 0.5) || 1;
          dy = (Math.random() - 0.5) || 1;
          dist = Math.hypot(dx, dy);
        }

        if (dist < minDist) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;

          // Separación física inmediata
          p1.x -= nx * overlap;
          p1.y -= ny * overlap;
          p2.x += nx * overlap;
          p2.y += ny * overlap;

          // Impulso de despegue para romper bloqueos y no quedarse trabados juntos
          const repelForce = 1.2;
          p1.vx -= nx * repelForce;
          p1.vy -= ny * repelForce;
          p2.vx += nx * repelForce;
          p2.vy += ny * repelForce;
        }
      }
    }
  }

  /**
   * PARADA Y ATRAPADA DEL ARQUERO:
   * El arquero atrapa el balón con seguridad (tapada de gol, retención y despeje posterior).
   */
  static checkGoalkeeperSave(gk, ball, onSave, difficulty = 'normal') {
    if (gk.kickCooldown > 0) return false;

    // Si el tiro viene muy elevado (vaselina / sombrerito U por arriba de 10.0), pasa por arriba y es gol
    if (ball.altitude > 10.0) {
      return false;
    }

    const dx = ball.x - gk.x;
    const dy = ball.y - gk.y;
    const dist = Math.hypot(dx, dy);
    
    // Alcance generoso de los brazos y estirada del arquero
    let saveRadius = gk.radius + ball.radius + 20;
    let saveProbability = 0.88;

    if (difficulty === 'facil') {
      saveRadius = gk.radius + ball.radius + 12;
      saveProbability = 0.70; // Ataja con solvencia para que no pasen tiros tontos
    } else if (difficulty === 'dificil') {
      saveRadius = gk.radius + ball.radius + 26;
      saveProbability = 0.95;
    }

    // Tiros supersónicos con comba
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    if (ballSpeed > 18.0) {
      saveProbability *= 0.80; // Cañonazos extremos a quemarropa
    }

    if (dist < saveRadius && !ball.owner) {
      // Si el balón viene con trayectoria hacia el área o el arco
      if (ballSpeed > 0.4 || dist < gk.radius + ball.radius + 6) {
        if (Math.random() < saveProbability) {
          // Atrapa el balón con seguridad y lo retiene en sus manos
          ball.setOwner(gk);
          gk.controlTimer = 1.2;
          gk.gkHoldTimer = 1.2;
          gk.triggerSaveHoldAnimation();
          if (onSave) onSave(gk);
          return true;
        } else {
          // Desvío providencial al tiro de esquina o lateral
          ball.vx = -ball.vx * 0.45;
          ball.vy = (Math.random() - 0.5) * 7.0;
          gk.kickCooldown = 0.4;
          gk.triggerDive(dy > 0 ? 1 : -1, 0.5);
        }
      }
    }
    return false;
  }
}
