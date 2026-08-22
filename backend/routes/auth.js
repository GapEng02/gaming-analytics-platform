const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { generateToken, hashPassword, comparePassword } = require('../auth');

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  try {
    const hashedPassword = await hashPassword(password);
    const db = getDb();
    
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already taken' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = generateToken(this.lastID, username);
        res.json({
          success: true,
          token,
          user: { id: this.lastID, username }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const db = getDb();
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = generateToken(user.id, user.username);
      res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username }
      });
    }
  );
});

module.exports = router;
