console.log("page loaded");

(function () {
    var config = {
        userSessionID: getDefaultSessionID(), // Dynamically set based on storage
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true,
        adminID: getAdminId() // Dynamically retrieve admin ID from meta tag
    };

    function getAdminId() {
        var adminIdMetaTag = document.querySelector('meta[name="admin-id"]');
        console.log('Admin ID:', adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId'); // Debug
        return adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId';
    }

    function getTokenName() {
        var tokenNameMetaTag = document.querySelector('meta[name="token-name"]');
        console.log('Token Name:', tokenNameMetaTag ? tokenNameMetaTag.content : null); // Debug
        return tokenNameMetaTag ? tokenNameMetaTag.content : null;
    }

    function getDefaultSessionID() {
        var tokenName = getTokenName();
        console.log('Retrieving token for:', tokenName); // Debug
        if (!tokenName) return 'defaultSessionID';

        var token = sessionStorage.getItem(tokenName) ||
            localStorage.getItem(tokenName) ||
            getCookie(tokenName);
        console.log('Token Retrieved:', token); // Debug
        return token || 'defaultSessionID';
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
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

    function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/android/i.test(userAgent)) return 'Android Mobile';
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'iOS Mobile';
        if (/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(userAgent)) return 'Mobile';
        return 'Desktop';
    }

    function logInteraction(detail) {
        detail.userSessionID = config.userSessionID;
        detail.adminID = config.adminID;
        detail.deviceType = getDeviceType();

        if (config.logConsole) console.log('Interaction logged:', detail);

        fetch(config.serverURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detail),
        })
            .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
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
            value: eventType === 'input' ? element.value.substring(0, 50) : undefined // Only for inputs
        };
        logInteraction(detail);
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

    window.TrackUserInteraction = {
        setConfig: function (userConfig) {
            Object.assign(config, userConfig);
            config.userSessionID = getDefaultSessionID(); // Ensure updated session ID
            console.log('Config updated', config); // Debug
            attachEventListeners();
        }
    };

    attachEventListeners();
})();
