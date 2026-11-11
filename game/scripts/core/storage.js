/**
 * Blackwood Keep — Módulo de Persistencia y Almacenamiento Local
 * Gestiona el guardado de partida y las configuraciones de usuario en localStorage.
 */

const SAVE_KEY = 'blackwood_keep_save';
const SETTINGS_KEY = 'blackwood_keep_settings';

/**
 * Rutas anteriores a la reestructuración de carpetas (inventario y documentos por nivel).
 * Se reescriben al cargar partidas guardadas antiguas.
 */
const LEGACY_ASSET_PATHS = [
  ['assets/inventory/icons/', 'assets/levels/level_01_bsmnt/items/icons/'],
  ['assets/inventory/closeups/', 'assets/levels/level_01_bsmnt/items/closeups/'],
  ['assets/docs/', 'assets/levels/level_01_bsmnt/docs/'],
  ['assets/levels/level_01_bsmnt/overlays/puzzle_01_01.webp', 'assets/levels/level_01_bsmnt/puzzles/trunk/puzzle_01_01.webp']
];

export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr'];

/**
 * Detecta el idioma del sistema o navegador, con fallback a 'es'.
 */
export function getSystemLanguage() {
  try {
    const navLang = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || '';
    const prefix = navLang.toLowerCase().slice(0, 2);
    if (SUPPORTED_LANGUAGES.includes(prefix)) {
      return prefix;
    }
  } catch (e) {
    // Entorno sin acceso a navigator
  }
  return 'es';
}

/**
 * Devuelve la configuración por defecto del juego:
 * - Volumen General: 80% (0.8)
 * - Música: 75% (0.75)
 * - Efectos: 30% (0.3)
 * - Ambiente: 30% (0.3)
 * - Idioma: El del sistema (o 'es' por defecto)
 * - Motas de polvo: Siempre activadas (true)
 */
export function getDefaultSettings() {
  return {
    language: getSystemLanguage(),
    dust: true,
    audio: {
      master: 0.8,
      music: 0.75,
      sfx: 0.3,
      ambience: 0.3
    }
  };
}

export const DEFAULT_SETTINGS = {
  language: 'es',
  dust: true,
  audio: {
    master: 0.8,
    music: 0.75,
    sfx: 0.3,
    ambience: 0.3
  }
};

export const CLARA_INITIAL_ENTRY = {
  id: 'clara_journal_01',
  title: '23 de octubre de 1931',
  badge: '✦ DIARIO DE CLARA ✦',
  text: 'Llegada a Blackwood Keep tras un trayecto interminable desde Arkham. La tormenta ha empeorado en la última media hora del camino; el cochero se negó a acercarse más allá del puente y tuve que cruzar a pie, con el equipaje pegado al cuerpo para que el viento no me lo arrancara de las manos.\n\nLa casa es mayor de lo que las fotografías del encargo dejaban intuir. Un caserón victoriano, aislado, sin un alma a la vista salvo una única ventana iluminada en el piso superior. Llamé a la puerta principal tres veces, quizá cuatro, luchando por hacerme oír por encima de la lluvia.\n\nRecuerdo el sonido del pestillo cediendo.\n\nDespués de eso, nada. No sabría decir cuánto tiempo ha pasado.',
  date: 'Mansión Blackwood',
  isJournal: true
};

export const PHOTO_JULIAN_SHIP_ENTRY = {
  id: 'photo_julian_ship',
  title: 'Fotografía: Julian y el "Providence"',
  badge: '✦ NOTA DE INVESTIGACIÓN ✦',
  image: 'assets/levels/level_01_bsmnt/puzzles/trunk/puzzle_01_01.webp',
  imageCaption: '🔍 Clic para ampliar fotografía',
  text: 'Fotografía rescatada de la tapa del baúl. Muestra a Julian Blackwood en el muelle frente a su buque pesquero. En el casco de la embarcación se distingue claramente el nombre rotulado: "PROVIDENCE".',
  date: 'Descubierto en el baúl del sótano'
};

export const Storage = {
  getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const defaults = getDefaultSettings();
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        dust: true, // Motas de polvo activadas siempre
        audio: { ...defaults.audio, ...(parsed.audio || {}) }
      };
    } catch (e) {
      console.warn('Error al leer configuraciones de localStorage:', e);
      return getDefaultSettings();
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error al guardar configuraciones:', e);
    }
  },

  resetSettingsToDefault() {
    const defaults = getDefaultSettings();
    this.saveSettings(defaults);
    return defaults;
  },

  hasSaveGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Boolean(data && data.level && data.scene);
    } catch (e) {
      return false;
    }
  },

  getSaveGame() {
    try {
      let raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      // Partidas antiguas guardan rutas de iconos/closeups/documentos previas a la reestructuración de carpetas
      const legacyRaw = raw;
      for (const [oldPath, newPath] of LEGACY_ASSET_PATHS) {
        raw = raw.split(oldPath).join(newPath);
      }
      // Iconos, closeups y documentos pasaron de PNG a WebP en la optimización de imágenes
      raw = raw.replace(/(assets\/levels\/level_01_bsmnt\/(?:items\/(?:icons|closeups)|docs)\/[^"\\]+?)\.png/g, '$1.webp');
      const data = JSON.parse(raw);
      let migrated = raw !== legacyRaw;
      if (!data.level || data.level === 'level_01_sotano') {
        data.level = 'level_01_bsmnt';
        migrated = true;
      }
      if (!data.scene || data.scene === 'L1_S01_main') {
        data.scene = 'bsmnt_01_main';
        migrated = true;
      }
      if (!Array.isArray(data.diary)) {
        data.diary = [];
        migrated = true;
      }
      // Garantizar que la primera entrada sea la anotación de llegada de Clara
      if (!data.diary.some(d => d.id === 'clara_journal_01')) {
        data.diary.unshift({ ...CLARA_INITIAL_ENTRY });
        migrated = true;
      }
      // La fotografía de Julian sólo se adquiere al resolver el puzzle del baúl
      const isTrunkSolved = Boolean(data.puzzleFlags && (data.puzzleFlags.baul_resuelto || data.puzzleFlags.trunk_open || data.puzzleFlags.baul_abierto));
      if (!isTrunkSolved && data.diary.some(d => d.id === 'photo_julian_ship')) {
        data.diary = data.diary.filter(d => d.id !== 'photo_julian_ship');
        migrated = true;
      } else if (isTrunkSolved && !data.diary.some(d => d.id === 'photo_julian_ship')) {
        data.diary.push({ ...PHOTO_JULIAN_SHIP_ENTRY });
        migrated = true;
      }
      const existingShipEntry = data.diary.find(d => d.id === 'photo_julian_ship');
      if (existingShipEntry && (existingShipEntry.text?.includes('TENTACLE') || existingShipEntry.title?.includes('Tentacle'))) {
        existingShipEntry.title = PHOTO_JULIAN_SHIP_ENTRY.title;
        existingShipEntry.text = PHOTO_JULIAN_SHIP_ENTRY.text;
        migrated = true;
      }
      if (migrated) {
        this.setSaveGame(data);
      }
      return data;
    } catch (e) {
      console.error('Error al recuperar partida:', e);
      return null;
    }
  },

  setSaveGame(gameState) {
    try {
      this.updatePlayTime(gameState);
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Error al guardar partida:', e);
    }
  },

  /**
   * Actualiza los segundos de juego acumulados en la partida activa.
   */
  updatePlayTime(state = null) {
    const s = state || this.getSaveGame();
    if (!s) return;
    const now = Date.now();
    if (this._sessionStartTime) {
      const deltaSec = Math.max(0, Math.floor((now - this._sessionStartTime) / 1000));
      s.timePlayedSeconds = (s.timePlayedSeconds || 0) + deltaSec;
      this._sessionStartTime = now;
    }
    if (state) {
      state.timePlayedSeconds = s.timePlayedSeconds;
    }
  },

  /**
   * Inicia el cómputo de tiempo de la sesión actual.
   */
  startSessionTimer() {
    this._sessionStartTime = Date.now();
  },

  /**
   * Obtiene los segundos totales jugados en la partida actual.
   */
  getTotalPlayTimeSeconds() {
    const s = this.getSaveGame();
    if (!s) return 0;
    let total = s.timePlayedSeconds || 0;
    if (this._sessionStartTime) {
      const deltaSec = Math.max(0, Math.floor((Date.now() - this._sessionStartTime) / 1000));
      total += deltaSec;
    }
    return total;
  },

  clearSaveGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error('Error al eliminar partida:', e);
    }
  },

  createNewGame() {
    try {
      localStorage.removeItem('blackwood_keep_nav_hint_seen');
      localStorage.removeItem('blackwood_interactive_tutorial_completed');
    } catch (e) {
      // Ignorar restricciones locales
    }

    this.startSessionTimer();

    const initialState = {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timePlayedSeconds: 0,
      level: 'level_01_bsmnt',
      scene: 'bsmnt_01_main',
      inventory: [],
      diary: [
        { ...CLARA_INITIAL_ENTRY }
      ],
      puzzleFlags: {}
    };
    this.setSaveGame(initialState);
    return initialState;
  }
};
