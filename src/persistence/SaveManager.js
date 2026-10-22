import { StorageService } from './StorageService.js';
import { STORAGE_KEYS, DIFFICULTY } from '../utils/constants.js';

export class SaveManager {
  static getDefaultSettings() {
    return {
      matchDurationMinutes: 3, // 3 minutes real time for a match
      difficulty: DIFFICULTY.NORMAL,
      soundVolume: 70,
      showControlsHelp: true,
      gameSpeed: 1.0,
    };
  }

  static getSettings() {
    const saved = StorageService.get(STORAGE_KEYS.SETTINGS, null);
    if (!saved || typeof saved !== 'object') {
      return this.getDefaultSettings();
    }
    return { ...this.getDefaultSettings(), ...saved };
  }

  static saveSettings(settings) {
    return StorageService.set(STORAGE_KEYS.SETTINGS, settings);
  }

  static getLeague() {
    return StorageService.get(STORAGE_KEYS.LEAGUE, null);
  }

  static saveLeague(leagueData) {
    return StorageService.set(STORAGE_KEYS.LEAGUE, leagueData);
  }

  static clearLeague() {
    return StorageService.remove(STORAGE_KEYS.LEAGUE);
  }

  static getTournament() {
    return StorageService.get(STORAGE_KEYS.TOURNAMENT, null);
  }

  static saveTournament(tournamentData) {
    return StorageService.set(STORAGE_KEYS.TOURNAMENT, tournamentData);
  }

  static clearTournament() {
    return StorageService.remove(STORAGE_KEYS.TOURNAMENT);
  }

  static getStatsHistory() {
    const list = StorageService.get(STORAGE_KEYS.STATS, []);
    return Array.isArray(list) ? list : [];
  }

  static saveMatchResultToHistory(matchStats) {
    const history = this.getStatsHistory();
    // Prevent duplicate matches by id
    const existingIndex = history.findIndex(m => m.matchId === matchStats.matchId);
    if (existingIndex >= 0) {
      history[existingIndex] = matchStats;
    } else {
      history.unshift(matchStats);
    }
    // Keep max 50 recent matches
    if (history.length > 50) history.pop();
    StorageService.set(STORAGE_KEYS.STATS, history);
  }

  static clearStatsHistory() {
    return StorageService.remove(STORAGE_KEYS.STATS);
  }
}
