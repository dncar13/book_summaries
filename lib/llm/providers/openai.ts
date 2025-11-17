import type { ModelProvider } from '../provider';

export const openAIProvider: ModelProvider = {
  name: 'openai',
  maxConcurrent: parseInt(process.env.OPENAI_MAX_CONCURRENCY ?? '4', 10),
  async callJSON({ system, user }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY missing');
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.7');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        response_format: { type: 'json_object' },
        temperature
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI ${res.status}: ${errText}`);
    }
    const data = await res.json();
    const msg = data?.choices?.[0]?.message?.content;
    if (!msg) throw new Error('OpenAI: empty content');
    return msg.trim();
  }
};
