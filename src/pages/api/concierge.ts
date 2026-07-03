import type { NextApiRequest, NextApiResponse } from 'next';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  const { messages, lang } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  // Only accept well-formed user/assistant turns, capped to the last 12
  const history = messages
    .filter(
      (m: any) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim()
    )
    .slice(-12)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (history.length === 0) {
    return res.status(400).json({ error: 'No valid messages' });
  }

  const replyLang = lang === 'en' ? 'inglese' : 'italiano';
  const systemPrompt = `Sei il Concierge AI di Nomaq, assistente di viaggio personale premium. Rispondi nella lingua usata dal cliente (default: ${replyLang}).
Sei un esperto di viaggi di livello mondiale: ristoranti e locali (consiglia SOLO posti veri ed esistenti, con nome e zona), itinerari, trasporti locali, documenti e visti, traduzioni utili, meteo tipico, imprevisti di viaggio.
Stile: caldo, concreto, professionale. Risposte brevi (max ~120 parole), dritte al punto, con 1-3 suggerimenti specifici quando consigli posti. Usa qualche emoji con parsimonia.
Formato: SOLO testo semplice, NIENTE markdown (niente asterischi, grassetti, titoli o cancelletti). Per gli elenchi usa un trattino a inizio riga.
Se la domanda non riguarda i viaggi, riportala con gentilezza al tema viaggi. Non inventare prenotazioni o dati personali del cliente. Non fornire consigli medici o legali dettagliati: per quelli rimanda a professionisti.`;

  try {
    const dsRes = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      // Node fetch has no default timeout: don't let a hung DeepSeek call
      // block the API route worker forever.
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.6,
        max_tokens: 600,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
      }),
    });

    if (!dsRes.ok) {
      const errText = await dsRes.text().catch(() => '');
      throw new Error(`DeepSeek API error ${dsRes.status}: ${errText.slice(0, 200)}`);
    }

    const json = await dsRes.json();
    const reply = json.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty DeepSeek response');

    return res.status(200).json({ reply: String(reply).trim() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
