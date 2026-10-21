export class Schedule {
  /**
   * Generates a round-robin schedule (double round: home & away).
   * For N teams (even), there are (N-1) rounds in first leg, and (N-1) in return leg.
   * Total rounds = 2 * (N - 1) = 14 for 8 teams.
   * Matches per round = N / 2 = 4 for 8 teams.
   * Total matches = 14 * 4 = 56 matches.
   *
   * @param {Array} teams - list of teams
   * @returns {Array} Array of rounds, each having matches [{ id, round, homeTeamId, awayTeamId, homeGoals, awayGoals, played, simulated }]
   */
  static generate(teams) {
    if (!teams || teams.length < 2) return [];

    let teamList = [...teams];
    const n = teamList.length;
    const roundsCount = (n - 1) * 2;
    const matchesPerRound = n / 2;

    const rounds = [];
    let matchCounter = 1;

    // Berger tables / round-robin circle algorithm
    const indices = teamList.map((_, i) => i);

    // First leg (rounds 1 to n - 1)
    for (let r = 0; r < n - 1; r++) {
      const roundMatches = [];
      for (let i = 0; i < matchesPerRound; i++) {
        const homeIdx = indices[i];
        const awayIdx = indices[n - 1 - i];

        // Alternate home/away to balance
        const isAlternate = (r + i) % 2 === 1;
        const homeTeam = isAlternate ? teamList[awayIdx] : teamList[homeIdx];
        const awayTeam = isAlternate ? teamList[homeIdx] : teamList[awayIdx];

        roundMatches.push({
          id: `match-${matchCounter++}`,
          round: r + 1,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeGoals: null,
          awayGoals: null,
          played: false,
          simulated: false,
        });
      }

      rounds.push({
        roundNumber: r + 1,
        matches: roundMatches,
      });

      // Rotate indices, keeping indices[0] fixed
      const last = indices.pop();
      indices.splice(1, 0, last);
    }

    // Second leg (rounds n to (n-1)*2), swapping home and away
    for (let r = 0; r < n - 1; r++) {
      const firstLegRound = rounds[r];
      const returnRoundNumber = r + n;
      const returnMatches = firstLegRound.matches.map(m => ({
        id: `match-${matchCounter++}`,
        round: returnRoundNumber,
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        homeGoals: null,
        awayGoals: null,
        played: false,
        simulated: false,
      }));

      rounds.push({
        roundNumber: returnRoundNumber,
        matches: returnMatches,
      });
    }

    return rounds;
  }
}
