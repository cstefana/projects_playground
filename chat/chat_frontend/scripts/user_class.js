/**
 * User class to encapsulate user data and methods
 */
class User {
    constructor(name, profilePic = null) {
        this.name = name;
        this.messages = [];
        this.profilePic = profilePic || this.generateFallbackAvatar();
    }

    /**
     * Add a new message to the user's conversation
     * @param {string} text - The message text
     * @param {string} type - 'sent' or 'received'
     */
    addMessage(text, type) {
        const message = new Message(text, type, new Date());
        this.messages.push(message);
        return message;
    }

    /**
     * Get the last message in the conversation
     * @returns {Message|null} - The last message or null if no messages
     */
    getLastMessage() {
        return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
    }

    /**
     * Get the total number of messages
     * @returns {number} - Total message count
     */
    getMessageCount() {
        return this.messages.length;
    }

    /**
     * Get messages of a specific type
     * @param {string} type - 'sent' or 'received'
     * @returns {Message[]} - Array of messages of the specified type
     */
    getMessagesByType(type) {
        return this.messages.filter(message => message.type === type);
    }

    /**
     * Generate a fallback avatar URL
     * @returns {string} - Fallback avatar URL
     */
    generateFallbackAvatar() {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name.charAt(0))}&background=7a9475&color=ffffff&size=150&rounded=true`;
    }

    /**
     * Set profile picture with fallback
     * @param {string} url - Profile picture URL
     */
    setProfilePic(url) {
        this.profilePic = url && url.trim() ? url.trim() : this.generateFallbackAvatar();
    }

    /**
     * Get profile picture with error handling
     * @returns {string} - Profile picture URL
     */
    getProfilePic() {
        return this.profilePic || this.generateFallbackAvatar();
    }

    /**
     * Get user info as plain object (for compatibility)
     * @returns {Object} - User data as plain object
     */
    toJSON() {
        return {
            name: this.name,
            messages: this.messages.map(msg => msg.toJSON()),
            profilePic: this.profilePic
        };
    }

    /**
     * Create User from plain object data
     * @param {string} name - User name
     * @param {Object} data - User data object
     * @returns {User} - New User instance
     */
    static fromData(name, data) {
        const user = new User(name, data.profilePic);
        // add existing messages
        if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach(msgData => {
                const message = Message.fromData(msgData);
                user.messages.push(message);
            });
        }
        
        return user;
    }
}

/**
 * Message class to encapsulate message data
 */
class Message {
    constructor(text, type, timestamp = null) {
        this.text = text;
        this.type = type; // 'sent' or 'received'
        this.timestamp = timestamp || new Date();
        this.id = this.generateId();
    }

    /**
     * Generate a unique ID for the message
     * @returns {string} - Unique message ID
     */
    generateId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get formatted timestamp
     * @returns {string} - Formatted time string
     */
    getFormattedTime() {
        return this.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Get formatted date
     * @returns {string} - Formatted date string
     */
    getFormattedDate() {
        return this.timestamp.toLocaleDateString([], {
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Get relative time (Today, Yesterday, or date)
     * @returns {string} - Relative time string
     */
    getRelativeTime() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.isSentToday()) {
            return 'Today';
        } else if (this.timestamp.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return this.getFormattedDate();
        }
    }

    /**
     * Get full timestamp display (relative date + time)
     * @returns {string} - Full timestamp string
     */
    getFullTimestamp() {
        const relativeTime = this.getRelativeTime();
        const time = this.getFormattedTime();
        
        if (relativeTime === 'Today') {
            return time;
        } else {
            return `${relativeTime} ${time}`;
        }
    }

    /**
     * Check if message was sent today
     * @returns {boolean} - True if sent today
     */
    isSentToday() {
        const today = new Date();
        return this.timestamp.toDateString() === today.toDateString();
    }

    /**
     * Get message as plain object
     * @returns {Object} - Message data as plain object
     */
    toJSON() {
        return {
            text: this.text,
            type: this.type,
            timestamp: this.timestamp.toISOString(),
            id: this.id
        };
    }

    /**
     * Create Message from plain object data
     * @param {Object} data - Message data object
     * @returns {Message} - New Message instance
     */
    static fromData(data) {
        const message = new Message(
            data.text, 
            data.type, 
            data.timestamp ? new Date(data.timestamp) : new Date()
        );
        
        if (data.id) {
            message.id = data.id;
        }
        
        return message;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { User, Message };
}