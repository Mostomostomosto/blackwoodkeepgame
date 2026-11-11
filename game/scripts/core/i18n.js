/**
 * Blackwood Keep — Módulo de Internacionalización (i18n)
 * Permite cargar diccionarios de idiomas (es, en, fr) y traducir el DOM dinámicamente.
 * Regla: Todo texto de UI debe pasar por t(clave) o data-i18n="clave".
 */

import { Storage, getSystemLanguage } from './storage.js';

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr'];
const dictionaries = {};
let currentLanguage = 'es';

export const i18n = {
  /**
   * Inicializa el sistema de idiomas cargando la preferencia guardada o el del sistema.
   */
  async init() {
    const settings = Storage.getSettings();
    const systemLang = typeof getSystemLanguage === 'function' ? getSystemLanguage() : 'es';
    const preferredLang = settings.language && SUPPORTED_LANGUAGES.includes(settings.language)
      ? settings.language
      : systemLang;

    await this.setLanguage(preferredLang);
  },

  /**
   * Devuelve el código del idioma activo ('es', 'en', 'fr').
   */
  getCurrentLanguage() {
    return currentLanguage;
  },

  /**
   * Carga el diccionario JSON si aún no está en memoria.
   */
  async loadLanguage(lang) {
    if (dictionaries[lang]) return dictionaries[lang];

    try {
      const response = await fetch(`data/i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar el diccionario data/i18n/${lang}.json (HTTP ${response.status})`);
      }
      const data = await response.json();
      dictionaries[lang] = data;
      return data;
    } catch (err) {
      console.error(`Error cargando idioma [${lang}]:`, err);
      // Fallback a español si falla otro idioma
      if (lang !== 'es') {
        return await this.loadLanguage('es');
      }
      return {};
    }
  },

  /**
   * Cambia el idioma activo, guarda la configuración y actualiza el DOM.
   */
  async setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Idioma no soportado: ${lang}. Usando español.`);
      lang = 'es';
    }

    await this.loadLanguage(lang);
    currentLanguage = lang;

    // Guardar preferencia
    const settings = Storage.getSettings();
    settings.language = lang;
    Storage.saveSettings(settings);

    // Aplicar textos en todo el documento
    this.applyTranslations();

    // Notificar cambio
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  },

  /**
   * Devuelve la traducción para una clave dada.
   */
  t(key, fallback = '') {
    const dict = dictionaries[currentLanguage] || dictionaries['es'] || {};
    if (dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback a español si la clave no existe en el idioma actual
    if (dictionaries['es'] && dictionaries['es'][key] !== undefined) {
      return dictionaries['es'][key];
    }
    return fallback || key;
  },

  /**
   * Aplica traducciones automáticamente a todos los elementos del DOM con atributos data-i18n.
   */
  applyTranslations(root = document) {
    // Texto visible
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // Placeholders
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // Títulos / Tooltips
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // Accesibilidad / Aria
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) {
        el.setAttribute('aria-label', this.t(key));
      }
    });
  }
};

/**
 * Función helper global para conveniencia: t(clave, fallback)
 */
export const t = (key, fallback) => i18n.t(key, fallback);
