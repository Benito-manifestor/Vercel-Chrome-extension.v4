// Content script for Emergent Deploy Chrome Extension
console.log('Emergent Deploy: Content script loaded');

const BACKEND_URL = 'https://e90ba4ca-1a64-44f0-a4a6-544110e7c91a.preview.emergentagent.com';
const API_BASE = `${BACKEND_URL}/api`;

// Function to create and inject the deploy button
function createDeployButton() {
  // Check if button already exists
  if (document.querySelector('#emergent-deploy-btn')) {
    return;
  }

  const deployButton = document.createElement('button');
  deployButton.id = 'emergent-deploy-btn';
  deployButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="white" stroke-width="2" fill="none"/>
      <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
    </svg>
    Deploy to Vercel
  `;
  
  deployButton.className = 'emergent-deploy-button';
  deployButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Hover effects
  deployButton.addEventListener('mouseenter', () => {
    deployButton.style.transform = 'translateY(-2px)';
    deployButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
  });

  deployButton.addEventListener('mouseleave', () => {
    deployButton.style.transform = 'translateY(0)';
    deployButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });

  // Click handler
  deployButton.addEventListener('click', handleDeploy);

  document.body.appendChild(deployButton);
}

// Function to extract project information from the page
function extractProjectInfo() {
  const url = window.location.href;
  const title = document.title || 'Emergent Project';
  
  // Try to extract project name from URL or page content
  let projectName = 'Emergent Project';
  
  // Look for chat title or project indicators
  const chatTitle = document.querySelector('h1, .chat-title, [data-testid="chat-title"]');
  if (chatTitle) {
    projectName = chatTitle.textContent.trim() || projectName;
  }

  // Clean up project name
  projectName = projectName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  if (!projectName) projectName = 'Emergent Project';

  return {
    projectName,
    emergentUrl: url,
    framework: 'React' // Default framework
  };
}

// Function to handle deployment
async function handleDeploy() {
  const button = document.querySelector('#emergent-deploy-btn');
  if (!button) return;

  // Update button state to loading
  const originalContent = button.innerHTML;
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/>
      <path d="M4 12a8 8 0 0 1 8-8" stroke="white" stroke-width="2" fill="none"/>
    </svg>
    Deploying...
  `;
  button.style.opacity = '0.8';
  button.disabled = true;

  try {
    const projectInfo = extractProjectInfo();
    
    // Send deployment request to backend
    const response = await fetch(`${API_BASE}/deployments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectInfo)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const deployment = await response.json();
    
    // Show success notification
    showNotification('Success', 'Deployment started successfully!', 'success');
    
    // Update button to success state temporarily
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
      </svg>
      Deployed!
    `;
    button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    
    // Reset button after 3 seconds
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      button.style.opacity = '1';
      button.disabled = false;
    }, 3000);

  } catch (error) {
    console.error('Deployment failed:', error);
    
    // Show error notification
    showNotification('Error', 'Deployment failed. Please check your settings.', 'error');
    
    // Reset button
    button.innerHTML = originalContent;
    button.style.opacity = '1';
    button.disabled = false;
  }
}

// Function to show notifications
function showNotification(title, message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 10001;
    background: white;
    border-radius: 8px;
    padding: 16px;
    max-width: 300px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-left: 4px solid ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="font-weight: 600; color: #2d3748; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 14px; color: #4a5568;">${message}</div>
  `;

  // Add animation keyframes
  if (!document.querySelector('#emergent-deploy-styles')) {
    const style = document.createElement('style');
    style.id = 'emergent-deploy-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Function to detect if we're on an Emergent chat page
function isEmergentChatPage() {
  return window.location.href.includes('app.emergent.sh/chat');
}

// Initialize the extension
function initialize() {
  if (isEmergentChatPage()) {
    console.log('Emergent Deploy: Detected Emergent chat page');
    createDeployButton();
    
    // Set up observer for page changes (SPA navigation)
    const observer = new MutationObserver((mutations) => {
      // Re-create button if it was removed
      if (!document.querySelector('#emergent-deploy-btn')) {
        createDeployButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also run on page navigation (for SPAs)
let currentUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    setTimeout(initialize, 1000); // Delay to allow page to load
  }
});
urlObserver.observe(document.body, { childList: true, subtree: true });