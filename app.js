// Football Overlay System - Real-time Application
class FootballOverlayApp {
    constructor() {
        this.currentPage = 'home';
        this.gameState = {
            homeTeam: { name: 'Casa', emoji: '⚽', color: '#E8112D' },
            awayTeam: { name: 'Visitante', emoji: '⚽', color: '#0066CC' },
            homeScore: 0,
            awayScore: 0,
            timer: '00:00',
            period: '1º Tempo',
            competition: '',
            isTimerRunning: false,
            timerSeconds: 0
        };
        
        // Real-time sync setup
        this.setupRealTimeSync();
        this.loadInitialData();
        this.setupEventListeners();
        this.initializeTimer();
        this.handleRouting();
        
        // Load game state from localStorage
        this.loadGameState();
        this.updateAllDisplays();
    }

    // Real-time synchronization setup
    setupRealTimeSync() {
        this.connected = true;
        this.syncMethod = 'localStorage';

        this.setupLocalStorageFallback();
        this.setupHeartbeat();
        this.updateConnectionStatus();
    }
        } else {
            console.warn('⚠️ BroadcastChannel not supported, using localStorage fallback');
            this.setupLocalStorageFallback();
        }
        
        // Setup heartbeat
        this.setupHeartbeat();
        this.updateConnectionStatus();
    }

    setupLocalStorageFallback() {
        this.syncMethod = 'localStorage';
        this.connected = true;
        
        // Listen for storage events
        window.addEventListener('storage', (event) => {
            if (event.key === 'football-overlay-data') {
                const data = JSON.parse(event.newValue || '{}');
                this.handleMessage(data);
            }
        });
        
        // For same-tab communication, we'll use custom events
        window.addEventListener('football-overlay-update', (event) => {
            this.handleMessage(event.detail);
        });
    }

    setupHeartbeat() {
        // Send heartbeat every 2 seconds
        setInterval(() => {
            this.sendMessage({
                type: 'HEARTBEAT',
                clientId: this.getClientId(),
                timestamp: Date.now()
            });
        }, 2000);

        // Clean up old heartbeats and count active clients
        setInterval(() => {
            this.updateConnectedClients();
        }, 5000);
    }

    getClientId() {
        if (!this.clientId) {
            this.clientId = 'client_' + Math.random().toString(36).substr(2, 9);
        }
        return this.clientId;
    }

    sendMessage(data) {
        const message = {
            ...data,
            timestamp: Date.now(),
            clientId: this.getClientId()
        };

        try {
            if (this.channel) {
                this.channel.postMessage(message);
            } else {
                // localStorage fallback
                localStorage.setItem('football-overlay-data', JSON.stringify(message));
                
                // Trigger custom event for same-tab communication
                window.dispatchEvent(new CustomEvent('football-overlay-update', {
                    detail: message
                }));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    handleMessage(data) {
        if (!data || data.clientId === this.getClientId()) return;

        switch (data.type) {
            case 'UPDATE_GAME':
                this.gameState = { ...this.gameState, ...data.data };
                this.updateAllDisplays();
                this.saveGameState();
                break;
            case 'HEARTBEAT':
                this.updateHeartbeat(data.clientId, data.timestamp);
                break;
        }
    }

    updateHeartbeat(clientId, timestamp) {
        const heartbeats = JSON.parse(localStorage.getItem('heartbeats') || '{}');
        heartbeats[clientId] = timestamp;
        localStorage.setItem('heartbeats', JSON.stringify(heartbeats));
    }

    updateConnectedClients() {
        const now = Date.now();
        const heartbeats = JSON.parse(localStorage.getItem('heartbeats') || '{}');
        const activeClients = Object.values(heartbeats).filter(timestamp => 
            now - timestamp < 10000 // 10 seconds timeout
        );
        
        this.connectedClients = activeClients.length;
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');
        
        if (statusIndicator && statusText) {
            if (this.connected) {
                statusIndicator.textContent = '🟢';
                statusText.textContent = `Conectado (${this.connectedClients} clientes) - ${this.syncMethod}`;
                statusIndicator.className = 'status-indicator connected';
            } else {
                statusIndicator.textContent = '🔴';
                statusText.textContent = 'Desconectado';
                statusIndicator.className = 'status-indicator disconnected';
            }
        }
    }

    // Navigation system
    handleRouting() {
        const hash = window.location.hash.slice(1) || 'home';
        this.navigateTo(hash);
        
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.slice(1) || 'home';
            this.navigateTo(newHash);
        });
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            window.location.hash = page;
        }
        
        // Update displays when switching to overlay pages
        if (page !== 'home' && page !== 'admin') {
            setTimeout(() => this.updateAllDisplays(), 100);
        }
    }

    // Load initial data (Brazilian teams, competitions, etc.)
    loadInitialData() {
        const brazilianTeams = [
            {"nome": "Flamengo", "emoji": "🔴⚫", "cores": ["#E8112D", "#000000"]},
            {"nome": "Corinthians", "emoji": "⚫⚪", "cores": ["#000000", "#FFFFFF"]},
            {"nome": "Palmeiras", "emoji": "🟢⚪", "cores": ["#00A65F", "#FFFFFF"]},
            {"nome": "São Paulo", "emoji": "🔴⚫⚪", "cores": ["#E8112D", "#000000", "#FFFFFF"]},
            {"nome": "Santos", "emoji": "⚫⚪", "cores": ["#000000", "#FFFFFF"]},
            {"nome": "Vasco", "emoji": "⚫⚪", "cores": ["#000000", "#FFFFFF"]},
            {"nome": "Botafogo", "emoji": "⚫⚪", "cores": ["#000000", "#FFFFFF"]},
            {"nome": "Fluminense", "emoji": "🟢🔴⚪", "cores": ["#8B0000", "#006400", "#FFFFFF"]},
            {"nome": "Grêmio", "emoji": "🔵⚫⚪", "cores": ["#0066CC", "#000000", "#FFFFFF"]},
            {"nome": "Internacional", "emoji": "🔴⚪", "cores": ["#D2122E", "#FFFFFF"]},
            {"nome": "Atlético-MG", "emoji": "⚫⚪", "cores": ["#000000", "#FFFFFF"]},
            {"nome": "Cruzeiro", "emoji": "🔵⚪", "cores": ["#003F7F", "#FFFFFF"]},
            {"nome": "Bahia", "emoji": "🔵⚪🔴", "cores": ["#0066CC", "#FFFFFF", "#E8112D"]},
            {"nome": "Ceará", "emoji": "⚫⚪", "cores": ["#000000", "#FFFFFF"]},
            {"nome": "Fortaleza", "emoji": "🔴🔵⚪", "cores": ["#E8112D", "#0066CC", "#FFFFFF"]}
        ];

        const competitions = [
            "Campeonato Brasileiro",
            "Copa do Brasil", 
            "Copa Libertadores",
            "Copa Sul-Americana",
            "Campeonato Paulista",
            "Campeonato Carioca",
            "Campeonato Gaúcho",
            "Campeonato Mineiro",
            "Recopa Sul-Americana",
            "Mundial de Clubes"
        ];

        // Populate team selects
        const homeTeamSelect = document.getElementById('home-team');
        const awayTeamSelect = document.getElementById('away-team');
        
        if (homeTeamSelect && awayTeamSelect) {
            brazilianTeams.forEach(team => {
                const option1 = new Option(team.nome, team.nome);
                const option2 = new Option(team.nome, team.nome);
                homeTeamSelect.add(option1);
                awayTeamSelect.add(option2);
            });
        }

        // Populate competition select
        const competitionSelect = document.getElementById('competition');
        if (competitionSelect) {
            competitions.forEach(comp => {
                competitionSelect.add(new Option(comp, comp));
            });
        }

        this.brazilianTeams = brazilianTeams;
    }

    // Event listeners setup
    setupEventListeners() {
        // Team selection changes
        document.getElementById('home-team')?.addEventListener('change', (e) => {
            this.updateTeam('home', e.target.value);
        });

        document.getElementById('away-team')?.addEventListener('change', (e) => {
            this.updateTeam('away', e.target.value);
        });

        // Custom team name changes
        document.getElementById('home-name')?.addEventListener('input', (e) => {
            this.gameState.homeTeam.name = e.target.value || 'Casa';
            this.broadcastUpdate();
        });

        document.getElementById('away-name')?.addEventListener('input', (e) => {
            this.gameState.awayTeam.name = e.target.value || 'Visitante';
            this.broadcastUpdate();
        });

        // Color changes
        document.getElementById('home-color')?.addEventListener('change', (e) => {
            this.gameState.homeTeam.color = e.target.value;
            this.broadcastUpdate();
        });

        document.getElementById('away-color')?.addEventListener('change', (e) => {
            this.gameState.awayTeam.color = e.target.value;
            this.broadcastUpdate();
        });

        // Score changes
        document.getElementById('home-score')?.addEventListener('change', (e) => {
            this.gameState.homeScore = parseInt(e.target.value) || 0;
            this.broadcastUpdate();
        });

        document.getElementById('away-score')?.addEventListener('change', (e) => {
            this.gameState.awayScore = parseInt(e.target.value) || 0;
            this.broadcastUpdate();
        });

        // Period changes
        document.getElementById('game-period')?.addEventListener('change', (e) => {
            this.gameState.period = e.target.value;
            this.broadcastUpdate();
        });

        // Competition changes
        document.getElementById('competition')?.addEventListener('change', (e) => {
            this.gameState.competition = e.target.value;
            this.broadcastUpdate();
        });

        document.getElementById('custom-competition')?.addEventListener('input', (e) => {
            this.gameState.competition = e.target.value;
            this.broadcastUpdate();
        });

        // Timer configuration
        document.getElementById('timer-minutes')?.addEventListener('change', (e) => {
            const minutes = parseInt(e.target.value) || 0;
            this.gameState.timerSeconds = minutes * 60;
            this.updateTimerDisplay();
            this.broadcastUpdate();
        });
    }

    updateTeam(side, teamName) {
        const team = this.brazilianTeams.find(t => t.nome === teamName);
        if (team) {
            if (side === 'home') {
                this.gameState.homeTeam.name = team.nome;
                this.gameState.homeTeam.emoji = team.emoji;
                this.gameState.homeTeam.color = team.cores[0];
                document.getElementById('home-color').value = team.cores[0];
                document.getElementById('home-name').value = team.nome;
            } else {
                this.gameState.awayTeam.name = team.nome;
                this.gameState.awayTeam.emoji = team.emoji;
                this.gameState.awayTeam.color = team.cores[0];
                document.getElementById('away-color').value = team.cores[0];
                document.getElementById('away-name').value = team.nome;
            }
            this.broadcastUpdate();
        }
    }

    // Score management
    changeScore(team, delta) {
        if (team === 'home') {
            this.gameState.homeScore = Math.max(0, this.gameState.homeScore + delta);
            document.getElementById('home-score').value = this.gameState.homeScore;
        } else {
            this.gameState.awayScore = Math.max(0, this.gameState.awayScore + delta);
            document.getElementById('away-score').value = this.gameState.awayScore;
        }
        this.broadcastUpdate();
        this.animateScoreUpdate(team);
    }

    resetScores() {
        this.gameState.homeScore = 0;
        this.gameState.awayScore = 0;
        document.getElementById('home-score').value = 0;
        document.getElementById('away-score').value = 0;
        this.broadcastUpdate();
    }

    animateScoreUpdate(team) {
        const elements = document.querySelectorAll(`[id*="${team}-score"]`);
        elements.forEach(el => {
            el.classList.add('score-update');
            setTimeout(() => el.classList.remove('score-update'), 500);
        });
    }

    // Timer functionality
    initializeTimer() {
        this.timerInterval = null;
    }

    toggleTimer() {
        if (this.gameState.isTimerRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.timerInterval) return;
        
        this.gameState.isTimerRunning = true;
        document.getElementById('play-pause-btn').innerHTML = '⏸️ Pause';
        
        this.timerInterval = setInterval(() => {
            this.gameState.timerSeconds++;
            this.updateTimerDisplay();
            this.broadcastUpdate();
            
            // Add timer animation
            document.querySelectorAll('[id*="timer"]').forEach(el => {
                el.classList.add('timer-update');
                setTimeout(() => el.classList.remove('timer-update'), 300);
            });
        }, 1000);
    }

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.gameState.isTimerRunning = false;
        document.getElementById('play-pause-btn').innerHTML = '▶️ Play';
        this.broadcastUpdate();
    }

    resetTimer() {
        this.pauseTimer();
        this.gameState.timerSeconds = 0;
        this.updateTimerDisplay();
        this.broadcastUpdate();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameState.timerSeconds / 60);
        const seconds = this.gameState.timerSeconds % 60;
        this.gameState.timer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Broadcast updates to all connected clients
    broadcastUpdate() {
        this.sendMessage({
            type: 'UPDATE_GAME',
            data: this.gameState
        });
        this.updateAllDisplays();
        this.saveGameState();
    }

    // Update all display elements
    updateAllDisplays() {
        // Update admin displays
        this.updateAdminDisplays();
        
        // Update all overlay displays
        this.updateOverlayDisplays();
    }

    updateAdminDisplays() {
        // Update team display names
        const homeDisplay = document.getElementById('home-display');
        const awayDisplay = document.getElementById('away-display');
        if (homeDisplay) homeDisplay.textContent = this.gameState.homeTeam.name;
        if (awayDisplay) awayDisplay.textContent = this.gameState.awayTeam.name;

        // Update timer display
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) timerDisplay.textContent = this.gameState.timer;

        // Update preview
        this.updatePreview();
    }

    updateOverlayDisplays() {
        // Score only overlay
        this.updateElement('overlay-home-score', this.gameState.homeScore);
        this.updateElement('overlay-away-score', this.gameState.awayScore);

        // Timer overlay
        this.updateElement('overlay-timer', this.gameState.timer);
        this.updateElement('overlay-period', this.gameState.period);

        // Teams overlay
        this.updateElement('overlay-home-name', this.gameState.homeTeam.name);
        this.updateElement('overlay-away-name', this.gameState.awayTeam.name);
        this.updateElement('overlay-home-emoji', this.gameState.homeTeam.emoji);
        this.updateElement('overlay-away-emoji', this.gameState.awayTeam.emoji);

        // Scoreboard overlay
        this.updateElement('scoreboard-home-name', this.gameState.homeTeam.name);
        this.updateElement('scoreboard-away-name', this.gameState.awayTeam.name);
        this.updateElement('scoreboard-home-score', this.gameState.homeScore);
        this.updateElement('scoreboard-away-score', this.gameState.awayScore);
        this.updateElement('scoreboard-home-emoji', this.gameState.homeTeam.emoji);
        this.updateElement('scoreboard-away-emoji', this.gameState.awayTeam.emoji);
        this.updateElement('scoreboard-timer', this.gameState.timer);
        this.updateElement('scoreboard-period', this.gameState.period);

        // Full overlay
        this.updateElement('full-home-name', this.gameState.homeTeam.name);
        this.updateElement('full-away-name', this.gameState.awayTeam.name);
        this.updateElement('full-home-score', this.gameState.homeScore);
        this.updateElement('full-away-score', this.gameState.awayScore);
        this.updateElement('full-home-emoji', this.gameState.homeTeam.emoji);
        this.updateElement('full-away-emoji', this.gameState.awayTeam.emoji);
        this.updateElement('full-timer', this.gameState.timer);
        this.updateElement('full-period', this.gameState.period);
        this.updateElement('full-competition', this.gameState.competition || 'Competição');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.classList.add('fade-in');
            setTimeout(() => element.classList.remove('fade-in'), 300);
        }
    }

    updatePreview() {
        this.updateElement('preview-home-name', this.gameState.homeTeam.name);
        this.updateElement('preview-away-name', this.gameState.awayTeam.name);
        this.updateElement('preview-home-score', this.gameState.homeScore);
        this.updateElement('preview-away-score', this.gameState.awayScore);
        this.updateElement('preview-home-emoji', this.gameState.homeTeam.emoji);
        this.updateElement('preview-away-emoji', this.gameState.awayTeam.emoji);
        this.updateElement('preview-timer', this.gameState.timer);
        this.updateElement('preview-period', this.gameState.period);
    }

    // Persistence
    saveGameState() {
        localStorage.setItem('football-game-state', JSON.stringify(this.gameState));
    }

    loadGameState() {
        const saved = localStorage.getItem('football-game-state');
        if (saved) {
            this.gameState = { ...this.gameState, ...JSON.parse(saved) };
            this.restoreFormValues();
        }
    }

    restoreFormValues() {
        // Restore form values from game state
        const elements = {
            'home-name': this.gameState.homeTeam.name,
            'away-name': this.gameState.awayTeam.name,
            'home-color': this.gameState.homeTeam.color,
            'away-color': this.gameState.awayTeam.color,
            'home-score': this.gameState.homeScore,
            'away-score': this.gameState.awayScore,
            'game-period': this.gameState.period,
            'competition': this.gameState.competition,
            'timer-minutes': Math.floor(this.gameState.timerSeconds / 60)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value !== undefined) {
                element.value = value;
            }
        });

        // Update timer display
        this.updateTimerDisplay();
    }
}

// Utility functions
function navigateTo(page) {
    if (window.app) {
        window.app.navigateTo(page);
    }
}

function changeScore(team, delta) {
    if (window.app) {
        window.app.changeScore(team, delta);
    }
}

function resetScores() {
    if (window.app) {
        window.app.resetScores();
    }
}

function toggleTimer() {
    if (window.app) {
        window.app.toggleTimer();
    }
}

function resetTimer() {
    if (window.app) {
        window.app.resetTimer();
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Copiado!';
        button.classList.add('btn--primary');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('btn--primary');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FootballOverlayApp();
    
    // Add global error handling
    window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
    });
    
    // Add visibility change handling for timer
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && window.app && window.app.gameState.isTimerRunning) {
            // Keep timer running even when tab is not visible
            console.log('Tab hidden, timer continues running');
        }
    });
    
    console.log('⚽ Football Overlay System initialized successfully!');
});
