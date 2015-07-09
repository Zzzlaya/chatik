(function() {
    var socket = io.connect('http://localhost:8080'),
        form = document.querySelector('.js_chatik_form'),
        div = document.createElement('div'),
        messagesDiv = document.querySelector('.js_chatik_messages'),
        chattersDiv = document.querySelector('.js_chatik_chatters'),
        statusDiv,
        userDiv,
        userToRemove;

    socket.on('connect', function(data) {
        nickname = prompt('What\'s your name, dude?');
        socket.emit('join', nickname, function(name) {
            statusDiv = div.cloneNode();
            statusDiv.textContent = name + ' joined the conversation';
            messagesDiv.appendChild(statusDiv);
        });
    });

    socket.on('messages', function(data) {
        messageDiv = div.cloneNode();
        messageDiv.textContent = data;
        messagesDiv.appendChild(messageDiv);
    });

    socket.on('add chatter', function(name) {
        userDiv = div.cloneNode();
        userDiv.className = 'b_chatik_chatters_name js_chatik_chatters_name';
        userDiv.setAttribute('data-name', name);
        userDiv.textContent = name;
        chattersDiv.appendChild(userDiv);
    });

    socket.on('remove chatter', function(name) {
        userToRemove = document.querySelector('.js_chatik_chatters_name[data-name="' + name + '"]');
        userToRemove.remove();
    });

    // if IE<=9 
    if (form.addEventListener) {
        form.addEventListener('submit', sendFormContent, false);
    } else if (form.attachEvent) {
        form.attachEvent('submit', sendFormContent);
    }

    function sendFormContent(event) {
        var messageInput = document.querySelector('.js_chatik_form_input'),
            message = messageInput.value;

        if (event.preventDefault) {
            event.preventDefault();
        }
        event.returnValue = false;
        // emits the 'messages' event on the server 
        socket.emit('messages', message);
        messageInput.value = '';
    }
})()
