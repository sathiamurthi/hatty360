import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../db/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- Issues & Escalations ---

export async function getIssues(req: Request, res: Response) {
  const { user_id, role, hatty_id } = req.query;

  try {
    let sql = `
      SELECT i.*, u.name as reporter_name, h.name as hatty_name 
      FROM issues i 
      LEFT JOIN users u ON i.reporter_id = u.id 
      LEFT JOIN hattys h ON i.hatty_id = h.id
    `;
    const params: any[] = [];

    // Role-based visibility
    if (role === 'Admin') {
      // Admin sees everything
    } else if (role === 'Thalaivar' || role === 'Secretary' || role === 'Finance Secretary') {
      // Sees within their hatty or escalated issues
      sql += ' WHERE i.hatty_id = $1 OR i.escalated_to_admin = TRUE';
      params.push(parseInt(hatty_id as string));
    } else {
      // Normal member sees only their own reported issues (respecting optional anonymity in logs)
      sql += ' WHERE i.reporter_id = $1';
      params.push(parseInt(user_id as string));
    }

    sql += ' ORDER BY i.created_at DESC';
    const result = await query(sql, params);
    res.json({ issues: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createIssue(req: Request, res: Response) {
  const { reporter_id, title, description, type, is_anonymous, hatty_id } = req.body;
  if (!reporter_id || !title || !description || !type || !hatty_id) {
    return res.status(400).json({ error: 'Missing required issue fields' });
  }

  try {
    const result = await query(
      `INSERT INTO issues (reporter_id, title, description, type, is_anonymous, hatty_id, escalated_to_admin, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'reported') RETURNING *`,
      [
        reporter_id,
        title,
        description,
        type, // 'within_hatty', 'community_wide'
        is_anonymous || false,
        hatty_id,
        type === 'community_wide' // Auto-escalate if marked community_wide at creation
      ]
    );
    res.status(201).json({ issue: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function escalateIssue(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await query(
      'UPDATE issues SET escalated_to_admin = TRUE, status = \'investigating\' WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ success: true, issue: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function resolveIssue(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await query(
      'UPDATE issues SET status = \'resolved\' WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ success: true, issue: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// AI-powered Formal Letter Composition for authorities
export async function composeAuthorityLetter(req: Request, res: Response) {
  const { id } = req.params;
  const { language, authorityName, authorityDesignation, authorityAddress } = req.body; // 'en' or 'ta'

  try {
    const result = await query('SELECT i.*, h.name as hatty_name FROM issues i LEFT JOIN hattys h ON i.hatty_id = h.id WHERE i.id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = result.rows[0];
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let addressee = authorityName || 'The District Collector / Block Development Officer';
    let designation = authorityDesignation || 'Local Panchayat Authority';
    let address = authorityAddress || `${issue.hatty_name} Panchayat Office, Nilgiris District, Tamil Nadu`;

    // Prompt Gemini to compose a highly formal petition letter
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert administrative assistant helping draft an official representation to local Indian government authorities (like BDO, Collector, or Panchayat).
      
      Compose a highly formal petition letter based on this community grievance:
      ---
      ISSUE TITLE: ${issue.title}
      ISSUE DESCRIPTION: ${issue.description}
      HATTY AFFILIATE: ${issue.hatty_name} Hatty
      DATE: ${dateStr}
      ADDRESSEE NAME: ${addressee}
      DESIGNATION: ${designation}
      ADDRESS: ${address}
      ---
      
      INSTRUCTIONS:
      1. Write the letter in a highly formal, petition-style formatting.
      2. The letter must be in "${language === 'ta' ? 'Tamil' : 'English'}".
      3. Return ONLY a valid JSON object with exactly three keys: "subject" (formal subject line), "body" (the polite, formal description of the issue and request for action), and "closing" (the closing subscription, e.g. "Yours faithfully, On behalf of Kethorai Hatty"). Do not wrap in markdown code blocks.
    `;

    const response = await model.generateContent(prompt);
    const rawText = response.response.text().trim();
    
    let parsed;
    try {
      const jsonText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      parsed = JSON.parse(jsonText);
    } catch {
      // Fallback if parsing fails
      parsed = {
        subject: language === 'ta' 
          ? `மனு: ${issue.title}` 
          : `Representation regarding: ${issue.title}`,
        body: language === 'ta'
          ? `மதிப்பிற்குரிய ஐயா/அம்மா,\n\nஎங்கள் ${issue.hatty_name} கிராமப் பகுதியில் நிலவும் பின்வரும் பிரச்சனையைத் தங்களின் கவனத்திற்குக் கொண்டுவருகிறோம்: ${issue.description}. தாங்கள் உடனடியாக நடவடிக்கை எடுக்குமாறு கேட்டுக்கொள்கிறோம்.`
          : `Respected Sir/Madam,\n\nWe bring to your kind attention that the residents of ${issue.hatty_name} Hatty are facing a serious issue: ${issue.description}. We request you to take immediate action.`,
        closing: language === 'ta'
          ? `இப்படிக்கு,\n${issue.hatty_name} கிராம மக்கள் சார்பில்`
          : `Yours faithfully,\nOn behalf of ${issue.hatty_name} Hatty`
      };
    }

    const letter = {
      date: dateStr,
      from: language === 'ta' 
        ? `அறங்காவலர் குழு & பொதுமக்கள்\n${issue.hatty_name} கிராமக் கமிட்டி\nநீலகிரி மாவட்டம்` 
        : `The Working Committee & Members\n${issue.hatty_name} Hatty Association\nNilgiris District, Tamil Nadu`,
      to: `${addressee}\n${designation}\n${address}`,
      subject: parsed.subject,
      body: parsed.body,
      closing: parsed.closing
    };

    res.json({ success: true, letter });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- In-App Feedback ---

export async function submitFeedback(req: Request, res: Response) {
  const { user_id, rating, comment, context_action } = req.body;
  if (!rating) {
    return res.status(400).json({ error: 'Star rating is required' });
  }

  try {
    const result = await query(
      'INSERT INTO feedback (user_id, rating, comment, context_action) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id || null, rating, comment || null, context_action || 'general']
    );
    res.status(201).json({ success: true, feedback: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getFeedback(req: Request, res: Response) {
  try {
    const result = await query(`
      SELECT f.*, u.name as user_name, h.name as hatty_name 
      FROM feedback f 
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN hattys h ON u.hatty_id = h.id
      ORDER BY f.created_at DESC
    `);
    res.json({ feedback: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Sponsored Ads ---

export async function getAds(req: Request, res: Response) {
  try {
    const result = await query(`
      SELECT a.*, adv.business_name, adv.category 
      FROM ads a 
      JOIN advertisers adv ON a.advertiser_id = adv.id 
      WHERE a.status = 'approved' AND adv.status = 'approved'
    `);
    res.json({ ads: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitAd(req: Request, res: Response) {
  const { business_name, category, contact_phone, email, title, description, ad_type, price, duration_weeks } = req.body;
  if (!business_name || !contact_phone || !title || !description || !ad_type) {
    return res.status(400).json({ error: 'Missing required advertiser or ad fields' });
  }

  try {
    // 1. Create/Retrieve advertiser
    let advId;
    const checkAdv = await query('SELECT id FROM advertisers WHERE contact_phone = $1', [contact_phone]);
    if (checkAdv.rows.length > 0) {
      advId = checkAdv.rows[0].id;
    } else {
      const advRes = await query(
        'INSERT INTO advertisers (business_name, category, contact_phone, email, status) VALUES ($1, $2, $3, $4, \'pending\') RETURNING id',
        [business_name, category || 'Other', contact_phone, email || '']
      );
      advId = advRes.rows[0].id;
    }

    // 2. Create ad in pending state
    const adRes = await query(
      `INSERT INTO ads (advertiser_id, title, description, ad_type, status, price, duration_weeks) 
       VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING *`,
      [advId, title, description, ad_type, price || 250.00, duration_weeks || 4]
    );

    res.status(201).json({ success: true, ad: adRes.rows[0], message: 'Ad submitted and pending admin approval.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPendingAds(req: Request, res: Response) {
  try {
    const result = await query(`
      SELECT a.*, adv.business_name, adv.category, adv.contact_phone 
      FROM ads a 
      JOIN advertisers adv ON a.advertiser_id = adv.id 
      WHERE a.status = 'pending'
    `);
    res.json({ pendingAds: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function approveAd(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const adRes = await query('UPDATE ads SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (adRes.rows.length === 0) {
      return res.status(404).json({ error: 'Ad listing not found' });
    }

    // Also approve advertiser if they were pending
    const ad = adRes.rows[0];
    if (status === 'approved') {
      await query('UPDATE advertisers SET status = \'approved\' WHERE id = $1', [ad.advertiser_id]);
    }

    res.json({ success: true, ad });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
