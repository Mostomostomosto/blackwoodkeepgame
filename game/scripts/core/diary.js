/**
 * Blackwood Keep — Gestor de Diario / Cuaderno de Notas Interactivo (DiaryManager)
 * Administra los documentos, fotografías y notas descubiertos por el jugador.
 * Implementa visualización de cuaderno antiguo con efecto Page-Flip interactivo (St.PageFlip).
 */

import { Storage, CLARA_INITIAL_ENTRY } from './storage.js';
import { AudioController } from './audio.js';
import { t } from './i18n.js';

export const DiaryManager = {
  modal: null,
  flipContainer: null,
  flipBookEl: null,
  btnClose: null,
  btnDocsToggle: null,
  pageFlip: null,
  isOpen: false,
  isOpeningAnimation: false,
  autoFlipTimer: null,
  pendingTargetPage: null,
  targetSpread: 1,

  init() {
    this.modal = document.getElementById('modal-docs');
    this.flipContainer = document.getElementById('notebook-flip-container');
    this.btnClose = document.getElementById('btn-close-notebook');
    this.btnDocsToggle = document.getElementById('btn-docs-toggle');

    if (this.modal) {
      this.modal.style.display = 'none';
    }

    // Botón de cuaderno en el HUD
    if (this.btnDocsToggle) {
      this.btnDocsToggle.addEventListener('click', () => {
        this.openNotebook();
      });
    }

    // Botón Volver / Cerrar (inv_arrow)
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        this.closeNotebook();
      });
    }

    // Cerrar al hacer clic en el backdrop semi-transparente fuera del libro
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeNotebook();
        }
      });
    }

    // Clic en el contenedor del libro durante la animación para saltar directamente a la última página
    if (this.flipContainer) {
      this.flipContainer.addEventListener('click', (e) => {
        if (e.target && e.target.closest('#btn-close-notebook')) return;
        if (this.isOpeningAnimation) {
          this.skipOpeningAnimation();
        }
      });
    }

    // Tecla Escape para cerrar
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const previewModal = document.getElementById('modal-diary-preview');
        if (previewModal && previewModal.classList.contains('active')) {
          previewModal.classList.remove('active');
          previewModal.setAttribute('aria-hidden', 'true');
          return;
        }
        if (this.isOpen) {
          this.closeNotebook();
        }
      }
    });

    // Reajustar dimensiones si la ventana cambia de tamaño
    window.addEventListener('resize', () => {
      if (this.isOpen && this.pageFlip) {
        this.pageFlip.update();
      }
    });

    // Escuchar eventos de ciclo de vida de la partida
    window.addEventListener('startNewGame', () => {
      this.reset();
    });

    window.addEventListener('loadSavedGame', () => {
      this.render();
    });

    window.addEventListener('languageChanged', () => {
      this.render();
    });

    window.DiaryManager = this;

    // Renderizar libro inicialmente
    this.render();

    // Inicializar gestos táctiles de deslizamiento horizontal
    this.bindSwipeGestures();
  },

  /**
   * Obtiene la lista de documentos registrados en la partida guardada (o memoria final).
   */
  getEntries() {
    if (this._finalScreenEntries && Array.isArray(this._finalScreenEntries) && this._finalScreenEntries.length > 0) {
      return this._finalScreenEntries;
    }
    const saveState = Storage.getSaveGame();
    if (saveState && Array.isArray(saveState.diary) && saveState.diary.length > 0) {
      return saveState.diary;
    }
    return [{ ...CLARA_INITIAL_ENTRY }];
  },

  /**
   * Añade una nueva entrada al diario si no existe previamente.
   */
  addEntry(entry) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!Array.isArray(saveState.diary)) {
      saveState.diary = [{ ...CLARA_INITIAL_ENTRY }];
    }

    const exists = saveState.diary.some(e => e.id === entry.id);
    if (!exists) {
      const newEntry = {
        ...entry,
        createdAt: entry.createdAt || new Date().toISOString()
      };
      saveState.diary.push(newEntry);
      saveState.updatedAt = new Date().toISOString();
      Storage.setSaveGame(saveState);
      this.render();
      window.dispatchEvent(new CustomEvent('diaryUpdated', { detail: { entry: newEntry } }));
      console.log(`%c📖 Entrada añadida al diario: [${newEntry.title || newEntry.id}]`, 'color: #d4af37; font-weight: bold;');
      return true;
    }

    return false;
  },

  /**
   * Reinicia completamente el diario y cierra modales de notas.
   */
  reset() {
    const previewModal = document.getElementById('modal-diary-preview');
    if (previewModal) {
      previewModal.classList.remove('active');
      previewModal.setAttribute('aria-hidden', 'true');
      previewModal.style.display = 'none';
    }
    this.closeNotebook();
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    this.render();
  },

  /**
   * Determina si un documento corresponde a las pistas de cables del cuadro de luces.
   */
  isWireClue(item) {
    if (!item) return false;
    return Boolean(
      item.isWireClue ||
      item.id === 'doc_bsmnt_drum_dices' ||
      item.id === 'doc_bsmnt_cards' ||
      item.id === 'doc_bsmnt_chest_colors' ||
      item.id === 'doc_bsmnt_chips' ||
      item.id === 'bsmnt_chips' ||
      item.id === 'doc_wire_clues' ||
      (typeof item.id === 'string' && item.id.startsWith('doc_wire_'))
    );
  },

  /**
   * Renderiza el pie de página con paginación natural de libro:
   * - Hoja izquierda: botón anterior y número de página.
   * - Hoja derecha: número de página y botón siguiente.
   */
  renderFooter(pageNum, isFirst, isLast) {
    const isLeftPage = (pageNum % 2 === 0);
    if (isFirst) {
      return `
        <div class="sheet-footer">
          <button type="button" class="sheet-page-turn-btn btn-turn-prev" aria-label="Cerrar libro">‹ Portada</button>
          <span class="sheet-page-num">— ${pageNum} —</span>
          <button type="button" class="sheet-page-turn-btn btn-turn-next ${isLast ? 'disabled' : ''}" aria-label="Página siguiente">
            ${isLast ? '' : 'Siguiente ›'}
          </button>
        </div>
      `;
    }

    if (isLeftPage) {
      return `
        <div class="sheet-footer">
          <button type="button" class="sheet-page-turn-btn btn-turn-prev" aria-label="Página anterior">‹ Anterior</button>
          <span class="sheet-page-num">— ${pageNum} —</span>
          <div class="sheet-footer-spacer"></div>
        </div>
      `;
    } else {
      return `
        <div class="sheet-footer">
          <div class="sheet-footer-spacer"></div>
          <span class="sheet-page-num">— ${pageNum} —</span>
          <button type="button" class="sheet-page-turn-btn btn-turn-next ${isLast ? 'disabled' : ''}" aria-label="Página siguiente">
            ${isLast ? '' : 'Siguiente ›'}
          </button>
        </div>
      `;
    }
  },

  /**
   * Construye los elementos HTML correspondientes a las páginas del libro.
   */
  buildPageElements() {
    const entries = this.getEntries();
    const saveState = Storage.getSaveGame();
    const pages = [];

    // Página 0: Portada exterior frontal (stage_notebook.png)
    const coverPage = document.createElement('div');
    coverPage.className = 'notebook-page notebook-cover';
    coverPage.dataset.density = 'hard';
    coverPage.addEventListener('click', () => {
      if (this.pageFlip && this.pageFlip.getCurrentPageIndex() === 0 && !this.isOpeningAnimation) {
        this.pageFlip.flipNext();
      }
    });
    pages.push(coverPage);

    // Página 1: Parte trasera de la portada / Interior de la cubierta (notebook_inside_cover.png)
    const insideCoverPage = document.createElement('div');
    insideCoverPage.className = 'notebook-page notebook-inside-cover';
    insideCoverPage.dataset.density = 'hard';
    pages.push(insideCoverPage);

    // Separar entradas estándar y consolidar pistas de cables en una única página 2x2
    const displayPages = [];
    let wireCluesGroup = null;

    const currentLang = (window.i18n && typeof window.i18n.getCurrentLanguage === 'function')
      ? window.i18n.getCurrentLanguage()
      : (Storage.getSettings()?.language || 'es');
    const validLang = ['es', 'en', 'fr'].includes(currentLang) ? currentLang : 'es';

    entries.forEach((rawItem) => {
      let item = { ...rawItem };
      if (item.id === 'doc_bsmnt_newspaper' || (item.image && item.image.includes('bsmnt_newspaper'))) {
        const newspaperI18n = window.NEWSPAPER_DOC_I18N || {};
        const loc = newspaperI18n[validLang] || {};
        item = {
          ...item,
          image: `assets/levels/level_01_bsmnt/docs/bsmnt_newspaper_${validLang}.webp`,
          ...(loc.title ? { title: loc.title } : {}),
          ...(loc.badge ? { badge: loc.badge } : {}),
          ...(loc.date ? { date: loc.date } : {}),
          ...(loc.text ? { text: loc.text } : {})
        };
      }
      if (this.isWireClue(item)) {
        if (!wireCluesGroup) {
          wireCluesGroup = {
            isWireCluesPage: true,
            hasDices: false,
            hasCards: false,
            hasChestColors: false,
            hasChips: false
          };
          displayPages.push(wireCluesGroup);
        }
        if (item.id === 'doc_bsmnt_drum_dices') {
          wireCluesGroup.hasDices = true;
        } else if (item.id === 'doc_bsmnt_cards') {
          wireCluesGroup.hasCards = true;
        } else if (item.id === 'doc_bsmnt_chest_colors') {
          wireCluesGroup.hasChestColors = true;
        } else if (item.id === 'doc_bsmnt_chips' || item.id === 'bsmnt_chips') {
          wireCluesGroup.hasChips = true;
        } else {
          wireCluesGroup.hasDices = true;
          wireCluesGroup.hasCards = true;
          wireCluesGroup.hasChestColors = true;
          wireCluesGroup.hasChips = true;
        }
      } else if (item.image && item.text && item.text.trim().length > 35) {
        // Documento con imagen y texto: dividir en pliego enfrentado (Izquierda = Foto, Derecha = Texto)
        // Para que queden enfrentadas en el mismo pliego, la foto debe empezar en hoja izquierda (pág. par)
        const nextContentPageNum = displayPages.length + 1;
        if (nextContentPageNum % 2 !== 0 && displayPages.length > 0) {
          displayPages.push({
            isFillerPage: true,
            quote: '«Cada fragmento del pasado nos acerca a la verdad...»'
          });
        }
        displayPages.push({
          isWireCluesPage: false,
          isSplitPhotoPage: true,
          item
        });
        displayPages.push({
          isWireCluesPage: false,
          isSplitTextPage: true,
          item
        });
      } else {
        displayPages.push({ isWireCluesPage: false, item });
      }
    });

    // Validar flags de inspección de la partida por si alguna pista ya fue examinada
    const hasMedChest = Boolean(
      saveState?.puzzleFlags?.med_chest_colors_inspected ||
      saveState?.puzzleFlags?.med_chest_unlocked ||
      saveState?.puzzleFlags?.med_chest_open
    );
    const hasChips = Boolean(
      saveState?.puzzleFlags?.barrel_chips_inspected ||
      saveState?.puzzleFlags?.chips_inspected
    );

    if (wireCluesGroup) {
      if (saveState?.puzzleFlags?.drums_dices_inspected) wireCluesGroup.hasDices = true;
      if (saveState?.puzzleFlags?.cards_inspected) wireCluesGroup.hasCards = true;
      if (hasMedChest) wireCluesGroup.hasChestColors = true;
      if (hasChips) wireCluesGroup.hasChips = true;
    } else if (saveState?.puzzleFlags?.drums_dices_inspected || saveState?.puzzleFlags?.cards_inspected || hasMedChest || hasChips) {
      wireCluesGroup = {
        isWireCluesPage: true,
        hasDices: Boolean(saveState?.puzzleFlags?.drums_dices_inspected),
        hasCards: Boolean(saveState?.puzzleFlags?.cards_inspected),
        hasChestColors: hasMedChest,
        hasChips: hasChips
      };
      displayPages.push(wireCluesGroup);
    }

    this.totalContentPages = displayPages.length;

    // Páginas siguientes: Un pergamino por cada página calculada
    if (displayPages.length === 0) {
      const emptySheet = document.createElement('div');
      emptySheet.className = 'notebook-page notebook-sheet';
      emptySheet.dataset.density = 'soft';
      emptySheet.innerHTML = `
        <div class="notebook-sheet-content">
          <div class="sheet-empty-body">
            <div class="sheet-badge-ornament">✦ DIARIO DE CLARA ✦</div>
            <p class="sheet-empty-cursive">
              «Las páginas permanecen en blanco. Cada fragmento del pasado nos acerca a la verdad...»
            </p>
          </div>
          ${this.renderFooter(1, true, true)}
        </div>
      `;
      pages.push(emptySheet);
    } else {
      displayPages.forEach((pageData, idx) => {
        const pageNum = idx + 1;
        const isFirst = (idx === 0);
        const isLast = (idx === displayPages.length - 1);
        const docSheet = document.createElement('div');
        docSheet.className = 'notebook-page notebook-sheet';
        docSheet.dataset.density = 'soft';

        if (pageData.isFillerPage) {
          docSheet.innerHTML = `
            <div class="notebook-sheet-content">
              <div class="sheet-empty-body">
                <div style="font-size: 2.2rem; opacity: 0.28; color: #5a3d24;">❧</div>
                <p class="sheet-empty-cursive">${pageData.quote}</p>
              </div>
              ${this.renderFooter(pageNum, isFirst, isLast)}
            </div>
          `;
          pages.push(docSheet);
        } else if (pageData.isWireCluesPage) {
          // Página consolidada: Pistas de colores de los cables (Cuadrícula 2x2)
          const hasDices = pageData.hasDices;
          const hasCards = pageData.hasCards;
          const hasChestColors = pageData.hasChestColors;
          const hasChips = pageData.hasChips;

          const diceImg = 'assets/levels/level_01_bsmnt/docs/bsmnt_drum.webp';
          const diceTitle = 'Dados sobre el bidón';

          const cardImg = 'assets/levels/level_01_bsmnt/docs/bsmnt_cards.webp';
          const cardTitle = 'Naipes tras el retrato';

          const chestImg = 'assets/levels/level_01_bsmnt/docs/bsmnt_chest_colors.webp';
          const chestTitle = 'Frascos en el botiquín';

          const chipsImg = 'assets/levels/level_01_bsmnt/docs/bsmnt_chips.webp';
          const chipsTitle = 'Fichas sobre el barril';

          docSheet.innerHTML = `
            <div class="notebook-sheet-content">
              <div class="sheet-header">
                <div class="sheet-badge-ornament">✦ DIARIO DE CLARA ✦</div>
                <h3 class="sheet-doc-handwritten-title">Notas visuales</h3>
                <p class="sheet-wire-clues-intro">Esbozos de cosas que he encontrado fuera de lugar en el sótano.</p>
                <div class="sheet-divider"></div>
              </div>
              <div class="sheet-body sheet-body-wire-clues">
                <div class="wire-clues-container">
                  <div class="wire-clues-grid">
                    <!-- Pista 1: Dados sobre el bidón (Arriba Izquierda) -->
                    ${hasDices ? `
                    <div class="wire-clue-card">
                      <button type="button" class="wire-clue-photo-btn" data-img="${diceImg}" data-title="${diceTitle}" aria-label="${diceTitle}">
                        <img src="${diceImg}" alt="${diceTitle}" class="wire-clue-img" draggable="false">
                      </button>
                    </div>` : `<div class="wire-clue-card is-empty"></div>`}

                    <!-- Pista 2: Naipes tras el retrato (Arriba Derecha) -->
                    ${hasCards ? `
                    <div class="wire-clue-card">
                      <button type="button" class="wire-clue-photo-btn" data-img="${cardImg}" data-title="${cardTitle}" aria-label="${cardTitle}">
                        <img src="${cardImg}" alt="${cardTitle}" class="wire-clue-img" draggable="false">
                      </button>
                    </div>` : `<div class="wire-clue-card is-empty"></div>`}

                    <!-- Pista 3: Frascos en el botiquín (Abajo Izquierda) -->
                    ${hasChestColors ? `
                    <div class="wire-clue-card">
                      <button type="button" class="wire-clue-photo-btn" data-img="${chestImg}" data-title="${chestTitle}" aria-label="${chestTitle}">
                        <img src="${chestImg}" alt="${chestTitle}" class="wire-clue-img" draggable="false">
                      </button>
                    </div>` : `<div class="wire-clue-card is-empty"></div>`}

                    <!-- Pista 4: Fichas sobre el barril (Abajo Derecha) -->
                    ${hasChips ? `
                    <div class="wire-clue-card">
                      <button type="button" class="wire-clue-photo-btn" data-img="${chipsImg}" data-title="${chipsTitle}" aria-label="${chipsTitle}">
                        <img src="${chipsImg}" alt="${chipsTitle}" class="wire-clue-img" draggable="false">
                      </button>
                    </div>` : `<div class="wire-clue-card is-empty"></div>`}
                  </div>
                </div>
              </div>
              ${this.renderFooter(pageNum, isFirst, isLast)}
            </div>
          `;
          pages.push(docSheet);
        } else if (pageData.isSplitPhotoPage) {
          // Página A (Izquierda): Fotografía / Recorte de prensa completo
          const item = pageData.item;
          const captionText = item.imageCaption || (item.image && item.image.includes('mansion') ? '🔍 Toca para examinar el plano' : '🔍 Toca para ampliar');
          const badgeText = item.badge || (item.isJournal ? '✦ DIARIO DE CLARA ✦' : '✦ RECORTE DE PERIÓDICO ✦');

          docSheet.innerHTML = `
            <div class="notebook-sheet-content">
              <div class="sheet-header">
                <div class="sheet-badge-ornament">${badgeText}</div>
                <h3 class="sheet-doc-handwritten-title">${item.title || 'Documento'}</h3>
                <div class="sheet-divider"></div>
              </div>
              <div class="sheet-body sheet-body-photo-only">
                <button type="button" class="sheet-photo-wrapper" data-img="${item.image}" data-title="${item.title || ''}" aria-label="Ampliar documento">
                  <img src="${item.image}" alt="${item.title || 'Documento'}" class="sheet-photo-img" draggable="false">
                  <div class="sheet-photo-caption">${captionText}</div>
                </button>
                ${item.date ? `<div class="sheet-doc-date">${item.date}</div>` : ''}
              </div>
              ${this.renderFooter(pageNum, isFirst, isLast)}
            </div>
          `;
          pages.push(docSheet);
        } else if (pageData.isSplitTextPage) {
          // Página B (Derecha): Transcripción completa y legible del texto
          const item = pageData.item;
          const paragraphs = (item.text || '')
            .split(/\n\s*\n/)
            .filter(p => p.trim().length > 0)
            .map(p => `<p class="sheet-doc-paragraph">${p.trim()}</p>`)
            .join('');

          const badgeText = item.isJournal ? '✦ APUNTES DE CLARA ✦' : '✦ TRANSCRIPCIÓN ✦';

          docSheet.innerHTML = `
            <div class="notebook-sheet-content">
              <div class="sheet-header">
                <div class="sheet-badge-ornament">${badgeText}</div>
                <h3 class="sheet-doc-handwritten-title">${item.title || 'Apuntes'}</h3>
                <div class="sheet-divider"></div>
              </div>
              <div class="sheet-body">
                <div class="sheet-doc-text">
                  ${paragraphs}
                </div>
                ${item.date ? `<div class="sheet-doc-date">${item.date}</div>` : ''}
              </div>
              ${this.renderFooter(pageNum, isFirst, isLast)}
            </div>
          `;
          pages.push(docSheet);
        } else {
          // Página de documento o nota individual estándar (ej. cartas o notas solo texto)
          const item = pageData.item;
          let photoHtml = '';
          if (item.image) {
            const captionText = item.imageCaption || (item.image.includes('mansion') ? '🔍 Toca para examinar el plano' : '🔍 Toca para ampliar');
            photoHtml = `
              <button type="button" class="sheet-photo-wrapper" data-img="${item.image}" data-title="${item.title || ''}" aria-label="Ampliar documento">
                <img src="${item.image}" alt="${item.title || 'Documento'}" class="sheet-photo-img" draggable="false">
                <div class="sheet-photo-caption">${captionText}</div>
              </button>
            `;
          }

          const paragraphs = (item.text || '')
            .split(/\n\s*\n/)
            .filter(p => p.trim().length > 0)
            .map(p => `<p class="sheet-doc-paragraph">${p.trim()}</p>`)
            .join('');

          const badgeText = item.badge || (item.isJournal ? '✦ DIARIO DE CLARA ✦' : '✦ NOTA DE INVESTIGACIÓN ✦');

          docSheet.innerHTML = `
            <div class="notebook-sheet-content">
              <div class="sheet-header">
                <div class="sheet-badge-ornament">${badgeText}</div>
                <h3 class="sheet-doc-handwritten-title">${item.title || 'Documento'}</h3>
                <div class="sheet-divider"></div>
              </div>
              <div class="sheet-body">
                ${photoHtml}
                <div class="sheet-doc-text">
                  ${paragraphs}
                </div>
                ${item.date ? `<div class="sheet-doc-date">${item.date}</div>` : ''}
              </div>
              ${this.renderFooter(pageNum, isFirst, isLast)}
            </div>
          `;
          pages.push(docSheet);
        }
      });
    }

    // Garantizar que el total de páginas sea impar para que todos los pliegos abiertos sean de 2 páginas
    if (pages.length % 2 === 0) {
      const extraSheet = document.createElement('div');
      extraSheet.className = 'notebook-page notebook-sheet notebook-sheet-blank';
      extraSheet.dataset.density = 'soft';
      const pageNum = pages.length - 1;
      extraSheet.innerHTML = `
        <div class="notebook-sheet-content">
          <div class="sheet-empty-body">
            <div style="font-size: 2.2rem; opacity: 0.28; color: #5a3d24;">❧</div>
            <p class="sheet-empty-cursive">
              «En la quietud de Blackwood Keep, los secretos esperan bajo el polvo. Resuelve los enigmas para revelar la historia.»
            </p>
          </div>
          ${this.renderFooter(pageNum, false, true)}
        </div>
      `;
      pages.push(extraSheet);
    }

    return pages;
  },

  /**
   * Renderiza e inicializa la instancia de St.PageFlip en el contenedor.
   */
  render() {
    if (!this.flipContainer) {
      this.flipContainer = document.getElementById('notebook-flip-container');
    }
    if (!this.flipContainer) return;

    if (!window.St || !window.St.PageFlip) {
      console.warn('St.PageFlip no está disponible aún en window.St');
      return;
    }

    // Si ya existe una instancia previa de PageFlip, destruirla limpiamente
    if (this.pageFlip) {
      try {
        this.pageFlip.destroy();
      } catch (e) {
        console.warn('Error al destruir instancia previa de PageFlip:', e);
      }
      this.pageFlip = null;
    }

    this.flipContainer.innerHTML = '';

    // Crear elemento contenedor para el libro
    this.flipBookEl = document.createElement('div');
    this.flipBookEl.className = 'notebook-flip-book';
    this.flipBookEl.style.width = '100%';
    this.flipBookEl.style.height = '100%';
    this.flipContainer.appendChild(this.flipBookEl);

    const pages = this.buildPageElements();

    // Calcular dimensiones reales basadas en el contenedor o su proporción abierta 1632/1146
    const rect = this.flipContainer.getBoundingClientRect();
    let totalWidth = Math.round(rect.width);
    let bookHeight = Math.round(rect.height);

    if (!totalWidth || !bookHeight) {
      bookHeight = Math.round(Math.min(window.innerHeight * 0.9, 972));
      totalWidth = Math.round(bookHeight * (1632 / 1146));
    }

    // El ancho de cada página individual es la mitad del ancho total del libro abierto
    const singlePageWidth = Math.round(totalWidth / 2);

    // Inicializar St.PageFlip en modo pliego doble (landscape) con showCover: true y soporte táctil fluido
    this.pageFlip = new window.St.PageFlip(this.flipBookEl, {
      width: singlePageWidth,
      height: bookHeight,
      size: 'fixed',
      drawShadow: true,
      maxShadowOpacity: 0.55,
      showCover: true,
      usePortrait: false,
      useMouseEvents: true,
      flippingTime: 700,
      swipeDistance: 15,
      showPageCorners: true,
      disableFlipByClick: true,
      mobileScrollSupport: false,
      autoSize: false
    });

    this.pageFlip.loadFromHTML(pages);

    // Eventos de los botones de navegación interna de las hojas
    this.flipBookEl.querySelectorAll('.btn-turn-prev').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isOpeningAnimation) {
          this.skipOpeningAnimation();
          return;
        }
        this.pageFlip.flipPrev();
      });
    });

    this.flipBookEl.querySelectorAll('.btn-turn-next').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isOpeningAnimation) {
          this.skipOpeningAnimation();
          return;
        }
        this.pageFlip.flipNext();
      });
    });

    // Evento de cambio de página para alternar estado visual (abierto / cerrado)
    this.pageFlip.on('flip', (e) => {
      const pageIdx = e.data;
      if (pageIdx === 0) {
        this.flipContainer.classList.add('book-closed');
        this.flipContainer.classList.remove('book-open');
      } else {
        this.flipContainer.classList.remove('book-closed');
        this.flipContainer.classList.add('book-open');
      }
    });

    // Evento de cambio de estado para encadenar volteos automáticos fluidos hasta la última entrada
    this.pageFlip.on('changeState', (e) => {
      const state = e.data;
      if (state === 'flipping' && this.isOpen && !this.isOpeningAnimation) {
        this.playPageFlipSound();
      }
      if (state === 'read' && this.isOpen && this.isOpeningAnimation) {
        this.handleAutoFlipStep();
      }
    });

    // Eventos para ampliar fotografías o bocetos al pulsar/hacer clic
    this.flipBookEl.querySelectorAll('.sheet-photo-wrapper, .wire-clue-photo-btn').forEach((photo) => {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchMoved = false;

      photo.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchMoved = false;
        }
      }, { passive: true });

      photo.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const dx = Math.abs(e.touches[0].clientX - touchStartX);
          const dy = Math.abs(e.touches[0].clientY - touchStartY);
          if (dx > 12 || dy > 12) {
            touchMoved = true;
          }
        }
      }, { passive: true });

      photo.addEventListener('click', (e) => {
        if (touchMoved) {
          touchMoved = false;
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        if (this.isOpeningAnimation) {
          this.skipOpeningAnimation();
          return;
        }
        const imgSrc = photo.dataset.img;
        const imgTitle = photo.dataset.title || '';
        if (imgSrc && !imgSrc.endsWith('wire_clue_placeholder.svg')) {
          this.showPreview(imgSrc, imgTitle);
        }
      });
    });

    // Vinculación de gestos táctiles de deslizamiento lateral en el cuaderno
    this.bindSwipeGestures();
  },

  /**
   * Cancela cualquier temporizador activo de la secuencia de volteo automático.
   */
  clearAutoFlipTimer() {
    if (this.autoFlipTimer) {
      clearTimeout(this.autoFlipTimer);
      this.autoFlipTimer = null;
    }
  },

  /**
   * Gestiona el avance automático entre pliegos cuando el libro termina de voltear una página.
   */
  handleAutoFlipStep() {
    if (!this.isOpen || !this.isOpeningAnimation || !this.pageFlip) return;

    let currentSpread = 0;
    try {
      currentSpread = this.pageFlip.getPageCollection().getCurrentSpreadIndex();
    } catch (e) {
      currentSpread = 0;
    }

    const targetSpread = this.targetSpread || 1;

    if (currentSpread >= targetSpread) {
      // Hemos alcanzado el pliego objetivo de la última entrada
      this.clearAutoFlipTimer();
      this.pageFlip.getSettings().flippingTime = 950;
      this.isOpeningAnimation = false;
      return;
    }

    // Aún no llegamos al pliego objetivo: acelerar el volteo de páginas interiores (450ms)
    const innerFlipTime = 450;
    this.pageFlip.getSettings().flippingTime = innerFlipTime;

    this.clearAutoFlipTimer();
    this.autoFlipTimer = setTimeout(() => {
      if (!this.isOpen || !this.isOpeningAnimation || !this.pageFlip) return;
      this.pageFlip.flipNext();
    }, 60);
  },

  /**
   * Salta inmediatamente la animación de apertura y se sitúa en la página objetivo.
   */
  skipOpeningAnimation() {
    if (!this.isOpeningAnimation) return;
    this.clearAutoFlipTimer();
    this.isOpeningAnimation = false;

    if (this.pageFlip) {
      try {
        this.pageFlip.getRender().finishAnimation();
      } catch (e) {}

      this.pageFlip.getSettings().flippingTime = 950;
      const targetPage = this.pendingTargetPage || 2;
      try {
        this.pageFlip.turnToPage(targetPage);
      } catch (e) {
        console.warn('Error al saltar animación de diario:', e);
      }
      if (this.flipContainer) {
        this.flipContainer.classList.remove('book-closed');
        this.flipContainer.classList.add('book-open');
      }
    }
  },

  /**
   * Reproduce el efecto sonoro de volteo de hoja del cuaderno (assets/audio/sfx/pageflip.mp3).
   */
  playPageFlipSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/pageflip.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/pageflip.mp3');
        return;
      }
    } catch (e) {}
  },

  /**
   * Abre el cuaderno con fundido del backdrop y pase animado de páginas hasta la última entrada.
   */
  openNotebook(targetPage = null) {
    if (this.isOpen) return;
    this.isOpen = true;

    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/diary.mp3');
      }
    } catch (e) {}

    if (!this.modal) {
      this.modal = document.getElementById('modal-docs');
    }
    if (!this.modal) return;

    // 1. Mostrar backdrop con fade-in semi-transparente
    this.modal.style.display = 'flex';
    this.modal.offsetHeight;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');

    // 2. Renderizar con las dimensiones exactas una vez visible el modal
    this.render();

    if (this.pageFlip) {
      this.clearAutoFlipTimer();

      if (this.flipContainer) {
        this.flipContainer.classList.add('book-closed');
        this.flipContainer.classList.remove('book-open');
      }

      // 3. Iniciar cerrado en la portada (Spread 0)
      this.pageFlip.turnToPage(0);
      this.pageFlip.update();

      // 4. Calcular página y pliego objetivo (por defecto la última página de contenido)
      // Portada = 0, Interior = 1, Hoja 1 = 2, Hoja n = 1 + n
      const lastEntryPage = (this.totalContentPages && this.totalContentPages > 0)
        ? (1 + this.totalContentPages)
        : 2;
      const finalPage = (typeof targetPage === 'number' && targetPage >= 1) ? targetPage : lastEntryPage;
      this.pendingTargetPage = finalPage;

      try {
        const spreadIdx = this.pageFlip.getPageCollection().getSpreadIndexByPage(finalPage);
        this.targetSpread = (typeof spreadIdx === 'number') ? spreadIdx : Math.max(1, Math.floor((finalPage + 1) / 2));
      } catch (e) {
        this.targetSpread = Math.max(1, Math.floor((finalPage + 1) / 2));
      }

      // 5. Iniciar la secuencia de volteo animado
      this.isOpeningAnimation = true;
      this.pageFlip.getSettings().flippingTime = 950;

      // Retardo para permitir el fade-in visual del contenedor del modal
      this.autoFlipTimer = setTimeout(() => {
        if (!this.isOpen || !this.pageFlip) return;

        // Primer volteo: Portada exterior se abre hacia el primer pliego (Spread 0 -> Spread 1)
        this.pageFlip.flipNext();
      }, 350);
    }
  },

  /**
   * Cierra el cuaderno y reinicia a la portada para la siguiente apertura.
   */
  closeNotebook() {
    this.isOpen = false;
    this.clearAutoFlipTimer();
    this.isOpeningAnimation = false;

    try {
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/diary.mp3');
      }
    } catch (e) {}

    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (!this.isOpen && !this.modal.classList.contains('active')) {
          this.modal.style.display = 'none';
        }
      }, 390);
    }

    if (this.pageFlip) {
      try {
        this.pageFlip.getRender().finishAnimation();
      } catch (e) {}

      this.pageFlip.getSettings().flippingTime = 950;

      try {
        this.pageFlip.turnToPage(0);
      } catch (e) {
        // En caso de animación activa
      }
      if (this.flipContainer) {
        this.flipContainer.classList.add('book-closed');
        this.flipContainer.classList.remove('book-open');
      }
    }
  },

  /**
   * Muestra una vista previa ampliada de una fotografía del diario.
   */
  showPreview(imgSrc, title = '') {
    let previewModal = document.getElementById('modal-diary-preview');
    if (!previewModal) {
      previewModal = document.createElement('div');
      previewModal.id = 'modal-diary-preview';
      previewModal.className = 'modal-backdrop diary-preview-backdrop';
      previewModal.setAttribute('aria-hidden', 'true');
      previewModal.style.display = 'none';
      previewModal.innerHTML = `
        <div class="diary-preview-panel gothic-frame">
          <button type="button" class="diary-preview-close" aria-label="Cerrar">&times;</button>
          <img src="" alt="" class="diary-preview-img">
          <p class="diary-preview-caption"></p>
        </div>
      `;
      document.getElementById('game-container')?.appendChild(previewModal);

      previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal || e.target.classList.contains('diary-preview-close')) {
          previewModal.classList.remove('active');
          previewModal.setAttribute('aria-hidden', 'true');
          setTimeout(() => {
            if (!previewModal.classList.contains('active')) {
              previewModal.style.display = 'none';
            }
          }, 360);
        }
      });
    }

    if (imgSrc && imgSrc.includes('bsmnt_newspaper')) {
      const currentLang = (window.i18n && typeof window.i18n.getCurrentLanguage === 'function')
        ? window.i18n.getCurrentLanguage()
        : (Storage.getSettings()?.language || 'es');
      const validLang = ['es', 'en', 'fr'].includes(currentLang) ? currentLang : 'es';
      imgSrc = `assets/levels/level_01_bsmnt/docs/bsmnt_newspaper_${validLang}.webp`;
      if (window.NEWSPAPER_DOC_I18N && window.NEWSPAPER_DOC_I18N[validLang]) {
        title = window.NEWSPAPER_DOC_I18N[validLang].title;
      }
    }

    const img = previewModal.querySelector('.diary-preview-img');
    const caption = previewModal.querySelector('.diary-preview-caption');
    if (img) img.src = imgSrc;
    if (caption) caption.textContent = title;

    previewModal.style.display = 'flex';
    previewModal.offsetHeight;
    previewModal.classList.add('active');
    previewModal.setAttribute('aria-hidden', 'false');
  },

  /**
   * Vincula gestos táctiles de deslizamiento horizontal (swipe) en el modal del diario.
   * Permite pasar de página arrastrando con el dedo hacia la izquierda (siguiente) o derecha (anterior).
   */
  bindSwipeGestures() {
    if (this._swipeGesturesBound) return;
    this._swipeGesturesBound = true;

    const modal = document.getElementById('modal-docs');
    if (!modal) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTracking = false;

    modal.addEventListener('touchstart', (e) => {
      if (!this.isOpen) return;
      if (this.isOpeningAnimation) {
        this.skipOpeningAnimation();
        return;
      }
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isTracking = true;
      }
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      if (!isTracking || !this.isOpen || !this.pageFlip || this.isOpeningAnimation) return;
      isTracking = false;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const duration = Date.now() - touchStartTime;

      // Si St.PageFlip ya se encuentra animando el volteo de página, no duplicar la llamada
      if (typeof this.pageFlip.getState === 'function' && this.pageFlip.getState() === 'flipping') {
        return;
      }

      // Si el desplazamiento horizontal supera 35px, es predominantemente horizontal y dura menos de 700ms
      if (absX > 35 && absX > absY * 1.15 && duration < 700) {
        if (deltaX < 0) {
          // Deslizar hacia la izquierda: página siguiente
          this.pageFlip.flipNext();
        } else {
          // Deslizar hacia la derecha: página anterior
          this.pageFlip.flipPrev();
        }
      }
    }, { passive: true });
  }
};
