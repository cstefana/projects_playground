let chatData = {}; 
let activeUser = null;

const userListEl = document.getElementById('user-list');
const messagesContainer = document.getElementById('messages');
const chatHeader = document.getElementById('chat-header');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const inputArea = document.getElementById('input-area');


function renderUserList() {
    userListEl.innerHTML = ''; 
    
    Object.keys(chatData).forEach(name => {
        const user = chatData[name];
        const li = document.createElement('li');
        li.classList.add('user-item');
        
        const avatar = document.createElement('img');
        avatar.src = user.getProfilePic();
        avatar.alt = name;
        avatar.classList.add('user-avatar');
        avatar.onerror = function() {
            this.src = user.generateFallbackAvatar();
        };
        
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('user-name');
        nameSpan.textContent = name;
        
        li.appendChild(avatar);
        li.appendChild(nameSpan);
        li.onclick = () => selectUser(name, li);
        userListEl.appendChild(li);
    });
}

function selectUser(name, element) {
    activeUser = name;

    document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    chatHeader.textContent = `Chatting with ${name}`;
    inputArea.style.display = 'flex';
    renderMessages();
}

function renderMessages() {
    messagesContainer.innerHTML = ''; 
    
    if (!activeUser) {
        messagesContainer.innerHTML = '<div id="no-selection-notice"><p>Please select a user.</p></div>';
        return;
    }

    const user = chatData[activeUser];
    const messages = user.messages;
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div id="no-selection-notice"><p>No messages yet</p></div>';
    } else {
        messages.forEach(msg => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('message-wrapper', msg.type === 'sent' ? 'sent' : 'received');
            
            if (msg.type !== 'sent') {
                const avatar = document.createElement('img');
                avatar.src = user.getProfilePic();
                avatar.alt = activeUser;
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
            messagesContainer.appendChild(wrapper);
        });
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    
    if (!activeUser) {
        alert("Please select a user to chat with");
        return;
    }

    if (text !== "") {
        const user = chatData[activeUser];
        user.addMessage(text, 'sent');
        messageInput.value = "";
        renderMessages();
    }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

loadDataFromFile();