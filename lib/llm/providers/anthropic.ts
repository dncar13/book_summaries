import type { ModelProvider } from '../provider';

export const anthropicProvider: ModelProvider = {
  name: 'anthropic',
  maxConcurrent: parseInt(process.env.ANTHROPIC_MAX_CONCURRENCY ?? '4', 10),
  async callJSON({ system, user }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20240620';
    const max_tokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS ?? '4096', 10);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        system,
        max_tokens,
        messages: [{ role: 'user', content: user + '\nReturn ONLY JSON.' }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = (data?.content || [])
      .map((c: any) => (c.type === 'text' ? c.text : ''))
      .join('\n')
      .trim();

    if (!text) throw new Error('Anthropic: empty content');
    return text;
  }
};
