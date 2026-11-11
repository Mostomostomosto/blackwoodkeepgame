/**
 * Blackwood Keep — Puzzle del Baúl del Sótano (TrunkPuzzle)
 * Mecánica: Sliding Puzzle 3x3 (8 piezas + 1 hueco).
 * Base: Fotografía de Julian Blackwood en el muelle frente al "Providence".
 * Especificación: puzzle_baul_sotano.md
 */

import { Storage } from '../core/storage.js';
import { InventoryManager } from '../core/inventory.js';
import { DiaryManager } from '../core/diary.js';
import { SceneManager } from '../core/scene.js';

const POSICIONES_FONDO = [
  '0% 0%',   '50% 0%',   '100% 0%',
  '0% 50%',  '50% 50%',  '100% 50%',
  '0% 100%', '50% 100%', '100% 100%'
];

export const TrunkPuzzle = {
  modal: null,
  gridEl: null,
  btnClose: null,

  grid: [0, 1, 2, 3, 4, 5, 6, 7, null],
  emptyIndex: 8,
  isMoving: false,
  isSolved: false,

  init() {
    this.modal = document.getElementById('modal-puzzle-trunk');
    this.gridEl = document.getElementById('trunk-puzzle-grid');
    this.btnClose = document.getElementById('btn-close-puzzle-trunk');

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }

    if (this.modal) {
      this.modal.style.display = 'none';
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    window.addEventListener('startNewGame', () => {
      this.reset();
    });

    window.TrunkPuzzle = this;
  },

  /**
   * Reinicia el estado del puzzle del baúl (para nueva partida).
   */
  reset() {
    this.isSolved = false;
    this.isMoving = false;
    this.grid = [0, 1, 2, 3, 4, 5, 6, 7, null];
    this.emptyIndex = 8;
    if (this.gridEl) {
      this.gridEl.classList.remove('solved');
      this.gridEl.innerHTML = '';
    }
    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
      this.modal.style.display = 'none';
    }
  },

  isOpen() {
    return this.modal && this.modal.classList.contains('active');
  },

  /**
   * Abre la interfaz del puzzle del baúl.
   */
  open() {
    const saveState = Storage.getSaveGame();
    if (saveState?.puzzleFlags?.baul_resuelto) {
      this.isSolved = true;
      this.isMoving = false;
      this.grid = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      this.emptyIndex = -1;
      this.render();
      if (this.modal) {
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
      }
      return;
    }

    this.isSolved = false;
    this.isMoving = false;

    // Recuperar estado previo o generar uno nuevo barajado
    const savedGrid = saveState?.puzzleFlags?.trunk_puzzle_state;
    if (Array.isArray(savedGrid) && savedGrid.length === 9) {
      this.grid = [...savedGrid];
      this.emptyIndex = this.grid.indexOf(null);
    } else {
      this.grid = this.generarEstadoInicial(40);
      this.emptyIndex = this.grid.indexOf(null);
    }

    this.render();

    if (this.modal) {
      this.modal.style.display = 'flex';
      this.modal.offsetHeight;
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
    }
  },

  /**
   * Cierra el puzzle y guarda el estado actual en Storage.
   */
  close() {
    if (!this.isSolved) {
      const saveState = Storage.getSaveGame();
      if (saveState) {
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.trunk_puzzle_state = [...this.grid];
        Storage.setSaveGame(saveState);
      }
    }

    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (!this.modal.classList.contains('active')) {
          this.modal.style.display = 'none';
        }
      }, 360);
    }
  },

  /**
   * Genera un estado inicial matemáticamente resoluble simulando N movimientos aleatorios válidos.
   */
  generarEstadoInicial(numMovimientos = 40) {
    let estado = [0, 1, 2, 3, 4, 5, 6, 7, null];
    let huecoIdx = 8;
    let ultimoIdx = -1;

    for (let i = 0; i < numMovimientos; i++) {
      const adyacentes = this.obtenerAdyacentes(huecoIdx).filter(p => p !== ultimoIdx);
      const candidatos = adyacentes.length > 0 ? adyacentes : this.obtenerAdyacentes(huecoIdx);
      const mov = candidatos[Math.floor(Math.random() * candidatos.length)];
      [estado[huecoIdx], estado[mov]] = [estado[mov], estado[huecoIdx]];
      ultimoIdx = huecoIdx;
      huecoIdx = mov;
    }

    // Asegurarse de que no queda accidentalmente resuelto
    if (this.esEstadoResuelto(estado)) {
      const ady = this.obtenerAdyacentes(huecoIdx);
      const mov = ady[0];
      [estado[huecoIdx], estado[mov]] = [estado[mov], estado[huecoIdx]];
    }

    return estado;
  },

  /**
   * Devuelve los índices ortogonales adyacentes a una casilla en grid 3x3.
   */
  obtenerAdyacentes(idx, cols = 3) {
    const fila = Math.floor(idx / cols);
    const col = idx % cols;
    const candidatos = [];
    if (fila > 0) candidatos.push(idx - cols);         // arriba
    if (fila < cols - 1) candidatos.push(idx + cols);  // abajo
    if (col > 0) candidatos.push(idx - 1);             // izquierda
    if (col < cols - 1) candidatos.push(idx + 1);      // derecha
    return candidatos;
  },

  /**
   * Comprueba si el array de estado coincide con la solución.
   */
  esEstadoResuelto(estado) {
    return estado.slice(0, 8).every((val, idx) => val === idx);
  },

  /**
   * Renderiza la cuadrícula de 3x3 en el DOM.
   */
  render() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    this.gridEl.classList.remove('solved');

    const adyacentesHueco = this.obtenerAdyacentes(this.emptyIndex);

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'puzzle-cell';
      cell.dataset.gridIndex = i;

      const pieceId = this.grid[i];

      if (pieceId !== null) {
        const piece = document.createElement('button');
        piece.type = 'button';
        piece.className = 'puzzle-piece';
        piece.dataset.originalPos = pieceId;
        piece.dataset.gridIndex = i;
        piece.setAttribute('aria-label', `Pieza ${pieceId + 1}`);

        // Asignación de fragmento visual según su posición original fija
        piece.style.backgroundPosition = POSICIONES_FONDO[pieceId];

        const canMove = adyacentesHueco.includes(i) && !this.isSolved;
        if (canMove) {
          piece.classList.add('can-move');
        }

        this.setupPieceEvents(piece, i, canMove);

        cell.appendChild(piece);
      } else {
        cell.classList.add('puzzle-slot-empty');
      }

      this.gridEl.appendChild(cell);
    }
  },

  /**
   * Configura eventos táctiles, de ratón (Pointer Events) y arrastre en cada pieza.
   */
  setupPieceEvents(piece, i, canMove) {
    if (!canMove) {
      piece.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        this.playShakeAnimation(piece);
      });
      return;
    }

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isPointerDown = false;
    let hasDragged = false;
    let currentDeltaX = 0;
    let currentDeltaY = 0;
    let activePointerId = null;

    const fromCol = i % 3;
    const fromRow = Math.floor(i / 3);
    const toCol = this.emptyIndex % 3;
    const toRow = Math.floor(this.emptyIndex / 3);

    const dirX = toCol - fromCol; // -1, 0, 1
    const dirY = toRow - fromRow; // -1, 0, 1

    const onPointerDown = (e) => {
      if (this.isMoving || this.isSolved) return;
      if (e.button !== undefined && e.button !== 0) return;

      isPointerDown = true;
      hasDragged = false;
      currentDeltaX = 0;
      currentDeltaY = 0;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      activePointerId = e.pointerId;

      try {
        piece.setPointerCapture(e.pointerId);
      } catch (err) {}

      piece.style.transition = 'none';
      piece.style.zIndex = '30';
    };

    const onPointerMove = (e) => {
      if (!isPointerDown || this.isMoving || this.isSolved) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;

      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;

      const parentCell = piece.parentElement;
      const parentRect = parentCell ? parentCell.getBoundingClientRect() : piece.getBoundingClientRect();
      const cellStepX = parentRect.width + 5;
      const cellStepY = parentRect.height + 5;

      if (dirX !== 0) {
        let projected = diffX;
        if (dirX > 0) {
          projected = Math.max(0, Math.min(projected, cellStepX));
        } else {
          projected = Math.min(0, Math.max(projected, -cellStepX));
        }
        currentDeltaX = projected;
        currentDeltaY = 0;
        piece.style.transform = `translate(${currentDeltaX}px, 0px)`;
      } else if (dirY !== 0) {
        let projected = diffY;
        if (dirY > 0) {
          projected = Math.max(0, Math.min(projected, cellStepY));
        } else {
          projected = Math.min(0, Math.max(projected, -cellStepY));
        }
        currentDeltaX = 0;
        currentDeltaY = projected;
        piece.style.transform = `translate(0px, ${currentDeltaY}px)`;
      }

      if (Math.hypot(diffX, diffY) > 6) {
        hasDragged = true;
      }
    };

    const finishMove = () => {
      this.isMoving = true;
      const parentCell = piece.parentElement;
      const parentRect = parentCell ? parentCell.getBoundingClientRect() : piece.getBoundingClientRect();
      const finalX = dirX * (parentRect.width + 5);
      const finalY = dirY * (parentRect.height + 5);

      piece.style.transition = 'transform 0.14s cubic-bezier(0.2, 0.8, 0.3, 1)';
      piece.style.transform = `translate(${finalX}px, ${finalY}px)`;
      this.playSlideTone();

      setTimeout(() => {
        this.grid[this.emptyIndex] = this.grid[i];
        this.grid[i] = null;
        this.emptyIndex = i;

        this.isMoving = false;
        this.render();

        if (this.esEstadoResuelto(this.grid)) {
          this.onSolve();
        }
      }, 150);
    };

    const cancelMove = () => {
      piece.style.transition = 'transform 0.15s ease-out';
      piece.style.transform = 'translate(0px, 0px)';
      setTimeout(() => {
        piece.style.zIndex = '';
        piece.style.transition = '';
      }, 160);
    };

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      isPointerDown = false;
      activePointerId = null;

      try {
        piece.releasePointerCapture(e.pointerId);
      } catch (err) {}

      if (this.isMoving || this.isSolved) {
        cancelMove();
        return;
      }

      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;
      const duration = Date.now() - startTime;
      const parentCell = piece.parentElement;
      const parentRect = parentCell ? parentCell.getBoundingClientRect() : piece.getBoundingClientRect();
      const step = dirX !== 0 ? (parentRect.width + 5) : (parentRect.height + 5);
      const moved = dirX !== 0 ? Math.abs(currentDeltaX) : Math.abs(currentDeltaY);

      // Criterios de activación del movimiento:
      // 1. Clic o tap rápido en la pieza (< 350ms y arrastre mínimo)
      const isTapOrClick = !hasDragged || (duration < 350 && Math.hypot(diffX, diffY) < 12);
      // 2. Deslizamiento rápido (flick / swipe en la dirección correcta)
      const isFlick = (duration < 350) && (
        (dirX > 0 && diffX > 18) ||
        (dirX < 0 && diffX < -18) ||
        (dirY > 0 && diffY > 18) ||
        (dirY < 0 && diffY < -18)
      );
      // 3. Arrastre sostenido de más del 22% del recorrido
      const isDraggedEnough = moved >= Math.max(18, step * 0.22);

      if (isTapOrClick || isFlick || isDraggedEnough) {
        finishMove();
      } else {
        cancelMove();
      }
    };

    const onPointerCancel = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      activePointerId = null;
      try {
        piece.releasePointerCapture(e.pointerId);
      } catch (err) {}
      cancelMove();
    };

    piece.addEventListener('pointerdown', onPointerDown);
    piece.addEventListener('pointermove', onPointerMove);
    piece.addEventListener('pointerup', onPointerUp);
    piece.addEventListener('pointercancel', onPointerCancel);
    piece.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  },

  /**
   * Animación de leve temblor cuando se pulsa una ficha bloqueada.
   */
  playShakeAnimation(piece) {
    if (!piece || piece.classList.contains('shake')) return;
    piece.classList.add('shake');
    setTimeout(() => {
      piece.classList.remove('shake');
    }, 280);
  },

  /**
   * Procesa el clic directo sobre una pieza (método de conveniencia / fallback).
   */
  handlePieceClick(clickedIndex, pieceEl) {
    if (this.isMoving || this.isSolved) return;

    const adyacentes = this.obtenerAdyacentes(this.emptyIndex);
    if (!adyacentes.includes(clickedIndex)) {
      return;
    }

    this.isMoving = true;

    const fromCol = clickedIndex % 3;
    const fromRow = Math.floor(clickedIndex / 3);
    const toCol = this.emptyIndex % 3;
    const toRow = Math.floor(this.emptyIndex / 3);

    const deltaX = (toCol - fromCol) * 100;
    const deltaY = (toRow - fromRow) * 100;
    const gapOffset = 5;
    const pixelX = (toCol - fromCol) * gapOffset;
    const pixelY = (toRow - fromRow) * gapOffset;

    try {
      pieceEl.style.transform = `translate(calc(${deltaX}% + ${pixelX}px), calc(${deltaY}% + ${pixelY}px))`;
      this.playSlideTone();
    } catch (e) {
      console.error('Error durante la animación de la pieza:', e);
      this.isMoving = false;
      return;
    }

    setTimeout(() => {
      this.grid[this.emptyIndex] = this.grid[clickedIndex];
      this.grid[clickedIndex] = null;
      this.emptyIndex = clickedIndex;

      this.isMoving = false;
      this.render();

      if (this.esEstadoResuelto(this.grid)) {
        this.onSolve();
      }
    }, 180);
  },

  /**
   * Genera un sutil tono de madera al deslizar una ficha (Web Audio API).
   */
  playSlideTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }

      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, this._audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this._audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this._audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this._audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);

      osc.start();
      osc.stop(this._audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Tono de resolución exitosa del baúl (assets/audio/sfx/success.mp3).
   */
  playSuccessTone() {
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
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }

      const now = this._audioCtx.currentTime;

      // Doble clic metálico (resorte de cerradura)
      const playClick = (time, freq) => {
        const osc = this._audioCtx.createOscillator();
        const gain = this._audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.connect(gain);
        gain.connect(this._audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.06);
      };

      playClick(now, 520);
      playClick(now + 0.07, 780);
      playClick(now + 0.22, 1040);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Dispara la secuencia de victoria al completar el puzzle.
   */
  onSolve() {
    this.isSolved = true;

    // 1. Rellenar la 9ª pieza (el hueco) para que la foto quede completa al 100%
    if (this.gridEl) {
      const emptySlot = this.gridEl.querySelector('.puzzle-slot-empty');
      if (emptySlot) {
        emptySlot.classList.remove('puzzle-slot-empty');
        const finalPiece = document.createElement('div');
        finalPiece.className = 'puzzle-piece final-piece';
        finalPiece.style.backgroundPosition = POSICIONES_FONDO[8];
        emptySlot.appendChild(finalPiece);
      }

      this.gridEl.classList.add('solved');
    }

    this.playSuccessTone();

    // 2. Notificación narrativa
    SceneManager.showMessage('¡Un clic metálico resuena! El mecanismo del baúl se ha desbloqueado.', 4000);

    // 3. Actualizar flags de guardado marcando el baúl como resuelto
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.baul_resuelto = true;
    saveState.puzzleFlags.trunk_open = true;
    saveState.puzzleFlags.baul_abierto = true;
    delete saveState.puzzleFlags.trunk_puzzle_state;
    Storage.setSaveGame(saveState);

    // 4. Añadir a Diario: Fotografía completa de Julian y el "Providence"
    DiaryManager.addEntry({
      id: 'photo_julian_ship',
      title: 'Fotografía: Julian y el "Providence"',
      badge: '✦ NOTA DE INVESTIGACIÓN ✦',
      image: 'assets/levels/level_01_bsmnt/puzzles/trunk/puzzle_01_01.webp',
      imageCaption: '🔍 Clic para ampliar fotografía',
      text: 'Fotografía rescatada de la tapa del baúl. Muestra a Julian Blackwood en el muelle frente a su buque pesquero. En el casco de la embarcación se distingue claramente el nombre rotulado: "PROVIDENCE".',
      date: 'Descubierto en el baúl del sótano'
    });

    // 6. Transición tras admirar la foto completa: cerrar puzzle y navegar a baúl abierto
    setTimeout(() => {
      this.close();
      SceneManager.navigateTo('bsmnt_01_trunk_open');
    }, 2200);
  },

  /**
   * Helper para resolver directamente el puzzle desde la consola de pruebas.
   */
  solveDirectly() {
    this.grid = [0, 1, 2, 3, 4, 5, 6, 7, null];
    this.emptyIndex = 8;
    this.render();
    this.onSolve();
    return '✨ Puzzle del baúl resuelto directamente con éxito.';
  }
};
