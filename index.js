document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded");

    var config = {
        userSessionID: 'defaultSessionID', // Set a default value initially
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true,
        adminID: 'unknownAdminId', // Default value
    };

    // Call these functions after DOMContentLoaded to ensure meta tags are accessible
    config.adminID = getAdminId();
    config.userSessionID = getDefaultSessionID(); // Update the sessionID with actual token

    function getAdminId() {
        var adminIdMetaTag = document.querySelector('meta[name="admin-id"]');
        return adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId';
    }

    function getTokenName() {
        var tokenNameMetaTag = document.querySelector('meta[name="token-name"]');
        return tokenNameMetaTag ? tokenNameMetaTag.content : null;
    }

    function getDefaultSessionID() {
        var tokenName = getTokenName();
        if (!tokenName) {
            console.log("Token name not found in meta tags.");
            return 'defaultSessionID';
        }

        // Try retrieving the token from all possible storage options
        var token = sessionStorage.getItem(tokenName) ||
            localStorage.getItem(tokenName) ||
            getCookie(tokenName);

        if (token) {
            console.log("Token found: ", token);
            return token;
        } else {
            console.log("Token not found in storage.");
            return 'defaultSessionID';
        }
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }


    function getBrowserInfo() {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return {
            name: M[0],
            version: M[1]
        };
    }

    function logInteraction(detail) {
        var browserInfo = getBrowserInfo();
        detail.browserName = browserInfo.name;
        detail.browserVersion = browserInfo.version;
        detail.currentURL = window.location.href;

        if (config.logConsole) console.log('Interaction logged:', detail);

        fetch(config.serverURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detail),
        })
            .then(response => response.ok ? response.json() : Promise.reject('HTTP error! status: ' + response.status))
            .then(data => console.log('Data successfully sent to the server:', data))
            .catch(error => console.error('Error sending data to the server:', error));
    }

    function handleEvent(event, eventType) {
        var element = event.target;
        var elementIdentifier = getElementIdentifier(element);
        var detail = {
            eventType: eventType,
            identifier: elementIdentifier,
            timestamp: new Date().toISOString(),
            pageTitle: document.title,
            value: eventType === 'input' ? element.value.substring(0, 50) : undefined
        };
        logInteraction(detail);
    }

    function getElementIdentifier(element) {
        var identifierParts = [];
        if (element.id) identifierParts.push('ID: ' + element.id);
        if (element.className) identifierParts.push('Class: ' + element.className.split(' ').join('.'));
        if (element.name) identifierParts.push('Name: ' + element.name);
        if (element.tagName) identifierParts.push('Tag: ' + element.tagName.toLowerCase());
        var textContent = element.textContent || element.innerText;
        if (textContent && textContent.trim().length > 0 && textContent.trim().length < 50) {
            identifierParts.push('Text: ' + textContent.trim());
        }
        return identifierParts.join(', ') || 'No specific identifier';
    }

    function attachEventListeners() {
        document.addEventListener('click', function (event) {
            handleEvent(event, 'click');
        });
        document.querySelectorAll('input[type="text"], textarea').forEach(function (input) {
            input.addEventListener('input', function (event) {
                handleEvent(event, 'input');
            });
        });
    }

    attachEventListeners();

    // Update config functionality, if needed
    window.TrackUserInteraction = {
        setConfig: function (userConfig) {
            Object.assign(config, userConfig);
            if (userConfig.tokenName || userConfig.adminID) {
                // Re-fetch token/adminID if new names are provided
                config.adminID = getAdminId();
                config.userSessionID = getDefaultSessionID();
            }
            console.log('Config updated', config);
            attachEventListeners();
        }
    };
});