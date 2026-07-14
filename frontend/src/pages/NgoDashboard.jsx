import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, MapPin, Check, X, Map, Loader2, Search, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

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

export default function NgoDashboard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('NGO'); // 'NGO' or 'Composter'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, requestFcmToken } = useAuth();
  const [processingId, setProcessingId] = useState(null);

  const searchInputRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchNearby = async () => {
    try {
      let url = `${API_BASE}/reports/nearby`;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        url += `?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=20`;
      } catch (e) {
        console.warn("Location filtering skipped");
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRequests(data.reports);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      requestFcmToken(user.uid);
    }
    fetchNearby();
    const interval = setInterval(fetchNearby, 30000);

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
        fetchNearbyDonors(lat, lng);
      });
    };

    loadGoogleMaps('places').then(initAutocomplete).catch(err => console.error('[Maps] Load error:', err));

    return () => clearInterval(interval);
  }, []);

  const fetchNearbyDonors = async (lat, lng) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donors/nearby?lat=${lat}&lng=${lng}&radius=15`);
      const data = await res.json();
      if (data.success) setSearchResults(data.donors);
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

  const handleAccept = async (req) => {
    setProcessingId(req.id);
    try {
      if (mode === 'Composter' && req.type === 'organic') {
        // Payment logic...
        const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: req.id })
        });
        const order = await orderRes.json();
        if (!order.success) throw new Error('Order failed');

        const options = {
          key: 'rzp_test_ScYWzfeATK9Hgt',
          amount: order.amount,
          currency: 'INR',
          name: 'CanteenConnect',
          order_id: order.orderId,
          handler: async (resp) => {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...resp, reportId: req.id })
            });
            const vData = await verifyRes.json();
            if (vData.success) {
              setRequests(requests.filter(r => r.id !== req.id));
            }
          },
          theme: { color: '#15803d' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const res = await fetch(`${API_BASE}/reports/${req.id}/accept`, { method: 'PATCH' });
        if (res.ok) {
          setRequests(requests.filter(r => r.id !== req.id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleMode = async (newMode) => {
    setMode(newMode);
    if (user?.uid) {
      const newRole = newMode === 'NGO' ? 'ngo' : 'composter';
      try {
        await fetch(`${API_BASE}/users/${user.uid}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
      } catch (err) {
        console.error("Failed to update user role", err);
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header Section */}
      <div className="bg-surface px-8 pt-12 pb-8">
        <div className="flex bg-slate-100 p-1 rounded-lg w-full mb-8">
          <button 
            onClick={() => handleToggleMode('NGO')}
            className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-system uppercase tracking-widest ${mode === 'NGO' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
          >
            NGO Mode
          </button>
          <button 
            onClick={() => handleToggleMode('Composter')}
            className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-system uppercase tracking-widest ${mode === 'Composter' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
          >
            Processor
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Live Feed</p>
            <h1 className="text-xl font-bold text-text-main tracking-tight">Active Requests</h1>
          </div>
          <div className="bg-emerald-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/10 uppercase tracking-tight">
            {requests.filter(req => mode === 'NGO' ? req.type === 'food' : req.type === 'organic').length} Available
          </div>
        </div>
      </div>

      <div className="px-8 mt-8">
        {/* Geographic Search Section */}
        <motion.section variants={itemVariants} className="mb-8 space-y-4">
          <div className="flex justify-between items-center pl-1">
             <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest border-none shadow-none">Nearby Partner Search</h2>
             <span className="text-[8px] font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">Donor / Canteen</span>
          </div>
          
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-system">
              <Search size={18} />
            </div>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search area for donors..." 
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

        <motion.button 
          onClick={() => navigate('/map')}
          className="w-full bg-surface border border-border rounded-xl p-5 mb-8 flex items-center justify-between shadow-subtle hover:border-primary transition-system active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 p-2.5 rounded-lg text-text-muted">
              <Map size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-text-main uppercase tracking-tight">Activity Map</h4>
              <p className="text-[10px] text-text-muted">Track locations near you</p>
            </div>
          </div>
        </motion.button>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface border border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="skeleton w-12 h-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-4 w-1/3" />
                      <div className="skeleton h-3 w-1/4" />
                    </div>
                  </div>
                  <div className="skeleton h-24 w-full" />
                  <div className="skeleton h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {requests.filter(req => mode === 'NGO' ? req.type === 'food' : req.type === 'organic').map((req) => (
                <motion.div 
                  key={req.id} 
                  variants={itemVariants}
                  layout
                  className="bg-surface rounded-xl p-6 shadow-subtle border border-border hover:border-primary transition-system group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${req.sourceType === 'canteen' ? 'bg-slate-50 text-text-muted' : 'bg-slate-50 text-text-muted'}`}>
                        {req.sourceType === 'canteen' ? <Building2 size={24}/> : <User size={24}/>}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-main tracking-tight leading-tight">{req.sourceName}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                           <MapPin size={10} className="text-text-muted/40" />
                           <p className="text-[9px] text-text-muted font-bold uppercase tracking-tight">
                              {req.distance || 'nearby'} • {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-md border ${
                      req.type === 'organic' ? 'bg-emerald-50 text-primary border-primary/10' : 'bg-amber-50 text-accent border-accent/10'
                    } uppercase tracking-widest`}>
                      {req.type}
                    </span>
                  </div>

                  <div className="mb-6">
                    {req.type === 'organic' ? (
                      <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4 border border-border/50">
                        <div>
                          <p className="text-[8px] text-text-muted uppercase font-bold tracking-widest mb-1">Weight</p>
                          <p className="text-xs font-bold text-text-main">{req.weight_kg}kg</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-text-muted uppercase font-bold tracking-widest mb-1">Pickup</p>
                          <p className="text-xs font-bold text-text-main">{req.pickupTime}</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-border/50">
                           <p className="text-[9px] text-text-muted leading-relaxed font-medium">"{req.description}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-lg p-3 border border-border/50 flex gap-4">
                        <img src={req.imageUrl} alt="Food" className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[8px] text-text-muted uppercase font-bold tracking-widest mb-1">{req.foodName}</p>
                          <p className="text-xs font-bold text-text-main">{req.quantity_servings} Servings</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleAccept(req)}
                      disabled={processingId === req.id}
                      className={`flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-lg transition-system shadow-sm active:scale-[0.98] text-[10px] uppercase tracking-widest flex items-center justify-center gap-2`}
                    >
                      {processingId === req.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (mode === 'Composter' && req.type === 'organic') ? (
                        `Pay ₹${req.weight_kg * 10}`
                      ) : (
                        'Accept Pickup'
                      )}
                    </button>
                    <button 
                      onClick={() => setRequests(requests.filter(r => r.id !== req.id))}
                      className="w-12 h-11 border border-border text-text-muted/40 hover:text-danger hover:border-danger hover:bg-red-50 rounded-lg transition-system active:scale-95 flex items-center justify-center"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {requests.filter(req => mode === 'NGO' ? req.type === 'food' : req.type === 'organic').length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No active requests nearby</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </motion.div>
  );
}
