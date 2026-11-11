/**
 * Blackwood Keep — Gestor de Inventario Permanente (InventoryManager)
 * Administra las ranuras fijas de la barra lateral, renderizado de objetos,
 * selección de objetos para uso en escenas y sincronización con Storage.
 */

import { Storage } from './storage.js';
import { AudioController } from './audio.js';

const TOTAL_SLOTS = 6;

export const InventoryManager = {
  container: null,
  selectedItemId: null,
  modalCloseup: null,
  closeupImg: null,
  closeupTitle: null,
  btnCloseCloseup: null,
  currentPendingItem: null,
  _audioCtx: null,

  init() {
    this.container = document.getElementById('inventory-slots');
    this.modalCloseup = document.getElementById('modal-item-closeup');
    this.closeupImg = document.getElementById('item-closeup-img');
    this.closeupTitle = document.getElementById('item-closeup-title');
    this.btnCloseCloseup = document.getElementById('btn-close-item-closeup');

    if (this.modalCloseup) {
      this.modalCloseup.style.display = 'none';
    }

    if (this.btnCloseCloseup) {
      this.btnCloseCloseup.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePickupCloseup();
      });
    }

    if (this.modalCloseup) {
      this.modalCloseup.addEventListener('click', (e) => {
        if (e.target.closest('.item-closeup-content') || e.target.closest('.item-closeup-plates-grid')) {
          return;
        }
        if (e.target === this.modalCloseup || e.target.classList.contains('item-closeup-container')) {
          this.closePickupCloseup();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Enter') && this.isCloseupOpen()) {
        this.closePickupCloseup();
      }
    });

    this.render();
    this.bindEvents();
  },

  /**
   * Obtiene la lista actual de objetos desde la partida guardada.
   */
  getItems() {
    const saveState = Storage.getSaveGame();
    return (saveState && Array.isArray(saveState.inventory)) ? saveState.inventory : [];
  },

  /**
   * Obtiene un objeto del inventario por su ID.
   */
  getItemById(itemId) {
    const items = this.getItems();
    return items.find(i => i.id === itemId) || null;
  },

  /**
   * Renderiza las ranuras del inventario.
   */
  render() {
    if (!this.container) return;

    const items = this.getItems();
    this.container.innerHTML = '';

    // Renderizar al menos TOTAL_SLOTS (6) y al menos una ranura vacía extra si hay muchos objetos
    const totalSlots = Math.max(TOTAL_SLOTS, items.length + 1);

    for (let i = 0; i < totalSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.slotIndex = i;
      slot.tabIndex = 0;

      const item = items[i];
      if (item) {
        slot.classList.add('has-item');
        slot.dataset.itemId = item.id;
        slot.setAttribute('aria-label', item.name || item.id);

        if (this.selectedItemId === item.id) {
          slot.classList.add('active-selected');
        }

        const img = document.createElement('img');
        img.className = 'inventory-item-icon';
        img.src = item.icon || item.icono || '';
        img.alt = item.name || item.id;
        slot.appendChild(img);
      } else {
        slot.classList.add('empty');
        slot.setAttribute('aria-label', `Ranura vacía ${i + 1}`);
      }

      this.container.appendChild(slot);
    }
  },

  bindEvents() {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      // Si venimos de completar un arrastre (drag), ignorar el clic sintético
      if (this._suppressNextClick) {
        this._suppressNextClick = false;
        return;
      }

      const slot = e.target.closest('.inventory-slot');
      if (!slot) return;

      const itemId = slot.dataset.itemId;
      if (!itemId) {
        // Clic en ranura vacía deselecciona cualquier objeto activo
        this.selectItem(null);
        return;
      }

      // Alternar selección o abrir close-up al hacer clic en el ítem ya seleccionado
      if (this.selectedItemId === itemId) {
        const item = this.getItemById(itemId);
        if (item && (item.interactiveCloseup || item.id === 'plates' || item.id === 'bsmnt_plates' || item.closeup)) {
          this.showItemCloseup(item);
          return;
        }
        this.selectItem(null);
      } else {
        this.selectItem(itemId);
      }
    });

    // Doble clic para inspeccionar cualquier objeto con primer plano
    this.container.addEventListener('dblclick', (e) => {
      const slot = e.target.closest('.inventory-slot.has-item');
      if (!slot) return;
      const itemId = slot.dataset.itemId;
      const item = this.getItemById(itemId);
      if (item && (item.interactiveCloseup || item.id === 'plates' || item.id === 'bsmnt_plates' || item.closeup)) {
        this.showItemCloseup(item);
      }
    });

    // Clic derecho para inspeccionar objeto
    this.container.addEventListener('contextmenu', (e) => {
      const slot = e.target.closest('.inventory-slot.has-item');
      if (!slot) return;
      e.preventDefault();
      const itemId = slot.dataset.itemId;
      const item = this.getItemById(itemId);
      if (item && (item.interactiveCloseup || item.id === 'plates' || item.id === 'bsmnt_plates' || item.closeup)) {
        this.showItemCloseup(item);
      }
    });

    // Accesibilidad por teclado (Enter o Espacio para seleccionar)
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const slot = e.target.closest('.inventory-slot');
        if (slot) {
          e.preventDefault();
          slot.click();
        }
      }
    });

    // Inicializar sistema de arrastre y soltado sobre el escenario
    this.bindDragAndDropEvents();

    // Escuchar eventos de ciclo de vida de la partida
    window.addEventListener('startNewGame', () => {
      this.reset();
    });

    window.addEventListener('loadSavedGame', () => {
      this.selectItem(null);
      this.render();
    });

    // Escuchar evento personalizado de actualización de inventario
    window.addEventListener('inventoryUpdated', () => {
      this.render();
    });
  },

  /**
   * Configura los eventos Pointer para permitir:
   * 1. Desplazamiento táctil vertical fluido (scroll del inventario con el dedo)
   * 2. Arrastre horizontal de objetos hacia el escenario (drag & drop)
   */
  bindDragAndDropEvents() {
    if (!this.container) return;

    let dragData = null;
    let dragAvatar = null;

    const onPointerDown = (e) => {
      // Ignorar clics con botón secundario o terciario en ratón
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const slot = e.target.closest('.inventory-slot.has-item');
      const itemId = slot ? slot.dataset.itemId : null;
      const item = itemId ? this.getItemById(itemId) : null;
      const iconSrc = item?.icon || slot?.querySelector('img')?.src;

      dragData = {
        slot: slot || null,
        itemId: itemId || null,
        iconSrc: iconSrc || null,
        startX: e.clientX,
        startY: e.clientY,
        startScrollTop: this.container.scrollTop,
        mode: null, // null | 'scroll' | 'drag'
        isDragging: false,
        pointerId: e.pointerId
      };

      try {
        this.container.setPointerCapture(e.pointerId);
      } catch (err) {}
    };

    const onPointerMove = (e) => {
      if (!dragData || dragData.pointerId !== e.pointerId) return;

      const dx = e.clientX - dragData.startX;
      const dy = e.clientY - dragData.startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Decidir modo de interacción si aún no se ha definido
      if (!dragData.mode) {
        // Si hay movimiento vertical predominante o no hay ítem bajo el dedo -> scroll
        if (absDy > 6 && absDy >= absDx) {
          dragData.mode = 'scroll';
        } else if (dragData.itemId && (dx > 12 || (absDx > 14 && absDx > absDy))) {
          // Si hay ítem y se arrastra hacia la derecha (hacia la escena) -> drag & drop
          dragData.mode = 'drag';
        } else if (!dragData.itemId && (absDy > 5 || absDx > 5)) {
          dragData.mode = 'scroll';
        }
      }

      // Modo 1: Desplazamiento vertical del inventario (scroll táctil)
      if (dragData.mode === 'scroll') {
        this.container.scrollTop = dragData.startScrollTop - dy;
        return;
      }

      // Modo 2: Arrastre de objeto hacia el escenario
      if (dragData.mode === 'drag') {
        if (!dragData.isDragging) {
          dragData.isDragging = true;
          this._suppressNextClick = true;
          if (window.SceneManager) {
            window.SceneManager.suppressHotspotClick(350);
          }

          dragAvatar = document.createElement('div');
          dragAvatar.id = 'inventory-drag-avatar';
          dragAvatar.className = 'inventory-drag-avatar';
          if (dragData.iconSrc) {
            const img = document.createElement('img');
            img.src = dragData.iconSrc;
            img.alt = '';
            dragAvatar.appendChild(img);
          }
          document.body.appendChild(dragAvatar);
          document.body.classList.add('is-dragging-inventory-item');
          if (dragData.slot) {
            dragData.slot.classList.add('is-being-dragged');
          }
        }

        if (dragAvatar) {
          dragAvatar.style.left = `${e.clientX}px`;
          dragAvatar.style.top = `${e.clientY}px`;

          const isValid = window.SceneManager?.isItemOverValidTarget?.(dragData.itemId, e.clientX, e.clientY);
          dragAvatar.classList.toggle('is-valid-target', Boolean(isValid));
        }
      }
    };

    const cleanupDrag = () => {
      document.body.classList.remove('is-dragging-inventory-item');
      if (dragAvatar && dragAvatar.parentNode) {
        dragAvatar.parentNode.removeChild(dragAvatar);
      }
      dragAvatar = null;

      if (dragData?.slot) {
        dragData.slot.classList.remove('is-being-dragged');
      }

      try {
        if (this.container.hasPointerCapture(dragData.pointerId)) {
          this.container.releasePointerCapture(dragData.pointerId);
        }
      } catch (err) {}
    };

    const onPointerUp = (e) => {
      if (!dragData || dragData.pointerId !== e.pointerId) return;

      const wasDragging = dragData.isDragging;
      const wasScrolling = dragData.mode === 'scroll';
      const itemId = dragData.itemId;

      if (wasDragging && window.SceneManager) {
        window.SceneManager.suppressHotspotClick(350);
      }

      cleanupDrag();
      dragData = null;

      if (wasDragging) {
        // Reproducir sonido al soltar el objeto del inventario
        this.playDropSound();

        // Inhibir el evento click sintético que el navegador dispara tras pointerup
        this._suppressNextClick = true;
        setTimeout(() => {
          this._suppressNextClick = false;
        }, 350);

        // Notificar suelta del objeto en las coordenadas (e.clientX, e.clientY)
        if (window.SceneManager) {
          window.SceneManager.handleItemDropAt(itemId, e.clientX, e.clientY);
        }
      } else if (wasScrolling) {
        // Si estuvo desplazando el inventario, suprimir clic para no seleccionar por error
        this._suppressNextClick = true;
        setTimeout(() => {
          this._suppressNextClick = false;
        }, 250);
      }
    };

    const onPointerCancel = (e) => {
      if (!dragData || dragData.pointerId !== e.pointerId) return;
      cleanupDrag();
      dragData = null;
    };

    this.container.addEventListener('pointerdown', onPointerDown);
    this.container.addEventListener('pointermove', onPointerMove);
    this.container.addEventListener('pointerup', onPointerUp);
    this.container.addEventListener('pointercancel', onPointerCancel);
  },

  /**
   * Reinicia completamente el inventario (para nueva partida).
   */
  reset() {
    this.selectItem(null);
    this.currentPendingItem = null;
    this._suppressNextClick = false;
    document.body.classList.remove('is-dragging-inventory-item');

    const existingAvatar = document.getElementById('inventory-drag-avatar');
    if (existingAvatar && existingAvatar.parentNode) {
      existingAvatar.parentNode.removeChild(existingAvatar);
    }

    if (this.modalCloseup) {
      this.modalCloseup.classList.remove('active', 'opening', 'closing');
      this.modalCloseup.setAttribute('aria-hidden', 'true');
      this.modalCloseup.style.display = 'none';
      if (this.closeupImg) {
        this.closeupImg.src = '';
        this.closeupImg.alt = '';
      }
      if (this.closeupTitle) {
        this.closeupTitle.textContent = '';
      }
    }
    this.render();
  },

  /**
   * Selecciona o deselecciona un objeto del inventario.
   */
  selectItem(itemId) {
    this.selectedItemId = itemId;

    const slots = this.container ? this.container.querySelectorAll('.inventory-slot') : [];
    slots.forEach((slot) => {
      if (itemId && slot.dataset.itemId === itemId) {
        slot.classList.add('active-selected');
      } else {
        slot.classList.remove('active-selected');
      }
    });

    window.dispatchEvent(new CustomEvent('itemSelected', {
      detail: { itemId: this.selectedItemId }
    }));
  },

  /**
   * Añade un nuevo objeto al inventario y persiste el estado.
   */
  addItem(item) {
    const saveState = Storage.getSaveGame();
    if (!saveState) return false;

    if (!Array.isArray(saveState.inventory)) {
      saveState.inventory = [];
    }

    // Evitar duplicados si ya existe
    const exists = saveState.inventory.some(i => i.id === item.id);
    if (!exists) {
      saveState.inventory.push(item);
      saveState.updatedAt = new Date().toISOString();
      Storage.setSaveGame(saveState);
      this.render();

      // Desplazar automáticamente hacia el último ítem añadido
      setTimeout(() => {
        if (this.container) {
          const newSlot = this.container.querySelector(`.inventory-slot[data-item-id="${item.id}"]`);
          if (newSlot) {
            newSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 60);

      window.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: { item } }));
      return true;
    }

    return false;
  },

  /**
   * Elimina un objeto del inventario (al usarlo).
   * La imagen desaparece en su slot y los objetos inferiores se desplazan automáticamente un slot arriba.
   */
  removeItem(itemId, animate = true) {
    const saveState = Storage.getSaveGame();
    if (!saveState || !Array.isArray(saveState.inventory)) return false;

    const index = saveState.inventory.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    if (this.selectedItemId === itemId) {
      this.selectItem(null);
    }

    const slotEl = this.container?.querySelector(`.inventory-slot[data-item-id="${itemId}"]`);
    if (animate && slotEl) {
      const img = slotEl.querySelector('.inventory-item-icon');
      if (img) {
        img.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.22s ease';
        img.style.transform = 'scale(0.2)';
        img.style.opacity = '0';
      }
      setTimeout(() => {
        const freshState = Storage.getSaveGame();
        if (freshState && Array.isArray(freshState.inventory)) {
          const freshIdx = freshState.inventory.findIndex(i => i.id === itemId);
          if (freshIdx !== -1) {
            freshState.inventory.splice(freshIdx, 1);
            freshState.updatedAt = new Date().toISOString();
            Storage.setSaveGame(freshState);
          }
        }
        this.render();
        window.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: { itemId } }));
      }, 220);
      return true;
    }

    saveState.inventory.splice(index, 1);
    saveState.updatedAt = new Date().toISOString();
    Storage.setSaveGame(saveState);
    this.render();
    window.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: { itemId } }));
    return true;
  },

  /**
   * Indica si la vista en primer plano (close-up) está activa.
   */
  isCloseupOpen() {
    return this.modalCloseup && this.modalCloseup.classList.contains('active');
  },

  /**
   * Configuración de los 4 slots cuadrangulares fijos del puzzle.
   * 1: arriba izq, 2: arriba drch, 3: abajo drch, 4: abajo izq.
   * Sentido horario de slots superiores: 1 -> 2 -> 3 -> 4 -> 1.
   */
  SLOTS_CONFIG: {
    1: { id: 1, col: 1, row: 1, label: 'Slot 1 (arriba izq)', nextSlot: 2 },
    2: { id: 2, col: 2, row: 1, label: 'Slot 2 (arriba drch)', nextSlot: 3 },
    3: { id: 3, col: 2, row: 2, label: 'Slot 3 (abajo drch)', nextSlot: 4 },
    4: { id: 4, col: 1, row: 2, label: 'Slot 4 (abajo izq)', nextSlot: 1 }
  },

  /**
   * Recursos gráficos de cada una de las 4 placas.
   */
  PLATES_CONFIG: {
    1: { id: 1, src: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_plate_1.webp', label: 'Placa 1' },
    2: { id: 2, src: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_plate_2.webp', label: 'Placa 2' },
    3: { id: 3, src: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_plate_3.webp', label: 'Placa 3' },
    4: { id: 4, src: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_plate_4.webp', label: 'Placa 4' }
  },

  /**
   * Posición y orientación objetivo (solución) de las placas para el puzle final.
   * Resultado exacto de aplicar la secuencia de clics en los slots: [3, 1, 2, 1, 4]
   */
  PLATES_TARGET_SOLUTION: {
    sequence: [3, 1, 2, 1, 4],
    slots: {
      1: { plateId: 3, rotation: 180 },
      2: { plateId: 2, rotation: 90 },
      3: { plateId: 1, rotation: 180 },
      4: { plateId: 4, rotation: 0 }
    },
    plates: {
      1: { slot: 3, rotation: 180 },
      2: { slot: 2, rotation: 90 },
      3: { slot: 1, rotation: 180 },
      4: { slot: 4, rotation: 0 }
    }
  },

  /**
   * Comprueba si el estado actual de las placas coincide con la solución objetivo.
   * @returns {boolean}
   */
  isPlatesPuzzleSolved() {
    const state = this.getPlatesState();
    if (!state) return false;
    return Object.keys(this.PLATES_TARGET_SOLUTION.plates).every(plateId => {
      const target = this.PLATES_TARGET_SOLUTION.plates[plateId];
      const current = state[plateId];
      return current && Number(current.slot) === target.slot && Number(current.rotation) === target.rotation;
    });
  },

  /**
   * Obtiene el estado actual de ubicación (slot 1..4) y rotación (0, 90, 180, 270) de cada placa.
   */
  getPlatesState() {
    const s = Storage.getSaveGame();
    let state = s?.puzzleFlags?.plates_state;
    if (!state) {
      const rot = s?.puzzleFlags?.plates_rotations || {};
      const slots = s?.puzzleFlags?.plates_slots || {};
      state = {
        1: { slot: Number(slots[1]) || 1, rotation: Number(rot[1]) || 0 },
        2: { slot: Number(slots[2]) || 2, rotation: Number(rot[2]) || 0 },
        3: { slot: Number(slots[3]) || 3, rotation: Number(rot[3]) || 0 },
        4: { slot: Number(slots[4]) || 4, rotation: Number(rot[4]) || 0 }
      };
    }
    return state;
  },

  /**
   * Persiste el estado de las placas, asegurando slots (1..4) y rotaciones normalizadas (0, 90, 180, 270).
   */
  savePlatesState(state) {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.plates_state = state;
    s.puzzleFlags.plates_slots = {
      1: state[1].slot,
      2: state[2].slot,
      3: state[3].slot,
      4: state[4].slot
    };
    s.puzzleFlags.plates_rotations = {
      1: state[1].rotation,
      2: state[2].rotation,
      3: state[3].rotation,
      4: state[4].rotation
    };
    s.puzzleFlags.slots_plates = {
      [state[1].slot]: 1,
      [state[2].slot]: 2,
      [state[3].slot]: 3,
      [state[4].slot]: 4
    };
    Storage.setSaveGame(s);
  },

  /**
   * Renderiza el contenido interno del close-up (imagen estática o cuadrícula interactiva de 4 placas).
   */
  renderCloseupContent(item) {
    if (!this.closeupImg) return;
    const wrapper = this.closeupImg.parentElement;

    // Limpiar cuadrícula previa y elementos dinámicos si existían
    if (wrapper) {
      const content = wrapper.parentElement;
      if (content) {
        const existingHint = content.querySelector('.item-closeup-hint');
        if (existingHint) existingHint.remove();
        const existingResetBtn = content.querySelector('.item-closeup-reset-btn');
        if (existingResetBtn) existingResetBtn.remove();
      }
      const existingGrid = wrapper.querySelector('.item-closeup-plates-grid');
      if (existingGrid && existingGrid.parentNode) {
        existingGrid.parentNode.removeChild(existingGrid);
      }
      const existingHintInside = wrapper.querySelector('.item-closeup-hint');
      if (existingHintInside && existingHintInside.parentNode) {
        existingHintInside.parentNode.removeChild(existingHintInside);
      }
    }

    if (this.closeupTitle) {
      this.closeupTitle.style.display = '';
      this.closeupTitle.textContent = item.name || '';
    }

    const isPlates = item.id === 'plates' || item.id === 'bsmnt_plates' || item.interactiveCloseup === 'plates_grid';

    if (isPlates && wrapper) {
      this.closeupImg.style.display = 'none';

      // Ocultar el título de texto para sustituirlo por el botón de restablecer
      if (this.closeupTitle) {
        this.closeupTitle.style.display = 'none';
      }

      // 1. Texto de ayuda ARRIBA de la cuadrícula
      const hint = document.createElement('div');
      hint.className = 'item-closeup-hint';
      hint.textContent = 'Pulsa en una placa para girarla 90° e intercambiarla con el slot siguiente';
      if (wrapper.parentElement) {
        wrapper.parentElement.insertBefore(hint, wrapper);
      }

      // 2. Cuadrícula en el centro (dentro del wrapper)
      const grid = document.createElement('div');
      grid.id = 'item-closeup-plates-grid';
      grid.className = 'item-closeup-plates-grid';
      grid.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      const state = this.getPlatesState();
      let isAnimating = false;

      [1, 2, 3, 4].forEach((plateId) => {
        const plateData = state[plateId];
        const slotCfg = this.SLOTS_CONFIG[plateData.slot];
        const plateCfg = this.PLATES_CONFIG[plateId];

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item-closeup-plate-slot';
        btn.dataset.plateId = String(plateId);
        btn.dataset.slot = String(plateData.slot);
        btn.dataset.rotation = String(plateData.rotation);
        btn.style.gridColumn = String(slotCfg.col);
        btn.style.gridRow = String(slotCfg.row);
        btn.setAttribute('aria-label', `${plateCfg.label} en ${slotCfg.label} (${plateData.rotation}°). Pulsa para desplazar al slot ${slotCfg.nextSlot} y girar 90°`);

        const img = document.createElement('img');
        img.className = 'item-closeup-plate-img';
        img.src = plateCfg.src;
        img.alt = plateCfg.label;
        img.style.transform = `rotate(${plateData.rotation}deg)`;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isAnimating) return;

          const currentState = this.getPlatesState();
          const currentSlot = Number(btn.dataset.slot);
          const nextSlot = this.SLOTS_CONFIG[currentSlot].nextSlot;

          // Encontrar qué placa está actualmente en el slot de destino (nextSlot)
          const otherPlateId = Object.keys(currentState).find(
            id => Number(currentState[id].slot) === nextSlot
          );
          if (!otherPlateId) return;

          const thisPlateId = Number(btn.dataset.plateId);
          const otherBtn = grid.querySelector(`.item-closeup-plate-slot[data-plate-id="${otherPlateId}"]`);
          if (!otherBtn) return;

          isAnimating = true;

          // 1. FLIP (First): Medir posiciones iniciales
          const rectA = btn.getBoundingClientRect();
          const rectB = otherBtn.getBoundingClientRect();

          // 2. Calcular nuevas rotaciones y slots
          const oldRotA = Number(currentState[thisPlateId].rotation) || 0;
          const targetRotA = oldRotA + 90;
          const normalizedRotA = (targetRotA % 360 + 360) % 360;

          const rotB = Number(currentState[otherPlateId].rotation) || 0;

          currentState[thisPlateId].slot = nextSlot;
          currentState[thisPlateId].rotation = normalizedRotA;
          currentState[otherPlateId].slot = currentSlot;
          // La placa del slot contiguo se intercambia de posición conservando su rotación actual

          // 3. Actualizar ubicaciones en CSS Grid y datasets
          const nextSlotCfg = this.SLOTS_CONFIG[nextSlot];
          const currSlotCfg = this.SLOTS_CONFIG[currentSlot];

          btn.style.gridColumn = String(nextSlotCfg.col);
          btn.style.gridRow = String(nextSlotCfg.row);
          btn.dataset.slot = String(nextSlot);
          btn.dataset.rotation = String(normalizedRotA);

          otherBtn.style.gridColumn = String(currSlotCfg.col);
          otherBtn.style.gridRow = String(currSlotCfg.row);
          otherBtn.dataset.slot = String(currentSlot);

          // Actualizar accesibilidad
          const cfgA = this.PLATES_CONFIG[thisPlateId];
          const cfgB = this.PLATES_CONFIG[otherPlateId];
          btn.setAttribute('aria-label', `${cfgA.label} en ${nextSlotCfg.label} (${normalizedRotA}°). Pulsa para desplazar al slot ${nextSlotCfg.nextSlot} y girar 90°`);
          otherBtn.setAttribute('aria-label', `${cfgB.label} en ${currSlotCfg.label} (${rotB}°). Pulsa para desplazar al slot ${currSlotCfg.nextSlot} y girar 90°`);

          // 4. FLIP (Last): Medir posiciones finales
          const newRectA = btn.getBoundingClientRect();
          const newRectB = otherBtn.getBoundingClientRect();

          const dxA = rectA.left - newRectA.left;
          const dyA = rectA.top - newRectA.top;
          const dxB = rectB.left - newRectB.left;
          const dyB = rectB.top - newRectB.top;

          // 5. FLIP (Invert): Compensar el cambio instantáneo sin transición
          btn.style.transition = 'none';
          otherBtn.style.transition = 'none';
          btn.style.zIndex = '10';
          otherBtn.style.zIndex = '5';
          btn.style.transform = `translate(${dxA}px, ${dyA}px)`;
          otherBtn.style.transform = `translate(${dxB}px, ${dyB}px)`;

          // Forzar reflujo DOM
          btn.offsetHeight;

          // 6. FLIP (Play): Animar traslación al destino y rotación de la placa pulsada
          const imgA = btn.querySelector('.item-closeup-plate-img');
          const DURATION = 280;

          btn.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
          otherBtn.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
          btn.style.transform = 'translate(0px, 0px)';
          otherBtn.style.transform = 'translate(0px, 0px)';

          if (imgA) {
            imgA.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1), filter 0.2s ease`;
            imgA.style.transform = `rotate(${targetRotA}deg)`;
          }

          this.playPlateRotateSound();

          setTimeout(() => {
            btn.style.transition = '';
            otherBtn.style.transition = '';
            btn.style.transform = '';
            otherBtn.style.transform = '';
            btn.style.zIndex = '';
            otherBtn.style.zIndex = '';

            if (imgA) {
              imgA.style.transition = 'none';
              imgA.style.transform = `rotate(${normalizedRotA}deg)`;
              imgA.offsetHeight;
              imgA.style.transition = '';
            }

            this.savePlatesState(currentState);
            if (this.isPlatesPuzzleSolved()) {
              if (window.AudioController && window.AudioController.playSfx) {
                window.AudioController.playSfx('assets/audio/sfx/success.mp3');
              }
            }
            isAnimating = false;
          }, DURATION + 20);
        });

        btn.appendChild(img);
        grid.appendChild(btn);
      });

      wrapper.appendChild(grid);

      // 3. Botón "Restablecer placas" ABAJO en lugar del texto del título
      const btnReset = document.createElement('button');
      btnReset.type = 'button';
      btnReset.id = 'btn-reset-plates';
      btnReset.className = 'item-closeup-reset-btn';
      btnReset.textContent = 'Restablecer placas';
      btnReset.setAttribute('aria-label', 'Restablecer placas a la posición y orientación inicial');

      btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAnimating) return;

        const defaultState = {
          1: { slot: 1, rotation: 0 },
          2: { slot: 2, rotation: 0 },
          3: { slot: 3, rotation: 0 },
          4: { slot: 4, rotation: 0 }
        };
        this.savePlatesState(defaultState);

        [1, 2, 3, 4].forEach((plateId) => {
          const btn = grid.querySelector(`.item-closeup-plate-slot[data-plate-id="${plateId}"]`);
          if (!btn) return;
          const slotCfg = this.SLOTS_CONFIG[plateId];
          const plateCfg = this.PLATES_CONFIG[plateId];

          btn.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
          btn.style.gridColumn = String(slotCfg.col);
          btn.style.gridRow = String(slotCfg.row);
          btn.dataset.slot = String(plateId);
          btn.dataset.rotation = '0';
          btn.style.transform = '';
          btn.setAttribute('aria-label', `${plateCfg.label} en ${slotCfg.label} (0°). Pulsa para desplazar al slot ${slotCfg.nextSlot} y girar 90°`);

          const img = btn.querySelector('.item-closeup-plate-img');
          if (img) {
            img.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
            img.style.transform = 'rotate(0deg)';
          }
        });

        this.playPlateRotateSound();
      });

      if (wrapper.parentElement) {
        wrapper.parentElement.appendChild(btnReset);
      }
    } else {
      this.closeupImg.style.display = 'block';
      const closeupSrc = item.closeup || item.icon;
      this.closeupImg.src = closeupSrc;
      this.closeupImg.alt = item.name || '';
    }
  },

  /**
   * Abre la visualización en primer plano con efecto container transform
   * al recoger un objeto del escenario.
   */
  showPickupCloseup(item) {
    if (!item) return;
    this.currentPendingItem = item;

    if (!this.modalCloseup) {
      this.modalCloseup = document.getElementById('modal-item-closeup');
      this.closeupImg = document.getElementById('item-closeup-img');
      this.closeupTitle = document.getElementById('item-closeup-title');
      this.btnCloseCloseup = document.getElementById('btn-close-item-closeup');
    }

    if (!this.modalCloseup) {
      // Fallback si el DOM no está disponible
      this.playPickupSound();
      this.addItem(item);
      return;
    }

    this.modalCloseup.style.display = 'flex';
    this.modalCloseup.offsetHeight;

    if (this.btnCloseCloseup) {
      this.btnCloseCloseup.setAttribute('aria-label', 'Guardar en inventario');
    }

    this.renderCloseupContent(item);

    // Sonido al coger el objeto del escenario
    this.playPickupSound();

    // Iniciar apertura con animación Container Transform
    this.modalCloseup.classList.remove('closing');
    this.modalCloseup.classList.add('active', 'opening');
    this.modalCloseup.setAttribute('aria-hidden', 'false');
  },

  /**
   * Abre el close-up para inspección directa desde el inventario.
   */
  showItemCloseup(item) {
    if (!item) return;
    this.currentPendingItem = null;

    if (!this.modalCloseup) {
      this.modalCloseup = document.getElementById('modal-item-closeup');
      this.closeupImg = document.getElementById('item-closeup-img');
      this.closeupTitle = document.getElementById('item-closeup-title');
      this.btnCloseCloseup = document.getElementById('btn-close-item-closeup');
    }

    if (!this.modalCloseup) return;

    this.modalCloseup.style.display = 'flex';
    this.modalCloseup.offsetHeight;

    if (this.btnCloseCloseup) {
      this.btnCloseCloseup.setAttribute('aria-label', 'Cerrar');
    }

    this.renderCloseupContent(item);
    this.playInspectSound();

    this.modalCloseup.classList.remove('closing');
    this.modalCloseup.classList.add('active', 'opening');
    this.modalCloseup.setAttribute('aria-hidden', 'false');
  },

  /**
   * Cierra el close-up y añade el objeto al inventario si proviene de una recogida.
   */
  closePickupCloseup() {
    if (!this.isCloseupOpen()) return;

    const item = this.currentPendingItem;
    this.currentPendingItem = null;

    this.modalCloseup.classList.remove('opening');
    this.modalCloseup.classList.add('closing');

    // Reproducir tono metálico/madera de guardado en ranura
    this.playStoreSound();

    setTimeout(() => {
      this.modalCloseup.classList.remove('active', 'closing');
      this.modalCloseup.setAttribute('aria-hidden', 'true');
      this.modalCloseup.style.display = 'none';

      // Limpiar contenedor interactivo si existía
      if (this.closeupImg && this.closeupImg.parentElement) {
        const wrapper = this.closeupImg.parentElement;
        const content = wrapper.parentElement;
        if (content) {
          const hint = content.querySelector('.item-closeup-hint');
          if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
          const btnReset = content.querySelector('.item-closeup-reset-btn');
          if (btnReset && btnReset.parentNode) btnReset.parentNode.removeChild(btnReset);
        }
        const grid = wrapper.querySelector('.item-closeup-plates-grid');
        if (grid && grid.parentNode) grid.parentNode.removeChild(grid);
        this.closeupImg.style.display = 'block';
        this.closeupImg.src = '';
        this.closeupImg.alt = '';
      }
      if (this.closeupTitle) {
        this.closeupTitle.style.display = '';
        this.closeupTitle.textContent = '';
      }

      if (item) {
        this.addItem(item);
        this.highlightLatestSlot();
      }
    }, 380);
  },

  /**
   * Sonido sintético al rotar una de las placas metálicas (Web Audio API).
   */
  playPlateRotateSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  },

  /**
   * Resalta la última ranura que recibió el objeto con un destello dorado.
   */
  highlightLatestSlot() {
    const slots = this.container ? this.container.querySelectorAll('.inventory-slot.has-item') : [];
    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      lastSlot.classList.add('just-added');
      setTimeout(() => {
        lastSlot.classList.remove('just-added');
      }, 1200);
    }
  },

  /**
   * Sonido sintético al desplegar el objeto (Web Audio API).
   */
  playInspectSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  },

  /**
   * Sonido al coger un objeto del escenario (assets/audio/sfx/item_pickup.mp3).
   */
  playPickupSound() {
    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
    } catch (e) {}

    this.playInspectSound();
  },

  /**
   * Sonido al soltar un objeto del inventario (assets/audio/sfx/item_pickup.mp3).
   */
  playDropSound() {
    this._lastDropSoundTime = Date.now();
    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
    } catch (e) {}
  },

  /**
   * Sonido al guardar en inventario (assets/audio/sfx/item_pickup.mp3 con fallback sintético).
   */
  playStoreSound() {
    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(270, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }
};
