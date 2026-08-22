class RockPaperScissors {
  constructor() {
    this.choices = ['rock', 'paper', 'scissors'];
    this.playerChoice = null;
    this.computerChoice = null;
    this.result = null;
    this.isGameOver = false;
  }

  makeMove(playerChoice) {
    if (this.isGameOver) {
      return { error: 'Game already over' };
    }
    
    if (!this.choices.includes(playerChoice)) {
      return { error: 'Invalid choice. Choose rock, paper, or scissors' };
    }
    
    this.playerChoice = playerChoice;
    this.computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
    this.isGameOver = true;
    
    // Determine winner
    if (this.playerChoice === this.computerChoice) {
      this.result = 'draw';
    } else if (
      (this.playerChoice === 'rock' && this.computerChoice === 'scissors') ||
      (this.playerChoice === 'paper' && this.computerChoice === 'rock') ||
      (this.playerChoice === 'scissors' && this.computerChoice === 'paper')
    ) {
      this.result = 'win';
    } else {
      this.result = 'loss';
    }
    
    return {
      success: true,
      playerChoice: this.playerChoice,
      computerChoice: this.computerChoice,
      result: this.result,
      gameOver: true
    };
  }

  getState() {
    return {
      playerChoice: this.playerChoice,
      computerChoice: this.computerChoice,
      result: this.result,
      isGameOver: this.isGameOver
    };
  }

  reset() {
    this.playerChoice = null;
    this.computerChoice = null;
    this.result = null;
    this.isGameOver = false;
  }
}

module.exports = RockPaperScissors;