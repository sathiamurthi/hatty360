import { Request, Response } from 'express';
import { query } from '../db/db';

// Login with phone number
export async function login(req: Request, res: Response) {
  const { phone, password } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // SuperAdmin override check
  if (phone === 'superadmin@demandgeniusai.com') {
    if (password !== 'Admin@123') {
      return res.status(401).json({ error: 'Incorrect credentials for SuperAdmin.' });
    }
    try {
      let result = await query('SELECT u.*, h.name as hatty_name FROM users u LEFT JOIN hattys h ON u.hatty_id = h.id WHERE u.email = $1', [phone]);
      if (result.rows.length === 0) {
        // Auto-seed if missing
        await query(
          "INSERT INTO users (phone, name, email, role, status, selected_language) VALUES ('0000000000', 'Super Admin', 'superadmin@demandgeniusai.com', 'SuperAdmin', 'approved', 'en')"
        );
        result = await query('SELECT u.*, h.name as hatty_name FROM users u LEFT JOIN hattys h ON u.hatty_id = h.id WHERE u.email = $1', [phone]);
      }
      return res.json({ status: 'approved', user: result.rows[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
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
  const { phone, hatty_id, gender, father_name, mother_name, profession, location, selected_language, name, email, show_contact_publicly } = req.body;
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
        selected_language = COALESCE($7, selected_language),
        name = COALESCE($8, name),
        email = COALESCE($9, email),
        show_contact_publicly = COALESCE($10, show_contact_publicly)
       WHERE phone = $11 RETURNING *`,
      [
        hatty_id, 
        gender, 
        father_name, 
        mother_name, 
        profession, 
        location, 
        selected_language, 
        name, 
        email, 
        show_contact_publicly !== undefined ? show_contact_publicly : null, 
        phone
      ]
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

// --- Privacy & Contact Request Handlers ---

export async function getContactRequests(req: Request, res: Response) {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const result = await query(`
      SELECT cr.*, u.name as requester_name, u.phone as requester_phone, u.profession as requester_profession, h.name as requester_hatty_name
      FROM contact_requests cr
      JOIN users u ON cr.requester_id = u.id
      LEFT JOIN hattys h ON u.hatty_id = h.id
      WHERE cr.requested_id = $1 AND cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `, [userId]);
    res.json({ requests: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleContactRequestAction(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  try {
    const result = await query(
      'UPDATE contact_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    res.json({ success: true, request: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function requestContactAccess(req: Request, res: Response) {
  const { requester_id, requested_id } = req.body;
  if (!requester_id || !requested_id) {
    return res.status(400).json({ error: 'Requester ID and Requested ID are required' });
  }
  try {
    const result = await query(
      `INSERT INTO contact_requests (requester_id, requested_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (requester_id, requested_id) 
       DO UPDATE SET status = 'pending'
       RETURNING *`,
      [requester_id, requested_id]
    );
    res.status(201).json({ success: true, request: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUserContactStatus(req: Request, res: Response) {
  const { requester_id, requested_id } = req.query;
  if (!requested_id) {
    return res.status(400).json({ error: 'Requested ID is required' });
  }
  try {
    // 1. Fetch user public contact state
    const userRes = await query('SELECT show_contact_publicly, phone, email, name, role FROM users WHERE id = $1', [requested_id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const targetUser = userRes.rows[0];

    // If requester is not provided, we just return public visibility state
    if (!requester_id) {
      if (targetUser.show_contact_publicly) {
        return res.json({ status: 'visible', phone: targetUser.phone, email: targetUser.email });
      }
      return res.json({ status: 'hidden' });
    }

    // 2. If requester is same as requested user, they can see their own info
    if (String(requester_id) === String(requested_id)) {
      return res.json({ status: 'visible', phone: targetUser.phone, email: targetUser.email });
    }

    // 3. If requester is Admin or SuperAdmin, they can always view contacts
    const requesterRes = await query('SELECT role FROM users WHERE id = $1', [requester_id]);
    const requesterRole = requesterRes.rows[0]?.role;
    if (requesterRole === 'Admin' || requesterRole === 'SuperAdmin') {
      return res.json({ status: 'visible', phone: targetUser.phone, email: targetUser.email });
    }

    // 4. If target user has contact publicly visible, show it
    if (targetUser.show_contact_publicly) {
      return res.json({ status: 'visible', phone: targetUser.phone, email: targetUser.email });
    }

    // 5. Check if there is an approved access request
    const requestRes = await query(
      'SELECT status FROM contact_requests WHERE requester_id = $1 AND requested_id = $2',
      [requester_id, requested_id]
    );

    if (requestRes.rows.length > 0) {
      const reqStatus = requestRes.rows[0].status;
      if (reqStatus === 'approved') {
        return res.json({ status: 'visible', phone: targetUser.phone, email: targetUser.email });
      }
      return res.json({ status: reqStatus }); // 'pending' or 'rejected'
    }

    res.json({ status: 'none' }); // No request exists yet
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
