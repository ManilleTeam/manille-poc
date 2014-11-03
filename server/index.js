var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var AsyncInjector = require('async-injector');
var Promise = require('bluebird');
var morgan = require('morgan');

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
    app.use(morgan());
    app.use(express.static(__dirname + '/../public'));
    return app;
});

injector.value('players', []);

injector.value('loggerFactory', function (topic) {
    return function (str) {
        console.log('[' + new Date().toUTCString() + '] ' + topic + ' "' + str + '"');
    };
});

injector.factory('gameLogger', function (loggerFactory) {
    return loggerFactory('game');
});

injector.factory('gameChannel', function (io, players, idgen, gameLogger) {
    var gameChannel = io.of('/game');

    gameChannel.use(function (socket, cb) {
        socket.data = {};
        cb();
    });

    gameChannel.on('connection', function (socket) {
        gameLogger('game connexion');

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
            gameLogger('game handler ' + data.name);
            var handler = handlers[data.name];
            if (handler) {
                handlers[data.name](data.value);
            } else {
                gameLogger('game missing handler ' + data.name);
            }
        });

        socket.on('disconnect', function () {
            gameLogger('game disconnect');
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
