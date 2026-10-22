import { describe, it, expect } from 'vitest';
import { Tournament } from '../src/competitions/Tournament.js';
import { DEFAULT_TEAMS } from '../src/data/teams.js';

describe('Tournament Knockout Mode (Leyendas Cup)', () => {
  it('generates 8-team brackets with quarters, semis and final', () => {
    const tournament = new Tournament('Leyendas Cup', DEFAULT_TEAMS, DEFAULT_TEAMS[0].id);
    expect(tournament.brackets.quarters.length).toBe(4);
    expect(tournament.brackets.semis.length).toBe(2);
    expect(tournament.brackets.final).toBeDefined();
    expect(tournament.currentStage).toBe('quarters');
  });

  it('advances winners from quarters to semifinals', () => {
    const tournament = new Tournament('Leyendas Cup', DEFAULT_TEAMS, DEFAULT_TEAMS[0].id);
    tournament.brackets.quarters.forEach((q, idx) => {
      tournament.recordMatchResult(q.id, 2, 1);
    });

    expect(tournament.currentStage).toBe('semis');
    expect(tournament.brackets.semis[0].homeTeamId).toBe(tournament.brackets.quarters[0].winnerId);
    expect(tournament.brackets.semis[0].awayTeamId).toBe(tournament.brackets.quarters[1].winnerId);
  });

  it('determines tournament champion after the final match', () => {
    const tournament = new Tournament('Leyendas Cup', DEFAULT_TEAMS, DEFAULT_TEAMS[0].id);
    // Quarters
    tournament.brackets.quarters.forEach(q => tournament.recordMatchResult(q.id, 3, 0));
    // Semis
    tournament.brackets.semis.forEach(s => tournament.recordMatchResult(s.id, 2, 1));
    // Final
    tournament.recordMatchResult(tournament.brackets.final.id, 1, 0);

    expect(tournament.completed).toBe(true);
    expect(tournament.championTeamId).toBe(tournament.brackets.final.winnerId);
    expect(tournament.currentStage).toBe('completed');
  });

  it('handles penalty shootouts in knockout draws', () => {
    const tournament = new Tournament('Leyendas Cup', DEFAULT_TEAMS, DEFAULT_TEAMS[0].id);
    const q1 = tournament.brackets.quarters[0];
    tournament.recordMatchResult(q1.id, 1, 1, { home: 5, away: 4 });

    expect(q1.penaltiesHome).toBe(5);
    expect(q1.penaltiesAway).toBe(4);
    expect(q1.winnerId).toBe(q1.homeTeamId);
  });

  it('serializes to JSON and recovers full tournament state without corruption', () => {
    const tournament = new Tournament('Leyendas Cup', DEFAULT_TEAMS, DEFAULT_TEAMS[0].id);
    tournament.recordMatchResult('q1', 2, 0);
    const json = tournament.toJSON();

    const restored = new Tournament(json.name, DEFAULT_TEAMS, json.userTeamId, json);
    expect(restored.name).toBe('Leyendas Cup');
    expect(restored.brackets.quarters[0].played).toBe(true);
    expect(restored.brackets.quarters[0].homeGoals).toBe(2);
    expect(restored.brackets.quarters[0].winnerId).toBe(tournament.brackets.quarters[0].winnerId);
  });
});
