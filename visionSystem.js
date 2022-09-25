import ws from 'socket.io';

const visionSystem = {
    setUp: false,
    connection: null,

    moveLeft: async function(units) {
        if (!Number.isInteger(units)) {
            throw new Error('units must be a number')
        }

        this._move(units, 'left');
    },

    moveRight: async function(units) {
        if (!Number.isInteger(units)) {
            throw new Error('units must be a number')
        }

        this._move(units, 'right');
    },

    moveUp: async function(units) {
        if (!Number.isInteger(units)) {
            throw new Error('units must be a number')
        }

        await this._move(units, 'up');
    },

    moveDown: async function(units) {
        if (!Number.isInteger(units)) {
            throw new Error('units must be a number')
        }

        await this._move(units, 'down');
    },

    _move: async function(units, direction) {
        await this.establishConnection();
    },

    establishConnection: async function() {
        if (this.connection != null) return;
        
    }
};

module.exports = visionSystem;