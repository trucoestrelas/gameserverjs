const WebSocket = require('ws');

const playerCount = 4;
const players = [];
let playerCards = {};

// Conectando os quatro jogadores
for (let i = 0; i < playerCount; i++) {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.on('open', () => {
        console.log(`Player ${i + 1} connected`);
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        handleServerMessage(i, message);
    });

    ws.on('close', () => {
        console.log(`Player ${i + 1} disconnected`);
    });

    players.push(ws);
}

function handleServerMessage(playerIndex, message) {
    switch (message.type) {
        case 'welcome':
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

        case 'rodada_vencida':
            console.log(`Rodada vencida pelo Player ${message.vencedor}. Scores:`, message.scores);
            break;

        case 'jogo_terminado':
            console.log(`Jogo terminado. Vencedor: ${message.vencedor}`);
            process.exit(); // Encerra o script
            break;

        default:
            console.log('Mensagem desconhecida:', message);
    }
}

function startPlaying() {
    console.log('Todos os jogadores receberam suas cartas. Iniciando jogadas...');

    // Simulação de jogada para cada jogador
    players.forEach((ws, index) => {
        const cartaParaJogar = playerCards[index].pop();
        setTimeout(() => {
            console.log(`Player ${index + 1} joga:`, cartaParaJogar);
            ws.send(JSON.stringify({ type: 'jogar', carta: cartaParaJogar }));
        }, index * 1000); // Pequeno delay entre as jogadas
    });
}
