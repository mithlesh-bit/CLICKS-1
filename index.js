document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded");

    var config = {
        userSessionID: getDefaultSessionID(),
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true,
        adminID: getAdminId(),
        deviceType: getDeviceType()
    };

    function getAdminId() {
        var adminIdMetaTag = document.querySelector('meta[name="admin-id"]');
        return adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId';
    }

    function getTokenName() {
        var tokenNameMetaTag = document.querySelector('meta[name="token-name"]');
        return tokenNameMetaTag ? tokenNameMetaTag.content : 'jwt'; // Default to 'jwt'
    }

    function getDefaultSessionID() {
        var tokenName = getTokenName();
        var token = sessionStorage.getItem(tokenName) ||
            localStorage.getItem(tokenName) ||
            getCookie(tokenName);

        return token || 'unidentifiedUser';
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/mobile/i.test(userAgent)) {
            return 'Mobile';
        } else if (/tablet/i.test(userAgent)) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }

    function logInteraction(detail) {
        detail.deviceType = config.deviceType;

        fetch(config.serverURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detail),
        })
            .then(response => response.ok ? response.json() : Promise.reject('HTTP error! status: ' + response.status))
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
            value: eventType === 'input' ? element.value.substring(0, 50) : undefined,
            userSessionID: config.userSessionID
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