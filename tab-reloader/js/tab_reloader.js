function tabReloader() {
    tabReloader.prototype.socket = false;
    tabReloader.prototype.isConnected = false;
    tabReloader.prototype.port = false;
    tabReloader.prototype.tabsToReload = [];
    tabReloader.prototype.isActiveTab = false;
    tabReloader.prototype.isAlive = false;
    tabReloader.prototype.pluginName = "Tab Reloader";

    tabReloader.prototype.init();
};

tabReloader.prototype = {
    initListeners: function () {
        chrome.browserAction.onClicked.addListener(function (tab) {
            if (!this.isConnected) {
                this.connectToServer();
            } else {
                if (!this.isActiveTab) {
                    this.getActiveTab(function (tab) {
                        if (tab) {
                            this.addTabToTabsToReload(tab);
                            this.updateIconState(tab);
                        }

                        this.tabsToReload.forEach(function (tab) {
                            chrome.tabs.update(tab.id, {url: tab.url});
                        });
                    }.bind(this));
                } else {
                    if (this.tabsToReload.length > 1) {
                        this.getActiveTab(function (tab) {
                            if (tab) {
                                this.removeFromTabsToReload(tab);
                                this.updateIconState(tab);
                            }
                        }.bind(this));
                    } else {
                        this.resetTabsToReload();
                        this.disconnectFromServer();
                    }
                }
            }
        }.bind(this));

        

        chrome.tabs.onHighlightChanged.addListener(function () {
            this.getActiveTab(function (tab) {
                this.updateIconState(tab);
            }.bind(this));
        }.bind(this));

        chrome.windows.onFocusChanged.addListener(function () {
            this.getActiveTab(function (tab) {
                this.updateIconState(tab);
            }.bind(this));
        }.bind(this));

        chrome.tabs.onRemoved.addListener(function () {
            this.updateTabsToReload();
        }.bind(this));
    },
    

    setPort: function () {
        chrome.storage.sync.get(['port'], function(items) {
            this.port = items.port || '8001';
        }.bind(this));
    },

    getActiveTab: function (callback) {
        var activeTab = false;

        chrome.windows.getCurrent({populate:true}, function (window) {
            window.tabs.forEach(function (tab) {
                if (tab.active) {
                    activeTab = tab;
                }
            });

            callback(activeTab);
        });
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
            file,
            fileNameStandardize,
            indexOfLastSeparator,
            fileName;

        this.socket.onmessage = function (ev) {
            file = ev.data.toString();
            fileExtIndex = file.lastIndexOf('.') + 1;
            fileExt = file.slice(fileExtIndex);
            fileNameStandardize = file.replace(/\\/g, '\/');
            indexOfLastSeparator = fileNameStandardize.lastIndexOf('/') + 1;
            fileName = file.slice(indexOfLastSeparator);

            if (file != 'pong' && file.indexOf('connected to server!!!') == -1) {
                if (fileExt === 'css') {
                    this.tabsToReload.forEach(function (tab) {
                        chrome.tabs.sendMessage(tab.id, {file: fileName}, function(response) {
                            console.log('message sent');
                        });
                    });
                } else {
                    this.tabsToReload.forEach(function (tab) {
                        chrome.tabs.update(tab.id, {url: tab.url});
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
            this.showDisabledIcon();
            this.isConnected = false;
        }.bind(this));
    },

    updateIconState: function (currentTab) {
        var isActive = false;

        this.tabsToReload.forEach(function (tab) {
            if (tab.id == currentTab.id) {
                isActive = true;
            }
        });

        if (isActive) {
            this.showEnabledIcon();
        } else {
            this.showDisabledIcon();
        }
    },

    showDisabledIcon: function () {
        this.isActiveTab = false;
        chrome.browserAction.setIcon({
            path: {
                "16": "img/icon_disabled_16.png",
                "24": "img/icon_disabled_24.png",
                "32": "img/icon_disabled_32.png"
            }
        });
    },

    showEnabledIcon: function () {
        this.isActiveTab = true;
        chrome.browserAction.setIcon({
            path: {
                "16": "img/icon_active_16.png",
                "24": "img/icon_active_24.png",
                "32": "img/icon_active_32.png"
            }
        });
    },

    addTabToTabsToReload: function (tab) {
        this.tabsToReload.push(tab);
    },

    removeFromTabsToReload: function (activeTab) {
        this.tabsToReload.forEach(function (tab, index) {
            if (activeTab.id == tab.id) {
                this.tabsToReload.splice(index, 1);
            }
        }.bind(this));
    },

    updateTabsToReload: function () {
        this.tabsToReload.forEach(function (tab, index) {
            chrome.tabs.get(tab.id, function(tabs) {
                if (chrome.runtime.lastError) {
                    this.tabsToReload.splice(index, 1);
                }
            }.bind(this));
        }.bind(this));
    },

    resetTabsToReload: function () {
        this.tabsToReload = [];
    },

    connectToServer: function () {
        this.socket = new WebSocket("ws://localhost:" + this.port);

        this.socket.addEventListener('error', function (ev) {
            this.isConnected = false;
            this.resetTabsToReload();
            alert('Error connecting to websocket server, make sure it\'s running and port ' + this.port + ' is not occupied by other process');
        }.bind(this));

        this.socket.addEventListener('open', function (ev) {
            this.resetTabsToReload();
            this.isConnected = true;
            this.socket.send(this.pluginName + ' connected to server!!!');
            this.initSocketListeners();
            this.stayConnected();
            this.isAlive = true;
            this.aliveInterval = setInterval(function () {
                this.checkIfAlive();
            }.bind(this), 2500);

            this.getActiveTab(function (tab) {
                if (tab) {
                    this.addTabToTabsToReload(tab);
                }

                this.tabsToReload.forEach(function (tab) {
                    chrome.tabs.update(tab.id, {url: tab.url});
                });
            }.bind(this));

            this.showEnabledIcon();
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
            if (!this.isAlive) {
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