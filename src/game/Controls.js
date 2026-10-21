export class Controls {
  constructor() {
    this.keys = {};
    this.bindings = {
      up: ['KeyW', 'ArrowUp'],
      down: ['KeyS', 'ArrowDown'],
      left: ['KeyA', 'ArrowLeft'],
      right: ['KeyD', 'ArrowRight'],
      pass: ['KeyJ'],
      shoot: ['Space'], // Zapatazo / Tiro potente
      chipShot: ['KeyU'], // Sombrerito / Vaselina por arriba del arquero
      curveShot: ['KeyO'], // Tiro con rosca / comba curva al ángulo
      sprint: ['KeyK'],
      dribble: ['KeyL'], // Jugada, quiebre y bicicleta
      slideTackle: ['KeyI'], // Barrida
      steal: ['Space', 'KeyJ'], // QUITAR BALÓN / INTERCEPTAR LIMPIO cuando defiende
      switchPlayer: ['Tab', 'KeyQ'], // Q o TAB para cambiar de jugador
      selectGK: ['KeyG', 'Digit1'], // Control directo del arquero (G o 1)
      selectP1: ['Digit1'],
      selectP2: ['Digit2'],
      selectP3: ['Digit3'],
      selectP4: ['Digit4'],
      selectP5: ['Digit5'],
      pause: ['Escape'],
    };

    this.justPressed = {};
    this.justReleased = {};

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  }

  onKeyDown(e) {
    if (this.isInputFocused()) return;

    if (e.code === 'Tab' || e.code === 'Space') {
      e.preventDefault();
    }

    if (!this.keys[e.code]) {
      this.justPressed[e.code] = true;
    }
    this.keys[e.code] = true;
  }

  onKeyUp(e) {
    if (this.keys[e.code]) {
      this.justReleased[e.code] = true;
    }
    this.keys[e.code] = false;
  }

  isActionActive(actionName) {
    if (this.isInputFocused()) return false;
    const codes = this.bindings[actionName] || [];
    return codes.some(code => this.keys[code]);
  }

  wasActionJustPressed(actionName) {
    if (this.isInputFocused()) return false;
    const codes = this.bindings[actionName] || [];
    const triggered = codes.some(code => this.justPressed[code]);
    if (triggered) {
      codes.forEach(code => {
        delete this.justPressed[code];
      });
      return true;
    }
    return false;
  }

  wasActionJustReleased(actionName) {
    if (this.isInputFocused()) return false;
    const codes = this.bindings[actionName] || [];
    const triggered = codes.some(code => this.justReleased[code]);
    if (triggered) {
      codes.forEach(code => {
        delete this.justReleased[code];
      });
      return true;
    }
    return false;
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.isActionActive('left')) dx -= 1;
    if (this.isActionActive('right')) dx += 1;
    if (this.isActionActive('up')) dy -= 1;
    if (this.isActionActive('down')) dy += 1;

    if (dx !== 0 && dy !== 0) {
      const invSqrt2 = 0.70710678;
      dx *= invSqrt2;
      dy *= invSqrt2;
    }

    return { x: dx, y: dy };
  }

  clearFrame() {
    this.justPressed = {};
    this.justReleased = {};
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
