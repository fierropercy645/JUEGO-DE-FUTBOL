import { clamp, distance, normalize } from '../utils/math.js';

export class Referee {
  constructor(pitchWidth, pitchHeight) {
    this.x = pitchWidth / 2;
    this.y = pitchHeight / 2 - 80;
    this.vx = 0;
    this.vy = 0;
    this.facingX = 1;
    this.facingY = 0;
    this.pitchWidth = pitchWidth;
    this.pitchHeight = pitchHeight;
    this.whistleTimer = 0;
    this.animTimer = 0;
  }

  blowWhistle(duration = 1.5) {
    this.whistleTimer = duration;
  }

  update(dt, ball) {
    if (this.whistleTimer > 0) {
      this.whistleTimer -= dt;
    }

    // El árbitro sigue la jugada diagonalmente a una distancia prudente (unos 100-140px del balón)
    const targetX = clamp(ball.x - 70 * (ball.vx >= 0 ? 1 : -1), 100, this.pitchWidth - 100);
    const targetY = clamp(ball.y + (ball.y < this.pitchHeight / 2 ? 80 : -80), 80, this.pitchHeight - 80);

    const dist = distance(this.x, this.y, targetX, targetY);
    if (dist > 25) {
      const dir = normalize(targetX - this.x, targetY - this.y);
      const spd = 2.4;
      this.vx = dir.x * spd;
      this.vy = dir.y * spd;
      this.facingX = dir.x;
      this.facingY = dir.y;
      this.animTimer += dt * 8;
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
  }

  render(ctx) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const px = Math.round(this.x);
    const py = Math.round(this.y);

    // Sombra del árbitro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(px - 9, py + 8, 18, 5);

    // Bip / Silbato visual flotante si pitó falta o penal
    if (this.whistleTimer > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ ¡PIIIIP! ⚡', px - 28, py - 26);

      // Tarjeta en mano levantada
      ctx.fillStyle = '#ffee00'; // Tarjeta amarilla
      ctx.fillRect(px + (this.facingX >= 0 ? 8 : -14), py - 24, 7, 10);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + (this.facingX >= 0 ? 8 : -14), py - 24, 7, 10);
    }

    // Cuerpo del Árbitro (Uniforme clásico Amarillo Flúor / Negro de la FIFA)
    const isMoving = Math.hypot(this.vx, this.vy) > 0.2;
    const legOffset = isMoving ? Math.sin(this.animTimer) * 3 : 0;
    const skinColor = '#ffcca3';
    const refYellow = '#eab308'; // Camiseta amarilla oficial de réferi

    // Cabeza y pelo negro
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(px - 5, py - 16, 10, 5);
    ctx.fillStyle = skinColor;
    ctx.fillRect(px - 4, py - 11, 8, 5);

    // Ojos
    ctx.fillStyle = '#000000';
    const eyeOff = this.facingX >= 0 ? 1 : -2;
    ctx.fillRect(px - 2 + eyeOff, py - 9, 2, 2);

    // Camiseta amarilla de árbitro con cuello negro
    ctx.fillStyle = refYellow;
    ctx.fillRect(px - 6, py - 6, 12, 9);
    ctx.fillStyle = '#000000';
    ctx.fillRect(px - 2, py - 6, 4, 3); // Cuello negro

    // Brazos con silbato
    ctx.fillStyle = skinColor;
    ctx.fillRect(px - 8, py - 4, 2, 6);
    ctx.fillRect(px + 6, py - 4, 2, 6);

    // Pantalones cortos negros de réferi
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px - 5, py + 3, 10, 5);

    // Piernas y medias
    ctx.fillStyle = skinColor;
    ctx.fillRect(px - 4, py + 8, 3, 4 + legOffset);
    ctx.fillRect(px + 1, py + 8, 3, 4 - legOffset);

    // Zapatos negros
    ctx.fillStyle = '#000000';
    ctx.fillRect(px - 5, py + 12 + legOffset, 4, 3);
    ctx.fillRect(px + 1, py + 12 - legOffset, 4, 3);

    // Etiqueta ÁRBITRO
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ÁRBITRO', px, py - 18);

    ctx.restore();
  }
}
