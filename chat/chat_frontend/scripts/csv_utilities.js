// LEGACY AND RETIRED >:D
const CSV_FILE_URL = 'users.csv'; 

// load data from specified CSV file
async function loadDataFromFile() {
    try {
        const response = await fetch(CSV_FILE_URL);
        
        if (!response.ok) {
            throw new Error("Could not find the CSV file");
        }

        const csvText = await response.text();
        processCSV(csvText);

    } catch (error) {
        console.error("Error loading CSV:", error);
        chatHeader.textContent = "Error loading chats.";
    }
}

// process CSV
function processCSV(csvText) {
    chatData = {}; 
    const lines = csvText.split('\n');

    lines.forEach(line => {
        if (!line.trim()) return; 

        const [name, text, type, profilePic] = line.split(',');
        if (name && text && type) {
            // Create user if doesn't exist
            if (!chatData[name]) {
                chatData[name] = new User(name, profilePic?.trim());
            }
            
            // Add message to user
            chatData[name].addMessage(text.trim(), type.trim());
        }
    });

    renderUserList();
}