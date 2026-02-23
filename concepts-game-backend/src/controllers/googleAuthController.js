import pool from '../database/db.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // 1. Verify the Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Google account has no email' });
    }

    // 2. Find user by google_id, then by email, or create new
    let user;

    const byGoogleId = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE google_id = $1',
      [googleId]
    );

    if (byGoogleId.rows.length > 0) {
      user = byGoogleId.rows[0];
    } else {
      const byEmail = await pool.query(
        'SELECT id, username, email, google_id, created_at FROM users WHERE email = $1',
        [email]
      );

      if (byEmail.rows.length > 0) {
        const existing = byEmail.rows[0];
        if (!existing.google_id) {
          await pool.query(
            'UPDATE users SET google_id = $1 WHERE id = $2',
            [googleId, existing.id]
          );
        }
        user = {
          id: existing.id,
          username: existing.username,
          email: existing.email,
          created_at: existing.created_at,
        };
      } else {
        // Create new user with unique username
        let baseUsername = (name || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 40);

        let username = baseUsername;
        let suffix = 1;

        while (true) {
          const conflict = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
          );
          if (conflict.rows.length === 0) break;
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        const result = await pool.query(
          `INSERT INTO users (username, email, password_hash, google_id)
           VALUES ($1, $2, NULL, $3)
           RETURNING id, username, email, created_at`,
          [username, email, googleId]
        );
        user = result.rows[0];
      }
    }

    // 3. Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};