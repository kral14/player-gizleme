// Popup UI Logic - URL Management

const DEFAULT_URLS = [
    // Extension işləyir bütün saytlarda (<all_urls> manifest-də)
    // İstifadəçi popup-dan əlavə URL-lər əlavə edə bilər
];

// DOM Elements
const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const urlsList = document.getElementById('urlsList');
const status = document.getElementById('status');

// Load and display URLs
async function loadUrls() {
    const { customUrls = [] } = await chrome.storage.sync.get('customUrls');
    displayUrls(customUrls);
}

// Display URLs in the list
function displayUrls(customUrls) {
    urlsList.innerHTML = '';

    // Show default URLs
    DEFAULT_URLS.forEach(url => {
        const item = createUrlItem(url, true);
        urlsList.appendChild(item);
    });

    // Show custom URLs
    customUrls.forEach(url => {
        const item = createUrlItem(url, false);
        urlsList.appendChild(item);
    });

    // Show empty state if no custom URLs
    if (customUrls.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'Yuxarıdan yeni sayt əlavə edin';
        urlsList.appendChild(emptyState);
    }
}

// Create URL item element
function createUrlItem(url, isDefault) {
    const item = document.createElement('div');
    item.className = 'url-item' + (isDefault ? ' default' : '');

    const urlText = document.createElement('div');
    urlText.className = 'url-text';
    urlText.textContent = url;

    item.appendChild(urlText);

    if (isDefault) {
        const badge = document.createElement('span');
        badge.className = 'url-badge';
        badge.textContent = 'Default';
        item.appendChild(badge);
    } else {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Sil';
        deleteBtn.onclick = () => deleteUrl(url);
        item.appendChild(deleteBtn);
    }

    return item;
}

// Add new URL
async function addUrl() {
    let url = urlInput.value.trim();

    if (!url) {
        showStatus('URL daxil edin', 'error');
        return;
    }

    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    try {
        new URL(url.replace('*', 'example')); // Basic validation
    } catch (e) {
        showStatus('Düzgün URL daxil edin', 'error');
        return;
    }

    // Convert to pattern
    const pattern = convertToPattern(url);

    // Get existing URLs
    const { customUrls = [] } = await chrome.storage.sync.get('customUrls');

    // Check if already exists
    if (customUrls.includes(pattern) || DEFAULT_URLS.includes(pattern)) {
        showStatus('Bu URL artıq əlavə edilib', 'error');
        return;
    }

    // Add to storage
    customUrls.push(pattern);
    await chrome.storage.sync.set({ customUrls });

    // Update UI
    urlInput.value = '';
    loadUrls();
    showStatus('✅ URL əlavə edildi!', 'success');

    // Notify background script to update
    chrome.runtime.sendMessage({ action: 'urlsUpdated' });
}

// Delete URL
async function deleteUrl(url) {
    const { customUrls = [] } = await chrome.storage.sync.get('customUrls');
    const updated = customUrls.filter(u => u !== url);
    await chrome.storage.sync.set({ customUrls: updated });

    loadUrls();
    showStatus('URL silindi', 'success');

    // Notify background script
    chrome.runtime.sendMessage({ action: 'urlsUpdated' });
}

// Convert URL to pattern
function convertToPattern(url) {
    try {
        const urlObj = new URL(url);
        let pattern = urlObj.protocol + '//' + urlObj.hostname;

        // Add wildcard for subdomains if not present
        if (!urlObj.hostname.startsWith('*.') && !urlObj.hostname.startsWith('www.')) {
            const parts = urlObj.hostname.split('.');
            if (parts.length >= 2) {
                pattern = urlObj.protocol + '//*.' + parts.slice(-2).join('.');
            }
        }

        pattern += '/*';
        return pattern;
    } catch (e) {
        return url + '/*';
    }
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;

    setTimeout(() => {
        status.textContent = '';
        status.className = 'status';
    }, 3000);
}

// Event listeners
addBtn.addEventListener('click', addUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addUrl();
    }
});

// Initialize
loadUrls();

// ==========================================
// 🐞 Debug Pəncərəsi Məntiqi
// ==========================================
const toggleDebugBtn = document.getElementById('toggleDebugBtn');
const debugContent = document.getElementById('debugContent');
const popupLogs = document.getElementById('popupLogs');
const copyLogsBtn = document.getElementById('copyLogsBtn');
const clearLogsBtn = document.getElementById('clearLogsBtn');

toggleDebugBtn.addEventListener('click', () => {
    const isHidden = debugContent.style.display === 'none';
    debugContent.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        loadDebugLogs();
    }
});

function loadDebugLogs() {
    chrome.storage.local.get({ vchLogs: [] }, (res) => {
        const logs = res.vchLogs || [];
        if (logs.length === 0) {
            popupLogs.innerHTML = '<div class="log-empty">Hələ klik qeydə alınmayıb...</div>';
            return;
        }

        popupLogs.innerHTML = '';
        logs.forEach(log => {
            const row = document.createElement('div');
            row.style.lineHeight = '1.3';
            row.style.wordBreak = 'break-word';

            let color = '#38bdf8';
            if (log.type === 'warn') color = '#fbbf24';
            if (log.type === 'error') color = '#f87171';
            if (log.type === 'success') color = '#4ade80';

            row.innerHTML = `<span style="color:#64748b;">[${log.time}]</span> <span style="color:${color};">${log.msg}</span>`;
            popupLogs.appendChild(row);
        });
        popupLogs.scrollTop = popupLogs.scrollHeight;
    });
}

// 📋 Kopyala
copyLogsBtn.addEventListener('click', () => {
    const text = popupLogs.innerText;
    if (!text || text.includes('Hələ klik qeydə alınmayıb')) {
        showStatus('Kopyalanacaq loq yoxdur', 'error');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        copyLogsBtn.textContent = '✅ Kopyalandı!';
        setTimeout(() => { copyLogsBtn.textContent = '📋 Kopyala'; }, 1500);
    });
});

// 🗑️ Təmizlə
clearLogsBtn.addEventListener('click', () => {
    chrome.storage.local.set({ vchLogs: [] }, () => {
        popupLogs.innerHTML = '<div class="log-empty">Loqlar təmizləndi.</div>';
    });
});

// Açıq olanda hər saniyə yenilə
setInterval(() => {
    if (debugContent.style.display !== 'none') {
        loadDebugLogs();
    }
}, 1000);
