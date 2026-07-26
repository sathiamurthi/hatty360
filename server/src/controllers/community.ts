import { Request, Response } from 'express';
import { query } from '../db/db';

// --- Member Directory ---
export async function getMembers(req: Request, res: Response) {
  const { hatty_id, location, profession, search, requesterId } = req.query;

  try {
    let requesterRole = 'Member';
    if (requesterId) {
      const roleRes = await query('SELECT role FROM users WHERE id = $1', [requesterId]);
      if (roleRes.rows.length > 0) {
        requesterRole = roleRes.rows[0].role;
      }
    }

    let sql = `
      SELECT u.id, u.name, u.gender, u.location, u.profession, u.hatty_id, h.name as hatty_name, u.role, u.created_at, u.show_contact_publicly,
             (SELECT status FROM contact_requests WHERE requester_id = $1 AND requested_id = u.id) as contact_request_status,
             CASE 
               WHEN u.show_contact_publicly = TRUE OR u.id = $1 OR $2 IN ('Admin', 'SuperAdmin') OR (SELECT status FROM contact_requests WHERE requester_id = $1 AND requested_id = u.id) = 'approved' THEN u.phone
               ELSE NULL
             END as phone,
             CASE 
               WHEN u.show_contact_publicly = TRUE OR u.id = $1 OR $2 IN ('Admin', 'SuperAdmin') OR (SELECT status FROM contact_requests WHERE requester_id = $1 AND requested_id = u.id) = 'approved' THEN u.email
               ELSE NULL
             END as email
      FROM users u
      LEFT JOIN hattys h ON u.hatty_id = h.id
      WHERE u.status = 'approved'
    `;
    const params: any[] = [requesterId ? parseInt(requesterId as string) : null, requesterRole];
    let paramIndex = 3;

    if (hatty_id) {
      sql += ` AND u.hatty_id = $${paramIndex++}`;
      params.push(parseInt(hatty_id as string));
    }
    if (location) {
      sql += ` AND u.location ILIKE $${paramIndex++}`;
      params.push(`%${location}%`);
    }
    if (profession) {
      sql += ` AND u.profession ILIKE $${paramIndex++}`;
      params.push(`%${profession}%`);
    }
    if (search) {
      sql += ` AND (u.name ILIKE $${paramIndex} OR u.profession ILIKE $${paramIndex} OR u.location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY u.name ASC';
    const result = await query(sql, params);
    res.json({ members: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Request member phone number (returns the phone number if publicly visible or request approved)
export async function getMemberPhone(req: Request, res: Response) {
  const { id } = req.params;
  const { requesterId, requesterPhone } = req.body; // Logged for audit purposes

  try {
    console.log(`Directory Audit: Phone number of member ID ${id} requested by user ${requesterPhone} (ID: ${requesterId})`);
    
    // Fetch the target user details
    const result = await query('SELECT name, phone, email, show_contact_publicly, role FROM users WHERE id = $1 AND status = \'approved\'', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found or not approved' });
    }
    
    const targetUser = result.rows[0];

    // Check if requester is same as requested user
    if (String(requesterId) === String(id)) {
      return res.json({ name: targetUser.name, phone: targetUser.phone, email: targetUser.email });
    }

    // Check if requester is Admin or SuperAdmin
    if (requesterId) {
      const reqUser = await query('SELECT role FROM users WHERE id = $1', [requesterId]);
      const reqRole = reqUser.rows[0]?.role;
      if (reqRole === 'Admin' || reqRole === 'SuperAdmin') {
        return res.json({ name: targetUser.name, phone: targetUser.phone, email: targetUser.email });
      }
    }

    // Check if target user has public contact visibility
    if (targetUser.show_contact_publicly) {
      return res.json({ name: targetUser.name, phone: targetUser.phone, email: targetUser.email });
    }

    // Check if there is an approved request
    if (requesterId) {
      const requestRes = await query(
        'SELECT status FROM contact_requests WHERE requester_id = $1 AND requested_id = $2',
        [requesterId, id]
      );
      if (requestRes.rows.length > 0 && requestRes.rows[0].status === 'approved') {
        return res.json({ name: targetUser.name, phone: targetUser.phone, email: targetUser.email });
      }
    }

    return res.status(403).json({ error: 'Access Denied. You need to request contact access and wait for approval.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Announcements ---
export async function getAnnouncements(req: Request, res: Response) {
  const { hatty_id } = req.query;

  try {
    let sql = 'SELECT a.*, h.name as hatty_name FROM announcements a LEFT JOIN hattys h ON a.hatty_id = h.id';
    const params: any[] = [];

    if (hatty_id) {
      sql += ' WHERE a.type = \'community\' OR a.hatty_id = $1 OR a.target_hatty_ids IS NULL OR cardinality(a.target_hatty_ids) = 0 OR $1 = ANY(a.target_hatty_ids)';
      params.push(parseInt(hatty_id as string));
    }

    sql += ' ORDER BY a.created_at DESC';
    const result = await query(sql, params);
    res.json({ announcements: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  const { title, content, type, hatty_id, created_by, target_hatty_ids } = req.body;
  if (!title || !content || !created_by) {
    return res.status(400).json({ error: 'Title, content, and author are required' });
  }

  try {
    const result = await query(
      'INSERT INTO announcements (title, content, type, hatty_id, created_by, target_hatty_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, content, type || 'community', hatty_id || null, created_by, target_hatty_ids || null]
    );
    res.status(201).json({ announcement: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Events & RSVPs ---
export async function getEvents(req: Request, res: Response) {
  const { hatty_id } = req.query;

  try {
    let sql = 'SELECT e.*, h.name as hatty_name FROM events e LEFT JOIN hattys h ON e.hatty_id = h.id';
    const params: any[] = [];

    if (hatty_id) {
      sql += ' WHERE e.type = \'community\' OR e.hatty_id = $1 OR e.target_hatty_ids IS NULL OR cardinality(e.target_hatty_ids) = 0 OR $1 = ANY(e.target_hatty_ids)';
      params.push(parseInt(hatty_id as string));
    }

    sql += ' ORDER BY e.event_date ASC';
    const result = await query(sql, params);
    res.json({ events: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createEvent(req: Request, res: Response) {
  const { title, description, event_date, event_time, location, hatty_id, type, created_by, target_hatty_ids } = req.body;
  if (!title || !description || !event_date || !event_time || !location || !created_by) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }

  try {
    const result = await query(
      'INSERT INTO events (title, description, event_date, event_time, location, hatty_id, type, created_by, target_hatty_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, description, event_date, event_time, location, hatty_id || null, type || 'community', created_by, target_hatty_ids || null]
    );
    res.status(201).json({ event: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitRsvp(req: Request, res: Response) {
  const { event_id } = req.params;
  const { user_id, status, guests_count } = req.body;

  if (!user_id || !status) {
    return res.status(400).json({ error: 'User ID and status are required' });
  }

  try {
    // Upsert RSVP
    const checkRsvp = await query('SELECT * FROM rsvps WHERE event_id = $1 AND user_id = $2', [event_id, user_id]);
    
    let result;
    if (checkRsvp.rows.length > 0) {
      result = await query(
        'UPDATE rsvps SET status = $1, guests_count = $2, updated_at = CURRENT_TIMESTAMP WHERE event_id = $3 AND user_id = $4 RETURNING *',
        [status, guests_count || 1, event_id, user_id]
      );
    } else {
      result = await query(
        'INSERT INTO rsvps (event_id, user_id, status, guests_count) VALUES ($1, $2, $3, $4) RETURNING *',
        [event_id, user_id, status, guests_count || 1]
      );
    }

    res.json({ rsvp: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEventRsvps(req: Request, res: Response) {
  const { event_id } = req.params;
  try {
    const result = await query(
      `SELECT r.*, u.name as user_name, u.phone as user_phone, h.name as hatty_name 
       FROM rsvps r 
       JOIN users u ON r.user_id = u.id 
       LEFT JOIN hattys h ON u.hatty_id = h.id 
       WHERE r.event_id = $1`,
      [event_id]
    );
    res.json({ rsvps: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Vachana Library ---
export async function getVachanas(req: Request, res: Response) {
  const { search } = req.query;

  try {
    let sql = 'SELECT * FROM vachanas';
    const params: any[] = [];

    if (search) {
      sql += ' WHERE author ILIKE $1 OR text_kannada ILIKE $1 OR text_english ILIKE $1 OR explanation ILIKE $1';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY author ASC, id ASC';
    const result = await query(sql, params);
    res.json({ vachanas: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createVachana(req: Request, res: Response) {
  const { author, text_kannada, text_english, transliteration, explanation } = req.body;
  
  if (!author || !text_kannada || !text_english) {
    return res.status(400).json({ error: 'Author, Kannada original, and English translation are required.' });
  }

  try {
    const result = await query(
      'INSERT INTO vachanas (author, text_kannada, text_english, transliteration, explanation) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [author, text_kannada, text_english, transliteration || '', explanation || '']
    );
    res.status(201).json({ success: true, vachana: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Help Board ---
export async function getHelpPosts(req: Request, res: Response) {
  const { category } = req.query;

  try {
    let sql = `
      SELECT p.*, u.name as user_name, h.name as hatty_name 
      FROM help_board_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN hattys h ON u.hatty_id = h.id
    `;
    const params: any[] = [];

    if (category) {
      sql += ' WHERE p.category = $1';
      params.push(category);
    }

    sql += ' ORDER BY p.created_at DESC';
    const result = await query(sql, params);
    res.json({ posts: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createHelpPost(req: Request, res: Response) {
  const { user_id, title, content, category, is_anonymous, contact_number } = req.body;
  if (!user_id || !title || !content || !category) {
    return res.status(400).json({ error: 'Missing required help board fields' });
  }

  try {
    const result = await query(
      `INSERT INTO help_board_posts (user_id, title, content, category, is_anonymous, contact_number) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, title, content, category, is_anonymous || false, contact_number || null]
    );
    res.status(201).json({ post: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Mock AI Job Search ---
export async function searchExternalJobs(req: Request, res: Response) {
  const { role, location } = req.query;
  if (!role) {
    return res.status(400).json({ error: 'Job role is required' });
  }

  // Simulating an AI web search for external jobs (e.g. Indeed, Naukri summary)
  const loc = (location as string) || 'Karnataka';
  const roleName = role as string;

  const mockJobs = [
    {
      id: 1,
      title: `${roleName} at Infosys`,
      location: loc,
      company: 'Infosys Limited',
      summary: `Seeking experienced ${roleName} to join our digital transformation unit. Requires experience in modern engineering stacks, strong communication, and problem-solving skills.`,
      source: 'Indeed',
      link: 'https://indeed.com/jobs/infosys-software-engineer'
    },
    {
      id: 2,
      title: `Senior ${roleName} (Contract)`,
      location: loc,
      company: 'Wipro',
      summary: `Contract opening for ${roleName} with 3+ years experience. Hybrid setup, immediate onboarding. Key skills: problem solving, agile workflows.`,
      source: 'Naukri',
      link: 'https://naukri.com/jobs/wipro-senior-engineer'
    },
    {
      id: 3,
      title: `Associate — ${roleName}`,
      location: 'Bengaluru (Remote eligible)',
      company: 'Accenture India',
      summary: `Entry to mid level role for a motivated ${roleName}. Excellent career progression path. Full training provided in specialized tools.`,
      source: 'LinkedIn Jobs',
      link: 'https://linkedin.com/jobs/accenture-associate'
    }
  ];

  setTimeout(() => {
    res.json({
      role: roleName,
      location: loc,
      summary: `AI Search completed. Found 3 relevant external matches for "${roleName}" in ${loc}. Redirect links provided below to submit application via original portals.`,
      listings: mockJobs
    });
  }, 800); // Small artificial delay to feel like a real live search
}

// --- Sponsor Offers ---
export async function getOffers(req: Request, res: Response) {
  const { activeOnly } = req.query;
  try {
    let sql = 'SELECT * FROM sponsor_offers';
    if (activeOnly === 'true') {
      sql += ' WHERE is_active = TRUE';
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql);
    res.json({ offers: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createOffer(req: Request, res: Response) {
  const { business_name, offer_title, offer_description, coupon_code } = req.body;
  if (!business_name || !offer_title) {
    return res.status(400).json({ error: 'Business name and offer title are required.' });
  }
  try {
    const result = await query(
      'INSERT INTO sponsor_offers (business_name, offer_title, offer_description, coupon_code, is_active) VALUES ($1, $2, $3, $4, TRUE) RETURNING *',
      [business_name, offer_title, offer_description || '', coupon_code || '']
    );
    res.status(201).json({ success: true, offer: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleOffer(req: Request, res: Response) {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await query(
      'UPDATE sponsor_offers SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json({ success: true, offer: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteOffer(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM sponsor_offers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// --- Talent Showcase ---
export async function getTalents(req: Request, res: Response) {
  const { search, category } = req.query;
  try {
    let sql = 'SELECT t.*, u.phone as user_phone, u.email as user_email FROM talents t LEFT JOIN users u ON t.user_id = u.id';
    const params: any[] = [];
    const wheres: string[] = [];

    if (category) {
      wheres.push(`t.category = $${wheres.length + 1}`);
      params.push(category);
    }
    if (search) {
      wheres.push(`(t.name ILIKE $${wheres.length + 1} OR t.description ILIKE $${wheres.length + 1} OR t.category ILIKE $${wheres.length + 1})`);
      params.push(`%${search}%`);
    }

    if (wheres.length > 0) {
      sql += ' WHERE ' + wheres.join(' AND ');
    }
    sql += ' ORDER BY t.created_at DESC';

    const result = await query(sql, params);
    res.json({ talents: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createTalent(req: Request, res: Response) {
  const { user_id, name, category, description, contact_info, portfolio_link } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Name, category, and description are required.' });
  }
  try {
    const result = await query(
      'INSERT INTO talents (user_id, name, category, description, contact_info, portfolio_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id || null, name, category, description, contact_info || '', portfolio_link || '']
    );
    res.status(201).json({ success: true, talent: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// --- Life Events ---
export async function getLifeEvents(req: Request, res: Response) {
  const { hatty_id } = req.query;
  try {
    let sql = 'SELECT * FROM life_events';
    const params: any[] = [];
    if (hatty_id) {
      sql += ' WHERE target_hatty_ids IS NULL OR cardinality(target_hatty_ids) = 0 OR $1 = ANY(target_hatty_ids)';
      params.push(parseInt(hatty_id as string));
    }
    sql += ' ORDER BY date_of_event DESC, id DESC';
    const result = await query(sql, params);
    res.json({ lifeEvents: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createLifeEvent(req: Request, res: Response) {
  const { type, person_name, date_of_event, description, target_hatty_ids, created_by } = req.body;
  if (!type || !person_name || !date_of_event || !created_by) {
    return res.status(400).json({ error: 'Missing required life event fields' });
  }
  try {
    const result = await query(
      'INSERT INTO life_events (type, person_name, date_of_event, description, target_hatty_ids, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [type, person_name, date_of_event, description || '', target_hatty_ids || null, created_by]
    );
    res.status(201).json({ success: true, lifeEvent: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
