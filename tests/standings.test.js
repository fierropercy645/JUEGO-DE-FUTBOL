import { describe, it, expect } from 'vitest';
import { Standings } from '../src/competitions/Standings.js';

describe('Standings System', () => {
  const mockTeams = [
    { id: 't1', name: 'Equipo 1' },
    { id: 't2', name: 'Equipo 2' },
    { id: 't3', name: 'Equipo 3' },
  ];

  it('calculates initial zero standings with no matches', () => {
    const table = Standings.calculate(mockTeams, []);
    expect(table.length).toBe(3);
    expect(table[0].pts).toBe(0);
    expect(table[0].pj).toBe(0);
  });

  it('correctly awards 3 points to home winner', () => {
    const matches = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 2, awayGoals: 0, played: true }
    ];
    const table = Standings.calculate(mockTeams, matches);
    const t1 = table.find(t => t.teamId === 't1');
    const t2 = table.find(t => t.teamId === 't2');

    expect(t1.pts).toBe(3);
    expect(t1.pg).toBe(1);
    expect(t1.gf).toBe(2);
    expect(t1.dg).toBe(2);

    expect(t2.pts).toBe(0);
    expect(t2.pp).toBe(1);
    expect(t2.gc).toBe(2);
    expect(t2.dg).toBe(-2);
  });

  it('correctly awards 1 point each for a draw', () => {
    const matches = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 1, awayGoals: 1, played: true }
    ];
    const table = Standings.calculate(mockTeams, matches);
    const t1 = table.find(t => t.teamId === 't1');
    const t2 = table.find(t => t.teamId === 't2');

    expect(t1.pts).toBe(1);
    expect(t1.pe).toBe(1);
    expect(t2.pts).toBe(1);
    expect(t2.pe).toBe(1);
  });

  it('sorts correctly by points, then goal difference, then goals scored', () => {
    const matches = [
      { homeTeamId: 't1', awayTeamId: 't2', homeGoals: 3, awayGoals: 1, played: true }, // t1: +2 dg
      { homeTeamId: 't3', awayTeamId: 't2', homeGoals: 4, awayGoals: 0, played: true }, // t3: +4 dg
    ];
    const table = Standings.calculate(mockTeams, matches);
    expect(table[0].teamId).toBe('t3'); // 3 pts, +4 dg
    expect(table[1].teamId).toBe('t1'); // 3 pts, +2 dg
    expect(table[2].teamId).toBe('t2'); // 0 pts
  });
});
