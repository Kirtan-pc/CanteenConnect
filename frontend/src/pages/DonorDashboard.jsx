import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Utensils, TrendingUp, Map, Bell, Search, Phone, ExternalLink, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const API_BASE = `http://${window.location.hostname}:4000/api`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 }
  }
};

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user, requestFcmToken } = useAuth();
  const [stats, setStats] = useState({ kgReported: 0, pickups: 0, activeNGOs: 0 });
  const [loading, setLoading] = useState(true);
  
  // Search State
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const orgName = user?.organisation_name || 'VESIT Canteen';

  useEffect(() => {
    if (user?.uid) {
      requestFcmToken(user.uid);
    }
    const fetchStats = async () => {
      try {
        const [impactRes, orgsRes] = await Promise.all([
          fetch(`${API_BASE}/impact/${user?.uid || 'mock'}`),
          fetch(`${API_BASE}/orgs/nearby`)
        ]);
        
        const iData = await impactRes.json();
        const oData = await orgsRes.json();

        if (iData.success) {
          setStats({
            kgReported: iData.impact.kg_diverted,
            pickups: iData.impact.pickups_count,
            activeNGOs: oData.success ? oData.orgs.length : 0
          });
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      if (!searchInputRef.current || !window.google) return;
      
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ['geometry', 'name', 'formatted_address']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;
        
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSearchQuery(place.name || place.formatted_address);
        fetchNearbyPartners(lat, lng);
      });
    };

    loadGoogleMaps('places').then(initAutocomplete).catch(err => console.error('[Maps] Load error:', err));
  }, [user]);

  const fetchNearbyPartners = async (lat, lng) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orgs/nearby?lat=${lat}&lng=${lng}&radius=15`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.orgs);
      }
    } catch (err) {
      console.error('Partner search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) searchInputRef.current.value = '';
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header className="pt-10 pb-8 flex justify-between items-end" variants={itemVariants}>
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Overview</p>
          <h1 className="text-xl font-bold text-text-main tracking-tight italic">Dashboard</h1>
          <p className="text-[11px] font-bold text-primary italic tracking-tight">{orgName}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary transition-system shadow-subtle">
          <Bell size={18} />
        </button>
      </motion.header>

      <div className="space-y-8">
        {/* Geographic Search Section */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center pl-1">
             <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest border-none shadow-none">Nearby Support Search</h2>
             <span className="text-[8px] font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">NGO / Composter</span>
          </div>
          
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-system">
              <Search size={18} />
            </div>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search area for partners..." 
              className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-12 text-sm font-bold text-text-main placeholder:text-text-muted/30 focus:border-primary outline-none transition-system shadow-subtle"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-main"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {(searchLoading || searchResults.length > 0) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50/50 rounded-xl border border-border/50 p-4 space-y-3">
                  {searchLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-text-muted/40">
                      <Loader2 size={24} className="animate-spin mb-3" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Scanning local partners...</p>
                    </div>
                  ) : (
                    searchResults.map((org, i) => (
                      <motion.div 
                        key={org.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-surface border border-border p-4 rounded-lg flex items-center justify-between shadow-subtle"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-text-main tracking-tight">{org.organisation_name || org.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{org.distance || '< 1 km'} away</p>
                            <span className="w-1 h-1 bg-border rounded-full"></span>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{org.phone || '+91 00000 00000'}</p>
                          </div>
                        </div>
                        <a 
                          href={`tel:${org.phone || '0000000000'}`}
                          className="w-10 h-10 bg-emerald-50 text-primary border border-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-system shadow-sm"
                        >
                          <Phone size={18} />
                        </a>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Main Reporting Section */}
        <motion.section variants={itemVariants} className="space-y-4">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1 border-none shadow-none">New Report</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/report/organic')}
              className="bg-surface border border-border rounded-xl p-5 text-left transition-system hover:border-primary hover:shadow-md active:scale-[0.98] group"
            >
              <div className="bg-emerald-50 text-primary w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-system">
                <Leaf size={20} />
              </div>
              <h3 className="font-bold text-text-main text-sm mb-1 uppercase tracking-tight">Organic</h3>
              <p className="text-[10px] text-text-muted leading-tight">Canteens & Processors</p>
            </button>

            <button 
              onClick={() => navigate('/report/food')}
              className="bg-surface border border-border rounded-xl p-5 text-left transition-system hover:border-primary hover:shadow-md active:scale-[0.98] group"
            >
              <div className="bg-amber-50 text-accent w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-system">
                <Utensils size={20} />
              </div>
              <h3 className="font-bold text-text-main text-sm mb-1 uppercase tracking-tight">Donation</h3>
              <p className="text-[10px] text-text-muted leading-tight">Prepared food surplus</p>
            </button>
          </div>
        </motion.section>

        {/* Real-time Stats */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center pl-1">
             <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest border-none shadow-none">Impact Metrics</h2>
             <span className="text-[8px] font-black text-primary bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live tracked</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Kg Saved', value: stats.kgReported, color: 'text-primary' },
              { label: 'Pickups', value: stats.pickups, color: 'text-primary' },
              { label: 'Partners', value: stats.activeNGOs, color: 'text-accent' }
            ].map((stat, i) => (
              <div key={i} className="bg-surface rounded-xl p-4 shadow-subtle border border-border flex flex-col items-center justify-center text-center text-nowrap overflow-hidden">
                {loading ? (
                  <div className="skeleton h-6 w-8 mb-2" />
                ) : (
                  <p className={`text-lg font-bold ${stat.color} tracking-tighter`}>{stat.value}</p>
                )}
                <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={itemVariants} className="space-y-3">
          <button 
            onClick={() => navigate('/map')}
            className="w-full bg-surface border border-border rounded-xl p-5 flex items-center justify-between shadow-subtle hover:border-primary transition-system active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 rounded-lg text-text-muted border border-border/50">
                <Map size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-text-main uppercase tracking-tight">Activity Map</h4>
                <p className="text-[10px] text-text-muted">Nearby collection points</p>
              </div>
            </div>
            <div className="text-primary opacity-30">
              <TrendingUp size={16} />
            </div>
          </button>

          <button 
            onClick={() => navigate('/impact')}
            className="w-full bg-text-main rounded-xl p-5 flex items-center justify-between shadow-md hover:opacity-95 transition-system active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-lg text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Global Impact</h4>
                <p className="text-[10px] text-slate-400">Analytics & Certification</p>
              </div>
            </div>
          </button>
        </motion.section>
      </div>

      <BottomNav />
    </motion.div>
  );
}
