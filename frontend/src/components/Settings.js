import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Bell, 
  Globe, 
  Save,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { mockApiCalls } from '../mock';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await mockApiCalls.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await mockApiCalls.updateSettings(settings);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error", 
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Configure your Vercel integration and deployment preferences</p>
      </div>

      <div className="space-y-6">
        {/* API Configuration */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>API Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="vercelToken">Vercel API Token</Label>
              <Input
                id="vercelToken"
                type="password"
                value={settings?.vercelApiToken || ''}
                onChange={(e) => updateSetting('vercelApiToken', e.target.value)}
                placeholder="Enter your Vercel API token"
                className="mt-2"
              />
              <p className="text-sm text-slate-500 mt-2">
                You can generate a token from your <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel dashboard</a>
              </p>
            </div>

            <div>
              <Label htmlFor="defaultTeam">Default Team</Label>
              <Select value={settings?.defaultTeam || 'personal'} onValueChange={(value) => updateSetting('defaultTeam', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Settings */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Deployment Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="deploymentRegion">Default Region</Label>
              <Select 
                value={settings?.deploymentRegion || 'us-east-1'} 
                onValueChange={(value) => updateSetting('deploymentRegion', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto Deploy</Label>
                <p className="text-sm text-slate-500">
                  Automatically deploy when clicking deploy button in Emergent
                </p>
              </div>
              <Switch
                checked={settings?.autoDeployEnabled || false}
                onCheckedChange={(checked) => updateSetting('autoDeployEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Success Notifications</Label>
                <p className="text-sm text-slate-500">
                  Get notified when deployments succeed
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.success || false}
                onCheckedChange={(checked) => updateSetting('notifications.success', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Failure Notifications</Label>
                <p className="text-sm text-slate-500">
                  Get notified when deployments fail
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.failures || false}
                onCheckedChange={(checked) => updateSetting('notifications.failures', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Build Notifications</Label>
                <p className="text-sm text-slate-500">
                  Get notified when builds start
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.building || false}
                onCheckedChange={(checked) => updateSetting('notifications.building', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Secure Token Storage</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Your API tokens are encrypted and stored securely. They are never transmitted to external services except for authorized Vercel API calls.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-32">
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;