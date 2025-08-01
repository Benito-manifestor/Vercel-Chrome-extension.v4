import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Rocket, 
  Settings, 
  Puzzle,
  BarChart3,
  Zap
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/deployments', icon: Rocket, label: 'Deployments' },
    { path: '/extension', icon: Puzzle, label: 'Extension' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Emergent Deploy</h1>
            <p className="text-sm text-slate-500">Vercel Integration</p>
          </div>
        </div>

        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Extension Status</span>
          </div>
          <p className="text-xs text-slate-500">Connected to Emergent</p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;