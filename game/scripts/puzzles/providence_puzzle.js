/**
 * Blackwood Keep — Puzzle del Panel Providence (ProvidencePuzzle)
 * Mecánica: Panel de 10 diales giratorios para introducir la contraseña "PROVIDENCE"
 * Diales: 10 diales con 12 letras cada uno:
 * T (0°), N (30°), L (60°), R (90°), E (120°), V (150°), S (180°), C (210°), P (240°), I (270°), O (300°), D (330°)
 * Objetivo: PROVIDENCE (fila superior: P-R-O-V-I, fila inferior: D-E-N-C-E)
 */

import { Storage } from '../core/storage.js';
import { AudioController } from '../core/audio.js';

export const ProvidencePuzzle = {
  modal: null,
  stage: null,
  isMounted: false,
  isSolved: false,
  _audioCtx: null,

  // 12 letras ordenadas en el dial (inicio T arriba a 0°, rotando 30° en sentido horario)
  LETTERS: ['T', 'N', 'L', 'R', 'E', 'V', 'S', 'C', 'P', 'I', 'O', 'D'],

  // Contraseña objetivo: PROVIDENCE
  // P (8), R (3), O (10), V (5), I (9), D (11), E (4), N (1), C (7), E (4)
  TARGET_INDICES: [8, 3, 10, 5, 9, 11, 4, 1, 7, 4],

  // Posiciones porcentuales exactas sobre base 1589 x 793
  COL_X_PCT: [10.5253, 27.1399, 43.6373, 60.1086, 76.8274],
  ROW_Y_PCT: [20.4706, 59.3015],

  // Estado de los 10 diales (índice 0..11 de cada dial)
  state: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // Ángulo acumulado en grados para cada dial (para transiciones suaves continuas)
  angles: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // Referencias a los elementos DOM de los diales
  dialElements: [],

  init() {
    window.ProvidencePuzzle = this;
    this.modal = document.getElementById('modal-puzzle-providence');
    this.stage = document.getElementById('providence-panel-stage');
    if (this.modal) {
      this.modal.style.display = 'none';
    }

    const save = Storage.getSaveGame();
    this.isSolved = Boolean(save?.puzzleFlags?.providence_solved || save?.puzzleFlags?.basin_open);

    if (save?.puzzleFlags?.providence_dials && Array.isArray(save.puzzleFlags.providence_dials)) {
      this.state = [...save.puzzleFlags.providence_dials];
    } else {
      this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    this.angles = this.state.map(s => -s * 30);

    // Botón de cierre
    const btnClose = document.getElementById('btn-close-puzzle-providence');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // Cerrar al pulsar sobre el fondo modal
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Tecla Escape para cerrar
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    window.addEventListener('startNewGame', () => {
      this.reset();
    });

    window.addEventListener('loadSavedGame', (e) => {
      const s = e.detail || Storage.getSaveGame();
      this.isSolved = Boolean(s?.puzzleFlags?.providence_solved || s?.puzzleFlags?.basin_open);
      if (s?.puzzleFlags?.providence_dials && Array.isArray(s.puzzleFlags.providence_dials)) {
        this.state = [...s.puzzleFlags.providence_dials];
      } else {
        this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
      this.angles = this.state.map(st => -st * 30);
    });
  },

  isOpen() {
    return this.modal && this.modal.classList.contains('active');
  },

  /**
   * Abre el puzzle del panel Providence.
   */
  open() {
    if (!this.modal || !this.stage) {
      this.modal = document.getElementById('modal-puzzle-providence');
      this.stage = document.getElementById('providence-panel-stage');
    }

    const save = Storage.getSaveGame();
    this.isSolved = Boolean(save?.puzzleFlags?.providence_solved || save?.puzzleFlags?.basin_open);

    if (save?.puzzleFlags?.providence_dials && Array.isArray(save.puzzleFlags.providence_dials)) {
      this.state = [...save.puzzleFlags.providence_dials];
    } else if (this.isSolved) {
      this.state = [...this.TARGET_INDICES];
    } else {
      this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    this.angles = this.state.map(st => -st * 30);

    this.render();

    if (this.modal) {
      this.modal.style.display = 'flex';
      this.modal.offsetHeight;
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
    }
  },

  /**
   * Cierra el panel y persiste el estado actual.
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (!this.modal.classList.contains('active')) {
          this.modal.style.display = 'none';
        }
      }, 360);
    }

    if (!this.isSolved) {
      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
      saveState.puzzleFlags.providence_dials = [...this.state];
      Storage.setSaveGame(saveState);
    }
  },

  /**
   * Construye o actualiza los 10 diales interactivos en el panel.
   */
  render() {
    if (!this.stage) return;
    this.stage.innerHTML = '';
    this.dialElements = [];

    if (this.isSolved) {
      this.stage.classList.add('is-solved');
    } else {
      this.stage.classList.remove('is-solved');
    }

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        const idx = r * 5 + c;
        const dial = document.createElement('button');
        dial.type = 'button';
        dial.className = 'providence-dial';
        dial.dataset.dialIndex = idx;
        dial.style.left = `${this.COL_X_PCT[c]}%`;
        dial.style.top = `${this.ROW_Y_PCT[r]}%`;
        dial.style.transform = `rotate(${this.angles[idx]}deg)`;

        const letter = this.LETTERS[this.state[idx]];
        dial.setAttribute('aria-label', `Dial ${idx + 1}: Letra seleccionada ${letter}`);

        // Clic izquierdo: avanza sentido horario
        dial.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isSolved) return;
          this.rotateDial(idx, 1);
        });

        // Clic derecho: retrocede sentido antihorario
        dial.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.isSolved) return;
          this.rotateDial(idx, -1);
        });

        // Rueda de ratón
        dial.addEventListener('wheel', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.isSolved) return;
          const dir = e.deltaY > 0 ? 1 : -1;
          this.rotateDial(idx, dir);
        }, { passive: false });

        // Teclado
        dial.addEventListener('keydown', (e) => {
          if (this.isSolved) return;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.rotateDial(idx, 1);
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            this.rotateDial(idx, -1);
          }
        });

        this.stage.appendChild(dial);
        this.dialElements.push(dial);
      }
    }
  },

  /**
   * Rota un dial en la dirección especificada (1: adelante, -1: atrás).
   */
  rotateDial(idx, dir = 1) {
    if (idx < 0 || idx >= 10) return;

    this.state[idx] = (this.state[idx] + dir + 12) % 12;
    this.angles[idx] -= dir * 30;

    const dialEl = this.dialElements[idx];
    if (dialEl) {
      dialEl.style.transform = `rotate(${this.angles[idx]}deg)`;
      const letter = this.LETTERS[this.state[idx]];
      dialEl.setAttribute('aria-label', `Dial ${idx + 1}: Letra seleccionada ${letter}`);
    }

    this.playClickSound();

    // Guardar estado actual
    const save = Storage.getSaveGame() || Storage.createNewGame();
    if (!save.puzzleFlags) save.puzzleFlags = {};
    save.puzzleFlags.providence_dials = [...this.state];
    Storage.setSaveGame(save);

    // Comprobar si se ha resuelto el puzzle
    this.checkSolution();
  },

  /**
   * Comprueba si la combinación actual es "PROVIDENCE".
   */
  checkSolution() {
    if (this.isSolved) return;

    const matches = this.state.every((val, i) => val === this.TARGET_INDICES[i]);
    if (!matches) return;

    // ¡Puzzle resuelto!
    this.isSolved = true;
    this.playUnlockSound();

    const save = Storage.getSaveGame() || Storage.createNewGame();
    if (!save.puzzleFlags) save.puzzleFlags = {};
    save.puzzleFlags.providence_solved = true;
    save.puzzleFlags.basin_open = true;
    save.puzzleFlags.providence_dials = [...this.state];
    Storage.setSaveGame(save);

    if (this.stage) {
      this.stage.classList.add('is-solved');
    }

    // Desactivar interacción en diales
    this.dialElements.forEach((el) => {
      el.style.pointerEvents = 'none';
    });

    // Cerrar tras una pausa para apreciar la solución y actualizar escena
    setTimeout(() => {
      this.close();

      if (window.SceneManager) {
        window.SceneManager.renderHotspots();
        window.SceneManager.showMessage('El mecanismo ha encajado con un chasquido rotundo. La arqueta se ha abierto.');
      }
    }, 900);
  },

  /**
   * Resuelve instantáneamente el puzzle (comando debug).
   */
  solve() {
    this.state = [...this.TARGET_INDICES];
    this.angles = this.state.map(s => -s * 30);
    this.isSolved = true;

    const save = Storage.getSaveGame() || Storage.createNewGame();
    if (!save.puzzleFlags) save.puzzleFlags = {};
    save.puzzleFlags.providence_solved = true;
    save.puzzleFlags.basin_open = true;
    save.puzzleFlags.providence_dials = [...this.state];
    Storage.setSaveGame(save);

    this.render();

    if (window.SceneManager) {
      window.SceneManager.renderHotspots();
    }
    const msg = '🗝️ Puzzle Providence resuelto ("PROVIDENCE") y arqueta abierta.';
    console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
    return msg;
  },

  /**
   * Reinicia el estado del puzzle al valor inicial.
   */
  reset() {
    this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.angles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.isSolved = false;

    const save = Storage.getSaveGame();
    if (save && save.puzzleFlags) {
      delete save.puzzleFlags.providence_solved;
      delete save.puzzleFlags.basin_open;
      delete save.puzzleFlags.providence_dials;
      delete save.puzzleFlags.key_to_locker_picked;
      delete save.puzzleFlags.has_key_to_locker;
      if (Array.isArray(save.inventory)) {
        save.inventory = save.inventory.filter(i => i.id !== 'key_to_locker' && i.id !== 'bsmnt_key_to_locker');
      }
      Storage.setSaveGame(save);
    }

    if (window.InventoryManager) {
      window.InventoryManager.render();
    }

    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
      this.modal.style.display = 'none';
    }

    this.render();

    if (window.SceneManager) {
      window.SceneManager.renderHotspots();
    }
    const msg = '🔄 Puzzle Providence reiniciado (diales en "T").';
    console.log(`%c${msg}`, 'color: #aaa;');
    return msg;
  },

  /**
   * Sonido de chasquido de giro mecánico del dial.
   */
  playClickSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/dial.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();

      const t = this._audioCtx.currentTime;
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  },

  /**
   * Sonido de éxito al acertar la clave de Providence (assets/audio/sfx/success.mp3).
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
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {}
  }
};
