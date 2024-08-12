const Game = require('./game');
const Player = require('./player');

class GameRoom {
    constructor() {
        this.players = [];
        this.game = new Game();
    }

    addPlayer(ws) {
        if (this.players.length < 4) {
            const player = new Player(ws);
            this.players.push(player);
            ws.send(JSON.stringify({ type: 'welcome', id: player.id }));
            if (this.players.length === 4) {
                this.game.start(this.players);
            }
        } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Sala cheia' }));
            ws.close();
        }
    }

    removePlayer(ws) {
        this.players = this.players.filter(player => player.ws !== ws);
        if (this.players.length < 4) {
            this.game.stop();
        }
    }

    handleMessage(ws, message) {
        const player = this.players.find(player => player.ws === ws);
        if (player) {
            this.game.handleMessage(player, message);
        }
    }
}

module.exports = GameRoom;
