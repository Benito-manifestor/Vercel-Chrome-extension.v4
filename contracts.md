# Emergent Deploy - Backend Implementation Contracts

## API Endpoints to Implement

### 1. Settings Management
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### 2. Deployments Management
- `GET /api/deployments` - Get all deployments with filtering
- `POST /api/deployments` - Create new deployment
- `GET /api/deployments/:id` - Get specific deployment
- `PUT /api/deployments/:id` - Update deployment status

### 3. Stats & Analytics
- `GET /api/stats` - Get deployment statistics
- `GET /api/activity` - Get recent activity logs

### 4. Vercel Integration
- `POST /api/deploy/vercel` - Deploy project to Vercel
- `GET /api/deploy/status/:id` - Get deployment status from Vercel

## Data Models

### Settings Model
```javascript
{
  _id: ObjectId,
  userId: String, // For future multi-user support
  vercelApiToken: String, // Encrypted
  autoDeployEnabled: Boolean,
  defaultTeam: String,
  deploymentRegion: String,
  notifications: {
    success: Boolean,
    failures: Boolean,
    building: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Deployment Model
```javascript
{
  _id: ObjectId,
  projectName: String,
  emergentUrl: String,
  vercelUrl: String,
  vercelDeploymentId: String, // From Vercel API
  status: String, // 'building', 'deployed', 'failed'
  framework: String,
  deployTime: String,
  error: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Model
```javascript
{
  _id: ObjectId,
  type: String, // 'deployment', 'build', 'error', 'extension'
  message: String,
  status: String, // 'success', 'error', 'info'
  deploymentId: ObjectId, // Reference to deployment
  timestamp: Date
}
```

## Mock Data to Replace

### From mock.js:
1. **mockDeployments** → Replace with MongoDB queries
2. **mockSettings** → Replace with user settings from DB
3. **mockStats** → Calculate from actual deployment data
4. **mockRecentActivity** → Replace with activity logs from DB
5. **mockApiCalls** → Replace with real API endpoints

## Vercel API Integration

### Required Vercel API Calls:
1. **Create Deployment**: `POST /v13/deployments`
2. **Get Deployment Status**: `GET /v13/deployments/{id}`
3. **List Deployments**: `GET /v13/deployments`

### Environment Variables:
- `VERCEL_API_TOKEN` - Store user's Vercel token (from settings)
- `ENCRYPTION_KEY` - For encrypting API tokens in database

## Frontend Integration Plan

### Files to Update:
1. **mock.js** → Remove and replace with real API service
2. **Dashboard.js** → Replace mockApiCalls with axios calls to backend
3. **Deployments.js** → Connect to real deployment endpoints
4. **Settings.js** → Connect to settings API endpoints
5. **Extension.js** → Add real extension download functionality

### New Service File:
Create `src/services/api.js` with:
- Deployment service methods
- Settings service methods  
- Stats service methods
- Error handling
- Authorization headers

## Chrome Extension Implementation

### Files to Create:
1. **manifest.json** - Extension configuration
2. **content.js** - Inject deployment button on app.emergent.sh/chat  
3. **background.js** - Handle Vercel API calls
4. **popup.html/js** - Extension popup interface
5. **icons/** - Extension icons

### Extension Features:
- Detect Emergent projects on app.emergent.sh/chat
- Inject "Deploy to Vercel" button
- Handle one-click deployment
- Show deployment status notifications
- Store user settings locally

## Security Considerations

1. **API Token Encryption** - Encrypt Vercel tokens in database
2. **CORS Configuration** - Proper CORS for extension communication
3. **Input Validation** - Validate all API inputs
4. **Error Handling** - Proper error responses and logging

## Implementation Order

1. ✅ Frontend with mock data (COMPLETED)
2. 🔄 Backend API endpoints
3. 🔄 Vercel API integration  
4. 🔄 Frontend-backend integration
5. 🔄 Chrome extension development
6. 🔄 Testing and deployment

## Success Criteria

- [ ] All API endpoints working
- [ ] Vercel deployment integration functional
- [ ] Real-time deployment status updates
- [ ] Chrome extension detects Emergent projects
- [ ] One-click deployment from Emergent to Vercel
- [ ] Deployment history and statistics tracking
- [ ] Error handling and user feedback