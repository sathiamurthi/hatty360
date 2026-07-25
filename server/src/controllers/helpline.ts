import { Request, Response } from 'express';
import { query } from '../db/db';

export async function getHelplines(req: Request, res: Response) {
  const { hatty_id } = req.query;
  try {
    let sql = `
      SELECT hc.*, h.name as hatty_name, u.name as creator_name
      FROM helpline_contacts hc
      LEFT JOIN hattys h ON hc.hatty_id = h.id
      LEFT JOIN users u ON hc.created_by = u.id
    `;
    const params: any[] = [];
    if (hatty_id) {
      sql += ` WHERE hc.hatty_id = $1 OR hc.hatty_id IS NULL`;
      params.push(hatty_id);
    }
    sql += ` ORDER BY hc.hatty_id NULLS FIRST, hc.created_at DESC`;

    const result = await query(sql, params);
    res.json({ helplines: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createHelpline(req: Request, res: Response) {
  const { contact_person, phone, purpose, hatty_id, created_by } = req.body;
  if (!contact_person || !phone || !purpose) {
    return res.status(400).json({ error: 'Contact person, phone number, and purpose/service details are required' });
  }

  try {
    const result = await query(
      `INSERT INTO helpline_contacts (contact_person, phone, purpose, hatty_id, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [contact_person, phone, purpose, hatty_id || null, created_by || null]
    );
    res.status(201).json({ success: true, helpline: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteHelpline(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM helpline_contacts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Helpline contact not found' });
    }
    res.json({ success: true, message: 'Helpline contact deleted successfully', contact: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
