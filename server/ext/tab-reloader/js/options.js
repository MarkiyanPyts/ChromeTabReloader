// Saves options to chrome.storage.sync.
function saveOptions() {
    var port = document.getElementById('port').value;

    chrome.storage.sync.set({
        port: port
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    });
}

function resetOptions() {
    chrome.storage.sync.set({
        port: "9000"
    }, function() {
        restoreOptions();
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get(['port'], function(items) {
        if (!items.port) {
            resetOptions();
            return;
        }

        document.getElementById('port').value = items.port;
    });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
    saveOptions);
document.getElementById('reset-defaults').addEventListener('click',
resetOptions);