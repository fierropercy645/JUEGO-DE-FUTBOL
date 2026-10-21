export class Standings {
  /**
   * Recalculates standings given an array of teams and finished matches.
   * Single source of truth derived strictly from recorded matches.
   *
   * @param {Array} teams - Array of team objects ({ id, name, ... })
   * @param {Array} matches - Array of match objects ({ homeTeamId, awayTeamId, homeGoals, awayGoals, played })
   * @returns {Array} Sorted standings table
   */
  static calculate(teams, matches = []) {
    const table = {};

    teams.forEach(t => {
      table[t.id] = {
        teamId: t.id,
        teamName: t.name,
        pj: 0, // Partidos Jugados
        pg: 0, // Ganados
        pe: 0, // Empatados
        pp: 0, // Perdidos
        gf: 0, // Goles Favor
        gc: 0, // Goles Contra
        dg: 0, // Diferencia de Goles
        pts: 0, // Puntos
      };
    });

    matches.forEach(m => {
      if (!m.played || m.homeGoals === null || m.awayGoals === null) return;

      const home = table[m.homeTeamId];
      const away = table[m.awayTeamId];

      if (!home || !away) return;

      home.pj += 1;
      away.pj += 1;
      home.gf += m.homeGoals;
      home.gc += m.awayGoals;
      away.gf += m.awayGoals;
      away.gc += m.homeGoals;

      if (m.homeGoals > m.awayGoals) {
        home.pg += 1;
        home.pts += 3;
        away.pp += 1;
      } else if (m.homeGoals < m.awayGoals) {
        away.pg += 1;
        away.pts += 3;
        home.pp += 1;
      } else {
        home.pe += 1;
        away.pe += 1;
        home.pts += 1;
        away.pts += 1;
      }
    });

    const result = Object.values(table).map(entry => {
      entry.dg = entry.gf - entry.gc;
      return entry;
    });

    // Tie-breaker rules:
    // 1. Points (pts) desc
    // 2. Goal Difference (dg) desc
    // 3. Goals For (gf) desc
    // 4. Alphabetical by Team Name as stable tie-breaker
    result.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.teamName.localeCompare(b.teamName);
    });

    return result;
  }
}
