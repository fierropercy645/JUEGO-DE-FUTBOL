import { describe, it, expect } from 'vitest';
import { MatchStatistics } from '../src/statistics/MatchStatistics.js';

describe('Match Statistics Service', () => {
  const homeTeam = { id: 't1', name: 'Equipo 1' };
  const awayTeam = { id: 't2', name: 'Equipo 2' };

  it('records goals and tracks goal scorers without duplicates', () => {
    const stats = new MatchStatistics('m1', homeTeam, awayTeam);
    stats.recordGoal('t1', 'G. Morales', 14);
    stats.recordGoal('t1', 'A. Rojas', 42);
    stats.recordGoal('t2', 'C. Bacca', 85);

    expect(stats.homeGoals).toBe(2);
    expect(stats.awayGoals).toBe(1);
    expect(stats.goals.length).toBe(3);
    expect(stats.goals[0].scorerName).toBe('G. Morales');
  });

  it('calculates possession percentage coherently', () => {
    const stats = new MatchStatistics('m1', homeTeam, awayTeam);
    stats.updatePossession('t1', 60); // 60s home
    stats.updatePossession('t2', 40); // 40s away

    const p = stats.getPossessionPercentages();
    expect(p.home).toBe(60);
    expect(p.away).toBe(40);
    expect(p.home + p.away).toBe(100);
  });
});
