
// === SERVIDOR NODE.JS EXPRESS ===
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Envia dados atuais
    res.write(`data: ${JSON.stringify(gameData)}\n\n`);

    // Adiciona cliente à lista
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// Função para broadcast
function broadcastUpdate(data) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

// === CLIENTE JAVASCRIPT ===
const eventSource = new EventSource('/events');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateDisplay(data);
};

eventSource.onerror = function(event) {
    console.log('SSE connection error:', event);
};
