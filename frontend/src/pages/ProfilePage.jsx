import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Edit3, Save, MapPin, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 }
  }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || 'Administrator',
    orgName: user?.organisation_name || 'VESIT Canteen',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate async update
    await new Promise(r => setTimeout(r, 800));
    setUser({
      ...user,
      name: editForm.name,
      organisation_name: editForm.orgName
    });
    setLoading(false);
    setIsEditing(false);
  };

  const roleLabel = user?.role === 'ngo' || user?.role === 'composter' ? 'Partner Organization' : 'Authorized Donor';

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="bg-surface px-8 pt-12 pb-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-text-muted hover:bg-slate-100 rounded-full transition-system active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Account</p>
            <h1 className="text-xl font-bold text-text-main tracking-tight italic">User Profile</h1>
          </div>
        </div>
      </header>

      <div className="px-8 mt-10">
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-surface rounded-xl p-8 shadow-subtle border border-border flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-slate-50 text-text-muted rounded-xl border border-border flex items-center justify-center mb-6 shadow-sm">
            <UserIcon size={32} />
          </div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h2 className="text-lg font-bold text-text-main tracking-tight mb-1 text-center">{editForm.orgName}</h2>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest italic mb-6">
                  {roleLabel}
                </p>

                <div className="w-full space-y-6 mb-10 border-t border-border/50 pt-8 mt-2">
                  <div className="flex items-center gap-5">
                     <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-muted/40 border border-border/50"><Phone size={18}/></div>
                     <div>
                       <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Primary Phone</p>
                       <p className="text-sm font-bold text-text-main tracking-tight">{user?.phone || '+91 00000 00000'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-5">
                     <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-text-muted/40 border border-border/50"><MapPin size={18}/></div>
                     <div>
                       <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Operational Area</p>
                       <p className="text-sm font-bold text-text-main tracking-tight italic">Chembur, Mumbai</p>
                     </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full border border-border text-text-main font-bold py-3.5 flex items-center justify-center gap-2 rounded-lg hover:bg-slate-50 transition-system active:scale-[0.98] text-xs uppercase tracking-widest"
                  >
                    <Edit3 size={16} /> Edit Details
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-danger border border-red-100 font-bold py-3.5 flex items-center justify-center gap-2 rounded-lg hover:bg-red-100/50 transition-system active:scale-[0.98] text-xs uppercase tracking-widest"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Organization</label>
                  <input 
                    type="text" 
                    value={editForm.orgName} 
                    onChange={e => setEditForm({...editForm, orgName: e.target.value})}
                    className="w-full border border-border rounded-lg p-3.5 text-sm font-bold bg-slate-50 focus:bg-white focus:border-primary outline-none transition-system text-text-main"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Primary Representative</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full border border-border rounded-lg p-3.5 text-sm font-bold bg-slate-50 focus:bg-white focus:border-primary outline-none transition-system text-text-main"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="flex-1 py-3 text-text-muted font-bold border border-border rounded-lg hover:bg-slate-50 transition-system text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-system flex justify-center items-center gap-2 active:scale-[0.98] text-[10px] uppercase tracking-widest"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14}/> Save Changes</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <BottomNav />
    </motion.div>
  );
}
