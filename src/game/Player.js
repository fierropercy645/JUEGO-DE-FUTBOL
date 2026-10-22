import { clamp } from '../utils/math.js';

export class Player {
  constructor(data, teamId, isHome, homePos) {
    this.id = data.id;
    this.name = data.name;
    this.number = data.number;
    this.position = data.position;
    this.overall = data.overall || 80;
    this.speed = data.speed || 80;
    this.pass = data.pass || 80;
    this.shotPower = data.shotPower || 80;
    this.shotAccuracy = data.shotAccuracy || 80;
    this.defense = data.defense || 80;
    this.ballControl = data.ballControl || 80;
    this.stamina = data.stamina || 85;

    this.teamId = teamId;
    this.isHome = isHome;
    this.homeX = homePos.x;
    this.homeY = homePos.y;

    this.x = homePos.x;
    this.y = homePos.y;
    this.vx = 0;
    this.vy = 0;
    this.facingX = isHome ? 1 : -1;
    this.facingY = 0;
    this.radius = 12;

    this.isControlled = false;
    this.hasBall = false;
    this.kickCooldown = 0;
    this.controlTimer = 0;
    this.animTimer = 0;

    // Disparo potente con efecto visual ampliado
    this.isShooting = false;
    this.shootAnimTimer = 0;

    // Barra de carga de potencia (Power meter)
    this.isChargingShot = false;
    this.shotCharge = 0; // De 0.0 a 1.0

    // Regate / Dribble / Quiebre acrobático
    this.isDribbling = false;
    this.dribbleTimer = 0;
    this.dribbleSpinAngle = 0;

    // Estado desparramado / "rajado" (tackleado o burlado en el suelo)
    this.isStunned = false;
    this.stunTimer = 0;

    // Celebración variada (SIUUU, Rodillazo en el pasto, Salto eufórico, Baile)
    this.isCelebrating = false;
    this.celebrationTimer = 0;
    this.celebrationType = 'siuu'; // 'siuu', 'kneeslide', 'jump', 'dance'

    // Animación de vuelo y atajada espectacular del arquero
    this.isDiving = false;
    this.diveTimer = 0;
    this.diveDirY = 0; // -1 arriba, 1 abajo
    this.diveExtension = 0;
  }

  triggerSaveHoldAnimation() {
    this.isHoldingBall = true;
    this.holdAnimTimer = 1.2;
  }

  triggerDive(dirY = 0, duration = 0.65) {
    this.isDiving = true;
    this.diveTimer = duration;
    this.diveDirY = dirY;
    this.diveExtension = 0;
  }

  resetPosition() {
    this.x = this.homeX;
    this.y = this.homeY;
    this.vx = 0;
    this.vy = 0;
    this.facingX = this.isHome ? 1 : -1;
    this.facingY = 0;
    this.hasBall = false;
    this.kickCooldown = 0;
    this.controlTimer = 0;
    this.animTimer = 0;
    this.isShooting = false;
    this.shootAnimTimer = 0;
    this.isChargingShot = false;
    this.shotCharge = 0;
    this.isDribbling = false;
    this.dribbleTimer = 0;
    this.dribbleSpinAngle = 0;
    this.isStunned = false;
    this.stunTimer = 0;
    this.isCelebrating = false;
    this.celebrationTimer = 0;
    this.celebrationType = 'siuu';
  }

  triggerShootAnimation() {
    this.isShooting = true;
    this.shootAnimTimer = 0.4;
  }

  triggerDribbleSkill() {
    this.isDribbling = true;
    this.dribbleTimer = 0.45;
    this.dribbleSpinAngle = 0;
  }

  triggerStun(duration = 1.2) {
    this.isStunned = true;
    this.stunTimer = duration;
    this.vx = 0;
    this.vy = 0;
  }

  celebrate(duration = 2.5) {
    this.isCelebrating = true;
    this.celebrationTimer = duration;
    // Escoger aleatoriamente una de las 4 celebraciones
    const types = ['siuu', 'kneeslide', 'jump', 'dance'];
    this.celebrationType = types[Math.floor(Math.random() * types.length)];
  }

  update(dt, pitchWidth, pitchHeight) {
    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
      this.animTimer += dt * 10;
      if (this.celebrationTimer <= 0) {
        this.isCelebrating = false;
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
      return; // El jugador que quedó "rajado" no se mueve mientras dura el efecto
    }

    if (this.dribbleTimer > 0) {
      this.dribbleTimer -= dt;
      this.dribbleSpinAngle += dt * 18; // Giro acrobático
      if (this.dribbleTimer <= 0) {
        this.isDribbling = false;
        this.dribbleSpinAngle = 0;
      }
    }

    if (this.shootAnimTimer > 0) {
      this.shootAnimTimer -= dt;
      if (this.shootAnimTimer <= 0) {
        this.isShooting = false;
      }
    }

    if (this.holdAnimTimer > 0) {
      this.holdAnimTimer -= dt;
      if (this.holdAnimTimer <= 0) {
        this.isHoldingBall = false;
      }
    }

    if (this.isDiving) {
      this.diveTimer -= dt;
      this.diveExtension = Math.min(1.0, this.diveExtension + dt * 4.0);
      if (this.diveTimer <= 0) {
        this.isDiving = false;
        this.diveDirY = 0;
        this.diveExtension = 0;
      }
    }

    if (this.kickCooldown > 0) {
      this.kickCooldown = Math.max(0, this.kickCooldown - dt);
    }
    if (this.controlTimer > 0) {
      this.controlTimer = Math.max(0, this.controlTimer - dt);
    }

    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > 0.35) {
      this.animTimer += dt * currentSpeed * 4.5;
    } else {
      // Respiración o postura sutil estática sin temblores
      this.animTimer = 0;
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    this.x = clamp(this.x, this.radius + 6, pitchWidth - this.radius - 6);
    this.y = clamp(this.y, this.radius + 6, pitchHeight - this.radius - 6);

    // Amortiguación suave y natural
    this.vx *= Math.pow(0.85, dt * 60);
    this.vy *= Math.pow(0.85, dt * 60);

    if (Math.hypot(this.vx, this.vy) < 0.08) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  render(ctx, primaryColor, secondaryColor) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;

    const px = Math.round(this.x);
    const speed = Math.hypot(this.vx, this.vy);
    const isMoving = speed > 0.25;
    const runBob = (isMoving && !this.isShooting && !this.isStunned) ? Math.abs(Math.sin(this.animTimer * 1.4)) * 2 : 0;
    const jumpOffset = this.isCelebrating ? -Math.abs(Math.sin(this.animTimer * 2)) * 14 : -runBob;
    const py = Math.round(this.y + jumpOffset);

    // Inclinación corporal suave orientada a la dirección de avance
    let bodyTilt = 0;
    if (isMoving && !this.isShooting && !this.isStunned && !this.isCelebrating) {
      bodyTilt = clamp(this.vx * 0.04, -0.15, 0.15);
    }

    // 1. Sombra dinámica suavizada con gradiente
    ctx.save();
    const shadowW = this.isCelebrating ? 20 : (this.isShooting ? 26 : 22);
    const shadowH = 7;
    const shadowGrad = ctx.createRadialGradient(px, Math.round(this.y) + 11, 2, px, Math.round(this.y) + 11, shadowW / 2);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(px, Math.round(this.y) + 11, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Barra interactiva de carga de potencia de disparo (Power Meter)
    if (this.isChargingShot) {
      const barW = 32;
      const barH = 5;
      const barX = px - barW / 2;
      const barY = py - 32;

      ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3);
      else ctx.rect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Color gradual: Verde -> Amarillo -> Rojo (Potencia extrema)
      let chargeColor = '#10b981';
      if (this.shotCharge > 0.5) chargeColor = '#f59e0b';
      if (this.shotCharge > 0.8) chargeColor = '#ef4444';

      ctx.fillStyle = chargeColor;
      ctx.beginPath();
      const fillW = Math.max(2, Math.round(barW * this.shotCharge));
      if (ctx.roundRect) ctx.roundRect(barX, barY, fillW, barH, 2);
      else ctx.rect(barX, barY, fillW, barH);
      ctx.fill();
    }

    // 3. Indicador moderno de jugador controlado (Anillo en césped + Flecha)
    if (this.isControlled && !this.isCelebrating) {
      const pulse = Math.sin(Date.now() / 150) * 2;
      
      // Flechita flotante superior
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(px, py - 20 + pulse);
      ctx.lineTo(px - 6, py - 28 + pulse);
      ctx.lineTo(px + 6, py - 28 + pulse);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Halo circular en el césped
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffdd00';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(px, Math.round(this.y) + 11, 13, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. SI EL JUGADOR ESTÁ "RAJADO" / TACKLEADO (Tirado en el césped derrotado)
    if (this.isStunned) {
      ctx.save();
      ctx.translate(px, py + 8);
      ctx.rotate(this.facingX >= 0 ? Math.PI / 2.2 : -Math.PI / 2.2);
      // Cuerpo caído redondeado
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-8, -6, 16, 11, 4);
      else ctx.rect(-8, -6, 16, 11);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#ffcca3';
      ctx.beginPath();
      ctx.arc(0, -11, 5, 0, Math.PI * 2);
      ctx.fill();

      // Shorts
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-7, 4, 14, 6, 2);
      else ctx.rect(-7, 4, 14, 6);
      ctx.fill();
      ctx.restore();

      // Estrellitas de mareo animadas
      ctx.save();
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💫 😵 💫', px, py - 14);
      ctx.restore();
      ctx.restore();
      return;
    }

    // 5. SI ESTÁ HACIENDO JUGADA DE REGATE (Giro acrobático y estela)
    if (this.isDribbling) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(this.dribbleSpinAngle);
      // Estela circular de quiebre
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 20);
      auraGrad.addColorStop(0, 'rgba(255, 230, 0, 0.6)');
      auraGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. ANIMACIÓN DE VUELO ESPECTACULAR DEL ARQUERO (DIVE / ESTIRADA AL ÁNGULO)
    if (this.isDiving && this.position === 'GK') {
      ctx.save();
      ctx.translate(px, py);
      const diveAngle = (this.diveDirY < 0 ? -Math.PI / 3 : Math.PI / 3) * (this.facingX >= 0 ? 1 : -1);
      ctx.rotate(diveAngle * this.diveExtension);

      // Estela de vuelo del arquero
      ctx.fillStyle = 'rgba(252, 163, 17, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-this.facingX * 12, 0, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cuerpo estirado en el aire
      ctx.fillStyle = '#fca311'; // Buzo de arquero
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-7, -5, 15, 10, 3);
      else ctx.rect(-7, -5, 15, 10);
      ctx.fill();

      // Shorts
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-6, 5, 12, 5, 2);
      else ctx.rect(-6, 5, 12, 5);
      ctx.fill();

      // Piernas estiradas horizontalmente
      ctx.fillStyle = '#ffcca3';
      ctx.fillRect(-5, 10, 4, 6);
      ctx.fillRect(1, 10, 4, 6);
      ctx.fillStyle = '#111111';
      ctx.fillRect(-5, 16, 4, 3);
      ctx.fillRect(1, 16, 4, 3);

      // Cabeza atenta al balón
      ctx.fillStyle = '#ffcca3';
      ctx.beginPath();
      ctx.arc(0, -9, 5, 0, Math.PI * 2);
      ctx.fill();

      // Brazos y guantes estirados para tapar el balón
      ctx.fillStyle = '#fca311';
      ctx.fillRect(this.facingX * 7, -8, 5, 4);
      ctx.fillRect(this.facingX * 7, -1, 5, 4);

      // Guantes acolchados fluorescentes gigantes
      ctx.fillStyle = '#22c55e'; // Verde flúor de arquero
      ctx.beginPath();
      ctx.arc(this.facingX * 14, -7, 4.5, 0, Math.PI * 2);
      ctx.arc(this.facingX * 14, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // Rótulo ¡ATAJADÓN!
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('🧤 ¡TAPADÓN! 🧤', px, py - 24);
      ctx.restore();

      ctx.restore();
      return;
    }

    // RENDERIZADO ORGÁNICO & ATLETA
    const isGK = this.position === 'GK';
    const skinColor = '#ffcca3';
    const hairColor = '#2b1d0c';
    const kitColor = isGK ? '#fca311' : primaryColor;
    const trimColor = isGK ? '#111827' : secondaryColor;
    const shortsColor = '#ffffff';
    const socksColor = kitColor;
    const bootsColor = '#18181b';
    const kickDirX = this.facingX >= 0 ? 1 : -1;

    ctx.save();
    ctx.translate(px, py);
    if (bodyTilt !== 0) {
      ctx.rotate(bodyTilt);
    }

    // Ciclo de animación de piernas (fluido y armónico)
    const legPhase = isMoving ? Math.sin(this.animTimer * 1.3) : 0;
    const legSwingLeft = legPhase * 4;
    const legSwingRight = -legPhase * 4;

    // --- PIERNAS & BOTINES ---
    if (this.isShooting) {
      // Postura dinámica de zapatazo
      const supportX = -kickDirX * 5;
      const kickX = kickDirX * 9;

      // Pierna de apoyo
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(supportX - 2, 7, 4, 7, 2);
      else ctx.rect(supportX - 2, 7, 4, 7);
      ctx.fill();
      // Media de apoyo
      ctx.fillStyle = socksColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(supportX - 2, 9, 4, 4, 1);
      else ctx.rect(supportX - 2, 9, 4, 4);
      ctx.fill();
      // Botín de apoyo
      ctx.fillStyle = bootsColor;
      ctx.beginPath();
      ctx.ellipse(supportX, 15, 3.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pierna pateadora
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.save();
      ctx.translate(kickX, 7);
      ctx.rotate(kickDirX * 0.35);
      if (ctx.roundRect) ctx.roundRect(-2, -1, 5, 8, 2);
      else ctx.rect(-2, -1, 5, 8);
      ctx.fill();
      // Media
      ctx.fillStyle = socksColor;
      if (ctx.roundRect) ctx.roundRect(-2, 1, 5, 4, 1);
      else ctx.rect(-2, 1, 5, 4);
      ctx.fill();
      // Botín estirado
      ctx.fillStyle = bootsColor;
      ctx.beginPath();
      ctx.ellipse(kickDirX * 2, 7, 4, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Efecto blast de impacto de balón
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(kickDirX * 17, 7, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(kickDirX * 20, 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.arc(kickDirX * 23, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Pierna Izquierda
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-5.5, 7, 4, 6 + legSwingLeft * 0.3, 2);
      else ctx.rect(-5.5, 7, 4, 6 + legSwingLeft * 0.3);
      ctx.fill();
      // Media Izquierda
      ctx.fillStyle = socksColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-5.5, 9, 4, 3.5, 1);
      else ctx.rect(-5.5, 9, 4, 3.5);
      ctx.fill();
      // Botín Izquierdo aerodinámico
      ctx.fillStyle = bootsColor;
      ctx.beginPath();
      ctx.ellipse(-4 + (kickDirX * 0.5), 13.5 + legSwingLeft * 0.3, 3.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pierna Derecha
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(1.5, 7, 4, 6 + legSwingRight * 0.3, 2);
      else ctx.rect(1.5, 7, 4, 6 + legSwingRight * 0.3);
      ctx.fill();
      // Media Derecha
      ctx.fillStyle = socksColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(1.5, 9, 4, 3.5, 1);
      else ctx.rect(1.5, 9, 4, 3.5);
      ctx.fill();
      // Botín Derecho
      ctx.fillStyle = bootsColor;
      ctx.beginPath();
      ctx.ellipse(3 + (kickDirX * 0.5), 13.5 + legSwingRight * 0.3, 3.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- PANTALONETAS (Shorts) ---
    ctx.fillStyle = shortsColor;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-6.5, 3.5, 13, 5, [1, 1, 2, 2]);
    else ctx.rect(-6.5, 3.5, 13, 5);
    ctx.fill();
    // Línea divisoria en shorts
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 8.5);
    ctx.stroke();

    // --- TORSO / CAMISETA DEPORTIVA ---
    ctx.fillStyle = kitColor;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-7, -6, 14, 10, [4, 4, 2, 2]);
    else ctx.rect(-7, -6, 14, 10);
    ctx.fill();

    // Cuello en V deportivo y detalles de franja
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.moveTo(-2.5, -6);
    ctx.lineTo(0, -3);
    ctx.lineTo(2.5, -6);
    ctx.closePath();
    ctx.fill();

    // Franjas laterales de la camiseta
    ctx.fillStyle = trimColor;
    ctx.fillRect(-7, -4, 1.5, 7);
    ctx.fillRect(5.5, -4, 1.5, 7);

    // --- BRAZOS Y MANOS CON BALANCES ---
    ctx.fillStyle = skinColor;
    if (this.isCelebrating) {
      // Brazos alzados al cielo
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-10.5, -16, 3.2, 12, 1.6);
        ctx.roundRect(7.3, -16, 3.2, 12, 1.6);
      } else {
        ctx.rect(-10.5, -16, 3.2, 12);
        ctx.rect(7.3, -16, 3.2, 12);
      }
      ctx.fill();
      // Puños festivos
      ctx.beginPath();
      ctx.arc(-9, -16, 2.5, 0, Math.PI * 2);
      ctx.arc(9, -16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.isShooting) {
      // Brazos en posición de equilibrio de disparo potente
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-kickDirX * 11, -5, 4, 4, 1.5);
        ctx.roundRect(kickDirX * 8, -2, 4, 4, 1.5);
      } else {
        ctx.rect(-kickDirX * 11, -5, 4, 4);
        ctx.rect(kickDirX * 8, -2, 4, 4);
      }
      ctx.fill();
    } else if (this.isHoldingBall && isGK) {
      // Postura de atajada con ambas manos asegurando el balón en el pecho
      ctx.fillStyle = '#22c55e'; // Guantes verdes de agarre
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-5, -2, 4, 5, 2);
        ctx.roundRect(1, -2, 4, 5, 2);
      } else {
        ctx.rect(-5, -2, 4, 5);
        ctx.rect(1, -2, 4, 5);
      }
      ctx.fill();
    } else {
      // Brazos balanceándose al correr
      const armSwing = isMoving ? legSwingRight * 0.7 : 0;
      // Manga izquierda
      ctx.fillStyle = kitColor;
      ctx.fillRect(-9, -5, 2.5, 3);
      ctx.fillStyle = isGK ? '#22c55e' : skinColor; // Guantes fluorescentes para el arquero
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-9, -2 + armSwing, 2.5, 6, 1.2);
      else ctx.rect(-9, -2 + armSwing, 2.5, 6);
      ctx.fill();

      // Manga derecha
      ctx.fillStyle = kitColor;
      ctx.fillRect(6.5, -5, 2.5, 3);
      ctx.fillStyle = isGK ? '#22c55e' : skinColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(6.5, -2 - armSwing, 2.5, 6, 1.2);
      else ctx.rect(6.5, -2 - armSwing, 2.5, 6);
      ctx.fill();
    }

    // --- CABEZA & CABELLO CON CURVAS ---
    // Cuello
    ctx.fillStyle = skinColor;
    ctx.fillRect(-2, -8, 4, 3);

    // Cabeza redondeada
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -11.5, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Cabello estilizado curvado
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -12.5, 5.5, Math.PI * 0.95, Math.PI * 2.05, false);
    ctx.fill();

    // Ojos expresivos orientados según dirección
    ctx.fillStyle = '#1e293b';
    const lookX = kickDirX >= 0 ? 1 : -2;
    ctx.beginPath();
    ctx.arc(-2 + lookX, -10.5, 1, 0, Math.PI * 2);
    ctx.arc(2 + lookX, -10.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // --- DORSAL (Número de camiseta) ---
    ctx.fillStyle = trimColor;
    ctx.font = 'bold 7px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.number.toString(), 0, -1);

    ctx.restore(); // Termina transformaciones relativas del cuerpo

    // --- RÓTULO / CELEBRACIÓN / NOMBRE ---
    if (this.isCelebrating) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      let celeLabel = '⭐ ¡GOLAZO! ⭐';
      if (this.celebrationType === 'siuu') celeLabel = '👑 ¡SIUUUU! 👑';
      if (this.celebrationType === 'kneeslide') celeLabel = '⚡ ¡DESLIZADA! ⚡';
      if (this.celebrationType === 'dance') celeLabel = '🕺 ¡SAMBA GOL! 🕺';
      ctx.fillText(celeLabel, px, py - 25);
    } else if (this.isDribbling) {
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ ¡REGATE! ✨', px, py - 22);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(this.name, px, py - 19);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
