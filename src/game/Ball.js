export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 7;
    this.friction = 0.986;
    this.owner = null;
    this.lastTouchedPlayer = null;
    this.lastTouchedTeamId = null;

    // Efecto de tiro con comba / rosca y vaselina por elevación
    this.curveSpinY = 0; // Efecto Magnus en el aire
    this.altitude = 0;   // Altura en el aire para sombreritos / vaselinas
    this.verticalVelocity = 0;

    // Animación de rotación 3D pixelada y estela de velocidad
    this.rotationAngle = 0;
    this.trail = [];
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.altitude = 0;
    this.verticalVelocity = 0;
    this.curveSpinY = 0;
    this.trail = [];
    this.release();
  }

  setOwner(player) {
    this.owner = player;
    this.lastTouchedPlayer = player;
    this.lastTouchedTeamId = player.teamId;
    this.vx = 0;
    this.vy = 0;
    this.altitude = 0;
    this.verticalVelocity = 0;
    this.curveSpinY = 0;
    this.trail = [];
  }

  release() {
    this.owner = null;
  }

  kick(vx, vy, player = null, options = {}) {
    this.release();
    this.vx = vx;
    this.vy = vy;
    this.trail = [];
    this.curveSpinY = options.curve || 0;
    this.altitude = options.altitude || 0;
    this.verticalVelocity = options.verticalVelocity || 0;

    if (player) {
      this.lastTouchedPlayer = player;
      this.lastTouchedTeamId = player.teamId;
    }
  }

  update(dt, pitchWidth, pitchHeight, goalWidth) {
    if (this.owner) {
      const angle = Math.atan2(this.owner.facingY, this.owner.facingX);
      const leadDist = 16;
      this.x = this.owner.x + Math.cos(angle) * leadDist;
      this.y = this.owner.y + Math.sin(angle) * leadDist;
      this.vx = this.owner.vx;
      this.vy = this.owner.vy;
      this.altitude = 0;
      this.rotationAngle += Math.hypot(this.vx, this.vy) * 0.15;
      return;
    }

    const speed = Math.hypot(this.vx, this.vy);

    // Aplicar comba / rosca en el aire
    if (this.curveSpinY !== 0) {
      this.vy += this.curveSpinY * dt * 30;
      this.curveSpinY *= 0.96;
    }

    // Físicas de altura (sombreritos / vaselinas)
    if (this.altitude > 0 || this.verticalVelocity > 0) {
      this.altitude += this.verticalVelocity * dt * 40;
      this.verticalVelocity -= 0.35; // Gravedad
      if (this.altitude <= 0) {
        this.altitude = 0;
        this.verticalVelocity = 0;
      }
    }

    if (speed > 7.5 || this.altitude > 4) {
      this.trail.unshift({ x: this.x, y: this.y - this.altitude, alpha: 1.0 });
      if (this.trail.length > 5) this.trail.pop();
    } else {
      if (this.trail.length > 0) this.trail.pop();
    }

    this.rotationAngle += speed * 0.2;

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    this.vx *= Math.pow(this.friction, dt * 60);
    this.vy *= Math.pow(this.friction, dt * 60);

    if (Math.hypot(this.vx, this.vy) < 0.05 && this.altitude <= 0) {
      this.vx = 0;
      this.vy = 0;
      this.trail = [];
    }

    // Rebote en postes
    const fieldLeft = 60;
    const fieldRight = pitchWidth - 60;
    const goalTop = (pitchHeight - goalWidth) / 2;
    const goalBottom = (pitchHeight + goalWidth) / 2;
    const postRadius = 6;

    const posts = [
      { x: fieldLeft, y: goalTop },
      { x: fieldLeft, y: goalBottom },
      { x: fieldRight, y: goalTop },
      { x: fieldRight, y: goalBottom }
    ];

    posts.forEach(post => {
      const dx = this.x - post.x;
      const dy = this.y - post.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.radius + postRadius) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        this.vx = nx * Math.abs(this.vx || 3) * 0.85;
        this.vy = ny * Math.abs(this.vy || 3) * 0.85;
      }
    });

    // Fondo de la red
    if (this.x < fieldLeft - 38 && this.y >= goalTop && this.y <= goalBottom) {
      this.x = fieldLeft - 38;
      this.vx = -this.vx * 0.2;
    } else if (this.x > fieldRight + 38 && this.y >= goalTop && this.y <= goalBottom) {
      this.x = fieldRight + 38;
      this.vx = -this.vx * 0.2;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;

    // 1. Estela de fuego / cometa en tiros potentes o con rosca
    if (this.trail.length > 0) {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const progress = i / this.trail.length;
        const radius = Math.max(2, 6 * (1 - progress));
        const alpha = (1 - progress) * 0.6;

        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? `rgba(255, 220, 0, ${alpha})` : (i < 3 ? `rgba(255, 120, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`);
        ctx.fill();
      }
    }

    const bx = Math.round(this.x);
    const by = Math.round(this.y - this.altitude); // Elevación en el aire

    // Sombra dinámica en el césped con degradado suave
    const shadowScale = Math.max(3, 8 - this.altitude * 0.35);
    const shadowAlpha = Math.max(0.12, 0.45 - this.altitude * 0.02);
    ctx.beginPath();
    ctx.ellipse(bx, Math.round(this.y) + 5, shadowScale, shadowScale * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(this.rotationAngle);

    // Balón esférico realista con sombreado 3D
    const ballGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.7, '#e2e8f0');
    ballGrad.addColorStop(1, '#94a3b8');

    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = ballGrad;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Pentágonos clásicos de cuero (Telstar)
    ctx.fillStyle = '#0f172a';
    // Centro
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Parches satélite
    ctx.beginPath();
    ctx.arc(-3.5, -3, 1.3, 0, Math.PI * 2);
    ctx.arc(3.5, -3, 1.3, 0, Math.PI * 2);
    ctx.arc(-3, 3.5, 1.3, 0, Math.PI * 2);
    ctx.arc(3, 3.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}
