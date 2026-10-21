import { App } from './app/App.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (container) {
    new App(container);
  }
});
