export class Tournament {
  constructor(name = 'Leyendas Cup', teams = [], userTeamId = null, existingData = null) {
    this.name = name;
    this.teams = teams;
    this.userTeamId = userTeamId || (teams[0] ? teams[0].id : null);
    this.currentStage = 'quarters'; // quarters -> semis -> final -> completed
    this.completed = false;
    this.championTeamId = null;

    if (existingData) {
      this.name = existingData.name;
      this.userTeamId = existingData.userTeamId;
      this.currentStage = existingData.currentStage;
      this.brackets = existingData.brackets;
      this.completed = existingData.completed;
      this.championTeamId = existingData.championTeamId;
    } else {
      this.brackets = this.generateKnockoutBrackets(this.teams);
    }
  }

  generateKnockoutBrackets(teams) {
    // Tomar 8 equipos para Cuartos, Semifinal y Gran Final
    const bracketTeams = teams.slice(0, 8);
    const quarters = [
      { id: 'q1', stage: 'quarters', homeTeamId: bracketTeams[0]?.id, awayTeamId: bracketTeams[7]?.id, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false },
      { id: 'q2', stage: 'quarters', homeTeamId: bracketTeams[3]?.id, awayTeamId: bracketTeams[4]?.id, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false },
      { id: 'q3', stage: 'quarters', homeTeamId: bracketTeams[1]?.id, awayTeamId: bracketTeams[6]?.id, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false },
      { id: 'q4', stage: 'quarters', homeTeamId: bracketTeams[2]?.id, awayTeamId: bracketTeams[5]?.id, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false },
    ];

    const semis = [
      { id: 's1', stage: 'semis', homeTeamId: null, awayTeamId: null, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false },
      { id: 's2', stage: 'semis', homeTeamId: null, awayTeamId: null, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false },
    ];

    const finalMatch = {
      id: 'f1', stage: 'final', homeTeamId: null, awayTeamId: null, homeGoals: null, awayGoals: null, penaltiesHome: null, penaltiesAway: null, winnerId: null, played: false
    };

    return {
      quarters,
      semis,
      final: finalMatch,
    };
  }

  getCurrentMatches() {
    if (this.currentStage === 'quarters') return this.brackets.quarters;
    if (this.currentStage === 'semis') return this.brackets.semis;
    if (this.currentStage === 'final') return [this.brackets.final];
    return [];
  }

  getUserMatch() {
    const matches = this.getCurrentMatches();
    return matches.find(m => m.homeTeamId === this.userTeamId || m.awayTeamId === this.userTeamId);
  }

  recordMatchResult(matchId, homeGoals, awayGoals, penaltyShootout = null) {
    const allMatches = [...this.brackets.quarters, ...this.brackets.semis, this.brackets.final];
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;

    match.homeGoals = homeGoals;
    match.awayGoals = awayGoals;
    match.played = true;

    if (homeGoals > awayGoals) {
      match.winnerId = match.homeTeamId;
    } else if (awayGoals > homeGoals) {
      match.winnerId = match.awayTeamId;
    } else {
      // Definición por penales si terminan empatados en eliminatoria
      const penHome = penaltyShootout ? penaltyShootout.home : Math.floor(Math.random() * 2) + 4;
      const penAway = penaltyShootout ? penaltyShootout.away : (penHome > 4 ? penHome - 1 : 5);
      match.penaltiesHome = penHome;
      match.penaltiesAway = penAway;
      match.winnerId = penHome > penAway ? match.homeTeamId : match.awayTeamId;
    }

    this.advanceBracket();
  }

  simulateOtherMatches() {
    const currentMatches = this.getCurrentMatches();
    for (const match of currentMatches) {
      if (!match.played && match.homeTeamId !== this.userTeamId && match.awayTeamId !== this.userTeamId) {
        const homeGoals = Math.floor(Math.random() * 4);
        const awayGoals = Math.floor(Math.random() * 3);
        this.recordMatchResult(match.id, homeGoals, awayGoals);
      }
    }
  }

  advanceBracket() {
    if (this.currentStage === 'quarters') {
      const allQDone = this.brackets.quarters.every(m => m.played);
      if (allQDone) {
        this.brackets.semis[0].homeTeamId = this.brackets.quarters[0].winnerId;
        this.brackets.semis[0].awayTeamId = this.brackets.quarters[1].winnerId;
        this.brackets.semis[1].homeTeamId = this.brackets.quarters[2].winnerId;
        this.brackets.semis[1].awayTeamId = this.brackets.quarters[3].winnerId;
        this.currentStage = 'semis';
      }
    } else if (this.currentStage === 'semis') {
      const allSDone = this.brackets.semis.every(m => m.played);
      if (allSDone) {
        this.brackets.final.homeTeamId = this.brackets.semis[0].winnerId;
        this.brackets.final.awayTeamId = this.brackets.semis[1].winnerId;
        this.currentStage = 'final';
      }
    } else if (this.currentStage === 'final') {
      if (this.brackets.final.played) {
        this.completed = true;
        this.championTeamId = this.brackets.final.winnerId;
        this.currentStage = 'completed';
      }
    }
  }

  toJSON() {
    return {
      name: this.name,
      userTeamId: this.userTeamId,
      currentStage: this.currentStage,
      brackets: this.brackets,
      completed: this.completed,
      championTeamId: this.championTeamId,
    };
  }
}
