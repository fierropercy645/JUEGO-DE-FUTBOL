import { Referee } from './Referee.js';
import { Pitch } from './Pitch.js';
import { Ball } from './Ball.js';
import { Team } from './Team.js';
import { MatchRules } from './MatchRules.js';
import { CollisionSystem } from './CollisionSystem.js';
import { GoalkeeperAI } from './GoalkeeperAI.js';
import { PlayerAI } from './PlayerAI.js';
import { MatchStatistics } from '../statistics/MatchStatistics.js';
import { PITCH, GAME_STATES, DIFFICULTY } from '../utils/constants.js';
import { distance, normalize } from '../utils/math.js';
import { sound } from '../audio/SoundFX.js';

export class Match {
  constructor(homeTeamData, awayTeamData, options = {}) {
    this.pitch = new Pitch(PITCH.WIDTH, PITCH.HEIGHT);
    this.homeTeam = new Team(homeTeamData, true, PITCH.WIDTH, PITCH.HEIGHT);
    this.awayTeam = new Team(awayTeamData, false, PITCH.WIDTH, PITCH.HEIGHT);
    this.ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);
    this.referee = new Referee(PITCH.WIDTH, PITCH.HEIGHT);

    this.state = GAME_STATES.PREPARED;
    this.difficulty = options.difficulty || DIFFICULTY.NORMAL;
    this.totalDurationSeconds = (options.durationMinutes || 3) * 60;
    this.elapsedSeconds = 0;

    this.userControlledPlayer = this.homeTeam.players[2] || this.homeTeam.players[0];
    this.userControlledPlayer.isControlled = true;

    this.stats = new MatchStatistics(options.matchId, homeTeamData, awayTeamData);

    this.stateTimer = 0;
    this.notification = null;
    this.lastGoalTime = 0;

    this.setupKickoff(this.homeTeam);
  }

  setupKickoff(kickingTeam) {
    this.state = GAME_STATES.KICKOFF;
    this.stateTimer = 1.2;

    this.homeTeam.resetPositions();
    this.awayTeam.resetPositions();

    this.ball.reset(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    const kickPlayer = kickingTeam.players.find(p => p.position === 'MID') || kickingTeam.players[2];
    kickPlayer.x = PITCH.WIDTH / 2 - (kickingTeam.isHome ? 15 : -15);
    kickPlayer.y = PITCH.HEIGHT / 2;
    this.ball.setOwner(kickPlayer);

    // Si saca nuestro equipo, el usuario toma el control del pateador inmediatamente
    if (kickingTeam.isHome) {
      this.setUserControlledPlayer(kickPlayer);
    }

    this.showBanner('SAQUE INICIAL', `Posesión: ${kickingTeam.name}`, 1.2);
  }

  setUserControlledPlayer(player) {
    if (!player || this.userControlledPlayer === player) return;
    if (this.userControlledPlayer) {
      this.userControlledPlayer.isControlled = false;
    }
    this.userControlledPlayer = player;
    this.userControlledPlayer.isControlled = true;
  }

  setupRestart(outEvent) {
    this.state = outEvent.type;
    this.stateTimer = 1.2;

    if (outEvent.type === GAME_STATES.THROW_IN) {
      const lastWasHome = this.ball.lastTouchedPlayer?.isHome;
      const awardedTeam = lastWasHome ? this.awayTeam : this.homeTeam;
      const taker = awardedTeam.players.find(p => p.position === 'MID') || awardedTeam.players[1];

      this.ball.reset(outEvent.x, outEvent.y);
      taker.x = outEvent.x;
      taker.y = outEvent.y;
      taker.facingX = awardedTeam.isHome ? 1 : -1;
      taker.facingY = outEvent.y < PITCH.HEIGHT / 2 ? 1 : -1;
      this.ball.setOwner(taker);

      if (awardedTeam.isHome) {
        this.setUserControlledPlayer(taker);
      }

      this.showBanner('SAQUE DE BANDA', `Balón para ${awardedTeam.name}`, 1.2);

    } else if (outEvent.type === GAME_STATES.GOAL_KICK) {
      const awardedTeam = outEvent.awardedSide === 'home' ? this.homeTeam : this.awayTeam;
      const gk = awardedTeam.players[0];

      this.ball.reset(outEvent.x, outEvent.y);
      gk.x = outEvent.x - (awardedTeam.isHome ? 15 : -15);
      gk.y = outEvent.y;
      gk.facingX = awardedTeam.isHome ? 1 : -1;
      gk.facingY = 0;
      this.ball.setOwner(gk);

      if (awardedTeam.isHome) {
        this.setUserControlledPlayer(gk);
      }

      this.showBanner('SAQUE DE META', `Reanuda ${awardedTeam.name}`, 1.2);

    } else if (outEvent.type === GAME_STATES.CORNER_KICK) {
      const awardedTeam = outEvent.awardedSide === 'home' ? this.homeTeam : this.awayTeam;
      const defendingTeam = outEvent.awardedSide === 'home' ? this.awayTeam : this.homeTeam;
      const taker = awardedTeam.players.find(p => p.position === 'FWD') || awardedTeam.players[3];

      this.ball.reset(outEvent.cornerX, outEvent.cornerY);
      taker.x = outEvent.cornerX;
      taker.y = outEvent.cornerY;
      taker.facingX = awardedTeam.isHome ? 1 : -1;
      taker.facingY = outEvent.cornerY < PITCH.HEIGHT / 2 ? 1 : -1;
      this.ball.setOwner(taker);
      this.stateTimer = 10.0; // Tiempo para centrar o patear olímpico

      // Posicionar jugadores en el área para cabecear o defender el centro de córner
      const penaltyBoxX = outEvent.side === 'left' ? 140 : PITCH.WIDTH - 140;
      const midBoxY = PITCH.HEIGHT / 2;

      // Atacantes al área para rematar de cabeza
      awardedTeam.players.forEach((p, idx) => {
        if (p !== taker && p.position !== 'GK') {
          p.x = penaltyBoxX + (idx === 1 ? -20 : 20);
          p.y = midBoxY + (idx === 1 ? -35 : 35);
          p.facingX = awardedTeam.isHome ? 1 : -1;
        }
      });

      // Defensores al área marcando
      defendingTeam.players.forEach((p, idx) => {
        if (p.position !== 'GK') {
          p.x = penaltyBoxX + (idx % 2 === 0 ? -10 : 10);
          p.y = midBoxY + (idx % 2 === 0 ? -25 : 25);
          p.facingX = defendingTeam.isHome ? 1 : -1;
        }
      });

      if (awardedTeam.isHome) {
        this.setUserControlledPlayer(taker);
      }

      this.showBanner('¡TIRO DE ESQUINA!', `Céntralo con PASE (J/A) o busca el Gol Olímpico con TIRO (Espacio/B)`, 3.2);
    }
  }

  showBanner(title, subtitle = '', duration = 2.0, isGoal = false) {
    this.notification = {
      text: title,
      subtitle: subtitle,
      timer: duration,
      isGoal: isGoal,
    };
  }

  handleUserControls(controls, dt) {
    if (this.state !== GAME_STATES.PLAYING &&
        this.state !== GAME_STATES.THROW_IN &&
        this.state !== GAME_STATES.GOAL_KICK &&
        this.state !== GAME_STATES.CORNER_KICK &&
        this.state !== GAME_STATES.FREE_KICK &&
        this.state !== GAME_STATES.PENALTY_KICK) {
      return;
    }

    if (controls.wasActionJustPressed('switchPlayer')) {
      this.switchUserPlayer();
    }

    // SELECCIÓN DIRECTA DE JUGADOR POR NÚMERO (1, 2, 3, 4, 5)
    for (let idx = 0; idx < 5; idx++) {
      if (controls.wasActionJustPressed(`selectP${idx + 1}`)) {
        const targetPlayer = this.homeTeam.players[idx];
        if (targetPlayer) {
          this.setUserControlledPlayer(targetPlayer);
          this.showBanner(`JUGADOR: ${targetPlayer.name}`, `#${targetPlayer.number} (${targetPlayer.position})`, 1.0);
        }
      }
    }

    if (!this.userControlledPlayer) return;

    const isSprinting = controls.isActionActive('sprint');
    const move = controls.getMovementVector();
    // Velocidad realista y cadenciosa: trote normal a 2.55, sprint con K a 3.35 afectado por fatiga
    const staminaRatio = (this.userControlledPlayer.currentStamina || 100) / 100;
    const speedMult = isSprinting ? (1.0 + 0.32 * staminaRatio) : (0.85 + 0.15 * staminaRatio);
    const playerSpeed = (this.userControlledPlayer.speed / 100) * 2.55 * speedMult;

    if (move.x !== 0 || move.y !== 0) {
      this.userControlledPlayer.vx = move.x * playerSpeed;
      this.userControlledPlayer.vy = move.y * playerSpeed;
      this.userControlledPlayer.facingX = move.x;
      this.userControlledPlayer.facingY = move.y;
    }

    // CONTROL DIRECTO DEL ARQUERO: Tecla G
    if (controls.wasActionJustPressed('selectGK')) {
      const homeGK = this.homeTeam.players[0];
      this.setUserControlledPlayer(homeGK);
      this.showBanner('¡CONTROLAS AL ARQUERO!', `${homeGK.name} listo para atajar`, 1.2);
    }

    // SOMBRERITO / VASELINA (Tiro picado por arriba del arquero): Tecla U
    if (controls.wasActionJustPressed('chipShot')) {
      if (this.ball.owner === this.userControlledPlayer) {
        this.executeChipShot(this.userControlledPlayer);
        if (this.state !== GAME_STATES.PLAYING) this.state = GAME_STATES.PLAYING;
      }
    }

    // TIRO CON ROSCA / COMBA AL ÁNGULO: Tecla O
    if (controls.wasActionJustPressed('curveShot')) {
      if (this.ball.owner === this.userControlledPlayer) {
        this.executeCurveShot(this.userControlledPlayer);
        if (this.state !== GAME_STATES.PLAYING) this.state = GAME_STATES.PLAYING;
      }
    }

    // JUGADA / REGATE ACROBÁTICO ("RAJAR" AL RIVAL CON UN QUIEBRE): Tecla L
    if (controls.wasActionJustPressed('dribble')) {
      if (this.ball.owner === this.userControlledPlayer) {
        this.executeDribbleSkill(this.userControlledPlayer);
      }
    }

    // BARRIDA / TACKLE FUERTE ("RAJAR" AL CONTRARIO Y QUITAR BALÓN): Tecla I
    if (controls.wasActionJustPressed('slideTackle')) {
      this.executeSlideTackle(this.userControlledPlayer);
    }

    // ACCIÓN ACTIVA DE QUITAR EL BALÓN CUERPO A CUERPO (Presión manual con ESPACIO o J sin balón)
    if (this.ball.owner && this.ball.owner !== this.userControlledPlayer && !this.userControlledPlayer.isHome === this.ball.owner.isHome) {
      if (controls.wasActionJustPressed('steal') || controls.isActionActive('steal')) {
        const d = distance(this.userControlledPlayer.x, this.userControlledPlayer.y, this.ball.x, this.ball.y);
        if (d < 38) {
          // Robar balón limpiamente y salir jugando
          this.ball.setOwner(this.userControlledPlayer);
          this.userControlledPlayer.controlTimer = 0.6;
          this.stats.recordInterception(this.userControlledPlayer.teamId);
          this.showBanner('¡BALÓN RECUPERADO!', `${this.userControlledPlayer.name} robó el balón para el contraataque`, 1.1);
        }
      }
    }

    // PASE
    if (controls.wasActionJustPressed('pass')) {
      if (this.ball.owner === this.userControlledPlayer) {
        this.executePass(this.userControlledPlayer);
        if (this.state !== GAME_STATES.PLAYING) this.state = GAME_STATES.PLAYING;
      }
    }

    // DISPARO CON CARGA DE POTENCIA (Mantén Espacio para cargar potencia, suelta para fusilar)
    if (this.ball.owner === this.userControlledPlayer) {
      if (controls.isActionActive('shoot')) {
        this.userControlledPlayer.isChargingShot = true;
        this.userControlledPlayer.shotCharge = Math.min(1.0, this.userControlledPlayer.shotCharge + dt * 1.5);
      } else if (this.userControlledPlayer.isChargingShot) {
        const chargeRatio = Math.max(0.2, this.userControlledPlayer.shotCharge);
        this.userControlledPlayer.isChargingShot = false;
        this.userControlledPlayer.shotCharge = 0;
        this.executeShot(this.userControlledPlayer, chargeRatio);
        if (this.state !== GAME_STATES.PLAYING) this.state = GAME_STATES.PLAYING;
      }
    } else {
      this.userControlledPlayer.isChargingShot = false;
      this.userControlledPlayer.shotCharge = 0;
    }
  }

  executeDribbleSkill(player) {
    player.triggerDribbleSkill();
    player.controlTimer = 0.6; // Inmunidad durante la jugada
    // Impulso hacia adelante
    player.vx = player.facingX * 5.0;
    player.vy = player.facingY * 5.0;

    // "Rajar" ÚNICAMENTE al rival directo que está peleando cuerpo a cuerpo contigo (el más cercano dentro de 30px)
    const oppTeam = player.isHome ? this.awayTeam : this.homeTeam;
    let directRival = null;
    let minDistance = 30; // Solo si está encima peleando contigo

    oppTeam.players.forEach(opp => {
      if (opp.position !== 'GK') {
        const d = distance(player.x, player.y, opp.x, opp.y);
        if (d < minDistance) {
          minDistance = d;
          directRival = opp;
        }
      }
    });

    if (directRival) {
      directRival.triggerStun(1.3); // Solo él queda en el suelo burlado
      this.showBanner('¡QUÉ JUGADOTA!', `${player.name} dejó en el camino a ${directRival.name}`, 1.2);
    }
  }

  executeSlideTackle(player) {
    player.vx = player.facingX * 6.5;
    player.vy = player.facingY * 6.5;
    player.kickCooldown = 0.5;

    // Solo al rival con el que estás disputando cuerpo a cuerpo (< 28px)
    const oppTeam = player.isHome ? this.awayTeam : this.homeTeam;
    let tackledRival = null;
    let minDistance = 28;

    oppTeam.players.forEach(opp => {
      if (opp.position !== 'GK') {
        const d = distance(player.x, player.y, opp.x, opp.y);
        if (d < minDistance) {
          minDistance = d;
          tackledRival = opp;
        }
      }
    });

    if (tackledRival) {
      tackledRival.triggerStun(1.4);

      // Evaluación del Árbitro: ¿Fue barrida a destiempo? (Falta o Penal)
      const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
      const fieldRight = PITCH.WIDTH - fieldLeft;
      const isFoul = Math.random() < 0.50; // 50% de probabilidad de falta en barridas

      if (isFoul) {
        sound.playWhistle();
        const isRedCard = Math.random() < 0.20; // 20% roja directa, 80% amarilla
        this.referee.blowWhistle(2.2, isRedCard ? 'red' : 'yellow');

        // Acercar al árbitro al lugar de la infracción
        this.referee.x = player.x + (player.facingX >= 0 ? -25 : 25);
        this.referee.y = player.y - 15;

        const cardText = isRedCard ? '🟥 TARJETA ROJA' : '🟨 TARJETA AMARILLA';
        const inPenaltyArea = player.isHome
          ? (tackledRival.x > fieldRight - PITCH.PENALTY_AREA_WIDTH)
          : (tackledRival.x < fieldLeft + PITCH.PENALTY_AREA_WIDTH);

        if (inPenaltyArea) {
          this.triggerPenaltyKick(player.isHome ? this.homeTeam : this.awayTeam, tackledRival);
          this.showBanner(`${cardText} • ¡PENAL!`, `${player.name} cometió falta en el área`, 2.5);
        } else {
          this.triggerFreeKick(player.isHome ? this.homeTeam : this.awayTeam, tackledRival);
          this.showBanner(`${cardText} • ¡FALTA!`, `${player.name} derribó a ${tackledRival.name}`, 2.2);
        }
        return;
      }

      if (this.ball.owner === tackledRival) {
        this.ball.setOwner(player);
        this.stats.recordInterception(player.teamId);
        this.showBanner('¡BARRIDA LIMPIA!', `${player.name} recupera con todo`, 1.0);
      }
    }
  }

  triggerPenaltyKick(awardedTeam, fouledPlayer) {
    this.state = GAME_STATES.PENALTY_KICK;
    this.stateTimer = 15.0; // Tiempo para que el jugador apunte, cargue potencia y patee

    const isHome = awardedTeam.isHome;
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = PITCH.WIDTH - fieldLeft;
    const penaltyX = isHome ? (fieldRight - PITCH.PENALTY_SPOT_DIST) : (fieldLeft + PITCH.PENALTY_SPOT_DIST);
    const penaltyY = PITCH.HEIGHT / 2;

    this.ball.reset(penaltyX, penaltyY);
    fouledPlayer.x = penaltyX - (isHome ? 22 : -22);
    fouledPlayer.y = penaltyY;
    fouledPlayer.facingX = isHome ? 1 : -1;
    fouledPlayer.facingY = 0;
    this.ball.setOwner(fouledPlayer);

    // El arquero rival se planta en la línea de gol listo para atajar
    const defendingTeam = isHome ? this.awayTeam : this.homeTeam;
    const gk = defendingTeam.players[0];
    gk.x = isHome ? fieldRight - 15 : fieldLeft + 15;
    gk.y = penaltyY;

    if (isHome) {
      this.setUserControlledPlayer(fouledPlayer);
    }

    this.showBanner('¡PENAAAAAL!', `Carga potencia con ESPACIO / B para patear al arco`, 3.5);
  }

  triggerFreeKick(awardedTeam, fouledPlayer) {
    this.state = GAME_STATES.FREE_KICK;
    this.stateTimer = 12.0; // Tiempo suficiente para acomodarse y patear el tiro libre

    this.ball.reset(fouledPlayer.x, fouledPlayer.y);
    fouledPlayer.facingX = awardedTeam.isHome ? 1 : -1;
    fouledPlayer.facingY = 0;
    this.ball.setOwner(fouledPlayer);

    // Formar barrera defensiva con 2 jugadores del equipo rival a distancia reglamentaria
    const defendingTeam = awardedTeam.isHome ? this.awayTeam : this.homeTeam;
    const wallDist = awardedTeam.isHome ? 75 : -75;
    const wallPlayers = defendingTeam.players.filter(p => p.position !== 'GK').slice(0, 2);
    wallPlayers.forEach((wp, idx) => {
      wp.x = fouledPlayer.x + wallDist;
      wp.y = fouledPlayer.y + (idx === 0 ? -16 : 16);
      wp.vx = 0;
      wp.vy = 0;
      wp.facingX = awardedTeam.isHome ? -1 : 1;
    });

    if (awardedTeam.isHome) {
      this.setUserControlledPlayer(fouledPlayer);
    }

    this.showBanner('¡TIRO LIBRE POR FALTA!', `Patea con ESPACIO/B o pasa con J/A`, 3.0);
  }

  switchUserPlayer() {
    const fieldPlayers = this.homeTeam.players.filter(p => p.position !== 'GK');
    if (fieldPlayers.length === 0) return;

    // Predicción de trayectoria del balón para interceptar hacia adelante
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const predictedBallX = this.ball.x + (ballSpeed > 0.5 ? this.ball.vx * 20 : 0);
    const predictedBallY = this.ball.y + (ballSpeed > 0.5 ? this.ball.vy * 20 : 0);

    // Si pulsas Q/TAB, seleccionamos al jugador que está MÁS ADELANTADO o mejor perfilado
    // para picar al espacio, cortar el balón o recibir en carrera.
    const candidates = fieldPlayers.filter(p => p !== this.userControlledPlayer);
    if (candidates.length === 0) return;

    let bestPlayer = null;
    let bestScore = -Infinity;

    candidates.forEach(p => {
      // 1. Distancia a donde va o está el balón
      const dist = distance(p.x, p.y, predictedBallX, predictedBallY);
      
      // 2. Ventaja de posición adelantada (hacia el arco rival a la derecha x > ball.x)
      const forwardAdvantage = (p.x - this.ball.x);

      // Si el balón va hacia adelante, priorizar al compañero que ya está adelante para anticipar
      let score = -dist;
      if (this.ball.vx > 0.5) {
        // El balón avanza: gran prioridad a los que están adelante de la jugada
        score += forwardAdvantage * 1.5;
      } else {
        // En disputa: el que esté más cerca del punto de corte
        score -= dist * 0.8;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPlayer = p;
      }
    });

    if (bestPlayer) {
      this.setUserControlledPlayer(bestPlayer);
      this.showBanner(`ANTICIPACIÓN: ${bestPlayer.name}`, `Listo para picar y cortar el balón`, 0.8);
    }
  }

  selectPlayerAtCoordinates(clickX, clickY) {
    // Buscar el jugador de nuestro equipo más cercano al clic (radio hasta 45px)
    let selected = null;
    let minD = 45;

    this.homeTeam.players.forEach(p => {
      const d = distance(p.x, p.y, clickX, clickY);
      if (d < minD) {
        minD = d;
        selected = p;
      }
    });

    if (selected) {
      this.setUserControlledPlayer(selected);
      this.showBanner(`SELECCIONASTE A: ${selected.name}`, `#${selected.number} (${selected.position})`, 1.2);
      return true;
    }
    return false;
  }

  executePass(passer) {
    const isHome = passer.isHome;
    const team = isHome ? this.homeTeam : this.awayTeam;
    const mates = team.players.filter(p => p !== passer && p.position !== 'GK');

    let bestMate = null;
    let highestScore = -Infinity;

    mates.forEach(mate => {
      const dirToMate = normalize(mate.x - passer.x, mate.y - passer.y);
      const dot = dirToMate.x * passer.facingX + dirToMate.y * passer.facingY;
      const dist = distance(passer.x, passer.y, mate.x, mate.y);
      const score = dot * 2 - (dist / PITCH.WIDTH);
      if (score > highestScore) {
        highestScore = score;
        bestMate = mate;
      }
    });

    const passDir = bestMate
      ? normalize(bestMate.x - passer.x, bestMate.y - passer.y)
      : { x: passer.facingX, y: passer.facingY };

    const power = 7.5 + (passer.pass / 100) * 4.0;
    this.ball.kick(passDir.x * power, passDir.y * power, passer);
    passer.kickCooldown = 0.3;

    this.stats.recordPass(passer.teamId, false);
  }

  executeShot(shooter, chargeRatio = 0.5) {
    const isHome = shooter.isHome;
    const fieldRight = PITCH.WIDTH - (PITCH.FIELD_MARGIN_X || 60);
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const targetGoalX = isHome ? fieldRight : fieldLeft;
    const targetGoalY = PITCH.HEIGHT / 2 + (Math.random() - 0.5) * (PITCH.GOAL_WIDTH * 0.8);

    const dir = normalize(targetGoalX - shooter.x, targetGoalY - shooter.y);

    const inaccuracy = (100 - shooter.shotAccuracy) / 100 * 0.25;
    const spreadAngle = (Math.random() - 0.5) * inaccuracy;
    const cosA = Math.cos(spreadAngle);
    const sinA = Math.sin(spreadAngle);
    const finalDirX = dir.x * cosA - dir.y * sinA;
    const finalDirY = dir.x * sinA + dir.y * cosA;

    // POTENCIA GRADUAL CONTROLADA POR EL USUARIO (Segun la barra de carga 0 a 1)
    // Va desde 9.0 (tiro suave colocado) hasta 24.0 (autentico misil imparable)
    const power = (9.0 + chargeRatio * 13.0) + (shooter.shotPower / 100) * 4.0;
    this.ball.kick(finalDirX * power, finalDirY * power, shooter);
    shooter.kickCooldown = 0.35;
    sound.playKick();

    // Disparar animación de patada y golpeo enérgico
    shooter.facingX = finalDirX;
    shooter.facingY = finalDirY;
    shooter.triggerShootAnimation();

    const isHeadingToGoal = Math.abs(finalDirY) < 0.6;
    this.stats.recordShot(shooter.teamId, isHeadingToGoal);
  }

  executeChipShot(shooter) {
    const isHome = shooter.isHome;
    const fieldRight = PITCH.WIDTH - (PITCH.FIELD_MARGIN_X || 60);
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const targetGoalX = isHome ? fieldRight : fieldLeft;
    const targetGoalY = PITCH.HEIGHT / 2;

    const dir = normalize(targetGoalX - shooter.x, targetGoalY - shooter.y);
    const power = 8.5 + (shooter.shotPower / 100) * 2.0;

    // Disparo elevado estilo vaselina (pasa por arriba del arquero)
    this.ball.kick(dir.x * power, dir.y * power, shooter, {
      altitude: 12,
      verticalVelocity: 7.5,
    });

    shooter.kickCooldown = 0.4;
    shooter.facingX = dir.x;
    shooter.facingY = dir.y;
    shooter.triggerShootAnimation();

    this.stats.recordShot(shooter.teamId, true);
    this.showBanner('¡VASELINA / SOMBRERITO!', `${shooter.name} la picó por arriba`, 1.3);
  }

  executeCurveShot(shooter) {
    const isHome = shooter.isHome;
    const fieldRight = PITCH.WIDTH - (PITCH.FIELD_MARGIN_X || 60);
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const targetGoalX = isHome ? fieldRight : fieldLeft;
    // Apunta al ángulo superior o inferior
    const targetCornerY = shooter.y < PITCH.HEIGHT / 2 ? PITCH.HEIGHT / 2 - 50 : PITCH.HEIGHT / 2 + 50;

    const dir = normalize(targetGoalX - shooter.x, targetCornerY - shooter.y);
    const power = 11.5 + (shooter.shotPower / 100) * 4.5;
    const curveSign = shooter.y < PITCH.HEIGHT / 2 ? 0.35 : -0.35;

    // Disparo con rosca / comba curva hacia la escuadra
    this.ball.kick(dir.x * power, dir.y * power, shooter, {
      curve: curveSign,
    });

    shooter.kickCooldown = 0.4;
    shooter.facingX = dir.x;
    shooter.facingY = dir.y;
    shooter.triggerShootAnimation();

    this.stats.recordShot(shooter.teamId, true);
    this.showBanner('¡TIRO CON ROSCA!', `${shooter.name} sacó un disparo curvado al ángulo`, 1.3);
  }

  update(dt) {
    if (this.state === GAME_STATES.PAUSED || this.state === GAME_STATES.FINISHED) {
      return;
    }

    if (this.notification) {
      this.notification.timer -= dt;
      if (this.notification.timer <= 0) {
        this.notification = null;
      }
    }

    if (this.state === GAME_STATES.KICKOFF ||
        this.state === GAME_STATES.THROW_IN ||
        this.state === GAME_STATES.GOAL_KICK ||
        this.state === GAME_STATES.CORNER_KICK ||
        this.state === GAME_STATES.FOUL ||
        this.state === GAME_STATES.PENALTY_KICK ||
        this.state === GAME_STATES.FREE_KICK) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = GAME_STATES.PLAYING;
      }
    }

    if (this.state === GAME_STATES.GOAL) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        const kickoffTeam = this.lastScoringTeam === 'home' ? this.awayTeam : this.homeTeam;
        this.setupKickoff(kickoffTeam);
      }
      return;
    }

    if (this.state === GAME_STATES.PLAYING) {
      this.elapsedSeconds += dt;
      const activePossessionTeamId = this.ball.owner ? this.ball.owner.teamId : null;
      this.stats.updatePossession(activePossessionTeamId, dt);

      if (this.elapsedSeconds >= this.totalDurationSeconds) {
        this.finishMatch();
        return;
      }
    }

    // AI Updates
    const homeGK = this.homeTeam.players[0];
    const awayGK = this.awayTeam.players[0];
    GoalkeeperAI.update(homeGK, this.ball, PITCH.WIDTH, PITCH.HEIGHT, this.difficulty, null, dt);
    GoalkeeperAI.update(awayGK, this.ball, PITCH.WIDTH, PITCH.HEIGHT, this.difficulty, null, dt);

    this.homeTeam.players.forEach(p => {
      if (p !== this.userControlledPlayer && p !== homeGK) {
        PlayerAI.update(
          p,
          this.ball,
          this.homeTeam,
          this.awayTeam,
          PITCH.WIDTH,
          PITCH.HEIGHT,
          this.difficulty,
          this.executePass.bind(this),
          this.executeShot.bind(this)
        );
      }
    });

    this.awayTeam.players.forEach(p => {
      if (p !== awayGK) {
        PlayerAI.update(
          p,
          this.ball,
          this.awayTeam,
          this.homeTeam,
          PITCH.WIDTH,
          PITCH.HEIGHT,
          this.difficulty,
          this.executePass.bind(this),
          this.executeShot.bind(this)
        );
      }
    });

    this.homeTeam.update(dt, PITCH.WIDTH, PITCH.HEIGHT);
    this.awayTeam.update(dt, PITCH.WIDTH, PITCH.HEIGHT);
    this.ball.update(dt, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    this.pitch.update(dt);
    this.referee.update(dt, this.ball);

    const allPlayers = [...this.homeTeam.players, ...this.awayTeam.players];
    CollisionSystem.separatePlayers(allPlayers);

    // Detección de posesión e intercepciones
    allPlayers.forEach(p => {
      CollisionSystem.checkPlayerBall(p, this.ball, (stealer) => {
        this.stats.recordInterception(stealer.teamId);
      });
    });

    // FALTAS Y BARRIDAS DEL RIVAL (IA comete faltas en disputas divididas)
    // Idempotencia: Solo evaluar si el partido está en juego activo (PLAYING)
    if (this.state === GAME_STATES.PLAYING && this.ball.owner && this.ball.owner.isHome) {
      const oppPlayers = this.awayTeam.players.filter(p => p.position !== 'GK');
      for (const opp of oppPlayers) {
        const d = distance(opp.x, opp.y, this.ball.owner.x, this.ball.owner.y);
        // Si el rival llega a destiempo por detrás / costado a menos de 22px
        if (d < 22 && Math.random() < 0.008) {
          const userVictim = this.ball.owner;
          userVictim.triggerStun(1.5);
          sound.playWhistle();

          const isRed = Math.random() < 0.18;
          this.referee.blowWhistle(2.2, isRed ? 'red' : 'yellow');
          this.referee.x = userVictim.x - 20;
          this.referee.y = userVictim.y - 10;

          const cardTxt = isRed ? '🟥 ROJA DIRECTA' : '🟨 TARJETA AMARILLA';
          const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
          const fieldRight = PITCH.WIDTH - fieldLeft;
          const inPenaltyArea = userVictim.x > fieldRight - PITCH.PENALTY_AREA_WIDTH;

          if (inPenaltyArea) {
            this.triggerPenaltyKick(this.homeTeam, userVictim);
            this.showBanner(`${cardTxt} • ¡PENAL A FAVOR!`, `${opp.name} cometió penal sobre ${userVictim.name}`, 2.5);
          } else {
            this.triggerFreeKick(this.homeTeam, userVictim);
            this.showBanner(`${cardTxt} • ¡FALTA RIVAL!`, `${opp.name} bajó a ${userVictim.name}`, 2.2);
          }
          return; // Detener evaluación inmediata en este fotograma
        }
      }
    }

    // CAMBIO INMEDIATO AL JUGADOR QUE RECIBE EL BALÓN:
    // Si el balón llega a los pies de cualquiera de nuestros jugadores (pase, rebote, intercepción),
    // el cursor y control cambian AL INSTANTE a ese futbolista.
    if (this.ball.owner && this.ball.owner.isHome) {
      if (this.userControlledPlayer !== this.ball.owner) {
        this.setUserControlledPlayer(this.ball.owner);
      }
    }

    // Cambio automático inteligente:
    // Solo cambiar si el balón llegó directamente a otro compañero,
    // o si el usuario no ha tomado el control manual reciente de otro jugador adelantado
    if (this.state === GAME_STATES.PLAYING && !this.ball.owner) {
      const fieldHome = this.homeTeam.players.filter(p => p.position !== 'GK');
      let closestTeammate = fieldHome[0];
      let minDist = Infinity;
      fieldHome.forEach(p => {
        const d = distance(p.x, p.y, this.ball.x, this.ball.y);
        if (d < minDist) {
          minDist = d;
          closestTeammate = p;
        }
      });
      // Umbral cerrado (< 40px) para no quitarte el control si decidiste seleccionar un jugador adelantado
      if (minDist < 40 && closestTeammate !== this.userControlledPlayer) {
        this.setUserControlledPlayer(closestTeammate);
      }
    }

    // Detección de paradas y recepción del arquero con dificultad real
    // Solo si el balón está libre sin dueño
    if (this.state === GAME_STATES.PLAYING && !this.ball.owner) {
      CollisionSystem.checkGoalkeeperSave(homeGK, this.ball, () => {
        this.stats.recordSave(this.homeTeam.id);
        this.showBanner('¡ATAJADÓN!', `${homeGK.name} salva el gol`, 1.2);
      }, this.difficulty);
      CollisionSystem.checkGoalkeeperSave(awayGK, this.ball, () => {
        this.stats.recordSave(this.awayTeam.id);
        this.showBanner('¡PARADÓN DEL ARQUERO!', `${awayGK.name} tapa el remate`, 1.2);
      }, this.difficulty);
    }

    // REGLAS DEL PARTIDO: Gol y Salidas (Solo se ejecutan si el partido está en juego activo PLAYING)
    if (this.state === GAME_STATES.PLAYING) {
      const goalResult = MatchRules.checkGoal(this.ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
      if (goalResult) {
        this.triggerGoal(goalResult);
        return;
      }

      const outEvent = MatchRules.checkOutOfBounds(this.ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
      if (outEvent) {
        this.setupRestart(outEvent);
        return;
      }
    }
  }

  triggerGoal(scoringSide) {
    this.state = GAME_STATES.GOAL;
    this.stateTimer = 3.2; // Tiempo suficiente para disfrutar el gol y la celebración
    this.lastScoringTeam = scoringSide;

    // SACUDIDA ESPECTACULAR DE LA RED (Ondulación elástica y vibración al inflarse la red)
    const goalNetSide = scoringSide === 'home' ? 'right' : 'left';
    this.pitch.triggerNetShake(goalNetSide, 2.0);

    const scoringTeam = scoringSide === 'home' ? this.homeTeam : this.awayTeam;
    const scorer = this.ball.lastTouchedPlayer || scoringTeam.players[3];
    const matchMinute = Math.min(90, Math.floor((this.elapsedSeconds / this.totalDurationSeconds) * 90) + 1);

    this.stats.recordGoal(scoringTeam.id, scorer.name, matchMinute);

    // Activar celebración eufórica en todos los futbolistas del equipo anotador
    scoringTeam.players.forEach(p => p.celebrate(3.2));

    // EMITIR SONIDO Y NARRACIÓN DE GOL (¡GOOOOOOL!) Y OVACIÓN DE LA HINCHADA
    sound.playGoalCelebration();

    this.showBanner(`⚽ ¡GOOOOOOOOOOL! ⚽`, `${scoringTeam.name.toUpperCase()} • ${scorer.name} (${matchMinute}')`, 3.0, true);
  }

  finishMatch() {
    // Si el partido termina empatado, ¡NOS VAMOS A TANDA DE PENALES! (Definición a penales)
    if (this.stats.homeGoals === this.stats.awayGoals && this.state !== GAME_STATES.PENALTY_SHOOTOUT) {
      this.triggerPenaltyShootout();
      return;
    }

    this.state = GAME_STATES.FINISHED;
    this.showBanner('¡FINAL DEL PARTIDO!', 'Consulta el informe y estadísticas', 10.0);
  }

  triggerPenaltyShootout() {
    this.state = GAME_STATES.PENALTY_SHOOTOUT;
    this.stateTimer = 2.0;

    // Colocar el balón en el punto penal frente a la portería derecha
    const fieldRight = PITCH.WIDTH - (PITCH.FIELD_MARGIN_X || 60);
    const penaltyX = fieldRight - PITCH.PENALTY_SPOT_DIST;
    const penaltyY = PITCH.HEIGHT / 2;

    this.ball.reset(penaltyX, penaltyY);

    // Tu delantero estrella se para frente al punto penal
    const penaltyTaker = this.homeTeam.players[3] || this.homeTeam.players[2];
    penaltyTaker.x = penaltyX - 22;
    penaltyTaker.y = penaltyY;
    penaltyTaker.facingX = 1;
    penaltyTaker.facingY = 0;
    this.ball.setOwner(penaltyTaker);
    this.setUserControlledPlayer(penaltyTaker);

    // El arquero rival se planta en la línea de gol
    const awayGK = this.awayTeam.players[0];
    awayGK.x = fieldRight - 15;
    awayGK.y = penaltyY;

    this.referee.x = penaltyX - 40;
    this.referee.y = penaltyY - 70;
    this.referee.blowWhistle(2.0);

    this.showBanner('¡EMPATE! TANDA DE PENALES', 'Define el partido desde los 11 metros (Carga potencia con Espacio)', 3.5);
  }

  pause() {
    if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.KICKOFF) {
      this.previousState = this.state;
      this.state = GAME_STATES.PAUSED;
    }
  }

  resume() {
    if (this.state === GAME_STATES.PAUSED) {
      this.state = this.previousState || GAME_STATES.PLAYING;
    }
  }

  getSimulatedMinute() {
    return Math.min(90, Math.floor((this.elapsedSeconds / this.totalDurationSeconds) * 90));
  }

  render(ctx) {
    this.pitch.render(ctx);
    this.homeTeam.render(ctx);
    this.awayTeam.render(ctx);
    this.ball.render(ctx);
    this.referee.render(ctx);

    // El Canvas queda 100% libre y despejado sin ningún cuadro negro ni textos que tapen la cancha
  }
}
