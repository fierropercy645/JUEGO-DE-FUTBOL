import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../src/persistence/SaveManager.js';
import { StorageService } from '../src/persistence/StorageService.js';

// Polyfill minimal localStorage for node environment if not present
if (typeof localStorage === 'undefined') {
  let store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
}

describe('Persistence and Save System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings when none saved', () => {
    const settings = SaveManager.getSettings();
    expect(settings).toBeDefined();
    expect(settings.matchDurationMinutes).toBe(3);
    expect(settings.difficulty).toBe('normal');
  });

  it('persists and restores updated settings correctly', () => {
    const newSettings = { matchDurationMinutes: 5, difficulty: 'dificil', soundVolume: 80 };
    SaveManager.saveSettings(newSettings);

    const loaded = SaveManager.getSettings();
    expect(loaded.matchDurationMinutes).toBe(5);
    expect(loaded.difficulty).toBe('dificil');
  });

  it('safely handles corrupted storage data without crashing', () => {
    localStorage.setItem('fl_settings_v1', 'corrupted-non-json{{');
    const settings = SaveManager.getSettings();
    expect(settings).toBeDefined();
    expect(settings.matchDurationMinutes).toBe(3);
  });
});
