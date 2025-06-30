'use client';

import React, { useState, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  FaHome, FaUser, FaUsers, FaComments, FaNewspaper,
  FaDollarSign, FaBriefcase, FaHandshake, FaChevronDown, FaChevronRight
} from 'react-icons/fa';
import { MdSettings, MdOutlineDashboardCustomize } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  key: string;
  children?: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  activeMenu: string;
  setActiveMenu: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, activeMenu, setActiveMenu }) => {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = useCallback((label: string) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const menuItems: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: FaHome },
    { key: 'account', label: 'Akun', icon: FaUser },
    { key: 'members', label: 'Member', icon: FaUsers },
    { key: 'formulir', label: 'Formulir', icon: FaUsers },
    { key: 'aktivitas', label: 'Aktivity', icon: FaUsers },
    { key: 'community', label: 'Community', icon: FaComments },
    { key: 'blog', label: 'Blog', icon: FaNewspaper },
    { key: 'funding', label: 'Pendanaan', icon: FaDollarSign },
    { key: 'mitra', label: 'Mitra', icon: FaBriefcase },
    { key: 'partner', label: 'Partner', icon: FaHandshake },
    {
      key: 'settings', label: 'Pengaturan', icon: MdSettings, children: [
        { key: 'landing', label: 'Landing Page', icon: MdOutlineDashboardCustomize },
        { key: 'general', label: 'General Settings', icon: MdSettings },
        { key: 'users', label: 'User Management', icon: FaUsers },
        { key: 'email', label: 'Email Settings', icon: FaNewspaper },
        { key: 'integrations', label: 'Integrations', icon: FaBriefcase }
      ]
    }
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={toggleSidebar}
      ></div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white text-gray-800 shadow-md transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        {/* Logo & Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 shadow">
          <div className="flex items-center gap-3">
            <img src="/images/logoputih.png" alt="Yhoiki Logo" className="w-8 h-12" />
            <span className="text-2xl font-semibold text-gray-700">Yhoiki</span>
          </div>
          <button className="lg:hidden text-white p-2" onClick={toggleSidebar}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2 pb-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.key || (item.children?.some(child => activeMenu === child.key));
              const isExpanded = expandedMenus[item.label];

              return (
                <li key={item.key}>
                  {item.children ? (
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`flex items-center w-full px-4 py-2 rounded-md text-left gap-3 transition-all ${isActive ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={isExpanded ? "down" : "right"}
                          initial={{ rotate: isExpanded ? 0 : -90 }}
                          animate={{ rotate: isExpanded ? 0 : 90 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          {isExpanded ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
                        </motion.div>
                      </AnimatePresence>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveMenu(item.key);
                        toggleSidebar();
                      }}
                      className={`flex items-center w-full px-4 py-2 rounded-md gap-3 transition-all ${isActive ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  )}

                  {item.children && (
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.ul
                          className="mt-1 ml-6 space-y-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <button
                                onClick={() => {
                                  setActiveMenu(child.key);
                                  toggleSidebar();
                                }}
                                className={`flex items-center w-full px-3 py-2 rounded-md gap-2 text-sm transition-all ${activeMenu === child.key ? 'bg-green-200 text-green-900 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
                              >
                                <child.icon className="w-4 h-4" />
                                <span>{child.label}</span>
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 4px;
          border: 2px solid #f0f0f0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
