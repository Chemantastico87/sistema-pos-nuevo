import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TrialBanner } from './TrialBanner';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 overflow-hidden font-sans">
      <TrialBanner onOpenSubscriptions={() => navigate('/subscriptions')} />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 p-4 overflow-y-auto bg-slate-100/90">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
