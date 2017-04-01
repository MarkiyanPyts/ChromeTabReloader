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

window.onload = init;

function init() {
    var exampleSocket = new WebSocket("ws://localhost:9000");
    
    exampleSocket.onmessage = function (event) {
      alert(event.data);
    }
}
