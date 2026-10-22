import { Player } from './Player.js';
import { PITCH } from '../utils/constants.js';

export class Team {
  constructor(data, isHome, pitchWidth, pitchHeight, formation = '4-3-3') {
    this.id = data.id;
    this.name = data.name;
    this.shortName = data.shortName;
    this.primaryColor = data.primaryColor || '#e63946';
    this.secondaryColor = data.secondaryColor || '#ffffff';
    this.overall = data.overall || 80;
    this.isHome = isHome;
    this.formation = data.formation || formation;

    // Regulación de sustituciones profesionales: máximo 3 cambios por partido
    this.substitutionsRemaining = 3;
    this.substitutionsMade = 0;
    this.substitutionsHistory = [];

    this.players = []; // Los 5 jugadores titulares activos en la cancha
    this.bench = [];   // Los suplentes disponibles en el banquillo

    this.initializePlayers(data.players || [], pitchWidth, pitchHeight);
  }

  setFormation(newFormation, pitchWidth, pitchHeight) {
    this.formation = newFormation;
    const positions = this.getFormationPositions(newFormation, pitchWidth, pitchHeight);
    this.players.forEach((p, idx) => {
      if (positions[idx]) {
        p.homeX = positions[idx].x;
        p.homeY = positions[idx].y;
        if (positions[idx].position) p.position = positions[idx].position;
      }
    });
  }

  getFormationPositions(formation, pitchWidth, pitchHeight) {
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const fieldCenter = pitchWidth / 2;
    const midY = pitchHeight / 2;

    if (formation === '4-4-2') {
      return this.isHome
        ? [
            { x: fieldLeft + 35, y: midY, position: 'GK' },
            { x: fieldLeft + 160, y: midY - 65, position: 'DEF' },
            { x: fieldLeft + 160, y: midY + 65, position: 'DEF' },
            { x: fieldLeft + 300, y: midY, position: 'MID' },
            { x: fieldCenter - 50, y: midY, position: 'FWD' },
          ]
        : [
            { x: fieldRight - 35, y: midY, position: 'GK' },
            { x: fieldRight - 160, y: midY - 65, position: 'DEF' },
            { x: fieldRight - 160, y: midY + 65, position: 'DEF' },
            { x: fieldRight - 300, y: midY, position: 'MID' },
            { x: fieldCenter + 50, y: midY, position: 'FWD' },
          ];
    } else if (formation === '3-5-2') {
      return this.isHome
        ? [
            { x: fieldLeft + 35, y: midY, position: 'GK' },
            { x: fieldLeft + 170, y: midY, position: 'DEF' },
            { x: fieldLeft + 270, y: midY - 80, position: 'MID' },
            { x: fieldLeft + 270, y: midY + 80, position: 'MID' },
            { x: fieldCenter - 45, y: midY, position: 'FWD' },
          ]
        : [
            { x: fieldRight - 35, y: midY, position: 'GK' },
            { x: fieldRight - 170, y: midY, position: 'DEF' },
            { x: fieldRight - 270, y: midY - 80, position: 'MID' },
            { x: fieldRight - 270, y: midY + 80, position: 'MID' },
            { x: fieldCenter + 45, y: midY, position: 'FWD' },
          ];
    }

    // Default 4-3-3 (1 GK, 1 DEF, 1 MID, 2 FWD)
    return this.isHome
      ? [
            { x: fieldLeft + 35, y: midY, position: 'GK' },
            { x: fieldLeft + 150, y: midY, position: 'DEF' },
            { x: fieldLeft + 280, y: midY, position: 'MID' },
            { x: fieldCenter - 60, y: midY - 100, position: 'FWD' },
            { x: fieldCenter - 60, y: midY + 100, position: 'FWD' },
          ]
      : [
            { x: fieldRight - 35, y: midY, position: 'GK' },
            { x: fieldRight - 150, y: midY, position: 'DEF' },
            { x: fieldRight - 280, y: midY, position: 'MID' },
            { x: fieldCenter + 60, y: midY - 100, position: 'FWD' },
            { x: fieldCenter + 60, y: midY + 100, position: 'FWD' },
          ];
  }

  initializePlayers(rawPlayers, pitchWidth, pitchHeight) {
    const basePositions = this.getFormationPositions(this.formation, pitchWidth, pitchHeight);

    // Titulares: primeros 5 jugadores en cancha
    this.players = rawPlayers.slice(0, 5).map((pData, idx) => {
      const pos = basePositions[idx] || { x: pitchWidth / 2, y: pitchHeight / 2 };
      return new Player(pData, this.id, this.isHome, pos);
    });

    // Suplentes: del índice 5 en adelante esperando en el banquillo
    const benchData = rawPlayers.slice(5);
    this.bench = benchData.map(pData => {
      // Posición táctica inicial de referencia en la banca
      const dummyPos = { x: this.isHome ? 20 : pitchWidth - 20, y: pitchHeight / 2 };
      return new Player(pData, this.id, this.isHome, dummyPos);
    });
  }

  /**
   * Realiza una sustitución reglamentaria:
   * Retira un titular de la cancha e ingresa un suplente del banquillo con resistencia renovada.
   *
   * @param {string} outPlayerId - ID del jugador saliente
   * @param {string} inPlayerId - ID del suplente entrante
   * @returns {{ success: boolean, outPlayer?: Player, inPlayer?: Player, reason?: string }}
   */
  substitute(outPlayerId, inPlayerId) {
    if (this.substitutionsRemaining <= 0) {
      return { success: false, reason: 'No quedan sustituciones disponibles (límite alcanzado)' };
    }

    const outIndex = this.players.findIndex(p => p.id === outPlayerId);
    if (outIndex === -1) {
      return { success: false, reason: 'El jugador a sustituir no se encuentra en el campo' };
    }

    const benchIndex = this.bench.findIndex(p => p.id === inPlayerId);
    if (benchIndex === -1) {
      return { success: false, reason: 'El sustituto no se encuentra en el banquillo' };
    }

    const outPlayer = this.players[outIndex];
    const inPlayer = this.bench[benchIndex];

    // Regla de coherencia: Si sale el arquero, debe entrar un arquero
    if (outPlayer.position === 'GK' && inPlayer.position !== 'GK') {
      return { success: false, reason: 'El arquero solo puede ser sustituido por otro arquero (GK)' };
    }
    if (outPlayer.position !== 'GK' && inPlayer.position === 'GK') {
      return { success: false, reason: 'Un arquero suplente no puede ingresar en posición de campo' };
    }

    // Heredar coordenadas y estado posicional para evitar teletransportaciones o desajustes
    inPlayer.x = outPlayer.x;
    inPlayer.y = outPlayer.y;
    inPlayer.homeX = outPlayer.homeX;
    inPlayer.homeY = outPlayer.homeY;
    inPlayer.vx = 0;
    inPlayer.vy = 0;
    inPlayer.facingX = outPlayer.facingX;
    inPlayer.facingY = outPlayer.facingY;
    inPlayer.position = outPlayer.position;

    // El jugador entrante ingresa fresco con 100% de resistencia
    inPlayer.currentStamina = 100;
    inPlayer.isControlled = outPlayer.isControlled;

    // Actualizar listas
    this.players[outIndex] = inPlayer;
    this.bench.splice(benchIndex, 1); // Sale del banquillo y ya no puede ser reingresado

    this.substitutionsRemaining -= 1;
    this.substitutionsMade += 1;
    this.substitutionsHistory.push({
      out: { id: outPlayer.id, name: outPlayer.name, number: outPlayer.number },
      in: { id: inPlayer.id, name: inPlayer.name, number: inPlayer.number },
      timestamp: Date.now()
    });

    return {
      success: true,
      outPlayer,
      inPlayer
    };
  }

  resetPositions() {
    this.players.forEach(p => p.resetPosition());
  }

  update(dt, pitchWidth, pitchHeight) {
    this.players.forEach(p => p.update(dt, pitchWidth, pitchHeight));
  }

  render(ctx) {
    this.players.forEach(p => p.render(ctx, this.primaryColor, this.secondaryColor));
  }
}
