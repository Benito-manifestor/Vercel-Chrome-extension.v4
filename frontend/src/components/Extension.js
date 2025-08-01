import React, { useState } from 'react';
import { 
  Puzzle, 
  Download, 
  Chrome, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Code,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

const Extension = () => {
  const [extensionStatus, setExtensionStatus] = useState('not-installed');

  const handleDownloadExtension = () => {
    // In a real app, this would initiate the extension download
    alert('Extension download would start here. The actual extension files will be generated after backend implementation.');
  };

  const getStatusBadge = () => {
    switch (extensionStatus) {
      case 'installed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Installed</Badge>;
      case 'connected':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Connected</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Not Installed</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Chrome Extension</h1>
        <p className="text-slate-600">Install and manage the Emergent Deploy browser extension</p>
      </div>

      <div className="space-y-6">
        {/* Extension Status */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Chrome className="w-5 h-5" />
                <span>Extension Status</span>
              </div>
              {getStatusBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Puzzle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Emergent Deploy Extension</h3>
                <p className="text-slate-600">One-click deployment from Emergent to Vercel</p>
              </div>
            </div>

            {extensionStatus === 'not-installed' && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The extension is not installed. Click the download button to install it in Chrome.
                </AlertDescription>
              </Alert>
            )}

            {extensionStatus === 'installed' && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Extension installed successfully! You can now deploy projects directly from Emergent.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleDownloadExtension}
              disabled={extensionStatus === 'installed'}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {extensionStatus === 'installed' ? 'Extension Installed' : 'Download Extension'}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Extension Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Auto-Detection</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Automatically detects Emergent projects on app.emergent.sh/chat
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">One-Click Deploy</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Deploy directly to Vercel with a single button click
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Custom Configuration</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Use your saved deployment settings and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Live Preview</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Get direct links to your deployed applications
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Guide */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Installation Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-900">Download the Extension</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Click the "Download Extension" button above to get the extension file
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-900">Open Chrome Extensions</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Go to <code className="bg-slate-100 px-2 py-1 rounded">chrome://extensions/</code> in your browser
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-900">Enable Developer Mode</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Toggle the "Developer mode" switch in the top right corner
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium text-slate-900">Load the Extension</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Click "Load unpacked" and select the downloaded extension folder
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-slate-900">Start Using</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Navigate to <a href="https://app.emergent.sh/chat" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">app.emergent.sh/chat</a> and look for the deploy button
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Troubleshooting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Extension not working?</h4>
                <ul className="text-sm text-slate-600 space-y-1 ml-4">
                  <li>• Ensure you're on the correct Emergent page (app.emergent.sh/chat)</li>
                  <li>• Check if the extension is enabled in Chrome extensions</li>
                  <li>• Verify your Vercel API token is configured in Settings</li>
                  <li>• Refresh the page and try again</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Deployment failures?</h4>
                <ul className="text-sm text-slate-600 space-y-1 ml-4">
                  <li>• Check the Deployments page for error details</li>
                  <li>• Verify your Vercel account has sufficient permissions</li>
                  <li>• Ensure the project structure is compatible with Vercel</li>
                  <li>• Review the console logs in the browser developer tools</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Extension;