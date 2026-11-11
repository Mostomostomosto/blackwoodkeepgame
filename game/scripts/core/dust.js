/**
 * Blackwood Keep — Controlador de Motas de Polvo en Suspensión (DustController)
 * Simula partículas atmosféricas flotando en el aire de las estancias con:
 * - Deriva browniana lenta con corrientes ascendentes/descendentes.
 * - Tres planos de profundidad (fondo tenue, medio y primer plano con desenfoque bokeh).
 * - Fluctuación de brillo (shimmer) por rotación de partículas que captan la luz tenue.
 * - Micro-reacción física al desplazamiento del ratón (brisa provocada por el cursor).
 * - Ajuste dinámico de intensidad según la iluminación de la escena.
 * - Pausa automática cuando el juego no está activo o la pestaña está oculta.
 */

import { Storage } from './storage.js';

class DustParticle {
  constructor(width, height) {
    this.reset(width, height, true);
  }

  /**
   * Inicializa o reinicia una partícula.
   * @param {number} width - Ancho del lienzo
   * @param {number} height - Alto del lienzo
   * @param {boolean} initial - Si es la creación inicial distribuida por toda la pantalla
   */
  reset(width, height, initial = false) {
    this.w = width || 1920;
    this.h = height || 1080;

    // Distribución en capas de profundidad:
    // 0 = Fondo (40%): pequeñas, tenues, movimiento lento.
    // 1 = Plano medio (45%): tamaño estándar, visibilidad media.
    // 2 = Primer plano (15%): más grandes, bokeh suave, ligeramente más rápidas.
    const layerRand = Math.random();
    if (layerRand < 0.40) {
      this.layer = 0;
      this.radius = 0.6 + Math.random() * 0.6; // 0.6px - 1.2px
      this.baseAlpha = 0.12 + Math.random() * 0.12; // 0.12 - 0.24
      this.speedMult = 0.35 + Math.random() * 0.25;
      this.bokeh = false;
    } else if (layerRand < 0.85) {
      this.layer = 1;
      this.radius = 1.2 + Math.random() * 0.9; // 1.2px - 2.1px
      this.baseAlpha = 0.22 + Math.random() * 0.20; // 0.22 - 0.42
      this.speedMult = 0.60 + Math.random() * 0.35;
      this.bokeh = false;
    } else {
      this.layer = 2;
      this.radius = 2.2 + Math.random() * 1.5; // 2.2px - 3.7px
      this.baseAlpha = 0.32 + Math.random() * 0.26; // 0.32 - 0.58
      this.speedMult = 0.90 + Math.random() * 0.40;
      this.bokeh = true;
    }

    // Coordenadas base
    this.baseX = Math.random() * this.w;
    this.baseY = initial
      ? Math.random() * this.h
      : (Math.random() < 0.80 ? this.h + 15 : -15);

    this.x = this.baseX;
    this.y = this.baseY;

    // Deriva vertical: 75% ascienden por convección natural, 25% descienden lentamente
    const isRising = Math.random() < 0.75;
    this.vy = (isRising ? -(0.05 + Math.random() * 0.10) : (0.03 + Math.random() * 0.07)) * this.speedMult;

    // Ondulación horizontal compuesta (dos ondas senoidales para oscilación orgánica)
    this.freqX1 = 0.0006 + Math.random() * 0.0008;
    this.ampX1 = (14 + Math.random() * 22) * this.speedMult;
    this.phaseX1 = Math.random() * Math.PI * 2;

    this.freqX2 = 0.0015 + Math.random() * 0.0010;
    this.ampX2 = (4 + Math.random() * 8) * this.speedMult;
    this.phaseX2 = Math.random() * Math.PI * 2;

    // Centelleo / fluctuación de luz al girar en el aire
    this.shimmerFreq = 0.0018 + Math.random() * 0.0025;
    this.shimmerPhase = Math.random() * Math.PI * 2;
    this.shimmerDepth = 0.30 + Math.random() * 0.35;

    // Perturbación física externa (brisa del ratón)
    this.pushVx = 0;
    this.pushVy = 0;
  }

  /**
   * Actualiza la posición y física de la mota.
   */
  update(time, dt, width, height, mouseState) {
    this.w = width;
    this.h = height;

    const timeScale = dt / 16.67;

    // 1. Deriva vertical
    this.baseY += this.vy * timeScale;

    // 2. Ondulación horizontal sinusoidal compuesta
    const swayX = Math.sin(time * this.freqX1 + this.phaseX1) * this.ampX1
                + Math.cos(time * this.freqX2 + this.phaseX2) * this.ampX2;

    this.x = this.baseX + swayX + this.pushVx;
    this.y = this.baseY + this.pushVy;

    // 3. Brisa generada por el movimiento del puntero
    if (mouseState && mouseState.active) {
      const dx = this.x - mouseState.x;
      const dy = this.y - mouseState.y;
      const distSq = dx * dx + dy * dy;
      const maxDist = 120;

      if (distSq < maxDist * maxDist && distSq > 9) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / maxDist) * 0.40;
        const normX = dx / dist;
        const normY = dy / dist;

        this.pushVx += (normX * force + mouseState.vx * 0.06) * this.speedMult;
        this.pushVy += (normY * force + mouseState.vy * 0.06) * this.speedMult;
      }
    }

    // Amortiguación de la perturbación del aire (fricción ambiental)
    this.pushVx *= Math.pow(0.93, timeScale);
    this.pushVy *= Math.pow(0.93, timeScale);

    // Limitador de velocidad de desplazamiento
    const maxPush = 2.0;
    this.pushVx = Math.max(-maxPush, Math.min(maxPush, this.pushVx));
    this.pushVy = Math.max(-maxPush, Math.min(maxPush, this.pushVy));

    // 4. Ciclo de pantalla continuo con reaparición suave
    const margin = 30;
    if (this.vy < 0 && this.y < -margin) {
      this.reset(width, height, false);
      this.baseY = height + 10;
      this.y = this.baseY;
    } else if (this.vy > 0 && this.y > height + margin) {
      this.reset(width, height, false);
      this.baseY = -10;
      this.y = this.baseY;
    }

    if (this.baseX < -margin) {
      this.baseX = width + margin;
    } else if (this.baseX > width + margin) {
      this.baseX = -margin;
    }
  }

  /**
   * Calcula la opacidad instantánea combinando parpadeo y desvanecimiento de bordes.
   */
  getAlpha(time, sceneMultiplier = 1.0) {
    const shimmer = 1 - this.shimmerDepth + this.shimmerDepth * Math.sin(time * this.shimmerFreq + this.shimmerPhase);
    let alpha = this.baseAlpha * shimmer * sceneMultiplier;

    // Atenuación suave en los 4 extremos de pantalla
    const edgeMargin = 45;
    if (this.x < edgeMargin) {
      alpha *= Math.max(0, this.x / edgeMargin);
    } else if (this.x > this.w - edgeMargin) {
      alpha *= Math.max(0, (this.w - this.x) / edgeMargin);
    }

    if (this.y < edgeMargin) {
      alpha *= Math.max(0, this.y / edgeMargin);
    } else if (this.y > this.h - edgeMargin) {
      alpha *= Math.max(0, (this.h - this.y) / edgeMargin);
    }

    return Math.max(0, Math.min(1, alpha));
  }

  /**
   * Dibuja la mota en el contexto 2D de forma altamente optimizada.
   */
  draw(ctx, time, sceneMultiplier = 1.0) {
    const alpha = this.getAlpha(time, sceneMultiplier);
    if (alpha <= 0.005) return;

    if (this.bokeh) {
      // Bokeh de primer plano con doble pase suave sin recrear gradientes en memoria cada frame
      ctx.fillStyle = `rgba(240, 226, 198, ${alpha * 0.45})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 248, 230, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Mota de plano medio o lejano (tono marfil/pergamino cálido)
      ctx.fillStyle = `rgba(240, 228, 205, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export const DustController = {
  canvas: null,
  ctx: null,
  particles: [],
  particleCount: 55,
  enabled: true,
  running: false,
  animId: null,
  lastTime: 0,
  width: 0,
  height: 0,
  dpr: 1,
  sceneMultiplier: 1.0,
  currentScene: null,

  mouseState: {
    x: -999,
    y: -999,
    vx: 0,
    vy: 0,
    lastX: -999,
    lastY: -999,
    active: false,
    lastMoveTime: 0
  },

  /**
   * Inicializa el sistema de motas de polvo.
   */
  init() {
    this.canvas = document.getElementById('dust-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    // Cargar preferencia guardada
    const settings = Storage.getSettings();
    this.enabled = settings.dust !== false;

    this.resize();
    this.initParticles();
    this.bindEvents();

    // Iniciar bucle de animación
    this.start();
  },

  /**
   * Genera el conjunto de partículas distribuido por toda la escena.
   */
  initParticles() {
    this.particles = [];
    const isMobile = window.innerWidth <= 900 || ('ontouchstart' in window);
    const count = isMobile ? 24 : this.particleCount;
    for (let i = 0; i < count; i++) {
      this.particles.push(new DustParticle(this.width, this.height));
    }
  },

  /**
   * Ajusta la resolución del canvas según las dimensiones del viewport y DPR.
   */
  resize() {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    // En móviles o pantallas táctiles, usar DPR 1 para partículas atmosféricas
    // reduce el coste de llenado de GPU en un 75% sin merma estética apreciable
    const isMobile = window.innerWidth <= 900 || ('ontouchstart' in window);
    this.dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = w;
    this.height = h;

    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);

    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  },

  /**
   * Enlaza eventos de redimensionado, visibilidad y movimiento del ratón.
   */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
    });

    // Movimiento del cursor para perturbar el aire suavemente
    const targetEl = document.getElementById('view-game') || document.body;
    targetEl.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });

    // Pausar cuando la pestaña del navegador está oculta para ahorrar recursos
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.running) {
          this._wasRunning = true;
          this.pause();
        }
      } else {
        if (this._wasRunning) {
          this._wasRunning = false;
          this.start();
        }
      }
    });
  },

  onPointerMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.mouseState.lastX !== -999) {
      this.mouseState.vx = (x - this.mouseState.lastX) * 0.35;
      this.mouseState.vy = (y - this.mouseState.lastY) * 0.35;
    }

    this.mouseState.x = x;
    this.mouseState.y = y;
    this.mouseState.lastX = x;
    this.mouseState.lastY = y;
    this.mouseState.active = true;
    this.mouseState.lastMoveTime = performance.now();
  },

  /**
   * Ajusta la atmósfera de polvo según la escena actual.
   * @param {string} sceneId
   */
  setScene(sceneId) {
    this.currentScene = sceneId;

    // En escenas completamente a oscuras (como la sala 3 sin luz), las motas son apenas perceptibles
    if (sceneId === 'bsmnt_01_door_to_03_dark') {
      this.sceneMultiplier = 0.20;
    } else if (sceneId === 'bsmnt_01_painting_v') {
      // Con luz ultravioleta activa, adquieren un tenue realce
      this.sceneMultiplier = 1.25;
    } else if (sceneId === 'bsmnt_01_cryptex' || sceneId === 'bsmnt_01_light_box_panel') {
      // En primeros planos oscuros con puzles frontales, flotan con suavidad sin estorbar
      this.sceneMultiplier = 0.80;
    } else {
      this.sceneMultiplier = 1.0;
    }
  },

  /**
   * Habilita o deshabilita el efecto de motas y guarda la configuración.
   * @param {boolean} isEnabled
   */
  setEnabled(isEnabled) {
    this.enabled = Boolean(isEnabled);

    const settings = Storage.getSettings();
    settings.dust = this.enabled;
    Storage.saveSettings(settings);

    if (!this.enabled && this.ctx && this.width && this.height) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  },

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  },

  /**
   * Inicia el bucle de renderizado.
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();

    const loop = (now) => {
      if (!this.running) return;

      const viewGame = document.getElementById('view-game');
      const isGameActive = viewGame && viewGame.classList.contains('active') && !document.hidden;

      if (isGameActive && this.enabled) {
        const dt = Math.min(50, now - (this.lastTime || now));

        // Decaimiento del movimiento del ratón tras inactividad
        if (this.mouseState.active && (now - this.mouseState.lastMoveTime > 300)) {
          this.mouseState.vx *= 0.85;
          this.mouseState.vy *= 0.85;
          if (now - this.mouseState.lastMoveTime > 900) {
            this.mouseState.active = false;
          }
        }

        this.update(now, dt);
        this.render(now);
      } else if (this.ctx && this.width && this.height) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }

      this.lastTime = now;
      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  },

  /**
   * Pausa el bucle de renderizado.
   */
  pause() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.width && this.height) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  },

  update(time, dt) {
    const w = this.width;
    const h = this.height;
    const count = this.particles.length;

    for (let i = 0; i < count; i++) {
      this.particles[i].update(time, dt, w, h, this.mouseState);
    }
  },

  render(time) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const mult = this.sceneMultiplier;
    const count = this.particles.length;

    for (let i = 0; i < count; i++) {
      this.particles[i].draw(this.ctx, time, mult);
    }
  }
};
