export type Token =
  | { type: 'word'; text: string; normalized: string }
  | { type: 'punct'; text: string };

const TRAILING_PUNCTUATION = /[.,!?;:]+$/;
const WORD_TOKEN = /^[A-Za-z]+(?:'[A-Za-z]+)*$/;

export function normalizeWord(input: string): string {
  return input.trim().replace(TRAILING_PUNCTUATION, '').toLowerCase();
}

export function tokenizeParagraph(paragraph: string): Token[] {
  if (!paragraph) {
    return [];
  }

  const tokens: Token[] = [];
  const splitter = /[A-Za-z]+(?:'[A-Za-z]+)*|[^A-Za-z]+/g;
  let match: RegExpExecArray | null;

  while ((match = splitter.exec(paragraph)) !== null) {
    const text = match[0];
    if (!text) continue;

    if (WORD_TOKEN.test(text)) {
      tokens.push({ type: 'word', text, normalized: normalizeWord(text) });
    } else {
      tokens.push({ type: 'punct', text });
    }
  }

  return tokens;
}
