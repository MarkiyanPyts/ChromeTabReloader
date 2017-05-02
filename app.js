var WebSocketServer = require("websocketserver");
var server = new WebSocketServer("all", 9000);

server.on('connection', function(id) {
    console.log('connection open');
    server.sendMessage("one", "Welcome to the server!", id);
});

server.on("closedconnection", function(id) {
    console.log("Connection " + id + " has left the server");
});

server.on("message", function(data, id) {
    var mes = server.unmaskMessage(data);
    var str = server.convertToString(mes.message);
    console.log(str);
});

