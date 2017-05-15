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

    getTabsToReload: function (callback) {
        var tabsToReload = [];

        chrome.storage.sync.get(['hostName'], function(items) {
            if (!items.hostName) {
                chrome.tabs.query({active: true}, function(tabs) {
                    tabsToReload.push(tabs[0]);
                    callback(tabsToReload);
                });
            } else {
                chrome.tabs.query({}, function(tabs) {
                    tabs.forEach(function (tab) {
                        if (tab.url.indexOf(items.hostName) != -1) {
                            tabsToReload.push(tab);
                        }
                    });

                    callback(tabsToReload);
                });
            }
        }.bind(this));
    },

    initSocketListeners: function () {
        var fileExtIndex,
            fileExt,
            file;

        this.socket.onmessage = function (ev) {
            file = ev.data.toString();
            fileExtIndex = file.lastIndexOf('.') + 1;
            fileExt = file.slice(fileExtIndex);

            if (file != '1' && file.indexOf('connected to server!!!') == -1) {
                if (fileExt === 'css') {
                    this.getTabsToReload(function (tabsToReload) {
                        tabsToReload.forEach(function (tab) {
                            chrome.tabs.update(tab.id, {url: tab.url});
                        });
                    });
                    console.log('css file')
                } else {
                    this.getTabsToReload(function (tabsToReload) {
                        tabsToReload.forEach(function (tab) {
                            chrome.tabs.update(tab.id, {url: tab.url});
                        });
                    });
                }
            }
        }.bind(this);

        this.socket.addEventListener('close', function (ev) {
            console.log('connection Closed')
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
            this.stayConnected();

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

    stayConnected: function () {
        setTimeout(function () {
            this.socket.send('1');

            if (this.isConnected) {
                this.stayConnected();
            }
        }.bind(this), 10000);
    },

    init: function () {
        this.setPort();
        this.initListeners();
    }
}

window.onload = new tabReloader();