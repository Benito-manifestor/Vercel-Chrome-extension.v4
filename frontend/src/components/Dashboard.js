import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Activity,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { mockApiCalls } from '../mock';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, activityData, deploymentsData] = await Promise.all([
          mockApiCalls.getStats(),
          mockApiCalls.getRecentActivity(),
          mockApiCalls.getDeployments()
        ]);
        
        setStats(statsData);
        setRecentActivity(activityData.slice(0, 5));
        setRecentDeployments(deploymentsData.slice(0, 3));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      deployed: 'bg-green-100 text-green-700',
      building: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge className={`${variants[status]} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Monitor your Emergent to Vercel deployments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Deployments</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalDeployments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulDeployments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedDeployments}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Deploy Time</p>
                <p className="text-2xl font-bold text-slate-900">{stats.averageDeployTime}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deployments */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Recent Deployments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeployments.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <p className="font-medium text-slate-900">{deployment.projectName}</p>
                      <p className="text-sm text-slate-500">{deployment.framework}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(deployment.status)}
                    {deployment.vercelUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={deployment.vercelUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-400' :
                    activity.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;