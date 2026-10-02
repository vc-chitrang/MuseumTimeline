/*
 * Content for the 24 Tirthankaras of the current avasarpini (descending half
 * of the Jain time cycle).
 *
 * Source: thejainreligion.in/tirthankaras/introduction (names, parents,
 * birthplace, moksha place). Emblems follow the museum's symbol artwork
 * (Data/Images/Symbols). Body colours follow common tradition.
 * Some facts differ between Svetambara and Digambara traditions; final
 * content must be reviewed by the museum's subject expert before launch.
 */
import { project, type Point } from '../lib/projection';

export type ColourKey = 'golden' | 'red' | 'white' | 'blue' | 'dark' | 'green';
export type Mode = 'birth' | 'moksha';

export type PlaceKey =
  // moksha places
  | 'shikharji' | 'ashtapad' | 'girnar' | 'pavapuri'
  // birthplaces (Champapuri is both)
  | 'champapuri' | 'ayodhya' | 'shravasti' | 'kaushambi' | 'varanasi' | 'chandrapura'
  | 'kakandi' | 'bhadrapura' | 'simhapuri' | 'kampilya' | 'ratnapuri' | 'hastinapur'
  | 'mithila' | 'rajgriha' | 'sauripura' | 'kundalpur';

export interface Colour { label: string; hex: string }

export interface Place extends Point {
  key: PlaceKey;
  name: string;
  hi: string;
  region: string;
  lat: number;
  lon: number;
}

export interface Tirthankara {
  id: number;
  name: string;
  hi: string;
  alias: string;
  emblem: string;
  colour: ColourKey;
  birth: PlaceKey;
  moksha: PlaceKey;
  parents: string;
  /** Emblem artwork (512 px), relative to the site base. */
  symbol: string;
  /** Small copy (160 px) for map badges, cards and the scrubber bubble. */
  symbolSm: string;
}

export const COLOURS: Record<ColourKey, Colour> = {
  golden: { label: 'Golden', hex: '#e2b04a' },
  red: { label: 'Red', hex: '#d6533f' },
  white: { label: 'White', hex: '#efe9dc' },
  blue: { label: 'Blue', hex: '#4a6fd0' },
  dark: { label: 'Dark blue', hex: '#3d4d8f' },
  green: { label: 'Green', hex: '#3f9f74' }
};

/**
 * `nudge` shifts the drawn marker a few map-pixels so neighbouring places
 * (e.g. Varanasi / Sarnath / Chandrapuri, ~10–20 km apart) stay tappable.
 */
function place(
  key: PlaceKey, name: string, hi: string, region: string,
  lat: number, lon: number, nudge: Point = { x: 0, y: 0 }
): Place {
  const p = project(lat, lon);
  return { key, name, hi, region, lat, lon, x: p.x + nudge.x, y: p.y + nudge.y };
}

// Modern locations are common identifications; several ancient sites
// (e.g. Bhadrapura, Mithila, Kundalpur) have more than one claimed location.
export const PLACES: Record<PlaceKey, Place> = {
  shikharji: place('shikharji', 'Sammed Shikharji', 'सम्मेद शिखरजी', 'Parasnath Hill, Jharkhand', 23.96, 86.13),
  ashtapad: place('ashtapad', 'Ashtapad', 'अष्टापद', 'Mount Kailash', 31.07, 81.31),
  girnar: place('girnar', 'Mount Girnar', 'गिरनार', 'Junagadh, Gujarat', 21.53, 70.53),
  pavapuri: place('pavapuri', 'Pavapuri', 'पावापुरी', 'Nalanda, Bihar', 25.09, 85.54),
  champapuri: place('champapuri', 'Champapuri', 'चंपापुरी', 'Bhagalpur, Bihar', 25.25, 86.94),

  ayodhya: place('ayodhya', 'Ayodhya', 'अयोध्या', 'Uttar Pradesh', 26.8, 82.2),
  shravasti: place('shravasti', 'Shravasti', 'श्रावस्ती', 'Uttar Pradesh', 27.52, 82.05),
  kaushambi: place('kaushambi', 'Kaushambi', 'कौशाम्बी', 'Uttar Pradesh', 25.34, 81.39),
  varanasi: place('varanasi', 'Varanasi', 'वाराणसी', 'Uttar Pradesh', 25.32, 83.01, { x: -6, y: 8 }),
  chandrapura: place('chandrapura', 'Chandrapura', 'चंद्रपुरी', 'near Varanasi, Uttar Pradesh', 25.45, 83.17, { x: 16, y: -2 }),
  simhapuri: place('simhapuri', 'Simhapuri', 'सिंहपुरी', 'Sarnath, Uttar Pradesh', 25.38, 83.02, { x: -4, y: -14 }),
  kakandi: place('kakandi', 'Kakandi', 'काकंदी', 'Deoria, Uttar Pradesh', 26.37, 83.92),
  bhadrapura: place('bhadrapura', 'Bhadrapura', 'भद्रपुर', 'Chatra, Jharkhand', 24.4, 84.88),
  kampilya: place('kampilya', 'Kampilya', 'कांपिल्य', 'Farrukhabad, Uttar Pradesh', 27.62, 79.28),
  ratnapuri: place('ratnapuri', 'Ratnapuri', 'रत्नपुरी', 'near Ayodhya, Uttar Pradesh', 26.77, 81.98, { x: -10, y: 6 }),
  hastinapur: place('hastinapur', 'Hastinapur', 'हस्तिनापुर', 'Meerut, Uttar Pradesh', 29.16, 78.01),
  mithila: place('mithila', 'Mithila', 'मिथिला', 'Sitamarhi, Bihar', 26.59, 85.49),
  rajgriha: place('rajgriha', 'Rajgriha', 'राजगृह', 'Rajgir, Bihar', 25.03, 85.42, { x: 2, y: 8 }),
  sauripura: place('sauripura', 'Sauripura', 'शौरीपुर', 'Agra, Uttar Pradesh', 26.93, 78.55),
  kundalpur: place('kundalpur', 'Kundalpur', 'कुंडलपुर', 'Nalanda, Bihar', 25.14, 85.44, { x: -6, y: -12 })
};

// [name, hindi, alias, emblem, colour, birth, moksha, parents]
type Row = [string, string, string, string, ColourKey, PlaceKey, PlaceKey, string];

const ROWS: Row[] = [
  ['Rishabhanatha',  'ऋषभनाथ',       'Adinath',    'Bull',         'golden', 'ayodhya',     'ashtapad',   'Nabhiraja & Marudevi'],
  ['Ajitnath',       'अजितनाथ',       '',           'Elephant',     'golden', 'ayodhya',     'shikharji',  'Jitashatru & Vijaya'],
  ['Sambhavnath',    'संभवनाथ',       '',           'Horse',        'golden', 'shravasti',   'shikharji',  'Jitari & Susena'],
  ['Abhinandannath', 'अभिनंदननाथ',    '',           'Monkey',       'golden', 'ayodhya',     'shikharji',  'Samvar & Siddhartha'],
  ['Sumatinath',     'सुमतिनाथ',      '',           'Swan',         'golden', 'ayodhya',     'shikharji',  'Meghaprabha & Sumangala'],
  ['Padmaprabhu',    'पद्मप्रभु',      '',           'Red lotus',    'red',    'kaushambi',   'shikharji',  'Dharan & Sushima'],
  ['Suparshvanath',  'सुपार्श्वनाथ',   '',           'Swastika',     'green',  'varanasi',    'shikharji',  'Pratishthasen & Pruthvi'],
  ['Chandraprabhu',  'चंद्रप्रभु',     '',           'Crescent moon','white',  'chandrapura', 'shikharji',  'Mahasena & Sulakshana'],
  ['Pushpadanta',    'पुष्पदंत',       'Suvidhinath','Crocodile',    'white',  'kakandi',     'shikharji',  'Sugriva & Rama'],
  ['Sheetalnath',    'शीतलनाथ',       '',           'Shrivatsa',    'golden', 'bhadrapura',  'shikharji',  'Dridharatha & Sunanda'],
  ['Shreyansnath',   'श्रेयांसनाथ',    '',           'Rhinoceros',   'golden', 'simhapuri',   'shikharji',  'Vishnu & Venu'],
  ['Vasupujya',      'वासुपूज्य',      '',           'Buffalo',      'red',    'champapuri',  'champapuri', 'Vasupujya & Vijaya'],
  ['Vimalnath',      'विमलनाथ',       '',           'Boar',         'golden', 'kampilya',    'shikharji',  'Kritavarma & Suramya'],
  ['Anantnath',      'अनंतनाथ',       '',           'Falcon',       'golden', 'ayodhya',     'shikharji',  'Simhasena & Suyasah'],
  ['Dharmanath',     'धर्मनाथ',       '',           'Vajra',        'golden', 'ratnapuri',   'shikharji',  'Bhanu & Suvrita'],
  ['Shantinath',     'शांतिनाथ',      '',           'Deer',         'golden', 'hastinapur',  'shikharji',  'Visvasena & Achira'],
  ['Kunthunath',     'कुंथुनाथ',      '',           'Goat',         'golden', 'hastinapur',  'shikharji',  'Suryasen & Srirani'],
  ['Arahnath',       'अरहनाथ',        '',           'Fish',         'golden', 'hastinapur',  'shikharji',  'Sudarshana & Mitrasena'],
  ['Mallinath',      'मल्लिनाथ',      '',           'Kalash (jar)', 'blue',   'mithila',     'shikharji',  'Kumbharaja & Prabhavati'],
  ['Munisuvrata',    'मुनिसुव्रत',     '',           'Tortoise',     'dark',   'rajgriha',    'shikharji',  'Sumitra & Padmavati'],
  ['Naminath',       'नमिनाथ',        '',           'Blue lotus',   'golden', 'mithila',     'shikharji',  'Vijaya & Vipra'],
  ['Neminath',       'नेमिनाथ',       '',           'Conch',        'dark',   'sauripura',   'girnar',     'Samudravijaya & Shiva'],
  ['Parshvanath',    'पार्श्वनाथ',     '',           'Serpent',      'green',  'varanasi',    'shikharji',  'Ashvasena & Vama'],
  ['Mahavira',       'महावीर',        'Vardhamana', 'Lion',         'golden', 'kundalpur',   'pavapuri',   'Siddhartha & Trishala']
];

export const TIRTHANKARAS: Tirthankara[] = ROWS.map(
  ([name, hi, alias, emblem, colour, birth, moksha, parents], i) => ({
    id: i + 1, name, hi, alias, emblem, colour, birth, moksha, parents,
    symbol: `assets/symbols/${String(i + 1).padStart(2, '0')}.webp`,
    symbolSm: `assets/symbols/sm/${String(i + 1).padStart(2, '0')}.webp`
  })
);

/** Place a Tirthankara is linked to in the given map mode. */
export const placeOf = (t: Tirthankara, mode: Mode): PlaceKey => (mode === 'birth' ? t.birth : t.moksha);

/** Places that appear on the map in the given mode, in first-use order. */
export function placesFor(mode: Mode): Place[] {
  const keys = [...new Set(TIRTHANKARAS.map(t => placeOf(t, mode)))];
  return keys.map(k => PLACES[k]);
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
