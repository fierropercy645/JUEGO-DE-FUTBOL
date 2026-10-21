import { SaveManager } from '../persistence/SaveManager.js';
import { League } from '../competitions/League.js';
import { DEFAULT_TEAMS } from '../data/teams.js';
import { MainMenu } from '../ui/MainMenu.js';
import { TeamSelection } from '../ui/TeamSelection.js';
import { MatchScreen } from '../ui/MatchScreen.js';
import { ResultsScreen } from '../ui/ResultsScreen.js';
import { LeagueScreen } from '../ui/LeagueScreen.js';
import { StatisticsScreen } from '../ui/StatisticsScreen.js';
import { SettingsScreen } from '../ui/SettingsScreen.js';
import { TeamsCatalogScreen } from '../ui/TeamsCatalogScreen.js';

export class App {
  constructor(rootElement) {
    this.root = rootElement;
    this.currentScreen = null;
    this.currentScreenInstance = null;
    this.settings = SaveManager.getSettings();

    // Load league if saved
    const savedLeagueData = SaveManager.getLeague();
    this.league = savedLeagueData ? new League(savedLeagueData.name, DEFAULT_TEAMS, savedLeagueData.userTeamId, savedLeagueData) : null;

    this.navigate('main-menu');
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = newSettings;
  }

  getLeague() {
    return this.league;
  }

  hasSavedLeague() {
    return this.league !== null;
  }

  startNewLeague(userTeamId) {
    this.league = new League('Liga de Leyendas', DEFAULT_TEAMS, userTeamId);
    this.saveLeagueState();
    this.navigate('league');
  }

  saveLeagueState() {
    if (this.league) {
      SaveManager.saveLeague(this.league.toJSON());
    }
  }

  clearLeague() {
    this.league = null;
    SaveManager.clearLeague();
  }

  navigate(screenName, context = {}) {
    this.currentScreen = screenName;
    this.screenContext = context;

    if (this.currentScreenInstance && typeof this.currentScreenInstance.cleanup === 'function') {
      this.currentScreenInstance.cleanup();
    }

    switch (screenName) {
      case 'main-menu':
        this.currentScreenInstance = new MainMenu(this);
        break;
      case 'team-select':
        this.currentScreenInstance = new TeamSelection(this, context);
        break;
      case 'match':
        this.currentScreenInstance = new MatchScreen(this, context);
        break;
      case 'results':
        this.currentScreenInstance = new ResultsScreen(this, context);
        break;
      case 'league':
        this.currentScreenInstance = new LeagueScreen(this);
        break;
      case 'stats':
        this.currentScreenInstance = new StatisticsScreen(this);
        break;
      case 'settings':
        this.currentScreenInstance = new SettingsScreen(this);
        break;
      case 'teams-catalog':
        this.currentScreenInstance = new TeamsCatalogScreen(this);
        break;
      default:
        this.currentScreenInstance = new MainMenu(this);
    }

    this.renderCurrentScreen();
  }

  renderCurrentScreen() {
    if (!this.currentScreenInstance) return;
    this.root.innerHTML = this.currentScreenInstance.render();
    if (typeof this.currentScreenInstance.mount === 'function') {
      this.currentScreenInstance.mount(this.root);
    }
  }

  startMatch(homeTeam, awayTeam, options = {}) {
    this.navigate('match', {
      homeTeam,
      awayTeam,
      isLeagueMatch: !!options.isLeagueMatch,
      difficulty: options.difficulty,
      matchId: options.matchId || `match-${Date.now()}`,
    });
  }

  onMatchCompleted(stats, matchContext) {
    // Record into global stats history
    SaveManager.saveMatchResultToHistory(stats);

    // If it was a league match, update the league standings
    if (matchContext.isLeagueMatch && this.league) {
      this.league.recordMatchResult(matchContext.matchId, stats.homeGoals, stats.awayGoals, false);
      this.league.checkAdvanceRound();
      this.saveLeagueState();
    }

    this.navigate('results', { stats, matchContext });
  }
}
