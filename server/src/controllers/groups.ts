import { Request, Response } from 'express';
import { query } from '../db/db';

// --- Groups ---

export async function getGroups(req: Request, res: Response) {
  try {
    const result = await query(`
      SELECT g.*, u.name as creator_name,
        (SELECT COUNT(*) FROM threads t WHERE t.group_id = g.id) as thread_count
      FROM community_groups g
      LEFT JOIN users u ON g.created_by = u.id
      ORDER BY g.created_at DESC
    `);
    res.json({ groups: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createGroup(req: Request, res: Response) {
  const { name, description, privacy, created_by } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Group name and description are required' });
  }

  try {
    const result = await query(
      `INSERT INTO community_groups (name, description, privacy, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, privacy || 'public', created_by || null]
    );
    res.status(201).json({ success: true, group: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getGroupDetails(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const groupRes = await query(`
      SELECT g.*, u.name as creator_name
      FROM community_groups g
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.id = $1
    `, [id]);

    if (groupRes.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const threadsRes = await query(`
      SELECT t.*, u.name as author_name,
        (SELECT COUNT(*) FROM thread_replies r WHERE r.thread_id = t.id) as reply_count
      FROM threads t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.group_id = $1
      ORDER BY t.status = 'pinned' DESC, t.created_at DESC
    `, [id]);

    res.json({
      group: groupRes.rows[0],
      threads: threadsRes.rows
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// --- Threads ---

export async function createThread(req: Request, res: Response) {
  const { id: group_id } = req.params;
  const { title, content, created_by } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Thread title and content are required' });
  }

  try {
    const result = await query(
      `INSERT INTO threads (group_id, title, content, status, created_by)
       VALUES ($1, $2, $3, 'active', $4) RETURNING *`,
      [group_id, title, content, created_by || null]
    );
    res.status(201).json({ success: true, thread: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getThreadDetails(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const threadRes = await query(`
      SELECT t.*, u.name as author_name, g.name as group_name
      FROM threads t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN community_groups g ON t.group_id = g.id
      WHERE t.id = $1
    `, [id]);

    if (threadRes.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const repliesRes = await query(`
      SELECT r.*, u.name as author_name, u.role as author_role
      FROM thread_replies r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.thread_id = $1
      ORDER BY r.created_at ASC
    `, [id]);

    res.json({
      thread: threadRes.rows[0],
      replies: repliesRes.rows
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createReply(req: Request, res: Response) {
  const { id: thread_id } = req.params;
  const { content, created_by } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Reply content is required' });
  }

  try {
    const result = await query(
      `INSERT INTO thread_replies (thread_id, content, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [thread_id, content, created_by || null]
    );
    res.status(201).json({ success: true, reply: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateThreadStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'active', 'archived', 'pinned'
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const result = await query(
      'UPDATE threads SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json({ success: true, thread: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
