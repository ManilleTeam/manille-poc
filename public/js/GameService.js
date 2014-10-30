'use strict';

var GameService = function (gameChannel) {
    EventEmitter.call(this);
    this.gameChannel = gameChannel;
    this.state = this.STATE_NONE;
    this.init();
};
GameService.prototype = Object.create(EventEmitter.prototype);

GameService.prototype.STATE_NONE = 0;
GameService.prototype.STATE_LOBBY = 1;
GameService.prototype.STATE_GAME = 2;

GameService.prototype.init = function () {
    var _this = this;
    this.gameChannel.on('message', function (message) {
        console.log('[GameChannel] ' + JSON.stringify(message));
        switch (message.name) {
            case 'lobby.join':
                _this.state = _this.STATE_LOBBY;
                _this.emit('lobby.join', message.value);
                break;
            case 'chat.message':
                if (_this.state === _this.STATE_NONE) {
                    return;
                }
                _this.emit('chat.message', message.value);
                break;
            case 'player.new':
                if (_this.state === _this.STATE_NONE) {
                    return;
                }
                _this.emit('player.new', message.value);
                break;
            case 'player.quit':
                if (_this.state === _this.STATE_NONE) {
                    return;
                }
                _this.emit('player.quit', message.value);
                break;
            default:
                console.log('Missing handler: ' + message.name);
        }
    });
};

GameService.prototype.sendChatMessage = function (text) {
    this.gameChannel.emit('message', {
        name: 'chat.message',
        value: text
    });
};

GameService.prototype.join = function (name) {
    this.gameChannel.emit('message', {
        name: 'game.join',
        value: {
            name: name
        }
    });
};

GameService.prototype.getCurrentState = function () {
    return this.state;
};
