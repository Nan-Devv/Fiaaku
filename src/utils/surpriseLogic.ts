export interface VoiceCandidate {
  name: string;
  lang: string;
  localService?: boolean;
}

export type GameItemType = 'SUNBEAM' | 'FIREFLY' | 'PETAL' | 'MAGNET' | 'CLOUD';

export interface CatchOutcome {
  nextScore: number;
  nextCombo: number;
  nextLives: number;
  gainedPoints: number;
  multiplier: number;
  flowersToGrow: number;
  activateMagnetSeconds: number;
  unlockedReward: boolean;
  isPenalty: boolean;
}

/**
 * Validasi 8-digit passcode gerbang taman rahasia.
 */
export function validatePasscode(input: string, target: string): {
  isComplete: boolean;
  isValid: boolean;
} {
  const sanitized = input.replace(/\D/g, '');
  const isComplete = sanitized.length === target.length;
  return {
    isComplete,
    isValid: isComplete && sanitized === target
  };
}

/**
 * Memilih suara pria (cowok) paling natural dari daftar SpeechSynthesisVoice.
 * Memprioritaskan bahasa Indonesia pria (mis. Ardi, Andika, Rizky, Budi),
 * menghindari suara wanita yang teridentifikasi eksplisit, dan menyediakan fallback bariton.
 */
export function selectBestMaleVoice<T extends VoiceCandidate>(voices: T[]): {
  voice: T | null;
  pitch: number;
  rate: number;
} {
  if (!voices || voices.length === 0) {
    return { voice: null, pitch: 0.74, rate: 0.88 };
  }

  const maleKeywords = [
    'ardi',
    'andika',
    'rizky',
    'budi',
    'dimas',
    'male',
    'pria',
    'laki',
    'man',
    'david',
    'daniel',
    'mark',
    'alex',
    'george',
    'arthur',
    'ryan',
    'guy',
    'christopher',
    'andrew',
    'brian',
    'matthew',
    'thomas'
  ];

  const femaleKeywords = [
    'gadis',
    'damayanti',
    'siti',
    'wati',
    'putri',
    'female',
    'wanita',
    'perempuan',
    'woman',
    'zira',
    'hazel',
    'susan',
    'aria',
    'jenny',
    'samantha',
    'victoria',
    'karen',
    'moira',
    'tessa',
    'fiona',
    'amelia',
    'siri'
  ];

  let bestVoice: T | null = null;
  let bestScore = -999;

  for (const v of voices) {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();

    let score = 0;
    const isIndonesian = lang === 'id-id' || lang.startsWith('id');
    const isMalay = lang.startsWith('ms');

    if (isIndonesian) score += 100;
    else if (isMalay) score += 35;

    const hasMaleHint = maleKeywords.some((kw) => name.includes(kw));
    const hasFemaleHint = femaleKeywords.some((kw) => name.includes(kw));

    if (hasMaleHint) score += 60;
    if (hasFemaleHint) score -= 85;
    if (name.includes('natural') || name.includes('online')) score += 12;

    if (score > bestScore) {
      bestScore = score;
      bestVoice = v;
    }
  }

  const chosenName = bestVoice?.name.toLowerCase() ?? '';
  const chosenExplicitlyMale = maleKeywords.some((kw) => chosenName.includes(kw));
  const chosenExplicitlyFemale = femaleKeywords.some((kw) => chosenName.includes(kw));

  // Jika suara yang tersedia ternyata tidak berlabel pria eksplisit, turunkan pitch ke register bariton hangat
  const pitch = chosenExplicitlyMale ? 0.84 : chosenExplicitlyFemale ? 0.66 : 0.74;
  const rate = 0.88;

  return { voice: bestVoice, pitch, rate };
}

/**
 * Menghitung multiplier combo pada mini-game Taman Cahaya.
 */
export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 5;
  if (combo >= 6) return 3;
  if (combo >= 3) return 2;
  return 1;
}

/**
 * Menghitung hasil tangkapan item di mini-game Taman Cahaya & Kupu-Kupu Emas.
 */
export function computeCatchResult(params: {
  itemType: GameItemType;
  currentScore: number;
  currentCombo: number;
  currentLives: number;
  alreadyUnlockedReward: boolean;
  rewardThreshold?: number;
}): CatchOutcome {
  const {
    itemType,
    currentScore,
    currentCombo,
    currentLives,
    alreadyUnlockedReward,
    rewardThreshold = 200
  } = params;

  if (itemType === 'CLOUD') {
    const nextLives = Math.max(0, currentLives - 1);
    return {
      nextScore: currentScore,
      nextCombo: 0,
      nextLives,
      gainedPoints: 0,
      multiplier: 1,
      flowersToGrow: 0,
      activateMagnetSeconds: 0,
      unlockedReward: alreadyUnlockedReward,
      isPenalty: true
    };
  }

  const nextCombo = currentCombo + 1;
  const multiplier = getComboMultiplier(nextCombo);

  let basePoints = 10;
  let bonusFlowers = 0;
  let activateMagnetSeconds = 0;

  if (itemType === 'FIREFLY') {
    basePoints = 25;
  } else if (itemType === 'PETAL') {
    basePoints = 35;
    bonusFlowers = 1;
  } else if (itemType === 'MAGNET') {
    basePoints = 20;
    activateMagnetSeconds = 5;
  }

  const gainedPoints = basePoints * multiplier;
  const nextScore = currentScore + gainedPoints;

  const prevFlowerMilestones = Math.floor(currentScore / 25);
  const nextFlowerMilestones = Math.floor(nextScore / 25);
  const milestoneFlowers = Math.max(0, nextFlowerMilestones - prevFlowerMilestones);

  return {
    nextScore,
    nextCombo,
    nextLives: currentLives,
    gainedPoints,
    multiplier,
    flowersToGrow: milestoneFlowers + bonusFlowers,
    activateMagnetSeconds,
    unlockedReward: alreadyUnlockedReward || nextScore >= rewardThreshold,
    isPenalty: false
  };
}

/**
 * Menghitung progres menuju pembukaan kupon kejutan ulang tahun.
 */
export function computeRewardProgress(
  score: number,
  targetScore = 200
): {
  current: number;
  target: number;
  percent: number;
  remaining: number;
  isUnlocked: boolean;
} {
  const safeTarget = Math.max(1, targetScore);
  const safeScore = Math.max(0, score);
  const percent = Math.min(100, Math.round((safeScore / safeTarget) * 100));
  const remaining = Math.max(0, safeTarget - safeScore);
  return {
    current: safeScore,
    target: safeTarget,
    percent,
    remaining,
    isUnlocked: safeScore >= safeTarget
  };
}

/**
 * Menghitung rasio transisi langit taman (0 = sore keemasan, 1 = senja berbintang romantis).
 */
export function getTwilightBlend(score: number, targetScore = 200): number {
  if (targetScore <= 0) return 0;
  return Math.max(0, Math.min(1, score / targetScore));
}

