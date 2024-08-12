const { v4: uuidv4 } = require('uuid');

class Player {
    constructor(ws) {
        this.id = uuidv4();
        this.ws = ws;
    }
}

module.exports = Player;
