const Baralho = require('./baralho');

class Game {
    constructor() {
        this.players = [];
        this.currentRound = 0;
        this.scores = [0, 0]; // Pontuação dos dois times
        this.cartasJogadas = [];
        this.baralho = new Baralho();
    }

    start(players) {
        this.players = players;
        this.baralho.embaralhar();
        this.distribuirCartas();
        this.broadcast({ type: 'start', message: 'O jogo começou!' });
    }

    distribuirCartas() {
        for (let player of this.players) {
            player.cartas = this.baralho.distribuir();
            player.ws.send(JSON.stringify({ type: 'cartas', cartas: player.cartas }));
        }
    }

    handleMessage(player, message) {
        const data = JSON.parse(message);

        if (data.type === 'jogar') {
            this.jogarCarta(player, data.carta);
        }
    }

    jogarCarta(player, carta) {
        this.cartasJogadas.push({ player, carta });
        this.broadcast({ type: 'carta_jogada', playerId: player.id, carta });

        if (this.cartasJogadas.length === 4) {
            this.avaliarRodada();
        }
    }

    avaliarRodada() {
        let maiorCarta = this.cartasJogadas[0];
        for (let jogada of this.cartasJogadas) {
            if (jogada.carta.forca > maiorCarta.carta.forca) {
                maiorCarta = jogada;
            }
        }

        const vencedor = maiorCarta.player;
        const timeVencedor = this.players.indexOf(vencedor) % 2;
        this.scores[timeVencedor] += 1;

        this.broadcast({ type: 'rodada_vencida', vencedor: vencedor.id, scores: this.scores });

        this.cartasJogadas = [];

        if (this.scores[timeVencedor] === 12) {
            this.broadcast({ type: 'jogo_terminado', vencedor: `Time ${timeVencedor + 1}` });
            this.resetGame();
        } else {
            this.currentRound++;
            this.distribuirCartas();
        }
    }

    resetGame() {
        this.scores = [0, 0];
        this.currentRound = 0;
        this.cartasJogadas = [];
        this.baralho = new Baralho();
        this.start(this.players);
    }

    broadcast(message) {
        this.players.forEach(player => player.ws.send(JSON.stringify(message)));
    }
}

module.exports = Game;
