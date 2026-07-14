import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Plus, Minus, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const QUICK_TAGS = ["Onion peels", "Fruit scraps", "Vegetable peels", "Egg shells", "Tea leaves", "Coconut husk"];
const API_BASE = `http://${window.location.hostname}:4000/api`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 }
  }
};

export default function ReportOrganicPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgName = user?.organisation_name || 'VESIT Canteen';

  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(5);
  const [pickupWindow, setPickupWindow] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setPickupWindow(`${hours}:${mins}`);
  }, []);

  const handleAddTag = (tag) => {
    setDescription(prev => {
      const parts = prev.split(',').map(s => s.trim()).filter(Boolean);
      if (!parts.includes(tag)) return parts.length > 0 ? `${prev}, ${tag}` : tag;
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        description,
        weight_kg: weight,
        pickupTime: pickupWindow,
        sourceName: orgName,
        sourceType: 'canteen',
        user_id: user?.uid || 'mock',
        coordinates: { lat: 19.0443, lng: 72.8891 }
      };

      const res = await fetch(`${API_BASE}/reports/organic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSubmitted(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      alert('Submission failed. Technical error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center text-text-main">
        <div className="w-20 h-20 bg-emerald-50 text-primary rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-xl font-bold mb-2 tracking-tight italic">Live Identification Success</h1>
        <p className="text-sm text-text-muted max-w-[240px]">Processing hubs have been synchronized. Pickup expected: {pickupWindow}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-surface flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="bg-surface px-8 pt-12 pb-8 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-text-muted hover:bg-slate-100 rounded-full transition-system active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Reports</p>
            <h1 className="text-xl font-bold text-text-main tracking-tight italic">Organic Waste</h1>
          </div>
        </div>
        <div className="bg-emerald-50 text-primary p-2.5 rounded-lg border border-primary/10">
          <Leaf size={20} />
        </div>
      </header>

      <motion.div 
        className="flex-1 px-8 py-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Materials</label>
            <textarea
              className="w-full border border-border rounded-lg p-4 text-sm bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-system font-bold text-text-main placeholder:text-text-muted/40 shadow-subtle resize-none"
              rows="3"
              placeholder="Description of organic content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>

            <div className="flex flex-wrap gap-2 pt-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="bg-white border border-border text-text-muted px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-system"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Estimated Weight</label>
            <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-lg border border-border shadow-subtle">
              <button
                type="button"
                onClick={() => setWeight(Math.max(1, weight - 1))}
                className="w-12 h-12 bg-white rounded-md border border-border shadow-subtle flex items-center justify-center text-text-muted hover:text-primary transition-system active:scale-90"
              >
                <Minus size={18} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-text-main tracking-tighter">{weight}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">kg</span>
              </div>
              <button
                type="button"
                onClick={() => setWeight(weight + 1)}
                className="w-12 h-12 bg-white rounded-md border border-border shadow-subtle flex items-center justify-center text-text-muted hover:text-primary transition-system active:scale-90"
              >
                <Plus size={18} />
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
             <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Collection Slot</label>
             <div className="flex items-center border border-border rounded-lg px-4 bg-slate-50 h-[58px] shadow-subtle focus-within:bg-white focus-within:border-primary transition-system">
                <Clock size={16} className="text-text-muted/40 mr-3" />
                <input 
                  type="time" 
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-bold text-text-main"
                  required
                />
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-6 pb-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-xl transition-system shadow-md active:scale-[0.98] text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Synchronize Report'}
            </button>
          </motion.div>
        </form>
      </motion.div>
      <BottomNav />
    </motion.div>
  );
}
