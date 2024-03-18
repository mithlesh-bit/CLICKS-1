document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded");

    var config = {
        userSessionID: getDefaultSessionID(),
        serverURL: 'https://catching-user-data.onrender.com/api',
        adminID: getAdminId(),
        deviceType: getDeviceType(),
        location: window.location.pathname,
    };

    function getAdminId() {
        var adminIdMetaTag = document.querySelector('meta[name="admin-id"]');
        return adminIdMetaTag ? adminIdMetaTag.content : 'unknownAdminId';
    }

    function getTokenName() {
        var tokenNameMetaTag = document.querySelector('meta[name="token-name"]');
        return tokenNameMetaTag ? tokenNameMetaTag.content : 'jwt';
    }

    function getDefaultSessionID() {
        var tokenName = getTokenName();
        var token = sessionStorage.getItem(tokenName) || localStorage.getItem(tokenName) || getCookie(tokenName);
        return token || 'unidentifiedUser';
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/mobile/i.test(userAgent)) return 'Mobile';
        if (/tablet/i.test(userAgent)) return 'Tablet';
        return 'Desktop';
    }

    function logInteraction(detail) {
        var browserInfo = getBrowserInfo();
        detail.browserName = browserInfo.name;
        detail.browserVersion = browserInfo.version;
        detail.adminID = config.adminID;
        detail.deviceType = config.deviceType;
        detail.location = config.location;
        console.log(detail.browserName, detail.browserVersion, detail.adminID, detail.deviceType, detail.location);

        // fetch(config.serverURL, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(detail),
        // })
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok');
        //         }
        //         return response.json();
        //     })
        //     .then(data => console.log(data))
        //     .catch(error => console.error('Error logging interaction:', error));
    }

    function getBrowserInfo() {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR|Edge\/(\d+)/);
            if (tem != null) return { name: 'Opera', version: tem[1] };
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return {
            name: M[0],
            version: M[1]
        };
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
            userSessionID: config.userSessionID,
        };
        logInteraction(detail);
    }

    function getElementIdentifier(element) {
        var identifier = '';
        if (element.id) {
            identifier += 'ID: ' + element.id + '; ';
        }
        if (element.className) {
            identifier += 'Class: ' + element.className + '; ';
        }
        if (element.name) {
            identifier += 'Name: ' + element.name + '; ';
        }
        identifier += 'Tag: ' + element.tagName.toLowerCase();
        return identifier.trim();
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
});
