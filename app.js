// Sistema de Sincronização em Tempo Real
class RealTimeSync {
    constructor() {
        this.data = this.getInitialData();
        this.setupSync();
        this.updateUrls();
    }

    getInitialData() {
        const savedData = localStorage.getItem('footballData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        
        return {
            teams: {
                home: {
                    name: "Flamengo",
                    score: 0,
                    color: "#ff0000",
                    shield: "🔴⚫"
                },
                away: {
                    name: "Corinthians",
                    score: 0,
                    color: "#000000",
                    shield: "⚫⚪"
                }
            },
            timer: {
                minutes: 0,
                seconds: 0,
                running: false,
                period: "1º Tempo"
            },
            match: {
                competition: "Brasileirão",
                stadium: "Maracanã",
                date: "2024-06-06"
            }
        };
    }

    setupSync() {
        // BroadcastChannel principal
        if (typeof BroadcastChannel !== 'undefined') {
            this.channel = new BroadcastChannel('football-overlay-sync');
            this.channel.onmessage = (event) => {
                this.handleUpdate(event.data);
            };
        }

        // localStorage fallback
        window.addEventListener('storage', (e) => {
            if (e.key === 'footballData') {
                this.handleUpdate(JSON.parse(e.newValue));
            }
        });

        // Polling como último recurso
        setInterval(() => {
            this.checkForUpdates();
        }, 1000);

        // Timer interno
        setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    sendUpdate(data) {
        this.data = { ...this.data, ...data };
        
        // Salvar no localStorage
        localStorage.setItem('footballData', JSON.stringify(this.data));

        // Enviar via BroadcastChannel se disponível
        if (this.channel) {
            this.channel.postMessage(this.data);
        }

        // Atualizar interface
        this.updateInterface();
    }

    handleUpdate(data) {
        this.data = data;
        this.updateInterface();
    }

    checkForUpdates() {
        const savedData = localStorage.getItem('footballData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (JSON.stringify(parsedData) !== JSON.stringify(this.data)) {
                this.data = parsedData;
                this.updateInterface();
            }
        }
    }

    updateTimer() {
        if (this.data.timer.running) {
            this.data.timer.seconds++;
            if (this.data.timer.seconds >= 60) {
                this.data.timer.seconds = 0;
                this.data.timer.minutes++;
            }
            
            // Atualizar apenas localmente (não enviar update completo)
            this.updateTimerDisplay();
            
            // Salvar no localStorage para sincronização
            localStorage.setItem('footballData', JSON.stringify(this.data));
        }
    }

    updateTimerDisplay() {
        const timeString = `${String(this.data.timer.minutes).padStart(2, '0')}:${String(this.data.timer.seconds).padStart(2, '0')}`;
        
        // Admin panel
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = timeString;
        }

        // Overlays
        this.updateElement('overlay-timer-time', timeString);
        this.updateElement('overlay-scoreboard-timer', timeString);
        this.updateElement('overlay-completo-timer', timeString);
    }

    updateInterface() {
        this.updateAdminPanel();
        this.updateOverlays();
    }

    updateAdminPanel() {
        // Times
        this.updateElement('home-name', this.data.teams.home.name);
        this.updateElement('away-name', this.data.teams.away.name);
        this.updateElement('home-color', this.data.teams.home.color);
        this.updateElement('away-color', this.data.teams.away.color);
        this.updateElement('home-shield', this.data.teams.home.shield);
        this.updateElement('away-shield', this.data.teams.away.shield);

        // Placar
        this.updateElement('home-score', this.data.teams.home.score);
        this.updateElement('away-score', this.data.teams.away.score);
        this.updateElement('home-team-display', this.data.teams.home.name);
        this.updateElement('away-team-display', this.data.teams.away.name);

        // Timer
        const timeString = `${String(this.data.timer.minutes).padStart(2, '0')}:${String(this.data.timer.seconds).padStart(2, '0')}`;
        this.updateElement('timer-display', timeString);
        this.updateElement('period-display', this.data.timer.period);
        this.updateElement('period-select', this.data.timer.period);

        // Botão play/pause
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.data.timer.running ? '⏸️ Pausar' : '▶️ Iniciar';
        }

        // Informações da partida
        this.updateElement('competition', this.data.match.competition);
        this.updateElement('stadium', this.data.match.stadium);
        this.updateElement('match-date', this.data.match.date);
    }

    updateOverlays() {
        // Placar Overlay
        this.updateElement('overlay-home-shield', this.data.teams.home.shield);
        this.updateElement('overlay-home-name', this.data.teams.home.name);
        this.updateElement('overlay-home-score', this.data.teams.home.score);
        this.updateElement('overlay-away-shield', this.data.teams.away.shield);
        this.updateElement('overlay-away-name', this.data.teams.away.name);
        this.updateElement('overlay-away-score', this.data.teams.away.score);

        // Timer Overlay
        const timeString = `${String(this.data.timer.minutes).padStart(2, '0')}:${String(this.data.timer.seconds).padStart(2, '0')}`;
        this.updateElement('overlay-timer-time', timeString);
        this.updateElement('overlay-timer-period', this.data.timer.period);

        // Times Overlay
        this.updateElement('overlay-times-home-shield', this.data.teams.home.shield);
        this.updateElement('overlay-times-home-name', this.data.teams.home.name);
        this.updateElement('overlay-times-away-shield', this.data.teams.away.shield);
        this.updateElement('overlay-times-away-name', this.data.teams.away.name);

        // Scoreboard Overlay
        this.updateElement('overlay-scoreboard-competition', this.data.match.competition);
        this.updateElement('overlay-scoreboard-timer', timeString);
        this.updateElement('overlay-scoreboard-period', this.data.timer.period);
        this.updateElement('overlay-scoreboard-home-shield', this.data.teams.home.shield);
        this.updateElement('overlay-scoreboard-home-name', this.data.teams.home.name);
        this.updateElement('overlay-scoreboard-home-score', this.data.teams.home.score);
        this.updateElement('overlay-scoreboard-away-shield', this.data.teams.away.shield);
        this.updateElement('overlay-scoreboard-away-name', this.data.teams.away.name);
        this.updateElement('overlay-scoreboard-away-score', this.data.teams.away.score);

        // Info Overlay
        this.updateElement('overlay-info-competition', this.data.match.competition);
        this.updateElement('overlay-info-stadium', this.data.match.stadium);
        
        const dateObj = new Date(this.data.match.date);
        const formattedDate = dateObj.toLocaleDateString('pt-BR');
        this.updateElement('overlay-info-date', formattedDate);

        // Completo Overlay
        this.updateElement('overlay-completo-competition', this.data.match.competition);
        this.updateElement('overlay-completo-stadium', this.data.match.stadium);
        this.updateElement('overlay-completo-timer', timeString);
        this.updateElement('overlay-completo-period', this.data.timer.period);
        this.updateElement('overlay-completo-home-shield', this.data.teams.home.shield);
        this.updateElement('overlay-completo-home-name', this.data.teams.home.name);
        this.updateElement('overlay-completo-home-score', this.data.teams.home.score);
        this.updateElement('overlay-completo-away-shield', this.data.teams.away.shield);
        this.updateElement('overlay-completo-away-name', this.data.teams.away.name);
        this.updateElement('overlay-completo-away-score', this.data.teams.away.score);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
    }

    updateUrls() {
        const baseUrl = window.location.origin + window.location.pathname;
        
        this.updateElement('placar-url', `${baseUrl}#placar`);
        this.updateElement('timer-url', `${baseUrl}#timer`);
        this.updateElement('times-url', `${baseUrl}#times`);
        this.updateElement('scoreboard-url', `${baseUrl}#scoreboard`);
        this.updateElement('info-url', `${baseUrl}#info`);
        this.updateElement('completo-url', `${baseUrl}#completo`);
    }
}

// Instância global do sistema de sincronização
let syncSystem;

// Controles do Placar
function changeScore(team, change) {
    const newData = { ...syncSystem.data };
    newData.teams[team].score = Math.max(0, newData.teams[team].score + change);
    
    syncSystem.sendUpdate(newData);
    
    // Animação de atualização
    const scoreElement = document.getElementById(`${team}-score`);
    if (scoreElement) {
        scoreElement.classList.add('score-update');
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 500);
    }
}

function resetScore() {
    const newData = { ...syncSystem.data };
    newData.teams.home.score = 0;
    newData.teams.away.score = 0;
    
    syncSystem.sendUpdate(newData);
}

// Controles do Timer
function toggleTimer() {
    const newData = { ...syncSystem.data };
    newData.timer.running = !newData.timer.running;
    
    syncSystem.sendUpdate(newData);
}

function resetTimer() {
    const newData = { ...syncSystem.data };
    newData.timer.minutes = 0;
    newData.timer.seconds = 0;
    newData.timer.running = false;
    
    syncSystem.sendUpdate(newData);
}

function changePeriod() {
    const periodSelect = document.getElementById('period-select');
    const newData = { ...syncSystem.data };
    newData.timer.period = periodSelect.value;
    
    syncSystem.sendUpdate(newData);
}

// Copiar URLs
function copyUrl(type) {
    const urlElement = document.getElementById(`${type}-url`);
    if (urlElement) {
        navigator.clipboard.writeText(urlElement.textContent).then(() => {
            // Feedback visual
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Copiado!';
            button.classList.add('btn--primary');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('btn--primary');
            }, 2000);
        });
    }
}

// Sistema de Roteamento para Overlays
function handleRouting() {
    const hash = window.location.hash.slice(1);
    
    // Esconder todos os overlays
    document.querySelectorAll('.overlay-container').forEach(overlay => {
        overlay.classList.add('hidden');
    });
    
    if (hash && hash !== '') {
        // Mostrar overlay específico
        const overlayElement = document.getElementById(`overlay-${hash}`);
        if (overlayElement) {
            document.body.classList.add('overlay-mode');
            overlayElement.classList.remove('hidden');
            overlayElement.classList.add('active');
            
            // Esconder painel admin
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                adminPanel.style.display = 'none';
            }
        }
    } else {
        // Mostrar painel admin
        document.body.classList.remove('overlay-mode');
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }
}

// Event Listeners para o painel admin
function setupEventListeners() {
    // Configuração dos times
    document.getElementById('home-name').addEventListener('input', function() {
        const newData = { ...syncSystem.data };
        newData.teams.home.name = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('away-name').addEventListener('input', function() {
        const newData = { ...syncSystem.data };
        newData.teams.away.name = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('home-shield').addEventListener('change', function() {
        const newData = { ...syncSystem.data };
        newData.teams.home.shield = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('away-shield').addEventListener('change', function() {
        const newData = { ...syncSystem.data };
        newData.teams.away.shield = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('home-color').addEventListener('change', function() {
        const newData = { ...syncSystem.data };
        newData.teams.home.color = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('away-color').addEventListener('change', function() {
        const newData = { ...syncSystem.data };
        newData.teams.away.color = this.value;
        syncSystem.sendUpdate(newData);
    });

    // Informações da partida
    document.getElementById('competition').addEventListener('input', function() {
        const newData = { ...syncSystem.data };
        newData.match.competition = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('stadium').addEventListener('input', function() {
        const newData = { ...syncSystem.data };
        newData.match.stadium = this.value;
        syncSystem.sendUpdate(newData);
    });

    document.getElementById('match-date').addEventListener('change', function() {
        const newData = { ...syncSystem.data };
        newData.match.date = this.value;
        syncSystem.sendUpdate(newData);
    });

    // Monitorar mudanças na URL
    window.addEventListener('hashchange', handleRouting);
}

// Status de conexão
function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        if (typeof BroadcastChannel !== 'undefined') {
            statusElement.textContent = '🟢 Conectado (BroadcastChannel)';
        } else {
            statusElement.textContent = '🟡 Conectado (LocalStorage)';
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de sincronização
    syncSystem = new RealTimeSync();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar roteamento
    handleRouting();
    
    // Atualizar status de conexão
    updateConnectionStatus();
    
    // Atualizar interface inicial
    syncSystem.updateInterface();
    
    console.log('Sistema de Overlays de Futebol inicializado com sucesso!');
    
    // Teste de conectividade
    setInterval(() => {
        updateConnectionStatus();
    }, 5000);
});

// Funções utilitárias
function formatTime(minutes, seconds) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function validateScore(score) {
    return Math.max(0, Math.min(99, parseInt(score) || 0));
}

// Debug helper
window.footballOverlay = {
    getData: () => syncSystem.data,
    setData: (data) => syncSystem.sendUpdate(data),
    resetAll: () => {
        localStorage.removeItem('footballData');
        location.reload();
    }
};