/**
 * Blackwood Keep — Puzzle del Panel del Cuadro de Luces (LightBoxWiresPuzzle)
 * Mecánica: Conexión de 4 cables puente con física curva SVG.
 * Clavijas: 4 pares (Rojo, Verde, Azul, Amarillo).
 * Solución requerida:
 *   - Rojo (izq)    -> Amarillo (dcha)
 *   - Verde (izq)   -> Azul (dcha)
 *   - Azul (izq)    -> Rojo (dcha)
 *   - Amarillo (izq)-> Verde (dcha)
 * Indicador: Sube 25% con cada cable. Si falla al 100%, parpadea en rojo y resetea.
 * Si acierta, pasa a verde y abre el cuadro de luces.
 */

import { Storage } from '../core/storage.js';
import { AudioController } from '../core/audio.js';

export const LightBoxWiresPuzzle = {
  container: null,
  isMounted: false,
  isSolved: false,
  isVerifying: false,
  _audioCtx: null,

  // Definición de las clavijas sobre la base de 747 x 996 del panel
  PINS: {
    left: [
      { id: 'left_red', color: 'red', hex: '#e53935', glow: '#ff5252', x: 171, y: 257, label: 'Clavija izquierda Roja' },
      { id: 'left_green', color: 'green', hex: '#43a047', glow: '#69f0ae', x: 169, y: 394, label: 'Clavija izquierda Verde' },
      { id: 'left_blue', color: 'blue', hex: '#1e88e5', glow: '#448aff', x: 176, y: 534, label: 'Clavija izquierda Azul' },
      { id: 'left_yellow', color: 'yellow', hex: '#fbc02d', glow: '#ffff00', x: 174, y: 670, label: 'Clavija izquierda Amarilla' }
    ],
    right: [
      { id: 'right_red', color: 'red', hex: '#e53935', glow: '#ff5252', x: 381, y: 264, label: 'Clavija derecha Roja' },
      { id: 'right_green', color: 'green', hex: '#43a047', glow: '#69f0ae', x: 375, y: 394, label: 'Clavija derecha Verde' },
      { id: 'right_blue', color: 'blue', hex: '#1e88e5', glow: '#448aff', x: 381, y: 534, label: 'Clavija derecha Azul' },
      { id: 'right_yellow', color: 'yellow', hex: '#fbc02d', glow: '#ffff00', x: 380, y: 670, label: 'Clavija derecha Amarilla' }
    ]
  },

  // Solución requerida por el circuito eléctrico
  SOLUTION: {
    'left_red': 'right_yellow',
    'left_green': 'right_blue',
    'left_blue': 'right_red',
    'left_yellow': 'right_green'
  },

  // Cables conectados: [{ from: 'left_red', to: 'right_yellow', colorHex: '...', glowHex: '...' }]
  cables: [],

  // Cable actualmente en arrastre / siguiendo el puntero
  activeCable: null,

  init() {
    window.LightBoxWiresPuzzle = this;
    const save = Storage.getSaveGame();
    this.isSolved = Boolean(save?.puzzleFlags?.light_box_wires_solved || save?.puzzleFlags?.light_box_open);

    window.addEventListener('startNewGame', () => {
      this.reset();
    });

    window.addEventListener('loadSavedGame', (e) => {
      const s = e.detail || Storage.getSaveGame();
      this.isSolved = Boolean(s?.puzzleFlags?.light_box_wires_solved || s?.puzzleFlags?.light_box_open);
    });
  },

  /**
   * Monta el panel del puzle en el contenedor de escena.
   */
  mount(parentEl) {
    if (!parentEl) return;
    this.unmount();

    this.parentEl = parentEl;
    const save = Storage.getSaveGame();
    this.isSolved = Boolean(save?.puzzleFlags?.light_box_wires_solved || save?.puzzleFlags?.light_box_open);
    this.isVerifying = false;
    this.activeCable = null;

    // Si ya fue resuelto previamente, restaurar los 4 cables correctos
    if (this.isSolved) {
      this.cables = Object.entries(this.SOLUTION).map(([fromId, toId]) => {
        const fromPin = this.PINS.left.find(p => p.id === fromId);
        return {
          from: fromId,
          to: toId,
          colorHex: fromPin.hex,
          glowHex: fromPin.glow
        };
      });
    } else {
      this.cables = [];
    }

    // Contenedor principal centrado
    const board = document.createElement('div');
    board.id = 'lightbox-wires-board';
    board.className = 'lightbox-wires-board';
    if (this.isSolved) board.classList.add('is-solved');

    // 1. Imagen del panel metálico (bsmnt_01_light_box_panel.png)
    const panelImg = document.createElement('img');
    panelImg.src = 'assets/levels/level_01_bsmnt/puzzles/light_box/bsmnt_01_light_box_panel.webp';
    panelImg.className = 'lightbox-panel-img';
    panelImg.alt = 'Panel de conexiones eléctricas';
    board.appendChild(panelImg);

    // 2. Barra indicadora luminosa (detrás del marco o en la ranura)
    const meterContainer = document.createElement('div');
    meterContainer.className = 'lightbox-meter-slot';

    const meterBar = document.createElement('div');
    meterBar.id = 'lightbox-meter-bar';
    meterBar.className = 'lightbox-meter-bar';
    meterContainer.appendChild(meterBar);
    board.appendChild(meterContainer);

    // 3. Capa SVG para renderizar los cables y clavijas
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 747 996');
    svg.setAttribute('class', 'lightbox-wires-svg');
    svg.id = 'lightbox-wires-svg';
    board.appendChild(svg);
    this.svgElement = svg;

    // 4. Hotspots interactivos para cada una de las 8 clavijas
    const pinsLayer = document.createElement('div');
    pinsLayer.className = 'lightbox-pins-layer';

    [...this.PINS.left, ...this.PINS.right].forEach((pin) => {
      const pinBtn = document.createElement('button');
      pinBtn.type = 'button';
      pinBtn.className = 'lightbox-pin-btn';
      pinBtn.dataset.pinId = pin.id;
      pinBtn.setAttribute('aria-label', pin.label);
      pinBtn.style.left = `${(pin.x / 747 * 100).toFixed(3)}%`;
      pinBtn.style.top = `${(pin.y / 996 * 100).toFixed(3)}%`;

      // Soporte pointerdown para inicio inmediato por clic o arrastre
      pinBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.handlePinPointerDown(pin, e);
      });

      // Clic estándar como fallback
      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handlePinClick(pin);
      });

      pinsLayer.appendChild(pinBtn);
    });
    board.appendChild(pinsLayer);

    // 5. Manejo global del cursor y soltado de cable
    this._onPointerMove = (e) => this.handlePointerMove(e);
    this._onPointerUp = (e) => this.handlePointerUp(e);
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (this.activeCable) {
          this.cancelActiveCable();
        } else if (window.SceneManager) {
          window.SceneManager.navigateDirection('back');
        }
      }
    };
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('keydown', this._onKeyDown);

    // Clic en la placa metálica vacía cancela el cable activo
    board.addEventListener('click', (e) => {
      if (e.target.closest('.lightbox-pin-btn')) return;
      if (this.activeCable) {
        this.cancelActiveCable();
      }
    });

    // Clic fuera del tablero en el escenario negro cancela el cable activo
    this._onStageClick = (e) => {
      if (this.activeCable && !e.target.closest('.lightbox-pin-btn') && !e.target.closest('#lightbox-wires-board')) {
        this.cancelActiveCable();
      }
    };

    parentEl.appendChild(board);
    this.container = board;
    this.isMounted = true;

    // Render inicial de cables e indicador
    this.renderCables();
    this.updateIndicator();
  },

  /**
   * Desmonta el tablero al salir de la escena.
   */
  unmount() {
    this.cancelActiveCable();
    this.clearSnapHighlight();
    if (this._onPointerMove) window.removeEventListener('pointermove', this._onPointerMove);
    if (this._onPointerUp) window.removeEventListener('pointerup', this._onPointerUp);
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    if (this._onStageClick && this.parentEl) {
      this.parentEl.removeEventListener('click', this._onStageClick);
    }
    this._onPointerMove = null;
    this._onPointerUp = null;
    this._onKeyDown = null;
    this._onStageClick = null;
    this.parentEl = null;

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.svgElement = null;
    this.isMounted = false;
  },

  /**
   * Manejo de inicio de arrastre o clic inmediato en una clavija.
   */
  handlePinPointerDown(pin, e) {
    if (this.isSolved || this.isVerifying) return;
    if (e.button !== 0) return; // solo botón izquierdo del ratón

    // Si la clavija ya tiene un cable conectado y no hay cable activo en curso:
    // Desenchufe inmediato
    const existingIdx = this.cables.findIndex(c => c.from === pin.id || c.to === pin.id);
    if (existingIdx !== -1 && !this.activeCable) {
      this.cables.splice(existingIdx, 1);
      this.playUnplugSound();
      this.renderCables();
      this.updateIndicator();
      return;
    }

    if (!this.activeCable) {
      this.startActiveCable(pin);
    }
  },

  /**
   * Manejo global al soltar el botón del ratón o levantar el dedo en táctil.
   */
  handlePointerUp(e) {
    if (this.isSolved || this.isVerifying) return;
    if (!this.activeCable) return;

    const dragDistance = Math.hypot(
      this.activeCable.currentX - this.activeCable.fromPin.x,
      this.activeCable.currentY - this.activeCable.fromPin.y
    );

    // 1. Si había un snap magnético activo durante el arrastre:
    let targetPin = this.activeCable.snappedPin;

    // 2. Si no había snap previo, calcularlo de nuevo con la posición final
    if (!targetPin && this.container) {
      const rect = this.container.getBoundingClientRect();
      const scaleX = 747 / rect.width;
      const scaleY = 996 / rect.height;
      const localX = (e.clientX - rect.left) * scaleX;
      const localY = (e.clientY - rect.top) * scaleY;
      targetPin = this.getSnapTarget(localX, localY);

      if (!targetPin) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const pinBtn = el?.closest('.lightbox-pin-btn');
        if (pinBtn) {
          const pinId = pinBtn.dataset.pinId;
          const found = [...this.PINS.left, ...this.PINS.right].find(p => p.id === pinId);
          if (found && found.id !== this.activeCable.fromPin.id) {
            targetPin = found;
          }
        }
      }
    }

    this.clearSnapHighlight();

    if (targetPin && targetPin.id !== this.activeCable.fromPin.id) {
      // Conectar cable a la clavija destino
      this.handlePinClick(targetPin);
    } else {
      // Si el jugador arrastró una distancia apreciable (> 35 unidades) y soltó fuera:
      // Cancelar el cable para evitar que la punta quede colgando flotando en el vacío
      if (dragDistance > 35) {
        this.cancelActiveCable();
      }
    }
  },

  /**
   * Procesa el clic en una clavija (soporta tanto izquierda->derecha como derecha->izquierda).
   */
  handlePinClick(pin) {
    if (this.isSolved || this.isVerifying) return;

    const isLeft = pin.id.startsWith('left_');
    const isRight = pin.id.startsWith('right_');

    // 1. Si no hay cable activo:
    if (!this.activeCable) {
      // Si la clavija ya tiene un cable conectado, desconectarlo
      const existingIdx = this.cables.findIndex(c => c.from === pin.id || c.to === pin.id);
      if (existingIdx !== -1) {
        this.cables.splice(existingIdx, 1);
        this.playUnplugSound();
        this.renderCables();
        this.updateIndicator();
        return;
      }

      // Iniciar cable desde este pin (sea izquierdo o derecho)
      this.startActiveCable(pin);
      return;
    }

    // 2. Si YA hay un cable activo en arrastre:
    // Si hace clic en la misma clavija de origen, cancelar
    if (this.activeCable.fromPin.id === pin.id) {
      this.cancelActiveCable();
      return;
    }

    const fromIsLeft = this.activeCable.fromPin.id.startsWith('left_');
    const targetIsSameSide = (fromIsLeft && isLeft) || (!fromIsLeft && isRight);

    // Si hace clic en otra clavija del MISMO lado:
    if (targetIsSameSide) {
      // Si la clavija clicada ya tenía cable, desconectarla
      const existingIdx = this.cables.findIndex(c => c.from === pin.id || c.to === pin.id);
      if (existingIdx !== -1) {
        this.cables.splice(existingIdx, 1);
        this.playUnplugSound();
        this.updateIndicator();
      }
      // Cambiar origen a este nuevo pin
      this.startActiveCable(pin);
      return;
    }

    // Si hace clic en una clavija del LADO OPUESTO (lado destino):
    // Comprobar si esa clavija destino ya está ocupada
    const isTargetOccupied = this.cables.some(c => c.from === pin.id || c.to === pin.id);
    if (isTargetOccupied) {
      this.playErrorBuzz(0.08);
      return;
    }

    // Conectar el cable (normalizado: leftPin como 'from', rightPin como 'to')
    const leftPin = fromIsLeft ? this.activeCable.fromPin : pin;
    const rightPin = fromIsLeft ? pin : this.activeCable.fromPin;
    this.connectCable(leftPin, rightPin);
  },

  /**
   * Encuentra la clavija candidata más cercana para acoplamiento magnético (snap).
   * Solo considera clavijas del lado opuesto que no estén ya ocupadas por otro cable.
   */
  getSnapTarget(x, y) {
    if (!this.activeCable) return null;
    const fromPin = this.activeCable.fromPin;
    const fromIsLeft = fromPin.id.startsWith('left_');
    const targetPins = fromIsLeft ? this.PINS.right : this.PINS.left;

    let closestPin = null;
    let minDistance = Infinity;
    // 85 unidades SVG (en escala 747x996, representa aprox. 50-60px de radio en pantalla)
    const SNAP_RADIUS = 85;

    for (const pin of targetPins) {
      // Clavijas ya ocupadas por otro cable no son válidas
      const isOccupied = this.cables.some(c => c.from === pin.id || c.to === pin.id);
      if (isOccupied) continue;

      const dist = Math.hypot(pin.x - x, pin.y - y);
      if (dist < minDistance && dist <= SNAP_RADIUS) {
        minDistance = dist;
        closestPin = pin;
      }
    }

    return closestPin;
  },

  /**
   * Resalta visualmente la clavija que tiene el foco de snap magnético.
   */
  highlightSnapPin(pin) {
    if (!this.container || !pin) return;
    const fromHex = this.activeCable?.fromPin?.hex || '#ffffff';
    this.container.querySelectorAll('.lightbox-pin-btn').forEach((btn) => {
      if (btn.dataset.pinId === pin.id) {
        btn.classList.add('is-snap-target');
        btn.style.setProperty('--snap-color', fromHex);
      } else {
        btn.classList.remove('is-snap-target');
        btn.style.removeProperty('--snap-color');
      }
    });
  },

  /**
   * Limpia los efectos visuales de snap en todas las clavijas.
   */
  clearSnapHighlight() {
    if (!this.container) return;
    this.container.querySelectorAll('.lightbox-pin-btn.is-snap-target').forEach((btn) => {
      btn.classList.remove('is-snap-target');
      btn.style.removeProperty('--snap-color');
    });
  },

  /**
   * Inicia el arrastre de un nuevo cable desde una clavija (izquierda o derecha).
   */
  startActiveCable(pin) {
    this.playPlugInSound();
    this.activeCable = {
      fromPin: pin,
      currentX: pin.x,
      currentY: pin.y,
      snappedPin: null
    };
    if (this.container) {
      this.container.classList.add('is-dragging-cable');
    }
    this.renderCables();
  },

  /**
   * Conecta un cable entre la clavija izquierda y la clavija derecha.
   */
  connectCable(leftPin, rightPin) {
    this.cables.push({
      from: leftPin.id,
      to: rightPin.id,
      colorHex: leftPin.hex,
      glowHex: leftPin.glow
    });

    this.activeCable = null;
    this.clearSnapHighlight();
    if (this.container) {
      this.container.classList.remove('is-dragging-cable');
    }

    this.playElectricSound();
    this.renderCables();
    this.updateIndicator();

    // Reproducir tono de subida de carga
    this.playChargeTone(this.cables.length);

    // Si se han colocado los 4 cables, comprobar la solución
    if (this.cables.length === 4) {
      this.verifyPuzzle();
    }
  },

  /**
   * Cancela el cable en arrastre.
   */
  cancelActiveCable() {
    if (!this.activeCable) return;
    this.activeCable = null;
    this.clearSnapHighlight();
    if (this.container) {
      this.container.classList.remove('is-dragging-cable');
    }
    this.playUnplugSound();
    this.renderCables();
  },

  /**
   * Sigue la posición del cursor para deformar la curva del cable activo en tiempo real
   * con acoplamiento magnético automático cuando se aproxima a la clavija destino.
   */
  handlePointerMove(e) {
    if (!this.activeCable || !this.container) return;

    const rect = this.container.getBoundingClientRect();
    const scaleX = 747 / rect.width;
    const scaleY = 996 / rect.height;

    const localX = (e.clientX - rect.left) * scaleX;
    const localY = (e.clientY - rect.top) * scaleY;

    // Buscar si estamos dentro del radio de snap magnético de alguna clavija válida
    const snapPin = this.getSnapTarget(localX, localY);
    if (snapPin) {
      this.activeCable.currentX = snapPin.x;
      this.activeCable.currentY = snapPin.y;
      this.activeCable.snappedPin = snapPin;
      this.highlightSnapPin(snapPin);
    } else {
      this.activeCable.currentX = Math.max(0, Math.min(747, localX));
      this.activeCable.currentY = Math.max(0, Math.min(996, localY));
      this.activeCable.snappedPin = null;
      this.clearSnapHighlight();
    }

    this.renderCables();
  },

  /**
   * Calcula el path Bézier con caída por gravedad (catenaria aproximada).
   */
  calculateCatenaryPath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Curvatura de caída por gravedad: más distancia horizontal = más caída
    const sag = Math.max(40, Math.abs(dx) * 0.36 + Math.max(0, 120 - Math.abs(dy) * 0.2));

    const cp1x = x1 + dx * 0.30;
    const cp1y = y1 + sag;
    const cp2x = x2 - dx * 0.30;
    const cp2y = y2 + sag;

    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  },

  /**
   * Renderiza todos los cables y conectores en la capa SVG.
   */
  renderCables() {
    if (!this.svgElement) return;

    let svgHtml = '';

    // 1. Renderizar cables fijos conectados
    this.cables.forEach((c) => {
      const fromPin = this.PINS.left.find(p => p.id === c.from);
      const toPin = this.PINS.right.find(p => p.id === c.to);
      if (!fromPin || !toPin) return;

      const pathData = this.calculateCatenaryPath(fromPin.x, fromPin.y, toPin.x, toPin.y);

      // Sombra proyectada
      svgHtml += `<path d="${pathData}" class="wire-shadow" />`;
      // Cable de goma principal
      svgHtml += `<path d="${pathData}" class="wire-body" stroke="${c.colorHex}" />`;
      // Brillo especular superior
      svgHtml += `<path d="${pathData}" class="wire-highlight" />`;

      // Clavijas metálicas en ambos extremos
      svgHtml += this.renderJackPlug(fromPin.x, fromPin.y, c.colorHex);
      svgHtml += this.renderJackPlug(toPin.x, toPin.y, c.colorHex);
    });

    // 2. Renderizar cable activo en movimiento siguiendo el cursor
    if (this.activeCable) {
      const fromPin = this.activeCable.fromPin;
      const x2 = this.activeCable.currentX;
      const y2 = this.activeCable.currentY;
      const pathData = this.calculateCatenaryPath(fromPin.x, fromPin.y, x2, y2);

      // Sombra proyectada
      svgHtml += `<path d="${pathData}" class="wire-shadow" />`;
      // Cable principal
      svgHtml += `<path d="${pathData}" class="wire-body is-dragging" stroke="${fromPin.hex}" />`;
      // Brillo especular
      svgHtml += `<path d="${pathData}" class="wire-highlight" />`;

      // Clavija en origen
      svgHtml += this.renderJackPlug(fromPin.x, fromPin.y, fromPin.hex);

      // Punta en destino: si está acoplada por snap magnético, mostrar jack insertado y aura de conexión
      if (this.activeCable.snappedPin) {
        svgHtml += this.renderJackPlug(x2, y2, fromPin.hex);
        svgHtml += `
          <g class="wire-snap-indicator">
            <circle cx="${x2}" cy="${y2}" r="22" fill="none" stroke="${fromPin.glow}" stroke-width="2.5" stroke-dasharray="5 3" opacity="0.95" />
            <circle cx="${x2}" cy="${y2}" r="28" fill="${fromPin.glow}" opacity="0.18" />
          </g>
        `;
      } else {
        // Punta metálica flotante siguiendo el cursor
        svgHtml += this.renderFloatingPlug(x2, y2, fromPin.hex);
      }
    }

    this.svgElement.innerHTML = svgHtml;
  },

  /**
   * Genera el marcado SVG de una clavija tipo jack insertada en el socket.
   */
  renderJackPlug(x, y, colorHex) {
    return `
      <g class="wire-jack-plug">
        <circle cx="${x}" cy="${y + 3}" r="16" fill="rgba(0,0,0,0.5)" />
        <circle cx="${x}" cy="${y}" r="14" fill="#2b2826" stroke="#5a524c" stroke-width="2" />
        <circle cx="${x}" cy="${y}" r="10" fill="#141312" />
        <circle cx="${x}" cy="${y}" r="6" fill="${colorHex}" />
        <circle cx="${x - 2}" cy="${y - 2}" r="2" fill="rgba(255,255,255,0.7)" />
      </g>
    `;
  },

  /**
   * Genera la clavija flotante que sigue al cursor.
   */
  renderFloatingPlug(x, y, colorHex) {
    return `
      <g class="wire-floating-plug">
        <circle cx="${x}" cy="${y + 4}" r="14" fill="rgba(0,0,0,0.4)" />
        <rect x="${x - 6}" y="${y - 14}" width="12" height="28" rx="4" fill="#2c2a29" stroke="#6b645d" stroke-width="2" />
        <rect x="${x - 3}" y="${y + 8}" width="6" height="12" rx="2" fill="#d4af37" />
        <circle cx="${x}" cy="${y - 5}" r="4" fill="${colorHex}" />
      </g>
    `;
  },

  /**
   * Actualiza la barra indicadora luminosa según el porcentaje (0%, 25%, 50%, 75%, 100%).
   */
  updateIndicator(customState = null) {
    const bar = document.getElementById('lightbox-meter-bar');
    if (!bar) return;

    if (customState === 'error') {
      bar.style.height = '100%';
      bar.className = 'lightbox-meter-bar state-error';
      return;
    }

    if (customState === 'success') {
      bar.style.height = '100%';
      bar.className = 'lightbox-meter-bar state-success';
      return;
    }

    // Estado normal por cantidad de cables conectados (25% cada uno)
    const pct = Math.min(100, this.cables.length * 25);
    bar.style.height = `${pct}%`;
    bar.className = 'lightbox-meter-bar state-charging';
  },

  /**
   * Verifica si los 4 cables cumplen con la combinación objetivo.
   */
  verifyPuzzle() {
    this.isVerifying = true;

    // Comprobar cada conexión
    const isCorrect = this.cables.every((c) => this.SOLUTION[c.from] === c.to);

    if (isCorrect) {
      this.onSuccess();
    } else {
      this.onError();
    }
  },

  /**
   * Comportamiento al fallar la combinación:
   * El indicador se pone rojo, parpadea un par de veces, baja al 0% y los cables desaparecen.
   */
  onError() {
    this.updateIndicator('error');
    this.playErrorBuzz();

    const bar = document.getElementById('lightbox-meter-bar');
    if (bar) bar.classList.add('is-flashing-error');

    setTimeout(() => {
      // Parpadeo final y reseteo
      this.cables = [];
      this.renderCables();
      this.updateIndicator();
      if (bar) bar.classList.remove('is-flashing-error');
      this.isVerifying = false;

      if (window.SceneManager) {
        window.SceneManager.showMessage('El puente eléctrico ha fallado. La polaridad no es la correcta.');
      }
    }, 1500);
  },

  /**
   * Comportamiento al acertar la combinación:
   * El indicador se pone verde brillante y los cerrojos del cuadro se desbloquean.
   */
  onSuccess() {
    this.isSolved = true;
    this.updateIndicator('success');
    this.playSuccessUnlockSound();

    if (this.container) {
      this.container.classList.add('is-solved');
    }

    const save = Storage.getSaveGame() || Storage.createNewGame();
    if (!save.puzzleFlags) save.puzzleFlags = {};
    save.puzzleFlags.light_box_wires_solved = true;
    save.puzzleFlags.light_box_open = true;
    Storage.setSaveGame(save);

    if (window.SceneManager) {
      window.SceneManager.showMessage('¡Circuito cerrado con éxito! Los cerrojos electromagnéticos del cuadro de luces se han liberado.', 4500);
    }
  },

  /**
   * Resuelve automáticamente el puzzle conectando los cables en orden correcto.
   */
  solve() {
    this.cables = Object.entries(this.SOLUTION).map(([fromId, toId]) => {
      const fromPin = this.PINS.left.find(p => p.id === fromId);
      return {
        from: fromId,
        to: toId,
        colorHex: fromPin.hex,
        glowHex: fromPin.glow
      };
    });
    this.onSuccess();
    if (this.isMounted && this.container) {
      this.renderCables();
      this.updateIndicator('success');
    }
  },

  /**
   * Resetea el puzle para pruebas.
   */
  reset() {
    this.isSolved = false;
    this.isVerifying = false;
    this.cables = [];
    this.activeCable = null;

    const save = Storage.getSaveGame();
    if (save && save.puzzleFlags) {
      delete save.puzzleFlags.light_box_wires_solved;
      delete save.puzzleFlags.light_box_open;
      delete save.puzzleFlags.wires_placed_on_panel;
      Storage.setSaveGame(save);
    }

    if (this.isMounted && this.container) {
      this.container.classList.remove('is-solved');
      this.renderCables();
      this.updateIndicator();
    }
  },

  // =========================================================================
  // EFECTOS SONOROS (Web Audio API)
  // =========================================================================

  _getAudioCtx() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this._audioCtx) this._audioCtx = new AudioCtx();
    if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
    return this._audioCtx;
  },

  /**
   * Efecto de sonido eléctrico al conectar un cable (assets/audio/sfx/electric.mp3).
   */
  playElectricSound() {
    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/electric.mp3');
        return;
      }
    } catch (e) {}

    this.playPlugInSound();
  },

  playPlugInSound() {
    try {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.05);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  },

  playUnplugSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playClick) {
        AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playClick) {
        window.AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/click.mp3');
        return;
      }
    } catch (e) {}

    try {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  },

  playChargeTone(step) {
    try {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const baseFreq = 220 + step * 110;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) {}
  },

  playErrorBuzz(duration = 0.35) {
    try {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  },

  /**
   * Sonido de éxito al resolver el cableado del cuadro eléctrico (assets/audio/sfx/success.mp3).
   */
  playSuccessUnlockSound() {
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
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. Tono armónico ascendente
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, t);
      osc1.frequency.exponentialRampToValueAtTime(880, t + 0.25);
      gain1.gain.setValueAtTime(0.2, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.35);

      // 2. Golpe de relé pesado
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(140, t + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(45, t + 0.45);
      gain2.gain.setValueAtTime(0.35, t + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.18);
      osc2.stop(t + 0.5);
    } catch (e) {}
  }
};
