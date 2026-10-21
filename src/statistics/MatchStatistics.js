export class MatchStatistics {
  constructor(matchId, homeTeam, awayTeam) {
    this.matchId = matchId || `match-${Date.now()}`;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeGoals = 0;
    this.awayGoals = 0;
    this.goals = []; // { teamId, scorerName, minute }
    this.homeShots = 0;
    this.awayShots = 0;
    this.homeShotsOnTarget = 0;
    this.awayShotsOnTarget = 0;
    this.homePassesAttempted = 0;
    this.awayPassesAttempted = 0;
    this.homePassesCompleted = 0;
    this.awayPassesCompleted = 0;
    this.homeInterceptions = 0;
    this.awayInterceptions = 0;
    this.homeSaves = 0;
    this.awaySaves = 0;
    this.homePossessionTime = 0; // seconds
    this.awayPossessionTime = 0; // seconds
    this.totalMatchTime = 0;
  }

  recordGoal(teamId, scorerName, minute) {
    if (teamId === this.homeTeam.id) {
      this.homeGoals++;
    } else {
      this.awayGoals++;
    }
    this.goals.push({ teamId, scorerName: scorerName || 'Desconocido', minute });
  }

  recordShot(teamId, onTarget = false) {
    if (teamId === this.homeTeam.id) {
      this.homeShots++;
      if (onTarget) this.homeShotsOnTarget++;
    } else {
      this.awayShots++;
      if (onTarget) this.awayShotsOnTarget++;
    }
  }

  recordPass(teamId, completed = false) {
    if (teamId === this.homeTeam.id) {
      this.homePassesAttempted++;
      if (completed) this.homePassesCompleted++;
    } else {
      this.awayPassesAttempted++;
      if (completed) this.awayPassesCompleted++;
    }
  }

  recordInterception(teamId) {
    if (teamId === this.homeTeam.id) {
      this.homeInterceptions++;
    } else {
      this.awayInterceptions++;
    }
  }

  recordSave(teamId) {
    if (teamId === this.homeTeam.id) {
      this.homeSaves++;
    } else {
      this.awaySaves++;
    }
  }

  updatePossession(activePossessionTeamId, dt) {
    this.totalMatchTime += dt;
    if (activePossessionTeamId === this.homeTeam.id) {
      this.homePossessionTime += dt;
    } else if (activePossessionTeamId === this.awayTeam.id) {
      this.awayPossessionTime += dt;
    }
  }

  getPossessionPercentages() {
    const total = this.homePossessionTime + this.awayPossessionTime;
    if (total <= 0) {
      return { home: 50, away: 50 };
    }
    const homePercent = Math.round((this.homePossessionTime / total) * 100);
    return {
      home: homePercent,
      away: 100 - homePercent,
    };
  }

  toJSON() {
    const poss = this.getPossessionPercentages();
    return {
      matchId: this.matchId,
      homeTeamId: this.homeTeam.id,
      homeTeamName: this.homeTeam.name,
      awayTeamId: this.awayTeam.id,
      awayTeamName: this.awayTeam.name,
      homeGoals: this.homeGoals,
      awayGoals: this.awayGoals,
      goals: this.goals,
      homeShots: this.homeShots,
      awayShots: this.awayShots,
      homeShotsOnTarget: this.homeShotsOnTarget,
      awayShotsOnTarget: this.awayShotsOnTarget,
      homePassesAttempted: this.homePassesAttempted,
      awayPassesAttempted: this.awayPassesAttempted,
      homePassesCompleted: this.homePassesCompleted,
      awayPassesCompleted: this.awayPassesCompleted,
      homeInterceptions: this.homeInterceptions,
      awayInterceptions: this.awayInterceptions,
      homeSaves: this.homeSaves,
      awaySaves: this.awaySaves,
      homePossession: poss.home,
      awayPossession: poss.away,
      date: new Date().toISOString(),
    };
  }
}
