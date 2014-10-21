'use strict';

angular.module('manille', [])
    .factory('gameChannel', function () {
        return io.connect('/game');
    })
    .controller('LobbyController', LobbyController)
    .service('gameService', GameService);
