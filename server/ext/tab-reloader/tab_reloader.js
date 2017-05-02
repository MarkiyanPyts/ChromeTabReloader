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
    tabReloader.prototype.init();
};

tabReloader.prototype = {
    initListeners: function () {
        var socket = new WebSocket("ws://localhost:9000");

        socket.onmessage = function (event) {
            alert(event.data);
        }

        socket.addEventListener('open', function (event) {
            socket.send('Hello Server!');
        });
    },

    init: function () {
        console.log(this);
        this.initListeners();
    }
}

window.onload = tabReloader;