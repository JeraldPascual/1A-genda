/* eslint-env node */
/*
  Example server endpoint to revoke a user's refresh tokens (force sign-out everywhere).
  - Requires Firebase Admin SDK and proper service account credentials
  - This is a minimal express example. Protect this endpoint (admin-only) and require authentication.

  Usage:
    NODE_ENV=production ADMIN_SECRET=something node revokeRefreshTokens.js

  POST /revoke
    Body: { uid: '<firebase-uid>' , adminSecret: '<secret>' }

  Note: Do NOT commit service account keys in the repo. Use environment vars on server.
*/

const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Initialize admin SDK - provide path to service account JSON via env or use ADC
if (!admin.apps.length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS; // recommended
  if (!serviceAccountPath) {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS not set; admin SDK may still work with ADC.');
  }
  admin.initializeApp();
}

const app = express();
app.use(bodyParser.json());

// Simple shared-secret check. Replace with your own auth.
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-me';

app.post('/revoke', async (req, res) => {
  try {
    const { uid, adminSecret } = req.body;
    if (!uid) return res.status(400).json({ success: false, error: 'uid required' });
    if (adminSecret !== ADMIN_SECRET) return res.status(403).json({ success: false, error: 'forbidden' });

    await admin.auth().revokeRefreshTokens(uid);
    // Optionally: update user record with a lastRevokeAt timestamp in Firestore

    return res.json({ success: true, message: 'Tokens revoked' });
  } catch (err) {
    console.error('revoke error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Revoke service listening on ${PORT}`));
