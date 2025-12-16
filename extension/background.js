// Background Service Worker - Dynamic Content Script Injection

const DEFAULT_URLS = [
    'https://animecix.tv/*',
    'https://animecix.co/*',
    'https://*.animecix.tv/*',
    'https://*.animecix.co/*',
    'https://tau-video.xyz/*',
    'https://*.tau-video.xyz/*'
];

// Check if URL matches any pattern
function urlMatchesPattern(url, pattern) {
    const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
    const regex = new RegExp('^' + regexPattern + '$');
    return regex.test(url);
}

// Get all active URL patterns
async function getActiveUrls() {
    const { customUrls = [] } = await chrome.storage.sync.get('customUrls');
    return [...DEFAULT_URLS, ...customUrls];
}

// Check if content script should run on this URL
async function shouldInjectScript(url) {
    const activeUrls = await getActiveUrls();
    return activeUrls.some(pattern => urlMatchesPattern(url, pattern));
}

// Inject content script into tab
async function injectContentScript(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ['content.js']
        });
        console.log('✅ Content script injected into tab:', tabId);
    } catch (error) {
        console.error('❌ Failed to inject script:', error);
    }
}

// Handle tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only inject when page is fully loaded
    if (changeInfo.status === 'complete' && tab.url) {
        const shouldInject = await shouldInjectScript(tab.url);

        if (shouldInject) {
            console.log('🎬 Injecting script into:', tab.url);
            await injectContentScript(tabId);
        }
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'urlsUpdated') {
        console.log('📝 URLs updated, will inject on next page load');
        // Optionally reload active tabs
        chrome.tabs.query({}, async (tabs) => {
            for (const tab of tabs) {
                if (tab.url && await shouldInjectScript(tab.url)) {
                    chrome.tabs.reload(tab.id);
                }
            }
        });
    }
});

// Initialize - inject into existing tabs on extension load/reload
chrome.runtime.onInstalled.addListener(async () => {
    console.log('🎬 Extension installed/updated');

    // Inject into all matching tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.url && await shouldInjectScript(tab.url)) {
            await injectContentScript(tab.id);
        }
    }
});

console.log('🎬 Background service worker active');
