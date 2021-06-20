firebase.initializeApp({
    messagingSenderId: '676057775386'
});

var bt_register = $('#register');
var bt_delete = $('#delete');
var token = $('#token');
var form = $('#notification');
var massage_id = $('#massage_id');
var massage_row = $('#massage_row');

var info = $('#info');
var info_icon = $('#info-icon')
var info_message = $('#info-message');

var alert = $('#alert');
var alert_message = $('#alert-message');

var input_body = $('#body');

function addZero(i) {
    return i > 9 ? i : '0' + i;
}

resetUI();

if (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'localStorage' in window &&
    'fetch' in window &&
    'postMessage' in window
) {
    var messaging = firebase.messaging();

    // already granted
    if (Notification.permission === 'granted') {
        getToken();
    }

    // get permission on subscribe only once
    bt_register.on('click', function() {
        getToken();
    });

    bt_delete.on('click', function() {
        // Delete Instance ID token.
        messaging.getToken()
            .then(function(currentToken) {
                messaging.deleteToken(currentToken)
                    .then(function() {
                        console.log('Токен удален');
                        setTokenSentToServer(false);
                        // Once token is deleted update UI.
                        resetUI();
                    })
                    .catch(function(error) {
                        showError('Не могу удалить токен', error);
                    });
            })
            .catch(function(error) {
                showError('Ошибка получения токена экземпляра ID', error);
            });
    });

    form.on('submit', function(event) {
        event.preventDefault();

        var notification = {};
        form.find('input').each(function () {
            var input = $(this);
            notification[input.attr('name')] = input.val();
        });

    //    sendNotification(notification);
    });

    // handle catch the notification on current page
    messaging.onMessage(function(payload) {
        console.log('Сообщение получено', payload);
        info.show();
        info_icon
            .append('<img src='+payload.notification.icon+' align=left>')
        info_message
            .text('')
            .append('<h5>'+payload.notification.title+'</h5>')
            .append('<em>'+payload.notification.body+'</em>')
        ;
        bt_delete.hide();

        // register fake ServiceWorker for show notification on mobile devices
        navigator.serviceWorker.register('/firebase-messaging-sw.js');
        Notification.requestPermission(function(permission) {
            if (permission === 'granted') {
                navigator.serviceWorker.ready.then(function(registration) {
                  // Copy data object to get parameters in the click handler
                  payload.notification.data = JSON.parse(JSON.stringify(payload.notification));

                  registration.showNotification(payload.notification.title, payload.notification);
                }).catch(function(error) {
                    // registration failed :(
                    showError('Регистрация ServiceWorker неуспешна', error);
                });
            }
        });
    });

    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function() {
        messaging.getToken()
            .then(function(refreshedToken) {
                console.log('Токен обновлен');
                // Send Instance ID token to app server.
                sendTokenToServer(refreshedToken);
                updateUIForPushEnabled(refreshedToken);
            })
            .catch(function(error) {
                showError('Не удалось получить обновленный токен', error);
            });
    });

} else {
    if (!('Notification' in window)) {
        showError('Уведомления не поддерживаются');
    } else if (!('serviceWorker' in navigator)) {
        showError('ServiceWorker не поддерживается');
    } else if (!('localStorage' in window)) {
        showError('LocalStorage не поддерживается');
    } else if (!('fetch' in window)) {
        showError('fetch не поддерживается');
    } else if (!('postMessage' in window)) {
        showError('postMessage не поддерживается');
    }

    console.warn('Этот браузер не поддерживает десктопные уведомления.');
    console.log('Is HTTPS', window.location.protocol === 'https:');
    console.log('Support Notification', 'Notification' in window);
    console.log('Support ServiceWorker', 'serviceWorker' in navigator);
    console.log('Support LocalStorage', 'localStorage' in window);
    console.log('Support fetch', 'fetch' in window);
    console.log('Support postMessage', 'postMessage' in window);

    updateUIForPushPermissionRequired();
}


function getToken() {
    messaging.requestPermission()
        .then(function() {
            // Get Instance ID token. Initially this makes a network call, once retrieved
            // subsequent calls to getToken will return from cache.
            messaging.getToken()
                .then(function(currentToken) {

                    if (currentToken) {
                        sendTokenToServer(currentToken);
                        updateUIForPushEnabled(currentToken);
                    } else {
                        showError('Нет токена экземпляра ID. Запросите разрешение на его получение');
                        updateUIForPushPermissionRequired();
                        setTokenSentToServer(false);
                    }
                })
                .catch(function(error) {
                    showError('Ошибка получения токена', error);
                    updateUIForPushPermissionRequired();
                    setTokenSentToServer(false);
                });
        })
        .catch(function(error) {
            showError('Не удалось получить права на уведомления', error);
        });
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Sending token to server...');
        // send current token to server
        //$.post(url, {token: currentToken});
        setTokenSentToServer(currentToken);
    } else {
        console.log('Токен уже отправлен на сервер, поэтому он не будет отправляться пока не изменится');
    }
}

function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') === currentToken;
}

function setTokenSentToServer(currentToken) {
    if (currentToken) {
        window.localStorage.setItem('sentFirebaseMessagingToken', currentToken);
    } else {
        window.localStorage.removeItem('sentFirebaseMessagingToken');
    }
}

function updateUIForPushEnabled(currentToken) {
    console.log(currentToken);
    token.text(currentToken);
    bt_register.hide();
    bt_delete.show();
    form.show();
}

function resetUI() {
    token.text('');
    bt_register.show();
    bt_delete.hide();
    form.hide();
    massage_row.hide();
    info.hide();
}

function updateUIForPushPermissionRequired() {
    bt_register.attr('disabled', 'disabled');
    resetUI();
}

function showError(error, error_data) {
    alert.show();

    if (typeof error_data !== "undefined") {
        alert_message.html(error + '<br><pre>' + JSON.stringify(error_data) + '</pre>');
        console.error(error, error_data);
    } else {
        alert_message.html(error);
        console.error(error);
    }
}

//////////////////////////////// Регистрация токена в messaging и отправка через наш сервер ///////
// браузер поддерживает уведомления?
if ('Notification' in window) {
    var messaging = firebase.messaging();

    // пользователь уже разрешил получение уведомлений
    // подписываем на уведомления если ещё не подписали
    if (Notification.permission === 'granted') {
        subscribe();
    }

    // по клику, запрашиваем у пользователя разрешение на уведомления
    // и подписываем его
    $('#subscribe').on('click', function () {
        subscribe();
    });
}

function subscribe() {
    // запрашиваем разрешение на получение уведомлений
    messaging.requestPermission()
        .then(function () {
            // получаем ID устройства
            messaging.getToken()
                .then(function (currentToken) {

                    if (currentToken) {
                        sendTokenToServer(currentToken);
                    } else {
                        console.warn('Не удалось получить токен.');
                        setTokenSentToServer(false);
                    }
                })
                .catch(function (err) {
                    console.warn('При получении токена произошла ошибка.', err);
                    setTokenSentToServer(false);
                });
    })
    .catch(function (err) {
        console.warn('Не удалось получить разрешение на показ уведомлений.', err);
    });
}

// отправка ID на сервер
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Отправка токена на сервер...');

        var url = 'firebase/'; // адрес скрипта на сервере который будет сохранять ID устройства
        $.post(url, {
            token: currentToken
        });

        setTokenSentToServer(currentToken);
    } else {
        console.log('Токен уже отправлен на сервер.');
    }
}

// используем localStorage для отметки того,
// что пользователь уже подписался на уведомления
function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
    window.localStorage.setItem(
        'sentFirebaseMessagingToken',
        currentToken ? currentToken : ''
    );
}
