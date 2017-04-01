var chromeBridge = require('./chrome-bridge');

//send a message to chrome
chromeBridge.sendMessage({text:'hello chrome!'});

//listen message from chrome
/*chromeBridge.on('message', function(msg){
    console.log('received from chrome:', msg);
});*/
