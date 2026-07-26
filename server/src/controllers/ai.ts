import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../db/db';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function chatbot(req: Request, res: Response) {
  const { message, language, user_id } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const langMap: { [key: string]: string } = {
    en: 'English',
    kn: 'Kannada',
    ta: 'Tamil',
    bd: 'Badaga (using English/Tamil scripts as applicable)'
  };
  const targetLanguage = langMap[language || 'en'] || 'English';

  try {
    // 1. Gather database context to feed the AI (Events, Campaigns, Vachanas)
    const eventsRes = await query('SELECT e.*, h.name as hatty_name FROM events e LEFT JOIN hattys h ON e.hatty_id = h.id WHERE e.event_date >= CURRENT_DATE ORDER BY e.event_date ASC LIMIT 5');
    const campaignsRes = await query('SELECT c.*, h.name as hatty_name FROM fundraising_campaigns c LEFT JOIN hattys h ON c.hatty_id = h.id');
    const vachanasRes = await query('SELECT * FROM vachanas LIMIT 5');

    const dbContext = {
      upcomingEvents: eventsRes.rows.map(e => ({
        title: e.title,
        date: e.event_date,
        time: e.event_time,
        location: e.location,
        hatty: e.hatty_name || 'All Hattys',
        description: e.description
      })),
      fundraisingCampaigns: campaignsRes.rows.map(c => ({
        title: c.title,
        hatty: c.hatty_name || 'Community-wide',
        targetAmount: parseFloat(c.target_amount),
        raisedAmount: parseFloat(c.raised_amount),
        pctRaised: ((parseFloat(c.raised_amount) / parseFloat(c.target_amount)) * 100).toFixed(1) + '%'
      })),
      preSeededVachanas: vachanasRes.rows.map(v => ({
        author: v.author,
        originalKannada: v.text_kannada,
        transliteration: v.transliteration,
        translation: v.text_english,
        explanation: v.explanation
      }))
    };

    // 2. Query Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are the AI Community Assistant for the Hatty360 mobile app, serving the community (organized around 8 hattys in Nilgiris: Kethorai, Jegathala, Balacola, Bikkatti, Kethi, Hubbathalai, Melur, Adigaratty).
      
      Here is the current live app database context for you to answer user queries:
      ---
      DASHBOARD DATABASE STATE:
      ${JSON.stringify(dbContext, null, 2)}
      ---

      INSTRUCTIONS:
      1. Answer the user's question accurately using ONLY the database context provided above.
      2. If the user asks about upcoming events, explain details of events in the context.
      3. If the user asks about temple construction, donations, or campaign progress, quote the target vs raised amount and percentage progress from the context.
      4. If the user asks about a Vachana or teachings of Basavanna/Akka Mahadevi, quote their original text, translation, and explanation from the context.
      5. IMPORTANT: Respond in the requested language: "${targetLanguage}". If the language is Badaga, write it in readable transliterated script.
      6. Keep the response friendly, concise (within 2-4 sentences), and formatted nicely in Markdown.

      User Question: "${message}"
      AI Response:
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ response: text });
  } catch (err: any) {
    console.error('Gemini Chatbot Error:', err);
    res.status(500).json({ error: 'AI processing failed', details: err.message });
  }
}

export async function draftAssist(req: Request, res: Response) {
  const { bulletPoints, type } = req.body;
  if (!bulletPoints) {
    return res.status(400).json({ error: 'Bullet points are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are a professional secretary assistant helping a Hatty Thalaivar (Chief) draft a community announcement or event post.
      
      Create a polished, officially-worded public notice based on the following notes:
      ---
      NOTICE TYPE: ${type === 'event' ? 'Event Invitation' : 'General Community Announcement'}
      NOTES:
      ${bulletPoints}
      ---

      INSTRUCTIONS:
      1. Write the notice in a warm, respectful, and formal tone suitable for community elders and families.
      2. Format the response as a valid JSON object with exactly two keys: "title" (a compelling header, e.g. "📢 Urgently Required: Temple Shramadaan Cleaning") and "draft" (the full body in clean Markdown). Do not wrap the JSON in markdown code blocks.
      3. Include placeholders like [Date], [Time], [Location], or [Contact] if they are missing from the bullets.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    
    // Clean up potential markdown formatting wrapping the JSON
    const jsonText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonText);

    res.json({
      title: parsed.title || 'Official Announcement',
      draft: parsed.draft || rawText,
      note: 'This notice was professionally drafted by Gemini 1.5. Review, edit, and click Publish below.'
    });
  } catch (err: any) {
    console.error('Gemini Draft Assist Error:', err);
    // Fallback if JSON parsing or AI fails
    res.status(200).json({
      title: 'Official Notice Draft',
      draft: `📢 **OFFICIAL ANNOUNCEMENT** 📢\n\nDear Members,\n\nWe would like to share the following community updates:\n\n${bulletPoints.split('\n').map((l: string) => `- ${l}`).join('\n')}\n\nPlease review and publish.`,
      note: 'AI generator fallback triggered due to formatting. Please review.'
    });
  }
}
