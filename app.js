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

        this.setupRealTimeSync();
        this.loadInitialData();
        this.setupEventListeners();
        this.initializeTimer();
        this.handleRouting();
        this.loadGameState();
        this.updateAllDisplays();
    }

    setupRealTimeSync() {
        this.connected = true;
        this.syncMethod = 'localStorage';

        this.setupLocalStorageFallback();
        this.setupHeartbeat();
        this.updateConnectionStatus();
    }

    setupLocalStorageFallback() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'football-overlay-data') {
                const data = JSON.parse(event.newValue || '{}');
                this.handleMessage(data);
            }
        });

        window.addEventListener('football-overlay-update', (event) => {
            this.handleMessage(event.detail);
        });
    }

    setupHeartbeat() {
        setInterval(() => {
            this.sendMessage({
                type: 'HEARTBEAT',
                clientId: this.getClientId(),
                timestamp: Date.now()
            });
        }, 2000);

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

        localStorage.setItem('football-overlay-data', JSON.stringify(message));
        window.dispatchEvent(new CustomEvent('football-overlay-update', {
            detail: message
        }));
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
        const activeClients = Object.values(heartbeats).filter(ts => now - ts < 10000);
        this.connectedClients = activeClients.length;
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');

        if (statusIndicator && statusText) {
            statusIndicator.textContent = this.connected ? '🟢' : '🔴';
            statusText.textContent = this.connected
                ? `Conectado (${this.connectedClients} clientes) - ${this.syncMethod}`
                : 'Desconectado';
        }
    }

    handleRouting() {
        const hash = window.location.hash.slice(1) || 'home';
        this.navigateTo(hash);

        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.slice(1) || 'home';
            this.navigateTo(newHash);
        });
    }

    navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            window.location.hash = page;
        }
        if (page !== 'home' && page !== 'admin') {
            setTimeout(() => this.updateAllDisplays(), 100);
        }
    }

    loadInitialData() {
        // ... mantenha aqui a lista de times e competições ...
    }

    setupEventListeners() {
        // ... mantenha aqui os eventos de clique e alteração ...
    }

    updateTeam(side, teamName) {
        // ... manter implementação atual ...
    }

    changeScore(team, delta) {
        // ... manter implementação atual ...
    }

    resetScores() {
        // ... manter implementação atual ...
    }

    animateScoreUpdate(team) {
        // ... manter implementação atual ...
    }

    initializeTimer() {
        this.timerInterval = null;
    }

    toggleTimer() {
        // ... manter implementação atual ...
    }

    startTimer() {
        // ... manter implementação atual ...
    }

    pauseTimer() {
        // ... manter implementação atual ...
    }

    resetTimer() {
        // ... manter implementação atual ...
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameState.timerSeconds / 60);
        const seconds = this.gameState.timerSeconds % 60;
        this.gameState.timer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    broadcastUpdate() {
        this.sendMessage({
            type: 'UPDATE_GAME',
            data: this.gameState
        });
        this.updateAllDisplays();
        this.saveGameState();
    }

    updateAllDisplays() {
        // ... atualizar overlay e admin ...
    }

    saveGameState() {
        localStorage.setItem('football-overlay-saved-state', JSON.stringify(this.gameState));
    }

    loadGameState() {
        const saved = JSON.parse(localStorage.getItem('football-overlay-saved-state') || '{}');
        if (saved) {
            this.gameState = { ...this.gameState, ...saved };
        }
    }
}

// Inicializa quando a página carregar
window.onload = () => {
    new FootballOverlayApp();
};
