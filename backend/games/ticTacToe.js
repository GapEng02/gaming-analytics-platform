class TicTacToe {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.isGameOver = false;
  }

  makeMove(position) {
    if (this.isGameOver) {
      return { error: 'Game already over' };
    }
    
    if (position < 0 || position > 8) {
      return { error: 'Invalid position' };
    }
    
    if (this.board[position] !== null) {
      return { error: 'Position already taken' };
    }
    
    this.board[position] = this.currentPlayer;
    
    // Check for winner
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.currentPlayer;
        this.isGameOver = true;
        return { 
          success: true, 
          board: this.board, 
          winner: this.winner,
          gameOver: true
        };
      }
    }
    
    // Check for draw
    if (this.board.every(cell => cell !== null)) {
      this.isGameOver = true;
      this.winner = 'draw';
      return {
        success: true,
        board: this.board,
        winner: 'draw',
        gameOver: true
      };
    }
    
    // Switch player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    
    return {
      success: true,
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameOver: false
    };
  }

  getState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      isGameOver: this.isGameOver
    };
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.isGameOver = false;
  }
}

module.exports = TicTacToe;