'use client';

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { FaBars } from 'react-icons/fa';
import Dashboard from './components/page/Dashboard';
import ManageAccountsPage from './components/page/Akun';
import YhoikiMemberPage from './components/page/Member';
import CommunityEventsPage from './components/page/Community';
import BlogPage from './components/page/Blog';
import FundingPage from './components/page/Pedanaan';
import MitraPage from './components/page/Mitra';
import PartnerListPage from './components/page/PartnerList';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="flex max-h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-md lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 focus:outline-none">
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Yhoiki Admin</h1>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {
            (() => {
              switch (activeMenu) {
                case "dashboard":
                  return <Dashboard />
                case "account":
                  return <ManageAccountsPage />
                case "members":
                  return <YhoikiMemberPage />
                case "community":
                  return <CommunityEventsPage />
                case "blog":
                  return <BlogPage />
                case "funding":
                  return <FundingPage />
                case "mitra":
                  return <MitraPage />
                case "partner":
                  return <PartnerListPage />
              }
            })()
          }
        </main>
      </div>
    </div>
  );
}
