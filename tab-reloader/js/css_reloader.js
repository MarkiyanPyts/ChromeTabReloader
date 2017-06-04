(function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        var currentVersion = null,
            incrementedVersion = null,
            setUrl = null;

        var filter   = Array.prototype.filter,
            matches = document.querySelectorAll('link'),
            filtered = filter.call(matches, function(item) {
                return item.href.indexOf(request.file) != -1;
            });

        if (filtered.length) {
            currentVersion = getParameterByName('v', filtered.href);

            if (currentVersion !== null) {
                incrementedVersion = parseInt(currentVersion) + 1;
                filtered[0].href = updateUrlParameter(filtered[0].href, 'v', incrementedVersion);
            } else {
                filtered[0].href = updateUrlParameter(filtered[0].href, 'v', 1);
            }
        }
    });

    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }

        name = name.replace(/[\[\]]/g, "\\$&");

        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);

        if (!results) {
            return null;
        };

        if (!results[2]) {
            return '';
        };

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function updateUrlParameter(uri, key, value) {
        // remove the hash part before operating on the uri
        var i = uri.indexOf('#');
        var hash = i === -1 ? ''  : uri.substr(i);
            uri = i === -1 ? uri : uri.substr(0, i);

        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            uri = uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            uri = uri + separator + key + "=" + value;
        }
        return uri + hash;  // finally append the hash as well
    }
})();