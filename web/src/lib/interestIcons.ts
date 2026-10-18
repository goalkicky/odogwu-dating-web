import { interestCategory } from './interests';

const ICONS: Record<string, string> = {
  // Music
  'Igbo Highlife': '🎷',
  'gospel music': '🙏',
  'Afro beat': '🥁',
  'Amapiano': '🎧',
  'R&B': '🎤',
  'Hip Hop': '🎤',
  'Reggae music': '🇯🇲',
  'Jazz': '🎷',
  'House music': '🎚️',
  'Pop music': '🎶',
  'Trap music': '🔊',
  'UK Drill': '🔊',
  'Igbo Drill': '🔊',
  'Ghana Highlife': '🎷',

  // Movies and TV shows
  'Nollywood': '🎬',
  'Documentaries': '📺',
  '90 day fiancé': '💍',
  'Hollywood': '🌟',
  'K-drama': '📺',
  'Horror movies': '👻',
  'The Real Housewives': '👗',
  'Big brother Naija': '🏠',
  'Bollywood': '🎥',
  'Comedy': '😂',
  'Anime': '🎌',

  // Sports and Athletics
  'Football': '⚽',
  'Basketball': '🏀',
  'volleyball': '🏐',
  'swimming': '🏊',
  'running': '🏃',
  'cycling': '🚴',
  'ịkpọ ụga': '🎯',
  'Hand ball': '🤾',
  'Netball': '🥅',
  'tennis': '🎾',
  'Golf': '⛳',
  'Boxing': '🥊',

  // Food and Drink
  'Ogbono': '🍲',
  'jollof': '🍚',
  'Mogodu': '🍖',
  'wine': '🍷',
  'Beer': '🍺',
  'Egwusi': '🥣',
  'sushi': '🍣',
  'cocktails': '🍸',
  'coffee': '☕',
  'Palm wine': '🌴',
  'whiskey': '🥃',
  'Champagne': '🥂',
  'Mocktails': '🍹',
  'plantain': '🍌',
  'Tea': '🍵',

  // Social Media and Networking
  'Instagram': '📸',
  'Facebook': '👍',
  'YouTube': '▶️',
  'Tik Tok': '🎵',
  'LinkedIn': '💼',
  'Telegram': '✈️',
  'Google Chat': '💬',
  'Netflix': '🎬',
  'Spotify': '🎧',
  'Twitch': '📺',
  'WhatsApp': '💬',
  'Snapchat': '👻',

  // Art & Literature
  'Igbo Folktales': '📖',
  'Bini Bronzes': '🏺',
  'Terracotta': '🏺',
  'Things fall apart': '📕',
  'Half of a Yellow Sun': '🌅',
  'Asante Regalia': '👑',
  'Djembé': '🥁',
  'Igboukwu bronzes': '🏺',

  // Politics & Activism
  'Pan-Africanism': '🌍',
  'Democracy': '🗳️',
  'youth empowerment': '🌱',
  'women empowerment': '💪',
  'Black Nationalism': '✊',
  'Anti-Apartheid': '🕊️',
  'Anti-Colonialism': '⚖️',

  // Social Activities & Adventures
  'Travel': '✈️',
  'camping': '⛺',
  'fishing': '🎣',
  'clubbing': '🪩',
  'snorkeling': '🤿',
  'Atilogwu Dance': '💃',
  'Date Nights': '🌹',
  'Owambe': '🎉',
  'Jetskiing': '🚤',
  'Backpacking': '🎒',
  'picnics': '🧺',

  // Beauty & Wellness
  'Spa': '♨️',
  'skincare': '🧴',
  'makeup': '💄',
  'Meditation': '🧘',
  'Yoga': '🧘‍♀️',
  'pedicure': '🦶',
  'Manicure': '💅',
  'Sauna': '🔥',
};

export function interestIcon(name: string): string {
  return ICONS[name] || interestCategory(name)?.emoji || '✨';
}
