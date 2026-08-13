export interface InterestCategory {
  label: string;
  items: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    label: 'Language and Linguistics',
    items: [
      'Igbo', 'Tsonga', 'Akan', 'Lingala', 'Yoruba', 'Xhosa', 'Hausa', 'Luganda', 'Luo', 'Zulu',
      'Urhobo', 'Duala', 'Nigerian Pidgin', 'Nupe', 'Mandinka', 'Wolof', 'Shona', 'Setswana', 'Sesotho',
      'Swahili', 'Kikuyu', 'Fula', 'Ndebele', 'Oshiwambo', 'Kinyarwanda', 'Edo', 'Bemba', 'Tonga',
      'Siswati', 'Chichewa', 'Ebonics', 'Jamaican patwah', 'Haitian Creole', 'Cameroonian Pidgin',
    ],
  },
  {
    label: 'Music',
    items: [
      'Igbo Highlife', 'gospel music', 'Afro beat', 'Amapiano', 'R&B', 'Hip Hop', 'Reggae music',
      'Jazz', 'House music', 'Pop music', 'Trap music', 'UK Drill', 'Igbo Drill', 'Ghana Highlife',
    ],
  },
  {
    label: 'Movies and TV shows',
    items: [
      'Nollywood', 'Documentaries', '90 day fiancé', 'Hollywood', 'K-drama', 'Horror movies',
      'The Real Housewives', 'Big brother Naija', 'Bollywood', 'Comedy', 'Anime',
    ],
  },
  {
    label: 'Sports and Athletics',
    items: [
      'Football', 'Basketball', 'volleyball', 'swimming', 'running', 'cycling', 'ịkpọ ụga',
      'Hand ball', 'Netball', 'tennis', 'Golf', 'Boxing',
    ],
  },
  {
    label: 'Food and Drink',
    items: [
      'Ogbono', 'jollof', 'Mogodu', 'wine', 'Beer', 'Egwusi', 'sushi', 'cocktails', 'coffee',
      'Palm wine', 'whiskey', 'Champagne', 'Mocktails', 'plantain', 'Tea',
    ],
  },
  {
    label: 'Social Media and Networking',
    items: [
      'Instagram', 'Facebook', 'YouTube', 'Tik Tok', 'LinkedIn', 'Telegram', 'Google Chat',
      'Netflix', 'Spotify', 'Twitch', 'WhatsApp', 'Snapchat',
    ],
  },
  {
    label: 'Art & Literature',
    items: [
      'Igbo Folktales', 'Bini Bronzes', 'Terracotta', 'Things fall apart', 'Half of a Yellow Sun',
      'Asante Regalia', 'Djembé', 'Igboukwu bronzes',
    ],
  },
  {
    label: 'Politics & Activism',
    items: [
      'Pan-Africanism', 'Democracy', 'youth empowerment', 'women empowerment', 'Black Nationalism',
      'Anti-Apartheid', 'Anti-Colonialism',
    ],
  },
  {
    label: 'Social Activities & Adventures',
    items: [
      'Travel', 'camping', 'fishing', 'clubbing', 'snorkeling', 'Atilogwu Dance', 'Date Nights',
      'Owambe', 'Jetskiing', 'Backpacking', 'picnics',
    ],
  },
  {
    label: 'Beauty & Wellness',
    items: [
      'Spa', 'skincare', 'makeup', 'Meditation', 'Yoga', 'pedicure', 'Manicure', 'Sauna',
    ],
  },
];
