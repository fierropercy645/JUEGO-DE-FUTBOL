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

    this.players = [];
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

    this.players = rawPlayers.slice(0, 5).map((pData, idx) => {
      const pos = basePositions[idx] || { x: pitchWidth / 2, y: pitchHeight / 2 };
      return new Player(pData, this.id, this.isHome, pos);
    });
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
