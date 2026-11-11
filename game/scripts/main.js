/**
 * Blackwood Keep — Punto de Entrada Principal (Main)
 * Inicializa los módulos de persistencia, audio, internacionalización y menú.
 */

import { AudioController } from './core/audio.js';
import { i18n } from './core/i18n.js';
import { MainMenu } from './core/menu.js';
import { Loader } from './core/loader.js';
import { SceneManager } from './core/scene.js';
import { InventoryManager } from './core/inventory.js';
import { DiaryManager } from './core/diary.js';
import { TrunkPuzzle } from './puzzles/trunk_puzzle.js';
import { CryptexPuzzle } from './puzzles/cryptex_puzzle.js';
import { LightBoxWiresPuzzle } from './puzzles/light_box_wires_puzzle.js';
import { ProvidencePuzzle } from './puzzles/providence_puzzle.js';
import { DustController } from './core/dust.js';
import { FinalScreenManager } from './core/final_screen.js';
import { Storage } from './core/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando Blackwood Keep...');

  // 1. Inicializar sistema de audio y reproducir tema musical con fade in
  AudioController.init();
  AudioController.playMusic('assets/audio/music/bk_theme.mp3', true, 2800);

  // 2. Cargar idioma preferido y traducir interfaz
  await i18n.init();

  // 3. Inicializar controladores de interfaz, inventario, diario, puzzle, escena y partículas
  Loader.init();
  MainMenu.init();
  SceneManager.init();
  InventoryManager.init();
  DiaryManager.init();
  TrunkPuzzle.init();
  CryptexPuzzle.init();
  LightBoxWiresPuzzle.init();
  ProvidencePuzzle.init();
  DustController.init();
  FinalScreenManager.init();

  window.Storage = Storage;
  window.MainMenu = MainMenu;
  window.i18n = i18n;
  window.Loader = Loader;
  window.AudioController = AudioController;
  window.SceneManager = SceneManager;
  window.InventoryManager = InventoryManager;
  window.DiaryManager = DiaryManager;
  window.TrunkPuzzle = TrunkPuzzle;
  window.CryptexPuzzle = CryptexPuzzle;
  window.LightBoxWiresPuzzle = LightBoxWiresPuzzle;
  window.ProvidencePuzzle = ProvidencePuzzle;
  window.FinalScreenManager = FinalScreenManager;
  window.DustController = DustController;
  window.toggleDust = () => DustController.toggle();
  window.showFinalScreen = () => FinalScreenManager.show();
  window.solveProvidence = () => window.ProvidencePuzzle?.solve();
  window.resetProvidence = () => window.ProvidencePuzzle?.reset();
  window.giveLockerKey = () => window.gameDebug?.giveLockerKey();
  window.resetLockerKey = () => window.gameDebug?.resetLockerKey();
  window.unlockLocker = () => window.gameDebug?.unlockLocker();
  window.resetLocker = () => window.gameDebug?.resetLocker();
  window.goToNiche = () => window.SceneManager?.navigateTo('bsmnt_03_niche');
  window.goToNicheCloseup = () => window.SceneManager?.navigateTo('bsmnt_03_niche_closeup');
  window.playFinalDoorVideo = () => window.SceneManager?.playCinematicVideo('assets/levels/level_01_bsmnt/video/final_door.mp4');
  window.solvePlates = () => window.gameDebug?.solvePlates();
  window.givePlates = () => window.gameDebug?.givePlates();
  window.resetPlates = () => window.gameDebug?.resetPlates();
  window.resetNichePlates = () => window.gameDebug?.resetNichePlates();
  window.prepareFinalNiche = () => {
    // 1. Desbloquear puerta 03 y acceso a la sala de la hornacina
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.door_03_unlocked = true;
    s.puzzleFlags.has_key_door_03 = true;
    delete s.puzzleFlags.niche_plates_placed;
    delete s.puzzleFlags.final_door_open;

    // 2. Colocar las placas resueltas en el inventario listas para colocar
    s.puzzleFlags.plates_solved = true;
    s.puzzleFlags.plates_state = {
      1: { slot: 3, rotation: 180 },
      2: { slot: 2, rotation: 90 },
      3: { slot: 1, rotation: 180 },
      4: { slot: 4, rotation: 0 }
    };
    s.puzzleFlags.plates_slots = { 1: 3, 2: 2, 3: 1, 4: 4 };
    s.puzzleFlags.plates_rotations = { 1: 180, 2: 90, 3: 180, 4: 0 };
    s.puzzleFlags.slots_plates = { 3: 1, 2: 2, 1: 3, 4: 4 };

    if (!Array.isArray(s.inventory)) s.inventory = [];
    if (!s.inventory.some(i => i.id === 'plates' || i.id === 'bsmnt_plates')) {
      s.inventory.push({
        id: 'plates',
        name: 'Placas de bronce',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
        interactiveCloseup: 'plates_grid'
      });
    }

    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();

    // 3. Quitar overlay existente si lo hubiera y viajar al primer plano de la hornacina
    const overlay = document.getElementById('overlay-niche-plates');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);

    if (window.SceneManager) {
      window.SceneManager.navigateTo('bsmnt_03_niche_closeup');
    }

    console.log('%c🎯 Listo: Estás frente a la hornacina con las placas preparadas en el inventario. Arrástralas a la hornacina para ver toda la secuencia.', 'color: #10b981; font-weight: bold;');
  };
  window.playPiano = () => window.AudioController?.playPianoMelody(true);
  window.resetMusicMilestones = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.music_first_scene_change;
      delete s.puzzleFlags.music_room_02_first_visit;
      delete s.puzzleFlags.music_room_03_first_visit;
      delete s.puzzleFlags.music_niche_first_seen;
    }
    Storage.setSaveGame(s);
    console.log('🎵 Hitos musicales reseteados.');
  };

  // 4. Controlador de Pantalla de Inicio (Splash Screen con Logo)
  const splashScreen = document.getElementById('view-splash');
  const viewMenu = document.getElementById('view-menu');

  const dismissSplash = () => {
    if (!splashScreen || splashScreen.dataset.dismissed === 'true') return;
    splashScreen.dataset.dismissed = 'true';

    // Activar menú principal
    if (viewMenu) {
      viewMenu.classList.add('active');
    }

    // Fundido de salida suave hacia el menú
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
      splashScreen.classList.remove('active');
      splashScreen.style.display = 'none';
    }, 650);
  };

  if (splashScreen) {
    // Mantener la pantalla en negro y el logo durante ~1.5 segundos (1500ms)
    const splashTimer = setTimeout(dismissSplash, 1500);

    // Omitir si el usuario hace clic o presiona una tecla
    splashScreen.addEventListener('click', () => {
      clearTimeout(splashTimer);
      dismissSplash();
    });

    window.addEventListener('keydown', (e) => {
      if (splashScreen.dataset.dismissed !== 'true' && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) {
        clearTimeout(splashTimer);
        dismissSplash();
      }
    }, { once: true });
  }

  // Método de consola para probar o reproducir el splash screen
  window.showSplash = () => {
    if (!splashScreen) return;
    splashScreen.dataset.dismissed = 'false';
    splashScreen.style.display = 'flex';
    splashScreen.classList.remove('fade-out');
    splashScreen.classList.add('active');
    setTimeout(dismissSplash, 1500);
  };

  // Comando de consola para cerrar la caja y devolver el martillo al inventario
  window.resetChest = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.chest_open;
      delete s.puzzleFlags.med_chest_box_open;
      delete s.puzzleFlags.has_chest_opened;
      delete s.puzzleFlags.hammer_used;
      delete s.puzzleFlags.bulb_picked;
      delete s.puzzleFlags.has_bulb;
      delete s.puzzleFlags.wires_picked;
      delete s.puzzleFlags.has_wires;
    }
    if (!Array.isArray(s.inventory)) s.inventory = [];
    s.inventory = s.inventory.filter(i => i.id !== 'bulb' && i.id !== 'bsmnt_bulb' && i.id !== 'wires' && i.id !== 'bsmnt_wires');
    if (!s.inventory.some(i => i.id === 'hammer')) {
      s.inventory.push({
        id: 'hammer',
        name: 'Martillo sacaclavos',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_hammer.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_hammer.webp'
      });
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_01_chest_close_up');
    console.log('✅ Caja cerrada, martillo restaurado, bombilla y cables reseteados.');
  };

  // Comando de consola para colocar de nuevo los tablones en la puerta y devolver la barra de uña al inventario
  window.resetDoorPlanks = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.door_planks_pried;
      delete s.puzzleFlags.planks_removed;
      delete s.puzzleFlags.crowbar_used;
      s.puzzleFlags.crowbar_picked = true;
      s.puzzleFlags.has_crowbar = true;
    }
    if (!Array.isArray(s.inventory)) s.inventory = [];
    if (!s.inventory.some(i => i.id === 'crowbar' || i.id === 'bsmnt_crowbar' || i.id === 'palanca')) {
      s.inventory.push({
        id: 'crowbar',
        name: 'Palanca',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_crowbar.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_crowbar.webp'
      });
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) {
      window.InventoryManager.selectedItemId = null;
      window.InventoryManager.render();
    }
    if (window.SceneManager) {
      window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_03_door_to_locker_room');
    }
    console.log('✅ Tablones colocados de nuevo en la puerta y barra de uña en el inventario.');
  };

  // Comando de consola para devolver la bombilla al cajón abierto
  window.resetBulb = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.bulb_picked;
      delete s.puzzleFlags.has_bulb;
    }
    if (Array.isArray(s.inventory)) {
      s.inventory = s.inventory.filter(i => i.id !== 'bulb' && i.id !== 'bsmnt_bulb');
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_01_chest_close_up_open');
    console.log('✅ Bombilla devuelta al cajón abierto.');
  };

  // Comando de consola para retirar la tubería de la pared y ponerla en el inventario
  window.takePipe = () => {
    if (window.gameDebug?.takePipe) return window.gameDebug.takePipe();
  };

  // Comando de consola para acoplar la tubería en la pared
  window.placePipe = () => {
    if (window.gameDebug?.placePipe) return window.gameDebug.placePipe();
  };

  // Comando de consola para devolver los cables al cajón abierto
  window.resetWires = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.wires_picked;
      delete s.puzzleFlags.has_wires;
    }
    if (Array.isArray(s.inventory)) {
      s.inventory = s.inventory.filter(i => i.id !== 'wires' && i.id !== 'bsmnt_wires');
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_01_chest_close_up_open');
    console.log('✅ Cables devueltos al cajón abierto.');
  };

  // Comando de consola para resetear el criptex y bloquear de nuevo la puerta
  window.resetCryptex = () => {
    if (window.CryptexPuzzle) {
      window.CryptexPuzzle.reset();
    }
    if (window.SceneManager) {
      window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_01_cryptex');
    }
    console.log('✅ Criptex reseteado a combinación inicial (Z) y puerta bloqueada.');
  };

  // Comando de consola para resolver instantáneamente el criptex con la palabra ALHAZRED
  window.solveCryptex = () => {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.cryptex_solved = true;
    s.puzzleFlags.door_02_unlocked = true;
    s.puzzleFlags.cryptex_state = [0, 11, 4, 0, 6, 8, 10, 2]; // ALHAZRED
    Storage.setSaveGame(s);
    if (window.CryptexPuzzle) {
      window.CryptexPuzzle.isSolved = true;
      window.CryptexPuzzle.state = [0, 11, 4, 0, 6, 8, 10, 2];
      window.CryptexPuzzle.steps = [12, 11, 4, 12, 6, 8, 10, 2];
    }
    console.log('✅ Criptex resuelto con la palabra ALHAZRED (puerta a Sala 2 desbloqueada).');
  };

  // Comando de consola para resetear el cuadro y devolver la bombilla al inventario (o al cajón)
  window.resetPainting = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.bulb_in_painting_lamp;
      delete s.puzzleFlags.painting_uv_active;
      delete s.puzzleFlags.bulb_used;
    }
    if (s.puzzleFlags?.bulb_picked || s.puzzleFlags?.has_bulb) {
      if (Array.isArray(s.inventory) && !s.inventory.some(i => i.id === 'bulb')) {
        s.inventory.push({
          id: 'bulb',
          name: 'Bombilla',
          icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_bulb.webp',
          closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_bulb.webp'
        });
      }
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_01_painting');
    console.log('✅ Cuadro reseteado a estado inicial apagado (bombilla devuelta al inventario).');
  };

  // Comando de consola para resetear el cuadro de luces y cerrar su puerta
  window.resetLightBox = () => {
    if (window.LightBoxWiresPuzzle) {
      window.LightBoxWiresPuzzle.reset();
    }
    const s = Storage.getSaveGame();
    if (s && s.puzzleFlags) {
      delete s.puzzleFlags.light_box_wires_solved;
      delete s.puzzleFlags.light_box_open;
      delete s.puzzleFlags.wires_placed_on_panel;
      delete s.puzzleFlags.wires_used;
      s.puzzleFlags.wires_picked = true;
      s.puzzleFlags.has_wires = true;
      if (!Array.isArray(s.inventory)) s.inventory = [];
      if (!s.inventory.some(i => i.id === 'wires' || i.id === 'bsmnt_wires')) {
        s.inventory.push({
          id: 'wires',
          name: 'Cables',
          icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wires.webp',
          closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wires.webp'
        });
      }
      Storage.setSaveGame(s);
    }
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s?.level || 'level_01_bsmnt', 'bsmnt_01_light_box');
    console.log('✅ Cuadro de luces reseteado (cerrado y cables devueltos al inventario).');
  };

  // Comando de consola para resolver instantáneamente el cuadro de luces
  window.solveLightBox = () => {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.wires_placed_on_panel = true;
    s.puzzleFlags.light_box_wires_solved = true;
    s.puzzleFlags.light_box_open = true;
    Storage.setSaveGame(s);
    if (window.LightBoxWiresPuzzle) {
      window.LightBoxWiresPuzzle.solve();
    }
    if (window.SceneManager && window.SceneManager.currentScene === 'bsmnt_01_light_box') {
      window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_01_light_box');
    }
    console.log('✅ Cuadro de luces resuelto y puerta abierta.');
  };

  // Comando de consola para dar cables al inventario
  window.giveWires = () => {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.wires_picked = true;
    s.puzzleFlags.has_wires = true;
    if (!Array.isArray(s.inventory)) s.inventory = [];
    if (!s.inventory.some(i => i.id === 'wires')) {
      s.inventory.push({
        id: 'wires',
        name: 'Cables',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wires.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wires.webp'
      });
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    console.log('🔌 Cables añadidos al inventario.');
  };

  // Comando de consola para resetear la llave del candado y el estado del candado
  window.resetKeyPadlock = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.key_padlock_picked;
      delete s.puzzleFlags.has_key_padlock;
      delete s.puzzleFlags.padlock_unlocked;
      delete s.puzzleFlags.has_padlock_unlocked;
      delete s.puzzleFlags.key_padlock_used;
    }
    if (Array.isArray(s.inventory)) {
      s.inventory = s.inventory.filter(i => i.id !== 'key_padlock' && i.id !== 'bsmnt_key_to_padlock');
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_02_boxes');
    console.log('✅ Llave del candado reseteada y devuelta a las cajas.');
  };

  // Comando de consola para devolver la llave inglesa a la caja
  window.resetWrench = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.wrench_picked;
      delete s.puzzleFlags.has_wrench;
    }
    if (Array.isArray(s.inventory)) {
      s.inventory = s.inventory.filter(i => i.id !== 'wrench' && i.id !== 'bsmnt_wrench' && i.id !== 'llave_inglesa');
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_01_wrech_box');
    console.log('✅ Llave inglesa devuelta a la caja de herramientas.');
  };

  // Comando de consola para restaurar la rueda en la silla de ruedas y devolver la llave inglesa
  window.resetWheelchairWheel = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.wheelchair_wheel_detached;
      delete s.puzzleFlags.wheel_picked;
      delete s.puzzleFlags.has_wheel;
      delete s.puzzleFlags.wrench_used;
      s.puzzleFlags.has_wrench = true;
    }
    if (Array.isArray(s.inventory)) {
      s.inventory = s.inventory.filter(i => i.id !== 'wheel' && i.id !== 'bsmnt_wheel' && i.id !== 'rueda');
      if (!s.inventory.some(i => i.id === 'wrench')) {
        s.inventory.push({
          id: 'wrench',
          name: 'Llave inglesa',
          icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wrench.webp',
          closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wrench.webp'
        });
      }
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_03_wheelchair');
    console.log('✅ Rueda de la silla de ruedas restaurada y llave inglesa devuelta al inventario.');
  };

  // Comando de consola para otorgar la rueda al inventario
  window.giveWheel = () => {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.wheel_picked = true;
    s.puzzleFlags.has_wheel = true;
    if (!Array.isArray(s.inventory)) s.inventory = [];
    if (!s.inventory.some(i => i.id === 'wheel' || i.id === 'bsmnt_wheel')) {
      s.inventory.push({
        id: 'wheel',
        name: 'Rueda',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wheel.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wheel.webp'
      });
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    console.log('⚙️ Rueda otorgada al inventario.');
  };

  // Comando de consola para resetear la traspaleta y otorgar la rueda al inventario para pruebas
  window.resetPalletTruck = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.pallet_truck_repaired;
      delete s.puzzleFlags.wheel_used_on_pallet;
      delete s.puzzleFlags.pallet_truck_picked;
      delete s.puzzleFlags.has_pallet_truck;
    }
    if (Array.isArray(s.inventory)) {
      s.inventory = s.inventory.filter(i => i.id !== 'pallet_truck' && i.id !== 'bsmnt_pallet_truck');
      if (!s.inventory.some(i => i.id === 'wheel' || i.id === 'bsmnt_wheel')) {
        s.inventory.push({
          id: 'wheel',
          name: 'Rueda',
          icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wheel.webp',
          closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wheel.webp'
        });
      }
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_02_pallet_truck');
    console.log('✅ Traspaleta reseteada y rueda devuelta al inventario.');
  };

  // Comando de consola para resetear el estado de los naipes y retirarlos del diario
  window.resetCards = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.cards_inspected;
    }
    if (Array.isArray(s.diary)) {
      s.diary = s.diary.filter(e => e.id !== 'doc_bsmnt_cards');
    }
    Storage.setSaveGame(s);
    if (window.DiaryManager) window.DiaryManager.render();
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_01_bench');
    console.log('✅ Naipes reseteados y retirados del diario.');
  };

  // Comando de consola para otorgar ambas pistas de cables al diario
  window.giveWireClues = () => {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.drums_dices_inspected = true;
    s.puzzleFlags.cards_inspected = true;
    s.puzzleFlags.barrel_chips_inspected = true;
    s.puzzleFlags.chips_inspected = true;
    if (!Array.isArray(s.diary)) s.diary = [];
    if (!s.diary.some(e => e.id === 'doc_bsmnt_drum_dices')) {
      s.diary.push({
        id: 'doc_bsmnt_drum_dices',
        title: 'Dados sobre el bidón',
        badge: '✦ DIARIO DE CLARA ✦',
        image: 'assets/levels/level_01_bsmnt/docs/bsmnt_drum.webp',
        imageCaption: '🔍 Clic para examinar el dibujo',
        date: 'Mansión Blackwood — Sótano segundo',
        isJournal: true
      });
    }
    if (!s.diary.some(e => e.id === 'doc_bsmnt_cards')) {
      s.diary.push({
        id: 'doc_bsmnt_cards',
        title: 'Naipes tras el retrato',
        badge: '✦ DIARIO DE CLARA ✦',
        image: 'assets/levels/level_01_bsmnt/docs/bsmnt_cards.webp',
        imageCaption: '🔍 Clic para examinar los naipes',
        date: 'Mansión Blackwood — Sótano primero',
        isJournal: true
      });
    }
    if (!s.diary.some(e => e.id === 'doc_bsmnt_chips')) {
      s.diary.push({
        id: 'doc_bsmnt_chips',
        title: 'Fichas sobre el barril',
        badge: '✦ DIARIO DE CLARA ✦',
        image: 'assets/levels/level_01_bsmnt/docs/bsmnt_chips.webp',
        imageCaption: '🔍 Clic para examinar las fichas',
        date: 'Mansión Blackwood — Sótano primero',
        isJournal: true
      });
    }
    Storage.setSaveGame(s);
    if (window.DiaryManager) window.DiaryManager.render();
    console.log('✅ Pistas de cables añadidas al diario.');
  };

  // Comando de consola para resetear pistas de cables del diario
  window.resetWireClues = () => {
    const s = Storage.getSaveGame();
    if (s) {
      if (s.puzzleFlags) {
        delete s.puzzleFlags.drums_dices_inspected;
        delete s.puzzleFlags.cards_inspected;
        delete s.puzzleFlags.barrel_chips_inspected;
        delete s.puzzleFlags.chips_inspected;
      }
      if (Array.isArray(s.diary)) {
        s.diary = s.diary.filter(e => e.id !== 'doc_bsmnt_drum_dices' && e.id !== 'doc_bsmnt_cards' && e.id !== 'doc_bsmnt_chips');
      }
      Storage.setSaveGame(s);
      if (window.DiaryManager) window.DiaryManager.render();
      console.log('✅ Pistas de cables eliminadas del diario.');
    }
  };

  // Comando de consola para abrir directamente la vista de los naipes
  window.showCards = () => {
    if (window.SceneManager) {
      window.SceneManager.handleExamineCards();
    }
  };

  // Comando de consola para otorgar la llave del candado al inventario
  window.givePadlockKey = () => {
    const s = Storage.getSaveGame() || Storage.createNewGame();
    if (!s.puzzleFlags) s.puzzleFlags = {};
    s.puzzleFlags.key_padlock_picked = true;
    s.puzzleFlags.has_key_padlock = true;
    if (!Array.isArray(s.inventory)) s.inventory = [];
    if (!s.inventory.some(i => i.id === 'key_padlock' || i.id === 'bsmnt_key_to_padlock')) {
      s.inventory.push({
        id: 'key_padlock',
        name: 'Llave pequeña',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_key_to_padlock.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_key_to_padlock.webp'
      });
    }
    Storage.setSaveGame(s);
    if (window.InventoryManager) window.InventoryManager.render();
    console.log('🔑 Llave del candado otorgada al inventario.');
  };

  // Comando de consola para resetear y bloquear de nuevo el candado
  window.resetPadlock = () => {
    const s = Storage.getSaveGame();
    if (!s) return;
    if (s.puzzleFlags) {
      delete s.puzzleFlags.padlock_unlocked;
      delete s.puzzleFlags.has_padlock_unlocked;
      delete s.puzzleFlags.key_padlock_used;
    }
    Storage.setSaveGame(s);
    if (window.SceneManager) window.SceneManager.loadScene(s.level || 'level_01_bsmnt', 'bsmnt_02_padlock');
    console.log('🔒 Candado bloqueado de nuevo.');
  };

  // Comandos de consola para placas de bronce / interactivo
  window.givePlates = () => {
    return window.gameDebug ? window.gameDebug.givePlates() : null;
  };
  window.resetPlates = () => {
    return window.gameDebug ? window.gameDebug.resetPlates() : null;
  };
  window.getPlatesState = () => {
    return window.InventoryManager ? window.InventoryManager.getPlatesState() : null;
  };

  // 4. Suscripción a eventos de juego para transiciones de nivel
  window.addEventListener('startNewGame', (e) => {
    const gameState = e.detail;
    console.log('Evento: Iniciar Nueva Partida', gameState);

    // Resetear explícitamente todos los subsistemas del juego
    InventoryManager.reset();
    DiaryManager.reset();
    TrunkPuzzle.reset();
    LightBoxWiresPuzzle.reset();
    CryptexPuzzle.reset();
    ProvidencePuzzle.reset();
    if (window.SceneManager && typeof window.SceneManager.reset === 'function') {
      window.SceneManager.reset();
    } else if (window.SceneManager && typeof window.SceneManager.resetTutorial === 'function') {
      window.SceneManager.resetTutorial();
    }

    // Detener tema musical del menú
    AudioController.stopMusic(1200);

    const level = gameState?.level || 'level_01_bsmnt';
    const scene = gameState?.scene || 'bsmnt_01_main';
    Loader.loadLevel(level, () => {
      SceneManager.loadScene(level, scene);
    });
  });

  window.addEventListener('loadSavedGame', (e) => {
    const gameState = e.detail;
    console.log('Evento: Continuar Partida Guardada', gameState);

    // Sincronizar subsistemas con la partida cargada
    InventoryManager.selectItem(null);
    InventoryManager.render();
    DiaryManager.render();

    // Detener tema musical del menú
    AudioController.stopMusic(1200);

    const level = gameState?.level || 'level_01_bsmnt';
    const scene = gameState?.scene || 'bsmnt_01_main';
    Loader.loadLevel(level, () => {
      SceneManager.loadScene(level, scene);
    });
  });

  console.log('Blackwood Keep listo.');

  // Modo de prueba / depuración opcional por URL: ?test_notebook=1 o ?test_loader=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('test_loader')) {
    setTimeout(() => {
      Loader.loadLevel('level_01_bsmnt', () => {
        console.log('Loader complete callback fired successfully');
      });
    }, 300);
  } else if (urlParams.has('test_notebook')) {
    setTimeout(() => {
      MainMenu.startFreshGame();
      setTimeout(() => {
        DiaryManager.openNotebook();
      }, 600);
    }, 500);
  }
});
