const Baralho = require('./baralho');

class Game {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.pontuacao = [0, 0];
        this.turnos = [0, 0];
        this.cartasJogadas = [];
        this.baralho = new Baralho();
        this.idxStart = 0
        this.valorTentoRound = 1
        this.vencedorTurno = []
        this.jogadorVez = null
        this.aguardandoJogada = false
    }

    start(players) {
        this.players = players;
        this.broadcast({ type: 'start', message: 'O jogo começou!' });
        this.startRound();
    }

    startRound() {
        this.broadcast({ type: 'round', message: 'O round começou!' });
        this.baralho.embaralhar();
        this.distribuirCartas();

        this.proximo(this.players[this.idxStart]);
    }

    proximo(player) {
        this.jogadorVez = player
        this.aguardandoJogada = true
        this.broadcast({ type: 'sua_vez', jogador: player });
    }

    getTeam(player) {
        return this.players.indexOf(player) % 2;
    }

    getEnemyTeam(player) {
        return (this.players.indexOf(player) + 1) % 2;
    }
    getNextPlayerOnTable(player) {  
        const index = this.players.findIndex(currentPlayer => currentPlayer === player);
        let nextIndex = index + 1;
        if (nextIndex > 3) {
            nextIndex = 0;
        }
        return this.players[nextIndex];
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
        if (data.type === 'truco') {
            this.handleTruco(player);
        }
        if (data.type === 'aceitar') {
            this.handleAceitar(player);
        }
        if (data.type === 'fugir') {
            this.handleFugir(player);
        }
    }

    handleAcaoTruco(player) {
        this.jogadorVez = player
        const nextPlayer = this.getNextPlayerOnTable(player)
        this.broadcast({ type: 'aceitar_truco', jogador: nextPlayer});
        this.proximo(nextPlayer);
    }

    handleAceitar(player) {
        this.broadcast({ type: 'aceito', playerId: player.id });
    }

    handleFugir(player) {
        if (this.valorTentoRound === 1){
            this.valorTentoRound = 1;
        } else if(this.valorTentoRound === 3){
            this.valorTentoRound = 1;
        } else if(this.valorTentoRound === 6){
            this.valorTentoRound = 3;
        } else if(this.valorTentoRound === 9){
            this.valorTentoRound = 6;
        } else if(this.valorTentoRound === 12){
            this.valorTentoRound = 9;
        }
        this.broadcast({ type: 'fugiu', playerId: player.id });
        this.finalizarRound(true)
    }

    handleTruco(player) {
        if (this.valorTentoRound === 1){
            this.broadcast({ type: 'truco',playerId: player.id });
            this.valorTentoRound = 3;
        } else if(this.valorTentoRound === 3){
            this.broadcast({ type: 'seis',playerId: player.id });
            this.valorTentoRound = 6;
        } else if(this.valorTentoRound === 6){
            this.broadcast({ type: 'nove',playerId: player.id });
            this.valorTentoRound = 9;
        } else if(this.valorTentoRound === 9){
            this.broadcast({ type: 'doze',playerId: player.id });
            this.valorTentoRound = 12;
        }
        
    }

    jogarCarta(player, idxCarta) {
        console.log('Jogador', player.id, 'jogan22do carta...');
        if (player !== this.jogadorVez || !this.aguardandoJogada) { return; }
        this.aguardandoJogada = false;
        console.log('Jogador', player.id, 'jogando ');

        if (idxCarta > 3){
            idxCarta = 0
        }
        const carta = player.cartas[idxCarta]
        player.cartas.splice(idxCarta, 1);
        
        this.cartasJogadas.push({ player, carta });
        this.broadcast({ type: 'carta_jogada', playerId: player.id, carta });

        if (this.cartasJogadas.length === 4) {
            this.avaliarTurno();
        }else{
            const index = this.players.findIndex(currentPlayer => currentPlayer === player);
            let nextIndex = index + 1;
            if (nextIndex > 3) {
                nextIndex = 0;
            }   
            this.proximo(this.players[nextIndex]);
        }
    }


    avaliarTurno() {
        if (this.cartasJogadas.length !== 4) {
            console.error("Erro: Avaliação de rodada iniciada sem todas as cartas jogadas.");
            return;
        }
    
        let maiorCarta = null;
    
        //TODO: Verificar no caso de empate quem fez a primeita jogada 
        for (let jogada of this.cartasJogadas) {
            if (jogada.carta && jogada.carta.forca !== undefined) {
                if (!maiorCarta || jogada.carta.forca > maiorCarta.carta.forca) {
                    maiorCarta = jogada;
                }
            } else {
                console.error("Erro: Carta inválida encontrada na jogada.", jogada);
            }
        }
    
        if (maiorCarta) {
            const vencedor = maiorCarta.player;
            const timeVencedor = this.players.indexOf(vencedor) % 2;
            this.turnos[timeVencedor] += 1;
            this.vencedorTurno.push(vencedor)

            this.finalizarRound(timeVencedor, false, vencedor);
        } else {
            console.error("Erro: Não foi possível determinar a maior carta.");
        }
    }

    finalizarRound(timeVencedor, fugiu, vencedor){
        this.cartasJogadas = [];
        if (this.turnos[timeVencedor] === 2 || fugiu) {
            this.pontuacao[timeVencedor] += this.valorTentoRound;
            this.broadcast({ type: 'rodada_vencida', time_vencedor: timeVencedor, pontuacao: this.pontuacao });
           
            
           this.nextRound()
        }else{
            this.broadcast({ type: 'turno_vencido', time_vencedor: timeVencedor, turnos: this.turnos });
            this.proximo(vencedor);
        }
    }

    verificaFimJogo() {
        return  this.pontuacao[0] === 12 || this.pontuacao[1] === 12;
    }
    
    nextRound()
    {
        this.currentRound++;
        this.turnos = [0, 0];
        this.cartasJogadas = [];
        this.valorTentoRound = 1;
        this.vencedorTurno = [];
        this.baralho = new Baralho();

        this.idxStart = this.idxStart + 1;
        if (this.idxStart > 3) {
            this.idxStart = 0;
        }
        if (!this.verificaFimJogo()) {
            this.turnos = [0, 0];
            this.startRound();
        }else{
            if (this.pontuacao[0] === 12){
                this.broadcast({ type: 'jogo_terminado', vencedor: `Time 1` });
            }else{
                this.broadcast({ type: 'jogo_terminado', vencedor: `Time 2` });
            }
        }
    }

    resetGame() {
        this.pontuacao = [0, 0];
        this.currentRound = 1;
        this.turnos = [0, 0];
        this.cartasJogadas = [];
        this.baralho = new Baralho();
        this.start(this.players);
    }

    broadcast(message) {
        this.players.forEach(player => player.ws.send(JSON.stringify(message)));
    }
}

module.exports = Game;
