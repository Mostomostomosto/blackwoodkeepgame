/**
 * Blackwood Keep — Cargador Temático (Cinemática 50 Fotogramas)
 * Controla la pantalla de carga con la secuencia fotograma a fotograma (2% por fotograma),
 * precarga real de assets, y fundido a la escena al completarse la extinción de la vela.
 */

import { t } from './i18n.js';

const LOADER_FRAME_COUNT = 50;
const LOADER_FRAME_PATHS = Array.from({ length: LOADER_FRAME_COUNT }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `assets/ui/loader/frame_${num}.webp`;
});

export const Loader = {
  minDuration: 3000, // 3000ms garantizan ~60ms por fotograma (~17 fps cinematográfico)
  frameImages: [],
  framesPreloaded: false,
  currentFrameIndex: -1,

  levelAssets: {
    'level_01_bsmnt': [
      'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_main.webp',
      'assets/ui/hud/docs_ico.webp',
      'assets/ui/hud/back_arrow.webp'
    ]
  },

  init() {
    this.cacheElements();
    this.precacheFrames();
    this.updateStatusText();

    if (!this._languageBound) {
      this._languageBound = true;
      window.addEventListener('languageChanged', () => {
        this.updateStatusText();
      });
    }
  },

  updateStatusText() {
    if (this.loaderStatus) {
      this.loaderStatus.textContent = t('loader_status', 'Descendiendo al sótano...');
    }
  },

  precacheFrames() {
    if (this.framesPreloaded) return;
    this.frameImages = LOADER_FRAME_PATHS.map((path) => {
      const img = new Image();
      img.src = path;
      return img;
    });
    this.framesPreloaded = true;
  },

  cacheElements() {
    this.viewLoader = document.getElementById('view-loader');
    this.loaderFrame = document.getElementById('loader-frame');
    this.loaderStatus = document.getElementById('loader-status');
  },

  /**
   * Inicia la pantalla de carga para un nivel y ejecuta onComplete al finalizar.
   */
  loadLevel(levelId, onComplete) {
    const level = (!levelId || levelId === 'level_01_sotano') ? 'level_01_bsmnt' : levelId;
    this.init();
    this.updateStatusText();
    if (!this.viewLoader) {
      if (onComplete) onComplete();
      return;
    }

    // 1. Mostrar la vista del loader y resetear estados
    document.querySelectorAll('.game-view').forEach(v => {
      v.classList.remove('active');
      if (v.id === 'view-splash') {
        v.style.display = 'none';
      }
    });
    this.viewLoader.classList.remove('fade-out');
    this.viewLoader.classList.add('active');

    this.resetFrame();

    // 2. Obtener lista de assets a precargar
    const assets = this.levelAssets[level] || this.levelAssets['level_01_bsmnt'] || [];
    let loadedCount = 0;
    const totalAssets = Math.max(assets.length, 1);

    if (assets.length === 0) {
      loadedCount = 1;
    } else {
      assets.forEach((src) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
        };
        img.src = src;
      });
    }

    // 3. Loop de animación sincronizado con precarga real y tiempo mínimo
    const startTime = performance.now();
    let isCompleted = false;

    const tick = (now) => {
      const elapsed = now - startTime;
      const timeProgress = Math.min(1.0, elapsed / this.minDuration);
      const networkProgress = Math.min(1.0, loadedCount / totalAssets);

      // El progreso efectivo es el mínimo entre lo descargado y el tiempo mínimo
      const progress = Math.min(networkProgress, timeProgress);

      // Mapear cada 2% de progreso a 1 fotograma (0 a 49)
      const frameIndex = Math.min(LOADER_FRAME_COUNT - 1, Math.floor(progress * LOADER_FRAME_COUNT));

      if (frameIndex !== this.currentFrameIndex) {
        this.currentFrameIndex = frameIndex;
        if (this.loaderFrame) {
          this.loaderFrame.src = LOADER_FRAME_PATHS[frameIndex];
        }
      }

      if (progress < 1.0) {
        requestAnimationFrame(tick);
      } else if (!isCompleted) {
        isCompleted = true;
        this.completeSequence(onComplete);
      }
    };

    requestAnimationFrame(tick);
  },

  resetFrame() {
    this.currentFrameIndex = 0;
    if (this.loaderFrame) {
      this.loaderFrame.src = LOADER_FRAME_PATHS[0];
    }
  },

  /**
   * Secuencia final: contemplar brevemente el rescoldo apagado y fundido a la escena.
   */
  completeSequence(onComplete) {
    if (this.loaderFrame) {
      this.loaderFrame.src = LOADER_FRAME_PATHS[LOADER_FRAME_COUNT - 1];
    }

    // Pequeño lapso contemplando el rescoldo humeante antes del fundido a la escena
    setTimeout(() => {
      if (this.viewLoader) {
        this.viewLoader.classList.add('fade-out');
      }

      setTimeout(() => {
        if (this.viewLoader) {
          this.viewLoader.classList.remove('active');
          this.viewLoader.classList.remove('fade-out');
        }
        if (onComplete) onComplete();
      }, 700);

    }, 600);
  }
};

// Precargar fotogramas en segundo plano
Loader.precacheFrames();
