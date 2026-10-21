import { Player } from './Player.js';
import { PITCH } from '../utils/constants.js';

export class Team {
  constructor(data, isHome, pitchWidth, pitchHeight) {
    this.id = data.id;
    this.name = data.name;
    this.shortName = data.shortName;
    this.primaryColor = data.primaryColor || '#e63946';
    this.secondaryColor = data.secondaryColor || '#ffffff';
    this.overall = data.overall || 80;
    this.isHome = isHome;

    this.players = [];
    this.initializePlayers(data.players || [], pitchWidth, pitchHeight);
  }

  initializePlayers(rawPlayers, pitchWidth, pitchHeight) {
    const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
    const fieldRight = pitchWidth - fieldLeft;
    const fieldCenter = pitchWidth / 2;
    const midY = pitchHeight / 2;

    const basePositions = this.isHome
      ? [
          { x: fieldLeft + 35, y: midY },          // GK en línea de gol visible
          { x: fieldLeft + 150, y: midY },         // DEF
          { x: fieldLeft + 280, y: midY },         // MID
          { x: fieldCenter - 60, y: midY - 100 },  // FWD 1
          { x: fieldCenter - 60, y: midY + 100 },  // FWD 2
        ]
      : [
          { x: fieldRight - 35, y: midY },         // GK en línea de gol visible
          { x: fieldRight - 150, y: midY },        // DEF
          { x: fieldRight - 280, y: midY },        // MID
          { x: fieldCenter + 60, y: midY - 100 },  // FWD 1
          { x: fieldCenter + 60, y: midY + 100 },  // FWD 2
        ];

    this.players = rawPlayers.slice(0, 5).map((pData, idx) => {
      const pos = basePositions[idx] || { x: fieldCenter, y: midY };
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
