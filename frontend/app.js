// State
let token = null;
let currentUser = null;
let currentGame = 'tictactoe';

// API base URL
const API_URL = window.location.origin;

// Auth Functions
async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainApp();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainApp();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    currentUser = null;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authScreen').style.display = 'flex';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function showMainApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    
    // Load initial game
    loadGame('tictactoe');
    loadStats();
    loadLeaderboard();
}

// Check if already logged in
function checkAuth() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        token = savedToken;
        currentUser = JSON.parse(savedUser);
        showMainApp();
        return true;
    }
    return false;
}

// Game Functions
function showGame(gameType) {
    // Update active button
    document.querySelectorAll('.game-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.game-content').forEach(content => content.classList.remove('active'));
    
    // Find and activate the clicked game button
    const buttons = document.querySelectorAll('.game-btn');
    const gameMap = { 'tictactoe': 0, 'rps': 1, 'calculator': 2, 'stats': 3, 'leaderboard': 4 };
    const index = gameMap[gameType];
    if (index !== undefined) {
        buttons[index].classList.add('active');
    }
    
    document.getElementById(gameType).classList.add('active');
    currentGame = gameType;
    
    if (gameType !== 'stats' && gameType !== 'leaderboard') {
        loadGame(gameType);
    } else if (gameType === 'stats') {
        loadStats();
    } else if (gameType === 'leaderboard') {
        loadLeaderboard();
    }
}

async function loadGame(gameType) {
    try {
        const response = await fetch(`${API_URL}/api/games/${gameType}/state`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            renderGame(gameType, data.state);
        }
    } catch (error) {
        console.error('Error loading game:', error);
    }
}

function renderGame(gameType, state) {
    switch (gameType) {
        case 'tictactoe':
            renderTicTacToe(state);
            break;
        case 'rps':
            renderRPS(state);
            break;
        case 'calculator':
            renderCalculator(state);
            break;
    }
}

// Tic-Tac-Toe
function renderTicTacToe(state) {
    const board = document.getElementById('tictactoeBoard');
    const status = document.getElementById('tictactoeStatus');
    
    board.innerHTML = '';
    
    if (state.isGameOver) {
        if (state.winner === 'draw') {
            status.textContent = "It's a draw!";
        } else if (state.winner) {
            status.textContent = `🎉 ${state.winner} wins!`;
        } else {
            status.textContent = "Game Over";
        }
    } else {
        status.textContent = `${state.currentPlayer}'s turn`;
    }
    
    state.board.forEach((cell, index) => {
        const button = document.createElement('button');
        button.className = 'cell';
        if (cell || state.isGameOver) {
            button.classList.add('disabled');
        }
        button.textContent = cell || '';
        button.onclick = () => makeTicTacToeMove(index);
        board.appendChild(button);
    });
}

async function makeTicTacToeMove(position) {
    try {
        const response = await fetch(`${API_URL}/api/games/tictactoe/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ move: position })
        });
        
        const data = await response.json();
        if (data.success) {
            renderTicTacToe(data.state);
            if (data.gameOver) {
                loadStats();
                loadLeaderboard();
            }
        }
    } catch (error) {
        console.error('Error making move:', error);
    }
}

// Rock Paper Scissors
function renderRPS(state) {
    const status = document.getElementById('rpsStatus');
    const result = document.getElementById('rpsResult');
    
    if (state.isGameOver) {
        status.textContent = 'Game Over!';
        const emoji = {
            'rock': '🪨',
            'paper': '📄',
            'scissors': '✂️'
        };
        const resultText = state.result === 'win' ? '🎉 You win!' :
                          state.result === 'loss' ? '😢 You lose!' :
                          '🤝 Draw!';
        result.innerHTML = `
            You: ${emoji[state.playerChoice]} vs Computer: ${emoji[state.computerChoice]}
            <br><strong>${resultText}</strong>
        `;
    } else {
        status.textContent = 'Choose your move!';
        result.innerHTML = '';
    }
}

async function playRPS(choice) {
    try {
        const response = await fetch(`${API_URL}/api/games/rps/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ move: choice })
        });
        
        const data = await response.json();
        if (data.success) {
            renderRPS(data.state);
            if (data.gameOver) {
                loadStats();
                loadLeaderboard();
            }
        }
    } catch (error) {
        console.error('Error playing RPS:', error);
    }
}

// Calculator
function renderCalculator(state) {
    if (state.result !== null && state.result !== undefined) {
        document.getElementById('calcResult').innerHTML = `<strong>Result: ${state.result}</strong>`;
    }
    
    const historyDiv = document.getElementById('calcHistory');
    if (state.history && state.history.length > 0) {
        historyDiv.innerHTML = '<h3>History:</h3>' + 
            state.history.map(item => 
                `<div class="history-item">${item.expression} = ${item.result}</div>`
            ).join('');
    } else {
        historyDiv.innerHTML = '';
    }
}

async function calculate() {
    const input = document.getElementById('calcInput');
    const expression = input.value;
    
    if (!expression) return;
    
    try {
        const response = await fetch(`${API_URL}/api/games/calculator/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ move: expression })
        });
        
        const data = await response.json();
        if (data.success) {
            renderCalculator(data.state);
            if (data.result !== undefined) {
                document.getElementById('calcResult').innerHTML = `<strong>Result: ${data.result}</strong>`;
            }
            input.value = '';
        } else if (data.error) {
            document.getElementById('calcResult').innerHTML = `<strong style="color: #ff6b6b;">Error: ${data.error}</strong>`;
        }
    } catch (error) {
        console.error('Error calculating:', error);
    }
}

function clearCalc() {
    document.getElementById('calcInput').value = '';
    document.getElementById('calcResult').innerHTML = '';
    document.getElementById('calcHistory').innerHTML = '';
}

// Reset Game
async function resetGame(gameType) {
    try {
        const response = await fetch(`${API_URL}/api/games/${gameType}/reset`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            loadGame(gameType);
        }
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

// Stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/stats/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            renderStats(data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function renderStats(data) {
    const container = document.getElementById('statsContent');
    
    if (data.totals.total_games === 0) {
        container.innerHTML = '<p>No games played yet. Start playing!</p>';
        return;
    }
    
    let html = `
        <div class="stat-item"><strong>Total Games:</strong> ${data.totals.total_games}</div>
        <div class="stat-item"><strong>Wins:</strong> ${data.totals.total_wins}</div>
        <div class="stat-item"><strong>Losses:</strong> ${data.totals.total_losses}</div>
        <div class="stat-item"><strong>Draws:</strong> ${data.totals.total_draws}</div>
        <div class="stat-item"><strong>Average Score:</strong> ${(data.totals.overall_avg_score || 0).toFixed(2)}</div>
        <h3 style="margin-top:20px;">By Game:</h3>
    `;
    
    data.byGame.forEach(game => {
        html += `
            <div class="stat-item"><strong>${game.game_type}:</strong> 
                ${game.total_games} games, 
                ${game.wins || 0} wins, 
                ${game.losses || 0} losses, 
                ${game.draws || 0} draws
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/stats/leaderboard`);
        const data = await response.json();
        
        if (data.success) {
            renderLeaderboard(data.leaderboard);
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function renderLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboardContent');
    
    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<p>No players yet. Be the first!</p>';
        return;
    }
    
    let html = '';
    leaderboard.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        html += `
            <div class="leaderboard-item">
                <span class="rank">${medal}</span>
                <span><strong>${player.username}</strong></span>
                <span>⭐ ${player.rating || 0}</span>
                <span>${player.games_played} games</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) {
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
});