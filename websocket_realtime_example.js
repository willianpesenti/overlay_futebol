
// === SERVIDOR NODE.JS ===
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let gameData = {
    homeTeam: 'Time A',
    awayTeam: 'Time B',
    homeScore: 0,
    awayScore: 0,
    timer: '00:00'
};

wss.on('connection', function connection(ws) {
    // Envia dados atuais para novo cliente
    ws.send(JSON.stringify(gameData));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        if (data.type === 'UPDATE_GAME') {
            gameData = { ...gameData, ...data.payload };

            // Broadcast para todos os clientes conectados
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(gameData));
                }
            });
        }
    });
});

// === CLIENTE JAVASCRIPT ===
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateDisplay(data);
};

// Função para enviar atualizações (painel admin)
function sendUpdate(updates) {
    ws.send(JSON.stringify({
        type: 'UPDATE_GAME',
        payload: updates
    }));
}
