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
            this.port = items.port || '8001';
        }.bind(this));
    },

    getTabsToReload: function (callback) {
        var tabsToReload = [];

        chrome.storage.sync.get(['hostName'], function(items) {
            if (!items.hostName) {
                chrome.tabs.query({active: true}, function(tabs) {
                    tabs.forEach(function (tab) {
                        tabsToReload.push(tab);
                    });

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
            fileExt = file.slice(fileExtIndex),
            fileNameStandardize = file.replace(/\\/g, '\/'),
            indexOfLastSeparator = fileNameStandardize.lastIndexOf('/') + 1,
            fileName = file.slice(indexOfLastSeparator);

            if (file != 'pong' && file.indexOf('connected to server!!!') == -1) {
                if (fileExt === 'css') {
                    this.getTabsToReload(function (tabsToReload) {
                        tabsToReload.forEach(function (tab) {
                            chrome.tabs.sendMessage(tab.id, {file: fileName}, function(response) {
                                console.log('message sent');
                            });
                        });
                    });
                } else {
                    this.getTabsToReload(function (tabsToReload) {
                        tabsToReload.forEach(function (tab) {
                            chrome.tabs.update(tab.id, {url: tab.url});
                        });
                    });
                }
            } else {
                if (file == 'pong') {
                    this.isAlive = true;
                }
            }
        }.bind(this);

        this.socket.addEventListener('close', function (ev) {
            console.log('connection Closed')
            clearInterval(this.aliveInterval);
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
            this.isAlive = true;
            this.aliveInterval = setInterval(function () {
                this.checkIfAlive();
            }.bind(this), 2500);

            this.getTabsToReload(function (tabsToReload) {
                tabsToReload.forEach(function (tab) {
                    chrome.tabs.update(tab.id, {url: tab.url});
                });
            });
            

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
            this.socket.send('ping');

            if (this.isConnected) {
                this.stayConnected();
            }
        }.bind(this), 1000);
    },

    checkIfAlive: function () {
        this.isAlive = false;

        setTimeout(function () {
            console.log(this.isAlive)
            if (!this.isAlive) {
                console.log(this.isAlive)
                this.disconnectFromServer();
            }
        }.bind(this), 2000);
    },

    init: function () {
        this.setPort();
        this.initListeners();
    }
}

window.onload = new tabReloader();