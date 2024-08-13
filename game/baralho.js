const Carta = require('./carta');

class Baralho {
    constructor() {
        this.cartas = [];
        const naipes = ['Ouros', 'Espadas', 'Copas', 'Paus'];
        const valores = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
        const forças = {
            '4': 1, '5': 2, '6': 3, '7': 4, 
            'Q': 5, 'J': 6, 'K': 7, 'A': 8, 
            '2': 9, '3': 10
        };

        for (let naipe of naipes) {
            for (let valor of valores) {
                this.cartas.push(new Carta(naipe, valor, forças[valor]));
            }
        }
    }

    embaralhar() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }

    distribuir() {
        return this.cartas.splice(0, 3);
    }
}

module.exports = Baralho;
