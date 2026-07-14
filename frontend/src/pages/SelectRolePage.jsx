import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Building2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 }
  }
};

export default function SelectRolePage() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate('/register');
  };

  return (
    <motion.div 
      className="min-h-screen bg-background flex flex-col px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="pt-8 pb-10" variants={itemVariants}>
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-primary hover:bg-slate-100 rounded-full transition-system active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
      </motion.div>

      <div className="flex-1 w-full mx-auto flex flex-col">
        <motion.h1 className="text-xl font-bold text-text-main mb-2 tracking-tight" variants={itemVariants}>
          Select your role
        </motion.h1>
        <motion.p className="text-sm text-text-muted mb-10" variants={itemVariants}>
          How will you be using CanteenConnect today?
        </motion.p>

        <div className="grid grid-cols-1 gap-4 flex-1 pb-10">
          <motion.button 
            variants={itemVariants}
            onClick={() => handleSelectRole('donor')}
            className="flex flex-col items-center justify-center p-8 bg-surface rounded-xl shadow-subtle border border-border hover:border-primary hover:shadow-md transition-system group h-fit active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-lg bg-emerald-50 text-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-system">
              <Leaf size={32} />
            </div>
            <h2 className="text-base font-bold text-text-main mb-2">Canteen / Donor</h2>
            <p className="text-text-muted text-center text-xs leading-relaxed max-w-[200px]">
              Register to report organic waste or donate surplus food.
            </p>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            onClick={() => handleSelectRole('ngo')}
            className="flex flex-col items-center justify-center p-8 bg-surface rounded-xl shadow-subtle border border-border hover:border-primary hover:shadow-md transition-system group h-fit active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-lg bg-amber-50 text-accent flex items-center justify-center mb-6 group-hover:scale-105 transition-system">
              <Building2 size={32} />
            </div>
            <h2 className="text-base font-bold text-text-main mb-2">NGO / Processor</h2>
            <p className="text-text-muted text-center text-xs leading-relaxed max-w-[200px]">
              Accept pickup requests and manage collections.
            </p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
