const WebSocket = require('ws');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.eventHandlers = {};

        this.wss.on('connection', (ws) => {
            console.log('Novo jogador conectado');
            if (this.eventHandlers['connection']) {
                this.eventHandlers['connection'](ws);
            }
        });
    }

    on(event, handler) {
        this.eventHandlers[event] = handler;
    }
}

module.exports = WebSocketServer;
