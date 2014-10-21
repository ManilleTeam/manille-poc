'use strict';

var LobbyController = function ($scope, gameService) {
    this.chatMessage = '';
    this.chatHistory = [];
    this.players = {};
    this.gameService = gameService;
    this.$scope = $scope;
    this.init();
};

LobbyController.prototype.init = function () {
    var _this = this;
    this.gameService.on('chat.message', function (message) {
        _this.$scope.$apply(function () {
            _this.chatHistory.push(message);
        });
    });
    this.gameService.on('player.new', function (player) {
        _this.$scope.$apply(function () {
            if (!_this.players[player.id]) {
                _this.players[player.id] = player;
            } else {
                merge(player, _this.players[player.id]);
            }
            _this.chatHistory.push({
                author: 'system',
                text: '<le joueur ' + player.name + ' est arrivé>'
            });
        });
    });
    this.gameService.on('lobby.join', function (data) {
        _this.$scope.$apply(function () {
            data.players.forEach(function (player) {
                _this.players[player.id] = player;
            });
        });
    });
    this.gameService.on('player.quit', function (playerId) {
        _this.$scope.$apply(function () {
            if (_this.players[playerId]) {
                _this.chatHistory.push({
                    author: 'system',
                    text: '<le joueur ' + _this.players[playerId].name + ' est parti>'
                });
            }
            delete _this.players[playerId];
        });
    });
};

LobbyController.prototype.sendChatMessage = function () {
    this.gameService.sendChatMessage(this.chatMessage);
    this.chatMessage = '';
};

LobbyController.prototype.join = function () {
    this.gameService.join(this.name);
};

LobbyController.prototype.hasJustArrived = function () {
    return this.gameService.getCurrentState() === this.gameService.STATE_NONE;
};

LobbyController.prototype.isInLobby = function () {
    return this.gameService.getCurrentState() === this.gameService.STATE_LOBBY;
};
