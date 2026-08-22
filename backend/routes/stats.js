const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate } = require('../auth');

// Get user stats
router.get('/user', authenticate, (req, res) => {
  const userId = req.user.userId;
  const db = getDb();
  
  db.all(
    `SELECT 
      game_type,
      COUNT(*) as total_games,
      SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
      SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws,
      AVG(score) as avg_score
    FROM games 
    WHERE user_id = ? 
    GROUP BY game_type`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get total stats
      db.get(
        `SELECT 
          COUNT(*) as total_games,
          SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as total_wins,
          SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as total_losses,
          SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as total_draws,
          AVG(score) as overall_avg_score
        FROM games 
        WHERE user_id = ?`,
        [userId],
        (err, totalStats) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            success: true,
            byGame: rows || [],
            totals: totalStats || { total_games: 0, total_wins: 0, total_losses: 0, total_draws: 0, overall_avg_score: 0 }
          });
        }
      );
    }
  );
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  const db = getDb();
  
  db.all(
    `SELECT 
      u.username,
      COUNT(g.id) as games_played,
      SUM(CASE WHEN g.result = 'win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN g.result = 'loss' THEN 1 ELSE 0 END) as losses,
      SUM(CASE WHEN g.result = 'draw' THEN 1 ELSE 0 END) as draws,
      AVG(g.score) as avg_score,
      ROUND(AVG(g.score) * 100, 2) as rating
    FROM users u
    JOIN games g ON u.id = g.user_id
    GROUP BY u.id
    ORDER BY rating DESC
    LIMIT 20`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        leaderboard: rows || []
      });
    }
  );
});

// Get recent games
router.get('/recent', authenticate, (req, res) => {
  const userId = req.user.userId;
  const db = getDb();
  
  db.all(
    `SELECT 
      g.*,
      u.username
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.user_id = ?
    ORDER BY g.timestamp DESC
    LIMIT 10`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        recent: rows || []
      });
    }
  );
});

module.exports = router;