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
    
    // Alcance generoso y cobertura del arco consistente en TODOS los modos
    // El arquero ataja con calidad profesional tanto en Fácil, Normal como Difícil
    let saveRadius = gk.radius + ball.radius + 28;
    let saveProbability = 0.93;

    if (difficulty === 'facil') {
      saveRadius = gk.radius + ball.radius + 24;
      saveProbability = 0.88; // Tapadas firmes para que no entren goles fáciles de mitad de cancha
    } else if (difficulty === 'dificil') {
      saveRadius = gk.radius + ball.radius + 32;
      saveProbability = 0.96; // En difícil exige jugadas tejidas, pases y quiebres
    }

    // Tiros lejanos o colocados
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    if (dist < saveRadius && !ball.owner) {
      if (ballSpeed > 0.3 || dist < gk.radius + ball.radius + 8) {
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
          gk.kickCooldown = 0.35;
          gk.triggerDive(dy > 0 ? 1 : -1, 0.55);
        }
      }
    }
    return false;
  }
}
