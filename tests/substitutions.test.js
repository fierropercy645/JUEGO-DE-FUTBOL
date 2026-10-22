import { describe, it, expect } from 'vitest';
import { Team } from '../src/game/Team.js';
import { Match } from '../src/game/Match.js';
import { PITCH } from '../src/utils/constants.js';

describe('Professional Substitutions & Squad Management (Fase 4)', () => {
  const dummySquadData = {
    id: 'squad_a',
    name: 'Real Madrid',
    shortName: 'RMA',
    players: [
      { id: 'p1', name: 'Courtois', number: 1, position: 'GK', speed: 70 },
      { id: 'p2', name: 'Militao', number: 3, position: 'DEF', speed: 82 },
      { id: 'p3', name: 'Modric', number: 10, position: 'MID', speed: 80 },
      { id: 'p4', name: 'Vinicius', number: 7, position: 'FWD', speed: 95 },
      { id: 'p5', name: 'Mbappe', number: 9, position: 'FWD', speed: 96 },
      // Suplentes de banquillo
      { id: 'p6', name: 'Lunin', number: 13, position: 'GK', speed: 71 },
      { id: 'p7', name: 'Alaba', number: 4, position: 'DEF', speed: 81 },
      { id: 'p8', name: 'Camavinga', number: 6, position: 'MID', speed: 83 },
      { id: 'p9', name: 'Rodrygo', number: 11, position: 'FWD', speed: 89 }
    ]
  };

  const dummyOpponentData = {
    id: 'squad_b',
    name: 'Barcelona',
    shortName: 'BAR',
    players: [
      { id: 'b1', name: 'Ter Stegen', number: 1, position: 'GK', speed: 70 },
      { id: 'b2', name: 'Araujo', number: 4, position: 'DEF', speed: 84 },
      { id: 'b3', name: 'Pedri', number: 8, position: 'MID', speed: 82 },
      { id: 'b4', name: 'Raphinha', number: 11, position: 'FWD', speed: 91 },
      { id: 'b5', name: 'Lewandowski', number: 9, position: 'FWD', speed: 85 }
    ]
  };

  it('correctly initializes active field players (5) and bench substitutes (4)', () => {
    const team = new Team(dummySquadData, true, PITCH.WIDTH, PITCH.HEIGHT);
    expect(team.players.length).toBe(5);
    expect(team.bench.length).toBe(4);
    expect(team.substitutionsRemaining).toBe(3);
    expect(team.substitutionsMade).toBe(0);
  });

  it('executes substitution cleanly: transfers position, refreshes stamina to 100, and avoids duplicates', () => {
    const match = new Match(dummySquadData, dummyOpponentData);
    const outPlayer = match.homeTeam.players[3]; // Vinicius (FWD)
    outPlayer.currentStamina = 35; // Fatigado
    outPlayer.x = 450;
    outPlayer.y = 220;

    const res = match.makeSubstitution('p4', 'p9', true); // entra Rodrygo por Vinicius

    expect(res.success).toBe(true);
    expect(res.inPlayer.id).toBe('p9');
    expect(res.inPlayer.name).toBe('Rodrygo');
    expect(res.inPlayer.currentStamina).toBe(100); // 100% estamina renovada
    expect(res.inPlayer.x).toBe(450); // Mismas coordenadas, sin teletransporte
    expect(res.inPlayer.y).toBe(220);

    // Comprobar que en cancha están exactamente 5 jugadores sin duplicados
    const playerIds = match.homeTeam.players.map(p => p.id);
    expect(playerIds.length).toBe(5);
    expect(new Set(playerIds).size).toBe(5);
    expect(playerIds.includes('p9')).toBe(true);
    expect(playerIds.includes('p4')).toBe(false);

    // Comprobar que el suplente ya no está en la banca
    expect(match.homeTeam.bench.some(p => p.id === 'p9')).toBe(false);
    expect(match.homeTeam.substitutionsRemaining).toBe(2);
    expect(match.homeTeam.substitutionsMade).toBe(1);
  });

  it('transfers user control and ball ownership seamlessly when replaced player is substituted', () => {
    const match = new Match(dummySquadData, dummyOpponentData);
    const midPlayer = match.homeTeam.players[2]; // Modric
    match.setUserControlledPlayer(midPlayer);
    match.ball.setOwner(midPlayer);

    expect(match.userControlledPlayer).toBe(midPlayer);
    expect(match.ball.owner).toBe(midPlayer);

    // Sustituir a Modric (p3) por Camavinga (p8)
    const res = match.makeSubstitution('p3', 'p8', true);
    expect(res.success).toBe(true);

    // El jugador entrante hereda inmediatamente el control y el balón
    expect(match.userControlledPlayer.id).toBe('p8');
    expect(match.ball.owner.id).toBe('p8');
  });

  it('enforces tactical substitution rules: disallows replacing outfield player with goalkeeper or viceversa', () => {
    const match = new Match(dummySquadData, dummyOpponentData);

    // Intentar meter al arquero suplente Lunin (p6) por un delantero Vinicius (p4)
    const illegalGkSub = match.makeSubstitution('p4', 'p6', true);
    expect(illegalGkSub.success).toBe(false);
    expect(illegalGkSub.reason).toContain('arquero');

    // Intentar meter a un defensor Alaba (p7) por el arquero titular Courtois (p1)
    const illegalFieldSub = match.makeSubstitution('p1', 'p7', true);
    expect(illegalFieldSub.success).toBe(false);
    expect(illegalFieldSub.reason).toContain('arquero');
  });

  it('strictly limits substitutions to maximum 3 per match', () => {
    const match = new Match(dummySquadData, dummyOpponentData);

    // Cambio 1: p2 (DEF) por p7 (DEF Alaba)
    expect(match.makeSubstitution('p2', 'p7', true).success).toBe(true);
    // Cambio 2: p3 (MID) por p8 (MID Camavinga)
    expect(match.makeSubstitution('p3', 'p8', true).success).toBe(true);
    // Cambio 3: p4 (FWD) por p9 (FWD Rodrygo)
    expect(match.makeSubstitution('p4', 'p9', true).success).toBe(true);

    expect(match.homeTeam.substitutionsRemaining).toBe(0);

    // Cambio 4: No permitido por reglamento
    const fourthSub = match.makeSubstitution('p5', 'p6', true);
    expect(fourthSub.success).toBe(false);
    expect(fourthSub.reason).toContain('límite');
  });

  it('supports in-game tactical formation change without breaking player objects', () => {
    const match = new Match(dummySquadData, dummyOpponentData);
    expect(match.homeTeam.formation).toBe('4-3-3');

    match.changeFormation('4-4-2', true);
    expect(match.homeTeam.formation).toBe('4-4-2');
    expect(match.homeTeam.players.length).toBe(5);

    match.changeFormation('3-5-2', true);
    expect(match.homeTeam.formation).toBe('3-5-2');
    expect(match.homeTeam.players.length).toBe(5);
  });
});
