export function quickReadabilityCheck(body_en: string) {
  const sentences = body_en.split(/[.!?]+/).filter(Boolean);
  const words = body_en.split(/\s+/).filter(Boolean);
  const wpm = 150;
  const minutes = Math.max(1, Math.round(words.length / wpm));
  const avgSentenceLen = words.length / Math.max(1, sentences.length);
  const okLength = words.length >= 1600 && words.length <= 2400;
  const okSentence = avgSentenceLen <= 24; // B1–B2 הֶיוּריסטיקה
  return {
    words: words.length,
    minutes,
    avgSentenceLen: Math.round(avgSentenceLen * 10) / 10,
    ok: okLength && okSentence
  };
}
