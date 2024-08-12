const WebSocket = require('ws');

const playerCount = 4;
const players = [];

for (let i = 0; i < playerCount; i++) {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.on('open', () => {
        console.log(`Player ${i + 1} connected`);
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log(`Player ${i + 1} received:`, message);
    });

    ws.on('close', () => {
        console.log(`Player ${i + 1} disconnected`);
    });

    players.push(ws);
}

// Envia uma mensagem de exemplo depois que todos os jogadores estiverem conectados
setTimeout(() => {
    players.forEach((ws, index) => {
        ws.send(JSON.stringify({ type: 'play', action: 'example_action', playerId: index + 1 }));
    });
}, 2000);
