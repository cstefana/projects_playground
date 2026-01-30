// WebSocket connection management
let socket = null;
const WS_URL = 'ws://localhost:8000/chat/ws';
let selectedAvatar = null;

// Login handling
document.addEventListener('DOMContentLoaded', function() {
    const loginOverlay = document.getElementById('login-overlay');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');
    const customAvatarInput = document.getElementById('custom-avatar-input');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    // handle avatar selection
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedAvatar = this.dataset.avatar;
            customAvatarInput.value = ''; // clear custom input
        });
    });
    
    // Select first avatar by default
    if (avatarOptions.length > 0) {
        avatarOptions[0].classList.add('selected');
        selectedAvatar = avatarOptions[0].dataset.avatar;
    }
    
    // Handle custom avatar URL
    customAvatarInput.addEventListener('input', function() {
        if (this.value.trim()) {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            selectedAvatar = this.value.trim();
        }
    });
    
    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const profilePic = customAvatarInput.value.trim() || selectedAvatar;
        
        if (username) {
            currentUsername = username;
            connectWebSocket(username, profilePic);
            loginOverlay.style.display = 'none';
            document.getElementById('main-wrapper').style.display = 'flex';
        } else {
            alert('Please enter a username');
        }
    });

    usernameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loginBtn.click();
        }
    });
});

function connectWebSocket(username, profilePic = null) {
    console.log(`Connecting to WebSocket as ${username}...`);
    
    socket = new WebSocket(`${WS_URL}?username=${encodeURIComponent(username)}`);
    
    socket.onopen = function(event) {
        console.log('Connected to chat server');
        chatHeader.textContent = 'Connected - Select a conversation';
        
        // create user on backend and add its profile picture
        if (profilePic) {
            createUserOnBackend(username, profilePic);
        }
    };
    
    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Received:', message);
        handleWebSocketMessage(message);
    };
    
    socket.onclose = function(event) {
        console.log('Disconnected from chat server');
        chatHeader.textContent = 'Disconnected - Refresh to reconnect';
    };
    
    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
        alert('Connection error. Make sure the backend server is running on localhost:8000');
    };
}

function handleWebSocketMessage(message) {
    switch(message.type) {
        case 'connection_established':
            console.log('Welcome:', message.message);
            break;
            
        case 'user_list':
            updateUserList(message.users);
            break;
            
        case 'message':
            handleIncomingMessage(message);
            break;
            
        case 'user_status':
            handleUserStatus(message);
            break;
            
        case 'typing':
            handleTypingIndicator(message);
            break;
            
        case 'chat_history':
            loadChatHistory(message);
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

function updateUserList(users) {
    console.log('Updating user list:', users);
    
    // clear and rebuild chatData from server user list
    users.forEach(user => {
        if (user.username === currentUsername) return; // don't show yourself, you don't need to chat with yourself :)
        
        if (!chatData[user.username]) {
            chatData[user.username] = new User(user.username, user.profile_pic);
        } else {
            // update existing user's profile pic if it changed
            if (user.profile_pic) {
                chatData[user.username].profilePic = user.profile_pic;
            }
        }
        
        // update user status
        chatData[user.username].status = user.status;
    });
    
    renderUserList();
    
    // update mobile list if on mobile
    if (typeof populateMobileUserList === 'function' && checkMobileDevice()) {
        populateMobileUserList();
        
        // Request history for all users to show message previews
        Object.keys(chatData).forEach(username => {
            if (chatData[username].messages.length === 0) {
                requestChatHistory(username);
            }
        });
    }
}

function handleIncomingMessage(message) {
    const { from_user, to_user, content, timestamp } = message;
    
    // determine which user this conversation is with
    let otherUser;
    if (from_user === currentUsername) {
        otherUser = to_user;
        messageType = 'sent';
    } else {
        otherUser = from_user;
        messageType = 'received';
    }
    
    // create user if doesn't exist
    if (!chatData[otherUser]) {
        chatData[otherUser] = new User(otherUser);
    }
    
    // add message to the appropriate user
    const user = chatData[otherUser];
    const msg = user.addMessage(content, messageType);
    
    // set the timestamp from server
    if (timestamp) {
        msg.timestamp = new Date(timestamp);
    }
    
    // update user list to show new message
    renderUserList();
    
    // update mobile user list if on mobile
    if (typeof populateMobileUserList === 'function' && checkMobileDevice()) {
        populateMobileUserList();
    }
    
    // if this is the active conversation, update messages
    if (activeUser === otherUser) {
        renderMessages();
    }
    
    // update mobile messages if on mobile
    if (typeof renderMobileMessages === 'function' && checkMobileDevice() && currentMobileUser === otherUser) {
        renderMobileMessages();
    }
}

function handleUserStatus(message) {
    const { username, action } = message;
    
    console.log(`User ${username} ${action}`);
    
    if (action === 'joined') {
        // add new user to list if not exists or update their status to online
        if (username !== currentUsername) {
            if (!chatData[username]) {
                chatData[username] = new User(username);
            } else {
                // update existing user's status to online
                chatData[username].status = 'online';
            }
            renderUserList();
            // update mobile list
            if (typeof populateMobileUserList === 'function' && checkMobileDevice()) {
                populateMobileUserList();
            }
        }
    } else if (action === 'left') {
        // mark user as offline
        if (chatData[username]) {
            chatData[username].status = 'offline';
            renderUserList();
            // update mobile list
            if (typeof populateMobileUserList === 'function' && checkMobileDevice()) {
                populateMobileUserList();
            }
        }
    }
}

function handleTypingIndicator(message) {
    const { username, typing } = message;
    
    if (username === activeUser) {
        // show/hide typing indicator for active conversation
        console.log(`${username} is ${typing ? 'typing' : 'not typing'}...`);
    }
}

function loadChatHistory(message) {
    const { with_user, messages } = message;
    
    if (!chatData[with_user]) {
        chatData[with_user] = new User(with_user);
    }
    
    const user = chatData[with_user];
    user.messages = []; // clear existing messages
    
    // add all messages from history
    messages.forEach(msg => {
        const type = msg.from_user === currentUsername ? 'sent' : 'received';
        const newMsg = user.addMessage(msg.content, type);
        if (msg.timestamp) {
            newMsg.timestamp = new Date(msg.timestamp);
        }
    });
    
    if (activeUser === with_user) {
        renderMessages();
    }
    
    // update mobile user list to show the last message preview
    if (typeof populateMobileUserList === 'function' && checkMobileDevice()) {
        populateMobileUserList();
    }
    
    // update mobile view if on mobile and viewing this conversation
    if (typeof renderMobileMessages === 'function' && checkMobileDevice() && currentMobileUser === with_user) {
        renderMobileMessages();
    }
}

function sendWebSocketMessage(toUser, content) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert('Not connected to server');
        return;
    }
    
    const message = {
        action: 'send_message',
        data: {
            to_user: toUser,
            content: content
        }
    };
    
    socket.send(JSON.stringify(message));
    console.log('Sent message to', toUser);
}

function requestChatHistory(withUser) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }
    
    const message = {
        action: 'get_history',
        data: {
            with_user: withUser,
            limit: 50
        }
    };
    
    socket.send(JSON.stringify(message));
    console.log('Requesting history with', withUser);
}

function sendTypingIndicator(isTyping, toUser = null) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
    }
    
    const message = {
        action: 'typing',
        data: {
            typing: isTyping,
            to_user: toUser
        }
    };
    
    socket.send(JSON.stringify(message));
}

// Create user on backend with profile picture
async function createUserOnBackend(username, profilePic) {
    try {
        const response = await fetch('http://localhost:8000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                profile_pic: profilePic
            })
        });
        
        if (response.ok) {
            console.log('User created on backend with profile picture');
        } else if (response.status === 409) {
            console.log('User already exists on backend');
        } else {
            console.error('Failed to create user on backend');
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

// typing indicator for message input
let typingTimeout;
if (messageInput) {
    messageInput.addEventListener('input', () => {
        if (activeUser) {
            sendTypingIndicator(true, activeUser);
            
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                sendTypingIndicator(false, activeUser);
            }, 1000);
        }
    });
}