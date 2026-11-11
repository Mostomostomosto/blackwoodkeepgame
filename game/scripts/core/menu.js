/**
 * Blackwood Keep — Controlador del Menú Principal
 * Gestiona navegación, estado de botones (Continuar), modales de Opciones, Créditos y Confirmación.
 */

import { Storage } from './storage.js';
import { i18n, t } from './i18n.js';
import { AudioController } from './audio.js';

export const MainMenu = {
  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateSaveGameState();
    this.syncOptionsUI();
  },

  cacheElements() {
    // Botones del menú
    this.btnNewGame = document.getElementById('btn-new-game');
    this.btnContinue = document.getElementById('btn-continue');
    this.btnOptions = document.getElementById('btn-options');
    this.btnCredits = document.getElementById('btn-credits');

    // Modales
    this.modalOptions = document.getElementById('modal-options');
    this.modalCredits = document.getElementById('modal-credits');
    this.modalConfirm = document.getElementById('modal-confirm-new');

    // Botones dentro de modales
    this.btnConfirmNewGame = document.getElementById('btn-confirm-new-game');
    this.btnCancelNewGame = document.getElementById('btn-cancel-new-game');

    // Controles de opciones
    this.sliderMaster = document.getElementById('slider-master');
    this.sliderMusic = document.getElementById('slider-music');
    this.sliderSfx = document.getElementById('slider-sfx');
    this.sliderAmbience = document.getElementById('slider-ambience');

    this.valMaster = document.getElementById('val-master');
    this.valMusic = document.getElementById('val-music');
    this.valSfx = document.getElementById('val-sfx');
    this.valAmbience = document.getElementById('val-ambience');

    this.fillMaster = document.getElementById('fill-master');
    this.fillMusic = document.getElementById('fill-music');
    this.fillSfx = document.getElementById('fill-sfx');
    this.fillAmbience = document.getElementById('fill-ambience');

    this.langButtons = document.querySelectorAll('.btn-lang-choice');
    this.btnDustToggle = document.getElementById('btn-dust-toggle');

    // Botones del HUD y Modales de juego
    this.btnGameOptions = document.getElementById('btn-game-options');
    this.btnReturnToMenu = document.getElementById('btn-return-to-menu');
    this.btnDocsToggle = document.getElementById('btn-docs-toggle');
    this.modalDocs = document.getElementById('modal-docs');

    // Notificaciones / Toast
    this.toast = document.getElementById('menu-toast');
  },

  bindEvents() {
    // Botones principales con feedback visual y retardo táctil
    const mainButtons = [
      { btn: this.btnNewGame, action: () => this.handleNewGame() },
      { btn: this.btnContinue, action: () => this.handleContinue() },
      { btn: this.btnOptions, action: () => this.openModal(this.modalOptions) },
      { btn: this.btnCredits, action: () => this.openModal(this.modalCredits) }
    ];

    mainButtons.forEach(({ btn, action }) => {
      if (!btn) return;

      // Soporte táctil / móvil: resaltar inmediatamente en pointerdown
      btn.addEventListener('pointerdown', () => {
        if (!btn.disabled && !btn.classList.contains('disabled')) {
          btn.classList.add('active-highlight');
        }
      });

      btn.addEventListener('pointercancel', () => {
        btn.classList.remove('active-highlight');
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.executeMenuButtonWithFeedback(btn, action);
      });
    });

    // Confirmación de sobreescritura
    this.btnConfirmNewGame.addEventListener('click', () => {
      this.closeModal(this.modalConfirm);
      this.startFreshGame();
    });
    this.btnCancelNewGame.addEventListener('click', () => {
      this.closeModal(this.modalConfirm);
    });

    // Cerrar modales con botones de cierre y backdrop
    document.querySelectorAll('.btn-close-modal').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) this.closeModal(modal);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal(backdrop);
        }
      });
    });

    // Tecla Escape para cerrar cualquier modal abierto
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-backdrop.active');
        if (openModal) this.closeModal(openModal);
      }
    });

    // Botón de opciones en el HUD (flecha ornamentada)
    if (this.btnGameOptions) {
      this.btnGameOptions.addEventListener('click', () => this.openModal(this.modalOptions));
    }

    // Botón de cuaderno en el HUD (docs_ico)
    if (this.btnDocsToggle) {
      this.btnDocsToggle.addEventListener('click', () => {
        if (window.DiaryManager && typeof window.DiaryManager.openNotebook === 'function') {
          window.DiaryManager.openNotebook();
        } else if (this.modalDocs) {
          this.openModal(this.modalDocs);
        }
      });
    }

    // Salir del juego al menú principal desde opciones
    if (this.btnReturnToMenu) {
      this.btnReturnToMenu.addEventListener('click', () => {
        this.closeModal(this.modalOptions);
        this.handleReturnToMainMenu();
      });
    }

    // Controles de audio (orden según boceto: Master, SFX, Música, Ambiente)
    this.setupAudioSlider(this.sliderMaster, this.valMaster, this.fillMaster, 'master');
    this.setupAudioSlider(this.sliderSfx, this.valSfx, this.fillSfx, 'sfx');
    this.setupAudioSlider(this.sliderMusic, this.valMusic, this.fillMusic, 'music');
    this.setupAudioSlider(this.sliderAmbience, this.valAmbience, this.fillAmbience, 'ambience');

    // Selector de idiomas
    this.langButtons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const selectedLang = btn.getAttribute('data-lang');
        if (selectedLang) {
          await i18n.setLanguage(selectedLang);
          this.syncLanguageButtons();
        }
      });
    });

    // Conmutador de motas de polvo ambiental (Comentado: motas activadas siempre por defecto)
    /*
    if (this.btnDustToggle) {
      this.btnDustToggle.addEventListener('click', () => {
        const isCurrentlyActive = this.btnDustToggle.classList.contains('active');
        const nextState = !isCurrentlyActive;
        if (window.DustController) {
          window.DustController.setEnabled(nextState);
        }
        this.syncDustToggleUI(nextState);
      });
    }
    */

    // Al cambiar idioma, refrescar visuales
    window.addEventListener('languageChanged', () => {
      this.syncLanguageButtons();
      // this.syncDustToggleUI();
    });
  },

  setupAudioSlider(slider, display, fill, channel) {
    if (!slider) return;
    const updateHandler = (e) => {
      const val = parseFloat(e.target.value);
      AudioController.setVolume(channel, val);
      const pct = Math.round(val * 100);
      if (display) {
        display.textContent = `${pct}`;
      }
      if (fill) {
        fill.style.width = `${pct}%`;
      }
    };
    slider.addEventListener('input', updateHandler);
    slider.addEventListener('change', (e) => {
      updateHandler(e);
      if (channel === 'sfx') {
        AudioController.playClick();
      }
    });
  },

  updateSaveGameState() {
    if (!this.btnContinue) {
      this.btnContinue = document.getElementById('btn-continue');
    }
    if (!this.btnContinue) return;

    const hasSave = Storage.hasSaveGame();
    if (hasSave) {
      this.btnContinue.removeAttribute('disabled');
      this.btnContinue.classList.remove('disabled');
      this.btnContinue.setAttribute('aria-disabled', 'false');
    } else {
      this.btnContinue.setAttribute('disabled', 'true');
      this.btnContinue.classList.add('disabled');
      this.btnContinue.setAttribute('aria-disabled', 'true');
    }
  },

  syncOptionsUI() {
    // Sincronizar sliders y barras de progreso doradas
    const channels = [
      { slider: this.sliderMaster, val: this.valMaster, fill: this.fillMaster, name: 'master' },
      { slider: this.sliderSfx, val: this.valSfx, fill: this.fillSfx, name: 'sfx' },
      { slider: this.sliderMusic, val: this.valMusic, fill: this.fillMusic, name: 'music' },
      { slider: this.sliderAmbience, val: this.valAmbience, fill: this.fillAmbience, name: 'ambience' }
    ];

    channels.forEach(({ slider, val, fill, name }) => {
      if (slider) {
        const current = AudioController.getVolume(name);
        slider.value = current;
        const pct = Math.round(current * 100);
        if (val) val.textContent = `${pct}`;
        if (fill) fill.style.width = `${pct}%`;
      }
    });

    // Sincronizar botones de idioma
    this.syncLanguageButtons();

    // Sincronizar conmutador de motas de polvo (Comentado: motas activadas siempre por defecto)
    // this.syncDustToggleUI();
  },

  syncDustToggleUI(enabled) {
    if (!this.btnDustToggle) return;
    const isEnabled = enabled !== undefined ? enabled : (Storage.getSettings().dust !== false);
    if (isEnabled) {
      this.btnDustToggle.classList.add('active');
      this.btnDustToggle.setAttribute('aria-pressed', 'true');
      this.btnDustToggle.textContent = t('options_enabled') || 'Activadas';
      this.btnDustToggle.setAttribute('data-i18n', 'options_enabled');
    } else {
      this.btnDustToggle.classList.remove('active');
      this.btnDustToggle.setAttribute('aria-pressed', 'false');
      this.btnDustToggle.textContent = t('options_disabled') || 'Desactivadas';
      this.btnDustToggle.setAttribute('data-i18n', 'options_disabled');
    }
  },

  syncLanguageButtons() {
    const current = i18n.getCurrentLanguage();
    this.langButtons.forEach((btn) => {
      if (btn.getAttribute('data-lang') === current) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  },

  handleNewGame() {
    if (Storage.hasSaveGame()) {
      this.openModal(this.modalConfirm);
    } else {
      this.startFreshGame();
    }
  },

  handleContinue() {
    let saveState = Storage.getSaveGame();
    if (!saveState) {
      saveState = Storage.createNewGame();
    } else {
      Storage.startSessionTimer();
    }
    this.showToast(t('toast_game_loaded'));
    
    window.dispatchEvent(new CustomEvent('loadSavedGame', { detail: saveState }));
  },

  async startFreshGame() {
    // Preservar la preferencia de idioma seleccionada por el usuario
    const currentSettings = Storage.getSettings() || {};
    const chosenLanguage = currentSettings.language || (window.i18n && typeof window.i18n.getCurrentLanguage === 'function' ? window.i18n.getCurrentLanguage() : 'es');

    const defaultSettings = Storage.resetSettingsToDefault();
    defaultSettings.language = chosenLanguage;
    Storage.saveSettings(defaultSettings);

    AudioController.volumes = { ...defaultSettings.audio };
    AudioController.init();

    if (window.i18n && typeof window.i18n.setLanguage === 'function') {
      await window.i18n.setLanguage(chosenLanguage);
    }

    if (window.DustController && typeof window.DustController.setEnabled === 'function') {
      window.DustController.setEnabled(true);
    }

    this.syncOptionsUI();

    const newState = Storage.createNewGame();
    if (window.SceneManager && typeof window.SceneManager.resetTutorial === 'function') {
      window.SceneManager.resetTutorial();
    }
    this.updateSaveGameState();
    this.showToast(t('toast_game_started'));

    window.dispatchEvent(new CustomEvent('startNewGame', { detail: newState }));
  },

  openModal(modal) {
    if (!modal) return;
    if (modal === this.modalOptions) {
      const isGameActive = document.getElementById('view-game')?.classList.contains('active');
      if (this.btnReturnToMenu) {
        this.btnReturnToMenu.style.display = isGameActive ? 'flex' : 'none';
      }
      this.modalOptions.classList.toggle('in-game', !!isGameActive);
      this.syncOptionsUI();

      try {
        if (window.AudioController && window.AudioController.playSfx) {
          window.AudioController.playSfx('assets/audio/sfx/diary.mp3');
        }
      } catch (e) {}
    }
    modal.style.display = 'flex';
    modal.offsetHeight;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  },

  closeModal(modal) {
    if (!modal) return;
    if (modal.id === 'modal-docs' && window.DiaryManager && typeof window.DiaryManager.closeNotebook === 'function') {
      window.DiaryManager.closeNotebook();
      return;
    }
    if (modal === this.modalOptions) {
      try {
        if (window.AudioController && window.AudioController.playSfx) {
          window.AudioController.playSfx('assets/audio/sfx/diary.mp3');
        }
      } catch (e) {}
    }
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.style.display = 'none';
      }
    }, 360);
  },

  handleReturnToMainMenu() {
    if (this.modalOptions) {
      this.closeModal(this.modalOptions);
    }
    // 1. Ocultar la vista del juego y activar el menú principal
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    const viewMenu = document.getElementById('view-menu');
    if (viewMenu) {
      viewMenu.classList.add('active');
    }
    this.updateSaveGameState();

    // Detener audio ambiental y música de juego, y reanudar tema del menú principal
    AudioController.stopGameplayAudio();
    AudioController.playMusic('assets/audio/music/bk_theme.mp3', true, 2200);
  },

  showToast(message, duration = 3000) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  },

  /**
   * Ejecuta la acción de un botón del menú tras una breve fracción de segundo
   * con la placa resaltada visible y respuesta sonora (ideal para móvil y escritorio).
   */
  executeMenuButtonWithFeedback(btn, actionFn) {
    if (!btn || btn.disabled || btn.classList.contains('disabled')) return;

    // Resaltar visualmente con el fondo highlighted.png
    btn.classList.add('active-highlight');

    // Reproducir feedback de clic
    this.playMenuClickSound();

    // Pequeño lapso (220ms) para que el jugador perciba el marco dorado antes del cambio
    setTimeout(() => {
      btn.classList.remove('active-highlight');
      if (typeof actionFn === 'function') {
        actionFn();
      }
    }, 220);
  },

  /**
   * Genera un breve golpe sutil de percusión pétrea para los botones del menú.
   */
  playMenuClickSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playClick) {
        AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playClick) {
        window.AudioController.playClick();
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
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);
      const sfxVol = (AudioController?.getEffectiveVolume('sfx') ?? 0.8) * 0.4;
      gain.gain.setValueAtTime(sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      // Ignorar restricciones de audio antes de interacción
    }
  }
};
