import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Calendar,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api } from '../services/api';

const Deployments = () => {
  const [deployments, setDeployments] = useState([]);
  const [filteredDeployments, setFilteredDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadDeployments = async () => {
      try {
        const data = await api.deployments.list();
        setDeployments(data);
        setFilteredDeployments(data);
      } catch (error) {
        console.error('Failed to load deployments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeployments();
  }, []);

  useEffect(() => {
    let filtered = deployments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(deployment =>
        deployment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.framework.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deployment => deployment.status === statusFilter);
    }

    setFilteredDeployments(filtered);
  }, [deployments, searchTerm, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'building':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      deployed: 'bg-green-100 text-green-700 border-green-200',
      building: 'bg-blue-100 text-blue-700 border-blue-200', 
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    
    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-600">Loading deployments...</span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Deployments</h1>
        <p className="text-slate-600">Manage and monitor all your Vercel deployments</p>
      </div>

      {/* Filters */}
      <Card className="mb-8 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployments List */}
      <div className="space-y-4">
        {filteredDeployments.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No deployments found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredDeployments.map((deployment) => (
            <Card key={deployment.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {deployment.projectName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{deployment.framework}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(deployment.createdAt).toLocaleDateString()}</span>
                        </span>
                        {deployment.deployTime && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{deployment.deployTime}</span>
                          </span>
                        )}
                      </div>
                      {deployment.error && (
                        <p className="text-sm text-red-600 mt-1">{deployment.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(deployment.status)}
                    
                    <Button variant="outline" size="sm" asChild>
                      <a href={deployment.emergentUrl} target="_blank" rel="noopener noreferrer">
                        <span className="mr-2">Emergent</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    
                    {deployment.vercelUrl && (
                      <Button size="sm" asChild>
                        <a href={deployment.vercelUrl} target="_blank" rel="noopener noreferrer">
                          <span className="mr-2">View Live</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Deployments;