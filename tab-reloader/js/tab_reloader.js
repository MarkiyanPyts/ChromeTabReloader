function tabReloader() {
    tabReloader.prototype.socket = false;
    tabReloader.prototype.isConnected = false;
    tabReloader.prototype.port = false;
    tabReloader.prototype.pluginName = "Tab Reloader";

    tabReloader.prototype.init();
};

tabReloader.prototype = {
    initListeners: function () {
        chrome.browserAction.onClicked.addListener(function(tab) {
            if (!this.isConnected) {
                this.connectToServer();
            } else {
                this.disconnectFromServer();
            }
        }.bind(this));
    },

    setPort: function () {
        chrome.storage.sync.get(['port'], function(items) {
            this.port = items.port || '9000';
        }.bind(this));
    },

    initSocketListeners: function () {
        this.socket.onmessage = function (ev) {
            console.log(ev.data);
        }.bind(this);

        this.socket.addEventListener('close', function (ev) {
            chrome.browserAction.setIcon({
                path: {
                    "16": "img/icon_disabled_16.png",
                    "24": "img/icon_disabled_24.png",
                    "32": "img/icon_disabled_32.png"
                }
            });
            this.isConnected = false;
        }.bind(this));
    },

    connectToServer: function () {
        this.socket = new WebSocket("ws://localhost:" + this.port);

        this.socket.addEventListener('error', function (ev) {
            this.isConnected = false;
            alert('Error connecting to websocket server, make sure it\'s running and port ' + this.port + ' is not occupied by other process');
        }.bind(this));

        this.socket.addEventListener('open', function (ev) {
            this.isConnected = true;
            this.socket.send(this.pluginName + ' connected to server!!!');
            this.initSocketListeners();

            chrome.browserAction.setIcon({
                path: {
                    "16": "img/icon_active_16.png",
                    "24": "img/icon_active_24.png",
                    "32": "img/icon_active_32.png"
                }
            });
        }.bind(this));
    },

    disconnectFromServer: function () {
        this.socket.close();
    },

    init: function () {
        this.setPort();
        this.initListeners();
    }
}

window.onload = new tabReloader();