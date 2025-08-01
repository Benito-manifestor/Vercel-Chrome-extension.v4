// Background script for Emergent Deploy Chrome Extension

const BACKEND_URL = 'https://e90ba4ca-1a64-44f0-a4a6-544110e7c91a.preview.emergentagent.com';
const API_BASE = `${BACKEND_URL}/api`;

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Emergent Deploy extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      autoDeployEnabled: true,
      notifications: {
        success: true,
        failures: true,
        building: false
      }
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'deploy') {
    handleDeployment(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getSettings') {
    getSettings()
      .then(settings => sendResponse({ success: true, data: settings }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

// Handle deployment requests
async function handleDeployment(deploymentData) {
  try {
    const response = await fetch(`${API_BASE}/deployments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Emergent Deploy',
      message: `Deployment started for ${deploymentData.projectName}`
    });

    return result;
  } catch (error) {
    console.error('Background deployment error:', error);
    throw error;
  }
}

// Get extension settings
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['autoDeployEnabled', 'notifications'], (result) => {
      resolve({
        autoDeployEnabled: result.autoDeployEnabled ?? true,
        notifications: result.notifications ?? {
          success: true,
          failures: true,
          building: false
        }
      });
    });
  });
}

// Update badge text based on deployment status
function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// Monitor active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  
  if (tab.url && tab.url.includes('app.emergent.sh/chat')) {
    updateBadge('', '#4299e1'); // Blue when on Emergent
  } else {
    updateBadge('', '#666666'); // Gray when not on Emergent
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('app.emergent.sh/chat')) {
    updateBadge('', '#4299e1');
  }
});