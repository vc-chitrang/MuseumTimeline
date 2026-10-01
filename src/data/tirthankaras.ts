/*
 * Content for the 24 Tirthankaras of the current avasarpini (descending half
 * of the Jain time cycle).
 *
 * Source: thejainreligion.in/tirthankaras/introduction (names, symbols,
 * parents, birthplace, moksha place). Body colours follow common tradition.
 * Some facts differ between Svetambara and Digambara traditions; final
 * content must be reviewed by the museum's subject expert before launch.
 */
import { project, type Point } from '../lib/projection';

export type ColourKey = 'golden' | 'red' | 'white' | 'blue' | 'dark' | 'green';
export type PlaceKey = 'shikharji' | 'ashtapad' | 'champapuri' | 'girnar' | 'pavapuri';

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
  icon: string;
  colour: ColourKey;
  moksha: PlaceKey;
  parents: string;
  birthplace: string;
  /** Emblem drawn as a typographic glyph (no suitable emoji). */
  glyph: boolean;
  /** Emblem emoji tinted blue (blue lotus). */
  tint: boolean;
}

export const COLOURS: Record<ColourKey, Colour> = {
  golden: { label: 'Golden', hex: '#e2b04a' },
  red: { label: 'Red', hex: '#d6533f' },
  white: { label: 'White', hex: '#efe9dc' },
  blue: { label: 'Blue', hex: '#4a6fd0' },
  dark: { label: 'Dark blue', hex: '#3d4d8f' },
  green: { label: 'Green', hex: '#3f9f74' }
};

function place(key: PlaceKey, name: string, hi: string, region: string, lat: number, lon: number): Place {
  return { key, name, hi, region, lat, lon, ...project(lat, lon) };
}

export const PLACES: Record<PlaceKey, Place> = {
  shikharji: place('shikharji', 'Sammed Shikharji', 'सम्मेद शिखरजी', 'Parasnath Hill, Jharkhand', 23.96, 86.13),
  ashtapad: place('ashtapad', 'Ashtapad', 'अष्टापद', 'Mount Kailash', 31.07, 81.31),
  champapuri: place('champapuri', 'Champapuri', 'चंपापुरी', 'Bhagalpur, Bihar', 25.25, 86.94),
  girnar: place('girnar', 'Mount Girnar', 'गिरनार', 'Junagadh, Gujarat', 21.53, 70.53),
  pavapuri: place('pavapuri', 'Pavapuri', 'पावापुरी', 'Nalanda, Bihar', 25.09, 85.54)
};

// [name, hindi, alias, emblem, icon, colour, moksha, parents, birthplace, style?]
// style: 1 = typographic glyph, 2 = blue-tinted emoji
type Row = [string, string, string, string, string, ColourKey, PlaceKey, string, string, (1 | 2)?];

const ROWS: Row[] = [
  ['Rishabhanatha', 'ऋषभनाथ',     'Adinath', 'Bull',          '🐂', 'golden', 'ashtapad',   'Nabhiraja & Marudevi',     'Ayodhya'],
  ['Ajitnath',      'अजितनाथ',     '', 'Elephant',             '🐘', 'golden', 'shikharji',  'Jitashatru & Vijaya',      'Ayodhya'],
  ['Sambhavnath',   'संभवनाथ',     '', 'Horse',                '🐎', 'golden', 'shikharji',  'Jitari & Susena',          'Shravasti'],
  ['Abhinandannath','अभिनंदननाथ',  '', 'Monkey',               '🐒', 'golden', 'shikharji',  'Samvar & Siddhartha',      'Ayodhya'],
  ['Sumatinath',    'सुमतिनाथ',    '', 'Red goose',            '🦢', 'golden', 'shikharji',  'Meghaprabha & Sumangala',  'Ayodhya'],
  ['Padmaprabhu',   'पद्मप्रभु',    '', 'Lotus',                '🪷', 'red',    'shikharji',  'Dharan & Sushima',         'Kaushambi'],
  ['Suparshvanath', 'सुपार्श्वनाथ', '', 'Swastika',             '卐', 'green',  'shikharji',  'Pratishthasen & Pruthvi',  'Varanasi', 1],
  ['Chandraprabhu', 'चंद्रप्रभु',   '', 'Crescent moon',        '🌙', 'white',  'shikharji',  'Mahasena & Sulakshana',    'Chandrapura'],
  ['Pushpadanta',   'पुष्पदंत',     '', 'Crocodile',            '🐊', 'white',  'shikharji',  'Sugriva & Rama',           'Kakandi'],
  ['Sheetalnath',   'शीतलनाथ',     '', 'Kalpavriksha',         '🌳', 'golden', 'shikharji',  'Dridharatha & Sunanda',    'Bhadrapura'],
  ['Shreyansnath',  'श्रेयांसनाथ',  '', 'Rhinoceros',           '🦏', 'golden', 'shikharji',  'Vishnu & Venu',            'Simhapuri'],
  ['Vasupujya',     'वासुपूज्य',    '', 'Buffalo',              '🐃', 'red',    'champapuri', 'Vasupujya & Vijaya',       'Champapuri'],
  ['Vimalnath',     'विमलनाथ',     '', 'Boar',                 '🐗', 'golden', 'shikharji',  'Kritavarma & Suramya',     'Kampilya'],
  ['Anantnath',     'अनंतनाथ',     '', 'Porcupine',            '🦔', 'golden', 'shikharji',  'Simhasena & Suyasah',      'Ayodhya'],
  ['Dharmanath',    'धर्मनाथ',     '', 'Vajra (thunderbolt)',  '✸', 'golden', 'shikharji',  'Bhanu & Suvrita',          'Ratnapuri', 1],
  ['Shantinath',    'शांतिनाथ',    '', 'Deer',                 '🦌', 'golden', 'shikharji',  'Visvasena & Achira',       'Hastinapur'],
  ['Kunthunath',    'कुंथुनाथ',    '', 'Goat',                 '🐐', 'golden', 'shikharji',  'Suryasen & Srirani',       'Hastinapur'],
  ['Arahnath',      'अरहनाथ',      '', 'Fish',                 '🐟', 'golden', 'shikharji',  'Sudarshana & Mitrasena',   'Hastinapur'],
  ['Mallinath',     'मल्लिनाथ',    '', 'Kalash (jar)',         '🏺', 'blue',   'shikharji',  'Kumbharaja & Prabhavati',  'Mithila'],
  ['Munisuvrata',   'मुनिसुव्रत',   '', 'Tortoise',             '🐢', 'dark',   'shikharji',  'Sumitra & Padmavati',      'Rajgriha'],
  ['Naminath',      'नमिनाथ',      '', 'Blue lotus',           '🪷', 'golden', 'shikharji',  'Vijaya & Vipra',           'Mithila', 2],
  ['Neminath',      'नेमिनाथ',     '', 'Conch',                '🐚', 'dark',   'girnar',     'Samudravijaya & Shiva',    'Sauripura'],
  ['Parshvanath',   'पार्श्वनाथ',   '', 'Snake',                '🐍', 'green',  'shikharji',  'Ashvasena & Vama',         'Varanasi'],
  ['Mahavira',      'महावीर',      'Vardhamana', 'Lion',       '🦁', 'golden', 'pavapuri',   'Siddhartha & Trishala',    'Kundalpur']
];

export const TIRTHANKARAS: Tirthankara[] = ROWS.map(
  ([name, hi, alias, emblem, icon, colour, moksha, parents, birthplace, style], i) => ({
    id: i + 1, name, hi, alias, emblem, icon, colour, moksha, parents, birthplace,
    glyph: style === 1,
    tint: style === 2
  })
);

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
