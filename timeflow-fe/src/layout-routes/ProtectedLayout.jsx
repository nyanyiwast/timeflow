import React from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Settings, LogOut } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-green-600">TimeFlow</h1>
              <Badge variant="secondary" className="ml-2">
                {user.name}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" onClick={() => navigate('/app')} className="hover:text-green-600">
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/app/admin')} className="hover:text-green-600">
                  <Settings className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </nav>
              <Button variant="ghost" onClick={() => { logout(); navigate('/login'); }} className="hover:text-red-600">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-8 p-4 text-center text-sm text-gray-500 border-t">
        Developed by Celine
      </footer>
    </div>
  );
};

export default ProtectedLayout;