/**
 * MiTruCo Primary Navigation Bar
 * Responsive bottom bar on mobile / top-accent tabs on desktop
 * Destinations: HOME | ACTIVITY | CONNECT | DOWNLOADS | SETTINGS
 */

import React from 'react';
import {
  MessageSquare,
  Clock,
  Users,
  Download,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, themeConfig } = useApp();

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: MessageSquare },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'connect', label: 'Connect', icon: Users },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="mitruco_main_nav"
      className="border-t sm:border-t-0 sm:border-b transition-colors z-20"
      style={{
        backgroundColor: themeConfig.surfaceBase,
        borderColor: themeConfig.borderBase,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-around sm:justify-start sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav_tab_${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex sm:flex-row flex-col items-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold rounded-t-lg transition-all relative ${
                isActive ? 'opacity-100' : 'opacity-60 hover:opacity-90'
              }`}
              style={{
                color: isActive ? themeConfig.accentColor : themeConfig.textBase,
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>

              {/* Active Tab Accent Line */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: themeConfig.accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
