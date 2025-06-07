
// === PAINEL ADMINISTRATIVO ===
const channel = new BroadcastChannel('football-overlay');

function updateGameData(data) {
    // Envia dados para todas as abas
    channel.postMessage({
        type: 'UPDATE_GAME',
        data: data,
        timestamp: Date.now()
    });

    // Salva localmente também
    localStorage.setItem('footballData', JSON.stringify(data));
}

// === PÁGINAS DE OVERLAY ===
const channel = new BroadcastChannel('football-overlay');

channel.onmessage = function(event) {
    if (event.data.type === 'UPDATE_GAME') {
        updateDisplay(event.data.data);
    }
};

function updateDisplay(data) {
    if (data.homeScore !== undefined) {
        document.getElementById('homeScore').textContent = data.homeScore;
    }
    if (data.awayScore !== undefined) {
        document.getElementById('awayScore').textContent = data.awayScore;
    }
    if (data.timer !== undefined) {
        document.getElementById('timer').textContent = data.timer;
    }
}
