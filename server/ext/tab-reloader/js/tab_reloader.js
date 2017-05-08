/*document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function() {

    chrome.tabs.getSelected(null, function(tab) {
      d = document;

      alert(tab.url);
    });
  }, false);
  
  var nativePort = chrome.runtime.connectNative(NATIVE_HOST_NAME);
  var nativePort.onMessage.addListener(onNativeMessage);
}, false);*/

function tabReloader() {
    tabReloader.prototype.isEnabled = false;
    tabReloader.prototype.socket = false;
    tabReloader.prototype.isConnected = false;
    tabReloader.prototype.port = false;
    tabReloader.prototype.pluginName = "Tab Reloader";

    tabReloader.prototype.init();
};

tabReloader.prototype = {
    initListeners: function () {
        chrome.browserAction.onClicked.addListener(function(tab) {
            this.connectToServer();
        }.bind(this));
    },

    setPort: function () {
        chrome.storage.sync.get(['port'], function(items) {
            this.port = items.port || '9000';
        }.bind(this));
    },

    initSocketListeners: function () {
        this.socket.onmessage = function (ev) {
            alert(ev.data);
        }.bind(this);

        this.socket.addEventListener('close', function (ev) {
            this.socket.send('Server connection closed.');
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
            initSocketListeners();

            chrome.browserAction.setIcon({
                path: {
                    "16": "img/icon_active_16.png",
                    "24": "img/icon_active_24.png",
                    "32": "img/icon_active_32.png"
                }
            });
        }.bind(this));
    },

    init: function () {
        this.setPort();
        this.initListeners();
    }
}

window.onload = new tabReloader();