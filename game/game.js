class Game {
    constructor() {
        this.players = [];
    }

    start(players) {
        this.players = players;
        this.broadcast({ type: 'start', message: 'O jogo começou!' });
    }

    stop() {
        this.broadcast({ type: 'stop', message: 'O jogo parou.' });
    }

    handleMessage(player, message) {
        const data = JSON.parse(message);
        //lógica para lidar com as mensagens do jogador
    }

    broadcast(message) {
        this.players.forEach(player => player.ws.send(JSON.stringify(message)));
    }
}

module.exports = Game;
