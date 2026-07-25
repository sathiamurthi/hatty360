import { Request, Response } from 'express';
import { query } from '../db/db';

// Login with phone number
export async function login(req: Request, res: Response) {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const result = await query('SELECT u.*, h.name as hatty_name FROM users u LEFT JOIN hattys h ON u.hatty_id = h.id WHERE u.phone = $1', [phone]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'not_found', message: 'User not registered' });
    }

    const user = result.rows[0];
    if (user.status === 'pending') {
      return res.status(200).json({ status: 'pending', user, message: 'Your registration is pending approval from your Hatty Thalaivar.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ status: 'suspended', message: 'Your account has been suspended by the administrator.' });
    }

    res.json({ status: 'approved', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Register (minimal: full name + phone)
export async function register(req: Request, res: Response) {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone number are required' });
  }

  try {
    // Check if user already exists
    const checkUser = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Default status is 'pending'
    const result = await query(
      'INSERT INTO users (name, phone, status, role) VALUES ($1, $2, \'pending\', \'Member\') RETURNING *',
      [name, phone]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Complete profile
export async function updateProfile(req: Request, res: Response) {
  const { phone, hatty_id, gender, father_name, mother_name, profession, location, selected_language } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required to locate profile' });
  }

  try {
    const result = await query(
      `UPDATE users SET 
        hatty_id = COALESCE($1, hatty_id), 
        gender = COALESCE($2, gender), 
        father_name = COALESCE($3, father_name), 
        mother_name = COALESCE($4, mother_name), 
        profession = COALESCE($5, profession), 
        location = COALESCE($6, location),
        selected_language = COALESCE($7, selected_language)
       WHERE phone = $8 RETURNING *`,
      [hatty_id, gender, father_name, mother_name, profession, location, selected_language, phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Refresh user with hatty name
    const userRes = await query('SELECT u.*, h.name as hatty_name FROM users u LEFT JOIN hattys h ON u.hatty_id = h.id WHERE u.phone = $1', [phone]);

    res.json({ user: userRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Admin approves a pending registration
export async function approveUser(req: Request, res: Response) {
  const { userId, status } = req.body; // status: 'approved' or 'suspended'
  if (!userId || !status) {
    return res.status(400).json({ error: 'User ID and status are required' });
  }

  try {
    const result = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Admin / self role update (for testing convenience)
export async function updateRole(req: Request, res: Response) {
  const { userId, role } = req.body; // 'Member', 'Thalaivar', 'Secretary', 'Finance Secretary', 'Admin'
  if (!userId || !role) {
    return res.status(400).json({ error: 'User ID and role are required' });
  }

  try {
    const result = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Get list of pending users for approval by hatty
export async function getPendingUsers(req: Request, res: Response) {
  const { hattyId } = req.query;
  try {
    let result;
    if (hattyId) {
      result = await query('SELECT u.*, h.name as hatty_name FROM users u JOIN hattys h ON u.hatty_id = h.id WHERE u.status = \'pending\' AND u.hatty_id = $1', [hattyId]);
    } else {
      result = await query('SELECT u.*, h.name as hatty_name FROM users u JOIN hattys h ON u.hatty_id = h.id WHERE u.status = \'pending\'');
    }
    res.json({ pendingUsers: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Get all hattys
export async function getHattys(req: Request, res: Response) {
  try {
    const result = await query('SELECT * FROM hattys ORDER BY name ASC');
    res.json({ hattys: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
