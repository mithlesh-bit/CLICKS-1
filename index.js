console.log("page loadeddfjdf");

(function () {
    var config = {
        userSessionID: 'defaultSessionID',
        serverURL: 'https://catching-user-data.onrender.com/api', // Ensure this is the correct endpoint
        logConsole: true
    };

    function getElementIdentifier(element) {
        var identifierParts = [];
        if (element.id) identifierParts.push('ID: ' + element.id);
        if (element.className) identifierParts.push('Class: ' + element.className);
        if (element.name) identifierParts.push('Name: ' + element.name);
        if (element.tagName) identifierParts.push('Tag: ' + element.tagName);
        return identifierParts.join(', ') || 'No specific identifier';
    }

    function handleClick(event) {
        var clickedElement = event.target;
        var elementIdentifier = getElementIdentifier(clickedElement);
        var detail = {
            eventType: 'click',
            identifier: elementIdentifier,
            sessionID: config.userSessionID,
            timestamp: new Date().toISOString()
        };
        logInteraction(detail);
    }

    function handleInput(event) {
        var inputElement = event.target;
        var elementIdentifier = getElementIdentifier(inputElement);
        var detail = {
            eventType: 'input',
            identifier: elementIdentifier,
            value: inputElement.value.substring(0, 50), // Capture only the first 50 characters
            sessionID: config.userSessionID,
            timestamp: new Date().toISOString()
        };
        logInteraction(detail);
    }

    function logInteraction(detail) {
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

    function attachEventListeners() {
        document.addEventListener('click', handleClick);
        document.querySelectorAll('input[type="text"], textarea').forEach(function (input) {
            input.addEventListener('input', handleInput);
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
