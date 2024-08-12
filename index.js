const http = require('http');
const WebSocketServer = require('./websocket/server');
const GameRoom = require('./game/room');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Servidor de Truco rodando.");
});

const wss = new WebSocketServer(server);
const room = new GameRoom();

wss.on('connection', (ws) => {
    room.addPlayer(ws);
    ws.on('message', (message) => {
        room.handleMessage(ws, message);
    });
    ws.on('close', () => {
        room.removePlayer(ws);
    });
});

server.listen(8080, () => {
    console.log('Servidor iniciado na porta :8080');
});
