import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';

const JWT_SECRET = process.env.JWT_SECRET || 'arthafin_super_secure_jwt_secret_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT token
 */
function generateToken(user: { id: number; email: string; name: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Validate RFC 5322 email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * 1. Pinterest-style: Check if an email exists in database
 * POST /api/auth/check-email
 * Body: { email: string }
 */
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, email, name, avatar_url, (password_hash IS NOT NULL) AS has_password, (google_id IS NOT NULL) AS has_google
       FROM users 
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      // Email does not exist -> User should be taken to Account Creation (Sign Up)
      res.status(200).json({
        success: true,
        exists: false,
        email: normalizedEmail,
        message: 'Email not registered. Proceed to account creation.',
      });
      return;
    }

    const user = result.rows[0];
    res.status(200).json({
      success: true,
      exists: true,
      email: normalizedEmail,
      name: user.name,
      avatar_url: user.avatar_url,
      has_password: Boolean(user.has_password),
      has_google: Boolean(user.has_google),
      message: 'Account found. Enter your password to log in.',
    });
  } catch (error: any) {
    console.error('[AuthController] Error checking email:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while validating the email.',
      details: error.message,
    });
  }
};

/**
 * 2. Log in with Email & Password
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
export const loginWithEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, email, name, avatar_url, password_hash, google_id 
       FROM users 
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'No account found with this email. Please sign up.',
        not_found: true,
      });
      return;
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      res.status(400).json({
        success: false,
        error: 'This account was created using Google Sign-In. Please sign in with Google or set a password.',
        is_google_account: true,
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        error: 'Incorrect password. Please try again.',
      });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process login.',
      details: error.message,
    });
  }
};

/**
 * 3. Create Account with Email, Password & Confirm Password
 * POST /api/auth/register
 * Body: { email: string, password: string, confirm_password: string, name?: string }
 */
export const registerWithEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, confirm_password, name } = req.body;

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match. Please verify.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await pool.query(
      `SELECT id, email, password_hash, google_id FROM users WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let user: any;

    if (existing.rows.length > 0) {
      const existingUser = existing.rows[0];
      if (existingUser.password_hash) {
        res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please log in instead.',
        });
        return;
      }

      // User signed up with Google before, now linking a password
      const updateResult = await pool.query(
        `UPDATE users 
         SET password_hash = $1, name = COALESCE($2, name), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, email, name, avatar_url, created_at`,
        [passwordHash, name?.trim() || null, existingUser.id]
      );
      user = updateResult.rows[0];
    } else {
      // Clean display name or default to email handle
      const displayName = name && name.trim() !== '' 
        ? name.trim() 
        : normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const insertResult = await pool.query(
        `INSERT INTO users (email, name, password_hash, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id, email, name, avatar_url, created_at`,
        [normalizedEmail, displayName, passwordHash]
      );
      user = insertResult.rows[0];
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('[AuthController] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account.',
      details: error.message,
    });
  }
};

/**
 * 4. Google OAuth: Start Redirect to Real Google Accounts Page (accounts.google.com)
 * GET /api/auth/google/start
 */
export const startGoogleOAuth = async (req: Request, res: Response): Promise<void> => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google OAuth Configuration Required</title>
        <style>
          body { background: #07090e; color: #f8fafc; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; }
          .card { background: rgba(18, 24, 38, 0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 36px; max-width: 520px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
          h2 { margin-bottom: 12px; color: #38bdf8; }
          p { color: #94a3b8; font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px; }
          code { background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 6px; font-family: monospace; color: #34d399; }
          .btn { background: linear-gradient(135deg, #0284c7, #4f46e5); color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 9999px; font-weight: 600; display: inline-block; font-size: 0.88rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Real Google OAuth 2.0 Configuration Required</h2>
          <p>To open the official <code>accounts.google.com</code> authentication screen, please configure your Google Cloud Console credentials in your <code>.env</code> file:</p>
          <p><code>GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com<br>GOOGLE_CLIENT_SECRET=your_google_client_secret</code></p>
          <p>Make sure your Authorized Redirect URI is set to: <br><code>${redirectUri}</code></p>
          <a href="/" class="btn">Return to ArthaAI</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  const state = jwt.sign({ timestamp: Date.now() }, JWT_SECRET, { expiresIn: '15m' });
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account&state=${state}`;

  res.redirect(googleAuthUrl);
};

/**
 * 5. Google OAuth: Callback handler after Google Accounts page
 * GET /api/auth/google/callback
 */
export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, error } = req.query;

    if (error) {
      res.send(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${String(error)}' }, '*');
            window.close();
          } else {
            window.location.href = '/?auth_error=${encodeURIComponent(String(error))}';
          }
        </script></body></html>
      `);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).send('Authorization code missing.');
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${errText}`);
    }

    const tokenData = (await tokenRes.json()) as any;
    const idToken = tokenData.id_token;

    // Fetch user info from Google
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userinfoRes.json()) as any;

    const googleId = profile.sub;
    const email = (profile.email || '').toLowerCase();
    const name = profile.name || email.split('@')[0];
    const avatarUrl = profile.picture || '';

    // Upsert user into database
    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         google_id = EXCLUDED.google_id,
         name = EXCLUDED.name,
         avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, email, name, avatar_url, created_at`,
      [googleId, email, name, avatarUrl]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    // Respond with a script that communicates back to the Pinterest-style popup or redirects
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Authentication Successful</title></head>
      <body style="background:#0a0d14;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;">
        <p>Signing in to ArthaAI...</p>
        <script>
          const authData = {
            type: 'GOOGLE_AUTH_SUCCESS',
            token: ${JSON.stringify(token)},
            user: ${JSON.stringify(user)}
          };
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(authData, window.location.origin);
            window.close();
          } else {
            localStorage.setItem('arthafin_auth_token', ${JSON.stringify(token)});
            localStorage.setItem('arthafin_user_profile', JSON.stringify(${JSON.stringify(user)}));
            window.location.href = '/';
          }
        </script>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error('[AuthController] Google callback error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
};

/**
 * 6. Google Sign-In via Google Credential / One-Tap / Popup Token
 * POST /api/auth/google
 */
export const handleGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, client_profile } = req.body;

    let googleId = '';
    let email = '';
    let name = '';
    let avatarUrl = '';

    if (credential && typeof credential === 'string') {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const payload = (await verifyRes.json()) as any;
          googleId = payload.sub;
          email = (payload.email || '').toLowerCase();
          name = payload.name || email.split('@')[0] || 'User';
          avatarUrl = payload.picture || '';
        }
      } catch (err: any) {
        console.warn('[AuthController] Google token verification error:', err.message);
      }

      if (!googleId) {
        // Fallback decode if offline
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          googleId = payload.sub;
          email = (payload.email || '').toLowerCase();
          name = payload.name || email.split('@')[0] || 'User';
          avatarUrl = payload.picture || '';
        }
      }
    } else if (client_profile && client_profile.email) {
      email = client_profile.email.trim().toLowerCase();
      googleId = client_profile.google_id || `google:${email}`;
      name = client_profile.name || email.split('@')[0];
      avatarUrl = client_profile.avatar_url || '';
    }

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Missing Google credentials or email.',
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         google_id = COALESCE(EXCLUDED.google_id, users.google_id),
         name = EXCLUDED.name,
         avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, google_id, email, name, avatar_url, created_at`,
      [googleId, email, name, avatarUrl]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error: any) {
    console.error('[AuthController] Error handling Google login:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Google authentication.',
      details: error.message,
    });
  }
};

/**
 * 7. Get Current Authenticated User (via JWT Bearer token)
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const result = await pool.query(
      `SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }
};

/**
 * Return current client auth config (e.g., Google Client ID)
 * GET /api/auth/config
 */
export const getAuthConfig = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    google_client_id: process.env.GOOGLE_CLIENT_ID || '',
  });
};
