function filled(v: any): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') {
    const s = v.trim();
    return s !== '' && s !== '—' && s !== '-';
  }
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

export function profileCompletion(p: any): number {
  if (!p) return 0;
  const photos = p.photos?.length || 0;
  const interests = p.interests?.length || 0;
  let s = 0;
  s += photos >= 3 ? 12 : photos >= 2 ? 9 : photos >= 1 ? 6 : 0;
  s += filled(p.bio) ? 12 : 0;
  s += interests >= 5 ? 10 : interests >= 3 ? 8 : interests >= 2 ? 6 : interests >= 1 ? 4 : 0;
  s += filled(p.gender) ? 6 : 0;
  s += filled(p.interestedIn) ? 6 : 0;
  s += filled(p.dateOfBirth) ? 6 : 0;
  s += filled(p.city) ? 6 : 0;
  s += filled(p.courseOfStudy) ? 6 : 0;
  s += filled(p.institution) ? 6 : 0;
  s += filled(p.occupation) ? 6 : 0;
  s += filled(p.relationshipGoals) ? 6 : 0;
  s += filled(p.ageRange) ? 6 : 0;
  s += filled(p.maxDistance) ? 6 : 0;
  s += filled(p.wantsKids) ? 6 : 0;
  return s;
}

export function profileCompletionMissing(p: any): string[] {
  if (!p) return [];
  const missing: string[] = [];
  const photos = p.photos?.length || 0;
  const interests = p.interests?.length || 0;
  if (photos < 3) missing.push(photos > 0 ? `Add ${3 - photos} more photo${photos >= 2 ? '' : 's'} (need 3)` : 'Add at least 3 photos');
  if (!filled(p.bio)) missing.push('Write a bio');
  if (interests < 5) missing.push(interests > 0 ? `Add ${5 - interests} more interest${interests >= 4 ? '' : 's'} (need 5)` : 'Select at least 5 interests');
  const labels: Array<[string, string]> = [
    ['gender', 'Set your gender'],
    ['interestedIn', 'Choose who you are interested in'],
    ['dateOfBirth', 'Set your date of birth'],
    ['city', 'Add your location'],
    ['courseOfStudy', 'Add your course of study'],
    ['institution', 'Add your institution'],
    ['occupation', 'Add your occupation'],
    ['relationshipGoals', 'Choose your relationship goal'],
    ['ageRange', 'Set your preferred age range'],
    ['maxDistance', 'Set your preferred distance'],
    ['wantsKids', 'Set your kids preference'],
  ];
  for (const [k, label] of labels) {
    if (!filled(p[k])) missing.push(label);
  }
  return missing;
}