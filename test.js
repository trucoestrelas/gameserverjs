const WebSocket = require('ws');

const playerCount = 4;
const players = [];
const playersIds = [];
let playerCards = {};

// Conectando os quatro jogadores
for (let i = 0; i < playerCount; i++) {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.on('open', () => {
        console.log(`Player ${i + 1} connected`);
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        handleServerMessage(ws, i, message);
    });

    ws.on('close', () => {
        console.log(`Player ${i + 1} disconnected`);
    });

    players.push(ws);
}

function handleServerMessage(ws, playerIndex, message) {
    switch (message.type) {
        case 'welcome':
            playersIds.push(message.id);
            console.log(`Player ${playerIndex + 1} received ID: ${message.id}`);
            break;
 
        case 'cartas':
            console.log(`Player ${playerIndex + 1} received cards:`, message.cartas);
            playerCards[playerIndex] = message.cartas;
            if (Object.keys(playerCards).length === playerCount) {
                startPlaying();
            }
            break;

        case 'carta_jogada':
            console.log(`Player ${message.playerId} played:`, message.carta);
            break;
        
        case 'truco':
            break;
        
        case 'sua_vez':
            console.log(`Player ${message.jogador.id} está na sua vez`);
            jogar(ws, message.jogador);
            break;

        case 'rodada_vencida':
            console.log(`Rodada vencida pelo Time ${message.time_vencedor+1}. Scores:`, message.pontuacao);
            break;

        case 'jogo_terminado':
            console.log(`Jogo terminado. Vencedor: ${message.vencedor}`);
            process.exit(); // Encerra o script
            break;

        default:
            console.log('Mensagem desconhecida:', message);
    }
}

function jogar(ws, jogador){
        console.log('Jogador', jogador.id, 'jogando carta...');
        //console.log(playersIds)

        setTimeout(() => {
            const index = playersIds.findIndex(currentPlayer => currentPlayer === jogador.id);
            console.log(index)
            ws.send(JSON.stringify({ type: 'jogar', carta: 0 })); 
    }, 2000);

}

function startPlaying() {
    console.log('Todos os jogadores receberam suas cartas. Iniciando jogadas...');
}
