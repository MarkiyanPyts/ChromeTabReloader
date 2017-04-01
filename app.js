var WebSocketServer = require("websocketserver");
var server = new WebSocketServer("all", 9000);

server.on('connection', function(id) {
    console.log('hi');
    server.sendMessage("one", "Welcome to the server!", id);
});
