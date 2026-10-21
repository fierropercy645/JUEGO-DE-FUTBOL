import { PITCH } from '../utils/constants.js';

export class Pitch {
  constructor(width = PITCH.WIDTH, height = PITCH.HEIGHT) {
    this.width = width;
    this.height = height;
    this.goalWidth = PITCH.GOAL_WIDTH;
    this.goalDepth = PITCH.GOAL_DEPTH;

    this.fieldMarginX = 60;
    this.fieldWidth = this.width - this.fieldMarginX * 2;
    this.fieldLeft = this.fieldMarginX;
    this.fieldRight = this.width - this.fieldMarginX;

    // Animación de impacto en la red (Net Shake / Ripple Physics)
    this.leftNetShakeTimer = 0;
    this.rightNetShakeTimer = 0;
    this.shakeIntensity = 0;
  }

  triggerNetShake(side = 'right', intensity = 1.0) {
    this.shakeIntensity = intensity;
    if (side === 'left') {
      this.leftNetShakeTimer = 1.8;
    } else {
      this.rightNetShakeTimer = 1.8;
    }
  }

  update(dt) {
    if (this.leftNetShakeTimer > 0) {
      this.leftNetShakeTimer = Math.max(0, this.leftNetShakeTimer - dt);
    }
    if (this.rightNetShakeTimer > 0) {
      this.rightNetShakeTimer = Math.max(0, this.rightNetShakeTimer - dt);
    }
  }

  render(ctx) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 1. Fondo exterior
    ctx.fillStyle = '#0f291e';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Terreno de juego con franjas reglamentarias
    const stripeCount = 12;
    const stripeWidth = this.fieldWidth / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1b4d3e' : '#235c4b';
      const sx = Math.round(this.fieldLeft + i * stripeWidth);
      const sw = Math.ceil(stripeWidth);
      ctx.fillRect(sx, 0, sw, this.height);

      ctx.fillStyle = i % 2 === 0 ? '#164033' : '#1e5242';
      for (let py = 16; py < this.height; py += 32) {
        ctx.fillRect(sx + 8, py, 4, 2);
        ctx.fillRect(sx + 24, py + 14, 4, 2);
      }
    }

    // 3. Líneas oficiales de demarcación
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;

    ctx.strokeRect(this.fieldLeft, 4, this.fieldWidth, this.height - 8);

    ctx.beginPath();
    ctx.moveTo(Math.round(this.width / 2), 4);
    ctx.lineTo(Math.round(this.width / 2), this.height - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, PITCH.CENTER_CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(this.width / 2) - 3, Math.round(this.height / 2) - 3, 6, 6);

    const penAreaY = Math.round((this.height - PITCH.PENALTY_AREA_HEIGHT) / 2);
    ctx.strokeRect(this.fieldLeft, penAreaY, PITCH.PENALTY_AREA_WIDTH, PITCH.PENALTY_AREA_HEIGHT);
    ctx.strokeRect(this.fieldRight - PITCH.PENALTY_AREA_WIDTH, penAreaY, PITCH.PENALTY_AREA_WIDTH, PITCH.PENALTY_AREA_HEIGHT);

    ctx.beginPath();
    ctx.arc(this.fieldLeft + PITCH.PENALTY_SPOT_DIST, this.height / 2, 54, -0.9, 0.9);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.fieldRight - PITCH.PENALTY_SPOT_DIST, this.height / 2, 54, Math.PI - 0.9, Math.PI + 0.9);
    ctx.stroke();

    const goalAreaY = Math.round((this.height - PITCH.GOAL_AREA_HEIGHT) / 2);
    ctx.strokeRect(this.fieldLeft, goalAreaY, PITCH.GOAL_AREA_WIDTH, PITCH.GOAL_AREA_HEIGHT);
    ctx.strokeRect(this.fieldRight - PITCH.GOAL_AREA_WIDTH, goalAreaY, PITCH.GOAL_AREA_WIDTH, PITCH.GOAL_AREA_HEIGHT);

    ctx.fillRect(this.fieldLeft + PITCH.PENALTY_SPOT_DIST - 3, Math.round(this.height / 2) - 3, 6, 6);
    ctx.fillRect(this.fieldRight - PITCH.PENALTY_SPOT_DIST - 3, Math.round(this.height / 2) - 3, 6, 6);

    this.renderCornerWithFlag(ctx, this.fieldLeft, 4, 0, Math.PI / 2, 1, 1);
    this.renderCornerWithFlag(ctx, this.fieldLeft, this.height - 4, -Math.PI / 2, 0, 1, -1);
    this.renderCornerWithFlag(ctx, this.fieldRight, 4, Math.PI / 2, Math.PI, -1, 1);
    this.renderCornerWithFlag(ctx, this.fieldRight, this.height - 4, Math.PI, -Math.PI / 2, -1, -1);

    // 4. ARCOS DE FÚTBOL CON ANIMACIÓN DE SACUDIDA DE RED
    const goalY = Math.round((this.height - this.goalWidth) / 2);

    this.renderVisibleGoal(
      ctx,
      this.fieldLeft - this.goalDepth,
      goalY,
      this.goalDepth,
      this.goalWidth,
      true,
      this.leftNetShakeTimer
    );

    this.renderVisibleGoal(
      ctx,
      this.fieldRight,
      goalY,
      this.goalDepth,
      this.goalWidth,
      false,
      this.rightNetShakeTimer
    );

    ctx.restore();
  }

  renderVisibleGoal(ctx, x, y, width, height, isLeft, shakeTimer = 0) {
    ctx.save();

    // Sombra del arco redondeada
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - 3, y + 3, width + 6, height + 8, 4);
    else ctx.rect(x - 3, y + 3, width + 6, height + 8);
    ctx.fill();

    // Fondo del arco con profundidad deportiva
    ctx.fillStyle = '#081c14';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, width, height, isLeft ? [8, 0, 0, 8] : [0, 8, 8, 0]);
    else ctx.rect(x, y, width, height);
    ctx.fill();

    // CÁLCULO DE ONDULACIÓN Y VIBRACIÓN DE LA RED TRAS EL GOL
    const isShaking = shakeTimer > 0;
    const waveAmp = isShaking ? Math.sin(shakeTimer * 26) * (shakeTimer * 5) : 0;
    const stretchX = isShaking ? (isLeft ? -waveAmp * 1.6 : waveAmp * 1.6) : 0;

    // MALLA TEJIDA EN ROMBOS HEXAGONALES / DIAGONALES (Estilo redes profesionales FIFA)
    ctx.save();
    ctx.beginPath();
    // Clip dentro del área del arco para que los bordes queden impecables y redondeados
    if (ctx.roundRect) ctx.roundRect(x, y, width + (isLeft ? 0 : stretchX), height, isLeft ? [8, 0, 0, 8] : [0, 8, 8, 0]);
    else ctx.rect(x, y, width + (isLeft ? 0 : stretchX), height);
    ctx.clip();

    ctx.strokeStyle = isShaking ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = isShaking ? 1.5 : 1.1;

    const step = 8;
    const frontX = isLeft ? x + width : x;
    const backX = isLeft ? x + stretchX : x + width + stretchX;

    // Diagonales 1 (/)
    for (let d = -height; d <= width + height; d += step) {
      ctx.beginPath();
      const wave = isShaking ? Math.sin(d * 0.15 + shakeTimer * 18) * (shakeTimer * 1.8) : 0;
      ctx.moveTo(x + d + wave, y);
      ctx.lineTo(x + d - height + wave, y + height);
      ctx.stroke();
    }

    // Diagonales 2 (\)
    for (let d = 0; d <= width + height * 2; d += step) {
      ctx.beginPath();
      const wave = isShaking ? Math.cos(d * 0.15 + shakeTimer * 18) * (shakeTimer * 1.8) : 0;
      ctx.moveTo(x + d + wave, y);
      ctx.lineTo(x + d + height + wave, y + height);
      ctx.stroke();
    }
    ctx.restore();

    // Estructura metálica trasera redondeada (tubos de tensión)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(frontX, y);
    ctx.quadraticCurveTo(backX, y, backX, y + 16);
    ctx.lineTo(backX, y + height - 16);
    ctx.quadraticCurveTo(backX, y + height, frontX, y + height);
    ctx.stroke();

    // Travesaño y Postes frontales redondeados y brillantes
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 4;

    // Poste vertical
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(frontX - 2.5, y, 5, height, 2.5);
    else ctx.rect(frontX - 2.5, y, 5, height);
    ctx.fill();

    // Unión de esquina superior
    ctx.beginPath();
    ctx.arc(frontX, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Unión de esquina inferior
    ctx.beginPath();
    ctx.arc(frontX, y + height, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Línea de gol iluminada en césped
    ctx.fillStyle = isLeft ? '#3b82f6' : '#ef4444';
    ctx.fillRect(frontX - 1, y, 2, height);

    ctx.restore();
  }

  renderCornerWithFlag(ctx, x, y, startAngle, endAngle, flagDirX, flagDirY) {
    ctx.beginPath();
    ctx.arc(x, y, PITCH.CORNER_RADIUS, startAngle, endAngle);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1, y - 1, 3, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + flagDirX * 3, y + flagDirY * 3, flagDirX * 6, flagDirY * 4);
    ctx.restore();
  }
}
