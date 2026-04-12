import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('selectedRole') || 'donor';
  
  const homePath = role === 'ngo' ? '/ngo-dashboard' : '/dashboard';

  const navItems = [
    { icon: <Home size={24} />, label: 'Home', path: homePath },
    ...(role === 'donor' ? [{ icon: <BarChart2 size={24} />, label: 'Impact', path: '/impact' }] : []),
    { icon: <User size={24} />, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-gray-400 hover:text-accent'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
