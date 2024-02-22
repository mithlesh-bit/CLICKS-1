console.log("page loaded");
(function () {
    var config = {
        userSessionID: 'defaultSessionID',
        serverURL: 'https://yourserver.com/log', // Default server URL to send data to
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

    // Function to handle input events
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

    // Log interaction details
    function logInteraction(detail) {
        if (config.logConsole) {
            console.log('Interaction logged:', detail);
        }
        // Extend this function to send data to a server using fetch() or another method
        // Ensure compliance with CORS and privacy regulations
    }

    // Attach event listeners to the document for click and input events
    function attachEventListeners() {
        document.addEventListener('click', handleClick);
        document.querySelectorAll('input[type="text"], textarea').forEach(function (input) {
            input.addEventListener('input', handleInput);
        });
    }

    // Expose a method for custom configuration
    window.TrackUserInteraction = {
        setConfig: function (userConfig) {
            Object.assign(config, userConfig);
            attachEventListeners(); // Re-attach event listeners with new configuration
        }
    };

    // Automatically attach event listeners on script load
    attachEventListeners();
})();
