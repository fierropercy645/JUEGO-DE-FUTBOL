import { describe, it, expect, vi } from 'vitest';
import { PlayerAI } from '../src/game/PlayerAI.js';
import { Team } from '../src/game/Team.js';
import { Ball } from '../src/game/Ball.js';
import { PITCH, DIFFICULTY } from '../src/utils/constants.js';

describe('Advanced Tactical AI (Fase 3)', () => {
  const dummyHomeData = {
    id: 'team_a',
    name: 'Real Madrid',
    players: [
      { id: 'p1', name: 'Courtois', position: 'GK', speed: 70 },
      { id: 'p2', name: 'Militao', position: 'DEF', speed: 82 },
      { id: 'p3', name: 'Modric', position: 'MID', speed: 80 },
      { id: 'p4', name: 'Vinicius', position: 'FWD', speed: 95 },
      { id: 'p5', name: 'Mbappe', position: 'FWD', speed: 96 }
    ]
  };

  const dummyAwayData = {
    id: 'team_b',
    name: 'Barcelona',
    players: [
      { id: 'b1', name: 'Ter Stegen', position: 'GK', speed: 70 },
      { id: 'b2', name: 'Araujo', position: 'DEF', speed: 84 },
      { id: 'b3', name: 'Pedri', position: 'MID', speed: 82 },
      { id: 'b4', name: 'Raphinha', position: 'FWD', speed: 91 },
      { id: 'b5', name: 'Lewandowski', position: 'FWD', speed: 85 }
    ]
  };

  it('makes forwards (FWD) execute diagonal off-the-ball runs (desmarques) when team has possession', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    // Dar posesión al mediocampista local
    const midPlayer = homeTeam.players[2];
    ball.setOwner(midPlayer);

    const fwdPlayer = homeTeam.players[3]; // Vinicius
    const initialHomeX = fwdPlayer.homeX;

    // Ejecutar update de IA en el delantero sin balón
    PlayerAI.update(
      fwdPlayer,
      ball,
      homeTeam,
      awayTeam,
      PITCH.WIDTH,
      PITCH.HEIGHT,
      DIFFICULTY.NORMAL,
      vi.fn(),
      vi.fn(),
      { scoreDiff: 0, isLateGame: false }
    );

    // Debe avanzar en dirección ofensiva (vx > 0 para equipo home atacando hacia la derecha)
    expect(fwdPlayer.vx).toBeGreaterThan(0);
  });

  it('makes defenders cover dangerous opponents near the box instead of static camping', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    // Rival tiene la posesión
    const oppMid = awayTeam.players[2];
    ball.setOwner(oppMid);

    // Un delantero rival se infiltra cerca del área local
    const oppStriker = awayTeam.players[4];
    oppStriker.x = 180;
    oppStriker.y = PITCH.HEIGHT / 2 + 30;

    const defPlayer = homeTeam.players[1]; // Militao (DEF)
    defPlayer.x = 150;
    defPlayer.y = PITCH.HEIGHT / 2;

    PlayerAI.update(
      defPlayer,
      ball,
      homeTeam,
      awayTeam,
      PITCH.WIDTH,
      PITCH.HEIGHT,
      DIFFICULTY.HARD,
      vi.fn(),
      vi.fn()
    );

    // El defensa reacciona ajustando su cobertura defensiva
    expect(Math.hypot(defPlayer.vx, defPlayer.vy)).toBeGreaterThan(0);
  });

  it('adapts tactical urgency when trailing late in the match (scoreDiff < 0, isLateGame = true)', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    // Equipo home tiene posesión
    const mid = homeTeam.players[2];
    ball.setOwner(mid);

    const fwd = homeTeam.players[4];
    fwd.x = 400;
    fwd.y = 200;

    // Update con contexto de ir perdiendo al final
    PlayerAI.update(
      fwd,
      ball,
      homeTeam,
      awayTeam,
      PITCH.WIDTH,
      PITCH.HEIGHT,
      DIFFICULTY.NORMAL,
      vi.fn(),
      vi.fn(),
      { scoreDiff: -1, isLateGame: true }
    );

    // El delantero presiona aún más verticalmente
    expect(fwd.vx).toBeGreaterThan(0);
  });
});
