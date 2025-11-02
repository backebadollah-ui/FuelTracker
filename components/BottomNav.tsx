
import React from 'react';
import type { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import ListIcon from './icons/ListIcon';
import ChartIcon from './icons/ChartIcon';
import SettingsIcon from './icons/SettingsIcon';

interface BottomNavProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const NavItem: React.FC<{
  label: AppView;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'
    }`}
  >
    {icon}
    <span className="text-xs capitalize">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-20">
      <nav className="flex justify-around max-w-3xl mx-auto">
        <NavItem label="home" icon={<HomeIcon />} isActive={activeView === 'home'} onClick={() => setActiveView('home')} />
        <NavItem label="history" icon={<ListIcon />} isActive={activeView === 'history'} onClick={() => setActiveView('history')} />
        <NavItem label="reports" icon={<ChartIcon />} isActive={activeView === 'reports'} onClick={() => setActiveView('reports')} />
        <NavItem label="settings" icon={<SettingsIcon />} isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
      </nav>
    </footer>
  );
};

export default BottomNav;
