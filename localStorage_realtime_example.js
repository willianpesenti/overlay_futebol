
// === PAINEL ADMINISTRATIVO ===
// admin.html - Controla as informações
function updateScore(homeTeam, awayTeam) {
    const data = {
        homeScore: homeTeam,
        awayScore: awayTeam,
        timestamp: Date.now()
    };

    // Salva no localStorage e dispara evento
    localStorage.setItem('footballData', JSON.stringify(data));

    // Força disparo do evento para a própria página
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'footballData',
        newValue: JSON.stringify(data),
        oldValue: localStorage.getItem('footballData')
    }));
}

// === PÁGINAS DE OVERLAY ===
// placar.html - Exibe apenas o placar
window.addEventListener('storage', function(e) {
    if (e.key === 'footballData') {
        const data = JSON.parse(e.newValue);
        document.getElementById('homeScore').textContent = data.homeScore;
        document.getElementById('awayScore').textContent = data.awayScore;
    }
});

// Carrega dados iniciais
window.addEventListener('load', function() {
    const data = JSON.parse(localStorage.getItem('footballData') || '{}');
    if (data.homeScore !== undefined) {
        document.getElementById('homeScore').textContent = data.homeScore;
        document.getElementById('awayScore').textContent = data.awayScore;
    }
});
