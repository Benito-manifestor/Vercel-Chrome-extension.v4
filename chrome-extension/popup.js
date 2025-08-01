// Popup script for Emergent Deploy Chrome Extension

const BACKEND_URL = 'https://e90ba4ca-1a64-44f0-a4a6-544110e7c91a.preview.emergentagent.com';
const API_BASE = `${BACKEND_URL}/api`;

document.addEventListener('DOMContentLoaded', async () => {
  // Set dashboard link
  document.getElementById('dashboard-link').href = BACKEND_URL;

  // Load initial data
  await loadDashboardData();

  // Set up event listeners
  document.getElementById('deploy-btn').addEventListener('click', handleDeploy);
});

// Load dashboard data
async function loadDashboardData() {
  const loading = document.getElementById('loading');
  const mainContent = document.getElementById('main-content');
  const errorDiv = document.getElementById('error');

  try {
    loading.style.display = 'block';
    mainContent.style.display = 'none';
    errorDiv.style.display = 'none';

    // Fetch stats and recent deployments
    const [statsResponse, deploymentsResponse] = await Promise.all([
      fetch(`${API_BASE}/stats`),
      fetch(`${API_BASE}/deployments?limit=3`)
    ]);

    if (!statsResponse.ok || !deploymentsResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const stats = await statsResponse.json();
    const deployments = await deploymentsResponse.json();

    // Update stats
    document.getElementById('total-deployments').textContent = stats.totalDeployments;
    document.getElementById('successful-deployments').textContent = stats.successfulDeployments;

    // Update recent deployments
    updateRecentDeployments(deployments);

    loading.style.display = 'none';
    mainContent.style.display = 'block';

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    loading.style.display = 'none';
    errorDiv.textContent = 'Failed to load data. Please check your connection.';
    errorDiv.style.display = 'block';
    mainContent.style.display = 'block';
  }
}

// Update recent deployments list
function updateRecentDeployments(deployments) {
  const deploymentsList = document.getElementById('deployments-list');
  
  if (deployments.length === 0) {
    deploymentsList.innerHTML = `
      <div class="deployment-item">
        <div class="deployment-name">No recent deployments</div>
        <div class="deployment-status">
          <span>Deploy your first project to get started</span>
        </div>
      </div>
    `;
    return;
  }

  deploymentsList.innerHTML = deployments.map(deployment => `
    <div class="deployment-item">
      <div class="deployment-name">${deployment.projectName}</div>
      <div class="deployment-status">
        <div class="dot status-${deployment.status}"></div>
        <span>${deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}</span>
        ${deployment.deployTime ? `• ${deployment.deployTime}` : ''}
      </div>
    </div>
  `).join('');
}

// Handle deployment button click
async function handleDeploy() {
  const deployBtn = document.getElementById('deploy-btn');
  const originalText = deployBtn.textContent;

  try {
    // Check if we're on an Emergent page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url || !tab.url.includes('app.emergent.sh/chat')) {
      showError('Please navigate to an Emergent chat page to deploy');
      return;
    }

    // Update button state
    deployBtn.textContent = 'Deploying...';
    deployBtn.disabled = true;
    deployBtn.style.opacity = '0.7';

    // Extract project information from the tab
    const projectInfo = await extractProjectInfoFromTab(tab);

    // Send deployment request
    const response = await fetch(`${API_BASE}/deployments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectInfo)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Deployment failed');
    }

    const deployment = await response.json();

    // Show success state
    deployBtn.textContent = 'Deployed!';
    deployBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Deployment Started',
      message: `${projectInfo.projectName} is being deployed to Vercel`
    });

    // Refresh data
    setTimeout(() => {
      loadDashboardData();
    }, 1000);

    // Reset button after 3 seconds
    setTimeout(() => {
      deployBtn.textContent = originalText;
      deployBtn.style.background = '';
      deployBtn.disabled = false;
      deployBtn.style.opacity = '1';
    }, 3000);

  } catch (error) {
    console.error('Deployment error:', error);
    showError(error.message);
    
    // Reset button
    deployBtn.textContent = originalText;
    deployBtn.disabled = false;
    deployBtn.style.opacity = '1';
  }
}

// Extract project information from the active tab
async function extractProjectInfoFromTab(tab) {
  // Default project info
  let projectInfo = {
    projectName: 'Emergent Project',
    emergentUrl: tab.url,
    framework: 'React'
  };

  try {
    // Try to get more specific information from the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // Try to extract project name from page content
        const title = document.title || 'Emergent Project';
        const chatTitle = document.querySelector('h1, .chat-title, [data-testid="chat-title"]');
        
        let projectName = title;
        if (chatTitle && chatTitle.textContent.trim()) {
          projectName = chatTitle.textContent.trim();
        }

        // Clean up project name
        projectName = projectName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
        if (!projectName) projectName = 'Emergent Project';

        return {
          projectName,
          emergentUrl: window.location.href,
          framework: 'React'
        };
      }
    });

    if (results && results[0] && results[0].result) {
      projectInfo = results[0].result;
    }
  } catch (error) {
    console.warn('Could not extract detailed project info:', error);
  }

  return projectInfo;
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}