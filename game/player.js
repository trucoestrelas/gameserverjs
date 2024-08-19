const { v4: uuidv4 } = require('uuid');

class Player {
    constructor(ws) {
        this.id = uuidv4();
        this.ws = ws;
        this.cartas = [];
        this.isBot = false;
    }
}

module.exports = Player;
