import { Standings } from './Standings.js';
import { Schedule } from './Schedule.js';

export class League {
  constructor(name, teams, userTeamId = null, existingData = null) {
    this.name = name || 'Liga de Leyendas';
    this.teams = teams || [];
    this.userTeamId = userTeamId || (teams[0] ? teams[0].id : null);
    this.currentRound = 1;
    this.completed = false;

    if (existingData) {
      this.name = existingData.name;
      this.userTeamId = existingData.userTeamId;
      this.currentRound = existingData.currentRound || 1;
      this.rounds = existingData.rounds || [];
      this.completed = existingData.completed || false;
    } else {
      this.rounds = Schedule.generate(this.teams);
    }
  }

  getAllMatches() {
    return this.rounds.flatMap(r => r.matches);
  }

  getStandings() {
    return Standings.calculate(this.teams, this.getAllMatches());
  }

  getCurrentRoundMatches() {
    const round = this.rounds.find(r => r.roundNumber === this.currentRound);
    return round ? round.matches : [];
  }

  getUserMatchForCurrentRound() {
    const currentMatches = this.getCurrentRoundMatches();
    return currentMatches.find(
      m => m.homeTeamId === this.userTeamId || m.awayTeamId === this.userTeamId
    );
  }

  recordMatchResult(matchId, homeGoals, awayGoals, isSimulated = false) {
    for (const round of this.rounds) {
      const match = round.matches.find(m => m.id === matchId);
      if (match) {
        match.homeGoals = homeGoals;
        match.awayGoals = awayGoals;
        match.played = true;
        match.simulated = isSimulated;
        return match;
      }
    }
    return null;
  }

  simulatePendingMatchesInCurrentRound() {
    const matches = this.getCurrentRoundMatches();
    matches.forEach(m => {
      if (!m.played) {
        const homeTeam = this.teams.find(t => t.id === m.homeTeamId);
        const awayTeam = this.teams.find(t => t.id === m.awayTeamId);
        const result = League.simulateMatch(homeTeam, awayTeam);
        m.homeGoals = result.homeGoals;
        m.awayGoals = result.awayGoals;
        m.played = true;
        m.simulated = true;
      }
    });

    this.checkAdvanceRound();
  }

  checkAdvanceRound() {
    const currentMatches = this.getCurrentRoundMatches();
    const allPlayed = currentMatches.length > 0 && currentMatches.every(m => m.played);
    if (allPlayed) {
      if (this.currentRound < this.rounds.length) {
        this.currentRound += 1;
      } else {
        this.completed = true;
      }
    }
  }

  static simulateMatch(homeTeam, awayTeam) {
    const homeRating = (homeTeam ? homeTeam.overall : 80) + 3; // home advantage
    const awayRating = awayTeam ? awayTeam.overall : 80;

    const diff = (homeRating - awayRating) / 10; // e.g. +0.5 or -0.5
    
    // Deterministic + bounded random goals
    // Expected goals ~ 1.5
    const baseHomeExp = Math.max(0.2, 1.4 + diff * 0.4);
    const baseAwayExp = Math.max(0.2, 1.1 - diff * 0.4);

    const poissonApprox = (lambda) => {
      let l = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= Math.random();
      } while (p > l && k < 8);
      return Math.min(6, Math.max(0, k - 1));
    };

    return {
      homeGoals: poissonApprox(baseHomeExp),
      awayGoals: poissonApprox(baseAwayExp),
    };
  }

  toJSON() {
    return {
      name: this.name,
      userTeamId: this.userTeamId,
      currentRound: this.currentRound,
      completed: this.completed,
      rounds: this.rounds,
    };
  }
}
