console.log("page loaded");

(function () {
    // Configuration object initialized with default values
    var config = {
        userSessionID: getDefaultSessionID(), // Set the session ID based on available token
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true,
        adminID: getAdminId() // Retrieve and set the admin ID from the meta tag
    };

    // Retrieve the admin ID from a meta tag in the document head
    function getAdminId() {
        var adminIdMetaTag = document.querySelector('meta[name="admin-id"]');
        return adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId';
    }

    // Retrieve the token name from a meta tag in the document head
    function getTokenName() {
        var tokenNameMetaTag = document.querySelector('meta[name="token-name"]');
        return tokenNameMetaTag ? tokenNameMetaTag.content : null;
    }

    // Attempt to retrieve the session token from sessionStorage, localStorage, or cookies
    function getDefaultSessionID() {
        var tokenName = getTokenName();
        if (!tokenName) return 'defaultSessionID';

        var token = sessionStorage.getItem(tokenName) ||
            localStorage.getItem(tokenName) ||
            getCookie(tokenName);
        return token || 'defaultSessionID';
    }

    // Helper function to retrieve a value from cookies
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Extract details from the interacted element
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

    // Determine the device type based on the user agent
    function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/android/i.test(userAgent)) return 'Android Mobile';
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'iOS Mobile';
        if (/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(userAgent)) return 'Mobile';
        return 'Desktop';
    }

    // Log user interaction details
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

    // Handle click or input events
    function handleEvent(event, eventType) {
        var element = event.target;
        var elementIdentifier = getElementIdentifier(element);
        var detail = {
            eventType: eventType,
            identifier: elementIdentifier,
            timestamp: new Date().toISOString(),
            pageTitle: document.title,
            // Conditional value for input events
            value: eventType === 'input' ? element.value.substring(0, 50) : undefined
        };
        logInteraction(detail);
    }

    // Attach event listeners to the document for click and input events
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

    // Public method to allow custom configuration
    window.TrackUserInteraction = {
        setConfig: function (userConfig) {
            Object.assign(config, userConfig);
            config.userSessionID = getDefaultSessionID(); // Update the session ID
            attachEventListeners();
        }
    };

    // Initialize and attach event listeners
    attachEventListeners();
})();
