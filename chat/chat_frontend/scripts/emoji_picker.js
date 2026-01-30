// emoji Picker functionality using emoji-picker-element library
// The library is loaded from CDN in the HTML file

// initialize emoji picker on page load
document.addEventListener('DOMContentLoaded', function() {
    // wait a bit for the emoji-picker-element custom element to be defined
    setTimeout(initEmojiPicker, 100);
});

function initEmojiPicker() {
    // desktop emoji picker
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const emojiPicker = document.getElementById('emoji-picker');
    const messageInput = document.getElementById('message-input');
    
    // mobile emoji picker
    const mobileEmojiBtn = document.getElementById('mobile-emoji-btn');
    const mobileEmojiPickerContainer = document.getElementById('mobile-emoji-picker-container');
    const mobileEmojiPicker = document.getElementById('mobile-emoji-picker');
    const mobileMessageInput = document.getElementById('mobile-message-input');
    
    // desktop emoji picker event listeners
    if (emojiPicker && emojiBtn) {
        emojiPicker.addEventListener('emoji-click', (event) => {
            insertEmoji(event.detail.unicode, messageInput);
            //emojiPickerContainer.style.display = 'none';
        });
        
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEmojiPicker(emojiPickerContainer, mobileEmojiPickerContainer);
        });
    }
    
    // mobile emoji picker event listeners
    if (mobileEmojiPicker && mobileEmojiBtn) {
        mobileEmojiPicker.addEventListener('emoji-click', (event) => {
            insertEmoji(event.detail.unicode, mobileMessageInput);
            //mobileEmojiPickerContainer.style.display = 'none';
        });
        
        mobileEmojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEmojiPicker(mobileEmojiPickerContainer, emojiPickerContainer);
        });
    }
    
    // close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (emojiPickerContainer && 
            !emojiPickerContainer.contains(e.target) && 
            e.target !== emojiBtn) {
            emojiPickerContainer.style.display = 'none';
        }
        if (mobileEmojiPickerContainer && 
            !mobileEmojiPickerContainer.contains(e.target) && 
            e.target !== mobileEmojiBtn) {
            mobileEmojiPickerContainer.style.display = 'none';
        }
    });
}

function toggleEmojiPicker(pickerToShow, pickerToHide) {
    // hide the other picker if it's open
    if (pickerToHide) {
        pickerToHide.style.display = 'none';
    }
    
    // toggle the current picker
    if (pickerToShow.style.display === 'none' || !pickerToShow.style.display) {
        pickerToShow.style.display = 'block';
    } else {
        pickerToShow.style.display = 'none';
    }
}

function insertEmoji(emoji, inputElement) {
    if (!inputElement) return;
    
    const cursorPos = inputElement.selectionStart;
    const textBefore = inputElement.value.substring(0, cursorPos);
    const textAfter = inputElement.value.substring(cursorPos);
    
    inputElement.value = textBefore + emoji + textAfter;
    
    // set cursor position after the emoji
    const newCursorPos = cursorPos + emoji.length;
    inputElement.setSelectionRange(newCursorPos, newCursorPos);
    inputElement.focus();
}
