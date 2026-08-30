export interface InterestCategory {
  label: string;
  emoji: string;
  c1: string;
  c2: string;
  items: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    label: 'Language and Linguistics',
    emoji: '🗣️',
    c1: '#1E88E5',
    c2: '#22E5FF',
    items: [
      'Igbo', 'Tsonga', 'Akan', 'Lingala', 'Yoruba', 'Xhosa', 'Hausa', 'Luganda', 'Luo', 'Zulu',
      'Urhobo', 'Duala', 'Nigerian Pidgin', 'Nupe', 'Mandinka', 'Wolof', 'Shona', 'Setswana', 'Sesotho',
      'Swahili', 'Kikuyu', 'Fula', 'Ndebele', 'Oshiwambo', 'Kinyarwanda', 'Edo', 'Bemba', 'Tonga',
      'Siswati', 'Chichewa', 'Ebonics', 'Jamaican patwah', 'Haitian Creole', 'Cameroonian Pidgin',
    ],
  },
  {
    label: 'Music',
    emoji: '🎵',
    c1: '#B44CFF',
    c2: '#B388FF',
    items: [
      'Igbo Highlife', 'gospel music', 'Afro beat', 'Amapiano', 'R&B', 'Hip Hop', 'Reggae music',
      'Jazz', 'House music', 'Pop music', 'Trap music', 'UK Drill', 'Igbo Drill', 'Ghana Highlife',
    ],
  },
  {
    label: 'Movies and TV shows',
    emoji: '🎬',
    c1: '#5C6BC0',
    c2: '#9FA8DA',
    items: [
      'Nollywood', 'Documentaries', '90 day fiancé', 'Hollywood', 'K-drama', 'Horror movies',
      'The Real Housewives', 'Big brother Naija', 'Bollywood', 'Comedy', 'Anime',
    ],
  },
  {
    label: 'Sports and Athletics',
    emoji: '⚽',
    c1: '#2E7D32',
    c2: '#66BB6A',
    items: [
      'Football', 'Basketball', 'volleyball', 'swimming', 'running', 'cycling', 'ịkpọ ụga',
      'Hand ball', 'Netball', 'tennis', 'Golf', 'Boxing',
    ],
  },
  {
    label: 'Food and Drink',
    emoji: '🍲',
    c1: '#FF7043',
    c2: '#FFB74D',
    items: [
      'Ogbono', 'jollof', 'Mogodu', 'wine', 'Beer', 'Egwusi', 'sushi', 'cocktails', 'coffee',
      'Palm wine', 'whiskey', 'Champagne', 'Mocktails', 'plantain', 'Tea',
    ],
  },
  {
    label: 'Social Media and Networking',
    emoji: '📱',
    c1: '#3949AB',
    c2: '#7986CB',
    items: [
      'Instagram', 'Facebook', 'YouTube', 'Tik Tok', 'LinkedIn', 'Telegram', 'Google Chat',
      'Netflix', 'Spotify', 'Twitch', 'WhatsApp', 'Snapchat',
    ],
  },
  {
    label: 'Art & Literature',
    emoji: '📚',
    c1: '#AB47BC',
    c2: '#CE93D8',
    items: [
      'Igbo Folktales', 'Bini Bronzes', 'Terracotta', 'Things fall apart', 'Half of a Yellow Sun',
      'Asante Regalia', 'Djembé', 'Igboukwu bronzes',
    ],
  },
  {
    label: 'Politics & Activism',
    emoji: '✊',
    c1: '#D81B60',
    c2: '#F06292',
    items: [
      'Pan-Africanism', 'Democracy', 'youth empowerment', 'women empowerment', 'Black Nationalism',
      'Anti-Apartheid', 'Anti-Colonialism',
    ],
  },
  {
    label: 'Social Activities & Adventures',
    emoji: '🌍',
    c1: '#00897B',
    c2: '#4DB6AC',
    items: [
      'Travel', 'camping', 'fishing', 'clubbing', 'snorkeling', 'Atilogwu Dance', 'Date Nights',
      'Owambe', 'Jetskiing', 'Backpacking', 'picnics',
    ],
  },
  {
    label: 'Beauty & Wellness',
    emoji: '🧖',
    c1: '#7E57C2',
    c2: '#B39DDB',
    items: [
      'Spa', 'skincare', 'makeup', 'Meditation', 'Yoga', 'pedicure', 'Manicure', 'Sauna',
    ],
  },
];

export const INTEREST_OPTIONS: string[] = INTEREST_CATEGORIES.flatMap((c) => c.items);

export function interestCategory(name: string): InterestCategory | undefined {
  return INTEREST_CATEGORIES.find((c) => c.items.includes(name));
}
