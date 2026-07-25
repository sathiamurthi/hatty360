import { Request, Response } from 'express';
import { query } from '../db/db';

// --- Fundraising Campaigns & Donations ---

export async function getCampaigns(req: Request, res: Response) {
  try {
    const result = await query(`
      SELECT c.*, h.name as hatty_name 
      FROM fundraising_campaigns c 
      LEFT JOIN hattys h ON c.hatty_id = h.id
      ORDER BY c.id ASC
    `);
    res.json({ campaigns: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCampaign(req: Request, res: Response) {
  const { title, description, target_amount, type, hatty_id } = req.body;
  if (!title || !description || !target_amount || !type) {
    return res.status(400).json({ error: 'Title, description, target amount, and type are required' });
  }

  try {
    const result = await query(
      `INSERT INTO fundraising_campaigns (title, description, target_amount, raised_amount, type, hatty_id) 
       VALUES ($1, $2, $3, 0.00, $4, $5) RETURNING *`,
      [title, description, target_amount, type, hatty_id || null]
    );
    res.status(201).json({ success: true, campaign: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCampaignDetails(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const campaignRes = await query(`
      SELECT c.*, h.name as hatty_name 
      FROM fundraising_campaigns c 
      LEFT JOIN hattys h ON c.hatty_id = h.id 
      WHERE c.id = $1
    `, [id]);

    if (campaignRes.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const donationsRes = await query(`
      SELECT d.*, u.name as user_name 
      FROM donations d 
      LEFT JOIN users u ON d.user_id = u.id 
      WHERE d.campaign_id = $1 
      ORDER BY d.created_at DESC
    `, [id]);

    res.json({
      campaign: campaignRes.rows[0],
      donations: donationsRes.rows
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Log a donation (called after mock UPI flow completes successfully)
export async function createDonation(req: Request, res: Response) {
  const { campaign_id, user_id, amount, donor_name, hatty_id } = req.body;
  if (!campaign_id || !amount || !donor_name) {
    return res.status(400).json({ error: 'Campaign ID, amount, and donor name are required' });
  }

  const txnId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

  try {
    // 1. Insert donation record
    const donationRes = await query(
      `INSERT INTO donations (campaign_id, user_id, amount, transaction_id, donor_name, hatty_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [campaign_id, user_id || null, amount, txnId, donor_name, hatty_id || null]
    );

    // 2. Update campaign raised amount
    await query(
      'UPDATE fundraising_campaigns SET raised_amount = raised_amount + $1 WHERE id = $2',
      [amount, campaign_id]
    );

    // 3. Get updated campaign
    const updatedCampaign = await query('SELECT * FROM fundraising_campaigns WHERE id = $1', [campaign_id]);

    res.status(201).json({
      success: true,
      donation: donationRes.rows[0],
      campaign: updatedCampaign.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// --- Women's Groups (SHG) ---

export async function getWomensGroups(req: Request, res: Response) {
  const { hatty_id } = req.query;
  try {
    let sql = `
      SELECT g.*, h.name as hatty_name, u.name as head_name 
      FROM womens_groups g 
      LEFT JOIN hattys h ON g.hatty_id = h.id 
      LEFT JOIN users u ON g.head_id = u.id
    `;
    const params = [];
    if (hatty_id) {
      sql += ' WHERE g.hatty_id = $1';
      params.push(parseInt(hatty_id as string));
    }
    sql += ' ORDER BY g.created_at DESC';

    const result = await query(sql, params);
    res.json({ groups: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function proposeWomensGroup(req: Request, res: Response) {
  const { name, hatty_id, head_id, monthly_savings_amt } = req.body;
  if (!name || !hatty_id || !head_id) {
    return res.status(400).json({ error: 'Group name, Hatty, and Head member are required' });
  }

  try {
    // Propose group (status default is pending or approved - let's set to approved for simplicity or pending)
    const result = await query(
      `INSERT INTO womens_groups (name, hatty_id, head_id, monthly_savings_amt, status) 
       VALUES ($1, $2, $3, $4, 'approved') RETURNING *`,
      [name, hatty_id, head_id, monthly_savings_amt || 500.00]
    );
    res.status(201).json({ group: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getShgLedger(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const ledgerRes = await query(`
      SELECT l.*, u.name as user_name 
      FROM shg_ledger l 
      LEFT JOIN users u ON l.user_id = u.id 
      WHERE l.group_id = $1 
      ORDER BY l.log_date DESC, l.id DESC
    `, [id]);

    const statsRes = await query(`
      SELECT 
        SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END) as total_savings,
        SUM(CASE WHEN type = 'loan_disbursement' THEN amount ELSE 0 END) as total_loans,
        SUM(CASE WHEN type = 'loan_repayment' THEN amount ELSE 0 END) as total_repayments
      FROM shg_ledger 
      WHERE group_id = $1
    `, [id]);

    const stats = statsRes.rows[0];
    const balance = (parseFloat(stats.total_savings || 0) + parseFloat(stats.total_repayments || 0)) - parseFloat(stats.total_loans || 0);

    res.json({
      ledger: ledgerRes.rows,
      summary: {
        totalSavings: parseFloat(stats.total_savings || 0),
        totalLoans: parseFloat(stats.total_loans || 0),
        totalRepayments: parseFloat(stats.total_repayments || 0),
        balance: balance
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function logShgTransaction(req: Request, res: Response) {
  const { id } = req.params; // Group ID
  const { user_id, type, amount } = req.body; // type: 'savings', 'loan_disbursement', 'loan_repayment'
  if (!user_id || !type || !amount) {
    return res.status(400).json({ error: 'User ID, transaction type, and amount are required' });
  }

  try {
    const result = await query(
      'INSERT INTO shg_ledger (group_id, user_id, type, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, user_id, type, amount]
    );
    res.status(201).json({ transaction: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
