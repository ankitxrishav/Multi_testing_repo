// background.js
// Handles Auth and State Management

let userToken = null;

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getToken') {
        // In a real app with Firebase Auth, you might need to use chrome.identity.getAuthToken
        // For this MVP, we'll try to sync via a shared LocalStorage trick if on same domain, 
        // OR just rely on the user being logged in to the main specific site and use an iframe (complex).
        //
        // SIMPLIFIED APPROACH:
        // We will ask the user to open the Fenrir Web App. The Web App will broadcast the UID/Token
        // to the extension via chrome.runtime.sendMessage (externally_connectable) or local storage if possible.
        //
        // BETTER: The content script on 'localhost:3000' (or production URL) can scrape the UID from LocalStorage 
        // and send it to background.
        sendResponse({ token: userToken });
    }

    if (request.action === 'setAuth') {
        userToken = request.token;
        chrome.storage.local.set({ fenrirAuth: request.token });
    }
});

// Alarm for periodic checks if needed
chrome.alarms.create('tick', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => {
    // console.log("Tick");
});
