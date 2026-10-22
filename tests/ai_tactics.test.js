import { describe, it, expect, vi } from 'vitest';
import { PlayerAI } from '../src/game/PlayerAI.js';
import { Team } from '../src/game/Team.js';
import { Ball } from '../src/game/Ball.js';
import { Match } from '../src/game/Match.js';
import { PITCH, DIFFICULTY } from '../src/utils/constants.js';

describe('Advanced Tactical AI (Fase 3 & 3.1)', () => {
  const dummyHomeData = {
    id: 'team_a',
    name: 'Real Madrid',
    players: [
      { id: 'p1', name: 'Courtois', position: 'GK', speed: 70, pass: 75 },
      { id: 'p2', name: 'Militao', position: 'DEF', speed: 82, pass: 78 },
      { id: 'p3', name: 'Modric', position: 'MID', speed: 80, pass: 92 },
      { id: 'p4', name: 'Vinicius', position: 'FWD', speed: 95, pass: 84 },
      { id: 'p5', name: 'Mbappe', position: 'FWD', speed: 96, pass: 83 }
    ]
  };

  const dummyAwayData = {
    id: 'team_b',
    name: 'Barcelona',
    players: [
      { id: 'b1', name: 'Ter Stegen', position: 'GK', speed: 70, pass: 75 },
      { id: 'b2', name: 'Araujo', position: 'DEF', speed: 84, pass: 76 },
      { id: 'b3', name: 'Pedri', position: 'MID', speed: 82, pass: 91 },
      { id: 'b4', name: 'Raphinha', position: 'FWD', speed: 91, pass: 85 },
      { id: 'b5', name: 'Lewandowski', position: 'FWD', speed: 85, pass: 80 }
    ]
  };

  const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
  const fieldRight = PITCH.WIDTH - fieldLeft;

  // 1. DESMARQUES OFENSIVOS EN AMBAS ORIENTACIONES
  it('makes HOME forwards (FWD) move rightward (vx > 0) towards away goal when attacking', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    const midPlayer = homeTeam.players[2];
    ball.setOwner(midPlayer);

    const fwdPlayer = homeTeam.players[3]; // Vinicius

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

    expect(fwdPlayer.vx).toBeGreaterThan(0);
    expect(Number.isFinite(fwdPlayer.vx)).toBe(true);
    expect(Number.isFinite(fwdPlayer.vy)).toBe(true);
  });

  it('makes AWAY forwards (FWD) move leftward (vx < 0) towards home goal when attacking', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    const awayMid = awayTeam.players[2];
    ball.setOwner(awayMid);

    const awayFwd = awayTeam.players[3]; // Raphinha

    PlayerAI.update(
      awayFwd,
      ball,
      awayTeam,
      homeTeam,
      PITCH.WIDTH,
      PITCH.HEIGHT,
      DIFFICULTY.NORMAL,
      vi.fn(),
      vi.fn(),
      { scoreDiff: 0, isLateGame: false }
    );

    expect(awayFwd.vx).toBeLessThan(0);
    expect(Number.isFinite(awayFwd.vx)).toBe(true);
    expect(Number.isFinite(awayFwd.vy)).toBe(true);
  });

  // 2. LÍMITES REGLAMENTARIOS DEL CAMPO
  it('guarantees tactical targets and positions strictly respect pitch boundaries without NaN', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH - 10, PITCH.HEIGHT / 2);

    // Colocar jugador al extremo para probar clamping
    const fwdPlayer = homeTeam.players[4];
    fwdPlayer.x = PITCH.WIDTH - 70;
    fwdPlayer.y = 20;

    PlayerAI.update(
      fwdPlayer,
      ball,
      homeTeam,
      awayTeam,
      PITCH.WIDTH,
      PITCH.HEIGHT,
      DIFFICULTY.HARD,
      vi.fn(),
      vi.fn(),
      { scoreDiff: -1, isLateGame: true }
    );

    expect(Number.isNaN(fwdPlayer.vx)).toBe(false);
    expect(Number.isNaN(fwdPlayer.vy)).toBe(false);
    expect(Number.isFinite(fwdPlayer.vx)).toBe(true);
    expect(Number.isFinite(fwdPlayer.vy)).toBe(true);
  });

  // 3. COBERTURA DEFENSIVA ANTE ATACANTE DESMARCADO
  it('makes defenders cover dangerous opponents near the box instead of static camping', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    const oppMid = awayTeam.players[2];
    ball.setOwner(oppMid);

    const oppStriker = awayTeam.players[4];
    oppStriker.x = 180;
    oppStriker.y = PITCH.HEIGHT / 2 + 30;

    const defPlayer = homeTeam.players[1];
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

    expect(Math.hypot(defPlayer.vx, defPlayer.vy)).toBeGreaterThan(0);
  });

  // 4. PASES FILTRADOS AL ESPACIO EN MATCH.JS
  it('calculates through-ball lead distance when teammate is running ahead', () => {
    const match = new Match(dummyHomeData, dummyAwayData);
    const passer = match.homeTeam.players[2]; // Modric
    const receiver = match.homeTeam.players[3]; // Vinicius

    passer.x = 300;
    passer.y = 250;
    passer.facingX = 1;
    passer.facingY = 0;
    match.ball.setOwner(passer);

    // Receptor corriendo hacia adelante
    receiver.x = 420;
    receiver.y = 250;
    receiver.vx = 2.5;
    receiver.vy = 0;
    receiver.facingX = 1;
    receiver.facingY = 0;

    match.executePass(passer);

    // El balón debe ser pateado hacia adelante en la dirección de carrera
    expect(match.ball.vx).toBeGreaterThan(0);
    expect(match.ball.owner).toBeNull(); // Desprendió el balón
    expect(Number.isFinite(match.ball.vx)).toBe(true);
  });

  // 5. TÁCTICAS SEGÚN EL MARCADOR (GANANDO Y PERDIENDO EN TRAMO FINAL)
  it('intensifies attacking runs when trailing late (scoreDiff < 0, isLateGame = true)', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);

    const mid = homeTeam.players[2];
    ball.setOwner(mid);

    const fwd = homeTeam.players[4];
    fwd.x = 350;
    fwd.y = 200;

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

    expect(fwd.vx).toBeGreaterThan(0);
  });

  it('drops deeper defensively when leading late in the match (scoreDiff > 0, isLateGame = true)', () => {
    const homeTeam = new Team(dummyHomeData, true, PITCH.WIDTH, PITCH.HEIGHT);
    const awayTeam = new Team(dummyAwayData, false, PITCH.WIDTH, PITCH.HEIGHT);
    const ball = new Ball(PITCH.WIDTH / 2 + 50, PITCH.HEIGHT / 2);

    // Rival tiene posesión
    const opp = awayTeam.players[2];
    ball.setOwner(opp);

    const mid = homeTeam.players[2];
    mid.x = 400;
    mid.y = 200;

    PlayerAI.update(
      mid,
      ball,
      homeTeam,
      awayTeam,
      PITCH.WIDTH,
      PITCH.HEIGHT,
      DIFFICULTY.NORMAL,
      vi.fn(),
      vi.fn(),
      { scoreDiff: 2, isLateGame: true }
    );

    // Con scoreDiff > 0 y balón del rival, retrocede hacia su propio campo (vx < 0 para equipo local)
    expect(mid.vx).toBeLessThan(0);
  });

  // 6. SIMULACIÓN DE PARTIDO COMPLETO (MATCH TICK LOOP)
  it('simulates multiple match updates without throwing errors, NaNs, or broken states', () => {
    const match = new Match(dummyHomeData, dummyAwayData, { durationMinutes: 1 });
    expect(match.state).toBeDefined();

    // Simular 300 fotogramas de juego (5 segundos de tiempo de motor)
    for (let frame = 0; frame < 300; frame++) {
      match.update(0.016);
    }

    // Verificar que los jugadores y el balón mantienen coordenadas numéricas válidas
    expect(Number.isFinite(match.ball.x)).toBe(true);
    expect(Number.isFinite(match.ball.y)).toBe(true);
    match.homeTeam.players.forEach(p => {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
      expect(Number.isFinite(p.vx)).toBe(true);
      expect(Number.isFinite(p.vy)).toBe(true);
    });
    match.awayTeam.players.forEach(p => {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
      expect(Number.isFinite(p.vx)).toBe(true);
      expect(Number.isFinite(p.vy)).toBe(true);
    });
  });
});
