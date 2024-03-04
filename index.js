console.log("page loaded");

(function () {
    var config = {
        userSessionID: 'defaultSessionID',
        serverURL: 'https://catching-user-data.onrender.com/api',
        logConsole: true,
        adminID: getAdminId() // Retrieve the admin ID when the script loads
    };

    function getAdminId() {
        var adminIdMetaTag = document.querySelector('meta[name="admin-id-by-click-captured"]');
        return adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId';
    }

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
        var textContent = element.textContent || element.innerText;
        if (textContent && textContent.trim().length > 0 && textContent.trim().length < 50) {
            identifierParts.push('Text: ' + textContent.trim());
        }
        return identifierParts.join(', ') || 'No specific identifier';
    }

    function getDeviceType() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent)) {
            return 'Android Mobile';
        }
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return 'iOS Mobile';
        }
        if (/Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(userAgent)) {
            return 'Mobile';
        }
        return 'Desktop';
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
        detail.userToken = getUserToken();
        detail.deviceType = getDeviceType();
        detail.adminID = config.adminID; // Include the admin ID in the detail
        var browserInfo = getBrowserInfo();
        detail.browserName = browserInfo.name; // Include browser name
        detail.browserVersion = browserInfo.version; // Include browser version

        if (config.logConsole) {
            console.log('Interaction logged:');
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
            pageTitle: document.title,
            // value is only included for input events
            value: eventType === 'input' ? element.value.substring(0, 50) : undefined
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
            config.adminID = getAdminId(); // Ensure admin ID is updated if config is reset
            attachEventListeners();
        }
    };

    attachEventListeners();
})();
