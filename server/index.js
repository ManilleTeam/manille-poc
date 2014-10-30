var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var AsyncInjector = require('async-injector');
var Promise = require('bluebird');

var injector = new AsyncInjector();

injector.value('PORT', 3000);

injector.factory('idgen', function () {
    var id = 0;
    return function () {
        return ++id;
    };
});

injector.factory('app', function () {
    var app = express();
    app.use(express.static(__dirname + '/../public'));
    return app;
});

injector.value('players', []);

injector.factory('gameChannel', function (io, players, idgen) {
    var gameChannel = io.of('/game');
    gameChannel.on('connection', function (socket) {
        console.log('game connexion');

        socket.data = {};
        socket.data.player = {
            id: idgen()
        };

        var handlers = {
            'chat.message': function (data) {
                gameChannel.emit('message', {
                    name: 'chat.message',
                    value: {
                        author: socket.data.player.name,
                        text: data
                    }
                });
            },
            'game.join': function (data) {
                socket.data.player.name = data.name;
                players.push(socket.data.player);
                gameChannel.emit('message', {
                    name: 'player.new',
                    value: socket.data.player
                });
                socket.emit('message', {
                    name: 'lobby.join',
                    value: {
                        players: players
                    }
                });
            }
        };

        socket.on('message', function (data) {
            console.log('game handler ' + data.name);
            var handler = handlers[data.name];
            if (handler) {
                handlers[data.name](data.value);
            } else {
                console.log('game missing handler ' + data.name);
            }
        });

        socket.on('disconnect', function () {
            console.log('game disconnect');
            for (var i = 0; i < players.length; i++) {
                if (players[i].id === socket.data.player.id) {
                    players.splice(i, 1);
                    break;
                }
            }
            gameChannel.emit('message', {
                name: 'player.quit',
                value: socket.data.player.id
            });
        });
    });
    return gameChannel;
});

injector.factory('io', function (server) {
    return socketio(server);
});

injector.factory('server', function (app) {
    return http.Server(app);
});

injector.inject(function (server, PORT, gameChannel) {
    server.listen(PORT, function () {
        console.log('Server listening on port ' + PORT);
    });
});
