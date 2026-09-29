import { pinyin } from 'pinyin-pro';

/**
 * Detects tone number (1-5) from accented pinyin syllable.
 */
export function getToneFromPinyin(pinyinSyllable: string): 1 | 2 | 3 | 4 | 5 {
  if (!pinyinSyllable) return 5;
  const s = pinyinSyllable.toLowerCase();

  // 1st tone (flat)
  if (/[āēīōūǖ]/.test(s)) return 1;
  // 2nd tone (rising)
  if (/[áéíóúǘ]/.test(s)) return 2;
  // 3rd tone (dip-rise)
  if (/[ǎěǐǒǔǚ]/.test(s)) return 3;
  // 4th tone (falling)
  if (/[àèìòùǜ]/.test(s)) return 4;

  return 5;
}

/**
 * Converts a Chinese phrase into complete pinyin with tones.
 */
export function getPhrasePinyin(phrase: string): string {
  try {
    return pinyin(phrase, { toneType: 'symbol', type: 'string' });
  } catch (e) {
    return '';
  }
}

/**
 * Gets the pinyin for a single character.
 */
export function getSingleCharPinyin(char: string): string {
  try {
    return pinyin(char, { toneType: 'symbol', type: 'string' });
  } catch (e) {
    return '';
  }
}
