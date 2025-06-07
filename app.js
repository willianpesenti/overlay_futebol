const data = {
  homeName: '',
  awayName: '',
  homeScore: 0,
  awayScore: 0,
  competition: '',
  period: ''
};

const channel = new BroadcastChannel('football');

function renderOverlay() {
  document.getElementById('homeName').textContent = data.homeName;
  document.getElementById('awayName').textContent = data.awayName;
  document.getElementById('homeScore').textContent = data.homeScore;
  document.getElementById('awayScore').textContent = data.awayScore;
  document.getElementById('competition').textContent = data.competition;
  document.getElementById('period').textContent = data.period;
}

function changeScore(side, delta) {
  if (side === 'home') data.homeScore += delta;
  if (side === 'away') data.awayScore += delta;
  broadcast();
}

function broadcast() {
  channel.postMessage(data);
  renderOverlay();
}

channel.onmessage = (e) => {
  Object.assign(data, e.data);
  renderOverlay();
};

window.onload = () => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'admin') {
    document.getElementById('admin').hidden = false;

    document.getElementById('input-home').oninput = (e) => {
      data.homeName = e.target.value;
      broadcast();
    };
    document.getElementById('input-away').oninput = (e) => {
      data.awayName = e.target.value;
      broadcast();
    };
    document.getElementById('input-competition').oninput = (e) => {
      data.competition = e.target.value;
      broadcast();
    };
    document.getElementById('input-period').oninput = (e) => {
      data.period = e.target.value;
      broadcast();
    };

  } else if (hash === 'full') {
    document.getElementById('overlay').hidden = false;
  }
};