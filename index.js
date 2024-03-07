document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded");

    var config = {
        userSessionID: getDefaultSessionID(), // This will now also handle logging
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true,
        adminID: getAdminId(),
    };

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
            console.log("Token name not specified.");
            return 'defaultSessionID';
        }

        var token = sessionStorage.getItem(tokenName) ||
            localStorage.getItem(tokenName) ||
            getCookie(tokenName);

        if (token) {
            console.log("Token found: ", token); // Log the found token
            return token;
        } else {
            console.log("Unidentified user"); // Token not found
            return 'unidentifiedUser'; // Use a different identifier for clarity
        }
    }

    function getCookie(name) {
        console.log("All cookies currently:", document.cookie); // Log all cookies

        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) {
                var cookieValue = c.substring(nameEQ.length);
                console.log("Cookie found - Name:", name, "Value:", cookieValue);
                return cookieValue;
            }
        }

        console.log("Cookie not found:", name);
        return null;
    }

    // Attempt to retrieve the JWT token after the DOM content has loaded
    document.addEventListener('DOMContentLoaded', function () {
        var jwtToken = getCookie('jwt');
        if (jwtToken) {
            console.log("JWT Token:", jwtToken);
            // Continue with your logic using the token
        } else {
            console.log("Unidentified user - No JWT Token found");
            // Handle the absence of the token
        }
    });

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

    window.TrackUserInteraction = {
        setConfig: function (userConfig) {
            Object.assign(config, userConfig);
            if (userConfig.tokenName || userConfig.adminID) {
                config.adminID = getAdminId();
                config.userSessionID = getDefaultSessionID(); // Re-fetch and log appropriately
            }
            console.log('Config updated', config);
            attachEventListeners();
        }
    };
});