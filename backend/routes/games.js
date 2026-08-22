const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate } = require('../auth');
const TicTacToe = require('../games/ticTacToe');
const RockPaperScissors = require('../games/rockPaperScissors');
const Calculator = require('../games/calculator');

// Game instances (in production, use Redis or similar)
const gameInstances = new Map();

// Get or create game instance
function getGameInstance(userId, gameType) {
  const key = `${userId}-${gameType}`;
  if (!gameInstances.has(key)) {
    let game;
    switch (gameType) {
      case 'tictactoe':
        game = new TicTacToe();
        break;
      case 'rps':
        game = new RockPaperScissors();
        break;
      case 'calculator':
        game = new Calculator();
        break;
      default:
        throw new Error('Invalid game type');
    }
    gameInstances.set(key, game);
  }
  return gameInstances.get(key);
}

// Make a move
router.post('/:gameType/move', authenticate, (req, res) => {
  const { gameType } = req.params;
  const { move } = req.body;
  const userId = req.user.userId;
  
  try {
    const game = getGameInstance(userId, gameType);
    let result;
    
    switch (gameType) {
      case 'tictactoe':
        result = game.makeMove(move);
        break;
      case 'rps':
        result = game.makeMove(move);
        break;
      case 'calculator':
        result = game.evaluate(move);
        break;
      default:
        return res.status(400).json({ error: 'Invalid game type' });
    }
    
    // Save to database if game is over
    if (result.gameOver || result.error) {
      const db = getDb();
      const finalResult = result.winner || result.result || 'completed';
      const moves = JSON.stringify(result.board || result.history || {});
      const score = result.result === 'win' ? 1 : result.result === 'draw' ? 0.5 : 0;
      
      db.run(
        'INSERT INTO games (user_id, game_type, result, moves, score) VALUES (?, ?, ?, ?, ?)',
        [userId, gameType, finalResult, moves, score],
        (err) => {
          if (err) {
            console.error('Error saving game:', err);
          }
        }
      );
    }
    
    res.json({
      success: true,
      gameType,
      ...result,
      state: game.getState()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset game
router.post('/:gameType/reset', authenticate, (req, res) => {
  const { gameType } = req.params;
  const userId = req.user.userId;
  
  try {
    const key = `${userId}-${gameType}`;
    if (gameInstances.has(key)) {
      const game = gameInstances.get(key);
      game.reset();
    }
    
    res.json({
      success: true,
      message: 'Game reset successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get game state
router.get('/:gameType/state', authenticate, (req, res) => {
  const { gameType } = req.params;
  const userId = req.user.userId;
  
  try {
    const game = getGameInstance(userId, gameType);
    res.json({
      success: true,
      gameType,
      state: game.getState()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get game history
router.get('/history', authenticate, (req, res) => {
  const userId = req.user.userId;
  const db = getDb();
  
  db.all(
    'SELECT * FROM games WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        history: rows
      });
    }
  );
});

module.exports = router;