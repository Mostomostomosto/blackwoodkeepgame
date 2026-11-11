/**
 * Blackwood Keep — Puzzle del Criptex de la Sala 2 (CryptexPuzzle)
 * Mecánica: 8 tambores rotatorios cilíndricos con bucle continuo infinito.
 * Contraseña objetivo: A L H A Z R E D
 * Tira de 12 letras: A, W, D, T, H, J, Z, V, R, I, E, L (cada letra = 179px)
 */

import { Storage } from '../core/storage.js';
import { AudioController } from '../core/audio.js';

export const CryptexPuzzle = {
  container: null,
  isMounted: false,
  isSolved: false,
  _audioCtx: null,

  // 12 letras disponibles en la tira bsmnt_criptex_letters.webp
  LETTERS: ['A', 'W', 'D', 'T', 'H', 'J', 'Z', 'V', 'R', 'I', 'E', 'L'],

  // Contraseña de desbloqueo: ALHAZRED
  TARGET: ['A', 'L', 'H', 'A', 'Z', 'R', 'E', 'D'],

  // Posiciones X de los 8 tambores dentro del panel de 1635x597
  DIAL_X: [182, 355, 522, 695, 868, 1041, 1211, 1384],

  // Estado actual de cada tambor (índices 0..11). Inicialmente en Z (índice 6)
  state: [6, 6, 6, 6, 6, 6, 6, 6],

  // Paso visual de cada tambor (0..13) para transición continua sin huecos
  steps: [6, 6, 6, 6, 6, 6, 6, 6],

  // Indicador de animación en curso por tambor
  animating: [false, false, false, false, false, false, false, false],

  init() {
    window.CryptexPuzzle = this;
    const save = Storage.getSaveGame();
    this.isSolved = Boolean(save?.puzzleFlags?.cryptex_solved || save?.puzzleFlags?.door_02_unlocked);

    window.addEventListener('startNewGame', () => {
      this.reset();
    });

    window.addEventListener('loadSavedGame', (e) => {
      const s = e.detail || Storage.getSaveGame();
      this.isSolved = Boolean(s?.puzzleFlags?.cryptex_solved || s?.puzzleFlags?.door_02_unlocked);
      if (s?.puzzleFlags?.cryptex_state && Array.isArray(s.puzzleFlags.cryptex_state)) {
        this.state = [...s.puzzleFlags.cryptex_state];
      } else {
        this.state = [6, 6, 6, 6, 6, 6, 6, 6];
      }
      this.steps = this.state.map(st => (st === 0 ? 12 : st));
    });
  },

  /**
   * Monta la interfaz del criptex dentro del contenedor de escena.
   */
  mount(parentEl) {
    if (!parentEl) return;
    this.unmount();

    const save = Storage.getSaveGame();
    if (save?.puzzleFlags?.cryptex_state && Array.isArray(save.puzzleFlags.cryptex_state)) {
      this.state = [...save.puzzleFlags.cryptex_state];
    } else {
      this.state = [6, 6, 6, 6, 6, 6, 6, 6];
    }
    this.steps = this.state.map(s => (s === 0 ? 12 : s));

    this.isSolved = Boolean(save?.puzzleFlags?.cryptex_solved || save?.puzzleFlags?.door_02_unlocked);

    const board = document.createElement('div');
    board.id = 'cryptex-board';
    board.className = 'cryptex-board';
    if (this.isSolved) board.classList.add('is-solved');

    // 1. Crear los 8 tambores con doble tira de letras (para bucle continuo infinito)
    this.DIAL_X.forEach((xPos, idx) => {
      const dial = document.createElement('div');
      dial.className = 'cryptex-dial';
      dial.dataset.dialIndex = idx;
      dial.style.left = `${xPos}px`;
      dial.setAttribute('role', 'button');
      dial.setAttribute('aria-label', `Disco ${idx + 1}: ${this.LETTERS[this.state[idx]]}`);
      dial.setAttribute('tabindex', '0');

      const strip = document.createElement('div');
      strip.className = 'cryptex-strip';
      strip.id = `cryptex-strip-${idx}`;

      // Primera tira (12 letras)
      const img1 = document.createElement('img');
      img1.src = 'assets/levels/level_01_bsmnt/puzzles/cryptex/bsmnt_criptex_letters.webp';
      img1.className = 'cryptex-letters-img';
      img1.alt = '';
      strip.appendChild(img1);

      // Segunda tira duplicada (para transición continua 11 -> 0 sin saltos)
      const img2 = document.createElement('img');
      img2.src = 'assets/levels/level_01_bsmnt/puzzles/cryptex/bsmnt_criptex_letters.webp';
      img2.className = 'cryptex-letters-img';
      img2.alt = '';
      strip.appendChild(img2);

      // Colocar en posición inicial (en 'A' se usa paso 12 para mostrar la 'L' encima)
      const initialStep = this.steps[idx];
      const initialY = 131 - (initialStep * 179);
      strip.style.transform = `translateY(${initialY}px)`;

      dial.appendChild(strip);

      // Evento de clic para girar
      dial.addEventListener('click', (e) => {
        e.stopPropagation();
        this.rotateDial(idx);
      });

      // Soporte para teclado (Enter / Espacio)
      dial.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.rotateDial(idx);
        }
      });

      board.appendChild(dial);
    });

    // 2. Máscara frontal del panel metálico con las ranuras transparentes
    const panelImg = document.createElement('img');
    panelImg.src = 'assets/levels/level_01_bsmnt/puzzles/cryptex/bsmnt_criptex_panel.webp';
    panelImg.className = 'cryptex-panel-overlay';
    panelImg.alt = 'Panel Criptex';
    board.appendChild(panelImg);

    // 3. Indicador de estado de desbloqueo
    const statusGlow = document.createElement('div');
    statusGlow.className = 'cryptex-status-glow';
    board.appendChild(statusGlow);

    parentEl.appendChild(board);
    this.container = board;
    this.isMounted = true;

    // Escalar dinámicamente el panel centrándolo en el área libre fuera del inventario
    this.updateScale();
    requestAnimationFrame(() => this.updateScale());
    this._onResize = () => this.updateScale();
    window.addEventListener('resize', this._onResize);
  },

  /**
   * Ajusta la escala proporcional del panel (1635x597) y lo centra en el área visible
   * libre a la derecha de la barra lateral de inventario.
   */
  updateScale() {
    if (!this.container) return;
    const gameContainer = document.getElementById('game-container') || this.container.parentElement;
    if (!gameContainer) return;

    const cw = gameContainer.clientWidth;
    const ch = gameContainer.clientHeight;
    if (!cw || !ch) return;

    // Detectar el ancho real del inventario lateral para evitar que tape el extremo izquierdo
    const sidebar = document.getElementById('inventory-sidebar');
    const sidebarW = (sidebar && sidebar.offsetWidth) ? sidebar.offsetWidth : 0;

    // Espacio horizontal libre entre la barra de inventario y el borde derecho del juego
    const availW = Math.max(100, cw - sidebarW);
    const centerX = sidebarW + (availW / 2);

    // Base de diseño: 1635x597. Escala máxima respetando márgenes (92% del ancho libre, 80% del alto)
    const scaleW = (availW * 0.92) / 1635;
    const scaleH = (ch * 0.80) / 597;
    const scale = Math.min(1, Math.min(scaleW, scaleH));

    this.container.style.left = `${centerX}px`;
    this.container.style.top = '50%';
    this.container.style.transformOrigin = 'center center';
    this.container.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
  },

  /**
   * Desmonta el tablero del criptex al cambiar de escena.
   */
  unmount() {
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.isMounted = false;
  },

  /**
   * Rota el disco indicado un paso hacia arriba para mostrar la siguiente letra.
   * Implementa el bucle continuo sin saltos visuales.
   */
  rotateDial(idx) {
    if (this.isSolved || this.animating[idx]) return;

    this.animating[idx] = true;
    this.playClickSound();

    const strip = document.getElementById(`cryptex-strip-${idx}`);
    if (!strip) {
      this.animating[idx] = false;
      return;
    }

    const currentStep = (this.steps && this.steps[idx] !== undefined)
      ? this.steps[idx]
      : (this.state[idx] === 0 ? 12 : this.state[idx]);
    const nextStep = currentStep + 1; // Sube al siguiente

    // Animación suave hacia el siguiente paso
    const targetY = 131 - (nextStep * 179);
    strip.style.transition = 'transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)';
    strip.style.transform = `translateY(${targetY}px)`;

    setTimeout(() => {
      if (nextStep >= 13) {
        // Al llegar a la W (paso 13), la tira antigua queda completamente fuera de la vista.
        // Reseteamos instantáneamente a la W de la primera tira (paso 1) sin salto visual ni huecos.
        this.state[idx] = 1;
        this.steps[idx] = 1;
        strip.style.transition = 'none';
        strip.style.transform = `translateY(${131 - 1 * 179}px)`;
        void strip.offsetHeight; // Forzar reflujo
      } else if (nextStep === 12) {
        // Al llegar a la A (paso 12), mostramos la A de la tira duplicada.
        // Mantenemos la tira antigua arriba (mostrando la L) sin borrarla todavía para evitar el hueco.
        this.state[idx] = 0;
        this.steps[idx] = 12;
      } else {
        this.state[idx] = nextStep;
        this.steps[idx] = nextStep;
      }

      this.animating[idx] = false;

      // Actualizar accesibilidad
      const dial = document.querySelector(`.cryptex-dial[data-dial-index="${idx}"]`);
      if (dial) {
        dial.setAttribute('aria-label', `Disco ${idx + 1}: ${this.LETTERS[this.state[idx]]}`);
      }

      // Guardar estado en memoria
      const save = Storage.getSaveGame();
      if (save) {
        if (!save.puzzleFlags) save.puzzleFlags = {};
        save.puzzleFlags.cryptex_state = [...this.state];
        Storage.setSaveGame(save);
      }

      // Comprobar si se ha formado ALHAZRED
      this.checkSolution();
    }, 230);
  },

  /**
   * Comprueba si la palabra formada por los 8 discos coincide con ALHAZRED.
   */
  checkSolution() {
    const currentWord = this.state.map(i => this.LETTERS[i]).join('');
    const targetWord = this.TARGET.join('');

    if (currentWord === targetWord) {
      this.onSolved();
    }
  },

  /**
   * Maneja la resolución satisfactoria del puzle.
   */
  onSolved() {
    this.isSolved = true;
    this.playUnlockSound();

    if (this.container) {
      this.container.classList.add('is-solved');
    }

    const save = Storage.getSaveGame() || Storage.createNewGame();
    if (!save.puzzleFlags) save.puzzleFlags = {};
    save.puzzleFlags.cryptex_solved = true;
    save.puzzleFlags.door_02_unlocked = true;
    Storage.setSaveGame(save);

    if (window.SceneManager) {
      window.SceneManager.showMessage('Un chasquido metálico resuena en los cerrojos. La puerta a la Sala 2 se ha desbloqueado.');
    }
  },

  /**
   * Efecto sonoro de clic mecánico de trinquete al rotar cada tambor.
   */
  playClickSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/alhazred.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();

      const t = this._audioCtx.currentTime;

      // Componente tonal metálico
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2100, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.045);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      // Componente de fricción / ruido de trinquete
      const bufferSize = Math.floor(this._audioCtx.sampleRate * 0.02);
      const buffer = this._audioCtx.createBuffer(1, bufferSize, this._audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this._audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this._audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.2, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      noise.connect(noiseGain);
      noiseGain.connect(this._audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
      noise.start(t);
    } catch (e) {}
  },

  /**
   * Sonido de éxito al resolver el criptex ALHAZRED (assets/audio/sfx/success.mp3).
   */
  playUnlockSound() {
    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/success.mp3');
        return;
      }
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/success.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();

      const t = this._audioCtx.currentTime;

      // Golpe grave de pestillo
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    } catch (e) {}
  },

  /**
   * Resetea el criptex para pruebas.
   */
  reset() {
    this.isSolved = false;
    this.state = [6, 6, 6, 6, 6, 6, 6, 6];
    this.steps = [6, 6, 6, 6, 6, 6, 6, 6];
    const save = Storage.getSaveGame();
    if (save && save.puzzleFlags) {
      delete save.puzzleFlags.cryptex_solved;
      delete save.puzzleFlags.door_02_unlocked;
      delete save.puzzleFlags.cryptex_state;
      Storage.setSaveGame(save);
    }
    if (this.isMounted && this.container) {
      this.DIAL_X.forEach((_, idx) => {
        const strip = document.getElementById(`cryptex-strip-${idx}`);
        if (strip) {
          strip.style.transition = 'none';
          strip.style.transform = `translateY(${131 - 6 * 179}px)`;
        }
      });
      this.container.classList.remove('is-solved');
    }
  }
};
