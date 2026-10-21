import { describe, it, expect } from 'vitest';
import { Schedule } from '../src/competitions/Schedule.js';

describe('Schedule Generator', () => {
  const teams = [
    { id: '1', name: 'T1' },
    { id: '2', name: 'T2' },
    { id: '3', name: 'T3' },
    { id: '4', name: 'T4' },
    { id: '5', name: 'T5' },
    { id: '6', name: 'T6' },
    { id: '7', name: 'T7' },
    { id: '8', name: 'T8' },
  ];

  it('generates 14 rounds for 8 teams in double round-robin', () => {
    const rounds = Schedule.generate(teams);
    expect(rounds.length).toBe(14);
  });

  it('has 4 matches per round for 8 teams (56 matches total)', () => {
    const rounds = Schedule.generate(teams);
    rounds.forEach(r => {
      expect(r.matches.length).toBe(4);
    });
    const totalMatches = rounds.flatMap(r => r.matches);
    expect(totalMatches.length).toBe(56);
  });

  it('ensures no team plays twice in the same round', () => {
    const rounds = Schedule.generate(teams);
    rounds.forEach(r => {
      const teamsInRound = new Set();
      r.matches.forEach(m => {
        expect(teamsInRound.has(m.homeTeamId)).toBe(false);
        teamsInRound.add(m.homeTeamId);
        expect(teamsInRound.has(m.awayTeamId)).toBe(false);
        teamsInRound.add(m.awayTeamId);
      });
      expect(teamsInRound.size).toBe(8);
    });
  });

  it('ensures teams play each other twice (once home, once away)', () => {
    const rounds = Schedule.generate(teams);
    const allMatches = rounds.flatMap(r => r.matches);

    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i !== j) {
          const t1 = teams[i].id;
          const t2 = teams[j].id;
          const directMatch = allMatches.find(m => m.homeTeamId === t1 && m.awayTeamId === t2);
          expect(directMatch).toBeDefined();
        }
      }
    }
  });
});
