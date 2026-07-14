import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('selectedRole') || 'donor';
  
  const homePath = role === 'ngo' ? '/ngo-dashboard' : '/dashboard';

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: homePath },
    ...(role === 'donor' ? [{ icon: <BarChart2 size={20} />, label: 'Impact', path: '/impact' }] : []),
    { icon: <User size={20} />, label: 'Profile', path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] bg-surface border-t border-border py-4 px-10 flex justify-around items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="relative flex flex-col items-center gap-1 group transition-system active:scale-90"
          >
            <div className={`p-1.5 rounded-md transition-system ${isActive ? 'text-primary bg-emerald-50' : 'text-text-muted hover:text-text-main'}`}>
              {item.icon}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest transition-system ${isActive ? 'text-primary' : 'text-text-muted'}`}>
              {item.label}
            </span>
            
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute -bottom-4 w-1 h-1 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
