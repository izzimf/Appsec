require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// load secure creds from env
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || ''; // hex sha256

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Возвращаем hex, чтобы было легче хранить в .env
function hashPasswordHex(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function safeCompareHex(hexA, hexB) {
  try {
    const bufA = Buffer.from(hexA, 'hex');
    const bufB = Buffer.from(hexB, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

app.get('/', (req, res) => {
  res.send(`
    <h2>Login App (secure) 🚀</h2>
    <form method="POST" action="/login">
      <label>Username:</label><br>
      <input type="text" name="username" /><br><br>
      <label>Password:</label><br>
      <input type="password" name="password" /><br><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // basic validation
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).send('Bad Request');
  }

  if (username === ADMIN_USER && ADMIN_PASS_HASH) {
    const incomingHash = hashPasswordHex(password);
    const ok = safeCompareHex(incomingHash, ADMIN_PASS_HASH);
    if (ok) {
      return res.status(200).send(`<h1>Welcome, ${escapeHtml(username)}!</h1>`);
    }
  }

  // generic message to avoid info leak
  return res.status(401).send('Invalid credentials');
});

// safe error handling — log server-side, generic to client
app.get('/error', (req, res) => {
  try {
    throw new Error('Something broke!');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});

// general error middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});
