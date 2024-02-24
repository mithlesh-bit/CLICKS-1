console.log("page loaded");

(function () {
    var config = {
        userSessionID: 'defaultSessionID',
        serverURL: 'https://catching-user-data.onrender.com/api', // Ensure this is the correct endpoint
        logConsole: true
    };

    // Function to retrieve user token from cookies, local storage, or session storage
    function getUserToken() {
        // Try to get from sessionStorage
        var token = sessionStorage.getItem('userToken');
        if (token) return token;

        // Try to get from localStorage
        token = localStorage.getItem('userToken');
        if (token) return token;

        // Try to get from cookies
        var name = 'userToken=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "unidentified user"; // Return empty string if token is not found
    }

    function getElementIdentifier(element) {
        var identifierParts = [];
        if (element.id) identifierParts.push('ID: ' + element.id);
        if (element.className) identifierParts.push('Class: ' + element.className);
        if (element.name) identifierParts.push('Name: ' + element.name);
        if (element.tagName) identifierParts.push('Tag: ' + element.tagName);
        return identifierParts.join(', ') || 'No specific identifier';
    }

    function logInteraction(detail) {
        // Include the user token in the detail object
        detail.userToken = getUserToken();

        if (config.logConsole) {
            console.log('Interaction logged:', detail);
        }

        // Send data to the server using fetch API
        fetch(config.serverURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(detail),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // This assumes the server responds with JSON
            })
            .then(data => console.log('Data successfully sent to the server:', data))
            .catch((error) => console.error('Error sending data to the server:', error));
    }

    function handleEvent(event, eventType) {
        var element = event.target;
        var elementIdentifier = getElementIdentifier(element);
        var detail = {
            eventType: eventType,
            identifier: elementIdentifier,
            sessionID: config.userSessionID,
            timestamp: new Date().toISOString(),
            pageTitle: document.title // Extract and include the page title
        };
        // For input events, capture the value as well
        if (eventType === 'input') {
            detail.value = element.value.substring(0, 50); // Capture only the first 50 characters
        }
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
            attachEventListeners(); // Re-attach event listeners with new configuration
        }
    };

    attachEventListeners();
})();
