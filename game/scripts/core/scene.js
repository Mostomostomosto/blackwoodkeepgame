/**
 * Blackwood Keep — Gestor de Escenas (SceneManager)
 * Controla el renderizado de fondos, navegación horizontal/vertical con chevrons,
 * zonas interactivas transparentes (hotspots) y persistencia de escena.
 */

import { Storage } from './storage.js';
import { DiaryManager } from './diary.js';
import { InventoryManager } from './inventory.js';
import { CryptexPuzzle } from '../puzzles/cryptex_puzzle.js';
import { LightBoxWiresPuzzle } from '../puzzles/light_box_wires_puzzle.js';
import { ProvidencePuzzle } from '../puzzles/providence_puzzle.js';
import { AudioController } from './audio.js';
import { DustController } from './dust.js';
import { FinalScreenManager } from './final_screen.js';
import { i18n, t } from './i18n.js';

export const GAME_DOCUMENTS = {
  'letter_rosario_to_tomas': {
    id: 'letter_rosario_to_tomas',
    title: 'Arkham, 16 de septiembre de 1931',
    badge: '✦ CARTA DE ROSARIO ✦',
    date: '— Rosario',
    text: `Querido Tomás:

Espero que estas líneas te encuentren con salud, aunque sea con el frío que ya se habrá instalado ahí arriba. Aquí las cosas siguen su curso de siempre: la pequeña ha empezado la escuela y el párroco sigue preguntando por qué no vienes a misa cuando bajas al pueblo, como si no supiera de sobra que los domingos son los únicos días que tienes para dormir.

Madre te manda recuerdos y un frasco de mermelada que espero te llegue entero esta vez, que la última partida se rompió a medio camino y menudo disgusto.

Tomás, no he dejado de pensar en lo que me contabas en tu última carta. Dices que le restas importancia, que son ruidos de una casa vieja y nada más, pero llevas ya tres cartas mencionando lo mismo, y cada vez le dedicas más líneas de las que dices que merece. Sabes que no soy mujer que se asuste con facilidad, pero te conozco desde que éramos crios, y hay algo en cómo lo escribes que no me gusta nada.

Si el señor te permite algún día de descanso, ven a casa, aunque sea de visita corta. Nos quedaríamos más tranquilas sabiendo que estás bien.

Con cariño, tu hermana,

Rosario`
  },
  'doc_the_mansion': {
    id: 'doc_the_mansion',
    title: 'Plano de la mansión',
    badge: '✦ PLANO ARQUITECTÓNICO ✦',
    image: 'assets/levels/level_01_bsmnt/docs/the_mansion.webp',
    imageCaption: '🔍 Clic para examinar el plano',
    date: 'Mansión Blackwood — Sótano segundo',
    text: `Estaba sobre el escritorio, con las esquinas gastadas de tanto abrirlo.

Es un plano a tinta, planta y sección, de factura excelente. Quien lo dibujó sabía lo que hacía: las cotas son limpias y los muros están a escala. Si es fiel, los sótanos donde estoy ahora son el segundo nivel bajo la casa.

Hay un detalle que no encaja. Bajo el último sótano, un pozo vertical desciende por la roca hasta una cámara circular. Está trazada con más peso que todo lo demás, como si la pluma hubiera vuelto a pasar una y otra vez por las mismas líneas. Junto a ella, un círculo con un cero. No hay leyenda ni nombre.

Será un aljibe. Una casa sobre un acantilado necesita agua y esa es la forma típica de recogerla. Aun así, no recuerdo haber visto un plano que dedicara tanto cuidado a un depósito.`
  },
  'doc_bsmnt_newspaper': {
    id: 'doc_bsmnt_newspaper',
    title: 'FALLECE JULIAN BLACKWOOD, MAGNATE NAVIERO',
    badge: '✦ RECORTE DE PERIÓDICO ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_newspaper_es.webp',
    imageCaption: '🔍 Clic para examinar el recorte',
    date: 'The Arkham Advertiser — Recorte de prensa',
    text: `Deja tras de sí un imperio naviero y no pocos interrogantes sin resolver

Julian Blackwood, fundador de la Blackwood Shipping Company y una de las figuras más influyentes del comercio marítimo de Nueva Inglaterra durante las últimas cuatro décadas, falleció el pasado lunes en su residencia de Blackwood Keep a los setenta y ocho años de edad.

Blackwood amasó su fortuna en la década de 1880 tras una serie de expediciones cuyo destino exacto nunca llegó a hacerse público, dando origen a rumores que sus allegados siempre desmintieron con vehemencia. En los últimos años de su vida, había reducido notablemente su presencia social, y quienes tuvieron ocasión de tratarlo describen a un hombre cada vez más consumido por obsesiones que prefería no compartir.

Le sobreviven su hijo, el doctor Arthur Blackwood, médico de reconocido prestigio en la región hasta su reciente retiro, y su nieto, Roderick Blackwood, quien según se nos ha informado tomará las riendas de los intereses comerciales de la familia.

El funeral se celebrará en la intimidad, conforme a los deseos expresados por el difunto.`
  },
  'doc_bsmnt_drum_dices': {
    id: 'doc_bsmnt_drum_dices',
    title: 'Dados sobre el bidón',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_drum.webp',
    imageCaption: '🔍 Clic para examinar el dibujo',
    date: 'Mansión Blackwood — Sótano segundo',
    text: `En la sala de abajo, sobre uno de los bidones rojos, había dos dados que parecen fuera de lugar. Uno verde, a la izquierda. Otro azul, a la derecha. No hay mesa, ni fichas, ni nada con lo que se pudiera jugar.

Los he dibujado tal como estaban, respetando el orden. Será algo que dejaron los operarios en un descanso. Pero quien olvida unos dados no los deja a una distancia tan exacta el uno del otro.`,
    isJournal: true
  },
  'doc_bsmnt_cards': {
    id: 'doc_bsmnt_cards',
    title: 'Naipes tras el retrato',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_cards.webp',
    imageCaption: '🔍 Clic para examinar los naipes',
    date: 'Mansión Blackwood — Sótano primero',
    text: `Tras el marco del retrato de Julian asomaban unos naipes. Es una baraja que no conozco: en lugar de los palos de siempre, cuatro animales, cada uno de un color. Dos ases sobresalían del resto: a la izquierda, un cuervo amarillo; a la derecha, un escorpión verde. Anoto el orden en que estaban.

Será una baraja de la casa o de algún criado aficionado a las cartas. Pero nadie guarda una baraja detrás de un retrato, y menos dejando precisamente esos dos ases a la vista.`,
    isJournal: true
  },
  'doc_bsmnt_chest_colors': {
    id: 'doc_bsmnt_chest_colors',
    title: 'Frascos en el botiquín',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_chest_colors.webp',
    imageCaption: '🔍 Clic para examinar los frascos',
    date: 'Mansión Blackwood — Sótano primero',
    text: `En el botiquín metálico encontré varios frascos medicinales. Entre gasas y vendas desgastadas, dos recipientes destacan con etiquetas de colores vivos: uno rojo a la izquierda y otro amarillo a la derecha. He dibujado la escena tal como estaba.`,
    isJournal: true,
    isWireClue: true
  },
  'doc_bsmnt_chips': {
    id: 'doc_bsmnt_chips',
    title: 'Fichas sobre el barril',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_chips.webp',
    imageCaption: '🔍 Clic para examinar las fichas',
    date: 'Mansión Blackwood — Sótano primero',
    text: `Sobre la tapa de un viejo barril de madera descansaban dos fichas de casino gastadas por el tiempo. Una ficha azul a la izquierda y una roja a la derecha, colocadas intencionadamente una junto a otra. Las he dibujado en mi cuaderno tal como las encontré.`,
    isJournal: true,
    isWireClue: true
  },
  'bsmnt_chips': {
    id: 'doc_bsmnt_chips',
    title: 'Fichas sobre el barril',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_chips.webp',
    imageCaption: '🔍 Clic para examinar las fichas',
    date: 'Mansión Blackwood — Sótano primero',
    text: `Sobre la tapa de un viejo barril de madera descansaban dos fichas de casino gastadas por el tiempo. Una ficha azul a la izquierda y una roja a la derecha, colocadas intencionadamente una junto a otra. Las he dibujado en mi cuaderno tal como las encontré.`,
    isJournal: true,
    isWireClue: true
  },
  'photo_julian_ship': {
    id: 'photo_julian_ship',
    title: 'Fotografía: Julian y el "Providence"',
    badge: '✦ NOTA DE INVESTIGACIÓN ✦',
    image: 'assets/levels/level_01_bsmnt/puzzles/trunk/puzzle_01_01.webp',
    imageCaption: '🔍 Clic para ampliar fotografía',
    text: 'Fotografía rescatada de la tapa del baúl. Muestra a Julian Blackwood en el muelle frente a su buque pesquero. En el casco de la embarcación se distingue claramente el nombre rotulado: "PROVIDENCE".',
    date: 'Descubierto en el baúl del sótano'
  },
  'photo_family': {
    id: 'photo_family',
    title: 'Foto de familia',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/photo.webp',
    imageCaption: '🔍 Clic para examinar la fotografía',
    date: 'Mansión Blackwood — Sótano primero',
    text: `Tres personas posan ante una casa de ciudad, hacia 1890 a juzgar por el papel. A la derecha, el hombre del cuadro con la mano sobre el hombro de un muchacho de unos quince años.

La fotografía está rasgada de arriba abajo, justo hasta el borde del chico. No es desgaste ni humedad: alguien tiró del papel. Por cómo están colocados, a la izquierda había otra persona, y el muchacho se inclina hacia el hombre como si quisiera alejarse de ella.

Será una riña de familia; la gente rompe lo que no soporta ver. Lo que no entiendo es por qué conservaron la fotografía sin esa parte, en lugar de destruirla entera.`,
    isJournal: true
  },
  'photo': {
    id: 'photo_family',
    title: 'Foto de familia',
    badge: '✦ DIARIO DE CLARA ✦',
    image: 'assets/levels/level_01_bsmnt/docs/photo.webp',
    imageCaption: '🔍 Clic para examinar la fotografía',
    date: 'Mansión Blackwood — Sótano primero',
    text: `Tres personas posan ante una casa de ciudad, hacia 1890 a juzgar por el papel. A la derecha, el hombre del cuadro con la mano sobre el hombro de un muchacho de unos quince años.

La fotografía está rasgada de arriba abajo, justo hasta el borde del chico. No es desgaste ni humedad: alguien tiró del papel. Por cómo están colocados, a la izquierda había otra persona, y el muchacho se inclina hacia el hombre como si quisiera alejarse de ella.

Será una riña de familia; la gente rompe lo que no soporta ver. Lo que no entiendo es por qué conservaron la fotografía sin esa parte, en lugar de destruirla entera.`,
    isJournal: true
  },
  'doc_bsmnt_plate': {
    id: 'doc_bsmnt_plate',
    title: 'Fotografía: Placas de bronce',
    badge: '✦ NOTA DE INVESTIGACIÓN ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_plate.webp',
    imageCaption: '🔍 Clic para ampliar fotografía',
    date: 'Vestuarios — Sobre el banco de madera',
    text: `Una fotografía envejecida dejada con descuido sobre el banco de los vestuarios.

Muestra cuatro placas cuadradas de bronce dispuestas en cuadrícula de dos por dos sobre una mesa de trabajo, junto a un reloj de bolsillo y antiguos pergaminos. Cada placa presenta perforaciones geométricas distintivas y una orientación precisa: una media luna, un rombo estelar, un hexágono, un rectángulo, un cuadrado, un triángulo, un círculo y una estrella.

Parece la disposición exacta requerida para encajar las placas en la hornacina ceremonial.`,
    isJournal: true
  }
};

export const NEWSPAPER_DOC_I18N = {
  es: {
    title: 'FALLECE JULIAN BLACKWOOD, MAGNATE NAVIERO',
    badge: '✦ RECORTE DE PERIÓDICO ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_newspaper_es.webp',
    imageCaption: '🔍 Clic para examinar el recorte',
    date: 'The Arkham Advertiser — Recorte de prensa',
    text: `Deja tras de sí un imperio naviero y no pocos interrogantes sin resolver

Julian Blackwood, fundador de la Blackwood Shipping Company y una de las figuras más influyentes del comercio marítimo de Nueva Inglaterra durante las últimas cuatro décadas, falleció el pasado lunes en su residencia de Blackwood Keep a los setenta y ocho años de edad.

Blackwood amasó su fortuna en la década de 1880 tras una serie de expediciones cuyo destino exacto nunca llegó a hacerse público, dando origen a rumores que sus allegados siempre desmintieron con vehemencia. En los últimos años de su vida, había reducido notablemente su presencia social, y quienes tuvieron ocasión de tratarlo describen a un hombre cada vez más consumido por obsesiones que prefería no compartir.

Le sobreviven su hijo, el doctor Arthur Blackwood, médico de reconocido prestigio en la región hasta su reciente retiro, y su nieto, Roderick Blackwood, quien según se nos ha informado tomará las riendas de los intereses comerciales de la familia.

El funeral se celebrará en la intimidad, conforme a los deseos expresados por el difunto.`
  },
  en: {
    title: 'SHIPPING TYCOON JULIAN BLACKWOOD DIES',
    badge: '✦ NEWSPAPER CLIPPING ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_newspaper_en.webp',
    imageCaption: '🔍 Click to examine the clipping',
    date: 'The Aufthan Chronicle — Tuesday, 12 June 1931',
    text: `Prominent shipping magnate Julian Blackwood, founder of the Blackwood Steam Navigation Company, died yesterday at his coastal residence, sources close to the family confirmed.

Mr. Blackwood, whose name became synonymous with maritime trade across the Atlantic, built one of the most influential shipping empires of his generation. He was widely respected for his vision, his fleet of modern steamships and his contribution to the economic development of the region.

Tributes have begun to arrive from business leaders and political figures, highlighting his enduring legacy in the world of maritime commerce.

The Blackwood Steam Navigation Company issued a brief statement expressing its deep sorrow. Flags at several ports were reported to be flying at half-mast in his honour.

Further details regarding the funeral arrangements are expected to be announced in the coming days.`
  },
  fr: {
    title: 'DÉCÈS DE JULIAN BLACKWOOD, ARMATEUR',
    badge: '✦ COUPURE DE PRESSE ✦',
    image: 'assets/levels/level_01_bsmnt/docs/bsmnt_newspaper_fr.webp',
    imageCaption: '🔍 Cliquer pour examiner la coupure',
    date: 'The Aufthan Chronicle — Mardi 12 juin 1931',
    text: `Le célèbre armateur Julian Blackwood, fondateur de la Blackwood Steam Navigation Company, est décédé hier dans sa résidence côtière, selon des sources proches de la famille.

M. Blackwood, dont le nom est devenu synonyme de commerce maritime à travers l'Atlantique, a bâti l'un des empires maritimes les plus influents de sa génération. Il était largement respecté pour sa vision, sa flotte de paquebots modernes et sa contribution au développement économique de la région.

Des hommages affluent déjà de la part de dirigeants du monde des affaires et de personnalités politiques, soulignant son héritage durable dans le domaine maritime.

La Blackwood Steam Navigation Company a publié un bref communiqué exprimant sa profonde tristesse. Des pavillons en berne ont été signalés dans plusieurs ports en signe d'hommage.

De plus amples détails concernant les obsèques devraient être annoncés dans les prochains jours.`
  }
};

if (typeof window !== 'undefined') {
  window.NEWSPAPER_DOC_I18N = NEWSPAPER_DOC_I18N;
}

const NAVIGATION_GRAPH = {
  'level_01_bsmnt': {
    'bsmnt_01_main': {
      left: 'bsmnt_01_bench',
      right: 'bsmnt_01_pale'
    },
    'bsmnt_01_bench': {
      right: 'bsmnt_01_main'
    },
    'bsmnt_01_shelf': {
      back: 'bsmnt_01_bench'
    },
    'bsmnt_01_bench_closeup': {
      back: 'bsmnt_01_bench'
    },
    'bsmnt_01_bench_painting': {
      back: 'bsmnt_01_bench'
    },
    'bsmnt_01_painting_closeup': {
      back: 'bsmnt_01_bench'
    },
    'bsmnt_01_cards': {
      back: 'bsmnt_01_bench_painting'
    },
    'bsmnt_01_cards_close_up': {
      back: 'bsmnt_01_bench_painting'
    },
    'bsmnt_01_painting': {
      back: 'bsmnt_01_main'
    },
    'bsmnt_01_painting_v': {
      back: 'bsmnt_01_main'
    },
    'bsmnt_01_pipes': {
      back: 'bsmnt_01_main'
    },
    'bsmnt_01_pale': {
      left: 'bsmnt_01_main'
    },
    'bsmnt_01_dice': {
      back: 'bsmnt_01_pale'
    },
    'bsmnt_01_light_box': {
      back: 'bsmnt_01_pale'
    },
    'bsmnt_01_light_box_open': {
      back: 'bsmnt_01_pale'
    },
    'bsmnt_01_light_box_panel': {
      back: 'bsmnt_01_light_box'
    },
    'bsmnt_01_med_chest': {
      back: 'bsmnt_01_main',
      left: 'bsmnt_01_door_to_03'
    },
    'bsmnt_01_med_chest_close_up': {
      back: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_med_chest_close_up_open': {
      back: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_med_chest_open': {
      back: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_chest_close_up': {
      back: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_chest_close_up_open': {
      back: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_door_to_03': {
      back: 'bsmnt_01_main',
      right: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_door_to_03_dark': {
      back: 'bsmnt_01_door_to_03',
      right: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_door_to_03_light': {
      back: 'bsmnt_01_door_to_03',
      right: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_wrech_box': {
      back: 'bsmnt_01_door_to_03'
    },
    'bsmnt_03_main': {
      back: 'bsmnt_01_door_to_03_light'
    },
    'bsmnt_03_desktop': {
      back: 'bsmnt_03_main'
    },
    'bsmnt_03_wheelchair': {
      back: 'bsmnt_03_main'
    },
    'bsmnt_03_door_to_locker_room': {
      back: 'bsmnt_03_main'
    },
    'bsmnt_03_locker_room': {
      back: 'bsmnt_03_door_to_locker_room'
    },
    'bsmnt_03_locker_closed': {
      back: 'bsmnt_03_locker_room'
    },
    'bsmnt_03_locker_open': {
      back: 'bsmnt_03_locker_room'
    },
    'bsmnt_03_coveralls': {
      back: 'bsmnt_03_locker_open'
    },
    'bsmnt_03_coat_stand': {
      back: 'bsmnt_03_main'
    },
    'bsmnt_03_under_stairs': {
      back: 'bsmnt_03_main'
    },
    'bsmnt_03_niche': {
      back: 'bsmnt_03_main'
    },
    'bsmnt_03_niche_closeup': {
      back: 'bsmnt_03_niche'
    },
    'niche_closeup': {
      back: 'bsmnt_03_niche'
    },
    'bsmnt_01_trunk': {
      back: 'bsmnt_01_main'
    },
    'bsmnt_01_trunk_open': {
      back: 'bsmnt_01_main'
    },
    'bsmnt_01_door_to_02': {
      back: 'bsmnt_01_med_chest'
    },
    'bsmnt_01_cryptex': {
      back: 'bsmnt_01_door_to_02'
    },
    'bsmnt_02_stairs': {
      back: 'bsmnt_01_door_to_02'
    },
    'bsmnt_02_drums': {
      back: 'bsmnt_02_stairs'
    },
    'bsmnt_02_drums_closeup': {
      back: 'bsmnt_02_drums'
    },
    'bsmnt_02_catch_basin': {
      back: 'bsmnt_02_drums'
    },
    'bsmnt_02_main': {
      back: 'bsmnt_02_drums'
    },
    'bsmnt_02_boxes': {
      back: 'bsmnt_02_main'
    },
    'bsmnt_02_padlock': {
      back: 'bsmnt_02_main'
    },
    'bsmnt_02_main_open': {
      back: 'bsmnt_02_drums'
    },
    'bsmnt_02_pallet_truck': {
      back: 'bsmnt_02_main_open',
      right: 'bsmnt_02_trunk'
    },
    'bsmnt_02_trunk': {
      left: 'bsmnt_02_pallet_truck'
    },
    'bsmnt_02_trunk_closeup': {
      back: 'bsmnt_02_trunk'
    },
    'bsmnt_02_trunk_closeup_open': {
      back: 'bsmnt_02_trunk'
    },
    'bsmnt_02_desktop_closeup': {
      back: 'bsmnt_02_main'
    },
    'bsmnt_02_drawer': {
      back: 'bsmnt_02_desktop_closeup'
    }
  }
};

const HOTSPOTS_CONFIG = {
  'level_01_bsmnt': {
    'bsmnt_01_main': [
      {
        id: 'hotspot_bsmnt_01_pipes',
        x_pct: 0.169271,
        y_pct: 0.125000,
        w_pct: 0.032292,
        h_pct: 0.328704,
        action: 'navigate',
        targetScene: 'bsmnt_01_pipes',
        ariaLabel: 'Examinar tubería y pieza en U'
      },
      {
        id: 'hotspot_med_chest',
        x_pct: 0.7464,
        y_pct: 0.3139,
        w_pct: 0.0427,
        h_pct: 0.2589,
        action: 'navigate',
        targetScene: 'bsmnt_01_med_chest',
        ariaLabel: 'Examinar botiquín'
      },
      {
        id: 'hotspot_door_to_03',
        x_pct: 0.5979,
        y_pct: 0.3435,
        w_pct: 0.0620,
        h_pct: 0.2194,
        action: 'navigate',
        targetScene: 'bsmnt_01_door_to_03',
        ariaLabel: 'Examinar puerta'
      },
      {
        id: 'hotspot_trunk',
        x_pct: 0.3542,
        y_pct: 0.5093,
        w_pct: 0.0885,
        h_pct: 0.1056,
        action: 'trunk',
        ariaLabel: 'Examinar baúl'
      },
      {
        id: 'hotspot_main_painting',
        x_pct: 0.8350,
        y_pct: 0.0400,
        w_pct: 0.1150,
        h_pct: 0.3800,
        action: 'painting_navigate',
        ariaLabel: 'Examinar cuadro y lámpara en la pared'
      }
    ],
    'bsmnt_01_bench': [
      {
        id: 'hotspot_bench_to_shelf',
        x_pct: 0.1423,
        y_pct: 0.5250,
        w_pct: 0.2561,
        h_pct: 0.4550,
        action: 'navigate',
        targetScene: 'bsmnt_01_shelf',
        ariaLabel: 'Examinar estantería'
      },
      {
        id: 'hotspot_bench_to_bench',
        x_pct: 0.4200,
        y_pct: 0.5700,
        w_pct: 0.5250,
        h_pct: 0.4150,
        action: 'navigate',
        targetScene: 'bsmnt_01_bench_closeup',
        ariaLabel: 'Examinar banco'
      },
      {
        id: 'hotspot_bench_to_painting',
        x_pct: 0.5692,
        y_pct: 0.0000,
        w_pct: 0.2355,
        h_pct: 0.5150,
        action: 'navigate',
        targetScene: 'bsmnt_01_bench_painting',
        ariaLabel: 'Examinar retrato de Julian Blackwood'
      },
      {
        id: 'hotspot_bench_cards',
        x_pct: 0.6201,
        y_pct: 0.3554,
        w_pct: 0.0356,
        h_pct: 0.0291,
        action: 'navigate',
        targetScene: 'bsmnt_01_bench_painting',
        ariaLabel: 'Examinar retrato de Julian Blackwood',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_cards.webp'
      }
    ],
    'bsmnt_01_shelf': [
      {
        id: 'hotspot_shelf_document',
        x_pct: 0.3958,
        y_pct: 0.5787,
        w_pct: 0.1198,
        h_pct: 0.1574,
        action: 'read_document',
        documentId: 'letter_rosario_to_tomas',
        ariaLabel: 'Examinar carta en la estantería'
      }
    ],
    'bsmnt_01_bench_closeup': [
      {
        id: 'hotspot_bench_photo',
        x_pct: 0.7188,
        y_pct: 0.7361,
        w_pct: 0.0885,
        h_pct: 0.0648,
        action: 'read_document',
        documentId: 'photo_family',
        ariaLabel: 'Examinar fotografía en el banco'
      },
      {
        id: 'hotspot_bench_handle',
        x_pct: 0.3400,
        y_pct: 0.8350,
        w_pct: 0.0446,
        h_pct: 0.1120,
        action: 'pick_handle',
        ariaLabel: 'Recoger pomo de madera',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_handle.webp'
      }
    ],
    'bsmnt_01_bench_painting': [
      {
        id: 'hotspot_julian_portrait_frame',
        x_pct: 0.3745,
        y_pct: 0.0269,
        w_pct: 0.3359,
        h_pct: 0.7333,
        action: 'painting_julian_inspect',
        ariaLabel: 'Examinar retrato de Julian Blackwood'
      },
      {
        id: 'hotspot_julian_portrait_cards',
        x_pct: 0.4438,
        y_pct: 0.5209,
        w_pct: 0.0521,
        h_pct: 0.0426,
        action: 'examine_cards',
        ariaLabel: 'Examinar naipes en el bolsillo del retrato',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_cards.webp'
      }
    ],
    'bsmnt_01_painting_closeup': [
      {
        id: 'hotspot_julian_portrait_frame',
        x_pct: 0.3745,
        y_pct: 0.0269,
        w_pct: 0.3359,
        h_pct: 0.7333,
        action: 'painting_julian_inspect',
        ariaLabel: 'Examinar retrato de Julian Blackwood'
      },
      {
        id: 'hotspot_julian_portrait_cards',
        x_pct: 0.4438,
        y_pct: 0.5209,
        w_pct: 0.0521,
        h_pct: 0.0426,
        action: 'examine_cards',
        ariaLabel: 'Examinar naipes en el bolsillo del retrato',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_cards.webp'
      }
    ],
    'bsmnt_01_cards': [
      {
        id: 'hotspot_bsmnt_cards_bg_click',
        x_pct: 0,
        y_pct: 0,
        w_pct: 1,
        h_pct: 1,
        action: 'cards_back',
        ariaLabel: 'Volver al banco'
      },
      {
        id: 'hotspot_bsmnt_cards_overlay',
        x_pct: 0.2333,
        y_pct: 0.1796,
        w_pct: 0.5333,
        h_pct: 0.6407,
        action: 'cards_back',
        ariaLabel: 'Naipes tras el retrato (clic para volver)',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_cards.webp'
      }
    ],
    'bsmnt_01_cards_close_up': [
      {
        id: 'hotspot_bsmnt_cards_bg_click',
        x_pct: 0,
        y_pct: 0,
        w_pct: 1,
        h_pct: 1,
        action: 'cards_back',
        ariaLabel: 'Volver al banco'
      },
      {
        id: 'hotspot_bsmnt_cards_overlay',
        x_pct: 0.2333,
        y_pct: 0.1796,
        w_pct: 0.5333,
        h_pct: 0.6407,
        action: 'cards_back',
        ariaLabel: 'Naipes tras el retrato (clic para volver)',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_cards.webp'
      }
    ],
    'bsmnt_01_painting': [
      {
        id: 'hotspot_painting_lamp',
        x_pct: 0.4150,
        y_pct: 0.0200,
        w_pct: 0.1650,
        h_pct: 0.2650,
        action: 'painting_lamp',
        ariaLabel: 'Lámpara sobre el cuadro'
      }
    ],
    'bsmnt_01_painting_v': [],
    'bsmnt_01_pale': [
      {
        id: 'hotspot_pale_light_box',
        x_pct: 0.1875,
        y_pct: 0.1944,
        w_pct: 0.0755,
        h_pct: 0.2083,
        action: 'navigate',
        targetScene: 'bsmnt_01_light_box',
        ariaLabel: 'Examinar cuadro de luces'
      },
      {
        id: 'hotspot_pale_crowbar',
        x_pct: 0.461042,
        y_pct: 0.911296,
        w_pct: 0.149479,
        h_pct: 0.074074,
        action: 'pick_crowbar',
        ariaLabel: 'Palanca',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_crowbar.webp'
      },
      {
        id: 'hotspot_pale_pallet',
        x_pct: 0.413542,
        y_pct: 0.545370,
        w_pct: 0.296875,
        h_pct: 0.454630,
        action: 'pale_pallet',
        ariaLabel: 'Palé cargado de bloques',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_pallet.webp'
      },
      {
        id: 'hotspot_pale_barrel',
        x_pct: 0.7550,
        y_pct: 0.6500,
        w_pct: 0.1400,
        h_pct: 0.2800,
        action: 'navigate',
        targetScene: 'bsmnt_01_dice',
        ariaLabel: 'Examinar barril con fichas de casino'
      }
    ],
    'bsmnt_01_dice': [
      {
        id: 'hotspot_barrel_chips',
        x_pct: 0.3906,
        y_pct: 0.3889,
        w_pct: 0.2604,
        h_pct: 0.2037,
        action: 'read_document',
        documentId: 'doc_bsmnt_chips',
        ariaLabel: 'Examinar fichas de casino sobre el barril'
      }
    ],
    'bsmnt_01_light_box': [
      {
        id: 'hotspot_light_box_panel',
        x_pct: 0.6531,
        y_pct: 0.3639,
        w_pct: 0.1042,
        h_pct: 0.2426,
        action: 'light_box_panel',
        ariaLabel: 'Panel de conexiones eléctricas'
      },
      {
        id: 'hotspot_light_box_switch_slot',
        x_pct: 0.4172,
        y_pct: 0.2815,
        w_pct: 0.0167,
        h_pct: 0.0778,
        action: 'light_box_switch_slot',
        ariaLabel: 'Ranura para interruptor magnetotérmico'
      }
    ],
    'bsmnt_01_light_box_open': [
      {
        id: 'hotspot_light_box_panel',
        x_pct: 0.6531,
        y_pct: 0.3639,
        w_pct: 0.1042,
        h_pct: 0.2426,
        action: 'light_box_panel',
        ariaLabel: 'Panel de conexiones eléctricas'
      },
      {
        id: 'hotspot_light_box_switch_slot',
        x_pct: 0.4172,
        y_pct: 0.2815,
        w_pct: 0.0167,
        h_pct: 0.0778,
        action: 'light_box_switch_slot',
        ariaLabel: 'Ranura para interruptor magnetotérmico'
      }
    ],
    'bsmnt_01_light_box_panel': [],
    'bsmnt_01_med_chest': [
      {
        id: 'hotspot_med_chest_detail',
        x_pct: 0.1760,
        y_pct: 0.2731,
        w_pct: 0.0542,
        h_pct: 0.2037,
        action: 'med_chest_detail_navigate',
        targetScene: 'bsmnt_01_med_chest_close_up',
        ariaLabel: 'Examinar detalle del botiquín'
      },
      {
        id: 'hotspot_med_chest_box',
        x_pct: 0.3542,
        y_pct: 0.6204,
        w_pct: 0.1953,
        h_pct: 0.1991,
        action: 'chest_box_navigate',
        ariaLabel: 'Examinar cajón bajo la ventana'
      },
      {
        id: 'overlay_open_chest',
        x_pct: 0.3594,
        y_pct: 0.5398,
        w_pct: 0.1911,
        h_pct: 0.1870,
        action: 'navigate',
        targetScene: 'bsmnt_01_chest_close_up_open',
        ariaLabel: 'Examinar cajón abierto',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/open_chest.webp'
      },
      {
        id: 'hotspot_door_to_02',
        x_pct: 0.6720,
        y_pct: 0.1800,
        w_pct: 0.1080,
        h_pct: 0.6500,
        action: 'navigate',
        targetScene: 'bsmnt_01_door_to_02',
        ariaLabel: 'Examinar puerta a la Sala 2'
      }
    ],
    'bsmnt_01_med_chest_close_up': [
      {
        id: 'hotspot_med_chest_lock',
        x_pct: 0.3766,
        y_pct: 0.4602,
        w_pct: 0.0469,
        h_pct: 0.1102,
        action: 'med_chest_lock',
        ariaLabel: 'Cerradura del botiquín'
      }
    ],
    'bsmnt_01_med_chest_close_up_open': [
      {
        id: 'hotspot_med_chest_acid',
        x_pct: 0.447396,
        y_pct: 0.231481,
        w_pct: 0.038542,
        h_pct: 0.142593,
        action: 'pick_acid',
        ariaLabel: 'Frasco de ácido',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_acid.webp'
      }
    ],
    'bsmnt_01_med_chest_open': [
      {
        id: 'hotspot_med_chest_acid',
        x_pct: 0.447396,
        y_pct: 0.231481,
        w_pct: 0.038542,
        h_pct: 0.142593,
        action: 'pick_acid',
        ariaLabel: 'Frasco de ácido',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_acid.webp'
      }
    ],
    'bsmnt_01_door_to_02': [
      {
        id: 'hotspot_door_02_knob',
        x_pct: 0.6350,
        y_pct: 0.5600,
        w_pct: 0.0650,
        h_pct: 0.2100,
        action: 'open_cryptex',
        ariaLabel: 'Examinar cerradura de la puerta'
      }
    ],
    'bsmnt_01_cryptex': [],
    'bsmnt_01_pipes': [
      {
        id: 'hotspot_pipes_stage_pipe',
        x_pct: 0.486979,
        y_pct: 0.494444,
        w_pct: 0.147396,
        h_pct: 0.272222,
        action: 'pipes_stage_pipe',
        ariaLabel: 'Hueco en la tubería'
      }
    ],
    'bsmnt_02_stairs': [
      {
        id: 'hotspot_stairs_arch',
        x_pct: 0.3950,
        y_pct: 0.2700,
        w_pct: 0.2100,
        h_pct: 0.5400,
        action: 'navigate',
        targetScene: 'bsmnt_02_drums',
        ariaLabel: 'Avanzar bajo el arco hacia la sala contigua'
      }
    ],
    'bsmnt_02_drums': [
      {
        id: 'hotspot_drums_standing_drum',
        x_pct: 0.1700,
        y_pct: 0.4000,
        w_pct: 0.1500,
        h_pct: 0.4300,
        action: 'navigate',
        targetScene: 'bsmnt_02_drums_closeup',
        ariaLabel: 'Examinar bidón de pie'
      },
      {
        id: 'hotspot_drums_catch_basin',
        x_pct: 0.498958,
        y_pct: 0.626852,
        w_pct: 0.145313,
        h_pct: 0.143519,
        action: 'navigate',
        targetScene: 'bsmnt_02_catch_basin',
        ariaLabel: 'Examinar arqueta'
      },
      {
        id: 'hotspot_drums_boxes',
        x_pct: 0.6800,
        y_pct: 0.2500,
        w_pct: 0.2000,
        h_pct: 0.7100,
        action: 'navigate',
        targetScene: 'bsmnt_02_main',
        ariaLabel: 'Avanzar junto a las cajas hacia la sala de la jaula'
      }
    ],
    'bsmnt_02_drums_closeup': [
      {
        id: 'hotspot_drums_dices',
        x_pct: 0.4600,
        y_pct: 0.5200,
        w_pct: 0.1200,
        h_pct: 0.1200,
        action: 'read_document',
        documentId: 'doc_bsmnt_drum_dices',
        ariaLabel: 'Examinar dados sobre el bidón'
      }
    ],
    'bsmnt_02_catch_basin': [
      {
        id: 'hotspot_catch_basin',
        x_pct: 0.269792,
        y_pct: 0.125926,
        w_pct: 0.498438,
        h_pct: 0.747222,
        action: 'catch_basin',
        message: 'No logro alcanzar la caja',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_02_basin_dry.webp',
        ariaLabel: 'Examinar arqueta'
      },
      {
        id: 'hotspot_catch_basin_key',
        x_pct: 0.470313,
        y_pct: 0.512037,
        w_pct: 0.049479,
        h_pct: 0.050926,
        action: 'pick_key_to_locker',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_key_in_box.webp',
        ariaLabel: 'Coger llave de la taquilla'
      }
    ],
    'bsmnt_02_main': [
      {
        id: 'hotspot_main_boxes',
        x_pct: 0.0000,
        y_pct: 0.4000,
        w_pct: 0.3300,
        h_pct: 0.5800,
        action: 'navigate',
        targetScene: 'bsmnt_02_boxes',
        ariaLabel: 'Examinar las cajas de cartón apiladas'
      },
      {
        id: 'hotspot_main_padlock',
        x_pct: 0.4974,
        y_pct: 0.4074,
        w_pct: 0.0339,
        h_pct: 0.1065,
        action: 'navigate',
        targetScene: 'bsmnt_02_padlock',
        ariaLabel: 'Examinar el candado de la puerta'
      },
      {
        id: 'hotspot_main_desktop',
        x_pct: 0.5271,
        y_pct: 0.4352,
        w_pct: 0.2984,
        h_pct: 0.4769,
        action: 'navigate',
        targetScene: 'bsmnt_02_desktop_closeup',
        ariaLabel: 'Examinar el escritorio'
      },
      {
        id: 'hotspot_main_jacket',
        x_pct: 0.825521,
        y_pct: 0.555556,
        w_pct: 0.175521,
        h_pct: 0.445370,
        action: 'pick_jacket',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_jacket.webp',
        ariaLabel: 'Recoger chaqueta'
      }
    ],
    'bsmnt_02_boxes': [
      {
        id: 'hotspot_boxes_key_padlock',
        x_pct: 0.358333,
        y_pct: 0.814815,
        w_pct: 0.172396,
        h_pct: 0.112963,
        action: 'pick_key_padlock',
        ariaLabel: 'Recoger llave pequeña',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_key_to_padlock.webp'
      }
    ],
    'bsmnt_02_padlock': [
      {
        id: 'hotspot_padlock',
        x_pct: 0.4531,
        y_pct: 0.2222,
        w_pct: 0.2396,
        h_pct: 0.5926,
        action: 'padlock_target',
        ariaLabel: 'Candado TITAN 40 de la puerta metálica'
      }
    ],
    'bsmnt_02_main_open': [
      {
        id: 'hotspot_main_open_boxes',
        x_pct: 0.0000,
        y_pct: 0.4000,
        w_pct: 0.3300,
        h_pct: 0.5800,
        action: 'navigate',
        targetScene: 'bsmnt_02_boxes',
        ariaLabel: 'Examinar las cajas de cartón apiladas'
      },
      {
        id: 'hotspot_main_open_doorway',
        x_pct: 0.3672,
        y_pct: 0.1343,
        w_pct: 0.1510,
        h_pct: 0.5880,
        action: 'navigate',
        targetScene: 'bsmnt_02_pallet_truck',
        ariaLabel: 'Avanzar por la puerta abierta hacia el almacén interior'
      },
      {
        id: 'hotspot_main_open_desktop',
        x_pct: 0.5271,
        y_pct: 0.4352,
        w_pct: 0.2984,
        h_pct: 0.4769,
        action: 'navigate',
        targetScene: 'bsmnt_02_desktop_closeup',
        ariaLabel: 'Examinar el escritorio'
      },
      {
        id: 'hotspot_main_open_jacket',
        x_pct: 0.825521,
        y_pct: 0.555556,
        w_pct: 0.175521,
        h_pct: 0.445370,
        action: 'pick_jacket',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_jacket.webp',
        ariaLabel: 'Recoger chaqueta'
      }
    ],
    'bsmnt_02_pallet_truck': [
      {
        id: 'hotspot_pallet_truck',
        x_pct: 0.5450,
        y_pct: 0.333333,
        w_pct: 0.1475,
        h_pct: 0.616667,
        action: 'pallet_truck',
        ariaLabel: 'Traspaleta averiada',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_pallet_truck.webp'
      }
    ],
    'bsmnt_02_trunk': [
      {
        id: 'hotspot_trunk_box',
        x_pct: 0.5443,
        y_pct: 0.3981,
        w_pct: 0.3958,
        h_pct: 0.4815,
        action: 'navigate',
        targetScene: 'bsmnt_02_trunk_closeup',
        ariaLabel: 'Examinar baúl de madera'
      },
      {
        id: 'hotspot_trunk_padlock',
        x_pct: 0.6275,
        y_pct: 0.5010,
        w_pct: 0.0609,
        h_pct: 0.1935,
        action: 'navigate',
        targetScene: 'bsmnt_02_trunk_closeup',
        ariaLabel: 'Examinar candado del baúl',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_02_trunk_padlock.webp'
      }
    ],
    'bsmnt_02_trunk_closeup': [
      {
        id: 'hotspot_trunk_closeup_padlock',
        x_pct: 0.4688,
        y_pct: 0.4074,
        w_pct: 0.0938,
        h_pct: 0.3889,
        action: 'trunk_closeup_padlock',
        ariaLabel: 'Candado del arcón'
      }
    ],
    'bsmnt_02_trunk_closeup_open': [
      {
        id: 'hotspot_trunk_switch',
        x_pct: 0.6896,
        y_pct: 0.4389,
        w_pct: 0.1594,
        h_pct: 0.2361,
        action: 'pick_switch',
        ariaLabel: 'Interruptor eléctrico',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmt_02_stage_switch.webp'
      }
    ],
    'bsmnt_02_desktop_closeup': [
      {
        id: 'hotspot_desktop_notebook',
        x_pct: 0.1797,
        y_pct: 0.2778,
        w_pct: 0.2786,
        h_pct: 0.2778,
        action: 'read_document',
        documentId: 'doc_the_mansion',
        ariaLabel: 'Examinar cuaderno sobre el escritorio'
      },
      {
        id: 'hotspot_desktop_top_drawer',
        x_pct: 0.4219,
        y_pct: 0.3657,
        w_pct: 0.1615,
        h_pct: 0.1806,
        action: 'examine_top_drawer',
        ariaLabel: 'Examinar cajón superior del escritorio'
      },
      {
        id: 'hotspot_desktop_drawer_no_handle',
        x_pct: 0.4630,
        y_pct: 0.4087,
        w_pct: 0.0938,
        h_pct: 0.1528,
        action: 'examine_top_drawer',
        ariaLabel: 'Cajón superior sin tirador',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_no_handle.webp'
      }
    ],
    'bsmnt_02_drawer': [
      {
        id: 'hotspot_drawer_notebook',
        x_pct: 0.1797,
        y_pct: 0.2778,
        w_pct: 0.2786,
        h_pct: 0.2778,
        action: 'read_document',
        documentId: 'doc_the_mansion',
        ariaLabel: 'Examinar cuaderno sobre el escritorio'
      },
      {
        id: 'hotspot_drawer_keys_med_chest',
        x_pct: 0.550729,
        y_pct: 0.501852,
        w_pct: 0.024479,
        h_pct: 0.118519,
        action: 'pick_keys_med_chest',
        ariaLabel: 'Recoger juego de llaves pequeñas',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_02_stage_keys_to_med_chest.webp'
      }
    ],
    'bsmnt_01_chest_close_up': [
      {
        id: 'hotspot_chest_lid_closed',
        x_pct: 0.1600,
        y_pct: 0.2200,
        w_pct: 0.6700,
        h_pct: 0.6000,
        action: 'pry_chest_lid',
        ariaLabel: 'Tapa de la caja de madera clavada'
      }
    ],
    'bsmnt_01_chest_close_up_open': [
      {
        id: 'hotspot_chest_wires',
        x_pct: 0.274479,
        y_pct: 0.387037,
        w_pct: 0.198958,
        h_pct: 0.301852,
        action: 'pick_wires',
        ariaLabel: 'Recoger cables',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_01_stage_wires.webp'
      },
      {
        id: 'hotspot_chest_bulb',
        x_pct: 0.576042,
        y_pct: 0.372222,
        w_pct: 0.145313,
        h_pct: 0.164815,
        action: 'pick_bulb',
        ariaLabel: 'Recoger bombilla',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_01_stage_bulb.webp'
      }
    ],
    'bsmnt_01_door_to_03': [
      {
        id: 'hotspot_door_03_wrench_box',
        x_pct: 0.0391,
        y_pct: 0.6111,
        w_pct: 0.1589,
        h_pct: 0.1620,
        action: 'navigate',
        targetScene: 'bsmnt_01_wrech_box',
        ariaLabel: 'Examinar caja de herramientas'
      },
      {
        id: 'hotspot_door_03_interact',
        x_pct: 0.4165,
        y_pct: 0.1823,
        w_pct: 0.1861,
        h_pct: 0.7070,
        action: 'door_to_03',
        ariaLabel: 'Abrir puerta'
      }
    ],
    'bsmnt_01_door_to_03_dark': [
      {
        id: 'hotspot_door_03_dark_wrench_box',
        x_pct: 0.0391,
        y_pct: 0.6111,
        w_pct: 0.1589,
        h_pct: 0.1620,
        action: 'navigate',
        targetScene: 'bsmnt_01_wrech_box',
        ariaLabel: 'Examinar caja de herramientas'
      },
      {
        id: 'hotspot_door_to_03_dark_enter',
        x_pct: 0.4165,
        y_pct: 0.1823,
        w_pct: 0.1861,
        h_pct: 0.7070,
        action: 'door_to_03_dark_inspect',
        ariaLabel: 'Mirar hacia la oscuridad'
      }
    ],
    'bsmnt_01_door_to_03_light': [
      {
        id: 'hotspot_door_03_light_wrench_box',
        x_pct: 0.0391,
        y_pct: 0.6111,
        w_pct: 0.1589,
        h_pct: 0.1620,
        action: 'navigate',
        targetScene: 'bsmnt_01_wrech_box',
        ariaLabel: 'Examinar caja de herramientas'
      },
      {
        id: 'hotspot_door_to_03_light_enter',
        x_pct: 0.4165,
        y_pct: 0.1823,
        w_pct: 0.1861,
        h_pct: 0.7070,
        action: 'navigate',
        targetScene: 'bsmnt_03_main',
        ariaLabel: 'Entrar a la sala'
      }
    ],
    'bsmnt_01_wrech_box': [
      {
        id: 'hotspot_wrech_box_wrench',
        x_pct: 0.245313,
        y_pct: 0.316667,
        w_pct: 0.367708,
        h_pct: 0.196296,
        action: 'pick_wrench',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_wrench.webp',
        ariaLabel: 'Recoger llave inglesa'
      }
    ],
    'bsmnt_03_main': [
      {
        id: 'hotspot_bsmnt_03_desktop',
        x_pct: 0.0000,
        y_pct: 0.5200,
        w_pct: 0.1875,
        h_pct: 0.3500,
        action: 'navigate',
        targetScene: 'bsmnt_03_desktop',
        ariaLabel: 'Examinar escritorio'
      },
      {
        id: 'hotspot_bsmnt_03_wheelchair',
        x_pct: 0.5550,
        y_pct: 0.6000,
        w_pct: 0.1600,
        h_pct: 0.2500,
        action: 'navigate',
        targetScene: 'bsmnt_03_wheelchair',
        ariaLabel: 'Examinar silla de ruedas'
      },
      {
        id: 'hotspot_bsmnt_03_planks',
        x_pct: 0.580208,
        y_pct: 0.384259,
        w_pct: 0.105729,
        h_pct: 0.287037,
        action: 'navigate',
        targetScene: 'bsmnt_03_door_to_locker_room',
        ariaLabel: 'Puerta hacia los vestuarios'
      },
      {
        id: 'hotspot_bsmnt_03_coat_stand',
        x_pct: 0.734375,
        y_pct: 0.398148,
        w_pct: 0.072917,
        h_pct: 0.421296,
        action: 'navigate',
        targetScene: 'bsmnt_03_coat_stand',
        ariaLabel: 'Examinar perchero'
      },
      {
        id: 'hotspot_bsmnt_03_main_jacket',
        x_pct: 0.753125,
        y_pct: 0.500000,
        w_pct: 0.0578125,
        h_pct: 0.175000,
        action: 'navigate',
        targetScene: 'bsmnt_03_coat_stand',
        ariaLabel: 'Chaqueta colgada en el perchero',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_03_main_jacket.webp'
      },
      {
        id: 'hotspot_bsmnt_03_under_stairs_door',
        x_pct: 0.164583,
        y_pct: 0.521296,
        w_pct: 0.088542,
        h_pct: 0.268519,
        action: 'under_stairs_door',
        ariaLabel: 'Puerta bajo la escalera',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_03_open_door.webp'
      },
      {
        id: 'hotspot_bsmnt_03_upper_door',
        x_pct: 0.2240,
        y_pct: 0.1500,
        w_pct: 0.0800,
        h_pct: 0.3200,
        action: 'navigate',
        targetScene: 'bsmnt_03_niche',
        ariaLabel: 'Puerta superior al final de la escalera'
      }
    ],
    'bsmnt_03_door_to_locker_room': [
      {
        id: 'hotspot_locker_room_door',
        x_pct: 0.378125,
        y_pct: 0.061111,
        w_pct: 0.336979,
        h_pct: 0.890741,
        action: 'locker_room_door',
        ariaLabel: 'Puerta hacia los vestuarios'
      },
      {
        id: 'hotspot_door_to_locker_room_planks',
        x_pct: 0.378125,
        y_pct: 0.061111,
        w_pct: 0.336979,
        h_pct: 0.890741,
        action: 'door_planks',
        ariaLabel: 'Tablones de madera clavados en la puerta',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_door_to_locker_planks.webp'
      }
    ],
    'bsmnt_03_locker_room': [
      {
        id: 'hotspot_bsmnt_03_locker',
        x_pct: 0.515625,
        y_pct: 0.162037,
        w_pct: 0.104167,
        h_pct: 0.615741,
        action: 'examine_locker',
        ariaLabel: 'Taquilla metálica cerrada'
      },
      {
        id: 'hotspot_bsmnt_03_photo_bench',
        x_pct: 0.046875,
        y_pct: 0.643519,
        w_pct: 0.080729,
        h_pct: 0.055556,
        action: 'read_document',
        documentId: 'doc_bsmnt_plate',
        ariaLabel: 'Examinar fotografía sobre el banco'
      }
    ],
    'bsmnt_03_locker_closed': [
      {
        id: 'hotspot_bsmnt_03_locker_door',
        x_pct: 0.3800,
        y_pct: 0.0500,
        w_pct: 0.2400,
        h_pct: 0.9000,
        action: 'examine_locker_door',
        ariaLabel: 'Taquilla cerrada'
      },
      {
        id: 'hotspot_bsmnt_03_locker_lock',
        x_pct: 0.3950,
        y_pct: 0.3700,
        w_pct: 0.0700,
        h_pct: 0.1800,
        action: 'examine_locker_lock',
        ariaLabel: 'Cerradura de la taquilla'
      }
    ],
    'bsmnt_03_locker_open': [
      {
        id: 'hotspot_bsmnt_03_coveralls_pocket',
        x_pct: 0.4714,
        y_pct: 0.5093,
        w_pct: 0.0469,
        h_pct: 0.1620,
        action: 'navigate',
        targetScene: 'bsmnt_03_coveralls',
        ariaLabel: 'Bolsillo del buzo de trabajo'
      }
    ],
    'bsmnt_03_coveralls': [
      {
        id: 'hotspot_coveralls_plates',
        x_pct: 0.314583,
        y_pct: 0.259259,
        w_pct: 0.350521,
        h_pct: 0.400926,
        action: 'pick_plates',
        ariaLabel: 'Coger placas de metal',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_03_stage_plates.webp'
      }
    ],
    'bsmnt_03_coat_stand': [
      {
        id: 'hotspot_coat_stand_jacket',
        x_pct: 0.488542,
        y_pct: 0.539815,
        w_pct: 0.166146,
        h_pct: 0.460185,
        action: 'coat_stand_jacket',
        ariaLabel: 'Gancho del perchero'
      }
    ],
    'bsmnt_03_under_stairs': [
      {
        id: 'hotspot_under_stairs_pipe',
        x_pct: 0.494792,
        y_pct: 0.610185,
        w_pct: 0.082813,
        h_pct: 0.094444,
        action: 'pick_pipe',
        ariaLabel: 'Recoger tramo de tubería',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_03_stage_pipe.webp'
      }
    ],
    'bsmnt_03_niche': [
      {
        id: 'hotspot_bsmnt_03_niche',
        x_pct: 0.6042,
        y_pct: 0.2407,
        w_pct: 0.2188,
        h_pct: 0.4074,
        action: 'navigate',
        targetScene: 'bsmnt_03_niche_closeup',
        ariaLabel: 'Examinar hornacina'
      }
    ],
    'bsmnt_03_niche_closeup': [
      {
        id: 'hotspot_niche_receptors',
        x_pct: 0.3800,
        y_pct: 0.1500,
        w_pct: 0.4800,
        h_pct: 0.7200,
        action: 'niche_receptors',
        ariaLabel: 'Ranura y receptores de la hornacina'
      }
    ],
    'bsmnt_03_desktop': [
      {
        id: 'overlay_bsmnt_03_newspaper_header',
        x_pct: 0.321354,
        y_pct: 0.498148,
        w_pct: 0.223438,
        h_pct: 0.172222,
        action: 'read_document',
        documentId: 'doc_bsmnt_newspaper',
        ariaLabel: 'Leer recorte de periódico'
      },
      {
        id: 'hotspot_bsmnt_03_newspaper',
        x_pct: 0.2900,
        y_pct: 0.4600,
        w_pct: 0.3800,
        h_pct: 0.4300,
        action: 'read_document',
        documentId: 'doc_bsmnt_newspaper',
        ariaLabel: 'Leer recorte de periódico'
      }
    ],
    'bsmnt_03_wheelchair': [
      {
        id: 'hotspot_wheelchair_wheel',
        x_pct: 0.473958,
        y_pct: 0.704630,
        w_pct: 0.106771,
        h_pct: 0.238889,
        action: 'wheelchair_wheel',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_wheel.webp',
        ariaLabel: 'Rueda delantera de la silla de ruedas'
      }
    ],
    'bsmnt_01_trunk': [
      {
        id: 'hotspot_trunk_polaroid',
        x_pct: 0.4714,
        y_pct: 0.4965,
        w_pct: 0.0974,
        h_pct: 0.0907,
        action: 'trunk_puzzle',
        ariaLabel: 'Examinar fotografía en la tapa del baúl',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/polaroid.webp'
      }
    ],
    'bsmnt_01_trunk_open': [
      {
        id: 'hotspot_trunk_hammer',
        x_pct: 0.3191,
        y_pct: 0.5420,
        w_pct: 0.2156,
        h_pct: 0.2124,
        action: 'pick_hammer',
        ariaLabel: 'Recoger martillo sacaclavos',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_hammer.webp'
      },
      {
        id: 'hotspot_trunk_key',
        x_pct: 0.5211,
        y_pct: 0.6004,
        w_pct: 0.1188,
        h_pct: 0.0806,
        action: 'pick_key_door_03',
        ariaLabel: 'Recoger llave antigua de hierro',
        backgroundImage: 'assets/levels/level_01_bsmnt/overlays/bsmnt_key_to_03.webp'
      }
    ]
  }
};

const SCENE_CUSTOM_CONFIG = {
  'bsmnt_01_bench': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bench_close_up.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_painting': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_painting.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_painting_v': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_painting_v.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_shelf': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bench_close_up.webp',
    bgSize: '146.406% 146.574%',
    bgPosition: 'left bottom'
  },
  'bsmnt_01_bench_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bench_close_up.webp',
    bgSize: '146.406% 146.574%',
    bgPosition: '74.186% bottom'
  },
  'bsmnt_01_bench_painting': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bench_close_up.webp',
    bgSize: '146.406% 146.574%',
    bgPosition: 'right top'
  },
  'bsmnt_01_painting_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bench_close_up.webp',
    bgSize: '146.406% 146.574%',
    bgPosition: 'right top'
  },
  'bsmnt_01_door_to_02': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_door_to_02.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_cards': {
    bgImage: 'none',
    bgColor: '#000000'
  },
  'bsmnt_01_cards_close_up': {
    bgImage: 'none',
    bgColor: '#000000'
  },
  'bsmnt_01_cryptex': {
    bgImage: 'none',
    bgColor: '#000000'
  },
  'bsmnt_01_pipes': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_pipes.webp',
    bgSize: 'cover',
    bgPosition: 'center top'
  },
  'bsmnt_02_stairs': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_stairs.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_drums': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_drums.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_drums_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_drums_closeup.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_catch_basin': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_catch_basin.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_main': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_main.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_boxes': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_boxes.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_padlock': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_padlock.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_main_open': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_main_open.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_pallet_truck': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_pallet_truck.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_trunk': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_trunk.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_trunk_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_trunk_closeup.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_trunk_closeup_open': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_trunk_closeup_open.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_desktop_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_desktop_closeup.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_02_drawer': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_02_drawer.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_med_chest_close_up_open': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_med_chest_close_up_open.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_med_chest_open': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_med_chest_close_up_open.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_light_box': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_light_box.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_light_box_open': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_light_box_open.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_01_light_box_panel': {
    bgImage: 'none',
    bgColor: '#000000'
  },
  'bsmnt_03_main': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_main.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_desktop': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_desktop.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_wheelchair': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_wheelchair.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_door_to_locker_room': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_door_to_locker_room.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_locker_room': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_locker_room.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_locker_closed': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_locker_closed.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_locker_open': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_locker_open.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_coveralls': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_coveralls.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_coat_stand': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_coat_stand.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_under_stairs': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_under_stairs.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_niche': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_niche.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'bsmnt_03_niche_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_niche_closeup.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  },
  'niche_closeup': {
    bgImage: 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_03_niche_closeup.webp',
    bgSize: 'cover',
    bgPosition: 'center center'
  }
};

export const SceneManager = {
  currentLevel: null,
  currentScene: null,
  isTransitioning: false,
  _suppressHotspotClick: false,
  _suppressHotspotClickTimer: null,

  suppressHotspotClick(durationMs = 350) {
    this._suppressHotspotClick = true;
    if (this._suppressHotspotClickTimer) {
      clearTimeout(this._suppressHotspotClickTimer);
    }
    this._suppressHotspotClickTimer = setTimeout(() => {
      this._suppressHotspotClick = false;
      this._suppressHotspotClickTimer = null;
    }, durationMs);
  },

  init() {
    this.viewGame = document.getElementById('view-game');
    this.sceneBg = document.getElementById('scene-background');
    this.sceneOverlays = document.getElementById('scene-overlays');
    this.navLeft = document.getElementById('nav-edge-left');
    this.navRight = document.getElementById('nav-edge-right');
    this.navBottom = document.getElementById('nav-edge-bottom');
    this.navHint = document.getElementById('nav-tutorial-hint');
    this.messageBar = document.getElementById('game-message-bar');
    this.messageText = document.getElementById('game-message-text');
    this.doorCurtain = document.getElementById('scene-door-curtain');
    this.transitionCurtain = document.getElementById('scene-transition-curtain');
    this.crossfadeLayer = document.getElementById('scene-crossfade-layer');

    // Suprimir clics sintéticos residuales producidos por el navegador tras soltar un ítem arrastrado
    window.addEventListener('click', (e) => {
      if (this._suppressHotspotClick) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    if (this.messageBar) {
      this.messageBar.addEventListener('click', () => this.hideMessage());
    }

    // Visor de Documentos Encontrados
    const docModal = document.getElementById('modal-doc-viewer');
    if (docModal) {
      docModal.style.display = 'none';
      docModal.addEventListener('click', (e) => {
        if (e.target === docModal || e.target.classList.contains('btn-close-doc-viewer') || e.target.id === 'btn-close-doc-viewer') {
          this.closeDocumentViewer();
        }
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && docModal.classList.contains('active')) {
          this.closeDocumentViewer();
        }
        if (e.key === 'Escape' && (this.currentScene === 'bsmnt_01_cards' || this.currentScene === 'bsmnt_01_cards_close_up')) {
          const returnScene = this.cardsReturnScene || 'bsmnt_01_bench_painting';
          this.navigateTo(returnScene);
        }
      });
    }

    // Tutorial de gestos táctiles para móviles
    const tutorialDismissBtn = document.getElementById('btn-dismiss-gesture-tutorial');
    if (tutorialDismissBtn) {
      tutorialDismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissGestureTutorial();
      });
    }

    const tutorialModal = document.getElementById('gesture-tutorial-modal');
    if (tutorialModal) {
      tutorialModal.addEventListener('click', (e) => {
        if (e.target === tutorialModal) {
          this.dismissGestureTutorial();
        }
      });
    }

    const openTutorialBtn = document.getElementById('btn-open-gesture-tutorial');
    if (openTutorialBtn) {
      openTutorialBtn.addEventListener('click', () => {
        const optionsModal = document.getElementById('modal-options');
        if (optionsModal) {
          optionsModal.classList.remove('active');
          optionsModal.style.display = 'none';
        }
        this.showGestureTutorial();
      });
    }

    window.addEventListener('languageChanged', () => {
      if (this.currentScene === 'bsmnt_03_desktop') {
        this.renderHotspots();
      }
    });

    this.initTutorial();
    this.bindNavigationEvents();
    this.initDebugHelpers();
    window.SceneManager = this;
  },

  bindNavigationEvents() {
    if (this.navLeft) {
      this.navLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleNavigationClick('left');
      });
    }

    if (this.navRight) {
      this.navRight.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleNavigationClick('right');
      });
    }

    if (this.navBottom) {
      this.navBottom.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.LightBoxWiresPuzzle?.activeCable) {
          window.LightBoxWiresPuzzle.cancelActiveCable();
        }
        this.handleNavigationClick('back');
      });
    }

    this.bindGestureNavigation();
  },

  bindGestureNavigation() {
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || Boolean(window.Capacitor?.isNativePlatform()) || window.innerWidth <= 900;
    if (this.isTouchDevice) {
      document.body.classList.add('gesture-navigation');
    }

    if (!this.viewGame) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let initialPinchDist = 0;
    let isGestureActive = false;
    let hasSignificantMove = false;
    let isPinchGesture = false;

    const getPinchDistance = (touches) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const isSingleFingerInteractionBlocked = (target) => {
      if (this.isTransitioning) return true;
      if (document.body.classList.contains('is-dragging-inventory-item')) return true;
      if (window.InventoryManager && window.InventoryManager.isDragging) return true;
      if (this.currentScene === 'bsmnt_01_light_box_panel' || window.LightBoxWiresPuzzle?.isMounted) return true;
      if (!target) return false;
      return Boolean(target.closest('#lightbox-wires-board, .lightbox-wires-board, .lightbox-pin-btn, #lightbox-wires-svg, .wire-pin-btn, .wires-canvas, #lightbox-puzzle-container, .cryptex-dial, .cryptex-board-container, #trunk-puzzle-canvas, #providence-puzzle-canvas, .valve-hotspot, .puzzle-piece, #trunk-puzzle-grid, .puzzle-cell, #inventory-sidebar, .hud-inventory-sidebar, .hud-btn-options, .btn-options-nav, .modal-backdrop.active, #gesture-tutorial-modal.active'));
    };

    const isPuzzleInteractive = (target) => {
      if (!target) return false;
      return Boolean(target.closest('.lightbox-pin-btn, #lightbox-wires-board, .lightbox-wires-board, #lightbox-wires-svg, .wire-pin-btn, .wires-canvas, #lightbox-puzzle-container, .cryptex-dial, .cryptex-board-container, #trunk-puzzle-canvas, #providence-puzzle-canvas, .valve-hotspot, .puzzle-piece, #trunk-puzzle-grid, .puzzle-cell'));
    };

    this.viewGame.addEventListener('touchstart', (e) => {
      if (this.isTransitioning) return;
      if (document.body.classList.contains('is-dragging-inventory-item')) return;
      if (window.InventoryManager && window.InventoryManager.isDragging) return;

      // Si hay un modal del sistema / opciones activo, no procesar gestos
      if (e.target && e.target.closest('.modal-backdrop.active:not(#modal-doc-viewer), #gesture-tutorial-modal.active, .hud-btn-options, .btn-options-nav')) {
        isGestureActive = false;
        return;
      }

      // Si hay 2 o más dedos en pantalla -> SIEMPRE activar detección de pellizco (zoom out / retroceder)
      if (e.touches.length >= 2) {
        initialPinchDist = getPinchDistance(e.touches);
        isPinchGesture = true;
        isGestureActive = true;
        hasSignificantMove = false;
        return;
      }

      // Para un único dedo: comprobar si está sobre un puzle interactivo o el inventario
      if (isSingleFingerInteractionBlocked(e.target)) {
        isGestureActive = false;
        isPinchGesture = false;
        return;
      }

      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isGestureActive = true;
        isPinchGesture = false;
        hasSignificantMove = false;
      }
    }, { passive: true });

    this.viewGame.addEventListener('touchmove', (e) => {
      // Detección de pellizco con 2 dedos (retroceder/zoom-out de primeros planos y puzles)
      if (e.touches.length >= 2) {
        if (!isPinchGesture || initialPinchDist <= 0) {
          initialPinchDist = getPinchDistance(e.touches);
          isPinchGesture = true;
          isGestureActive = true;
        } else {
          const currentDist = getPinchDistance(e.touches);
          // Si los dos dedos se acercan al menos 35px -> pellizco hacia dentro
          if (initialPinchDist > 0 && (initialPinchDist - currentDist) > 35) {
            if (window.LightBoxWiresPuzzle?.activeCable) {
              window.LightBoxWiresPuzzle.cancelActiveCable();
            }
            isGestureActive = false;
            isPinchGesture = false;
            initialPinchDist = 0;
            this.suppressHotspotClick(450);
            this.dismissGestureTutorial();
            this.handleGestureNavigation('back');
          }
        }
        return;
      }

      if (!isGestureActive) return;

      if (e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;

        if (Math.hypot(deltaX, deltaY) > 20) {
          hasSignificantMove = true;
          // Suprimir clics accidentales en hotspots bajo el dedo mientras se arrastra
          this.suppressHotspotClick(350);
        }
      }
    }, { passive: true });

    this.viewGame.addEventListener('touchend', (e) => {
      if (isPinchGesture || e.touches.length > 0) {
        if (e.touches.length === 0) {
          isPinchGesture = false;
          initialPinchDist = 0;
          isGestureActive = false;
        }
        return;
      }

      if (!isGestureActive) return;
      isGestureActive = false;

      if (!hasSignificantMove) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const duration = Date.now() - touchStartTime;

      if (duration > 900 && Math.hypot(deltaX, deltaY) < 120) return;

      const thresholdX = Math.max(45, Math.round(window.innerWidth * 0.07));
      const thresholdY = Math.max(50, Math.round(window.innerHeight * 0.1));

      // 1. Gesto Vertical Descendente: Deslizar hacia abajo -> Retroceder (Volver)
      if (deltaY > thresholdY && absY > absX * 1.25) {
        if (isPuzzleInteractive(e.target)) return;
        this.suppressHotspotClick(450);
        this.dismissGestureTutorial();
        this.handleGestureNavigation('back');
        return;
      }

      // 2. Gesto Horizontal Lateral: Deslizar a izquierda o derecha -> Mirar alrededor
      if (absX > thresholdX && absX > absY * 1.2) {
        if (isPuzzleInteractive(e.target)) return;

        this.suppressHotspotClick(450);
        this.dismissGestureTutorial();

        // En paneo panorámico natural:
        // Arrastrar a la derecha (deltaX > 0) tira de la pared izquierda hacia la vista -> Girar a la IZQUIERDA
        // Arrastrar a la izquierda (deltaX < 0) tira de la pared derecha hacia la vista -> Girar a la DERECHA
        const direction = deltaX > 0 ? 'left' : 'right';
        this.handleGestureNavigation(direction);
      }
    }, { passive: true });
  },

  handleGestureNavigation(direction) {
    if (this._suppressHotspotClick && this.isTransitioning) return;
    this.dismissHint();

    // Restricciones del tutorial interactivo paso a paso
    if (this.tutorialStep === 1) {
      // En el paso 1, cualquier deslizamiento lateral lleva hacia el banco de trabajo
      if (direction === 'left' || direction === 'right') {
        this.tutorialStep = 2;
        if (this.tutorialSwipeInd) this.tutorialSwipeInd.style.display = 'none';
        this.navigateTo('bsmnt_01_bench');
      } else {
        this.playElasticFeedback(direction);
      }
      return;
    }

    if (this.tutorialStep === 2 || this.tutorialStep === 3) {
      // Bloquear navegación por gestos en pasos 2 y 3: el jugador debe examinar el objeto resaltado
      this.playElasticFeedback(direction);
      return;
    }

    if (this.tutorialStep === 4) {
      // En el paso 4, solo se permite retroceder (pellizco o swipe hacia abajo)
      if (direction === 'back') {
        this.tutorialStep = 5;
        if (this.tutorialPinchInd) this.tutorialPinchInd.style.display = 'none';
        this.navigateTo('bsmnt_01_bench');
      } else {
        this.playElasticFeedback(direction);
      }
      return;
    }

    const routes = this.getRoutesForCurrentScene();
    const destination = routes[direction];

    if (destination) {
      this.navigateTo(destination);
    } else {
      this.playElasticFeedback(direction);
    }
  },

  playElasticFeedback(direction) {
    if (!this.viewGame) return;
    const animClass = direction === 'left' ? 'scene-nudge-left' : direction === 'right' ? 'scene-nudge-right' : 'scene-nudge-down';
    this.viewGame.classList.remove('scene-nudge-left', 'scene-nudge-right', 'scene-nudge-down');
    void this.viewGame.offsetWidth;
    this.viewGame.classList.add(animClass);
    setTimeout(() => {
      if (this.viewGame) {
        this.viewGame.classList.remove('scene-nudge-left', 'scene-nudge-right', 'scene-nudge-down');
      }
    }, 280);
  },

  initTutorial() {
    this.tutorialBanner = document.getElementById('tutorial-banner');
    this.tutorialBannerText = document.getElementById('tutorial-banner-text');
    this.tutorialSwipeInd = document.getElementById('tutorial-swipe-indicator');
    this.tutorialPinchInd = document.getElementById('tutorial-pinch-indicator');

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || Boolean(window.Capacitor?.isNativePlatform()) || window.innerWidth <= 900;
    this.isTouchDevice = isTouch;
    const isCompleted = localStorage.getItem('blackwood_interactive_tutorial_completed') === 'true';

    if (isTouch && !isCompleted) {
      const saveState = Storage.getSaveGame();
      const scene = saveState?.scene || 'bsmnt_01_main';
      if (scene === 'bsmnt_01_main') {
        this.tutorialStep = 1;
      } else if (scene === 'bsmnt_01_bench') {
        this.tutorialStep = 2;
      } else if (scene === 'bsmnt_01_shelf') {
        const letterRead = saveState?.documents?.some(d => d.id === 'letter_rosario_to_tomas');
        this.tutorialStep = letterRead ? 4 : 3;
      } else {
        this.tutorialStep = 0;
        try { localStorage.setItem('blackwood_interactive_tutorial_completed', 'true'); } catch (e) {}
      }
    } else {
      this.tutorialStep = 0;
    }
  },

  reset() {
    this.currentLevel = 'level_01_bsmnt';
    this.currentScene = 'bsmnt_01_main';
    this.isTransitioning = false;
    this._suppressHotspotClick = false;
    this._isDetachingWheel = false;
    this._isHandlingPlatesDrop = false;
    this.cardsReturnScene = null;
    this._lastDoor03Scene = null;
    this._lastLockerScene = null;
    this.hideMessage();
    this.resetTutorial();
  },

  resetTutorial() {
    try {
      localStorage.removeItem('blackwood_interactive_tutorial_completed');
    } catch (e) {}

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || Boolean(window.Capacitor?.isNativePlatform()) || window.innerWidth <= 900;
    this.isTouchDevice = isTouch;
    this.tutorialStep = isTouch ? 1 : 0;

    this.hideTutorialBanner();
    if (!this.tutorialSwipeInd) this.tutorialSwipeInd = document.getElementById('tutorial-swipe-indicator');
    if (this.tutorialSwipeInd) this.tutorialSwipeInd.style.display = 'none';
    if (!this.tutorialPinchInd) this.tutorialPinchInd = document.getElementById('tutorial-pinch-indicator');
    if (this.tutorialPinchInd) this.tutorialPinchInd.style.display = 'none';

    document.querySelectorAll('.tutorial-hotspot-highlight').forEach(el => el.classList.remove('tutorial-hotspot-highlight'));
  },

  showTutorialBanner(textKey, autoHideMs = 0) {
    if (!this.tutorialBanner || !this.tutorialBannerText) {
      this.tutorialBanner = document.getElementById('tutorial-banner');
      this.tutorialBannerText = document.getElementById('tutorial-banner-text');
    }
    if (!this.tutorialBanner || !this.tutorialBannerText) return;

    this.tutorialBannerText.textContent = t(textKey, textKey);
    this.tutorialBanner.classList.add('visible');

    clearTimeout(this._tutorialBannerTimer);
    if (autoHideMs > 0) {
      this._tutorialBannerTimer = setTimeout(() => {
        this.hideTutorialBanner();
      }, autoHideMs);
    }
  },

  hideTutorialBanner() {
    if (!this.tutorialBanner) {
      this.tutorialBanner = document.getElementById('tutorial-banner');
    }
    if (this.tutorialBanner) {
      this.tutorialBanner.classList.remove('visible');
    }
    clearTimeout(this._tutorialBannerTimer);
  },

  updateTutorialState(sceneId) {
    if (!this.tutorialBanner || !this.tutorialBannerText) {
      this.tutorialBanner = document.getElementById('tutorial-banner');
      this.tutorialBannerText = document.getElementById('tutorial-banner-text');
    }
    if (!this.tutorialSwipeInd) {
      this.tutorialSwipeInd = document.getElementById('tutorial-swipe-indicator');
    }
    if (!this.tutorialPinchInd) {
      this.tutorialPinchInd = document.getElementById('tutorial-pinch-indicator');
    }

    if (this.tutorialStep === 0) {
      this.hideTutorialBanner();
      if (this.tutorialSwipeInd) this.tutorialSwipeInd.style.display = 'none';
      if (this.tutorialPinchInd) this.tutorialPinchInd.style.display = 'none';
      document.querySelectorAll('.tutorial-hotspot-highlight').forEach(el => el.classList.remove('tutorial-hotspot-highlight'));
      return;
    }

    if (this.tutorialStep === 1) {
      if (sceneId === 'bsmnt_01_main') {
        this.showTutorialBanner('tutorial_step1_swipe');
        if (this.tutorialSwipeInd) this.tutorialSwipeInd.style.display = 'flex';
        if (this.tutorialPinchInd) this.tutorialPinchInd.style.display = 'none';
      }
    } else if (this.tutorialStep === 2) {
      if (this.tutorialSwipeInd) this.tutorialSwipeInd.style.display = 'none';
      if (sceneId === 'bsmnt_01_bench') {
        this.showTutorialBanner('tutorial_step2_shelf');
        const shelfHotspot = document.getElementById('hotspot_bench_to_shelf');
        if (shelfHotspot) shelfHotspot.classList.add('tutorial-hotspot-highlight');
      }
    } else if (this.tutorialStep === 3) {
      if (sceneId === 'bsmnt_01_shelf') {
        this.showTutorialBanner('tutorial_step3_letter');
        const letterHotspot = document.getElementById('hotspot_shelf_document');
        if (letterHotspot) letterHotspot.classList.add('tutorial-hotspot-highlight');
      }
    } else if (this.tutorialStep === 4) {
      if (sceneId === 'bsmnt_01_shelf') {
        this.showTutorialBanner('tutorial_step4_back');
        if (this.tutorialPinchInd) this.tutorialPinchInd.style.display = 'flex';
      }
    } else if (this.tutorialStep === 5) {
      if (sceneId === 'bsmnt_01_bench') {
        this.completeTutorial();
      }
    }
  },

  completeTutorial() {
    this.tutorialStep = 0;
    try {
      localStorage.setItem('blackwood_interactive_tutorial_completed', 'true');
    } catch (e) {}

    if (this.tutorialSwipeInd) this.tutorialSwipeInd.style.display = 'none';
    if (this.tutorialPinchInd) this.tutorialPinchInd.style.display = 'none';
    document.querySelectorAll('.tutorial-hotspot-highlight').forEach(el => el.classList.remove('tutorial-hotspot-highlight'));

    this.showTutorialBanner('tutorial_step5_complete', 4000);
  },

  showGestureTutorial() {
    const modal = document.getElementById('gesture-tutorial-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
  },

  dismissGestureTutorial() {
    const modal = document.getElementById('gesture-tutorial-modal');
    if (!modal || !modal.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 320);
  },

  handleNavigationClick(direction) {
    if (this._suppressHotspotClick || this.isTransitioning) return;

    this.dismissHint();

    const routes = this.getRoutesForCurrentScene();
    const destination = routes[direction];

    if (destination) {
      this.navigateTo(destination);
    }
  },

  getRoutesForCurrentScene() {
    const levelGraph = NAVIGATION_GRAPH[this.currentLevel] || {};
    const routes = { ...(levelGraph[this.currentScene] || {}) };
    if (this.currentScene === 'bsmnt_02_boxes' || this.currentScene === 'bsmnt_02_desktop_closeup') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.padlock_unlocked) {
        routes.back = 'bsmnt_02_main_open';
      }
    }
    if (this.currentScene === 'bsmnt_01_cards' || this.currentScene === 'bsmnt_01_cards_close_up') {
      if (this.cardsReturnScene) {
        routes.back = this.cardsReturnScene;
      }
    }
    if (this.currentScene === 'bsmnt_01_wrech_box') {
      if (this._lastDoor03Scene) {
        routes.back = this._lastDoor03Scene;
      } else {
        const saveState = Storage.getSaveGame();
        const isUnlocked = Boolean(saveState?.puzzleFlags?.door_03_unlocked);
        if (isUnlocked) {
          const isLightOn = Boolean(saveState?.puzzleFlags?.light_on || saveState?.puzzleFlags?.luz_encendida || saveState?.puzzleFlags?.switch_on);
          routes.back = isLightOn ? 'bsmnt_01_door_to_03_light' : 'bsmnt_01_door_to_03_dark';
        } else {
          routes.back = 'bsmnt_01_door_to_03';
        }
      }
    }
    if (this.currentScene === 'bsmnt_03_coveralls') {
      if (this._lastLockerScene) {
        routes.back = this._lastLockerScene;
      } else {
        routes.back = 'bsmnt_03_locker_open';
      }
    }
    return routes;
  },

  getHotspotsForCurrentScene() {
    const levelHotspots = HOTSPOTS_CONFIG[this.currentLevel] || {};
    return levelHotspots[this.currentScene] || [];
  },

  /**
   * Navega hacia una escena con transición suave mediante cortina unificada.
   * Evita discrepancias de renderizado entre fondo y overlays al oscurecer la vista uniformemente.
   */
  navigateTo(targetSceneId) {
    if (targetSceneId === 'niche_closeup') {
      targetSceneId = 'bsmnt_03_niche_closeup';
    }
    if (this.isTransitioning || targetSceneId === this.currentScene) return;
    this.isTransitioning = true;

    if (targetSceneId === 'bsmnt_01_cards' || targetSceneId === 'bsmnt_01_cards_close_up') {
      this.cardsReturnScene = this.currentScene || 'bsmnt_01_bench_painting';
    }

    if (targetSceneId === 'bsmnt_01_wrech_box') {
      if (this.currentScene === 'bsmnt_01_door_to_03' || this.currentScene === 'bsmnt_01_door_to_03_dark' || this.currentScene === 'bsmnt_01_door_to_03_light') {
        this._lastDoor03Scene = this.currentScene;
      }
    }

    if (targetSceneId === 'bsmnt_03_coveralls') {
      this._lastLockerScene = this.currentScene || 'bsmnt_03_locker_open';
    }

    if (targetSceneId === 'bsmnt_02_drawer' || (this.currentScene === 'bsmnt_02_drawer' && targetSceneId === 'bsmnt_02_desktop_closeup')) {
      this.playDrawerSound();
    }

    const curtain = this.transitionCurtain || document.getElementById('scene-transition-curtain');
    if (curtain) {
      curtain.classList.add('fade-to-black');
    }

    // Resolver ruta del fondo de la escena destino para predecodificarlo
    const customConfig = SCENE_CUSTOM_CONFIG[targetSceneId] || null;
    const saveState = Storage.getSaveGame();
    let bgPath = customConfig?.bgImage || `assets/levels/${this.currentLevel || 'level_01_bsmnt'}/backgrounds/${targetSceneId}.webp`;
    if ((targetSceneId === 'bsmnt_01_light_box' || targetSceneId === 'bsmnt_01_light_box_open') && saveState?.puzzleFlags?.light_box_open) {
      bgPath = 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_light_box_open.webp';
    }

    const img = new Image();
    img.src = bgPath;
    const decodePromise = (img.decode && customConfig?.bgImage !== 'none') ? img.decode().catch(() => {}) : Promise.resolve();
    const minFadeWait = new Promise(resolve => setTimeout(resolve, 180));
    const maxSafetyWait = new Promise(resolve => setTimeout(resolve, 360));

    Promise.race([
      Promise.all([decodePromise, minFadeWait]),
      maxSafetyWait
    ]).then(() => {
      this.loadScene(this.currentLevel, targetSceneId);

      // Actualizar escena en la partida guardada
      const s = Storage.getSaveGame();
      if (s) {
        s.scene = targetSceneId;
        s.updatedAt = new Date().toISOString();
        Storage.setSaveGame(s);
      }

      // Esperar dos frames para garantizar que el motor gráfico haya pintado el fondo
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (curtain) {
            curtain.classList.remove('fade-to-black');
          }
          setTimeout(() => {
            this.isTransitioning = false;
          }, 200);
        });
      });
    });
  },

  /**
   * Navega a través de una puerta con transición cinemática:
   * - Inicia inmediatamente el fundido a negro al interactuar con el pomo / puerta.
   * - Reproduce el chirrido de apertura (creaking_door.mp3, dura 1.93s, con portazo a los ~1.58s).
   * - Carga la nueva escena a los ~1420ms (justo antes del portazo final a los ~1580ms).
   * - Al entrar a la nueva escena, el portazo se cierra tras de nosotros.
   */
  navigateThroughDoor(targetSceneId, { message = null, delaySound = 0 } = {}) {
    if (this.isTransitioning || targetSceneId === this.currentScene) return;

    // Apertura directa con disolución cruzada (crossfade) en la puerta a la Sala 3 sin fundido a negro
    if (
      this.currentScene === 'bsmnt_01_door_to_03' &&
      (targetSceneId === 'bsmnt_01_door_to_03_light' || targetSceneId === 'bsmnt_01_door_to_03_dark')
    ) {
      this.navigateDoorCrossfade(targetSceneId, { delay: delaySound, message });
      return;
    }

    this.isTransitioning = true;

    if (message) {
      this.showMessage(message, 3500);
    }

    const curtain = this.doorCurtain || document.getElementById('scene-door-curtain');

    const execute = () => {
      // 1. Reproducir sonido de puerta
      this.playCreakingDoorSound();

      // 2. Iniciar inmediatamente el fundido lento a negro al clicar el pomo
      if (curtain) {
        curtain.classList.remove('fade-from-black');
        curtain.classList.add('fade-to-black');
      } else {
        const transCurtain = this.transitionCurtain || document.getElementById('scene-transition-curtain');
        if (transCurtain) transCurtain.classList.add('fade-to-black');
      }

      // 3. Justo antes del portazo final (~1420ms), cambiar a la nueva escena
      setTimeout(() => {
        this.loadScene(this.currentLevel, targetSceneId);

        // Actualizar escena en la partida guardada
        const saveState = Storage.getSaveGame();
        if (saveState) {
          saveState.scene = targetSceneId;
          saveState.updatedAt = new Date().toISOString();
          Storage.setSaveGame(saveState);
        }

        // 4. Iniciar fundido de entrada desde negro para desvelar la nueva escena
        // mientras la puerta da el portazo de cierre tras el jugador
        if (curtain) {
          curtain.classList.remove('fade-to-black');
          curtain.classList.add('fade-from-black');
        } else {
          const transCurtain = this.transitionCurtain || document.getElementById('scene-transition-curtain');
          if (transCurtain) transCurtain.classList.remove('fade-to-black');
        }

        // 5. Finalizar estado de transición
        setTimeout(() => {
          if (curtain) {
            curtain.classList.remove('fade-from-black');
          }
          this.isTransitioning = false;
        }, 750);
      }, 1420);
    };

    if (delaySound > 0) {
      setTimeout(execute, delaySound);
    } else {
      execute();
    }
  },

  /**
   * Transición directa mediante disolución cruzada (crossfade) para la apertura de la puerta a la Sala 3:
   * En lugar de oscurecer la pantalla con fundido a negro, la nueva escena (bsmnt_01_door_to_03_light)
   * surge suave y directamente sobre la puerta cerrada mientras se reproduce el chirrido de apertura.
   */
  navigateDoorCrossfade(targetSceneId, { delay = 0, message = null } = {}) {
    if (this.isTransitioning || targetSceneId === this.currentScene) return;
    this.isTransitioning = true;

    if (message) {
      this.showMessage(message, 3500);
    }

    // Desactivar temporalmente interacción en overlays y ocultar flechas de navegación
    if (this.sceneOverlays) {
      this.sceneOverlays.style.pointerEvents = 'none';
      this.sceneOverlays.style.transition = 'opacity 0.4s ease';
      this.sceneOverlays.style.opacity = '0';
    }
    if (this.navLeft) this.navLeft.classList.add('hidden');
    if (this.navRight) this.navRight.classList.add('hidden');
    if (this.navBottom) this.navBottom.classList.add('hidden');

    const execute = async () => {
      // 1. Obtener capa de disolución cruzada
      let crossfadeLayer = this.crossfadeLayer || document.getElementById('scene-crossfade-layer');
      if (!crossfadeLayer) {
        crossfadeLayer = document.createElement('div');
        crossfadeLayer.id = 'scene-crossfade-layer';
        crossfadeLayer.className = 'scene-crossfade-layer';
        if (this.sceneBg && this.sceneBg.parentNode) {
          this.sceneBg.parentNode.insertBefore(crossfadeLayer, this.sceneBg.nextSibling);
        }
        this.crossfadeLayer = crossfadeLayer;
      }

      // Obtener ruta de fondo de la escena destino
      const customConfig = SCENE_CUSTOM_CONFIG[targetSceneId] || null;
      const targetBg = customConfig?.bgImage || `assets/levels/${this.currentLevel}/backgrounds/${targetSceneId}.webp`;

      // 2. Pre-decodificar la imagen antes de iniciar para garantizar renderizado inmediato del fundido
      try {
        const preImg = new Image();
        preImg.src = targetBg;
        if (preImg.decode) {
          await preImg.decode();
        }
      } catch (e) {}

      // 3. Reproducir sonido de puerta al abrirse
      this.playCreakingDoorSound();

      // 4. Configurar la capa con opacidad 0 inicial sin transición
      crossfadeLayer.style.backgroundImage = `url('${targetBg}')`;
      crossfadeLayer.style.backgroundSize = customConfig?.bgSize || 'cover';
      crossfadeLayer.style.backgroundPosition = customConfig?.bgPosition || 'center center';
      crossfadeLayer.style.transition = 'none';
      crossfadeLayer.style.opacity = '0';

      // Forzar reflow en el navegador para registrar el punto de partida (0% opacidad)
      void crossfadeLayer.offsetWidth;

      // 5. Iniciar la disolución progresiva durante 1.8 segundos
      crossfadeLayer.style.transition = 'opacity 1.8s ease-in-out';
      crossfadeLayer.style.opacity = '1';

      // 6. Consolidar el cambio de escena tras completarse el fundido suave
      setTimeout(() => {
        // Cargar oficialmente la nueva escena
        this.loadScene(this.currentLevel, targetSceneId);

        // Actualizar partida guardada
        const saveState = Storage.getSaveGame();
        if (saveState) {
          saveState.scene = targetSceneId;
          saveState.updatedAt = new Date().toISOString();
          Storage.setSaveGame(saveState);
        }

        // Restablecer capa de disolución (sceneBg ya tiene el fondo idéntico)
        crossfadeLayer.style.transition = 'none';
        crossfadeLayer.style.opacity = '0';
        crossfadeLayer.style.backgroundImage = 'none';

        if (this.sceneOverlays) {
          this.sceneOverlays.style.transition = '';
          this.sceneOverlays.style.opacity = '1';
          this.sceneOverlays.style.pointerEvents = '';
        }

        this.isTransitioning = false;
      }, 1850);
    };

    if (delay > 0) {
      setTimeout(execute, delay);
    } else {
      execute();
    }
  },

  /**
   * Carga una escena específica de un nivel dado.
   */
  loadScene(levelId, sceneId) {
    let level = levelId;
    let scene = sceneId;

    if (!level || level === 'level_01_sotano') level = 'level_01_bsmnt';
    if (!scene || scene === 'L1_S01_main') scene = 'bsmnt_01_main';

    this.currentLevel = level;
    this.currentScene = scene;

    if (!this.viewGame) this.init();

    if (!this.isTransitioning) {
      if (this.doorCurtain) {
        this.doorCurtain.classList.remove('fade-to-black', 'fade-from-black');
      }
      const transCurtain = this.transitionCurtain || document.getElementById('scene-transition-curtain');
      if (transCurtain) {
        transCurtain.classList.remove('fade-to-black');
      }
    }

    // Ocultar mensaje previo si hubiera
    this.hideMessage();

    const saveState = Storage.getSaveGame();
    if (scene === 'bsmnt_02_main' && saveState?.puzzleFlags?.padlock_unlocked) {
      scene = 'bsmnt_02_main_open';
      this.currentScene = scene;
    }
    if ((scene === 'bsmnt_01_med_chest_close_up' || scene === 'bsmnt_01_med_chest_open') && saveState?.puzzleFlags?.med_chest_unlocked) {
      scene = 'bsmnt_01_med_chest_close_up_open';
      this.currentScene = scene;
    }
    if ((scene === 'bsmnt_02_trunk_closeup' || scene === 'bsmnt_02_trunk_closeup_open') && (saveState?.puzzleFlags?.trunk_acid_used || saveState?.puzzleFlags?.trunk_02_open)) {
      scene = 'bsmnt_02_trunk_closeup_open';
      this.currentScene = scene;
    }
    if ((scene === 'bsmnt_01_light_box' || scene === 'bsmnt_01_light_box_open') && saveState?.puzzleFlags?.light_box_open) {
      scene = 'bsmnt_01_light_box_open';
      this.currentScene = scene;
    }

    // Resolver ruta del fondo y encuadre (custom o estándar)
    const customConfig = SCENE_CUSTOM_CONFIG[scene] || null;
    let bgPath = customConfig?.bgImage || `assets/levels/${level}/backgrounds/${scene}.webp`;

    if ((scene === 'bsmnt_01_light_box' || scene === 'bsmnt_01_light_box_open') && saveState?.puzzleFlags?.light_box_open) {
      bgPath = 'assets/levels/level_01_bsmnt/backgrounds/bsmnt_01_light_box_open.webp';
    }

    // Cargar fondo en la capa visual con su encuadre específico
    if (this.sceneBg) {
      if (customConfig?.bgImage === 'none') {
        this.sceneBg.style.backgroundImage = 'none';
        this.sceneBg.style.backgroundColor = customConfig?.bgColor || '#000000';
      } else {
        this.sceneBg.style.backgroundColor = 'transparent';
        this.sceneBg.style.backgroundImage = `url('${bgPath}')`;
        this.sceneBg.style.backgroundSize = customConfig?.bgSize || 'cover';
        this.sceneBg.style.backgroundPosition = customConfig?.bgPosition || 'center center';
      }
    }

    // Activar vista del juego
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    if (this.viewGame) {
      this.viewGame.classList.add('active');
    }

    // Ocultar overlays brevemente mientras el fondo termina de decodificarse para que aparezcan sincronizados
    if (this.sceneOverlays) {
      this.sceneOverlays.style.opacity = '0';
    }

    // Renderizar hotspots interactivos de la escena
    this.renderHotspots();

    let revealed = false;
    const revealOverlays = () => {
      if (revealed) return;
      revealed = true;
      if (this.sceneOverlays) {
        this.sceneOverlays.style.opacity = '1';
      }
    };

    if (customConfig?.bgImage === 'none') {
      revealOverlays();
    } else {
      const bgImg = new Image();
      bgImg.onload = () => { revealOverlays(); bgImg.onload = null; bgImg.onerror = null; };
      bgImg.onerror = () => { revealOverlays(); bgImg.onload = null; bgImg.onerror = null; };
      bgImg.src = bgPath;
      if (bgImg.decode) {
        bgImg.decode().then(revealOverlays).catch(revealOverlays);
      }
      setTimeout(revealOverlays, 120);
    }

    // Si la escena es el criptex, montar el tablero de rotación
    if (scene === 'bsmnt_01_cryptex') {
      CryptexPuzzle.mount(this.sceneOverlays);
    } else {
      CryptexPuzzle.unmount();
    }

    // Si la escena es el panel de conexiones del cuadro de luces, montar el puzzle
    if (scene === 'bsmnt_01_light_box_panel') {
      LightBoxWiresPuzzle.mount(this.sceneOverlays);
    } else {
      LightBoxWiresPuzzle.unmount();
    }

    // Actualizar chevrons de navegación según salidas disponibles
    this.updateNavigationUI();

    // Actualizar tutorial interactivo en juego
    if (this.tutorialStep > 0) {
      this.updateTutorialState(scene);
    } else if (this.isTouchDevice && scene === 'bsmnt_01_main') {
      const isCompleted = localStorage.getItem('blackwood_interactive_tutorial_completed') === 'true';
      if (!isCompleted) {
        this.tutorialStep = 1;
        this.updateTutorialState(scene);
      }
    } else if (!this.isTouchDevice) {
      this.checkInitialHint();
    }

    // Notificar al sistema de motas de polvo la escena actual
    DustController.setScene(scene);

    // Comprobar y disparar hitos musicales (piano.mp3) y arranque de ambiente
    this.checkMusicMilestones(scene);

    // Al entrar por primera vez a bsmnt_02_drums_closeup, registrar apunte en el diario y mostrar pensamiento
    if (scene === 'bsmnt_02_drums_closeup') {
      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
      if (!saveState.puzzleFlags.drums_dices_inspected) {
        saveState.puzzleFlags.drums_dices_inspected = true;
        Storage.setSaveGame(saveState);

        const doc = GAME_DOCUMENTS['doc_bsmnt_drum_dices'];
        if (doc) {
          DiaryManager.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }

        setTimeout(() => {
          this.showMessage('Qué raro, estos dados parecen fuera de lugar aquí, haré un dibujo de ellos', 5000);
        }, 350);
      }
    }

    // Al entrar a la visualización de los naipes en bsmnt_01_cards, registrar en el diario si no se ha hecho
    if (scene === 'bsmnt_01_cards' || scene === 'bsmnt_01_cards_close_up') {
      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
      if (!saveState.puzzleFlags.cards_inspected) {
        saveState.puzzleFlags.cards_inspected = true;
        Storage.setSaveGame(saveState);

        const doc = GAME_DOCUMENTS['doc_bsmnt_cards'];
        if (doc) {
          DiaryManager.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }
      }
    }

    // Al entrar a la visualización del botiquín abierto, registrar apunte en el diario si no se ha hecho
    if (scene === 'bsmnt_01_med_chest_close_up_open' || scene === 'bsmnt_01_med_chest_open') {
      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
      if (!saveState.puzzleFlags.med_chest_colors_inspected) {
        saveState.puzzleFlags.med_chest_colors_inspected = true;
        Storage.setSaveGame(saveState);

        const doc = GAME_DOCUMENTS['doc_bsmnt_chest_colors'];
        if (doc && window.DiaryManager) {
          window.DiaryManager.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }
      }
    }

    // Al entrar a la visualización del barril con las fichas en bsmnt_01_dice, registrar en el diario si no se ha hecho
    if (scene === 'bsmnt_01_dice' || scene === 'bsmnt_01_chips' || scene === 'bsmnt_01_barrel') {
      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
      if (!saveState.puzzleFlags.barrel_chips_inspected && !saveState.puzzleFlags.chips_inspected) {
        saveState.puzzleFlags.barrel_chips_inspected = true;
        saveState.puzzleFlags.chips_inspected = true;
        Storage.setSaveGame(saveState);

        const doc = GAME_DOCUMENTS['doc_bsmnt_chips'] || GAME_DOCUMENTS['bsmnt_chips'];
        const diaryMgr = window.DiaryManager || DiaryManager;
        if (doc && diaryMgr) {
          diaryMgr.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }

        setTimeout(() => {
          this.showMessage('Unas fichas de casino sobre el barril... haré un apunte en mi cuaderno.', 5000);
        }, 350);
      }
    }

    console.log(`Escena cargada: [${level} / ${scene}] -> ${bgPath}`);
  },

  /**
   * Asegura que la música de gameplay (Room_Without_Windows en bucle) esté activa.
   */
  checkMusicMilestones(sceneId) {
    if (!AudioController.isInGameplay) {
      AudioController.startGameplayAudio();
    }
  },

  /**
   * Renderiza las áreas interactivas (hotspots) en la capa de overlays.
   */
  renderHotspots() {
    if (!this.sceneOverlays) return;
    while (this.sceneOverlays.firstChild) {
      this.sceneOverlays.removeChild(this.sceneOverlays.firstChild);
    }

    const hotspots = this.getHotspotsForCurrentScene();
    hotspots.forEach((h) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scene-hotspot';
      btn.id = h.id;
      if (h.ariaLabel) {
        btn.setAttribute('aria-label', h.ariaLabel);
      }
      btn.dataset.action = h.action || '';
      if (h.targetScene) {
        btn.dataset.targetScene = h.targetScene;
      }

      // Posicionamiento porcentual exacto sobre la base 1920x1080
      btn.style.left = `${(h.x_pct * 100).toFixed(4)}%`;
      btn.style.top = `${(h.y_pct * 100).toFixed(4)}%`;
      btn.style.width = `${(h.w_pct * 100).toFixed(4)}%`;
      btn.style.height = `${(h.h_pct * 100).toFixed(4)}%`;

      // Si el martillo ya fue recogido del baúl, no mostrarlo
      if (h.id === 'hotspot_trunk_hammer') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.hammer_picked) {
          return;
        }
      }

      // Si la llave ya fue recogida del baúl, no mostrarla
      if (h.id === 'hotspot_trunk_key') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.key_door_03_picked || saveState?.puzzleFlags?.has_key_door_03 || saveState?.inventory?.some(i => i.id === 'key_door_03')) {
          return;
        }
      }

      // Si la chaqueta ya fue recogida de los palés en bsmnt_02_main o bsmnt_02_main_open, no mostrarla
      if (h.id === 'hotspot_main_jacket' || h.id === 'hotspot_main_open_jacket' || h.id === 'hotspot_drums_jacket' || h.action === 'pick_jacket') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.jacket_picked ||
          saveState?.puzzleFlags?.has_jacket ||
          saveState?.inventory?.some(i => i.id === 'jacket' || i.id === 'bsmnt_jacket' || i.id === 'chaqueta')
        ) {
          return;
        }
        btn.dataset.pixelX = '1585';
        btn.dataset.pixelY = '600';
        btn.dataset.pixelW = '337';
        btn.dataset.pixelH = '481';
        btn.style.backgroundSize = '100% 100%';
      }

      // Si la llave inglesa ya fue recogida de la caja, no mostrarla en bsmnt_01_wrech_box
      if (h.id === 'hotspot_wrech_box_wrench' || h.action === 'pick_wrench') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.wrench_picked ||
          saveState?.puzzleFlags?.has_wrench ||
          saveState?.inventory?.some(i => i.id === 'wrench' || i.id === 'bsmnt_wrench' || i.id === 'llave_inglesa')
        ) {
          return;
        }
        btn.dataset.pixelX = '471';
        btn.dataset.pixelY = '342';
        btn.dataset.pixelW = '706';
        btn.dataset.pixelH = '212';
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
      }

      // Si la palanca ya fue recogida en bsmnt_01_pale, o si el palé aún no ha sido retirado, no mostrarla
      if (h.id === 'hotspot_pale_crowbar' || h.action === 'pick_crowbar') {
        const saveState = Storage.getSaveGame();
        if (
          !saveState?.puzzleFlags?.pallet_moved ||
          saveState?.puzzleFlags?.crowbar_picked ||
          saveState?.puzzleFlags?.has_crowbar ||
          saveState?.inventory?.some(i => i.id === 'crowbar' || i.id === 'bsmnt_crowbar' || i.id === 'palanca')
        ) {
          return;
        }
        btn.dataset.pixelX = '885';
        btn.dataset.pixelY = '984';
        btn.dataset.pixelW = '287';
        btn.dataset.pixelH = '80';
        btn.style.left = '46.1042%';
        btn.style.top = '91.1296%';
        btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_stage_crowbar.webp')";
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
      }

      // Palé cargado en bsmnt_01_pale
      if (h.id === 'hotspot_pale_pallet' || h.action === 'pale_pallet') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.pallet_moved) {
          return;
        }
        btn.dataset.pixelX = '794';
        btn.dataset.pixelY = '589';
        btn.dataset.pixelW = '570';
        btn.dataset.pixelH = '491';
        btn.style.left = '41.3542%';
        btn.style.top = '54.5370%';
        btn.style.width = '29.6875%';
        btn.style.height = '45.4630%';
        const hasTruck = Boolean(saveState?.puzzleFlags?.pallet_has_truck);
        const bgImg = hasTruck
          ? 'assets/levels/level_01_bsmnt/overlays/bsmnt_pallet_2.webp'
          : 'assets/levels/level_01_bsmnt/overlays/bsmnt_stage_pallet.webp';
        btn.style.backgroundImage = `url('${bgImg}')`;
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.style.zIndex = '10';
        btn.setAttribute('aria-label', hasTruck ? 'Palé con traspaleta lista para mover' : 'Palé cargado de bloques');
      }

      // Hotspots de la caja de herramientas en la puerta a sala 3
      if (h.id === 'hotspot_door_03_wrench_box' || h.id === 'hotspot_door_03_dark_wrench_box' || h.id === 'hotspot_door_03_light_wrench_box') {
        btn.dataset.pixelX = '75';
        btn.dataset.pixelY = '660';
        btn.dataset.pixelW = '305';
        btn.dataset.pixelH = '175';
      }

      // Rueda de la silla de ruedas en bsmnt_03_wheelchair
      if (h.id === 'hotspot_wheelchair_wheel' || h.action === 'wheelchair_wheel') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.wheel_picked ||
          saveState?.puzzleFlags?.has_wheel ||
          saveState?.puzzleFlags?.wheelchair_wheel_detached ||
          saveState?.inventory?.some(i => i.id === 'wheel' || i.id === 'bsmnt_wheel' || i.id === 'rueda')
        ) {
          return;
        }
        btn.dataset.pixelX = '910';
        btn.dataset.pixelY = '761';
        btn.dataset.pixelW = '205';
        btn.dataset.pixelH = '258';
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
      }

      // Puerta hacia los vestuarios / Overlay de tablones en bsmnt_03_main
      if (h.id === 'hotspot_bsmnt_03_planks') {
        const saveState = Storage.getSaveGame();
        const isPlanksRemoved = Boolean(saveState?.puzzleFlags?.planks_removed || saveState?.puzzleFlags?.door_planks_pried);

        btn.dataset.pixelX = '1114';
        btn.dataset.pixelW = '203';
        btn.style.left = '58.0208%';
        btn.style.width = '10.5729%';
        btn.style.zIndex = '5';

        if (isPlanksRemoved) {
          // Tablones retirados: hotspot transparente activo sobre toda la puerta
          btn.dataset.pixelY = '415';
          btn.dataset.pixelH = '310';
          btn.style.top = '38.4259%';
          btn.style.height = '28.7037%';
          btn.style.backgroundImage = 'none';
          btn.classList.remove('has-bg-image');
          btn.setAttribute('aria-label', 'Puerta hacia los vestuarios');
        } else {
          // Tablones presentes: se muestra el overlay con los maderos clavados
          btn.dataset.pixelY = '449';
          btn.dataset.pixelH = '254';
          btn.style.top = '41.5741%';
          btn.style.height = '23.5185%';
          btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_stage_planks.webp')";
          btn.style.backgroundSize = '100% 100%';
          btn.style.backgroundRepeat = 'no-repeat';
          btn.style.backgroundPosition = 'center';
          btn.classList.add('has-bg-image');
          btn.setAttribute('aria-label', 'Examinar puerta tapiada con tablones');
        }
      }

      // Perchero en bsmnt_03_main
      if (h.id === 'hotspot_bsmnt_03_coat_stand') {
        btn.dataset.pixelX = '1410';
        btn.dataset.pixelY = '430';
        btn.dataset.pixelW = '140';
        btn.dataset.pixelH = '455';
        btn.style.left = '73.4375%';
        btn.style.top = '39.8148%';
        btn.style.width = '7.2917%';
        btn.style.height = '42.1296%';
      }

      // Overlay de la chaqueta en el perchero en bsmnt_03_main (solo visible tras colocar la chaqueta en el perchero)
      if (h.id === 'hotspot_bsmnt_03_main_jacket') {
        const saveState = Storage.getSaveGame();
        const isHung = Boolean(saveState?.puzzleFlags?.jacket_hung_on_stand);
        if (!isHung) {
          return;
        }
        btn.dataset.pixelX = '1446';
        btn.dataset.pixelY = '540';
        btn.dataset.pixelW = '111';
        btn.dataset.pixelH = '189';
        btn.style.left = '75.3125%';
        btn.style.top = '50%';
        btn.style.width = '5.78125%';
        btn.style.height = '17.5%';
        btn.style.zIndex = '4';
        btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_03_main_jacket.webp')";
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.setAttribute('aria-label', 'Chaqueta colgada en el perchero');
      }

      // Puerta bajo la escalera en bsmnt_03_main (solo visible tras colocar la chaqueta en el perchero)
      if (h.id === 'hotspot_bsmnt_03_under_stairs_door' || h.action === 'under_stairs_door') {
        btn.dataset.pixelX = '316';
        btn.dataset.pixelY = '563';
        btn.dataset.pixelW = '170';
        btn.dataset.pixelH = '290';
        btn.style.left = '16.4583%';
        btn.style.top = '52.1296%';
        btn.style.width = '8.8542%';
        btn.style.height = '26.8519%';
        btn.style.zIndex = '3';
        const saveState = Storage.getSaveGame();
        const isOpen = Boolean(saveState?.puzzleFlags?.jacket_hung_on_stand);
        if (isOpen) {
          btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_03_open_door.webp')";
          btn.style.backgroundSize = '100% 100%';
          btn.style.backgroundRepeat = 'no-repeat';
          btn.style.backgroundPosition = 'center';
          btn.setAttribute('aria-label', 'Entrar bajo la escalera');
        } else {
          btn.style.background = 'transparent';
          btn.style.backgroundImage = 'none';
          btn.setAttribute('aria-label', 'Puerta bajo la escalera');
        }
      }

      // Overlay de la chaqueta en el perchero en bsmnt_03_coat_stand
      if (h.id === 'hotspot_coat_stand_jacket' || h.action === 'coat_stand_jacket') {
        btn.dataset.pixelX = '938';
        btn.dataset.pixelY = '583';
        btn.dataset.pixelW = '319';
        btn.dataset.pixelH = '497';
        btn.style.left = '48.8542%';
        btn.style.top = '53.9815%';
        btn.style.width = '16.6146%';
        btn.style.height = '46.0185%';
        btn.style.zIndex = '5';
        const saveState = Storage.getSaveGame();
        const isHung = Boolean(saveState?.puzzleFlags?.jacket_hung_on_stand);
        if (isHung) {
          btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_03_jacket.webp')";
          btn.style.backgroundSize = '100% 100%';
          btn.style.backgroundRepeat = 'no-repeat';
          btn.style.backgroundPosition = 'center';
          btn.setAttribute('aria-label', 'Chaqueta colgada en el perchero');
        } else {
          btn.style.background = 'transparent';
          btn.style.backgroundImage = 'none';
          btn.setAttribute('aria-label', 'Gancho del perchero');
        }
      }

      // Overlay de la tubería en el cubo en bsmnt_03_under_stairs
      if (h.id === 'hotspot_under_stairs_pipe' || h.action === 'pick_pipe' || h.action === 'under_stairs_pipe') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.pipe_picked ||
          saveState?.puzzleFlags?.has_pipe ||
          saveState?.inventory?.some(i => i.id === 'pipe' || i.id === 'bsmnt_pipe' || i.id === 'tuberia')
        ) {
          return;
        }
        btn.dataset.pixelX = '950';
        btn.dataset.pixelY = '659';
        btn.dataset.pixelW = '159';
        btn.dataset.pixelH = '102';
        btn.style.left = '49.4792%';
        btn.style.top = '61.0185%';
        btn.style.width = '8.2813%';
        btn.style.height = '9.4444%';
        btn.style.zIndex = '3';
        btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_03_stage_pipe.webp')";
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.setAttribute('aria-label', 'Recoger tramo de tubería');
      }

      // Tubería vertical y pieza en U en bsmnt_01_main (acceso a bsmnt_01_pipes)
      if (h.id === 'hotspot_bsmnt_01_pipes') {
        btn.dataset.pixelX = '325';
        btn.dataset.pixelY = '135';
        btn.dataset.pixelW = '62';
        btn.dataset.pixelH = '355';
        btn.style.left = '16.9271%';
        btn.style.top = '12.5%';
        btn.style.width = '3.2292%';
        btn.style.height = '32.8704%';
        btn.style.zIndex = '5';
      }

      // Overlay de la tubería en el hueco en bsmnt_01_pipes
      if (h.id === 'hotspot_pipes_stage_pipe' || h.action === 'pipes_stage_pipe') {
        const saveState = Storage.getSaveGame();
        const isPlaced = Boolean(saveState?.puzzleFlags?.pipe_placed);

        btn.dataset.pixelX = '935';
        btn.dataset.pixelY = '534';
        btn.dataset.pixelW = '283';
        btn.dataset.pixelH = '294';
        btn.style.left = '48.6979%';
        btn.style.top = '49.4444%';
        btn.style.width = '14.7396%';
        btn.style.height = '27.2222%';
        btn.style.zIndex = '5';
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';

        if (isPlaced) {
          btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_01_stage_pipe.webp')";
          btn.style.opacity = '1';
          btn.setAttribute('aria-label', 'Tramo de tubería con llave de paso instalado');
        } else {
          btn.style.backgroundImage = 'none';
          btn.style.opacity = '0';
          btn.setAttribute('aria-label', 'Hueco en la tubería');
        }
      }

      // Puerta hacia los vestuarios en bsmnt_03_door_to_locker_room
      if (h.id === 'hotspot_locker_room_door') {
        btn.dataset.pixelX = '726';
        btn.dataset.pixelY = '66';
        btn.dataset.pixelW = '647';
        btn.dataset.pixelH = '962';
        btn.style.left = '37.8125%';
        btn.style.top = '6.1111%';
        btn.style.width = '33.6979%';
        btn.style.height = '89.0741%';
        btn.style.zIndex = '3';
      }

      // Overlay de tablones en la puerta en bsmnt_03_door_to_locker_room
      if (h.id === 'hotspot_door_to_locker_room_planks' || h.action === 'door_planks') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.door_planks_pried || saveState?.puzzleFlags?.planks_removed) {
          return;
        }
        btn.dataset.pixelX = '726';
        btn.dataset.pixelY = '66';
        btn.dataset.pixelW = '647';
        btn.dataset.pixelH = '962';
        btn.style.left = '37.8125%';
        btn.style.top = '6.1111%';
        btn.style.width = '33.6979%';
        btn.style.height = '89.0741%';
        btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_door_to_locker_planks.webp')";
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.style.zIndex = '5';
      }

      // Si el pomo ya fue recogido del banco, no mostrarlo
      if (h.id === 'hotspot_bench_handle') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.handle_picked || saveState?.puzzleFlags?.has_handle || saveState?.inventory?.some(i => i.id === 'handle' || i.id === 'bsmnt_handle')) {
          return;
        }
        btn.dataset.pixelX = '653';
        btn.dataset.pixelY = '902';
        btn.dataset.pixelW = '86';
        btn.dataset.pixelH = '121';
        btn.style.left = '34%';
        btn.style.top = '83.5%';
        btn.style.width = '4.46%';
        btn.style.zIndex = '35';
      }

      // Fotografía Polaroid sobre el baúl en bsmnt_01_trunk
      if (h.id === 'hotspot_trunk_polaroid') {
        btn.dataset.pixelX = '905';
        btn.dataset.pixelY = '536';
        btn.dataset.pixelW = '187';
        btn.dataset.pixelH = '98';
        btn.style.top = '49.65%';
      }

      // Fotografía familiar en el banco en bsmnt_01_bench_closeup
      if (h.id === 'hotspot_bench_photo') {
        btn.dataset.pixelX = '1380';
        btn.dataset.pixelY = '795';
        btn.dataset.pixelW = '170';
        btn.dataset.pixelH = '70';
        btn.style.zIndex = '35';
        btn.style.cursor = 'pointer';
      }

      // Estantería en bsmnt_01_bench
      if (h.id === 'hotspot_bench_to_shelf') {
        btn.dataset.pixelX = '273';
        btn.dataset.pixelY = '567';
        btn.dataset.pixelW = '492';
        btn.dataset.pixelH = '491';
      }

      // Banco en bsmnt_01_bench
      if (h.id === 'hotspot_bench_to_bench') {
        btn.dataset.pixelX = '806';
        btn.dataset.pixelY = '615';
        btn.dataset.pixelW = '1008';
        btn.dataset.pixelH = '448';
      }

      // Retrato de Julian en bsmnt_01_bench
      if (h.id === 'hotspot_bench_to_painting') {
        btn.dataset.pixelX = '1093';
        btn.dataset.pixelY = '0';
        btn.dataset.pixelW = '452';
        btn.dataset.pixelH = '556';
        btn.style.zIndex = '5';
      }

      // Naipes en el bolsillo del retrato en bsmnt_01_bench
      if (h.id === 'hotspot_bench_cards') {
        btn.dataset.pixelX = '1191';
        btn.dataset.pixelY = '384';
        btn.dataset.pixelW = '68';
        btn.dataset.pixelH = '31';
        btn.style.zIndex = '10';
      }

      // Carta en la estantería en bsmnt_01_shelf
      if (h.id === 'hotspot_shelf_document') {
        btn.dataset.pixelX = '760';
        btn.dataset.pixelY = '625';
        btn.dataset.pixelW = '230';
        btn.dataset.pixelH = '170';
        btn.style.zIndex = '35';
        btn.style.cursor = 'pointer';
      }

      // Naipes en el bolsillo del retrato en bsmnt_01_bench_painting
      if (h.id === 'hotspot_julian_portrait_cards' || h.id === 'hotspot_painting_cards') {
        btn.dataset.pixelX = '852';
        btn.dataset.pixelY = '563';
        btn.dataset.pixelW = '100';
        btn.dataset.pixelH = '46';
        btn.style.zIndex = '10';
      }

      // Marco del retrato de Julian en bsmnt_01_bench_painting
      if (h.id === 'hotspot_julian_portrait_frame') {
        btn.dataset.pixelX = '719';
        btn.dataset.pixelY = '29';
        btn.dataset.pixelW = '645';
        btn.dataset.pixelH = '792';
        btn.style.zIndex = '5';
      }

      // Visualización ampliada de los naipes en bsmnt_01_cards
      if (h.id === 'hotspot_bsmnt_cards_overlay') {
        btn.dataset.pixelX = '448';
        btn.dataset.pixelY = '194';
        btn.dataset.pixelW = '1024';
        btn.dataset.pixelH = '692';
        btn.style.backgroundSize = 'contain';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
      }

      // Si los cables ya fueron recogidos del cajón abierto, no mostrarlos
      if (h.id === 'hotspot_chest_wires') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.wires_picked || saveState?.puzzleFlags?.has_wires || saveState?.inventory?.some(i => i.id === 'wires' || i.id === 'bsmnt_wires')) {
          return;
        }
        btn.dataset.pixelX = '527';
        btn.dataset.pixelY = '418';
        btn.dataset.pixelW = '382';
        btn.dataset.pixelH = '326';
      }

      // Si la bombilla ya fue recogida del cajón abierto, no mostrarla
      if (h.id === 'hotspot_chest_bulb') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.bulb_picked || saveState?.puzzleFlags?.has_bulb || saveState?.inventory?.some(i => i.id === 'bulb' || i.id === 'bsmnt_bulb')) {
          return;
        }
        btn.dataset.pixelX = '1106';
        btn.dataset.pixelY = '402';
        btn.dataset.pixelW = '279';
        btn.dataset.pixelH = '178';
      }

      // Si la llave del candado ya fue recogida sobre las cajas, no mostrarla
      if (h.id === 'hotspot_boxes_key_padlock') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.key_padlock_picked || saveState?.puzzleFlags?.has_key_padlock || saveState?.inventory?.some(i => i.id === 'key_padlock' || i.id === 'bsmnt_key_to_padlock')) {
          return;
        }
        btn.dataset.pixelX = '688';
        btn.dataset.pixelY = '880';
        btn.dataset.pixelW = '331';
        btn.dataset.pixelH = '122';
      }

      // Candado de la puerta en bsmnt_02_main
      if (h.id === 'hotspot_main_padlock') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.padlock_unlocked) {
          return;
        }
        btn.dataset.pixelX = '955';
        btn.dataset.pixelY = '440';
        btn.dataset.pixelW = '65';
        btn.dataset.pixelH = '115';
      }

      // Candado cerrado en primer plano (bsmnt_02_padlock)
      if (h.id === 'hotspot_padlock') {
        btn.dataset.pixelX = '870';
        btn.dataset.pixelY = '240';
        btn.dataset.pixelW = '460';
        btn.dataset.pixelH = '640';
      }

      // Escritorio en bsmnt_02_main y bsmnt_02_main_open
      if (h.id === 'hotspot_main_desktop' || h.id === 'hotspot_main_open_desktop') {
        btn.dataset.pixelX = '1012';
        btn.dataset.pixelY = '470';
        btn.dataset.pixelW = '573';
        btn.dataset.pixelH = '515';
      }

      // Cuaderno sobre el escritorio en bsmnt_02_desktop_closeup y bsmnt_02_drawer
      if (h.id === 'hotspot_desktop_notebook' || h.id === 'hotspot_drawer_notebook') {
        btn.dataset.pixelX = '345';
        btn.dataset.pixelY = '300';
        btn.dataset.pixelW = '535';
        btn.dataset.pixelH = '300';
      }

      // Overlay que oculta el tirador del cajón superior en bsmnt_02_desktop_closeup
      if (h.id === 'hotspot_desktop_drawer_no_handle') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.drawer_handle_placed) {
          return;
        }
        btn.dataset.pixelX = '889';
        btn.dataset.pixelY = '441';
        btn.dataset.pixelW = '180';
        btn.dataset.pixelH = '165';
        btn.style.left = '46.30%';
        btn.style.top = '40.87%';
      }

      // Cajón superior del escritorio en bsmnt_02_desktop_closeup
      if (h.id === 'hotspot_desktop_top_drawer') {
        btn.dataset.pixelX = '810';
        btn.dataset.pixelY = '395';
        btn.dataset.pixelW = '310';
        btn.dataset.pixelH = '195';
      }

      // Llaves del botiquín en el cajón abierto en bsmnt_02_drawer
      if (h.id === 'hotspot_drawer_keys_med_chest') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.keys_med_chest_picked ||
          saveState?.puzzleFlags?.has_keys_med_chest ||
          saveState?.puzzleFlags?.key_med_chest_picked ||
          saveState?.puzzleFlags?.has_key_med_chest ||
          saveState?.inventory?.some(i => i.id === 'keys_med_chest' || i.id === 'key_med_chest' || i.id === 'bsmnt_keys_to_med_chest' || i.id === 'bsmnt_key_to_med_chest')
        ) {
          return;
        }
        btn.dataset.pixelX = '1057';
        btn.dataset.pixelY = '542';
        btn.dataset.pixelW = '47';
        btn.dataset.pixelH = '128';
        btn.style.left = '55.0729%';
        btn.style.top = '50.1852%';
        btn.style.width = '2.4479%';
        btn.style.height = '11.8519%';
      }

      // Abertura de la puerta abierta en bsmnt_02_main_open
      if (h.id === 'hotspot_main_open_doorway') {
        btn.dataset.pixelX = '705';
        btn.dataset.pixelY = '145';
        btn.dataset.pixelW = '290';
        btn.dataset.pixelH = '635';
      }

      // Traspaleta en bsmnt_02_pallet_truck
      if (h.id === 'hotspot_pallet_truck') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.pallet_truck_picked ||
          saveState?.puzzleFlags?.has_pallet_truck ||
          saveState?.inventory?.some(i => i.id === 'pallet_truck' || i.id === 'bsmnt_pallet_truck')
        ) {
          return;
        }
        btn.dataset.pixelX = '1046';
        btn.dataset.pixelY = '360';
        btn.dataset.pixelW = '283';
        btn.dataset.pixelH = '666';

        if (saveState?.puzzleFlags?.pallet_truck_repaired) {
          btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_pallet_truck_complete.webp')";
          btn.setAttribute('aria-label', 'Recoger traspaleta');
          btn.classList.add('has-bg-image');
        }
      }

      // Baúl y candado en bsmnt_02_trunk
      if (h.id === 'hotspot_trunk_box') {
        btn.dataset.pixelX = '1045';
        btn.dataset.pixelY = '430';
        btn.dataset.pixelW = '760';
        btn.dataset.pixelH = '520';
      }
      if (h.id === 'hotspot_trunk_padlock') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.trunk_acid_used || saveState?.puzzleFlags?.trunk_02_open) {
          return;
        }
        btn.dataset.pixelX = '1205';
        btn.dataset.pixelY = '541';
        btn.dataset.pixelW = '117';
        btn.dataset.pixelH = '209';
      }

      // Candado del arcón en primer plano (bsmnt_02_trunk_closeup)
      if (h.id === 'hotspot_trunk_closeup_padlock') {
        btn.dataset.pixelX = '900';
        btn.dataset.pixelY = '440';
        btn.dataset.pixelW = '180';
        btn.dataset.pixelH = '420';
      }

      // Interruptor en el interior del arcón abierto (bsmnt_02_trunk_closeup_open)
      if (h.id === 'hotspot_trunk_switch') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.switch_picked ||
          saveState?.puzzleFlags?.has_switch ||
          saveState?.inventory?.some(i => i.id === 'switch' || i.id === 'bsmnt_switch')
        ) {
          return;
        }
        btn.dataset.pixelX = '1324';
        btn.dataset.pixelY = '474';
        btn.dataset.pixelW = '306';
        btn.dataset.pixelH = '255';
      }

      // El overlay de caja abierta SOLO se muestra si la caja ya ha sido abierta con el martillo
      if (h.id === 'overlay_open_chest') {
        const saveState = Storage.getSaveGame();
        const isOpen = Boolean(saveState?.puzzleFlags?.chest_open || saveState?.puzzleFlags?.med_chest_box_open);
        if (!isOpen) {
          return;
        }
        btn.dataset.pixelX = '690';
        btn.dataset.pixelY = '583';
        btn.dataset.pixelW = '367';
        btn.dataset.pixelH = '202';
      }

      // Lámpara sobre el cuadro en bsmnt_01_painting
      if (h.id === 'hotspot_painting_lamp') {
        btn.dataset.pixelX = '797';
        btn.dataset.pixelY = '22';
        btn.dataset.pixelW = '317';
        btn.dataset.pixelH = '286';
      }

      // Cerradura del botiquín en bsmnt_01_med_chest_close_up
      if (h.id === 'hotspot_med_chest_lock') {
        btn.dataset.pixelX = '723';
        btn.dataset.pixelY = '497';
        btn.dataset.pixelW = '90';
        btn.dataset.pixelH = '119';
      }

      // Frasco de ácido en el botiquín abierto (bsmnt_01_med_chest_close_up_open)
      if (h.id === 'hotspot_med_chest_acid') {
        const saveState = Storage.getSaveGame();
        if (
          saveState?.puzzleFlags?.acid_picked ||
          saveState?.puzzleFlags?.has_acid ||
          saveState?.inventory?.some(i => i.id === 'acid' || i.id === 'bsmnt_acid')
        ) {
          return;
        }
        btn.dataset.pixelX = '859';
        btn.dataset.pixelY = '250';
        btn.dataset.pixelW = '74';
        btn.dataset.pixelH = '154';
      }

      // Hotspot del cuadro en bsmnt_01_main
      if (h.id === 'hotspot_main_painting') {
        btn.dataset.pixelX = '1603';
        btn.dataset.pixelY = '43';
        btn.dataset.pixelW = '221';
        btn.dataset.pixelH = '410';
      }

      // Pomo de la puerta a la Sala 2 en bsmnt_01_door_to_02
      if (h.id === 'hotspot_door_02_knob') {
        btn.dataset.pixelX = '1219';
        btn.dataset.pixelY = '605';
        btn.dataset.pixelW = '125';
        btn.dataset.pixelH = '227';
      }

      // Cuadro de luces en la pared izquierda de bsmnt_01_pale
      if (h.id === 'hotspot_pale_light_box') {
        btn.dataset.pixelX = '360';
        btn.dataset.pixelY = '210';
        btn.dataset.pixelW = '145';
        btn.dataset.pixelH = '225';
      }

      // Panel de conexiones en bsmnt_01_light_box
      if (h.id === 'hotspot_light_box_panel') {
        btn.dataset.pixelX = '1254';
        btn.dataset.pixelY = '393';
        btn.dataset.pixelW = '200';
        btn.dataset.pixelH = '262';
      }

      // Ranura / botón interactivo del interruptor en el cuadro de luces abierto
      if (h.id === 'hotspot_light_box_switch_slot') {
        const saveState = Storage.getSaveGame();
        // Si estamos en bsmnt_01_light_box y el cuadro sigue cerrado, ocultar colisionador
        if (this.currentScene === 'bsmnt_01_light_box' && !saveState?.puzzleFlags?.light_box_open) {
          return;
        }

        btn.dataset.pixelX = '801';
        btn.dataset.pixelY = '304';
        btn.dataset.pixelW = '32';
        btn.dataset.pixelH = '84';

        const isPlaced = Boolean(saveState?.puzzleFlags?.switch_placed);
        const isOn = Boolean(saveState?.puzzleFlags?.switch_on);

        if (isPlaced) {
          btn.classList.add('has-bg-image', 'has-overlay-image');
          const switchImg = isOn ? 'bsmnt_stage_switch_on.webp' : 'bsmnt_stage_switch_off.webp';
          btn.style.backgroundImage = `url('assets/levels/level_01_bsmnt/overlays/${switchImg}')`;
          btn.style.backgroundSize = '100% 100%';
          btn.style.backgroundRepeat = 'no-repeat';
          btn.style.backgroundPosition = 'center';
          const label = isOn ? 'Interruptor magnetotérmico (ON)' : 'Interruptor magnetotérmico (OFF)';
          btn.setAttribute('aria-label', label);
        } else {
          btn.style.backgroundImage = 'none';
          btn.setAttribute('aria-label', 'Ranura para interruptor magnetotérmico');
        }
      }

      // Overlay de la arqueta en bsmnt_02_catch_basin
      if (h.id === 'hotspot_catch_basin') {
        const saveState = Storage.getSaveGame();
        const isPipePlaced = Boolean(saveState?.puzzleFlags?.pipe_placed);
        const isSolved = Boolean(saveState?.puzzleFlags?.providence_solved || saveState?.puzzleFlags?.basin_open);

        btn.dataset.pixelX = '518';
        btn.dataset.pixelY = '136';
        btn.dataset.pixelW = '957';
        btn.dataset.pixelH = '807';
        btn.style.left = '26.9792%';
        btn.style.top = '12.5926%';
        btn.style.width = '49.8438%';
        btn.style.height = '74.7222%';
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';

        let bgUrl = 'assets/levels/level_01_bsmnt/overlays/bsmnt_02_basin_dry.webp';
        if (isSolved) {
          bgUrl = 'assets/levels/level_01_bsmnt/overlays/bsmnt_02_basin_open.webp';
          btn.setAttribute('aria-label', 'Arqueta abierta con la caja desbloqueada');
        } else if (isPipePlaced) {
          bgUrl = 'assets/levels/level_01_bsmnt/overlays/bsmnt_02_basin_closed.webp';
          btn.setAttribute('aria-label', 'Examinar caja flotando en la arqueta (panel con diales)');
        } else {
          btn.setAttribute('aria-label', 'Arqueta con caja en el fondo');
        }

        btn.style.zIndex = '5';
        btn.style.backgroundImage = `url('${bgUrl}')`;
        btn.classList.add('has-bg-image');
      }

      // Overlay de la llave en la caja abierta en bsmnt_02_catch_basin
      if (h.id === 'hotspot_catch_basin_key' || h.action === 'pick_key_to_locker') {
        const saveState = Storage.getSaveGame();
        const isOpen = Boolean(saveState?.puzzleFlags?.providence_solved || saveState?.puzzleFlags?.basin_open);
        const isPicked = Boolean(
          saveState?.puzzleFlags?.key_to_locker_picked ||
          saveState?.puzzleFlags?.has_key_to_locker ||
          saveState?.inventory?.some(i => i.id === 'key_to_locker' || i.id === 'bsmnt_key_to_locker')
        );

        if (!isOpen || isPicked) {
          return;
        }

        btn.dataset.pixelX = '903';
        btn.dataset.pixelY = '553';
        btn.dataset.pixelW = '95';
        btn.dataset.pixelH = '55';
        btn.style.left = '47.0313%';
        btn.style.top = '51.2037%';
        btn.style.width = '4.9479%';
        btn.style.height = '5.0926%';
        btn.style.zIndex = '30';
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_stage_key_in_box.webp')";
        btn.classList.add('has-bg-image');
        btn.setAttribute('aria-label', 'Coger llave antigua');
      }

      // Overlay de la caja flotando en la arqueta en bsmnt_02_drums (958px, 677px, 279px, 155px)
      if (h.id === 'hotspot_drums_catch_basin') {
        const saveState = Storage.getSaveGame();
        const isPipePlaced = Boolean(saveState?.puzzleFlags?.pipe_placed);
        const isBoxOpen = Boolean(saveState?.puzzleFlags?.providence_solved || saveState?.puzzleFlags?.basin_open);

        btn.dataset.pixelX = '958';
        btn.dataset.pixelY = '677';
        btn.dataset.pixelW = '279';
        btn.dataset.pixelH = '155';
        btn.style.left = `${(958 / 1920 * 100).toFixed(4)}%`;
        btn.style.top = `${(677 / 1080 * 100).toFixed(4)}%`;
        btn.style.width = `${(279 / 1920 * 100).toFixed(4)}%`;
        btn.style.height = `${(155 / 1080 * 100).toFixed(4)}%`;

        if (isPipePlaced) {
          const bgUrl = isBoxOpen
            ? 'assets/levels/level_01_bsmnt/overlays/bsmnt_box_open.webp'
            : 'assets/levels/level_01_bsmnt/overlays/bsmnt_box_closed.webp';
          btn.style.backgroundImage = `url('${bgUrl}')`;
          btn.style.backgroundSize = 'contain';
          btn.style.backgroundRepeat = 'no-repeat';
          btn.style.backgroundPosition = 'center';
          btn.classList.add('has-bg-image');
          btn.setAttribute('aria-label', isBoxOpen ? 'Examinar arqueta (caja abierta)' : 'Examinar caja flotando en la arqueta');
        } else {
          btn.style.backgroundImage = 'none';
          btn.classList.remove('has-bg-image');
          btn.setAttribute('aria-label', 'Examinar arqueta');
        }
      }

      // Hotspot de la taquilla en bsmnt_03_locker_room
      if (h.id === 'hotspot_bsmnt_03_locker') {
        const isUnlocked = Boolean(Storage.getSaveGame()?.puzzleFlags?.locker_unlocked);
        const label = isUnlocked ? 'Examinar taquilla abierta' : 'Examinar taquilla cerrada';
        btn.setAttribute('aria-label', label);
      }

      // Hotspot de la cerradura en bsmnt_03_locker_closed
      if (h.id === 'hotspot_bsmnt_03_locker_lock' || h.id === 'hotspot_bsmnt_03_locker_door') {
        const isUnlocked = Boolean(Storage.getSaveGame()?.puzzleFlags?.locker_unlocked);
        const label = isUnlocked ? 'Cerradura abierta' : 'Cerradura de la taquilla';
        btn.setAttribute('aria-label', label);
      }

      // Overlay de las placas en el buzo de trabajo en bsmnt_03_coveralls
      if (h.id === 'hotspot_coveralls_plates' || h.action === 'pick_plates') {
        const saveState = Storage.getSaveGame();
        const isPicked = Boolean(
          saveState?.puzzleFlags?.plates_picked ||
          saveState?.puzzleFlags?.has_plates ||
          saveState?.inventory?.some(i => i.id === 'plates' || i.id === 'bsmnt_plates')
        );

        if (isPicked) {
          return;
        }

        btn.dataset.pixelX = '604';
        btn.dataset.pixelY = '280';
        btn.dataset.pixelW = '673';
        btn.dataset.pixelH = '433';
        btn.style.left = '31.4583%';
        btn.style.top = '25.9259%';
        btn.style.width = '35.0521%';
        btn.style.height = '40.0926%';
        btn.style.zIndex = '10';
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_03_stage_plates.webp')";
        btn.classList.add('has-bg-image');
        btn.setAttribute('aria-label', 'Coger placas de metal');
      }

      // Overlay de la cabecera del periódico en bsmnt_03_desktop (617px, 538px, 429px, 186px)
      if (h.id === 'overlay_bsmnt_03_newspaper_header') {
        const lang = (i18n && typeof i18n.getCurrentLanguage === 'function')
          ? i18n.getCurrentLanguage()
          : (Storage.getSettings()?.language || 'es');
        const validLang = ['es', 'en', 'fr'].includes(lang) ? lang : 'es';

        btn.dataset.pixelX = '617';
        btn.dataset.pixelY = '538';
        btn.dataset.pixelW = '429';
        btn.dataset.pixelH = '186';
        btn.style.left = `${(617 / 1920 * 100).toFixed(4)}%`;
        btn.style.top = `${(538 / 1080 * 100).toFixed(4)}%`;
        btn.style.width = `${(429 / 1920 * 100).toFixed(4)}%`;
        btn.style.height = `${(186 / 1080 * 100).toFixed(4)}%`;
        btn.style.zIndex = '15';
        btn.style.backgroundImage = `url('assets/levels/level_01_bsmnt/overlays/header_${validLang}.webp')`;
        btn.style.backgroundSize = '100% 100%';
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.classList.add('has-bg-image');
        btn.setAttribute('aria-label', 'Leer recorte de periódico');
      }

      // Si el hotspot define una imagen de fondo (ej. polaroid.png)
      if ((h.backgroundImage || h.overlayImage) && !btn.style.backgroundImage) {
        const bgUrl = h.backgroundImage || h.overlayImage;
        btn.style.backgroundImage = `url('${bgUrl}')`;
        btn.classList.add('has-bg-image');
      }

      btn.addEventListener('click', (e) => {
        if (this._suppressHotspotClick) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        e.stopPropagation();
        this.handleHotspotClick(h);
      });

      this.sceneOverlays.appendChild(btn);
    });

    // Si estamos en bsmnt_03_niche_closeup y las placas ya fueron colocadas, mostrar overlay permanente
    if (this.currentScene === 'bsmnt_03_niche_closeup' || this.currentScene === 'niche_closeup') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.niche_plates_placed) {
        this.showNichePlatesOverlay(false);
      }
    }

    // Aplicar resplandor del tutorial interactivo a los objetos correspondientes
    if (this.tutorialStep === 2 && this.currentScene === 'bsmnt_01_bench') {
      const shelfBtn = document.getElementById('hotspot_bench_to_shelf');
      if (shelfBtn) shelfBtn.classList.add('tutorial-hotspot-highlight');
    }
    if (this.tutorialStep === 3 && this.currentScene === 'bsmnt_01_shelf') {
      const letterBtn = document.getElementById('hotspot_shelf_document');
      if (letterBtn) letterBtn.classList.add('tutorial-hotspot-highlight');
    }
  },



  /**
   * Muestra u oculta los chevrons izquierdo, derecho e inferior según el grafo de navegación.
   */
  updateNavigationUI() {
    const routes = this.getRoutesForCurrentScene();

    // Chevrons laterales
    if (this.navLeft) {
      if (routes.left) {
        this.navLeft.classList.remove('hidden');
        this.navLeft.setAttribute('aria-label', `Mirar a la izquierda (${routes.left})`);
      } else {
        this.navLeft.classList.add('hidden');
      }
    }

    if (this.navRight) {
      if (routes.right) {
        this.navRight.classList.remove('hidden');
        this.navRight.setAttribute('aria-label', `Mirar a la derecha (${routes.right})`);
      } else {
        this.navRight.classList.add('hidden');
      }
    }

    // Chevron inferior (volver de primeros planos / closeups)
    if (this.navBottom) {
      if (routes.back) {
        this.navBottom.classList.remove('hidden');
        this.navBottom.setAttribute('aria-label', `Volver a la vista general (${routes.back})`);
      } else {
        this.navBottom.classList.add('hidden');
      }
    }
  },

  /**
   * Gestiona el mensaje de pista orientativa de un solo uso.
   */
  checkInitialHint() {
    if (!this.navHint) return;

    try {
      const hintSeen = localStorage.getItem('blackwood_keep_nav_hint_seen');
      if (!hintSeen) {
        this.navHint.classList.add('visible');
        clearTimeout(this._hintTimer);
        this._hintTimer = setTimeout(() => {
          this.dismissHint();
        }, 5000);
      }
    } catch (e) {
      // Ignorar restricciones locales
    }
  },

  dismissHint() {
    if (!this.navHint) return;
    this.navHint.classList.remove('visible');
    try {
      localStorage.setItem('blackwood_keep_nav_hint_seen', 'true');
    } catch (e) {
      // Ignorar restricciones
    }
  },

  /**
   * Procesa la interacción con un hotspot según su acción.
   */
  handleHotspotClick(h) {
    if (this._suppressHotspotClick) {
      return;
    }

    // Restricciones de interacción durante el tutorial interactivo
    if (this.tutorialStep === 1) {
      return; // En el paso 1 solo se permite deslizar para llegar al banco
    } else if (this.tutorialStep === 2) {
      if (h.id !== 'hotspot_bench_to_shelf' && h.targetScene !== 'bsmnt_01_shelf') {
        return; // En el paso 2 solo se permite hacer clic en la estantería
      }
      this.tutorialStep = 3;
    } else if (this.tutorialStep === 3) {
      if (h.id !== 'hotspot_shelf_document' && h.documentId !== 'letter_rosario_to_tomas') {
        return; // En el paso 3 solo se permite hacer clic en la carta
      }
      this.tutorialStep = 4;
    } else if (this.tutorialStep === 4) {
      return; // En el paso 4 se debe realizar el gesto de volver atrás
    }

    if (h.action === 'navigate' && h.targetScene) {
      if (h.targetScene === 'bsmnt_02_main') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.padlock_unlocked) {
          this.navigateTo('bsmnt_02_main_open');
          return;
        }
      }
      if (h.targetScene === 'bsmnt_02_trunk_closeup') {
        const saveState = Storage.getSaveGame();
        if (saveState?.puzzleFlags?.trunk_acid_used || saveState?.puzzleFlags?.trunk_02_open) {
          this.navigateTo('bsmnt_02_trunk_closeup_open');
          return;
        }
      }
      this.navigateTo(h.targetScene);
      return;
    }

    if (h.id === 'hotspot_trunk_closeup_padlock' || h.action === 'trunk_closeup_padlock') {
      this.handleTrunkCloseupPadlockClick();
      return;
    }

    if (h.id === 'hotspot_padlock' || h.action === 'padlock_target') {
      this.handlePadlockClick();
      return;
    }

    if (h.id === 'hotspot_pallet_truck' || h.action === 'pallet_truck') {
      this.handlePalletTruckClick(h);
      return;
    }

    if (h.id === 'hotspot_catch_basin' || h.action === 'catch_basin') {
      const saveState = Storage.getSaveGame();
      const isPipePlaced = Boolean(saveState?.puzzleFlags?.pipe_placed);
      const isSolved = Boolean(saveState?.puzzleFlags?.providence_solved || saveState?.puzzleFlags?.basin_open);

      if (isSolved) {
        this.showMessage('La caja de la arqueta ya está abierta.');
        return;
      }

      if (isPipePlaced) {
        if (window.ProvidencePuzzle) {
          window.ProvidencePuzzle.open();
        }
        return;
      }

      this.showMessage('No logro alcanzar la caja');
      return;
    }

    if (h.id === 'hotspot_catch_basin_key' || h.action === 'pick_key_to_locker') {
      this.handlePickKeyToLocker(h);
      return;
    }

    if (h.id === 'hotspot_niche_receptors' || h.action === 'niche_receptors') {
      const selectedItem = window.InventoryManager?.selectedItemId;
      if (selectedItem === 'plates' || selectedItem === 'bsmnt_plates') {
        this.handlePlatesDropOnNiche(selectedItem);
        return;
      }
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.niche_plates_placed) {
        this.showMessage('Las placas de bronce están insertadas en los receptores luminosos.');
      } else if (saveState?.inventory?.some(i => i.id === 'plates' || i.id === 'bsmnt_plates')) {
        this.showMessage('Una hornacina con cuatro receptores y luces azules. Las placas del buzo podrían encajar en la ranura superior.');
      } else {
        this.showMessage('Hay cuatro receptores alineados bajo focos azules y una ranura metálica vacía.');
      }
      return;
    }

    if (h.id === 'hotspot_coveralls_plates' || h.action === 'pick_plates') {
      this.handlePickPlates(h);
      return;
    }

    if (h.id === 'hotspot_main_jacket' || h.id === 'hotspot_main_open_jacket' || h.id === 'hotspot_drums_jacket' || h.action === 'pick_jacket') {
      this.handlePickJacket(h);
      return;
    }

    if (h.id === 'hotspot_wrech_box_wrench' || h.action === 'pick_wrench') {
      this.handlePickWrench(h);
      return;
    }

    if (h.id === 'hotspot_pale_crowbar' || h.action === 'pick_crowbar') {
      this.handlePickCrowbar(h);
      return;
    }

    if (h.id === 'hotspot_pale_pallet' || h.action === 'pale_pallet') {
      this.handlePalePalletClick();
      return;
    }

    if (h.id === 'hotspot_wheelchair_wheel' || h.action === 'wheelchair_wheel') {
      this.handleWheelchairWheelClick();
      return;
    }

    if (h.id === 'hotspot_door_to_locker_room_planks' || h.action === 'door_planks') {
      this.handleDoorPlanksClick();
      return;
    }

    if (h.id === 'hotspot_locker_room_door' || h.action === 'locker_room_door') {
      this.handleLockerRoomDoorClick();
      return;
    }

    if (h.id === 'hotspot_bsmnt_03_locker' || h.action === 'examine_locker') {
      this.handleLockerClick();
      return;
    }

    if (
      h.id === 'hotspot_bsmnt_03_locker_lock' ||
      h.id === 'hotspot_bsmnt_03_locker_door' ||
      h.action === 'examine_locker_lock' ||
      h.action === 'examine_locker_door'
    ) {
      this.handleLockerLockClick();
      return;
    }

    if (h.id === 'hotspot_bsmnt_03_under_stairs_door' || h.action === 'under_stairs_door') {
      this.handleUnderStairsDoorClick();
      return;
    }

    if (h.id === 'hotspot_under_stairs_pipe' || h.action === 'pick_pipe' || h.action === 'under_stairs_pipe') {
      this.handlePickPipe(h);
      return;
    }

    if (h.id === 'hotspot_pipes_stage_pipe' || h.action === 'pipes_stage_pipe') {
      this.handlePipesStagePipeClick();
      return;
    }

    if (h.id === 'hotspot_coat_stand_jacket' || h.action === 'coat_stand_jacket') {
      this.handleCoatStandJacketClick();
      return;
    }

    if (h.id === 'hotspot_julian_portrait_cards' || h.id === 'hotspot_painting_cards' || (h.action === 'examine_cards' && h.id !== 'hotspot_bench_cards')) {
      this.handleExamineCards();
      return;
    }

    if (h.id === 'hotspot_julian_portrait_frame' || h.action === 'painting_julian_inspect') {
      this.showMessage('Un retrato al óleo de Julian Blackwood. En el bolsillo de su chaqueta asoman unos naipes.');
      return;
    }

    if (h.action === 'cards_back' || h.id === 'hotspot_bsmnt_cards_overlay' || h.id === 'hotspot_bsmnt_cards_bg_click') {
      const returnScene = this.cardsReturnScene || 'bsmnt_01_bench_painting';
      this.navigateTo(returnScene);
      return;
    }

    if (h.action === 'door_to_03_dark_inspect') {
      this.showMessage('Está completamente a oscuras. No puedo ver nada sin encender la luz primero.');
      return;
    }

    if (h.action === 'door_to_03') {
      this.handleDoorTo03();
      return;
    }

    if (h.action === 'trunk') {
      this.handleTrunkClick();
      return;
    }

    if (h.action === 'trunk_puzzle') {
      window.TrunkPuzzle?.open();
      return;
    }

    if (h.action === 'pick_hammer') {
      this.handlePickHammer(h);
      return;
    }

    if (h.action === 'pick_key_door_03') {
      this.handlePickKeyDoor03(h);
      return;
    }

    if (h.action === 'pick_handle') {
      this.handlePickHandle(h);
      return;
    }

    if (h.action === 'pick_bulb') {
      this.handlePickBulb(h);
      return;
    }

    if (h.action === 'pick_wires') {
      this.handlePickWires(h);
      return;
    }

    if (h.action === 'pick_key_padlock') {
      this.handlePickKeyPadlock(h);
      return;
    }

    if (h.action === 'pick_keys_med_chest' || h.action === 'pick_key_med_chest') {
      this.handlePickKeysMedChest(h);
      return;
    }

    if (h.action === 'pick_acid') {
      this.handlePickAcid(h);
      return;
    }

    if (h.action === 'pick_switch') {
      this.handlePickSwitch(h);
      return;
    }

    if (h.action === 'light_box_switch_slot') {
      this.handleLightBoxSwitchClick();
      return;
    }

    if (h.action === 'open_cryptex' || h.action === 'door_02_knob') {
      this.handleDoor02KnobClick();
      return;
    }

    if (h.action === 'med_chest_detail_navigate') {
      this.handleMedChestDetailNavigate();
      return;
    }

    if (h.action === 'med_chest_lock') {
      this.handleMedChestLockClick();
      return;
    }

    if (h.action === 'med_chest_box') {
      this.handleMedChestBoxClick();
      return;
    }

    if (h.action === 'chest_box_navigate') {
      this.handleChestBoxNavigate();
      return;
    }

    if (h.action === 'pry_chest_lid') {
      this.handlePryChestLid();
      return;
    }

    if (h.action === 'read_document') {
      this.handleReadDocument(h);
      return;
    }

    if (h.action === 'painting_navigate') {
      this.handlePaintingNavigate();
      return;
    }

    if (h.action === 'painting_lamp') {
      this.handlePaintingLampClick();
      return;
    }

    if (h.action === 'light_box_panel') {
      this.handleLightBoxPanelClick();
      return;
    }

    if (h.action === 'examine_top_drawer') {
      this.handleTopDrawerClick();
      return;
    }
  },

  /**
   * Obtiene un documento localizando sus campos según el idioma activo si corresponde.
   */
  getDocument(docId) {
    const base = GAME_DOCUMENTS[docId];
    if (!base) return null;
    if (docId === 'doc_bsmnt_newspaper') {
      const lang = (i18n && typeof i18n.getCurrentLanguage === 'function')
        ? i18n.getCurrentLanguage()
        : (Storage.getSettings()?.language || 'es');
      const validLang = ['es', 'en', 'fr'].includes(lang) ? lang : 'es';
      const loc = NEWSPAPER_DOC_I18N[validLang] || NEWSPAPER_DOC_I18N['es'];
      return { ...base, ...loc };
    }
    return base;
  },

  /**
   * Maneja la lectura de un documento encontrado en la escena.
   */
  handleReadDocument(h) {
    const docId = h.documentId || h.id;
    const doc = this.getDocument(docId);
    if (!doc) {
      console.warn(`[Document] Documento no encontrado: ${docId}`);
      return;
    }
    console.log(`%c[Document] 📖 Leyendo documento: [${doc.title || doc.id}]`, 'color: #d4af37; font-weight: bold;');

    // 1. Añadir al diario / cuaderno de notas
    DiaryManager.addEntry({
      id: doc.id,
      title: doc.title,
      badge: doc.badge,
      image: doc.image,
      imageCaption: doc.imageCaption,
      text: doc.text,
      date: doc.date,
      isJournal: Boolean(doc.isJournal)
    });

    // 2. Abrir visor con overlay semitransparente negro y texto blanco
    this.openDocumentViewer(doc);
  },

  /**
   * Abre el visor modal de documento encontrado.
   */
  openDocumentViewer(doc) {
    const modal = document.getElementById('modal-doc-viewer');
    if (!modal) return;

    if (doc && doc.id) {
      doc = this.getDocument(doc.id) || doc;
    }

    const titleEl = document.getElementById('doc-viewer-title');
    const badgeEl = document.getElementById('doc-viewer-badge');
    const bodyEl = document.getElementById('doc-viewer-body');

    if (titleEl) titleEl.textContent = doc.title || 'Documento';
    if (badgeEl) badgeEl.textContent = doc.badge || '✦ DOCUMENTO ENCONTRADO ✦';

    if (bodyEl) {
      let imageHtml = '';
      if (doc.image) {
        imageHtml = `
          <div class="doc-viewer-image-wrapper">
            <button type="button" class="doc-viewer-image-btn" id="btn-doc-viewer-img" aria-label="Ampliar documento">
              <img src="${doc.image}" alt="${doc.title || 'Documento'}" class="doc-viewer-img" />
              <span class="doc-viewer-img-caption">🔍 Clic para ampliar en pantalla completa</span>
            </button>
          </div>
        `;
      }

      const rawParagraphs = (doc.text || '').split(/\n\s*\n/).filter(p => p.trim().length > 0);
      const textHtml = rawParagraphs.map((p, idx) => {
        const isSignature = (idx >= rawParagraphs.length - 2) && (p.startsWith('Con cariño') || p.trim() === 'Rosario' || p.startsWith('—') || (p.length < 30 && idx === rawParagraphs.length - 1));
        return `<p class="doc-viewer-paragraph ${isSignature ? 'signature' : ''}">${p.trim().replace(/\n/g, '<br>')}</p>`;
      }).join('');

      bodyEl.innerHTML = imageHtml + textHtml;

      if (doc.image) {
        const imgBtn = bodyEl.querySelector('#btn-doc-viewer-img');
        if (imgBtn) {
          imgBtn.addEventListener('click', () => {
            DiaryManager.showPreview(doc.image, doc.title || '');
          });
        }
      }
    }

    modal.style.display = 'flex';
    modal.offsetHeight;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  },

  /**
   * Cierra el visor de documentos y notifica al usuario.
   */
  closeDocumentViewer() {
    const modal = document.getElementById('modal-doc-viewer');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.style.display = 'none';
      }
    }, 360);
    this.showMessage('📖 Documento archivado en el cuaderno de notas.', 3500);

    if (this.tutorialStep === 4) {
      setTimeout(() => {
        this.updateTutorialState('bsmnt_01_shelf');
      }, 400);
    }
  },

  /**
   * Recogida interactiva del martillo sacaclavos en el interior del baúl abierto.
   */
  handlePickHammer(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.hammer_picked = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    InventoryManager.showPickupCloseup({
      id: 'hammer',
      name: 'Martillo sacaclavos',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_hammer.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_hammer.webp'
    });
  },

  /**
   * Recogida interactiva de la llave de hierro (Sala 3) en el interior del baúl abierto.
   */
  handlePickKeyDoor03(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.key_door_03_picked = true;
    saveState.puzzleFlags.has_key_door_03 = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    InventoryManager.showPickupCloseup({
      id: 'key_door_03',
      name: 'Llave antigua de hierro',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_key_to_03.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_key_to_03.webp'
    });
  },

  /**
   * Recogida interactiva del pomo de madera en el banco.
   */
  handlePickHandle(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.handle_picked = true;
    saveState.puzzleFlags.has_handle = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'handle',
      name: 'Pomo de madera',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_handle.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_handle.webp'
    });
  },

  /**
   * Recogida interactiva de la bombilla en el interior del cajón abierto (bsmnt_01_chest_close_up_open).
   */
  handlePickBulb(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.bulb_picked = true;
    saveState.puzzleFlags.has_bulb = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'bulb',
      name: 'Bombilla',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_bulb.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_bulb.webp'
    });
  },

  /**
   * Recogida interactiva de los cables en el interior del cajón abierto (bsmnt_01_chest_close_up_open).
   */
  handlePickWires(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.wires_picked = true;
    saveState.puzzleFlags.has_wires = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'wires',
      name: 'Cables',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wires.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wires.webp'
    });
  },

  /**
   * Recogida interactiva de la llave del candado sobre las cajas de cartón (bsmnt_02_boxes).
   */
  handlePickKeyPadlock(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.key_padlock_picked = true;
    saveState.puzzleFlags.has_key_padlock = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'key_padlock',
      name: 'Llave pequeña',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_key_to_padlock.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_key_to_padlock.webp'
    });
  },

  /**
   * Recogida interactiva de las llaves del botiquín en el cajón del escritorio (bsmnt_02_drawer).
   */
  handlePickKeysMedChest(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.keys_med_chest_picked = true;
    saveState.puzzleFlags.has_keys_med_chest = true;
    saveState.puzzleFlags.key_med_chest_picked = true;
    saveState.puzzleFlags.has_key_med_chest = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'keys_med_chest',
      name: 'Juego de llaves pequeñas',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_keys_to_med_chest.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_keys_to_med_chest.webp'
    });
  },

  /**
   * Recogida interactiva del frasco de ácido en el botiquín abierto (bsmnt_01_med_chest_close_up_open).
   */
  handlePickAcid(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.acid_picked = true;
    saveState.puzzleFlags.has_acid = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'acid',
      name: 'Frasco de ácido',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_acid.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_acid.webp'
    });
  },

  /**
   * Recogida interactiva del interruptor en el interior del arcón abierto (bsmnt_02_trunk_closeup_open).
   */
  handlePickSwitch(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.switch_picked = true;
    saveState.puzzleFlags.has_switch = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'switch',
      name: 'Interruptor',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_switch.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_switch.webp'
    });
  },

  /**
   * Recogida interactiva de la chaqueta sobre los palés en bsmnt_02_main y bsmnt_02_main_open.
   */
  handlePickJacket(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.jacket_picked = true;
    saveState.puzzleFlags.has_jacket = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'jacket',
      name: 'Chaqueta',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_jacket.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_jacket.webp'
    });
  },

  /**
   * Recogida interactiva de la llave inglesa en bsmnt_01_wrech_box.
   */
  handlePickWrench(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.wrench_picked = true;
    saveState.puzzleFlags.has_wrench = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'wrench',
      name: 'Llave inglesa',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wrench.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wrench.webp'
    });
  },

  /**
   * Recogida interactiva de la palanca sobre las herramientas en bsmnt_01_pale.
   */
  handlePickCrowbar(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.crowbar_picked = true;
    saveState.puzzleFlags.has_crowbar = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'crowbar',
      name: 'Palanca',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_crowbar.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_crowbar.webp'
    });
  },

  /**
   * Recogida interactiva de la tubería en bsmnt_03_under_stairs.
   */
  handlePickPipe(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.pipe_picked = true;
    saveState.puzzleFlags.has_pipe = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'pipe',
      name: 'Tramo de tubería',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_pipe-handle.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_pipe-handle.webp'
    });
  },

  /**
   * Recogida interactiva de la llave de la taquilla en la caja abierta (bsmnt_02_catch_basin).
   */
  handlePickKeyToLocker(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.key_to_locker_picked = true;
    saveState.puzzleFlags.has_key_to_locker = true;
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado con Container Transform
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'key_to_locker',
      name: 'Llave antigua',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_key_to_locker.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_key_to_locker.webp'
    });
  },

  /**
   * Recogida interactiva de las placas de metal en el bolsillo del buzo (bsmnt_03_coveralls).
   */
  handlePickPlates(h) {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.plates_picked = true;
    saveState.puzzleFlags.has_plates = true;
    if (!saveState.puzzleFlags.plates_state) {
      saveState.puzzleFlags.plates_state = {
        1: { slot: 1, rotation: 0 },
        2: { slot: 2, rotation: 0 },
        3: { slot: 3, rotation: 0 },
        4: { slot: 4, rotation: 0 }
      };
      saveState.puzzleFlags.plates_slots = { 1: 1, 2: 2, 3: 3, 4: 4 };
      saveState.puzzleFlags.plates_rotations = { 1: 0, 2: 0, 3: 0, 4: 0 };
      saveState.puzzleFlags.slots_plates = { 1: 1, 2: 2, 3: 3, 4: 4 };
    }
    Storage.setSaveGame(saveState);

    const btn = document.getElementById(h.id);
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar el primer plano animado interactivo (Container Transform)
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'plates',
      name: 'Placas de bronce',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
      interactiveCloseup: 'plates_grid'
    });
  },

  /**
   * Clic directo o interacción con el hueco de la tubería en bsmnt_01_pipes.
   */
  handlePipesStagePipeClick() {
    const saveState = Storage.getSaveGame();
    const isPlaced = Boolean(saveState?.puzzleFlags?.pipe_placed);

    if (isPlaced) {
      this.showMessage('El tramo de tubería está acoplado en su lugar con la llave de paso.');
      return;
    }

    // Comprobar si el jugador tiene seleccionada la tubería en el inventario
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'pipe' || selectedItem === 'bsmnt_pipe' || selectedItem === 'tuberia' || selectedItem === 'pipe-handle') {
      this.placePipeInPipesScene();
      return;
    }

    this.showMessage('Falta un tramo de tubería en este punto. Hay un hueco entre las dos secciones.');
  },

  /**
   * Coloca el tramo de tubería en el hueco en bsmnt_01_pipes:
   * - Retira la tubería del inventario.
   * - Muestra el overlay bsmnt_01_stage_pipe.png en (935px, 534px).
   * - Activa el flag pipe_placed = true.
   */
  placePipeInPipesScene() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.pipe_placed = true;
    delete saveState.puzzleFlags.has_pipe;

    // Retirar la tubería del inventario en saveState
    if (Array.isArray(saveState.inventory)) {
      saveState.inventory = saveState.inventory.filter(
        i => i.id !== 'pipe' && i.id !== 'bsmnt_pipe' && i.id !== 'tuberia' && i.id !== 'pipe-handle'
      );
    }
    Storage.setSaveGame(saveState);

    // Actualizar UI del inventario
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('pipe', false);
      window.InventoryManager.removeItem('bsmnt_pipe', false);
      window.InventoryManager.removeItem('tuberia', false);
      window.InventoryManager.removeItem('pipe-handle', false);
      window.InventoryManager.selectedItemId = null;
      window.InventoryManager.render();
    }

    // Sonido metálico de acoplamiento de tubería
    this.playPadlockSound();

    // Mostrar el overlay con animación suave
    const btn = document.getElementById('hotspot_pipes_stage_pipe');
    if (btn) {
      btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_01_stage_pipe.webp')";
      btn.style.transition = 'opacity 0.4s ease';
      btn.style.opacity = '1';
      btn.setAttribute('aria-label', 'Tramo de tubería con llave de paso instalado');
    }

    this.showMessage('Has encajado el tramo de tubería en el hueco.');
  },

  /**
   * Clic directo sobre el palé en bsmnt_01_pale.
   */
  handlePalePalletClick() {
    const saveState = Storage.getSaveGame();
    if (saveState?.puzzleFlags?.pallet_moved) {
      return;
    }

    // Si la traspaleta ya está colocada, mover el palé con animación
    if (saveState?.puzzleFlags?.pallet_has_truck) {
      this.handleMovePalletWithTruck();
      return;
    }

    // Si el jugador tiene seleccionada la traspaleta en la mano
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'pallet_truck' || selectedItem === 'bsmnt_pallet_truck' || selectedItem === 'traspaleta') {
      this.insertPalletTruckIntoPallet();
      return;
    }

    this.showMessage('Este palé cargado de bloques es demasiado pesado para moverlo a mano. Necesito algo para transportarlo.');
  },

  /**
   * Encaja la traspaleta en el palé:
   * - Cambia el overlay a bsmnt_pallet_2.png
   * - Retira la traspaleta del inventario
   * - Actualiza flags y reproduce sonido de inserción metálica
   */
  insertPalletTruckIntoPallet() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.pallet_has_truck = true;
    saveState.puzzleFlags.pallet_truck_used = true;
    saveState.puzzleFlags.has_pallet_truck = false;

    // Retirar la traspaleta del inventario
    if (Array.isArray(saveState.inventory)) {
      saveState.inventory = saveState.inventory.filter(i => i.id !== 'pallet_truck' && i.id !== 'bsmnt_pallet_truck' && i.id !== 'traspaleta');
    }

    Storage.setSaveGame(saveState);

    if (window.InventoryManager) {
      window.InventoryManager.removeItem('pallet_truck', false);
      window.InventoryManager.removeItem('bsmnt_pallet_truck', false);
      window.InventoryManager.removeItem('traspaleta', false);
      window.InventoryManager.render();
    }

    // Sonido de encajar las horquillas de la traspaleta
    this.playPalletTruckInsertSound();

    // Actualizar imagen del overlay al palé con traspaleta lista
    const btn = document.getElementById('hotspot_pale_pallet');
    if (btn) {
      btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_pallet_2.webp')";
      btn.setAttribute('aria-label', 'Palé con traspaleta lista para mover');
    }

    this.showMessage('Has introducido la traspaleta bajo el palé. Ya puedes moverlo tirando de ella.');
  },

  /**
   * Mueve el palé hacia la cámara haciéndose más grande y descendiendo
   * hasta salir del encuadre, revelando la barra de uña (palanca).
   */
  handleMovePalletWithTruck() {
    const btn = document.getElementById('hotspot_pale_pallet');
    if (!btn) return;

    btn.style.pointerEvents = 'none';
    btn.style.transformOrigin = '50% 40%';
    btn.style.transition = 'transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
    btn.style.transform = 'translateY(650px) scale(2.4)';
    btn.style.opacity = '0';

    // Sonido de rodadura pesada sobre suelo de hormigón
    this.playPalletTruckRollSound();

    setTimeout(() => {
      if (btn.parentNode) {
        btn.parentNode.removeChild(btn);
      }

      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
      saveState.puzzleFlags.pallet_moved = true;
      Storage.setSaveGame(saveState);

      // Renderizar hotspots de la escena para mostrar la palanca ahora descubierta
      this.renderHotspots();

      const crowbarBtn = document.getElementById('hotspot_pale_crowbar');
      if (crowbarBtn) {
        crowbarBtn.style.opacity = '0';
        crowbarBtn.style.transform = 'scale(0.92)';
        setTimeout(() => {
          crowbarBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          crowbarBtn.style.opacity = '1';
          crowbarBtn.style.transform = 'scale(1)';
        }, 50);
      }

      this.showMessage('Al retirar el palé cargado, ha quedado al descubierto una barra de uña oculta debajo.');
    }, 1400);
  },

  /**
   * Sonido al colocar la traspaleta bajo el palé (sonido estándar de soltar ítem: assets/audio/sfx/item_pickup.mp3).
   */
  playPalletTruckInsertSound() {
    if (window.InventoryManager?._lastDropSoundTime) {
      if (Date.now() - window.InventoryManager._lastDropSoundTime < 250) {
        return;
      }
    }
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/item_pickup.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // 1. Golpe sordo inicial de inserción
      const osc1 = this._audioCtx.createOscillator();
      const gain1 = this._audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.16);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(this._audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // 2. Fricción metálica
      const osc2 = this._audioCtx.createOscillator();
      const gain2 = this._audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(340, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(120, now + 0.22);
      gain2.gain.setValueAtTime(0.2, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(this._audioCtx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.25);

      // 3. Chasquido de bloqueo de palanca
      const osc3 = this._audioCtx.createOscillator();
      const gain3 = this._audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(620, now + 0.18);
      osc3.frequency.exponentialRampToValueAtTime(280, now + 0.32);
      gain3.gain.setValueAtTime(0.25, now + 0.18);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc3.connect(gain3);
      gain3.connect(this._audioCtx.destination);
      osc3.start(now + 0.18);
      osc3.stop(now + 0.35);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Sonido de rodadura pesada de la traspaleta sacando el palé (assets/audio/sfx/pallet_truck.mp3).
   */
  playPalletTruckRollSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/pallet_truck.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/pallet_truck.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // 1. Zumbido de rodamiento metálico y ruedas de poliuretano
      const osc1 = this._audioCtx.createOscillator();
      const gain1 = this._audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.linearRampToValueAtTime(140, now + 0.4);
      osc1.frequency.exponentialRampToValueAtTime(60, now + 1.4);
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.25);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc1.connect(gain1);
      gain1.connect(this._audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 1.4);

      // 2. Retumbe grave de carga pesada sobre hormigón
      const osc2 = this._audioCtx.createOscillator();
      const gain2 = this._audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(55, now);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 1.4);
      gain2.gain.setValueAtTime(0.01, now);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc2.connect(gain2);
      gain2.connect(this._audioCtx.destination);
      osc2.start(now);
      osc2.stop(now + 1.4);

      // 3. Tintineo sutil metálico de las cadenas y ejes
      const osc3 = this._audioCtx.createOscillator();
      const gain3 = this._audioCtx.createGain();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(260, now + 0.1);
      osc3.frequency.exponentialRampToValueAtTime(180, now + 0.9);
      gain3.gain.setValueAtTime(0.01, now + 0.1);
      gain3.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc3.connect(gain3);
      gain3.connect(this._audioCtx.destination);
      osc3.start(now + 0.1);
      osc3.stop(now + 1.1);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Clic directo sobre la rueda de la silla de ruedas en bsmnt_03_wheelchair.
   */
  handleWheelchairWheelClick() {
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'wrench' || selectedItem === 'bsmnt_wrench' || selectedItem === 'llave_inglesa') {
      this.detachWheelchairWheel();
      return;
    }
    this.showMessage('La rueda está fuertemente atornillada al eje. Necesito una herramienta para soltarla.');
  },

  /**
   * Desmonta la rueda de la silla de ruedas usando la llave inglesa:
   * - Reproduce la animación cinemática de la llave inglesa desenroscando la tuerca del eje.
   * - Retira la llave inglesa del inventario.
   * - Desprende la rueda físicamente con caída suave y partículas de óxido.
   * - Despliega el pickup closeup de la rueda y la añade al inventario.
   */
  detachWheelchairWheel() {
    if (this._isDetachingWheel) return;
    this._isDetachingWheel = true;

    this.playWrenchUnscrewAnimation(() => {
      this._isDetachingWheel = false;

      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

      saveState.puzzleFlags.wheelchair_wheel_detached = true;
      saveState.puzzleFlags.wheel_picked = true;
      saveState.puzzleFlags.has_wheel = true;
      saveState.puzzleFlags.wrench_used = true;
      saveState.puzzleFlags.has_wrench = false;

      // Retirar la llave inglesa del inventario
      if (Array.isArray(saveState.inventory)) {
        saveState.inventory = saveState.inventory.filter(i => i.id !== 'wrench' && i.id !== 'bsmnt_wrench' && i.id !== 'llave_inglesa');
      }

      Storage.setSaveGame(saveState);

      if (window.InventoryManager) {
        window.InventoryManager.removeItem('wrench', false);
        window.InventoryManager.removeItem('bsmnt_wrench', false);
        window.InventoryManager.removeItem('llave_inglesa', false);
        window.InventoryManager.selectedItemId = null;
        window.InventoryManager.render();
      }

      // Eliminar definitivamente el hotspot de la rueda si aún sigue en el DOM
      const btn = document.getElementById('hotspot_wheelchair_wheel');
      if (btn && btn.parentNode) {
        btn.parentNode.removeChild(btn);
      }

      // Desplegar primer plano y añadir la rueda al inventario
      const manager = window.InventoryManager || InventoryManager;
      manager.showPickupCloseup({
        id: 'wheel',
        name: 'Rueda',
        icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wheel.webp',
        closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wheel.webp'
      });
    });
  },

  /**
   * Animación cinemática de la llave inglesa aflojando y desmontando la rueda de la silla de ruedas.
   */
  playWrenchUnscrewAnimation(onComplete) {
    const container = this.sceneOverlays || document.getElementById('scene-overlays');
    const wheelBtn = document.getElementById('hotspot_wheelchair_wheel');

    if (!container) {
      this.playWrenchSound();
      if (onComplete) onComplete();
      return;
    }

    if (wheelBtn) {
      wheelBtn.style.pointerEvents = 'none';
    }

    // Capa de animación para aislar los actores cinemáticos
    const animLayer = document.createElement('div');
    animLayer.className = 'wheelchair-anim-layer';

    // Elemento gráfico de la llave inglesa
    const wrenchEl = document.createElement('div');
    wrenchEl.className = 'wheelchair-wrench-actor';

    animLayer.appendChild(wrenchEl);
    container.appendChild(animLayer);

    // Mensaje en pantalla durante la acción
    this.showMessage('¡Aflojando la tuerca del eje con la llave inglesa!', 2400);

    // Inicio de la secuencia sonora sincrónica a los 100ms
    setTimeout(() => {
      this.playWrenchSound();
    }, 100);

    // 1er apalancamiento: el óxido cede a los ~450ms con partículas
    setTimeout(() => {
      this.spawnRustParticle(animLayer, 53.7, 82.9, -18);
      this.spawnRustParticle(animLayer, 53.7, 82.9, 22);
    }, 450);

    // 2do giro: rosca limpia a los ~1250ms
    setTimeout(() => {
      this.spawnRustParticle(animLayer, 53.7, 82.9, -32);
    }, 1250);

    // Liberación del eje a los ~1650ms: la tuerca cae y la rueda se descuelga físicamente
    setTimeout(() => {
      this.spawnNutParticle(animLayer, 53.7, 82.9);
      if (wheelBtn) {
        wheelBtn.style.transition = 'transform 0.45s cubic-bezier(0.5, 0, 0.7, 1), opacity 0.45s ease-out';
        wheelBtn.style.transform = 'translateY(16px) rotate(4deg) scale(0.96)';
        wheelBtn.style.opacity = '0';
      }
    }, 1650);

    // Finalización al completarse la animación cinemática (~2150ms)
    setTimeout(() => {
      if (animLayer.parentNode) {
        animLayer.parentNode.removeChild(animLayer);
      }
      if (onComplete) onComplete();
    }, 2150);
  },

  /**
   * Genera una partícula de óxido desprendida de la tuerca al aplicar torsión.
   */
  spawnRustParticle(parent, xPct, yPct, angle) {
    if (!parent) return;
    const rust = document.createElement('div');
    rust.className = 'wrench-rust-particle';
    rust.style.left = `${xPct}%`;
    rust.style.top = `${yPct}%`;
    rust.style.setProperty('--fly-x', `${angle}px`);
    parent.appendChild(rust);
  },

  /**
   * Genera la tuerca metálica liberada que cae con física simulada.
   */
  spawnNutParticle(parent, xPct, yPct) {
    if (!parent) return;
    const nut = document.createElement('div');
    nut.className = 'wrench-nut-particle';
    nut.style.left = `${xPct}%`;
    nut.style.top = `${yPct}%`;
    parent.appendChild(nut);
  },

  /**
   * Clic directo sobre los tablones de la puerta en bsmnt_03_door_to_locker_room.
   */
  handleDoorPlanksClick() {
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (
      selectedItem === 'crowbar' ||
      selectedItem === 'bsmnt_crowbar' ||
      selectedItem === 'palanca' ||
      selectedItem === 'barra_de_unas' ||
      selectedItem === 'barra_de_uñas'
    ) {
      this.pryDoorPlanks();
      return;
    }
    this.showMessage('Necesito arrancar estas tablas para poder entrar ahí');
  },

  /**
   * Clic directo sobre la puerta hacia los vestuarios en bsmnt_03_door_to_locker_room.
   */
  handleLockerRoomDoorClick() {
    const saveState = Storage.getSaveGame();
    if (!saveState?.puzzleFlags?.door_planks_pried) {
      this.showMessage('Necesito arrancar estas tablas para poder entrar ahí');
      return;
    }
    this.playDoorUnlockSound();
    this.navigateTo('bsmnt_03_locker_room');
  },

  /**
   * Clic directo sobre la taquilla metálica en bsmnt_03_locker_room.
   * Si está abierta va a bsmnt_03_locker_open, si está cerrada va a la vista cercana bsmnt_03_locker_closed.
   */
  handleLockerClick() {
    const saveState = Storage.getSaveGame();
    if (saveState?.puzzleFlags?.locker_unlocked) {
      this.navigateTo('bsmnt_03_locker_open');
      return;
    }
    this.navigateTo('bsmnt_03_locker_closed');
  },

  /**
   * Clic directo sobre la cerradura de la taquilla en bsmnt_03_locker_closed.
   */
  handleLockerLockClick() {
    const saveState = Storage.getSaveGame();
    if (saveState?.puzzleFlags?.locker_unlocked) {
      this.navigateTo('bsmnt_03_locker_open');
      return;
    }
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'key_to_locker' || selectedItem === 'bsmnt_key_to_locker' || selectedItem === 'locker_key') {
      this.unlockLockerWithKey();
      return;
    }
    this.showMessage('La taquilla está cerrada con llave.');
  },

  /**
   * Abre la taquilla metálica cerrada usando la llave de la taquilla:
   * - Retira la llave del inventario.
   * - Marca el flag locker_unlocked = true.
   * - Reproduce el sonido de cerradura/puerta.
   * - Transiciona a la escena bsmnt_03_locker_open.
   */
  unlockLockerWithKey() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.locker_unlocked = true;
    saveState.puzzleFlags.key_to_locker_used = true;
    Storage.setSaveGame(saveState);

    // Retirar del inventario con animación
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('key_to_locker');
      window.InventoryManager.removeItem('bsmnt_key_to_locker');
    }

    this.playDoorUnlockSound();
    this.showMessage('Has abierto la taquilla con la llave.');

    setTimeout(() => {
      this.navigateTo('bsmnt_03_locker_open');
    }, 400);
  },

  /**
   * Clic directo sobre la puerta bajo la escalera en bsmnt_03_main.
   */
  handleUnderStairsDoorClick() {
    const saveState = Storage.getSaveGame();
    const isOpen = Boolean(saveState?.puzzleFlags?.jacket_hung_on_stand);
    if (!isOpen) {
      this.showMessage('La pequeña puerta bajo la escalera está cerrada. No parece tener cerradura visible, debe abrirse mediante algún mecanismo.');
      return;
    }
    this.playDoorUnlockSound();
    this.navigateTo('bsmnt_03_under_stairs');
  },

  /**
   * Arranca los tablones de la puerta usando la barra de uña (palanca):
   * - Ejecuta la animación cinemática con la barra de uña apalancando los maderos.
   * - Reproduce sonidos de crujido y desclavado de madera y genera partículas.
   * - Hace caer los tablones y despeja el paso hacia los vestuarios.
   * - Retira la barra de uñas del inventario y del guardado.
   * - Actualiza las flags de guardado para permitir el acceso a los vestuarios.
   */
  pryDoorPlanks() {
    if (this._isPryingDoorPlanks) return;
    this._isPryingDoorPlanks = true;

    this.playCrowbarPryAnimation(() => {
      this._isPryingDoorPlanks = false;

      const saveState = Storage.getSaveGame() || Storage.createNewGame();
      if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

      saveState.puzzleFlags.door_planks_pried = true;
      saveState.puzzleFlags.planks_removed = true;
      delete saveState.puzzleFlags.has_crowbar;
      saveState.puzzleFlags.crowbar_used = true;

      // Retirar la barra de uñas del inventario del estado de guardado
      if (!Array.isArray(saveState.inventory)) {
        saveState.inventory = [];
      } else {
        saveState.inventory = saveState.inventory.filter(i =>
          i.id !== 'crowbar' &&
          i.id !== 'bsmnt_crowbar' &&
          i.id !== 'palanca' &&
          i.id !== 'barra_de_unas' &&
          i.id !== 'barra_de_uñas'
        );
      }
      Storage.setSaveGame(saveState);

      // Retirar la barra de uñas del gestor visual del inventario
      if (window.InventoryManager) {
        window.InventoryManager.removeItem('crowbar', false);
        window.InventoryManager.removeItem('bsmnt_crowbar', false);
        window.InventoryManager.removeItem('palanca', false);
        window.InventoryManager.removeItem('barra_de_unas', false);
        window.InventoryManager.removeItem('barra_de_uñas', false);
        window.InventoryManager.selectedItemId = null;
        window.InventoryManager.render();
      }

      // Eliminar definitivamente el hotspot si aún sigue en el DOM
      const btn = document.getElementById('hotspot_door_to_locker_room_planks');
      if (btn && btn.parentNode) {
        btn.parentNode.removeChild(btn);
      }

      this.showMessage('Has arrancado las tablas con la barra de uña. La puerta ha quedado despejada.');
    });
  },

  /**
   * Animación cinemática de la barra de uña arrancando los tablones de la puerta.
   */
  playCrowbarPryAnimation(onComplete) {
    const container = this.sceneOverlays || document.getElementById('scene-overlays');
    const planksBtn = document.getElementById('hotspot_door_to_locker_room_planks');

    if (!container) {
      this.playWoodPrySound();
      if (onComplete) onComplete();
      return;
    }

    if (planksBtn) {
      planksBtn.style.pointerEvents = 'none';
    }

    // Capa para aislar los elementos de la animación
    const animLayer = document.createElement('div');
    animLayer.className = 'door-anim-layer';

    // Elemento gráfico de la barra de uña
    const crowbarEl = document.createElement('div');
    crowbarEl.className = 'door-crowbar-actor';

    animLayer.appendChild(crowbarEl);
    container.appendChild(animLayer);

    // Mensaje en pantalla durante la acción
    this.showMessage('¡Arrancando los tablones con la barra de uña!', 2500);

    // 1er apalancamiento: madero superior a los ~380ms
    setTimeout(() => {
      this.playWoodPrySound();
      this.playNailCreakSound();
      this.spawnNailParticle(animLayer, 48, 28, -35);
      this.spawnSplinterParticle(animLayer, 47, 27, -40);
      this.spawnSplinterParticle(animLayer, 49, 29, 30);
    }, 380);

    // 2do apalancamiento: madero inferior a los ~1100ms
    setTimeout(() => {
      this.playWoodPrySound();
      this.playNailCreakSound();
      this.spawnNailParticle(animLayer, 52, 54, 40);
      setTimeout(() => {
        this.playNailCreakSound();
        this.spawnNailParticle(animLayer, 45, 56, -30);
      }, 140);
      this.spawnSplinterParticle(animLayer, 49, 52, 45);
      this.spawnSplinterParticle(animLayer, 46, 55, -50);
    }, 1100);

    // Tras el apalancamiento (~1550ms), los tablones se desvanecen suavemente en su sitio (fade out sin movimiento)
    setTimeout(() => {
      if (planksBtn) {
        planksBtn.style.transition = 'opacity 0.6s ease-out';
        planksBtn.style.opacity = '0';
      }
    }, 1550);

    // Finalización al completarse el fade out (~2200ms)
    setTimeout(() => {
      if (animLayer.parentNode) {
        animLayer.parentNode.removeChild(animLayer);
      }
      if (onComplete) onComplete();
    }, 2200);
  },

  /**
   * Clic directo o interacción con el gancho del perchero / chaqueta en bsmnt_03_coat_stand.
   */
  handleCoatStandJacketClick() {
    const saveState = Storage.getSaveGame();
    const isHung = Boolean(saveState?.puzzleFlags?.jacket_hung_on_stand);

    if (isHung) {
      this.showMessage('Una vieja chaqueta de faena cuelga del perchero.');
      return;
    }

    // Comprobar si el jugador tiene seleccionada la chaqueta en el inventario
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'jacket' || selectedItem === 'bsmnt_jacket' || selectedItem === 'chaqueta') {
      this.hangJacketOnCoatStand();
      return;
    }

    this.showMessage('Uno de los ganchos del perchero. Parece un buen lugar para colgar una prenda.');
  },

  /**
   * Cuelga la chaqueta en el perchero:
   * - Retira la chaqueta del inventario.
   * - Muestra el overlay bsmnt_03_jacket.png.
   * - Activa el flag jacket_hung_on_stand = true.
   */
  hangJacketOnCoatStand() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.jacket_hung_on_stand = true;

    // Retirar la chaqueta del inventario
    if (Array.isArray(saveState.inventory)) {
      saveState.inventory = saveState.inventory.filter(
        i => i.id !== 'jacket' && i.id !== 'bsmnt_jacket' && i.id !== 'chaqueta'
      );
    }
    Storage.setSaveGame(saveState);

    // Actualizar UI del inventario
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('jacket', false);
      window.InventoryManager.removeItem('bsmnt_jacket', false);
      window.InventoryManager.removeItem('chaqueta', false);
      window.InventoryManager.selectedItemId = null;
      window.InventoryManager.render();
    }

    // Reproducir sonido de roce de tela y chirrido de la puerta que se abre
    this.playClothRustleSound();
    setTimeout(() => {
      this.playCreakingDoorSound();
    }, 350);

    // Actualizar el overlay visualmente en la escena actual
    const btn = document.getElementById('hotspot_coat_stand_jacket');
    if (btn) {
      btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_03_jacket.webp')";
      btn.style.backgroundSize = '100% 100%';
      btn.style.backgroundRepeat = 'no-repeat';
      btn.style.backgroundPosition = 'center';
      btn.setAttribute('aria-label', 'Chaqueta colgada en el perchero');

      // Animación suave de colocación
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(-12px)';
      btn.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      requestAnimationFrame(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      });
    }

    this.showMessage('Has colgado la chaqueta en el perchero.');

    // Si nos encontramos en la vista general bsmnt_03_main, refrescar los hotspots para mostrar el overlay
    if (this.currentScene === 'bsmnt_03_main') {
      this.renderHotspots();
    }
  },

  /**
   * Clic directo sobre la traspaleta en bsmnt_02_pallet_truck.
   */
  handlePalletTruckClick(h) {
    const saveState = Storage.getSaveGame();
    if (saveState?.puzzleFlags?.pallet_truck_picked) {
      return;
    }

    if (saveState?.puzzleFlags?.pallet_truck_repaired) {
      this.pickPalletTruck();
      return;
    }

    // Si aún no está reparada, comprobar si tiene la rueda seleccionada en el inventario
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'wheel' || selectedItem === 'bsmnt_wheel' || selectedItem === 'rueda') {
      this.repairPalletTruck();
      return;
    }

    this.showMessage('No puedo hacer nada con esta traspaleta, le falta una rueda');
  },

  /**
   * Coloca la rueda en la traspaleta:
   * - Retira la rueda del inventario.
   * - Cambia el overlay a bsmnt_pallet_truck_complete.png.
   * - Marca el flag pallet_truck_repaired = true.
   */
  repairPalletTruck() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.pallet_truck_repaired = true;
    saveState.puzzleFlags.wheel_used_on_pallet = true;

    // Retirar la rueda del inventario
    if (Array.isArray(saveState.inventory)) {
      saveState.inventory = saveState.inventory.filter(i => i.id !== 'wheel' && i.id !== 'bsmnt_wheel' && i.id !== 'rueda');
    }

    Storage.setSaveGame(saveState);

    if (window.InventoryManager) {
      window.InventoryManager.removeItem('wheel', false);
      window.InventoryManager.removeItem('bsmnt_wheel', false);
      window.InventoryManager.removeItem('rueda', false);
      window.InventoryManager.render();
    }

    // Sonido metálico de acoplar la rueda
    this.playPadlockSound();

    // Actualizar imagen del overlay al modelo completo
    const btn = document.getElementById('hotspot_pallet_truck');
    if (btn) {
      btn.style.backgroundImage = "url('assets/levels/level_01_bsmnt/overlays/bsmnt_pallet_truck_complete.webp')";
      btn.setAttribute('aria-label', 'Recoger traspaleta');
    }

    this.showMessage('Has colocado la rueda en la traspaleta. Ahora funciona correctamente.');
  },

  /**
   * Recoge la traspaleta completa y la añade al inventario con popup closeup.
   */
  pickPalletTruck() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.pallet_truck_picked = true;
    saveState.puzzleFlags.has_pallet_truck = true;

    Storage.setSaveGame(saveState);

    // Eliminar el overlay con transición suave
    const btn = document.getElementById('hotspot_pallet_truck');
    if (btn) {
      btn.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }, 250);
    }

    // Desplegar primer plano y añadir la traspaleta al inventario
    const manager = window.InventoryManager || InventoryManager;
    manager.showPickupCloseup({
      id: 'pallet_truck',
      name: 'Traspaleta',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_pallet_truck.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_pallet_truck.webp'
    });
  },

  /**
   * Muestra la baraja de naipes encontrada tras el retrato de Julian:
   * - Añade la entrada correspondiente al diario de Clara.
   * - Muestra la imagen sobre fondo negro en la escena bsmnt_01_cards.
   */
  handleExamineCards() {
    this.cardsReturnScene = this.currentScene || 'bsmnt_01_bench_painting';
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.cards_inspected = true;
    Storage.setSaveGame(saveState);

    const doc = GAME_DOCUMENTS['doc_bsmnt_cards'];
    if (doc) {
      DiaryManager.addEntry({
        id: doc.id,
        title: doc.title,
        badge: doc.badge,
        image: doc.image,
        imageCaption: doc.imageCaption,
        date: doc.date,
        text: doc.text,
        isJournal: true
      });
    }

    this.navigateTo('bsmnt_01_cards');
  },

  /**
   * Clic directo sobre la ranura / botón del interruptor en el cuadro de luces abierto.
   */
  handleLightBoxSwitchClick() {
    const saveState = Storage.getSaveGame();
    const isPlaced = Boolean(saveState?.puzzleFlags?.switch_placed);

    if (!isPlaced) {
      const selectedItem = window.InventoryManager?.selectedItemId;
      if (selectedItem === 'switch' || selectedItem === 'bsmnt_switch' || selectedItem === 'interruptor') {
        this.placeSwitchInLightBox();
        return;
      }
      this.showMessage('Falta un interruptor magnetotérmico en esta ranura para completar el cuadro.');
      return;
    }

    // Si ya está colocado, interactuar con el interruptor
    this.toggleLightBoxSwitch();
  },

  /**
   * Coloca el interruptor en la ranura vacía del cuadro de luces:
   * - Lo retira del inventario
   * - Marca switch_placed en saveState
   * - Inicializa el interruptor en estado OFF (bsmnt_stage_switch_off)
   * - Reproduce sonido de inserción y actualiza la escena
   */
  placeSwitchInLightBox() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.switch_placed = true;
    saveState.puzzleFlags.switch_on = false;
    Storage.setSaveGame(saveState);

    if (window.InventoryManager) {
      if (window.InventoryManager.getItemById('switch')) {
        window.InventoryManager.removeItem('switch');
      } else if (window.InventoryManager.getItemById('bsmnt_switch')) {
        window.InventoryManager.removeItem('bsmnt_switch');
      }
    }

    this.playSwitchInsertSound();
    this.showMessage('Has encajado el interruptor magnetotérmico en el carril.', 3500);
    this.renderHotspots();
  },

  /**
   * Conmuta el interruptor magnetotérmico a ON y restablece la corriente:
   * - Cambia el fondo a bsmnt_stage_switch_on
   * - Activa las flags switch_on, light_on y luz_encendida
   * - A partir de ahora, bsmnt_01_door_to_03 conduce a bsmnt_01_door_to_03_light
   */
  toggleLightBoxSwitch() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    const isCurrentlyOn = Boolean(saveState.puzzleFlags.switch_on);
    if (!isCurrentlyOn) {
      saveState.puzzleFlags.switch_on = true;
      saveState.puzzleFlags.light_on = true;
      saveState.puzzleFlags.luz_encendida = true;
      Storage.setSaveGame(saveState);

      this.playSwitchToggleSound(true);
      this.showMessage('¡Click! La corriente eléctrica ha vuelto. La bodega ahora tiene luz.', 4000);
      this.renderHotspots();
    } else {
      this.showMessage('El interruptor ya está subido y suministrando corriente eléctrica.');
    }
  },

  /**
   * Reproduce el sonido de inserción / encaje de interruptor en carril DIN (assets/audio/sfx/click.mp3).
   */
  playSwitchInsertSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playClick) {
        AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playClick) {
        window.AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/click.mp3');
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
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  },

  /**
   * Reproduce el chasquido seco del magnetotérmico al activarse (assets/audio/sfx/click.mp3).
   */
  playSwitchToggleSound(isOn) {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playClick) {
        AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playClick) {
        window.AudioController.playClick();
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/click.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // Clic mecánico contundente
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(isOn ? 260 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(isOn ? 580 : 90, now + 0.05);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

      // Zumbido eléctrico breve
      if (isOn) {
        const humOsc = this._audioCtx.createOscillator();
        const humGain = this._audioCtx.createGain();
        humOsc.type = 'sawtooth';
        humOsc.frequency.setValueAtTime(100, now + 0.03);
        humGain.gain.setValueAtTime(0.09, now + 0.03);
        humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        humOsc.connect(humGain);
        humGain.connect(this._audioCtx.destination);
        humOsc.start(now + 0.03);
        humOsc.stop(now + 0.25);
      }
    } catch (e) {}
  },

  /**
   * Clic directo sobre el candado en bsmnt_02_padlock.
   */
  handlePadlockClick() {
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'key_padlock' || selectedItem === 'bsmnt_key_to_padlock') {
      this.unlockPadlock();
      return;
    } else if (selectedItem) {
      this.showMessage('Ese objeto no encaja en la cerradura del candado.');
      return;
    } else {
      this.showMessage('El candado TITAN 40 está firmemente cerrado. Necesitas la llave adecuada.');
      return;
    }
  },

  /**
   * Desbloquea el candado en bsmnt_02_padlock, retira la llave del inventario,
   * reproduce el sonido y realiza la transición a bsmnt_02_main_open.
   */
  unlockPadlock() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.padlock_unlocked = true;
    saveState.puzzleFlags.has_padlock_unlocked = true;
    saveState.puzzleFlags.key_padlock_used = true;
    Storage.setSaveGame(saveState);

    // 1. Retirar la llave del inventario
    const manager = window.InventoryManager || InventoryManager;
    if (manager) {
      if (manager.getItemById('key_padlock')) {
        manager.removeItem('key_padlock');
      } else if (manager.getItemById('bsmnt_key_to_padlock')) {
        manager.removeItem('bsmnt_key_to_padlock');
      }
    }

    // 2. Reproducir efecto sonoro del candado abriéndose
    this.playPadlockSound();

    // 3. Notificación al jugador
    this.showMessage('El candado se abre con un chasquido metálico y la verja cede.');

    // 4. Transición fluida a la nueva escena con fondo bsmnt_02_main_open
    setTimeout(() => {
      this.navigateTo('bsmnt_02_main_open');
    }, 700);
  },

  /**
   * Reproduce el sonido de apertura del candado (padlock.mp3 o Web Audio API sintético).
   */
  playPadlockSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/padlock.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // Chasquido metálico del mecanismo interno
      const osc1 = this._audioCtx.createOscillator();
      const gain1 = this._audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(450, now);
      osc1.frequency.exponentialRampToValueAtTime(160, now + 0.12);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(this._audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Liberación y apertura del grillete metálico
      const osc2 = this._audioCtx.createOscillator();
      const gain2 = this._audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(800, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.28);
      gain2.gain.setValueAtTime(0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(this._audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } catch (e) {}
  },

  /**
   * Reproduce el sonido de trinquete y torsión metálica de la llave inglesa (wrench.mp3 o Web Audio API sintético).
   */
  playWrenchSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/wrench.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // Crujido inicial metálico de torsión
      const osc1 = this._audioCtx.createOscillator();
      const gain1 = this._audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(this._audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);
    } catch (e) {}
  },

  /**
   * Clic directo sobre el candado del arcón en bsmnt_02_trunk_closeup.
   */
  handleTrunkCloseupPadlockClick() {
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'acid' || selectedItem === 'bsmnt_acid') {
      this.dissolveTrunkPadlockWithAcid();
      return;
    } else if (selectedItem) {
      this.showMessage('Ese objeto no sirve para abrir este candado.');
      return;
    } else {
      this.showMessage('El candado está completamente oxidado y atascado. Haría falta una sustancia corrosiva para destruirlo.');
      return;
    }
  },

  /**
   * Vierte el ácido sobre el candado del arcón en bsmnt_02_trunk_closeup:
   * corroe el cerrojo metálico, reproduce animación cinemática de borboteo y vapor,
   * sonido de efervescencia ácida, retira el ácido del inventario y realiza la transición
   * a bsmnt_02_trunk_closeup_open.
   */
  dissolveTrunkPadlockWithAcid() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.trunk_acid_used = true;
    saveState.puzzleFlags.trunk_02_open = true;
    saveState.puzzleFlags.has_acid = false;
    if (Array.isArray(saveState.inventory)) {
      saveState.inventory = saveState.inventory.filter(i => i.id !== 'acid' && i.id !== 'bsmnt_acid');
    }
    Storage.setSaveGame(saveState);

    // 1. Retirar el frasco de ácido del inventario
    const manager = window.InventoryManager || InventoryManager;
    if (manager) {
      if (manager.getItemById('acid')) {
        manager.removeItem('acid');
      } else if (manager.getItemById('bsmnt_acid')) {
        manager.removeItem('bsmnt_acid');
      }
    }

    // 2. Efecto sonoro de ácido efervescente disolviendo el candado
    this.playAcidSizzleSound();

    // 3. Notificación al jugador
    this.showMessage('El ácido corroe rápidamente el metal oxidado. El candado cede y el arcón se abre.', 4500);

    // 4. Ejecutar animación visual de borboteo cáustico, resplandor y vapor
    this.playAcidCorrosionAnimation(() => {
      // 5. Transición fluida a la escena del arcón abierto
      this.navigateTo('bsmnt_02_trunk_closeup_open');
    });
  },

  /**
   * Animación cinemática del ácido corroyendo el candado de metal en bsmnt_02_trunk_closeup:
   * genera resplandor cáustico, borboteo de burbujas en efervescencia continua,
   * micro-salpicaduras y volutas de vapor ácido ascendente con desenfoque.
   */
  playAcidCorrosionAnimation(onComplete) {
    const container = this.sceneOverlays || document.getElementById('scene-overlays');
    if (!container) {
      if (onComplete) onComplete();
      return;
    }

    const animLayer = document.createElement('div');
    animLayer.className = 'acid-reaction-layer';

    const zone = document.createElement('div');
    zone.className = 'acid-reaction-zone';

    // 1. Resplandor cáustico de corrosión sobre el candado
    const glow = document.createElement('div');
    glow.className = 'acid-corrosion-glow';
    zone.appendChild(glow);

    animLayer.appendChild(zone);
    container.appendChild(animLayer);

    // 2. Generador continuo de burbujas efervescentes durante ~1.5 segundos
    const bubbleCount = 28;
    for (let i = 0; i < bubbleCount; i++) {
      const delay = Math.random() * 1.5;
      setTimeout(() => {
        if (!animLayer.parentNode) return;
        const bubble = document.createElement('div');
        bubble.className = 'acid-bubble';

        const size = 5 + Math.random() * 8; // 5px a 13px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // Coordenadas relativas en la zona del candado
        const leftPct = 25 + Math.random() * 50; // 25% a 75%
        const topPct = 35 + Math.random() * 45;  // 35% a 80%
        bubble.style.left = `${leftPct}%`;
        bubble.style.top = `${topPct}%`;

        // Desviación horizontal y altura de subida
        const driftX = (Math.random() - 0.5) * 44; // -22px a +22px
        const riseY = -(30 + Math.random() * 45);  // -30px a -75px
        bubble.style.setProperty('--drift-x', `${driftX}px`);
        bubble.style.setProperty('--rise-y', `${riseY}px`);

        const duration = 0.8 + Math.random() * 0.5; // 0.8s a 1.3s
        bubble.style.animationDuration = `${duration}s`;

        zone.appendChild(bubble);

        // Limpiar la burbuja tras su ciclo
        setTimeout(() => {
          if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
        }, duration * 1000 + 100);
      }, delay * 1000);
    }

    // 3. Salpicaduras rápidas (spits) al reventar el borboteo
    const spitCount = 18;
    for (let j = 0; j < spitCount; j++) {
      const spitDelay = 0.15 + Math.random() * 1.4;
      setTimeout(() => {
        if (!animLayer.parentNode) return;
        const spit = document.createElement('div');
        spit.className = 'acid-spit';

        const spitSize = 2 + Math.random() * 2.5;
        spit.style.width = `${spitSize}px`;
        spit.style.height = `${spitSize}px`;

        const sLeft = 30 + Math.random() * 40;
        const sTop = 40 + Math.random() * 35;
        spit.style.left = `${sLeft}%`;
        spit.style.top = `${sTop}%`;

        const spitX = (Math.random() - 0.5) * 36;
        const spitY = -(10 + Math.random() * 28);
        spit.style.setProperty('--spit-x', `${spitX}px`);
        spit.style.setProperty('--spit-y', `${spitY}px`);

        zone.appendChild(spit);

        setTimeout(() => {
          if (spit.parentNode) spit.parentNode.removeChild(spit);
        }, 550);
      }, spitDelay * 1000);
    }

    // 4. Volutas de vapor ácido con desenfoque ascendente
    const vaporCount = 7;
    for (let k = 0; k < vaporCount; k++) {
      const vaporDelay = 0.1 + k * 0.22;
      setTimeout(() => {
        if (!animLayer.parentNode) return;
        const vapor = document.createElement('div');
        vapor.className = 'acid-vapor';

        const vWidth = 55 + Math.random() * 35;  // 55px a 90px
        const vHeight = 70 + Math.random() * 40; // 70px a 110px
        vapor.style.width = `${vWidth}px`;
        vapor.style.height = `${vHeight}px`;

        const vLeft = 20 + Math.random() * 45;
        const vTop = 25 + Math.random() * 35;
        vapor.style.left = `${vLeft}%`;
        vapor.style.top = `${vTop}%`;

        const vDrift = (Math.random() - 0.5) * 60;
        const vRise = -(70 + Math.random() * 70);
        const vRot = (Math.random() - 0.5) * 50;
        vapor.style.setProperty('--vapor-drift-x', `${vDrift}px`);
        vapor.style.setProperty('--vapor-rise-y', `${vRise}px`);
        vapor.style.setProperty('--vapor-rot', `${vRot}deg`);

        const vDur = 1.6 + Math.random() * 0.5;
        vapor.style.animationDuration = `${vDur}s`;

        zone.appendChild(vapor);

        setTimeout(() => {
          if (vapor.parentNode) vapor.parentNode.removeChild(vapor);
        }, vDur * 1000 + 100);
      }, vaporDelay * 1000);
    }

    // 5. Finalización y transición al concluir el borboteo (~2.1 segundos)
    setTimeout(() => {
      if (animLayer.parentNode) {
        animLayer.parentNode.removeChild(animLayer);
      }
      if (onComplete) onComplete();
    }, 2100);
  },

  /**
   * Sonido de ácido reaccionando / corroyendo el metal y fractura del candado.
   */
  playAcidSizzleSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/acid.mp3');
        setTimeout(() => {
          this.playDoorUnlockSound();
        }, 1400);
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/acid.mp3');
        setTimeout(() => {
          this.playDoorUnlockSound();
        }, 1400);
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const ctx = this._audioCtx;
      const now = ctx.currentTime;

      // 1. Ruido blanco filtrado paso banda simulando efervescencia química y borboteo (~1.6s)
      const bufferSize = Math.floor(ctx.sampleRate * 1.6);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1400, now);
      bandpass.frequency.linearRampToValueAtTime(3200, now + 0.6);
      bandpass.frequency.exponentialRampToValueAtTime(750, now + 1.55);
      bandpass.Q.setValueAtTime(3.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.38, now + 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.58);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 1.6);

      // 2. Gorgoteos / burbujeo cáustico continuo durante la efervescencia
      for (let i = 0; i < 9; i++) {
        const bubbleTime = now + 0.08 + i * 0.16;
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(320 + (i % 4) * 140, bubbleTime);
        bOsc.frequency.exponentialRampToValueAtTime(850 + (i % 3) * 180, bubbleTime + 0.08);
        bGain.gain.setValueAtTime(0.14, bubbleTime);
        bGain.gain.exponentialRampToValueAtTime(0.001, bubbleTime + 0.09);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(bubbleTime);
        bOsc.stop(bubbleTime + 0.1);
      }

      // 3. Chasquido y fractura del candado al ceder (a los ~1400ms)
      setTimeout(() => {
        this.playDoorUnlockSound();
      }, 1400);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Clic sobre el cajón superior del escritorio en bsmnt_02_desktop_closeup:
   * - Si aún no tiene el tirador: "Así no puedo abrirlo"
   * - Si ya tiene el tirador: navega a bsmnt_02_drawer
   */
  handleTopDrawerClick() {
    const saveState = Storage.getSaveGame();
    if (!saveState?.puzzleFlags?.drawer_handle_placed) {
      this.showMessage('Así no puedo abrirlo');
      return;
    }
    this.navigateTo('bsmnt_02_drawer');
  },

  /**
   * Coloca el pomo/tirador en el cajón superior del escritorio en bsmnt_02_desktop_closeup:
   * desaparecen el ítem del inventario y el overlay bsmnt_no_handle, revelando el tirador.
   */
  attachDrawerHandle() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.drawer_handle_placed = true;
    saveState.puzzleFlags.has_handle = false;
    saveState.inventory = (saveState.inventory || []).filter(i => i.id !== 'handle' && i.id !== 'bsmnt_handle');
    Storage.setSaveGame(saveState);

    // 1. Retirar el pomo del inventario
    const manager = window.InventoryManager || InventoryManager;
    if (manager) {
      if (manager.getItemById('handle')) {
        manager.removeItem('handle');
      } else if (manager.getItemById('bsmnt_handle')) {
        manager.removeItem('bsmnt_handle');
      }
    }

    // 2. Desaparecer el overlay bsmnt_no_handle con animación
    const overlayEl = document.getElementById('hotspot_desktop_drawer_no_handle');
    if (overlayEl) {
      overlayEl.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      overlayEl.style.opacity = '0';
      overlayEl.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
      }, 280);
    }

    // 3. Efecto sonoro de colocación de tirador
    this.playHandlePlacedSound();

    // 4. Notificación al jugador
    this.showMessage('Has colocado el tirador en el cajón.');
  },

  /**
   * Reproduce el sonido de apertura/cierre de cajón de madera (assets/audio/sfx/drawer.mp3).
   */
  playDrawerSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/drawer.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/drawer.mp3');
        return;
      }
    } catch (e) {}
  },

  /**
   * Reproduce sonido de encaje de tirador metálico / pomo en madera.
   */
  playHandlePlacedSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  },

  /**
   * Navegación al cuadro en la pared (desde bsmnt_01_main o bsmnt_01_bench):
   * - Si la bombilla ultravioleta ya ha sido colocada: va directamente a bsmnt_01_painting_v
   * - Si aún no ha sido colocada: va a bsmnt_01_painting
   */
  handlePaintingNavigate() {
    const saveState = Storage.getSaveGame();
    const isUVActive = Boolean(saveState?.puzzleFlags?.bulb_in_painting_lamp || saveState?.puzzleFlags?.painting_uv_active);
    if (isUVActive) {
      this.navigateTo('bsmnt_01_painting_v');
    } else {
      this.navigateTo('bsmnt_01_painting');
    }
  },

  /**
   * Interacción directa al hacer clic sobre la lámpara del cuadro en bsmnt_01_painting.
   * - Si la bombilla está seleccionada en el inventario: la coloca y enciende.
   * - Si la bombilla ya está colocada: mensaje informativo.
   * - Si no: describe que el casquillo está vacío y necesita una bombilla.
   */
  handlePaintingLampClick() {
    const saveState = Storage.getSaveGame();
    const isUVActive = Boolean(saveState?.puzzleFlags?.bulb_in_painting_lamp || saveState?.puzzleFlags?.painting_uv_active);
    if (isUVActive) {
      this.showMessage('La bombilla ultravioleta está encendida e ilumina el lienzo.');
      return;
    }

    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'bulb' || selectedItem === 'bsmnt_bulb' || selectedItem === 'bombilla') {
      this.placeBulbInLamp();
      return;
    }

    this.showMessage('La lámpara de pared no tiene bombilla. El casquillo está vacío.');
  },

  /**
   * Enrosca la bombilla en la lámpara sobre el cuadro:
   * - Marca las flags de guardado correspondientes
   * - Retira la bombilla del inventario
   * - Reproduce sonido de rosca y zumbido eléctrico UV
   * - Muestra mensaje y navega a bsmnt_01_painting_v
   */
  placeBulbInLamp() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.bulb_in_painting_lamp = true;
    saveState.puzzleFlags.painting_uv_active = true;
    saveState.puzzleFlags.bulb_used = true;
    Storage.setSaveGame(saveState);

    // Retirar la bombilla del inventario
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('bulb');
    }

    // Efecto sonoro de enroscar bombilla y encendido UV
    this.playBulbScrewSound();

    // Mensaje descriptivo
    this.showMessage('Has enroscado la bombilla. La luz ultravioleta revela inscripciones fluorescentes en el lienzo.', 4000);

    // Navegar a la escena iluminada por UV tras un breve momento
    setTimeout(() => {
      this.navigateTo('bsmnt_01_painting_v');
    }, 450);
  },

  /**
   * Sonido al enroscar la bombilla y encendido de luz UV (assets/audio/sfx/bulb.mp3).
   */
  playBulbScrewSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/bulb.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/bulb.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // 1. Fricción metálica de rosca (dos giros breves)
      for (let i = 0; i < 2; i++) {
        const offset = i * 0.14;
        const osc = this._audioCtx.createOscillator();
        const gain = this._audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(420 + i * 40, now + offset);
        osc.frequency.exponentialRampToValueAtTime(720 + i * 40, now + offset + 0.09);
        gain.gain.setValueAtTime(0.01, now + offset);
        gain.gain.linearRampToValueAtTime(0.12, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(this._audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      }

      // 2. Chasquido de contacto eléctrico
      const clickOsc = this._audioCtx.createOscillator();
      const clickGain = this._audioCtx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(950, now + 0.3);
      clickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.36);
      clickGain.gain.setValueAtTime(0.25, now + 0.3);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      clickOsc.connect(clickGain);
      clickGain.connect(this._audioCtx.destination);
      clickOsc.start(now + 0.3);
      clickOsc.stop(now + 0.39);

      // 3. Zumbido fluorescente UV suave
      const humOsc = this._audioCtx.createOscillator();
      const humGain = this._audioCtx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(120, now + 0.32);
      humGain.gain.setValueAtTime(0.01, now + 0.32);
      humGain.gain.linearRampToValueAtTime(0.16, now + 0.38);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      humOsc.connect(humGain);
      humGain.connect(this._audioCtx.destination);
      humOsc.start(now + 0.32);
      humOsc.stop(now + 0.78);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Interacción directa al hacer clic sobre el panel de conexiones en bsmnt_01_light_box.
   * - Si los cables ya fueron colocados o el puzle ya fue resuelto: navega a bsmnt_01_light_box_panel.
   * - Si el jugador tiene los cables seleccionados en el inventario: los coloca y transiciona al puzle.
   * - Si no: mensaje informativo indicando que necesita cables de puenteo.
   */
  handleLightBoxPanelClick() {
    const saveState = Storage.getSaveGame();
    const hasPlacedWires = Boolean(
      saveState?.puzzleFlags?.wires_placed_on_panel ||
      saveState?.puzzleFlags?.light_box_wires_solved ||
      saveState?.puzzleFlags?.light_box_open
    );

    if (hasPlacedWires) {
      this.navigateTo('bsmnt_01_light_box_panel');
      return;
    }

    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'wires' || selectedItem === 'bsmnt_wires' || selectedItem === 'cables') {
      this.placeWiresOnLightBoxPanel();
      return;
    }

    this.showMessage('El panel de conexiones requiere cables de puenteo para cerrar el circuito.');
  },

  /**
   * Coloca los cables en el panel del cuadro de luces:
   * - Marca la flag en la partida guardada
   * - Retira los cables del inventario
   * - Navega a la escena de primer plano del puzle (bsmnt_01_light_box_panel)
   */
  placeWiresOnLightBoxPanel() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.wires_placed_on_panel = true;
    saveState.puzzleFlags.wires_used = true;
    Storage.setSaveGame(saveState);

    if (window.InventoryManager) {
      if (window.InventoryManager.getItemById('wires')) {
        window.InventoryManager.removeItem('wires');
      } else if (window.InventoryManager.getItemById('bsmnt_wires')) {
        window.InventoryManager.removeItem('bsmnt_wires');
      }
    }

    this.showMessage('Has insertado los cables en el panel de pruebas.', 3000);
    setTimeout(() => {
      this.navigateTo('bsmnt_01_light_box_panel');
    }, 350);
  },

  /**
   * Interacción con el pomo de la puerta a la Sala 2 en bsmnt_01_door_to_02:
   * - Si el criptex ya está resuelto (cryptex_solved / door_02_unlocked):
   *   Abre la puerta con sonido y transiciona a la escena de las escaleras (bsmnt_02_stairs).
   * - Si aún no está resuelto:
   *   Navega a la escena de primer plano del panel del criptex (bsmnt_01_cryptex).
   */
  handleDoor02KnobClick() {
    const saveState = Storage.getSaveGame();
    const isUnlocked = Boolean(
      saveState?.puzzleFlags?.cryptex_solved ||
      saveState?.puzzleFlags?.door_02_unlocked
    );

    if (isUnlocked) {
      this.openDoorTo02();
      return;
    }

    this.navigateTo('bsmnt_01_cryptex');
  },

  /**
   * Abre la puerta a la Sala 2 con efecto sonoro y navega a bsmnt_02_stairs.
   */
  openDoorTo02() {
    this.navigateThroughDoor('bsmnt_02_stairs', {
      message: 'El pomo gira libremente y la puerta de madera se abre hacia el descansillo.'
    });
  },

  /**
   * Reproduce el sonido de puerta chirriando / abriéndose (creaking_door.mp3 o Web Audio API).
   */
  playCreakingDoorSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/creaking_door.mp3');
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
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(310, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.35);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  },

  /**
   * Navegación hacia el botiquín de pared en bsmnt_01_med_chest:
   * - Si ya está desbloqueado/abierto: navega a bsmnt_01_med_chest_close_up_open.
   * - Si está cerrado con llave: navega a bsmnt_01_med_chest_close_up.
   */
  handleMedChestDetailNavigate() {
    const saveState = Storage.getSaveGame();
    const isOpen = Boolean(saveState?.puzzleFlags?.med_chest_unlocked || saveState?.puzzleFlags?.med_chest_open);
    if (isOpen) {
      this.navigateTo('bsmnt_01_med_chest_close_up_open');
    } else {
      this.navigateTo('bsmnt_01_med_chest_close_up');
    }
  },

  /**
   * Clic directo sobre la cerradura del botiquín en bsmnt_01_med_chest_close_up.
   */
  handleMedChestLockClick() {
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (
      selectedItem === 'keys_med_chest' ||
      selectedItem === 'key_med_chest' ||
      selectedItem === 'bsmnt_keys_to_med_chest' ||
      selectedItem === 'bsmnt_key_to_med_chest'
    ) {
      this.unlockMedChest();
      return;
    } else if (selectedItem) {
      this.showMessage('Ese objeto no encaja en la cerradura del botiquín.');
      return;
    } else {
      this.showMessage('El botiquín está cerrado con llave. Necesitas una llave adecuada para abrirlo.');
      return;
    }
  },

  /**
   * Desbloquea y abre el botiquín con las llaves, reproduce sonido de cerradura,
   * retira las llaves del inventario y realiza la transición a bsmnt_01_med_chest_close_up_open.
   */
  unlockMedChest() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
    saveState.puzzleFlags.med_chest_unlocked = true;
    saveState.puzzleFlags.med_chest_open = true;
    saveState.puzzleFlags.keys_med_chest_used = true;
    saveState.puzzleFlags.med_chest_colors_inspected = true;
    Storage.setSaveGame(saveState);

    // Retirar las llaves del inventario
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('keys_med_chest');
      window.InventoryManager.removeItem('key_med_chest');
      window.InventoryManager.removeItem('bsmnt_keys_to_med_chest');
      window.InventoryManager.removeItem('bsmnt_key_to_med_chest');
    }

    // Registrar apunte en el diario (Pista de cables en el botiquín)
    const doc = GAME_DOCUMENTS['doc_bsmnt_chest_colors'];
    if (doc && window.DiaryManager) {
      window.DiaryManager.addEntry({
        id: doc.id,
        title: doc.title,
        badge: doc.badge,
        image: doc.image,
        imageCaption: doc.imageCaption,
        date: doc.date,
        text: doc.text,
        isJournal: true
      });
    }

    // Reproducir sonido de desbloqueo de cerradura
    this.playDoorUnlockSound();

    // Transición suave a la escena del botiquín abierto
    this.navigateTo('bsmnt_01_med_chest_close_up_open');

    setTimeout(() => {
      this.showMessage('En el botiquín hay unos frascos de colores... Tomaré nota en el diario.', 4500);
    }, 400);
  },

  /**
   * Interacción con la caja de madera bajo la ventana en bsmnt_01_med_chest.
   */
  handleMedChestBoxClick() {
    const saveState = Storage.getSaveGame();
    const isOpen = Boolean(saveState?.puzzleFlags?.chest_open || saveState?.puzzleFlags?.med_chest_box_open);
    if (isOpen) {
      this.navigateTo('bsmnt_01_chest_close_up');
      return;
    }

    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'hammer' || selectedItem === 'bsmnt_hammer' || selectedItem === 'martillo') {
      this.openMedChestBox();
      return;
    }

    this.showMessage('La caja de madera está firmemente clavada. Necesitas una herramienta adecuada para abrirla.');
  },

  /**
   * Abre la caja de madera con el martillo sacaclavos, reproduce sonido y muestra el overlay open_chest.png.
   */
  openMedChestBox() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.chest_open = true;
    saveState.puzzleFlags.med_chest_box_open = true;
    saveState.puzzleFlags.has_chest_opened = true;
    saveState.puzzleFlags.hammer_used = true;
    Storage.setSaveGame(saveState);

    // Retirar el martillo del inventario (desaparece y los objetos inferiores suben un slot)
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('hammer');
    }

    // Reproducir efecto sonoro de apalancamiento y extracción forzada de clavos
    this.playWoodPrySound();

    // Mensaje de acción
    this.showMessage('Has desclavado y abierto la caja con el martillo sacaclavos.');

    // Re-renderizar los hotspots de la escena para colocar el overlay open_chest.png
    this.renderHotspots();
  },

  /**
   * Navegación desde el cajón bajo la ventana en bsmnt_01_med_chest:
   * - Si está cerrado: navega a la escena de primer plano de la caja cerrada (bsmnt_01_chest_close_up).
   * - Si ya está abierto: navega a la escena del interior abierto (bsmnt_01_chest_close_up_open).
   */
  handleChestBoxNavigate() {
    const saveState = Storage.getSaveGame();
    const isOpen = Boolean(saveState?.puzzleFlags?.chest_open || saveState?.puzzleFlags?.med_chest_box_open);
    if (isOpen) {
      this.navigateTo('bsmnt_01_chest_close_up_open');
    } else {
      this.navigateTo('bsmnt_01_chest_close_up');
    }
  },

  /**
   * Intento de abrir la tapa de la caja cerrada en bsmnt_01_chest_close_up al hacer clic sobre el colisionador.
   */
  handlePryChestLid() {
    const selectedItem = window.InventoryManager?.selectedItemId;
    if (selectedItem === 'hammer' || selectedItem === 'bsmnt_hammer' || selectedItem === 'martillo') {
      this.openChestInCloseup();
      return;
    }
    this.showMessage('La tapa de la caja está fuertemente clavada. Necesitas una herramienta para hacer palanca.');
  },

  /**
   * Abre la caja de madera desde la escena de primer plano (bsmnt_01_chest_close_up)
   * ejecutando la animación del martillo sacando los clavos, reproduciendo efectos sonoros,
   * retirando el martillo del inventario y pasando a bsmnt_01_chest_close_up_open.
   */
  openChestInCloseup() {
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    saveState.puzzleFlags.chest_open = true;
    saveState.puzzleFlags.med_chest_box_open = true;
    saveState.puzzleFlags.has_chest_opened = true;
    saveState.puzzleFlags.hammer_used = true;
    Storage.setSaveGame(saveState);

    // 1. Retirar el martillo del inventario (desaparece con animación y los objetos inferiores suben)
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('hammer');
    }

    // 2. Ejecutar la animación visual del martillo apalancando los clavos
    this.playHammerPryAnimation(() => {
      // 3. Transición a la escena de la caja abierta
      this.navigateTo('bsmnt_01_chest_close_up_open');
    });
  },

  /**
   * Animación cinemática del martillo sacando los clavos de la tapa de la caja cerrada.
   */
  playHammerPryAnimation(onComplete) {
    const container = this.sceneOverlays || document.getElementById('scene-overlays');
    if (!container) {
      this.playWoodPrySound();
      if (onComplete) onComplete();
      return;
    }

    // Capa para aislar los elementos de la animación
    const animLayer = document.createElement('div');
    animLayer.className = 'chest-anim-layer';

    // Elemento gráfico del martillo
    const hammerEl = document.createElement('div');
    hammerEl.className = 'chest-hammer-actor';

    animLayer.appendChild(hammerEl);
    container.appendChild(animLayer);

    // 1er apalancamiento: clavo izquierdo a los ~380ms
    setTimeout(() => {
      this.playWoodPrySound();
      this.spawnNailParticle(animLayer, 32, 24, -35);
    }, 380);

    // 2do apalancamiento: clavo derecho a los ~1050ms
    setTimeout(() => {
      this.playWoodPrySound();
      this.spawnNailParticle(animLayer, 65, 24, 35);
    }, 1050);

    // Mensaje en pantalla durante la acción
    this.showMessage('¡Desclavando la tapa con el martillo sacaclavos!', 2400);

    // Finalización al completarse la animación (1.6s)
    setTimeout(() => {
      if (animLayer.parentNode) {
        animLayer.parentNode.removeChild(animLayer);
      }
      if (onComplete) onComplete();
    }, 1650);
  },

  /**
   * Genera un clavo saliendo despedido que rota y cae con gravedad.
   */
  spawnNailParticle(parent, xPct, yPct, angle) {
    if (!parent) return;
    const nail = document.createElement('div');
    nail.className = 'chest-nail-particle';
    nail.style.left = `${xPct}%`;
    nail.style.top = `${yPct}%`;
    nail.style.setProperty('--fly-x', `${angle * 1.8}px`);
    parent.appendChild(nail);
  },

  /**
   * Genera una astilla de madera saliendo despedida al apalancar.
   */
  spawnSplinterParticle(parent, xPct, yPct, angle) {
    if (!parent) return;
    const splinter = document.createElement('div');
    splinter.className = 'wood-splinter-particle';
    splinter.style.left = `${xPct}%`;
    splinter.style.top = `${yPct}%`;
    splinter.style.setProperty('--fly-x', `${angle * 1.5}px`);
    parent.appendChild(splinter);
  },

  /**
   * Lógica condicional del baúl en bsmnt_01_main:
   * - Si está cerrado: navega a bsmnt_01_trunk.
   * - Si está abierto: navega a bsmnt_01_trunk_open.
   */
  handleTrunkClick() {
    const saveState = Storage.getSaveGame();
    const isTrunkOpen = Boolean(saveState?.puzzleFlags?.trunk_open || saveState?.puzzleFlags?.baul_abierto);

    if (isTrunkOpen) {
      this.navigateTo('bsmnt_01_trunk_open');
    } else {
      this.navigateTo('bsmnt_01_trunk');
    }
  },

  /**
   * Lógica de interacción directa (clic) con la puerta a la zona 03:
   * 1. Si ya está desbloqueada: permite pasar directamente a la sala (oscura o iluminada).
   * 2. Si está bloqueada pero la llave está seleccionada en el inventario: la desbloquea y abre.
   * 3. Si está bloqueada y no se usa la llave: muestra mensaje "Está cerrada con llave...".
   */
  handleDoorTo03() {
    const saveState = Storage.getSaveGame();
    const isUnlocked = Boolean(saveState?.puzzleFlags?.door_03_unlocked);

    // Si ya fue desbloqueada con la llave, se puede cruzar libremente
    if (isUnlocked) {
      const isLightOn = Boolean(saveState?.puzzleFlags?.light_on || saveState?.puzzleFlags?.luz_encendida || saveState?.puzzleFlags?.switch_on);
      const targetScene = isLightOn ? 'bsmnt_01_door_to_03_light' : 'bsmnt_01_door_to_03_dark';
      this.navigateDoorCrossfade(targetScene);
      return;
    }

    // Si tiene la llave seleccionada en el inventario al hacer clic sobre la puerta
    if (window.InventoryManager?.selectedItemId === 'key_door_03') {
      this.unlockAndOpenDoorTo03();
      return;
    }

    // Puerta cerrada con llave
    this.showMessage('msg_door_locked');
  },

  /**
   * Desbloquea la puerta a la Sala 3 y transiciona a la escena oscura o iluminada con apertura directa.
   */
  unlockAndOpenDoorTo03() {
    if (this.isTransitioning) return;

    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (!saveState.puzzleFlags) saveState.puzzleFlags = {};

    const alreadyUnlocked = Boolean(saveState.puzzleFlags.door_03_unlocked);
    saveState.puzzleFlags.door_03_unlocked = true;
    saveState.puzzleFlags.has_key_door_03 = true;
    Storage.setSaveGame(saveState);

    // Retirar la llave del inventario: desaparece y los objetos bajo ella suben un slot
    if (window.InventoryManager) {
      window.InventoryManager.removeItem('key_door_03');
    }

    // Reproducir efecto sonoro de cerradura metálica girando y pestillo
    this.playDoorUnlockSound();

    const isLightOn = Boolean(saveState.puzzleFlags?.light_on || saveState.puzzleFlags?.luz_encendida || saveState.puzzleFlags?.switch_on);
    const targetScene = isLightOn ? 'bsmnt_01_door_to_03_light' : 'bsmnt_01_door_to_03_dark';

    if (!alreadyUnlocked) {
      this.showMessage('¡La llave encaja y gira con un chasquido metálico! La puerta se abre.', 3500);
    }

    // Tras el chasquido del cerrojo metálico (380ms), comienza la apertura directa con disolución progresiva
    this.navigateDoorCrossfade(targetScene, {
      delay: 380
    });
  },

  /**
   * Determina si un elemento o hotspot corresponde a una acción de navegación o cambio de vista.
   * Los hotspots de navegación nunca deben recibir eventos de soltar objetos de inventario.
   */
  isNavigationHotspot(hotspotEl) {
    if (!hotspotEl) return false;
    const action = hotspotEl.dataset?.action || '';
    const targetScene = hotspotEl.dataset?.targetScene || '';
    if (action === 'navigate' || targetScene) return true;
    if (action.includes('navigate')) return true;
    const id = hotspotEl.id || '';
    if (
      id === 'hotspot_door_to_03' ||
      id === 'hotspot_main_painting' ||
      id === 'hotspot_pale_light_box' ||
      id === 'hotspot_main_padlock' ||
      id === 'hotspot_med_chest_detail' ||
      id === 'hotspot_med_chest_box' ||
      id === 'hotspot_trunk_box' ||
      id === 'hotspot_trunk_padlock' ||
      id === 'hotspot_bsmnt_03_planks' ||
      id === 'hotspot_bsmnt_03_locker' ||
      id === 'hotspot_bsmnt_03_coat_stand' ||
      id === 'hotspot_bsmnt_03_main_jacket' ||
      id === 'hotspot_bsmnt_01_pipes' ||
      id === 'hotspot_bsmnt_03_niche'
    ) {
      return true;
    }
    return false;
  },

  /**
   * Obtiene el elemento hotspot que colisiona con el punto (clientX, clientY) en pantalla.
   * Ignora los hotspots de navegación, devolviendo únicamente hotspots interactivos de puzzle.
   */
  getHotspotAtPoint(clientX, clientY) {
    if (typeof clientX !== 'number' || typeof clientY !== 'number') return null;

    // 1. Detección directa buscando el primer hotspot interactivo (no navegación)
    const elements = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
    for (const el of elements) {
      const hotspot = el?.closest('.scene-hotspot');
      if (hotspot && !this.isNavigationHotspot(hotspot)) {
        return hotspot;
      }
    }

    // 2. Colisión geométrica con los rectángulos de los hotspots interactivos activos en la escena
    const hotspots = document.querySelectorAll('.scene-hotspot');
    for (const h of hotspots) {
      if (this.isNavigationHotspot(h)) continue;
      const rect = h.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return h;
      }
    }
    return null;
  },

  /**
   * Comprueba si una clavija/hotspot receptora acepta el itemId especificado y no ha sido resuelta ya.
   */
  isItemAcceptedByHotspot(itemId, hotspotId) {
    if (!itemId || !hotspotId) return false;
    const saveState = Storage.getSaveGame();

    // 1. Cerradura de la Puerta hacia Sala 3 (bsmnt_01_door_to_03)
    if (hotspotId === 'hotspot_door_03_interact') {
      if (saveState?.puzzleFlags?.door_03_unlocked) return false;
      return itemId === 'key_door_03' || itemId === 'llave_puerta_03';
    }

    // 2. Tapa de la caja de madera (bsmnt_01_chest_close_up)
    if (hotspotId === 'hotspot_chest_lid_closed') {
      const isOpen = Boolean(saveState?.puzzleFlags?.chest_open || saveState?.puzzleFlags?.med_chest_box_open);
      if (isOpen) return false;
      return itemId === 'hammer' || itemId === 'bsmnt_hammer' || itemId === 'martillo';
    }

    // 3. Lámpara sobre el cuadro (bsmnt_01_painting)
    if (hotspotId === 'hotspot_painting_lamp') {
      const isUVActive = Boolean(saveState?.puzzleFlags?.bulb_in_painting_lamp || saveState?.puzzleFlags?.painting_uv_active);
      if (isUVActive) return false;
      return itemId === 'bulb' || itemId === 'bsmnt_bulb' || itemId === 'bombilla';
    }

    // 4. Panel de conexiones del cuadro de luces (bsmnt_01_light_box)
    if (hotspotId === 'hotspot_light_box_panel') {
      if (saveState?.puzzleFlags?.wires_placed || saveState?.puzzleFlags?.light_box_solved) return false;
      return itemId === 'wires' || itemId === 'bsmnt_wires' || itemId === 'cables';
    }

    // 5. Candado de la arqueta (bsmnt_02_padlock)
    if (hotspotId === 'hotspot_padlock') {
      if (saveState?.puzzleFlags?.padlock_unlocked || saveState?.puzzleFlags?.basin_unlocked) return false;
      return itemId === 'key_padlock' || itemId === 'bsmnt_key_to_padlock';
    }

    // 6. Traspaleta - rueda (bsmnt_02_pallet_truck)
    if (hotspotId === 'hotspot_pallet_truck') {
      if (saveState?.puzzleFlags?.pallet_truck_repaired) return false;
      return itemId === 'wheel' || itemId === 'bsmnt_wheel' || itemId === 'rueda';
    }

    // 7. Cajón superior del escritorio - pomo (bsmnt_02_desktop_closeup)
    if (hotspotId === 'hotspot_desktop_drawer_no_handle' || hotspotId === 'hotspot_desktop_top_drawer') {
      if (saveState?.puzzleFlags?.drawer_handle_placed) return false;
      return itemId === 'handle' || itemId === 'bsmnt_handle' || itemId === 'pomo';
    }

    // 8. Cerradura del botiquín (bsmnt_01_med_chest_close_up)
    if (hotspotId === 'hotspot_med_chest_lock') {
      if (saveState?.puzzleFlags?.med_chest_unlocked) return false;
      return (
        itemId === 'keys_med_chest' ||
        itemId === 'key_med_chest' ||
        itemId === 'bsmnt_keys_to_med_chest' ||
        itemId === 'bsmnt_key_to_med_chest'
      );
    }

    // 9. Candado del arcón - ácido (bsmnt_02_trunk_closeup)
    if (hotspotId === 'hotspot_trunk_closeup_padlock') {
      if (saveState?.puzzleFlags?.trunk_padlock_dissolved || saveState?.puzzleFlags?.trunk_unlocked) return false;
      return itemId === 'acid' || itemId === 'bsmnt_acid';
    }

    // 10. Ranura del interruptor en cuadro de luces (bsmnt_01_light_box o bsmnt_01_light_box_open)
    if (hotspotId === 'hotspot_light_box_switch_slot') {
      if (saveState?.puzzleFlags?.switch_placed) return false;
      return itemId === 'switch' || itemId === 'bsmnt_switch' || itemId === 'interruptor';
    }

    // 11. Rueda de la silla de ruedas - llave inglesa (bsmnt_03_wheelchair)
    if (hotspotId === 'hotspot_wheelchair_wheel') {
      if (saveState?.puzzleFlags?.wheel_detached || saveState?.puzzleFlags?.wheelchair_wheel_removed) return false;
      return itemId === 'wrench' || itemId === 'bsmnt_wrench' || itemId === 'llave_inglesa';
    }

    // 12. Palé de madera - traspaleta (bsmnt_01_pale)
    if (hotspotId === 'hotspot_pale_pallet') {
      if (saveState?.puzzleFlags?.pallet_moved || saveState?.puzzleFlags?.pallet_has_truck) return false;
      return itemId === 'pallet_truck' || itemId === 'bsmnt_pallet_truck' || itemId === 'traspaleta';
    }

    // 13. Tablones de la puerta de vestuarios - palanca (bsmnt_03_door_to_locker_room)
    if (hotspotId === 'hotspot_door_to_locker_room_planks' || hotspotId === 'hotspot_locker_room_door') {
      const isPlanksRemoved = Boolean(saveState?.puzzleFlags?.planks_removed || saveState?.puzzleFlags?.door_planks_pried);
      if (isPlanksRemoved) return false;
      return (
        itemId === 'crowbar' ||
        itemId === 'bsmnt_crowbar' ||
        itemId === 'palanca' ||
        itemId === 'barra_de_unas' ||
        itemId === 'barra_de_uñas'
      );
    }

    // 14. Taquilla de vestuarios - llave (bsmnt_03_locker_closed)
    if (hotspotId === 'hotspot_bsmnt_03_locker_lock' || hotspotId === 'hotspot_bsmnt_03_locker_door') {
      if (saveState?.puzzleFlags?.locker_unlocked) return false;
      return (
        itemId === 'key_to_locker' ||
        itemId === 'bsmnt_key_to_locker' ||
        itemId === 'locker_key'
      );
    }

    // 15. Perchero - chaqueta (bsmnt_03_coat_stand)
    if (hotspotId === 'hotspot_coat_stand_jacket') {
      if (saveState?.puzzleFlags?.jacket_hung_on_stand) return false;
      return itemId === 'jacket' || itemId === 'bsmnt_jacket' || itemId === 'chaqueta';
    }

    // 16. Hueco de la tubería - tramo de tubería (bsmnt_01_pipes)
    if (hotspotId === 'hotspot_pipes_stage_pipe') {
      if (saveState?.puzzleFlags?.pipe_placed) return false;
      return itemId === 'pipe' || itemId === 'bsmnt_pipe' || itemId === 'tuberia' || itemId === 'pipe-handle';
    }

    // 17. Hornacina - placas de piedra (bsmnt_03_niche_closeup o niche_closeup)
    if (hotspotId === 'hotspot_niche_receptors' || hotspotId === 'overlay-niche-plates') {
      return itemId === 'plates' || itemId === 'bsmnt_plates';
    }

    return false;
  },

  /**
   * Determina si el punto (clientX, clientY) colisiona con el receptor interactivo correcto para itemId.
   * Devuelve el elemento receptor si es válido, o null si no hay colisión válida.
   */
  getValidItemDropTarget(itemId, clientX, clientY) {
    if (!itemId || typeof clientX !== 'number' || typeof clientY !== 'number') return null;

    const isWithin = (el, tolerance = 30) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      try {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
      } catch (err) {}
      return (
        clientX >= rect.left - tolerance &&
        clientX <= rect.right + tolerance &&
        clientY >= rect.top - tolerance &&
        clientY <= rect.bottom + tolerance
      );
    };

    // 1. Detección directa por punto bajo el cursor
    const hotspotAtPoint = this.getHotspotAtPoint(clientX, clientY);
    if (hotspotAtPoint && this.isItemAcceptedByHotspot(itemId, hotspotAtPoint.id)) {
      return hotspotAtPoint;
    }

    // 2. Colisión con tolerancia en hotspots/receptores de la escena activa

    // bsmnt_01_door_to_03: cerradura
    if (this.currentScene === 'bsmnt_01_door_to_03') {
      const el = document.getElementById('hotspot_door_03_interact');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_01_chest_close_up: tapa de la caja
    if (this.currentScene === 'bsmnt_01_chest_close_up') {
      const el = document.getElementById('hotspot_chest_lid_closed');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_01_painting: lámpara sobre el cuadro
    if (this.currentScene === 'bsmnt_01_painting') {
      const el = document.getElementById('hotspot_painting_lamp');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_01_light_box: panel de conexiones
    if (this.currentScene === 'bsmnt_01_light_box') {
      const el = document.getElementById('hotspot_light_box_panel');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_01_light_box o bsmnt_01_light_box_open: ranura del interruptor
    if (this.currentScene === 'bsmnt_01_light_box' || this.currentScene === 'bsmnt_01_light_box_open') {
      const el = document.getElementById('hotspot_light_box_switch_slot');
      if (el && isWithin(el, 25) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_02_padlock: candado de la arqueta
    if (this.currentScene === 'bsmnt_02_padlock') {
      const el = document.getElementById('hotspot_padlock');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_02_pallet_truck: traspaleta
    if (this.currentScene === 'bsmnt_02_pallet_truck') {
      const el = document.getElementById('hotspot_pallet_truck');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_02_desktop_closeup: cajón sin pomo
    if (this.currentScene === 'bsmnt_02_desktop_closeup') {
      const elNoHandle = document.getElementById('hotspot_desktop_drawer_no_handle');
      if (elNoHandle && isWithin(elNoHandle, 25) && this.isItemAcceptedByHotspot(itemId, elNoHandle.id)) return elNoHandle;
      const elTopDrawer = document.getElementById('hotspot_desktop_top_drawer');
      if (elTopDrawer && isWithin(elTopDrawer, 25) && this.isItemAcceptedByHotspot(itemId, elTopDrawer.id)) return elTopDrawer;
    }

    // bsmnt_01_med_chest_close_up: cerradura del botiquín
    if (this.currentScene === 'bsmnt_01_med_chest_close_up') {
      const el = document.getElementById('hotspot_med_chest_lock');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_02_trunk_closeup: candado del arcón
    if (this.currentScene === 'bsmnt_02_trunk_closeup') {
      const el = document.getElementById('hotspot_trunk_closeup_padlock');
      if (el && isWithin(el, 40) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_03_wheelchair: rueda de la silla de ruedas
    if (this.currentScene === 'bsmnt_03_wheelchair') {
      const el = document.getElementById('hotspot_wheelchair_wheel');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_01_pale: palé de madera
    if (this.currentScene === 'bsmnt_01_pale') {
      const el = document.getElementById('hotspot_pale_pallet');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_03_door_to_locker_room: tablones de la puerta
    if (this.currentScene === 'bsmnt_03_door_to_locker_room') {
      const elPlanks = document.getElementById('hotspot_door_to_locker_room_planks');
      if (elPlanks && isWithin(elPlanks, 30) && this.isItemAcceptedByHotspot(itemId, elPlanks.id)) return elPlanks;
      const elDoor = document.getElementById('hotspot_locker_room_door');
      if (elDoor && isWithin(elDoor, 30) && this.isItemAcceptedByHotspot(itemId, elDoor.id)) return elDoor;
    }

    // bsmnt_03_locker_closed: cerradura o puerta de la taquilla
    if (this.currentScene === 'bsmnt_03_locker_closed') {
      const elLock = document.getElementById('hotspot_bsmnt_03_locker_lock');
      if (elLock && isWithin(elLock, 40) && this.isItemAcceptedByHotspot(itemId, elLock.id)) return elLock;
      const elDoor = document.getElementById('hotspot_bsmnt_03_locker_door');
      if (elDoor && isWithin(elDoor, 20) && this.isItemAcceptedByHotspot(itemId, elDoor.id)) return elDoor;
    }

    // bsmnt_03_coat_stand: gancho / chaqueta en el perchero
    if (this.currentScene === 'bsmnt_03_coat_stand') {
      const el = document.getElementById('hotspot_coat_stand_jacket');
      if (el && isWithin(el, 30) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_01_pipes: hueco de la tubería
    if (this.currentScene === 'bsmnt_01_pipes') {
      const el = document.getElementById('hotspot_pipes_stage_pipe');
      if (el && isWithin(el, 40) && this.isItemAcceptedByHotspot(itemId, el.id)) return el;
    }

    // bsmnt_03_niche_closeup o niche_closeup: hornacina de las placas
    if (this.currentScene === 'bsmnt_03_niche_closeup' || this.currentScene === 'niche_closeup') {
      if (itemId === 'plates' || itemId === 'bsmnt_plates') {
        const el = document.getElementById('hotspot_niche_receptors') || document.getElementById('overlay-niche-plates') || document.body;
        return el;
      }
    }

    // 3. Comprobación general en cualquier otro hotspot activo
    const hotspots = document.querySelectorAll('.scene-hotspot, [id^="hotspot_"]');
    for (const h of hotspots) {
      if (this.isNavigationHotspot(h)) continue;
      if (this.isItemAcceptedByHotspot(itemId, h.id) && isWithin(h, 25)) {
        return h;
      }
    }

    return null;
  },

  /**
   * Comprueba si el objeto arrastrado del inventario está colisionando con el objetivo interactivo correcto.
   */
  isItemOverValidTarget(itemId, clientX, clientY) {
    return Boolean(this.getValidItemDropTarget(itemId, clientX, clientY));
  },

  /**
   * Procesa la suelta de un objeto en las coordenadas (clientX, clientY).
   */
  handleItemDropAt(itemId, clientX, clientY) {
    this.suppressHotspotClick(350);

    const target = this.getValidItemDropTarget(itemId, clientX, clientY);
    if (target) {
      if (this.currentScene === 'bsmnt_03_niche_closeup' || this.currentScene === 'niche_closeup') {
        if (itemId === 'plates' || itemId === 'bsmnt_plates') {
          this.handlePlatesDropOnNiche(itemId);
          return true;
        }
      }
      this.handleItemDrop(itemId, target);
      return true;
    }

    return false;
  },

  /**
   * Procesa la acción de soltar un objeto del inventario sobre un hotspot.
   */
  handleItemDrop(itemId, hotspotEl) {
    if (!itemId || !hotspotEl) return;
    const hotspotId = typeof hotspotEl === 'string' ? hotspotEl : hotspotEl.id;

    console.log(`[ItemDrop] Objeto: "${itemId}" soltado sobre hotspot: "${hotspotId}"`);

    // Si es un hotspot de navegación, no hacer nada (no navegar ni mostrar mensajes)
    if (this.isNavigationHotspot(hotspotEl)) {
      return;
    }

    // 1. Cerradura de la Puerta hacia Sala 3 en bsmnt_01_door_to_03
    if (hotspotId === 'hotspot_door_03_interact') {
      if (itemId === 'key_door_03' || itemId === 'llave_puerta_03') {
        this.unlockAndOpenDoorTo03();
      }
      return;
    }

    // 2. Tapa de la caja de madera en bsmnt_01_chest_close_up (abrir con martillo)
    if (hotspotId === 'hotspot_chest_lid_closed') {
      const saveState = Storage.getSaveGame();
      const isOpen = Boolean(saveState?.puzzleFlags?.chest_open || saveState?.puzzleFlags?.med_chest_box_open);
      if (isOpen) {
        this.navigateTo('bsmnt_01_chest_close_up_open');
        return;
      }
      if (itemId === 'hammer' || itemId === 'bsmnt_hammer' || itemId === 'martillo') {
        this.openChestInCloseup();
      }
      return;
    }

    // 3. Lámpara sobre el cuadro en bsmnt_01_painting (colocar bombilla)
    if (hotspotId === 'hotspot_painting_lamp') {
      const saveState = Storage.getSaveGame();
      const isUVActive = Boolean(saveState?.puzzleFlags?.bulb_in_painting_lamp || saveState?.puzzleFlags?.painting_uv_active);
      if (isUVActive) {
        return;
      }
      if (itemId === 'bulb' || itemId === 'bsmnt_bulb' || itemId === 'bombilla') {
        this.placeBulbInLamp();
      }
      return;
    }

    // 4. Panel de conexiones en bsmnt_01_light_box (conectar cables)
    if (hotspotId === 'hotspot_light_box_panel') {
      if (itemId === 'wires' || itemId === 'bsmnt_wires' || itemId === 'cables') {
        this.placeWiresOnLightBoxPanel();
      }
      return;
    }

    // 5. Candado en bsmnt_02_padlock (abrir con llave del candado)
    if (hotspotId === 'hotspot_padlock') {
      if (itemId === 'key_padlock' || itemId === 'bsmnt_key_to_padlock') {
        this.unlockPadlock();
      }
      return;
    }

    // 6. Traspaleta en bsmnt_02_pallet_truck (colocar rueda)
    if (hotspotId === 'hotspot_pallet_truck') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.pallet_truck_repaired) {
        return;
      }
      if (itemId === 'wheel' || itemId === 'bsmnt_wheel' || itemId === 'rueda') {
        this.repairPalletTruck();
      }
      return;
    }

    // 7. Cajón superior del escritorio en bsmnt_02_desktop_closeup (colocar pomo)
    if (hotspotId === 'hotspot_desktop_drawer_no_handle' || hotspotId === 'hotspot_desktop_top_drawer') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.drawer_handle_placed) {
        return;
      }
      if (itemId === 'handle' || itemId === 'bsmnt_handle' || itemId === 'pomo') {
        this.attachDrawerHandle();
      }
      return;
    }

    // 8. Cerradura del botiquín en bsmnt_01_med_chest_close_up (abrir con llave del botiquín)
    if (hotspotId === 'hotspot_med_chest_lock') {
      if (
        itemId === 'keys_med_chest' ||
        itemId === 'key_med_chest' ||
        itemId === 'bsmnt_keys_to_med_chest' ||
        itemId === 'bsmnt_key_to_med_chest'
      ) {
        this.unlockMedChest();
      }
      return;
    }

    // 9. Candado del arcón en bsmnt_02_trunk_closeup (verter ácido)
    if (hotspotId === 'hotspot_trunk_closeup_padlock') {
      if (itemId === 'acid' || itemId === 'bsmnt_acid') {
        this.dissolveTrunkPadlockWithAcid();
      }
      return;
    }

    // 10. Ranura del interruptor en cuadro de luces abierto (bsmnt_01_light_box_open)
    if (hotspotId === 'hotspot_light_box_switch_slot') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.switch_placed) {
        return;
      }
      if (itemId === 'switch' || itemId === 'bsmnt_switch' || itemId === 'interruptor') {
        this.placeSwitchInLightBox();
      }
      return;
    }

    // 11. Rueda de la silla de ruedas en bsmnt_03_wheelchair (desmontar con llave inglesa)
    if (hotspotId === 'hotspot_wheelchair_wheel') {
      if (itemId === 'wrench' || itemId === 'bsmnt_wrench' || itemId === 'llave_inglesa') {
        this.detachWheelchairWheel();
      }
      return;
    }

    // 12. Palé en bsmnt_01_pale (insertar traspaleta)
    if (hotspotId === 'hotspot_pale_pallet') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.pallet_moved || saveState?.puzzleFlags?.pallet_has_truck) {
        return;
      }
      if (itemId === 'pallet_truck' || itemId === 'bsmnt_pallet_truck' || itemId === 'traspaleta') {
        this.insertPalletTruckIntoPallet();
      }
      return;
    }

    // 13. Tablones de la puerta en bsmnt_03_door_to_locker_room (arrancar con palanca)
    if (
      hotspotId === 'hotspot_door_to_locker_room_planks' ||
      hotspotId === 'hotspot_locker_room_door'
    ) {
      const saveState = Storage.getSaveGame();
      const isPlanksRemoved = Boolean(saveState?.puzzleFlags?.planks_removed || saveState?.puzzleFlags?.door_planks_pried);
      if (isPlanksRemoved) {
        return;
      }
      if (
        itemId === 'crowbar' ||
        itemId === 'bsmnt_crowbar' ||
        itemId === 'palanca' ||
        itemId === 'barra_de_unas' ||
        itemId === 'barra_de_uñas'
      ) {
        this.pryDoorPlanks();
      }
      return;
    }

    // 14. Cerradura de la taquilla en bsmnt_03_locker_closed (abrir con llave de taquilla)
    if (hotspotId === 'hotspot_bsmnt_03_locker_lock' || hotspotId === 'hotspot_bsmnt_03_locker_door') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.locker_unlocked) {
        this.navigateTo('bsmnt_03_locker_open');
        return;
      }
      if (
        itemId === 'key_to_locker' ||
        itemId === 'bsmnt_key_to_locker' ||
        itemId === 'locker_key'
      ) {
        this.unlockLockerWithKey();
      }
      return;
    }

    // 15. Perchero en bsmnt_03_coat_stand (colgar chaqueta)
    if (hotspotId === 'hotspot_coat_stand_jacket') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.jacket_hung_on_stand) {
        return;
      }
      if (itemId === 'jacket' || itemId === 'bsmnt_jacket' || itemId === 'chaqueta') {
        this.hangJacketOnCoatStand();
      }
      return;
    }

    // 16. Hueco de la tubería en bsmnt_01_pipes (acoplar tramo de tubería)
    if (hotspotId === 'hotspot_pipes_stage_pipe') {
      const saveState = Storage.getSaveGame();
      if (saveState?.puzzleFlags?.pipe_placed) {
        return;
      }
      if (itemId === 'pipe' || itemId === 'bsmnt_pipe' || itemId === 'tuberia' || itemId === 'pipe-handle') {
        this.placePipeInPipesScene();
      }
      return;
    }

    // 17. Hornacina en bsmnt_03_niche_closeup (colocar placas)
    if (
      hotspotId === 'hotspot_niche_receptors' ||
      hotspotId === 'overlay-niche-plates'
    ) {
      if (itemId === 'plates' || itemId === 'bsmnt_plates') {
        this.handlePlatesDropOnNiche(itemId);
      }
      return;
    }

    // Si no colisiona contra el overlay interactivo correcto, no hace nada; el objeto vuelve al inventario.
    return;
  },

  /**
   * Tono y chasquido de cerradura metálica al girar la llave (assets/audio/sfx/lock.mp3).
   */
  playDoorUnlockSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/lock.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/lock.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // 1. Giro de llave (fricción metálica)
      const osc1 = this._audioCtx.createOscillator();
      const gain1 = this._audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.14);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(this._audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // 2. Resorte del cerrojo (chasquido metálico)
      const osc2 = this._audioCtx.createOscillator();
      const gain2 = this._audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(680, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.28);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(this._audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.32);

      // 3. Golpe sordo de madera / pestillo liberado
      const osc3 = this._audioCtx.createOscillator();
      const gain3 = this._audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(140, now + 0.22);
      osc3.frequency.exponentialRampToValueAtTime(50, now + 0.42);
      gain3.gain.setValueAtTime(0.28, now + 0.22);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc3.connect(gain3);
      gain3.connect(this._audioCtx.destination);
      osc3.start(now + 0.22);
      osc3.stop(now + 0.45);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Sonido al saltar/desclavarse un clavo (assets/audio/sfx/nail_creaks.mp3).
   */
  playNailCreakSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/nail_creaks.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/nail_creaks.mp3');
        return;
      }
    } catch (e) {}
  },

  /**
   * Sonido sintético de crujido de madera y extracción forzada de clavos con martillo (Web Audio API).
   */
  playWoodPrySound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // 1. Apalancamiento inicial de metal contra clavo (fricción y chirrido)
      const osc1 = this._audioCtx.createOscillator();
      const gain1 = this._audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(540, now + 0.18);
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(this._audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.24);

      // 2. Crujido y chasquido de la madera al ceder
      const osc2 = this._audioCtx.createOscillator();
      const gain2 = this._audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(160, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.4);
      gain2.gain.setValueAtTime(0.01, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(this._audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.46);

      // 3. Golpe sordo y liberación de la tapa de madera
      const osc3 = this._audioCtx.createOscillator();
      const gain3 = this._audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(110, now + 0.28);
      osc3.frequency.exponentialRampToValueAtTime(45, now + 0.55);
      gain3.gain.setValueAtTime(0.3, now + 0.28);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(this._audioCtx.destination);
      osc3.start(now + 0.28);
      osc3.stop(now + 0.62);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Sonido suave de roce de tela y percha de madera al colgar la chaqueta (Web Audio API).
   */
  playClothRustleSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // Ráfaga de ruido filtrado simulando el tejido de la chaqueta
      const bufferSize = Math.floor(this._audioCtx.sampleRate * 0.25);
      const buffer = this._audioCtx.createBuffer(1, bufferSize, this._audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = this._audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this._audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.24);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this._audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this._audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.25);

      // Leve roce / golpe sordo de la percha de madera
      const osc = this._audioCtx.createOscillator();
      const oscGain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      oscGain.gain.setValueAtTime(0.01, now + 0.05);
      oscGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(oscGain);
      oscGain.connect(this._audioCtx.destination);
      osc.start(now + 0.05);
      osc.stop(now + 0.22);
    } catch (e) {
      // Audio no disponible
    }
  },

  /**
   * Comprueba si el jugador posee la llave de la puerta en inventario o flags de guardado.
   */
  hasDoor03Key() {
    const saveState = Storage.getSaveGame();
    if (!saveState) return false;

    // 1. Flags de puzzle
    if (saveState.puzzleFlags?.has_key_door_03 || saveState.puzzleFlags?.door_03_unlocked) {
      return true;
    }

    // 2. Objetos en inventario
    const items = Array.isArray(saveState.inventory) ? saveState.inventory : [];
    return items.some(item =>
      item.id === 'key_door_03' ||
      item.id === 'llave_puerta_03' ||
      item.id === 'key_basement' ||
      item.id === 'llave' ||
      (item.name && item.name.toLowerCase().includes('llave'))
    );
  },

  /**
   * Muestra un mensaje o subtítulo narrativo en la parte inferior de la pantalla.
   */
  showMessage(textKeyOrLiteral, duration = 3500) {
    if (!this.messageBar || !this.messageText) {
      this.messageBar = document.getElementById('game-message-bar');
      this.messageText = document.getElementById('game-message-text');
    }
    if (!this.messageBar || !this.messageText) return;

    this.messageText.textContent = t(textKeyOrLiteral, textKeyOrLiteral);
    this.messageBar.classList.add('visible');

    clearTimeout(this._messageTimer);
    this._messageTimer = setTimeout(() => {
      this.hideMessage();
    }, duration);
  },

  /**
   * Oculta el mensaje/subtítulo inferior.
   */
  hideMessage() {
    if (this.messageBar) {
      this.messageBar.classList.remove('visible');
    }
    clearTimeout(this._messageTimer);
  },

  /**
   * Muestra el overlay de las placas insertadas en la hornacina en bsmnt_03_niche_closeup.
   * Coordenadas exactas: X=778px, Y=445px, W=819px, H=497px (sobre base 1920x1080).
   * @param {boolean} animateFadeIn - Si debe animar la aparición suavemente.
   * @returns {HTMLElement}
   */
  showNichePlatesOverlay(animateFadeIn = true) {
    let el = document.getElementById('overlay-niche-plates');
    if (!el) {
      el = document.createElement('div');
      el.id = 'overlay-niche-plates';
      el.className = 'scene-hotspot niche-plates-overlay';
      el.dataset.pixelX = '778';
      el.dataset.pixelY = '445';
      el.dataset.pixelW = '819';
      el.dataset.pixelH = '497';
      el.style.position = 'absolute';
      el.style.left = '40.5208%';
      el.style.top = '41.2037%';
      el.style.width = '42.6563%';
      el.style.height = '46.0185%';
      el.style.backgroundImage = "url('assets/levels/level_01_bsmnt/puzzles/niche_plates/niche_plates.webp')";
      el.style.backgroundSize = '100% 100%';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '20';
      if (this.sceneOverlays) {
        this.sceneOverlays.appendChild(el);
      }
    }
    if (animateFadeIn) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.22s ease-out';
      el.offsetHeight; // forzar reflujo
      el.style.opacity = '1';
    } else {
      el.style.opacity = '1';
      el.style.transition = 'none';
    }
    return el;
  },

  /**
   * Desvanece el overlay de las placas en la hornacina y lo elimina tras el fade.
   * @param {number} delayMs - Tiempo de espera antes de iniciar el fade out (medio segundo = 500ms).
   * @param {number} fadeDurationMs - Duración del fundido a transparente.
   * @param {Function} onComplete - Callback ejecutado al terminar la animación y retiro del elemento.
   */
  fadeAndRemoveNichePlatesOverlay(delayMs = 500, fadeDurationMs = 400, onComplete = null) {
    const el = document.getElementById('overlay-niche-plates');
    if (!el) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    setTimeout(() => {
      el.style.transition = `opacity ${fadeDurationMs}ms ease-in`;
      el.style.opacity = '0';
      setTimeout(() => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
        if (typeof onComplete === 'function') onComplete();
      }, fadeDurationMs);
    }, delayMs);
  },

  /**
   * Maneja la acción de soltar o usar las placas de metal sobre la hornacina en bsmnt_03_niche_closeup.
   * - Muestra el overlay niche_plates en X=778px, Y=445px.
   * - Si están mal ordenadas: espera 500ms, hace fade out y devuelve el ítem al inventario.
   * - Si están bien ordenadas: deja el overlay colocado y reproduce el vídeo cinemático final_door.mp4.
   */
  handlePlatesDropOnNiche(itemId = 'plates') {
    if (this._isHandlingPlatesDrop) return;
    this._isHandlingPlatesDrop = true;

    const manager = window.InventoryManager || InventoryManager;
    const saveState = Storage.getSaveGame() || Storage.createNewGame();
    if (saveState?.puzzleFlags?.niche_plates_placed) {
      this._isHandlingPlatesDrop = false;
      this.showMessage('Las placas ya están encajadas en la hornacina.');
      return;
    }

    // 1. Obtener la información del ítem antes de retirarlo temporalmente
    const currentItem = manager?.getItemById(itemId) || {
      id: itemId || 'plates',
      name: 'Placas de bronce',
      icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
      closeup: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
      interactiveCloseup: 'plates_grid'
    };

    // 2. Retirar el ítem del inventario para simular que ha sido insertado
    if (manager) {
      manager.removeItem(itemId, false);
      if (itemId !== 'plates') manager.removeItem('plates', false);
      if (itemId !== 'bsmnt_plates') manager.removeItem('bsmnt_plates', false);
      manager.selectItem(null);
    }

    // 3. Mostrar el overlay de las placas en la hornacina en 778px 445px
    this.showNichePlatesOverlay(true);
    this.playPlateInsertSound();

    // 4. Comprobar si las placas están bien o mal ordenadas
    const isSolved = Boolean(manager?.isPlatesPuzzleSolved && manager.isPlatesPuzzleSolved());

    if (!isSolved) {
      // Rama: Mal ordenadas
      // Esperar medio segundo (500ms), hacer fade out y devolver el ítem al inventario
      this.playPlateRejectSound();
      setTimeout(() => {
        this.fadeAndRemoveNichePlatesOverlay(0, 450, () => {
          if (manager) {
            manager.addItem(currentItem, true);
          }
          this._isHandlingPlatesDrop = false;
          this.showMessage('Las placas no encajan en esa posición. El mecanismo las ha rechazado.');
        });
      }, 500);
    } else {
      // Rama: Bien ordenadas
      // Registrar estado resuelto permanentemente
      const freshState = Storage.getSaveGame() || Storage.createNewGame();
      if (!freshState.puzzleFlags) freshState.puzzleFlags = {};
      freshState.puzzleFlags.niche_plates_placed = true;
      freshState.puzzleFlags.final_door_open = true;
      freshState.updatedAt = new Date().toISOString();
      Storage.setSaveGame(freshState);

      this._isHandlingPlatesDrop = false;

      // Reproducir vídeo final_door.mp4 y mostrar la pantalla de fin de nivel
      setTimeout(() => {
        this.playCinematicVideo('assets/levels/level_01_bsmnt/video/final_door.mp4', () => {
          console.log('Cinemática final_door finalizada. Mostrando pantalla de fin de nivel.');
          FinalScreenManager.show();
        });
      }, 350);
    }
  },

  /**
   * Reproduce un vídeo cinemático a pantalla completa en la ventana modal dedicada.
   * Gestiona el audio de fondo, controles de escape / salto y callback de finalización.
   */
  playCinematicVideo(src, onEndedCallback = null) {
    const modal = document.getElementById('modal-cinematic-video');
    const player = document.getElementById('cinematic-video-player');
    const btnSkip = document.getElementById('btn-skip-cinematic');
    if (!modal || !player) {
      console.warn('Modal de vídeo cinemático no encontrado en el DOM.');
      if (typeof onEndedCallback === 'function') onEndedCallback();
      return;
    }

    // Mantener la música de fondo sonando continuamente durante la cinemática
    const wasAmbiencePlaying = Boolean(window.AudioController?.ambienceAudio && !window.AudioController.ambienceAudio.paused);
    if (window.AudioController) {
      window.AudioController.pauseAmbience();
    }

    // 2. Activar modal manteniendo el vídeo opaco/negro hasta que comience la reproducción real
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    player.classList.remove('is-playing');
    player.style.opacity = '0';
    player.src = src;
    player.currentTime = 0;
    player.volume = 1.0;

    const onPlaying = () => {
      player.classList.add('is-playing');
      player.style.opacity = '1';
      if (src && src.includes('final_door')) {
        this.playCreakingDoorSound();
      }
    };
    player.addEventListener('playing', onPlaying, { once: true });

    const fadeCurtain = document.getElementById('cinematic-fade-curtain');
    if (fadeCurtain) {
      fadeCurtain.classList.remove('fade-active');
    }

    let isFadingOut = false;
    let fadeTimer = null;
    const onTimeUpdate = () => {
      if (isFadingOut || !player.duration || isNaN(player.duration)) return;
      const timeLeft = player.duration - player.currentTime;
      // Iniciar el fundido a negro progresivo 1.8 segundos antes del final del vídeo
      if (timeLeft <= 1.8 && timeLeft > 0) {
        isFadingOut = true;
        if (fadeCurtain) {
          fadeCurtain.classList.add('fade-active');
        }
        // Una vez que la pantalla esté totalmente negra (1.2s de animación + 500ms de oscuridad),
        // completamos la cinemática
        fadeTimer = setTimeout(() => {
          cleanup();
        }, 1700);
      }
    };

    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      if (fadeTimer) {
        clearTimeout(fadeTimer);
        fadeTimer = null;
      }

      window.removeEventListener('keydown', onKeyDown);
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('ended', onEnded);
      player.removeEventListener('error', onError);
      player.removeEventListener('playing', onPlaying);
      if (btnSkip) btnSkip.removeEventListener('click', onSkip);

      try {
        player.pause();
        player.removeAttribute('src');
        player.load();
        player.classList.remove('is-playing');
        player.style.opacity = '0';
      } catch (e) {}

      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        modal.style.display = 'none';
        if (fadeCurtain) fadeCurtain.classList.remove('fade-active');
      }, 350);

      // Reanudar ambiente si estaba activo
      if (wasAmbiencePlaying && window.AudioController) {
        window.AudioController.resumeAmbience();
      }

      if (typeof onEndedCallback === 'function') {
        onEndedCallback();
      }
    };

    const onEnded = () => cleanup();
    const onError = (e) => {
      console.error('Error al reproducir vídeo cinemático:', e);
      cleanup();
    };
    const onSkip = (e) => {
      e?.stopPropagation();
      cleanup();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        cleanup();
      }
    };

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('ended', onEnded);
    player.addEventListener('error', onError);
    window.addEventListener('keydown', onKeyDown);
    if (btnSkip) {
      btnSkip.style.display = '';
      btnSkip.addEventListener('click', onSkip);
    }

    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay bloqueado con audio, intentando con mute:', err);
        player.muted = true;
        player.play().catch((e) => {
          console.error('No se pudo reproducir el vídeo:', e);
          cleanup();
        });
      });
    }
  },

  /**
   * Efecto de sonido: inserción eléctrica/metálica de las placas en la hornacina (assets/audio/sfx/electric.mp3).
   */
  playPlateInsertSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/electric.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/electric.mp3');
        return;
      }
    } catch (e) {}

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      // Fricción metálica
      const bufferSize = this._audioCtx.sampleRate * 0.12;
      const noiseBuffer = this._audioCtx.createBuffer(1, bufferSize, this._audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = this._audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this._audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.0, now);

      const noiseGain = this._audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this._audioCtx.destination);
      noise.start(now);

      // Impacto metálico
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.22, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now + 0.08);
      osc.stop(now + 0.28);
    } catch (e) {}
  },

  /**
   * Efecto de sonido: resorte de rechazo mecánico cuando las placas no coinciden (assets/audio/sfx/reject.mp3).
   */
  playPlateRejectSound() {
    try {
      if (typeof AudioController !== 'undefined' && AudioController.playSfx) {
        AudioController.playSfx('assets/audio/sfx/reject.mp3');
        return;
      }
      if (window.AudioController && window.AudioController.playSfx) {
        window.AudioController.playSfx('assets/audio/sfx/reject.mp3');
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
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

      const filter = this._audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  },

  /**
   * Exposición de helpers en window.gameDebug para testear cómodamente estados desde la consola.
   */
  initDebugHelpers() {
    window.gameDebug = {
      giveKey: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.has_key_door_03 = true;
        Storage.setSaveGame(saveState);
        const msg = '🔑 Llave otorgada con éxito (has_key_door_03 = true)';
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      removeKey: () => {
        const saveState = Storage.getSaveGame();
        if (saveState && saveState.puzzleFlags) {
          delete saveState.puzzleFlags.has_key_door_03;
          delete saveState.puzzleFlags.key_door_03_picked;
          delete saveState.puzzleFlags.door_03_unlocked;
          if (Array.isArray(saveState.inventory)) {
            saveState.inventory = saveState.inventory.filter(i => !i.id.includes('key') && !i.id.includes('llave'));
          }
          Storage.setSaveGame(saveState);
        }
        const msg = '🔒 Llave retirada (has_key_door_03 = false)';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      setLight: (state) => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        const boolState = Boolean(state);
        saveState.puzzleFlags.light_on = boolState;
        saveState.puzzleFlags.luz_encendida = boolState;
        Storage.setSaveGame(saveState);
        const msg = `💡 Luz del sótano establecida a: ${boolState ? 'ENCENDIDA (true)' : 'APAGADA (false)'}`;
        console.log(`%c${msg}`, 'color: #e6b800; font-weight: bold;');
        return msg;
      },
      setDoorUnlocked: (state = true) => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        const boolState = Boolean(state);
        saveState.puzzleFlags.door_03_unlocked = boolState;
        Storage.setSaveGame(saveState);
        const msg = `🚪 Puerta Sala 3: ${boolState ? 'DESBLOQUEADA (door_03_unlocked = true)' : 'BLOQUEADA (door_03_unlocked = false)'}`;
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      setTrunkOpen: (state = true) => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        const boolState = Boolean(state);
        saveState.puzzleFlags.trunk_open = boolState;
        saveState.puzzleFlags.baul_abierto = boolState;
        Storage.setSaveGame(saveState);
        const msg = `📦 Baúl: ${boolState ? 'ABIERTO (trunk_open = true)' : 'CERRADO (trunk_open = false)'}`;
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      showHotspots: (enable = true) => {
        window._debugShowHotspots = enable;
        document.querySelectorAll('.scene-hotspot').forEach(el => {
          el.style.border = enable ? '2px dashed #00ff00' : 'none';
          el.style.backgroundColor = enable ? 'rgba(0, 255, 0, 0.18)' : 'transparent';
        });
        const msg = `🔍 Visualización de hotspots: ${enable ? 'ACTIVADA' : 'DESACTIVADA'}`;
        console.log(`%c${msg}`, 'color: #00ff00; font-weight: bold;');
        return msg;
      },
      solveTrunkPuzzle: () => {
        return window.TrunkPuzzle ? window.TrunkPuzzle.solveDirectly() : 'Módulo de puzzle no disponible.';
      },
      resetTrunkPuzzle: () => {
        const saveState = Storage.getSaveGame();
        if (saveState && saveState.puzzleFlags) {
          delete saveState.puzzleFlags.baul_resuelto;
          delete saveState.puzzleFlags.trunk_open;
          delete saveState.puzzleFlags.baul_abierto;
          delete saveState.puzzleFlags.hammer_picked;
          delete saveState.puzzleFlags.key_door_03_picked;
          delete saveState.puzzleFlags.has_key_door_03;
          delete saveState.puzzleFlags.trunk_puzzle_state;
          if (Array.isArray(saveState.inventory)) {
            saveState.inventory = saveState.inventory.filter(i => i.id !== 'key_door_03' && i.id !== 'hammer');
          }
          if (Array.isArray(saveState.diary)) {
            saveState.diary = saveState.diary.filter(d => d.id !== 'photo_julian_ship');
          }
          Storage.setSaveGame(saveState);
        }
        if (window.TrunkPuzzle) {
          window.TrunkPuzzle.isSolved = false;
        }
        if (window.InventoryManager) {
          window.InventoryManager.render();
        }
        if (window.DiaryManager) {
          window.DiaryManager.render();
        }
        const msg = '🔄 Puzzle del baúl reseteado a estado inicial cerrado.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      giveBulb: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.bulb_picked = true;
        saveState.puzzleFlags.has_bulb = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'bulb')) {
          saveState.inventory.push({
            id: 'bulb',
            name: 'Bombilla',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_bulb.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_bulb.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '💡 Bombilla añadida al inventario.';
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      resetPainting: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.bulb_in_painting_lamp;
          delete s.puzzleFlags.painting_uv_active;
          delete s.puzzleFlags.bulb_used;
          if (s.puzzleFlags.bulb_picked || s.puzzleFlags.has_bulb) {
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
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.loadScene(s?.level || 'level_01_bsmnt', 'bsmnt_01_painting');
        const msg = '🔄 Cuadro reseteado a estado apagado (bombilla restaurada).';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      solveCryptex: () => {
        if (window.solveCryptex) return window.solveCryptex();
      },
      resetCryptex: () => {
        if (window.resetCryptex) return window.resetCryptex();
      },
      giveWires: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.wires_picked = true;
        saveState.puzzleFlags.has_wires = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'wires')) {
          saveState.inventory.push({
            id: 'wires',
            name: 'Cables',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_wires.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_wires.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '🔌 Cables añadidos al inventario.';
        console.log(`%c${msg}`, 'color: #3b82f6; font-weight: bold;');
        return msg;
      },
      solveLightBox: () => {
        if (window.solveLightBox) return window.solveLightBox();
      },
      resetLightBox: () => {
        if (window.resetLightBox) return window.resetLightBox();
      },
      solveMedChest: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.med_chest_unlocked = true;
        s.puzzleFlags.med_chest_open = true;
        s.puzzleFlags.med_chest_colors_inspected = true;
        Storage.setSaveGame(s);
        const doc = GAME_DOCUMENTS['doc_bsmnt_chest_colors'];
        if (doc && window.DiaryManager) {
          window.DiaryManager.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }
        if (window.SceneManager) window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_01_med_chest_close_up_open');
        const msg = '🏥 Botiquín abierto con éxito y pista añadida al diario.';
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      giveChestColorsClue: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.med_chest_colors_inspected = true;
        Storage.setSaveGame(s);
        const doc = GAME_DOCUMENTS['doc_bsmnt_chest_colors'];
        if (doc && window.DiaryManager) {
          window.DiaryManager.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }
        if (window.DiaryManager) window.DiaryManager.render();
        const msg = '📖 Pista de frascos del botiquín añadida al diario.';
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      giveChipsClue: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.barrel_chips_inspected = true;
        s.puzzleFlags.chips_inspected = true;
        Storage.setSaveGame(s);
        const doc = GAME_DOCUMENTS['doc_bsmnt_chips'];
        if (doc && window.DiaryManager) {
          window.DiaryManager.addEntry({
            id: doc.id,
            title: doc.title,
            badge: doc.badge,
            image: doc.image,
            imageCaption: doc.imageCaption,
            date: doc.date,
            text: doc.text,
            isJournal: true
          });
        }
        if (window.DiaryManager) window.DiaryManager.render();
        const msg = '🎰 Pista de fichas del barril añadida al diario.';
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      resetChipsClue: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.barrel_chips_inspected;
          delete s.puzzleFlags.chips_inspected;
          if (Array.isArray(s.diary)) {
            s.diary = s.diary.filter(d => d.id !== 'doc_bsmnt_chips' && d.id !== 'bsmnt_chips');
          }
          Storage.setSaveGame(s);
        }
        if (window.DiaryManager) window.DiaryManager.render();
        const msg = '🔄 Pista de fichas reseteada.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      resetMedChest: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.med_chest_unlocked;
          delete s.puzzleFlags.med_chest_open;
          delete s.puzzleFlags.keys_med_chest_used;
          delete s.puzzleFlags.med_chest_colors_inspected;
          if (Array.isArray(s.diary)) {
            s.diary = s.diary.filter(d => d.id !== 'doc_bsmnt_chest_colors');
          }
          Storage.setSaveGame(s);
        }
        if (window.DiaryManager) window.DiaryManager.render();
        if (window.SceneManager) window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_01_med_chest_close_up');
        const msg = '🔄 Botiquín reseteado a cerrado.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      giveAcid: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.acid_picked = true;
        saveState.puzzleFlags.has_acid = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'acid')) {
          saveState.inventory.push({
            id: 'acid',
            name: 'Frasco de ácido',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_acid.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_acid.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '🧪 Frasco de ácido añadido al inventario.';
        console.log(`%c${msg}`, 'color: #10b981; font-weight: bold;');
        return msg;
      },
      resetAcid: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.acid_picked;
          delete s.puzzleFlags.has_acid;
          if (Array.isArray(s.inventory)) {
            s.inventory = s.inventory.filter(i => i.id !== 'acid' && i.id !== 'bsmnt_acid');
          }
          Storage.setSaveGame(s);
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_01_med_chest_close_up_open');
        const msg = '🔄 Frasco de ácido restaurado en el botiquín.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      solveTrunkAcid: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.trunk_acid_used = true;
        s.puzzleFlags.trunk_02_open = true;
        Storage.setSaveGame(s);
        if (window.SceneManager) window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_02_trunk_closeup_open');
        const msg = '🧪 Arcón corroído y abierto con ácido.';
        console.log(`%c${msg}`, 'color: #10b981; font-weight: bold;');
        return msg;
      },
      playAcidAnimation: () => {
        SceneManager.playAcidCorrosionAnimation(() => {
          console.log('Animación de borboteo de ácido finalizada.');
        });
        SceneManager.playAcidSizzleSound();
        const msg = '🧪 Animación de borboteo de ácido iniciada.';
        console.log(`%c${msg}`, 'color: #bef264; font-weight: bold;');
        return msg;
      },
      resetTrunkAcid: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.trunk_acid_used;
          delete s.puzzleFlags.trunk_02_open;
          Storage.setSaveGame(s);
        }
        if (window.SceneManager) window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_02_trunk_closeup');
        const msg = '🔄 Arcón reseteado a cerrado con candado.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      giveSwitch: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.switch_picked = true;
        saveState.puzzleFlags.has_switch = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'switch')) {
          saveState.inventory.push({
            id: 'switch',
            name: 'Interruptor',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_switch.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_switch.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '⚡ Interruptor añadido al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetSwitch: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.switch_picked;
          delete s.puzzleFlags.has_switch;
          if (Array.isArray(s.inventory)) {
            s.inventory = s.inventory.filter(i => i.id !== 'switch' && i.id !== 'bsmnt_switch');
          }
          Storage.setSaveGame(s);
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_02_trunk_closeup_open');
        const msg = '🔄 Interruptor restaurado en el arcón.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      placeSwitch: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.switch_placed = true;
        s.puzzleFlags.switch_on = false;
        Storage.setSaveGame(s);
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '⚡ Interruptor colocado en el carril (OFF).';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      toggleSwitch: (forceState) => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.switch_placed = true;
        const newState = forceState !== undefined ? Boolean(forceState) : !s.puzzleFlags.switch_on;
        s.puzzleFlags.switch_on = newState;
        s.puzzleFlags.light_on = newState;
        s.puzzleFlags.luz_encendida = newState;
        Storage.setSaveGame(s);
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = `⚡ Interruptor: ${newState ? 'ON (Luz encendida)' : 'OFF'}`;
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetLightBoxSwitch: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.switch_placed;
          delete s.puzzleFlags.switch_on;
          delete s.puzzleFlags.light_on;
          delete s.puzzleFlags.luz_encendida;
          Storage.setSaveGame(s);
        }
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Interruptor desinstalado del cuadro de luces.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      showCards: () => {
        if (window.SceneManager) window.SceneManager.handleExamineCards();
        const msg = '🃏 Mostrando baraja de naipes y añadiendo al diario.';
        console.log(`%c${msg}`, 'color: #d4af37; font-weight: bold;');
        return msg;
      },
      resetCards: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.cards_inspected;
          if (Array.isArray(s.diary)) {
            s.diary = s.diary.filter(d => d.id !== 'doc_bsmnt_cards');
          }
          Storage.setSaveGame(s);
        }
        if (window.DiaryManager) window.DiaryManager.render();
        const msg = '🔄 Naipes reseteados (retirados del diario y flag eliminada).';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      giveCrowbar: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.crowbar_picked = true;
        saveState.puzzleFlags.has_crowbar = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'crowbar' || i.id === 'bsmnt_crowbar' || i.id === 'palanca')) {
          saveState.inventory.push({
            id: 'crowbar',
            name: 'Palanca',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_crowbar.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_crowbar.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔨 Palanca añadida al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetCrowbar: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.crowbar_picked;
          delete s.puzzleFlags.has_crowbar;
          if (Array.isArray(s.inventory)) {
            s.inventory = s.inventory.filter(i => i.id !== 'crowbar' && i.id !== 'bsmnt_crowbar' && i.id !== 'palanca');
          }
          Storage.setSaveGame(s);
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Palanca restaurada en bsmnt_01_pale.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      givePalletTruck: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.pallet_truck_repaired = true;
        saveState.puzzleFlags.pallet_truck_picked = true;
        saveState.puzzleFlags.has_pallet_truck = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'pallet_truck' || i.id === 'bsmnt_pallet_truck' || i.id === 'traspaleta')) {
          saveState.inventory.push({
            id: 'pallet_truck',
            name: 'Traspaleta',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_pallet_truck.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_pallet_truck.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '🚜 Traspaleta añadida al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetPallet: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.pallet_has_truck;
          delete s.puzzleFlags.pallet_truck_used;
          delete s.puzzleFlags.pallet_moved;
          Storage.setSaveGame(s);
        }
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Palé reseteado a su posición inicial.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      pryDoorPlanks: () => {
        if (window.SceneManager) window.SceneManager.pryDoorPlanks();
        const msg = '🔨 Tablones arrancados de la puerta.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetDoorPlanks: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.door_planks_pried;
          delete s.puzzleFlags.planks_removed;
          Storage.setSaveGame(s);
        }
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Tablones restaurados en la puerta.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      giveJacket: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.jacket_picked = true;
        saveState.puzzleFlags.has_jacket = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'jacket' || i.id === 'bsmnt_jacket' || i.id === 'chaqueta')) {
          saveState.inventory.push({
            id: 'jacket',
            name: 'Chaqueta',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_jacket.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_jacket.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '🧥 Chaqueta añadida al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      hangJacket: () => {
        if (window.SceneManager) window.SceneManager.hangJacketOnCoatStand();
        const msg = '🧥 Chaqueta colgada en el perchero.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetCoatStandJacket: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.jacket_hung_on_stand;
          Storage.setSaveGame(s);
        }
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Chaqueta retirada del perchero (gancho vacío).';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      givePipe: () => {
        const saveState = Storage.getSaveGame() || Storage.createNewGame();
        if (!saveState.puzzleFlags) saveState.puzzleFlags = {};
        saveState.puzzleFlags.pipe_picked = true;
        saveState.puzzleFlags.has_pipe = true;
        if (!Array.isArray(saveState.inventory)) saveState.inventory = [];
        if (!saveState.inventory.some(i => i.id === 'pipe' || i.id === 'bsmnt_pipe' || i.id === 'tuberia')) {
          saveState.inventory.push({
            id: 'pipe',
            name: 'Tramo de tubería',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_pipe-handle.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_pipe-handle.webp'
          });
        }
        Storage.setSaveGame(saveState);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔧 Tramo de tubería añadido al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetPipe: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.pipe_picked;
          delete s.puzzleFlags.has_pipe;
          delete s.puzzleFlags.pipe_placed;
          if (Array.isArray(s.inventory)) {
            s.inventory = s.inventory.filter(i => i.id !== 'pipe' && i.id !== 'bsmnt_pipe' && i.id !== 'tuberia' && i.id !== 'pipe-handle');
          }
          Storage.setSaveGame(s);
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Tubería restaurada en bsmnt_03_under_stairs.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      placePipe: () => {
        if (window.SceneManager) window.SceneManager.placePipeInPipesScene();
        const msg = '🔧 Tubería acoplada en bsmnt_01_pipes.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetPipesPlacement: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.pipe_placed;
          Storage.setSaveGame(s);
        }
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Tubería desinstalada de bsmnt_01_pipes.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      takePipe: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        delete s.puzzleFlags.pipe_placed;
        s.puzzleFlags.pipe_picked = true;
        s.puzzleFlags.has_pipe = true;
        if (!Array.isArray(s.inventory)) s.inventory = [];
        if (!s.inventory.some(i => i.id === 'pipe' || i.id === 'bsmnt_pipe' || i.id === 'tuberia' || i.id === 'pipe-handle')) {
          s.inventory.push({
            id: 'pipe',
            name: 'Tramo de tubería',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_pipe-handle.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_pipe-handle.webp'
          });
        }
        Storage.setSaveGame(s);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔧 Tubería quitada de la pared y colocada en el inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      unplacePipe: () => {
        return window.gameDebug ? window.gameDebug.takePipe() : '';
      },
      solveProvidence: () => {
        return window.ProvidencePuzzle ? window.ProvidencePuzzle.solve() : '';
      },
      resetProvidence: () => {
        return window.ProvidencePuzzle ? window.ProvidencePuzzle.reset() : '';
      },
      giveLockerKey: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.key_to_locker_picked = true;
        s.puzzleFlags.has_key_to_locker = true;
        if (!Array.isArray(s.inventory)) s.inventory = [];
        if (!s.inventory.some(i => i.id === 'key_to_locker' || i.id === 'bsmnt_key_to_locker')) {
          s.inventory.push({
            id: 'key_to_locker',
            name: 'Llave antigua',
            icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_key_to_locker.webp',
            closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_key_to_locker.webp'
          });
        }
        Storage.setSaveGame(s);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔑 Llave de la taquilla otorgada al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetLockerKey: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.key_to_locker_picked;
          delete s.puzzleFlags.has_key_to_locker;
          delete s.puzzleFlags.locker_unlocked;
          delete s.puzzleFlags.key_to_locker_used;
          if (Array.isArray(s.inventory)) {
            s.inventory = s.inventory.filter(i => i.id !== 'key_to_locker' && i.id !== 'bsmnt_key_to_locker');
          }
          Storage.setSaveGame(s);
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Llave de la taquilla reseteada.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      unlockLocker: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.locker_unlocked = true;
        s.puzzleFlags.key_to_locker_used = true;
        if (Array.isArray(s.inventory)) {
          s.inventory = s.inventory.filter(i => i.id !== 'key_to_locker' && i.id !== 'bsmnt_key_to_locker');
        }
        Storage.setSaveGame(s);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) {
          window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_03_locker_open');
        }
        const msg = '🔓 Taquilla abierta y escena bsmnt_03_locker_open cargada.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetLocker: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.locker_unlocked;
          delete s.puzzleFlags.key_to_locker_used;
          if (s.puzzleFlags.key_to_locker_picked || s.puzzleFlags.has_key_to_locker) {
            if (Array.isArray(s.inventory) && !s.inventory.some(i => i.id === 'key_to_locker')) {
              s.inventory.push({
                id: 'key_to_locker',
                name: 'Llave antigua',
                icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_key_to_locker.webp',
                closeup: 'assets/levels/level_01_bsmnt/items/closeups/bsmnt_key_to_locker.webp'
              });
            }
          }
          Storage.setSaveGame(s);
        }
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) {
          window.SceneManager.loadScene('level_01_bsmnt', 'bsmnt_03_locker_room');
        }
        const msg = '🔄 Taquilla cerrada y reseteada.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      givePlates: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.plates_picked = true;
        s.puzzleFlags.has_plates = true;
        if (!s.puzzleFlags.plates_state) {
          s.puzzleFlags.plates_state = {
            1: { slot: 1, rotation: 0 },
            2: { slot: 2, rotation: 0 },
            3: { slot: 3, rotation: 0 },
            4: { slot: 4, rotation: 0 }
          };
          s.puzzleFlags.plates_slots = { 1: 1, 2: 2, 3: 3, 4: 4 };
          s.puzzleFlags.plates_rotations = { 1: 0, 2: 0, 3: 0, 4: 0 };
          s.puzzleFlags.slots_plates = { 1: 1, 2: 2, 3: 3, 4: 4 };
        }
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
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🧩 Placas de bronce otorgadas al inventario.';
        console.log(`%c${msg}`, 'color: #38bdf8; font-weight: bold;');
        return msg;
      },
      resetPlates: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.plates_picked;
          delete s.puzzleFlags.has_plates;
          delete s.puzzleFlags.plates_state;
          delete s.puzzleFlags.plates_slots;
          delete s.puzzleFlags.plates_rotations;
          delete s.puzzleFlags.slots_plates;
          delete s.puzzleFlags.niche_plates_placed;
          delete s.puzzleFlags.final_door_open;
          if (Array.isArray(s.inventory)) {
            s.inventory = s.inventory.filter(i => i.id !== 'plates' && i.id !== 'bsmnt_plates');
          }
          Storage.setSaveGame(s);
        }
        const overlay = document.getElementById('overlay-niche-plates');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Placas de bronce reseteadas.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      solvePlates: () => {
        const s = Storage.getSaveGame() || Storage.createNewGame();
        if (!s.puzzleFlags) s.puzzleFlags = {};
        s.puzzleFlags.plates_state = {
          1: { slot: 3, rotation: 180 },
          2: { slot: 2, rotation: 90 },
          3: { slot: 1, rotation: 180 },
          4: { slot: 4, rotation: 0 }
        };
        s.puzzleFlags.plates_slots = { 1: 3, 2: 2, 3: 1, 4: 4 };
        s.puzzleFlags.plates_rotations = { 1: 180, 2: 90, 3: 180, 4: 0 };
        s.puzzleFlags.slots_plates = { 3: 1, 2: 2, 1: 3, 4: 4 };
        Storage.setSaveGame(s);
        if (window.InventoryManager) window.InventoryManager.render();
        const msg = '✨ Placas resueltas en la configuración correcta (Slot 1: P3@180, Slot 2: P2@90, Slot 3: P1@180, Slot 4: P4@0).';
        console.log(`%c${msg}`, 'color: #10b981; font-weight: bold;');
        return msg;
      },
      resetNichePlates: () => {
        const s = Storage.getSaveGame();
        if (s && s.puzzleFlags) {
          delete s.puzzleFlags.niche_plates_placed;
          delete s.puzzleFlags.final_door_open;
          if (Array.isArray(s.inventory) && !s.inventory.some(i => i.id === 'plates' || i.id === 'bsmnt_plates')) {
            s.inventory.push({
              id: 'plates',
              name: 'Placas de bronce',
              icon: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
              closeup: 'assets/levels/level_01_bsmnt/items/icons/bsmnt_plates.webp',
              interactiveCloseup: 'plates_grid'
            });
          }
          Storage.setSaveGame(s);
        }
        const overlay = document.getElementById('overlay-niche-plates');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (window.InventoryManager) window.InventoryManager.render();
        if (window.SceneManager) window.SceneManager.renderHotspots();
        const msg = '🔄 Placas retiradas de la hornacina y devueltas al inventario.';
        console.log(`%c${msg}`, 'color: #aaa;');
        return msg;
      },
      status: () => {
        const saveState = Storage.getSaveGame() || {};
        const hasKey = Boolean(saveState.puzzleFlags?.has_key_door_03 || saveState.puzzleFlags?.door_03_unlocked);
        const lightOn = Boolean(saveState.puzzleFlags?.light_on || saveState.puzzleFlags?.luz_encendida || saveState.puzzleFlags?.switch_on);
        const switchPlaced = Boolean(saveState.puzzleFlags?.switch_placed);
        const trunkOpen = Boolean(saveState.puzzleFlags?.trunk_open || saveState.puzzleFlags?.baul_abierto);
        const puzzleSolved = Boolean(saveState.puzzleFlags?.baul_resuelto);
        const bulbInLamp = Boolean(saveState.puzzleFlags?.bulb_in_painting_lamp || saveState.puzzleFlags?.painting_uv_active);
        const report = `📋 Estado actual -> Escena: [${SceneManager.currentScene}] | Baúl: ${trunkOpen ? 'ABIERTO' : 'CERRADO'} (Puzzle: ${puzzleSolved ? 'RESUELTO' : 'PENDIENTE'}) | Bombilla en lámpara: ${bulbInLamp} | Llave puerta 03: ${hasKey} | Interruptor: ${switchPlaced ? (lightOn ? 'ON' : 'OFF') : 'NO COLOCADO'} | Luz: ${lightOn ? 'ENCENDIDA' : 'APAGADA'}`;
        console.log(report);
        return report;
      }
    };
  }
};
