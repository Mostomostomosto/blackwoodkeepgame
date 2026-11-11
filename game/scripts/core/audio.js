/**
 * Blackwood Keep — Módulo de Audio
 * Gestiona buses de volumen (Master, Música, Efectos, Ambiente), reproducción con fade in/out
 * y desbloqueo seguro de políticas de autoplay del navegador.
 */

import { Storage } from './storage.js';

class AudioManager {
  constructor() {
    this.volumes = {
      master: 0.8,
      music: 0.75,
      sfx: 0.3,
      ambience: 0.3
    };

    this.musicAudio = null;
    this.currentMusicSrc = null;
    this.ambienceAudio = null;
    this.activeSfx = new Set();
    this.audioUnlocked = false;
    this.pendingMusic = null;
    this._fadeInInterval = null;
    this._fadeOutInterval = null;
    this.isInGameplay = false;
    this._randomPianoTimer = null;

    // Web Audio API para bucles musicales continuos sin silencios ni fisuras (gapless)
    this.audioCtx = null;
    this._webAudioMusicSource = null;
    this._webAudioMusicGain = null;
    this._webAudioPlaying = false;
    this._bufferCache = new Map();

    this._setupAutoplayUnlock();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  init() {
    const settings = Storage.getSettings();
    if (settings.audio) {
      this.volumes = { ...this.volumes, ...settings.audio };
    }
    // Refrescar volumen de elementos en reproducción si no están en fade
    if (this._webAudioMusicGain && this.audioCtx) {
      this._webAudioMusicGain.gain.setValueAtTime(this.getEffectiveVolume('music'), this.audioCtx.currentTime);
    }
    if (this.musicAudio && !this._fadeInInterval && !this._fadeOutInterval) {
      this.musicAudio.volume = this.getEffectiveVolume('music');
    }
    if (this.ambienceAudio) {
      this.ambienceAudio.volume = this.getEffectiveVolume('ambience');
    }
    this.bindGlobalButtonClicks();
  }

  _setupAutoplayUnlock() {
    const unlock = () => {
      this.audioUnlocked = true;
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      if (this.pendingMusic) {
        const { src, loop, fadeInDuration, forceRestart } = this.pendingMusic;
        this.pendingMusic = null;
        this.playMusic(src, loop, fadeInDuration, forceRestart);
      }
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  getEffectiveVolume(channel) {
    const channelVol = this.volumes[channel] !== undefined ? this.volumes[channel] : 1.0;
    const masterVol = this.volumes.master !== undefined ? this.volumes.master : 1.0;
    return Math.max(0, Math.min(1, channelVol * masterVol));
  }

  setVolume(channel, value) {
    const clamped = Math.max(0, Math.min(1, parseFloat(value) || 0));
    this.volumes[channel] = clamped;

    const effMusic = this.getEffectiveVolume('music');
    const effAmbience = this.getEffectiveVolume('ambience');
    const effSfx = this.getEffectiveVolume('sfx');

    // Actualizar música (Web Audio API y elemento HTML5)
    if (channel === 'master' || channel === 'music') {
      if (this.musicAudio && !this._fadeInInterval && !this._fadeOutInterval) {
        this.musicAudio.volume = effMusic;
      }
      if (this._webAudioMusicGain && this.audioCtx) {
        try {
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
          const now = this.audioCtx.currentTime;
          this._webAudioMusicGain.gain.cancelScheduledValues(now);
          this._webAudioMusicGain.gain.setValueAtTime(Math.max(0, effMusic), now);
        } catch (e) {
          try {
            this._webAudioMusicGain.gain.value = Math.max(0, effMusic);
          } catch (e2) {}
        }
      }
    }

    // Actualizar ambiente
    if (channel === 'master' || channel === 'ambience') {
      if (this.ambienceAudio) {
        this.ambienceAudio.volume = effAmbience;
      }
    }

    // Actualizar efectos de sonido activos
    if (channel === 'master' || channel === 'sfx') {
      this.activeSfx.forEach((audio) => {
        try {
          audio.volume = effSfx;
        } catch (e) {}
      });
    }

    // Guardar ajustes
    const settings = Storage.getSettings();
    settings.audio = { ...this.volumes };
    Storage.saveSettings(settings);
  }

  getVolume(channel) {
    return this.volumes[channel] !== undefined ? this.volumes[channel] : 1.0;
  }

  isMusicPlaying() {
    if (this._webAudioPlaying && this.audioCtx && this.audioCtx.state === 'running') {
      return true;
    }
    return Boolean(this.musicAudio && !this.musicAudio.paused);
  }

  /**
   * Reproduce música con bucle continuo sin pausas (gapless) vía Web Audio API o HTML5 Audio.
   */
  async playMusic(src, loop = true, fadeInDuration = 2500, forceRestart = false) {
    if (!src) return;

    if (!forceRestart && this.currentMusicSrc === src && this.isMusicPlaying()) {
      return;
    }

    this.currentMusicSrc = src;
    const targetVolume = this.getEffectiveVolume('music');

    // 1. Intentar reproducción gapless con Web Audio API (evita el retardo/silencio de ~0.5s de los loops de MP3 en móviles)
    const ctx = this.getAudioContext();
    if (ctx) {
      try {
        await this._playWebAudioMusic(src, loop, fadeInDuration, targetVolume);
        return;
      } catch (err) {
        console.warn('[Audio] Fallback a HTML5 Audio:', err.message);
      }
    }

    // 2. Fallback a elemento <audio> HTML5
    this._playHtml5Music(src, loop, fadeInDuration, targetVolume, forceRestart);
  }

  async _playWebAudioMusic(src, loop, fadeInDuration, targetVolume) {
    const ctx = this.getAudioContext();
    if (!ctx) throw new Error('AudioContext no disponible');

    // Detener música previa
    this._stopWebAudioMusic(0);
    this._stopHtml5Music(0);

    // Obtener buffer decodificado de caché o descargarlo
    if (!this._bufferCache) this._bufferCache = new Map();
    let audioBuffer = this._bufferCache.get(src);
    if (!audioBuffer) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this._bufferCache.set(src, audioBuffer);
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;
    if (loop) {
      // Recortar los 0.069s del retraso de codificación de MP3 para un bucle continuo matemáticamente perfecto
      source.loopStart = src.includes('Room_Without_Windows') ? 0.069 : 0;
      source.loopEnd = audioBuffer.duration;
    }

    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    if (fadeInDuration > 0 && targetVolume > 0) {
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetVolume), now + (fadeInDuration / 1000));
    } else {
      gainNode.gain.setValueAtTime(targetVolume, now);
    }

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    this._webAudioMusicSource = source;
    this._webAudioMusicGain = gainNode;
    this._webAudioPlaying = true;

    source.onended = () => {
      if (this._webAudioMusicSource === source) {
        this._webAudioMusicSource = null;
        this._webAudioMusicGain = null;
        this._webAudioPlaying = false;
        this.currentMusicSrc = null;
        this._handleMusicEnded(src);
      }
    };
  }

  _stopWebAudioMusic(fadeOutDuration = 0) {
    if (!this._webAudioMusicSource || !this.audioCtx) return;
    const srcNode = this._webAudioMusicSource;
    const gainNode = this._webAudioMusicGain;
    this._webAudioMusicSource = null;
    this._webAudioMusicGain = null;
    this._webAudioPlaying = false;

    if (fadeOutDuration > 0 && gainNode) {
      const now = this.audioCtx.currentTime;
      const currentGain = Math.max(0.0001, gainNode.gain.value);
      gainNode.gain.setValueAtTime(currentGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (fadeOutDuration / 1000));
      setTimeout(() => {
        try {
          srcNode.stop();
          srcNode.disconnect();
        } catch (e) {}
      }, fadeOutDuration + 60);
    } else {
      try {
        srcNode.stop();
        srcNode.disconnect();
      } catch (e) {}
    }
  }

  _playHtml5Music(src, loop, fadeInDuration, targetVolume, forceRestart) {
    if (this._fadeInInterval) {
      clearInterval(this._fadeInInterval);
      this._fadeInInterval = null;
    }
    this._stopHtml5Music(0);

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = fadeInDuration > 0 ? 0 : targetVolume;
    this.musicAudio = audio;

    audio.addEventListener('ended', () => {
      if (!audio.loop) {
        if (this.musicAudio === audio) {
          this.musicAudio = null;
          this.currentMusicSrc = null;
        }
        this._handleMusicEnded(src);
      }
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.pendingMusic = null;
        if (fadeInDuration > 0 && targetVolume > 0) {
          this._fadeIn(audio, targetVolume, fadeInDuration);
        } else {
          audio.volume = targetVolume;
        }
      }).catch((err) => {
        console.warn('[Audio] Autoplay pospuesto por el navegador:', err.message);
        this.pendingMusic = { src, loop, fadeInDuration, forceRestart };
      });
    }
  }

  _stopHtml5Music(fadeOutDuration = 0) {
    if (this._fadeInInterval) {
      clearInterval(this._fadeInInterval);
      this._fadeInInterval = null;
    }

    if (!this.musicAudio) return;

    const audio = this.musicAudio;
    this.musicAudio = null;

    if (fadeOutDuration <= 0) {
      if (this._fadeOutInterval) {
        clearInterval(this._fadeOutInterval);
        this._fadeOutInterval = null;
      }
      audio.pause();
      return;
    }

    const startVol = audio.volume;
    const stepTime = 50;
    const totalSteps = Math.max(1, Math.round(fadeOutDuration / stepTime));
    const volStep = startVol / totalSteps;
    let currentVol = startVol;

    if (this._fadeOutInterval) {
      clearInterval(this._fadeOutInterval);
      this._fadeOutInterval = null;
    }

    this._fadeOutInterval = setInterval(() => {
      currentVol = Math.max(0, currentVol - volStep);
      if (audio) {
        audio.volume = currentVol;
      }
      if (currentVol <= 0 || !audio) {
        clearInterval(this._fadeOutInterval);
        this._fadeOutInterval = null;
        if (audio) {
          audio.pause();
        }
      }
    }, stepTime);
  }

  _fadeIn(audio, targetVol, duration) {
    if (this._fadeInInterval) {
      clearInterval(this._fadeInInterval);
      this._fadeInInterval = null;
    }
    if (duration <= 0 || targetVol <= 0) {
      if (audio) {
        audio.volume = Math.min(this.getEffectiveVolume('music'), targetVol);
      }
      return;
    }

    const stepTime = 50;
    const totalSteps = Math.max(1, Math.round(duration / stepTime));
    const volStep = targetVol / totalSteps;
    let currentVol = 0;

    this._fadeInInterval = setInterval(() => {
      if (!audio || this.musicAudio !== audio) {
        clearInterval(this._fadeInInterval);
        this._fadeInInterval = null;
        return;
      }

      currentVol = Math.min(targetVol, currentVol + volStep);
      audio.volume = Math.min(this.getEffectiveVolume('music'), currentVol);

      if (currentVol >= targetVol) {
        clearInterval(this._fadeInInterval);
        this._fadeInInterval = null;
      }
    }, stepTime);
  }

  stopMusic(fadeOutDuration = 0) {
    this._stopWebAudioMusic(fadeOutDuration);
    this._stopHtml5Music(fadeOutDuration);
    this.currentMusicSrc = null;
  }

  pauseMusic() {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend().catch(() => {});
    }
    if (this.musicAudio && !this.musicAudio.paused) {
      this.musicAudio.pause();
    }
  }

  resumeMusic() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    if (this.musicAudio && this.musicAudio.paused) {
      this.musicAudio.play().catch(() => {});
    }
  }

  playAmbience(src, loop = true) {
    if (!src) return;
    if (this.ambienceAudio) {
      this.ambienceAudio.pause();
      this.ambienceAudio = null;
    }

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = this.getEffectiveVolume('ambience');
    this.ambienceAudio = audio;

    audio.play().catch((err) => {
      console.warn('[Audio] Autoplay de ambiente en espera de interacción:', err.message);
    });
  }

  stopAmbience() {
    if (this.ambienceAudio) {
      this.ambienceAudio.pause();
      this.ambienceAudio = null;
    }
  }

  pauseAmbience() {
    if (this.ambienceAudio && !this.ambienceAudio.paused) {
      this.ambienceAudio.pause();
    }
  }

  resumeAmbience() {
    if (this.ambienceAudio && this.ambienceAudio.paused) {
      this.ambienceAudio.play().catch(() => {});
    }
  }

  /**
   * Reproduce la melodía de piano (piano.mp3: 8 compases a 60bpm) una sola vez (sin bucle).
   */
  playPianoMelody(forceRestart = false) {
    const src = 'assets/audio/music/piano.mp3';
    console.log('[Music] 🎹 Solicitud de melodía de piano:', { src, forceRestart, currentSrc: this.currentMusicSrc });

    // Si ya está sonando y no se fuerza reinicio, permitir que termine
    if (!forceRestart && this.currentMusicSrc === src && this.musicAudio && !this.musicAudio.paused) {
      console.log('[Music] 🎹 Melodía ya en reproducción, omitiendo.');
      return;
    }
    // Cancelar cualquier temporizador aleatorio en curso
    if (this._randomPianoTimer) {
      clearTimeout(this._randomPianoTimer);
      this._randomPianoTimer = null;
    }
    // Reproducir sin bucle con volumen directo para sonido nítido e inmediato
    this.playMusic(src, false, 0, forceRestart);
  }

  /**
   * Inicia el paisaje sonoro de gameplay (música Room_Without_Windows en bucle sin ambiente).
   */
  startGameplayAudio() {
    this.isInGameplay = true;
    this.stopAmbience();
    if (this._randomPianoTimer) {
      clearTimeout(this._randomPianoTimer);
      this._randomPianoTimer = null;
    }
    this.playMusic('assets/audio/music/Room_Without_Windows.mp3', true, 2000);
  }

  /**
   * Detiene el audio de gameplay (al volver al menú principal).
   */
  stopGameplayAudio() {
    this.isInGameplay = false;
    this.stopAmbience();
    if (this._randomPianoTimer) {
      clearTimeout(this._randomPianoTimer);
      this._randomPianoTimer = null;
    }
    this.stopMusic(1000);
  }

  /**
   * Programa la siguiente reproducción aleatoria de piano (desactivado: música continua).
   */
  scheduleRandomPiano() {
    if (this._randomPianoTimer) {
      clearTimeout(this._randomPianoTimer);
      this._randomPianoTimer = null;
    }
  }

  _handleMusicEnded(src) {
    if (src && src.includes('Room_Without_Windows.mp3') && this.isInGameplay) {
      this.playMusic('assets/audio/music/Room_Without_Windows.mp3', true, 0);
    }
  }

  playSfx(src) {
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = this.getEffectiveVolume('sfx');
    this.activeSfx.add(audio);

    audio.addEventListener('ended', () => {
      this.activeSfx.delete(audio);
    });

    audio.play().catch((err) => {
      this.activeSfx.delete(audio);
      console.warn('No se pudo reproducir SFX:', err.message);
    });
  }

  /**
   * Reproduce el sonido de clic de interfaz para botones (assets/audio/sfx/click.mp3).
   * Incluye limitador de frecuencia (60ms) para evitar duplicación accidental.
   */
  playClick() {
    const now = Date.now();
    if (this._lastClickTime && now - this._lastClickTime < 60) {
      return;
    }
    this._lastClickTime = now;
    this.playSfx('assets/audio/sfx/click.mp3');
  }

  /**
   * Vincula la reproducción global de clic en botones de la interfaz de usuario.
   */
  bindGlobalButtonClicks() {
    if (this._hasBoundButtonClicks) return;
    this._hasBoundButtonClicks = true;

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, [role="button"], .menu-btn, .modal-btn, .final-btn, .nav-edge');
      if (!btn || btn.disabled || btn.classList.contains('disabled')) return;

      // Excluir elementos con efectos sonoros específicos dedicados
      if (
        btn.id === 'btn-docs-toggle' ||
        btn.id === 'btn-close-notebook' ||
        btn.id === 'btn-game-options' ||
        btn.id === 'btn-options-back' ||
        btn.id === 'btn-options' ||
        btn.classList.contains('btn-turn-prev') ||
        btn.classList.contains('btn-turn-next') ||
        btn.classList.contains('lightbox-pin-btn') ||
        btn.classList.contains('scene-hotspot') ||
        btn.closest('.stf__block')
      ) {
        return;
      }

      this.playClick();
    }, true);
  }
}

export const AudioController = new AudioManager();
