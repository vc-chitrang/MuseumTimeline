import { ART_EXT } from '../lib/format';

/*
 * Long-form content for the Tirthankara detail screens.
 *
 * Kevala trees: S. Majumder, "Jain Remains of Ancient Bengal" (table via
 * wisdomlib.org), cross-checked with the museum's Kevala-tree mural.
 * Descriptions are short DRAFT texts based on widely cited Jain tradition and
 * must be reviewed by the museum's subject expert before launch.
 */

export interface KevalaTree {
  name: string;
  hi: string;
  /** Common / botanical name for visitors. */
  common: string;
  /** Artwork in public/assets/trees. */
  image: string;
  /** False while this tree's own painting is still missing (a stand-in tree is shown in the scene). */
  hasArt: boolean;
  /** What is notable about this tree, beyond being the Kevala tree. */
  note: string;
}

export interface Description {
  title: string;
  body: string[];
  /** Extra short facts shown as a list. */
  more: string[];
}

/*
 * Painting for each Tirthankara's Kevala tree (Data/Trees/Fxx-*.png, keyed to
 * public/assets/trees/fxx.webp). A tree shared by two Tirthankaras (banyan,
 * sal) uses the same painting. null = painting not supplied yet.
 */
const TREE_ART: (string | null)[] = [
  'f01', 'f02', 'f03', null, 'f04', 'f05', 'f06', 'f07', null, 'f08', 'f09', 'f10',
  'f11', null, 'f13', 'f14', null, 'f15', 'f12', 'f16', 'f17', 'f18', 'f19', 'f03'
];
/** Shown in the scene until a tree's own painting arrives. */
const STAND_IN = 'f01';

/** Tree artwork for a Tirthankara (falls back to a stand-in tree). */
export const treeImage = (id: number) => `assets/trees/${TREE_ART[id - 1] ?? STAND_IN}.${ART_EXT}`;

const T = (name: string, hi: string, common: string, note: string) => ({ name, hi, common, note });

const TREES: Omit<KevalaTree, 'image' | 'hasArt'>[] = [
  T('Nyagrodha', 'न्यग्रोध (वट)', 'Banyan', 'The banyan spreads by aerial roots into a whole grove, a symbol of shelter and endurance.'),
  T('Saptaparna', 'सप्तपर्ण', 'Saptaparni (Alstonia)', 'Named for its leaves that grow in whorls of seven.'),
  T('Shala', 'शाल', 'Sal', 'A tall, long-lived forest tree of north and central India.'),
  T('Priyala', 'प्रियाल', 'Chironji (Buchanania)', 'A hardy tree of dry forests, known for its edible seeds.'),
  T('Priyangu', 'प्रियंगु', 'Priyangu', 'A fragrant flowering shrub-tree praised in classical Indian literature.'),
  T('Chhatrabha', 'छत्राभ', 'Chhatra tree', 'Named for its spreading, umbrella-like (chhatra) crown.'),
  T('Shirisha', 'शिरीष', 'Siris', 'Known for its soft, fragrant, powder-puff flowers.'),
  T('Naga', 'नाग', 'Naga tree', 'Named in Jain texts as the tree of Chandraprabha’s enlightenment.'),
  T('Mali', 'मालि', 'Mali tree', 'Named in the Samavayanga Sutra as the tree of Pushpadanta’s enlightenment.'),
  T('Bilva', 'बिल्व', 'Bael', 'A sacred tree across Indian traditions, valued for its fruit and leaves.'),
  T('Tinduka', 'तिंदुक (तेंदू)', 'Tendu (Indian ebony)', 'A forest tree whose leaves are used to roll bidis and whose heartwood is ebony.'),
  T('Patala', 'पाटल', 'Patala (trumpet flower)', 'Bears fragrant trumpet-shaped flowers.'),
  T('Jambu', 'जम्बू (जामुन)', 'Jamun', 'Gives its name to Jambudvipa, the continent of the Jain world-view.'),
  T('Ashvattha', 'अश्वत्थ (पीपल)', 'Peepal', 'A long-lived sacred fig with heart-shaped leaves.'),
  T('Dadhiparna', 'दधिपर्ण (कैथ)', 'Wood-apple', 'A thorny tree whose hard-shelled fruit is eaten across India.'),
  T('Nandi', 'नंदी (तून)', 'Toon', 'A tall shade tree prized for its fine timber.'),
  T('Tilaka', 'तिलक', 'Tilaka', 'A flowering tree celebrated in classical poetry.'),
  T('Chuta', 'चूत (आम्र)', 'Mango', 'India’s beloved fruit tree, a sign of abundance.'),
  T('Ashoka', 'अशोक', 'Ashoka', '“Free from sorrow”; its red blossoms are linked with joy and auspicious beginnings.'),
  T('Champaka', 'चंपक (चंपा)', 'Champa', 'Known for its intensely fragrant golden flowers.'),
  T('Bakula', 'बकुल (मौलसिरी)', 'Bakul', 'Its small star-shaped flowers keep their fragrance long after falling.'),
  T('Vetasa', 'वेतस (बेंत)', 'Cane / Rattan', 'A flexible water-side plant, a symbol of humility.'),
  T('Dhataki', 'धातकी (धावई)', 'Fire-flame bush', 'Covered in bright red tubular flowers; used in traditional medicine.'),
  T('Shala', 'शाल', 'Sal', 'A tall, long-lived forest tree of north and central India.')
];

export const KEVALA_TREES: KevalaTree[] = TREES.map((t, i) => ({
  ...t,
  // getter: the art format (AVIF/WebP) is only known once the app starts
  get image() { return treeImage(i + 1); },
  hasArt: TREE_ART[i] !== null
}));

const D = (title: string, body: string[], more: string[] = []): Description => ({ title, body, more });

export const DESCRIPTIONS: Description[] = [
  D('The First Tirthankara', [
    'Also called Adinath, Rishabhanatha is the first Tirthankara of our time cycle.',
    'Jain tradition remembers him as the one who taught people farming, writing and the arts of living together, before he renounced his kingdom to seek liberation.'
  ], ['Also known as Adinath', 'His sons included Bharata, the first chakravarti, and Bahubali']),
  D('The Unconquered', [
    'Ajita means “the invincible” — one who has conquered inner passions.',
    'He was born in Ayodhya to King Jitashatru and Queen Vijaya.'
  ]),
  D('The Auspicious One', ['Sambhavnath was born in the city of Shravasti and is the third Tirthankara of our time cycle.']),
  D('The Joyful One', ['Abhinandana means “delight” or “celebration”. He was born in Ayodhya and is the fourth Tirthankara.']),
  D('The Wise One', ['Sumati means “good wisdom”. Sumatinath, the fifth Tirthankara, was born in Ayodhya.']),
  D('Radiant as the Lotus', ['Padma means lotus. Padmaprabhu, the sixth Tirthankara, is traditionally shown with a red complexion and the lotus as his emblem.']),
  D('The Seventh Tirthankara', ['Suparshvanath was born in Varanasi. His emblem is the swastika, an ancient Jain symbol of well-being.']),
  D('Radiant as the Moon', ['Chandraprabhu means “radiant as the moon”. He is shown with a white complexion and the crescent moon as his emblem.']),
  D('The Ninth Tirthankara', ['Pushpadanta, also known as Suvidhinath, was born in Kakandi.'], ['Also known as Suvidhinath']),
  D('The Cool and Calm', ['Sheetal means “cool” or “calm” — the peace of a mind free from passion.']),
  D('The Most Excellent', ['Shreyas means “the best” or “auspicious”. Shreyansnath was born in Simhapuri, near Sarnath.']),
  D('The Revered One', [
    'Vasupujya was born in Champapuri, where he also attained moksha.',
    'Champapuri is honoured as the place of the auspicious events (kalyanakas) of his life.'
  ]),
  D('The Pure One', ['Vimala means “pure” or “spotless”. Vimalnath was born in Kampilya.']),
  D('The Infinite', ['Ananta means “infinite”. Anantnath, the fourteenth Tirthankara, was born in Ayodhya.']),
  D('Lord of Dharma', ['Dharmanath, the fifteenth Tirthankara, was born in Ratnapuri. Dharma means righteousness and the true nature of things.']),
  D('The Bringer of Peace', [
    'Shanti means “peace”. Shantinath was born in Hastinapur.',
    'Jain tradition holds that he was also a chakravarti, a universal emperor, before renouncing the world.'
  ], ['Also a chakravarti in Jain tradition']),
  D('The Seventeenth Tirthankara', [
    'Kunthunath was born in Hastinapur.',
    'Like Shantinath before him, tradition holds that he ruled as a chakravarti before renunciation.'
  ], ['Also a chakravarti in Jain tradition']),
  D('The Eighteenth Tirthankara', [
    'Arahnath was born in Hastinapur — the third Tirthankara in a row from this city.',
    'Tradition holds that he too ruled as a chakravarti before renunciation.'
  ], ['Also a chakravarti in Jain tradition']),
  D('The Nineteenth Tirthankara', [
    'Mallinath was born in Mithila.',
    'In the Svetambara tradition Malli is remembered as a woman; the Digambara tradition remembers Mallinath as a man.'
  ]),
  D('The Keeper of Vows', [
    'Munisuvrata, born in Rajgriha, is the twentieth Tirthankara.',
    'Jain tradition places him in the age of Rama.'
  ]),
  D('The Twenty-first Tirthankara', ['Naminath was born in Mithila. His emblem is the blue lotus.']),
  D('The Compassionate Prince', [
    'On his wedding day, Neminath saw animals penned to be killed for the feast. Moved by compassion, he set them free and renounced the world.',
    'He attained moksha on Mount Girnar in Gujarat.'
  ], ['A cousin of Krishna in Jain tradition']),
  D('The Twenty-third Tirthankara', [
    'Parshvanath was born in Varanasi and is the earliest Tirthankara widely accepted by historians.',
    'Tradition tells how the serpent king Dharanendra sheltered him with his hoods during meditation.'
  ]),
  D('The Great Hero', [
    'Born as Vardhamana, Mahavira is the twenty-fourth and last Tirthankara of our time cycle.',
    'He renounced his princely life at thirty, attained Kevala Jnana after years of austerity, and attained moksha at Pavapuri — a day remembered at Diwali.'
  ], ['Born as Vardhamana', 'His moksha is remembered at Diwali'])
];
