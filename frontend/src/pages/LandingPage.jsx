import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { ease: 'easeInOut', duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] // Ease-standard
    }
  }
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="min-h-screen flex flex-col justify-center items-center bg-background px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex-1 flex flex-col justify-center items-center text-center w-full">
        <motion.div 
          className="w-20 h-20 bg-primary text-white rounded-xl flex items-center justify-center mb-8 shadow-sm"
          variants={itemVariants}
        >
          <Leaf size={40} />
        </motion.div>
        
        <motion.h1 
          className="text-2xl font-bold text-text-main mb-4 tracking-tight"
          variants={itemVariants}
        >
          CanteenConnect
        </motion.h1>
        
        <motion.p 
          className="text-base text-text-muted mb-12 max-w-[280px] leading-relaxed"
          variants={itemVariants}
        >
          Efficiently redirect surplus food from canteens to specialized NGOs and processors.
        </motion.p>

        <motion.div variants={itemVariants} className="w-full">
          <button 
            onClick={() => navigate('/select-role')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg shadow-sm transition-system active:scale-[0.98] text-sm uppercase tracking-widest border border-transparent"
          >
            Get Started
          </button>
        </motion.div>
      </div>

      <motion.div 
        className="pb-10 w-full text-center"
        variants={itemVariants}
      >
        <p className="text-sm text-text-muted font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline transition-system">
            Login
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
