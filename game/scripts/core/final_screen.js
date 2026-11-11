/**
 * Blackwood Keep — Pantalla Final: Nivel 1 Completado (FinalScreenManager)
 * Gestiona la visualización de la pantalla de fin de nivel tras la cinemática de la puerta.
 * Efectos visuales de iluminación CSS, motas de polvo animadas, estadísticas de tiempo
 * y documentos recogidos, y botones interactivos (releer cuaderno y volver a jugar).
 */

import { Storage } from './storage.js';
import { DiaryManager } from './diary.js';
import { t } from './i18n.js';
import { GAME_DOCUMENTS } from './scene.js';

export const FinalScreenManager = {
  view: null,
  btnReplay: null,
  btnDiary: null,
  timeEl: null,
  docsEl: null,
  motasEl: null,
  isInitialized: false,

  init() {
    if (this.isInitialized) return;
    this.view = document.getElementById('view-final-screen');
    this.btnReplay = document.getElementById('btn-final-replay');
    this.btnDiary = document.getElementById('btn-final-diary');
    this.timeEl = document.getElementById('final-screen-time');
    this.docsEl = document.getElementById('final-screen-documents');
    this.motasEl = document.getElementById('final-screen-motas');

    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => {
        this.handleReplay();
      });
    }

    if (this.btnDiary) {
      this.btnDiary.addEventListener('click', () => {
        this.handleOpenDiary();
      });
    }

    this.isInitialized = true;
  },

  /**
   * Genera las partículas de motas de polvo flotantes en el haz de luz de la puerta.
   */
  spawnDustMotes() {
    if (!this.motasEl) return;
    this.motasEl.innerHTML = '';

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const count = 16;
    for (let i = 0; i < count; i++) {
      const m = document.createElement('span');
      const lado = (1.2 + Math.random() * 2.2).toFixed(1);
      m.className = 'final-mota';
      m.style.cssText =
        `left:${(Math.random() * 100).toFixed(1)}%; ` +
        `top:${(15 + Math.random() * 80).toFixed(1)}%; ` +
        `width:${lado}px; height:${lado}px; ` +
        `--dx:${(Math.random() * 40 - 20).toFixed(0)}px; ` +
        `--dy:${(-30 - Math.random() * 60).toFixed(0)}px; ` +
        `--dur:${(6.5 + Math.random() * 6.5).toFixed(1)}s; ` +
        `--del:${(-Math.random() * 12).toFixed(1)}s;`;
      this.motasEl.appendChild(m);
    }
  },

  /**
   * Actualiza las estadísticas mostradas (tiempo de juego y documentos del diario).
   */
  updateStats() {
    const totalSeconds = Storage.getTotalPlayTimeSeconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const unitH = t('unit_hours_short') || 'h';
    const unitMin = t('unit_minutes_short') || 'min';

    if (this.timeEl) {
      if (hours > 0) {
        this.timeEl.textContent = `${hours} ${unitH} ${minutes} ${unitMin}`;
      } else {
        this.timeEl.textContent = `${Math.max(minutes, 1)} ${unitMin}`;
      }
    }

    // Calcular documentos descubiertos vs total
    const saveState = Storage.getSaveGame();
    const discoveredEntries = (saveState && Array.isArray(saveState.diary)) ? saveState.diary : [];
    
    // Contar IDs únicos descubiertos
    const discoveredIds = new Set(discoveredEntries.map(e => e.id));
    
    // Total de documentos únicos configurados en Level 1 (excluyendo alias duplicados como photo y bsmnt_chips)
    // 1. clara_journal_01
    // 2. letter_rosario_to_tomas
    // 3. doc_the_mansion
    // 4. doc_bsmnt_newspaper
    // 5. doc_bsmnt_drum_dices
    // 6. doc_bsmnt_cards
    // 7. doc_bsmnt_chest_colors
    // 8. doc_bsmnt_chips
    // 9. photo_julian_ship
    // 10. photo_family
    // 11. doc_bsmnt_plate
    const totalDocsCount = 11;
    const discoveredCount = Math.min(discoveredIds.size, totalDocsCount);

    if (this.docsEl) {
      this.docsEl.textContent = `${discoveredCount} / ${totalDocsCount}`;
    }
  },

  /**
   * Muestra la pantalla final con fundido a negro y fade-in de la escena.
   */
  show() {
    this.init();
    this.updateStats();
    this.spawnDustMotes();

    const finalCurtain = document.getElementById('final-screen-curtain');
    if (finalCurtain) {
      finalCurtain.classList.remove('fade-reveal');
    }

    // 1. Ocultar resto de vistas de juego y modales
    document.querySelectorAll('.game-view').forEach(v => {
      if (v.id !== 'view-final-screen') {
        v.classList.remove('active');
        v.style.display = 'none';
      }
    });

    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });

    // 2. Activar view-final-screen (que comienza cubierta por su cortina negra)
    if (this.view) {
      this.view.style.display = 'block';
      this.view.classList.add('active');
    }

    // Mantener la música de fondo continua sin cortes (solo iniciar si estuviese pausada)
    if (window.AudioController && (!window.AudioController.musicAudio || window.AudioController.musicAudio.paused)) {
      window.AudioController.playMusic('assets/audio/music/Room_Without_Windows.mp3', true, 2000);
    }

    // 3. Pausa de medio segundo en negro absoluto y luego fade in progresivo
    setTimeout(() => {
      if (finalCurtain) {
        finalCurtain.classList.add('fade-reveal');
      }
    }, 600);

    // 4. Guardar copia en memoria de los documentos descubiertos para permitir releerlos
    const saveState = Storage.getSaveGame();
    if (saveState && Array.isArray(saveState.diary) && window.DiaryManager) {
      window.DiaryManager._finalScreenEntries = [...saveState.diary];
    }

    // 5. El Nivel 1 está completado: borrar la partida guardada para que "Continuar" quede desactivado
    Storage.clearSaveGame();
    if (window.MainMenu) {
      window.MainMenu.updateSaveGameState();
    }
  },

  /**
   * Permite releer el cuaderno de notas con el visor interactivo.
   */
  handleOpenDiary() {
    if (window.DiaryManager && typeof window.DiaryManager.openNotebook === 'function') {
      window.DiaryManager.openNotebook();
    } else {
      const modalDocs = document.getElementById('modal-docs');
      if (modalDocs) {
        modalDocs.style.display = 'flex';
        modalDocs.classList.add('active');
      }
    }
  },

  /**
   * Vuelve a la pantalla de título / Menú principal borrando la partida finalizada y reseteando memoria.
   */
  handleReplay() {
    // 1. Asegurar borrado de partida persistida
    Storage.clearSaveGame();

    const curtain = document.getElementById('scene-transition-curtain');
    if (curtain) {
      curtain.style.display = 'block';
      curtain.style.transition = 'opacity 0.8s ease';
      curtain.style.opacity = '1';
    }

    setTimeout(() => {
      if (this.view) {
        this.view.classList.remove('active');
        this.view.style.display = 'none';
      }

      // 2. Limpiar estados residuales en memoria
      if (window.SceneManager && typeof window.SceneManager.resetTutorial === 'function') {
        window.SceneManager.resetTutorial();
      }
      if (window.InventoryManager && typeof window.InventoryManager.reset === 'function') {
        window.InventoryManager.reset();
      }
      if (window.DiaryManager) {
        window.DiaryManager._finalScreenEntries = null;
        if (typeof window.DiaryManager.reset === 'function') {
          window.DiaryManager.reset();
        }
      }

      const viewMenu = document.getElementById('view-menu');
      if (viewMenu) {
        viewMenu.style.display = 'block';
        viewMenu.classList.add('active');
      }

      // 3. Deshabilitar el botón Continuar inmediatamente
      if (window.MainMenu) {
        window.MainMenu.updateSaveGameState();
      }

      // 4. Restaurar tema del menú principal
      if (window.AudioController) {
        window.AudioController.stopGameplayAudio();
        window.AudioController.playMusic('assets/audio/music/bk_theme.mp3', true, 2200);
      }

      if (curtain) {
        curtain.style.opacity = '0';
        setTimeout(() => {
          curtain.style.display = 'none';
          curtain.style.transition = '';
        }, 800);
      }
    }, 800);
  }
};
