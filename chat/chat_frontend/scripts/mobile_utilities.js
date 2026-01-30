// mobile-specific functionality
let isMobile = false;
let currentMobileUser = null;

// detect if mobile device is in use
function checkMobileDevice() {
    isMobile = window.innerWidth <= 768;
    return isMobile;
}

// initialize mobile view
function initMobile() {
    if (checkMobileDevice()) {
        showMobileUserSelection();
        populateMobileUserList();
        setupMobileEventListeners();
    }
}

// show mobile user selection screen
function showMobileUserSelection() {
    document.getElementById('mobile-user-selection').style.display = 'flex';
    document.getElementById('mobile-chat-view').classList.remove('active');
}

// show mobile chat view
function showMobileChatView(userName) {
    document.getElementById('mobile-user-selection').style.display = 'none';
    document.getElementById('mobile-chat-view').classList.add('active');
    
    // update chat header with user info
    const userData = chatData[userName];
    document.getElementById('mobile-chat-name').textContent = userName;
    document.getElementById('mobile-chat-avatar').src = userData.profilePic;
    document.getElementById('mobile-chat-avatar').onerror = function() {
        this.src = `https://ui-avatars.com/api/?name=${userName.charAt(0)}&background=7a9475&color=ffffff&size=150&rounded=true`;
    };
    
    currentMobileUser = userName;
    
    // Request chat history from server
    if (typeof requestChatHistory === 'function') {
        requestChatHistory(userName);
    }
    
    renderMobileMessages();
}

// populate mobile user list
function populateMobileUserList() {
    const mobileUserList = document.getElementById('mobile-user-list');
    mobileUserList.innerHTML = '';
    
    Object.keys(chatData).forEach(userName => {
        const user = chatData[userName];
        const lastMessage = user.getLastMessage();
        const userStatus = user.status || 'offline';
        const statusClass = userStatus === 'online' ? 'online' : 'offline';
        
        const userItem = document.createElement('div');
        userItem.classList.add('mobile-user-item');
        
        const previewText = lastMessage ? lastMessage.text : 'No messages yet';
        const messageTime = lastMessage ? lastMessage.getFormattedTime() : '';
        
        userItem.innerHTML = `
            <div class="mobile-user-avatar-wrapper">
                <img class="mobile-user-avatar" src="${user.getProfilePic()}" alt="${userName}" 
                     onerror="this.src='${user.generateFallbackAvatar()}'">
                <span class="mobile-status-indicator ${statusClass}"></span>
            </div>
            <div class="mobile-user-info">
                <div class="mobile-user-name">${userName}</div>
                <div class="mobile-user-preview">${previewText}</div>
            </div>
            <div class="mobile-user-time">${messageTime}</div>
        `;
        
        userItem.addEventListener('click', () => {
            showMobileChatView(userName);
        });
        
        mobileUserList.appendChild(userItem);
    });
}

// render mobile messages
function renderMobileMessages() {
    const mobileMessages = document.getElementById('mobile-messages');
    mobileMessages.innerHTML = '';
    
    if (!currentMobileUser) return;
    
    const user = chatData[currentMobileUser];
    const messages = user.messages;
    
    messages.forEach(msg => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', msg.type === 'sent' ? 'sent' : 'received');
        
        if (msg.type !== 'sent') {
            const avatar = document.createElement('img');
            avatar.src = user.getProfilePic();
            avatar.alt = currentMobileUser;
            avatar.classList.add('message-avatar');
            avatar.onerror = function() {
                this.src = user.generateFallbackAvatar();
            };
            wrapper.appendChild(avatar);
        }
        
        // Create message with timestamp container
        const messageWithTimestamp = document.createElement('div');
        messageWithTimestamp.classList.add('message-with-timestamp', msg.type === 'sent' ? 'sent' : 'received');
        
        // Create message bubble
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.type === 'sent' ? 'sent' : 'received');
        messageDiv.textContent = msg.text;
        messageWithTimestamp.appendChild(messageDiv);
        
        // Add timestamp below bubble
        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('message-timestamp');
        timestampDiv.textContent = msg.getFullTimestamp();
        messageWithTimestamp.appendChild(timestampDiv);
        
        wrapper.appendChild(messageWithTimestamp);
        mobileMessages.appendChild(wrapper);
    });
    
    mobileMessages.scrollTop = mobileMessages.scrollHeight;
}

// send mobile message
function sendMobileMessage() {
    const input = document.getElementById('mobile-message-input');
    const text = input.value.trim();
    
    if (!currentMobileUser) {
        alert("Error: No user selected");
        return;
    }
    
    if (text !== "") {
        // Send message through WebSocket
        sendWebSocketMessage(currentMobileUser, text);
        input.value = "";
    }
}

// setup mobile event listeners
function setupMobileEventListeners() {
    // back button
    document.getElementById('mobile-back-btn').addEventListener('click', () => {
        showMobileUserSelection();
        currentMobileUser = null;
    });
    
    // send button
    document.getElementById('mobile-send-btn').addEventListener('click', sendMobileMessage);
    
    // enter key in input
    document.getElementById('mobile-message-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMobileMessage();
        }
    });
}

// handle window resize
window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    checkMobileDevice();
    
    // if switching between mobile and desktop, re-initialize
    if (wasMobile !== isMobile) {
        if (isMobile) {
            // switching to mobile - repopulate user list with current data
            initMobile();
        } else {
            // reset to desktop view
            document.getElementById('mobile-user-selection').style.display = 'none';
            document.getElementById('mobile-chat-view').classList.remove('active');
        }
    } else if (isMobile) {
        // still on mobile, just refresh the list in case data changed
        populateMobileUserList();
    }
});

// initialize mobile if on mobile device after connection
window.addEventListener('load', () => {
    if (checkMobileDevice()) {
        // wait a bit for WebSocket connection and initial data
        setTimeout(initMobile, 500);
    }
});

// refresh mobile view 
function refreshMobileView() {
    if (checkMobileDevice()) {
        populateMobileUserList();
        if (currentMobileUser && document.getElementById('mobile-chat-view').classList.contains('active')) {
            renderMobileMessages();
        }
    }
}