var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    // don't forget to start "redis-server"
    redis = require('redis'),
    redisClient = redis.createClient(),
    messages = [],
    storeMessage = function(name, data) {
        // turning object into a string to store in redis
        var message = JSON.stringify({
            name: name,
            data: data
        });

        redisClient.lpush('messages', message, function(err, response) {
            // keeps last 10 messages
            redisClient.ltrim('messages', 0, 9);
        });
    }

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(name, fn) {
        // set the nickname associated with this client
        client.nickname = name;
        client.broadcast.emit('add chatter', name);
        // add name to the set of chatters
        redisClient.sadd('chatters', name);
        // show names of all connected chatters to this client
        redisClient.smembers('chatters', function(err, chatters) {
            chatters.forEach(function(item) {
                client.emit('add chatter', item);
            });
        });
        // emit past 10 messages on this client
        redisClient.lrange('messages', 0, -1, function(err, messages) {
            // correct order of messages - oldest first
            messages = messages.reverse();
            messages.forEach(function(item) {
                item = JSON.parse(item);
                client.emit('messages', item.name + ': ' + item.data);
            });
            // callback
            fn(name + ' (you)');
        });
    });

    client.on('disconnect', function(name) {
        name = client.nickname;
        client.broadcast.emit('remove chatter', name);
        redisClient.srem('chatters', name);
    });

    client.on('messages', function(data) {
        console.log(data);
        var nickname = client.nickname;
        console.log(nickname);
        // broadcast a message to all other clients connected
        client.broadcast.emit('messages', nickname + ': ' + data);
        // emit the messages event to our client
        client.emit('messages', nickname + ': ' + data);
        //storing message that we've just received
        storeMessage(nickname, data);
    });
});
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/sources/index.html');
});
server.listen(8080);
