// Mock data for Emergent to Vercel Chrome Extension

export const mockDeployments = [
  {
    id: 'dep_1',
    projectName: 'AI Chat App',
    emergentUrl: 'https://app.emergent.sh/chat/project-ai-chat',
    vercelUrl: 'https://ai-chat-app-emergen.vercel.app',
    status: 'deployed',
    createdAt: '2025-01-20T10:30:00Z',
    deployTime: '45s',
    framework: 'React'
  },
  {
    id: 'dep_2', 
    projectName: 'Task Manager Pro',
    emergentUrl: 'https://app.emergent.sh/chat/project-task-manager',
    vercelUrl: 'https://task-manager-pro-emergent.vercel.app',
    status: 'building',
    createdAt: '2025-01-20T11:15:00Z',
    deployTime: '32s',
    framework: 'Next.js'
  },
  {
    id: 'dep_3',
    projectName: 'E-commerce Dashboard', 
    emergentUrl: 'https://app.emergent.sh/chat/project-ecommerce',
    vercelUrl: null,
    status: 'failed',
    createdAt: '2025-01-20T09:45:00Z',
    deployTime: null,
    framework: 'React',
    error: 'Build failed: Missing environment variable'
  },
  {
    id: 'dep_4',
    projectName: 'Portfolio Website',
    emergentUrl: 'https://app.emergent.sh/chat/project-portfolio',
    vercelUrl: 'https://portfolio-emergent.vercel.app',
    status: 'deployed', 
    createdAt: '2025-01-19T16:20:00Z',
    deployTime: '28s',
    framework: 'Vite'
  }
];

export const mockSettings = {
  vercelApiToken: 'RsTPzeiivD3UfVAkgGm7sGaC',
  autoDeployEnabled: true,
  defaultTeam: 'personal',
  deploymentRegion: 'us-east-1',
  notifications: {
    success: true,
    failures: true,
    building: false
  }
};

export const mockStats = {
  totalDeployments: 24,
  successfulDeployments: 20,
  failedDeployments: 4,
  averageDeployTime: '38s',
  totalProjects: 12
};

export const mockRecentActivity = [
  {
    id: 'act_1',
    type: 'deployment',
    message: 'AI Chat App deployed successfully',
    timestamp: '2025-01-20T10:30:45Z',
    status: 'success'
  },
  {
    id: 'act_2',
    type: 'build',
    message: 'Task Manager Pro build started',
    timestamp: '2025-01-20T11:15:12Z', 
    status: 'info'
  },
  {
    id: 'act_3',
    type: 'error',
    message: 'E-commerce Dashboard deployment failed',
    timestamp: '2025-01-20T09:45:33Z',
    status: 'error'
  },
  {
    id: 'act_4',
    type: 'extension',
    message: 'Chrome extension connected to app.emergent.sh',
    timestamp: '2025-01-20T08:30:00Z',
    status: 'info'
  }
];

// API Mock functions
export const mockApiCalls = {
  getDeployments: () => Promise.resolve(mockDeployments),
  getSettings: () => Promise.resolve(mockSettings),
  updateSettings: (newSettings) => Promise.resolve({ ...mockSettings, ...newSettings }),
  getStats: () => Promise.resolve(mockStats),
  getRecentActivity: () => Promise.resolve(mockRecentActivity),
  triggerDeployment: (projectData) => Promise.resolve({
    id: `dep_${Date.now()}`,
    ...projectData,
    status: 'building',
    createdAt: new Date().toISOString()
  })
};