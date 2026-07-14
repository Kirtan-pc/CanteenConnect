import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Utensils, LocateFixed, Phone, Search, X, MapPin, Loader2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const API_BASE = `http://${window.location.hostname}:4000/api`;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 }
  }
};

export default function MapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orgFilter, setOrgFilter] = useState('ngo');
  const [reportFilter, setReportFilter] = useState('food');
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markersData, setMarkersData] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 19.0443, lng: 72.8891 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const markersRef = useRef([]);

  const fetchData = async (lat, lng) => {
    setLoading(true);
    try {
      let endpoint = user?.role === 'donor' ? `${API_BASE}/orgs/nearby` : `${API_BASE}/reports/nearby`;
      if (lat && lng) {
        endpoint += `?lat=${lat}&lng=${lng}&radius=25`;
      }
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setMarkersData(user?.role === 'donor' ? data.orgs : data.reports);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(userLocation.lat, userLocation.lng);
    loadGoogleMaps('places,geometry')
      .then(() => initMap())
      .catch(err => console.error('[Maps] Load error:', err));
  }, [user?.role]);

  const initMap = () => {
    if (!mapRef.current) return;
    const google = window.google;
    const currentCenter = map ? map.getCenter().toJSON() : userLocation;

    const newMap = new google.maps.Map(mapRef.current, {
      center: currentCenter,
      zoom: 15,
      disableDefaultUI: true,
      styles: [
        { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
        { "featureType": "transit", "elementType": "labels", "stylers": [{ "visibility": "off" }] }
      ]
    });

    setMap(newMap);

    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ['geometry', 'name', 'formatted_address']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        newMap.panTo(place.geometry.location);
        newMap.setZoom(14);
        setSearchQuery(place.name || place.formatted_address);
        fetchData(lat, lng);
      });
    }
  };

  useEffect(() => {
    if (!map) return;
    const google = window.google;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (!markersData.length) return;

    markersData.forEach(item => {
      if (!item.coordinates) return;
      if (user?.role === 'donor' && item.role !== orgFilter) return;
      if (user?.role !== 'donor' && item.type !== reportFilter) return;

      const marker = new google.maps.Marker({
        position: item.coordinates,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: user?.role === 'donor' ? '#15803d' : '#f59e0b',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 8
        }
      });

      marker.addListener('click', () => setSelectedPin(item));
      markersRef.current.push(marker);
    });
  }, [map, markersData, reportFilter, orgFilter, user?.role]);

  const handleCenter = () => {
    if (map) {
      map.panTo(userLocation);
      map.setZoom(15);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative flex flex-col overflow-hidden">
      {/* Header & Search Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 z-10 flex flex-col gap-6 pointer-events-none">
        {/* Top Controls */}
        <div className="flex items-center justify-between pointer-events-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 bg-surface shadow-md rounded-xl text-text-muted flex items-center justify-center hover:text-text-main transition-system active:scale-90 border border-border"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="bg-surface/90 backdrop-blur px-4 py-2 rounded-lg shadow-md text-[10px] font-bold text-text-main flex items-center gap-2 border border-border uppercase tracking-widest">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
            {user?.role === 'donor' ? 'Partner NGO View' : 'Live Report View'}
          </div>
        </div>

        {/* Search */}
        <div className="w-full pointer-events-auto">
           <div className="flex items-center gap-3 bg-surface/95 backdrop-blur px-5 py-4 rounded-xl shadow-md border border-border transition-system focus-within:border-primary">
             <Search size={20} className="text-text-muted opacity-40 shrink-0" />
             <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search local areas..." 
                className="w-full bg-transparent outline-none text-sm font-bold text-text-main placeholder:text-text-muted placeholder:font-bold placeholder:opacity-30 placeholder:uppercase placeholder:tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
             {searchQuery && (
               <button onClick={() => { setSearchQuery(''); handleCenter(); }} className="p-1 text-text-muted/40 hover:text-text-main">
                 <X size={18} />
               </button>
             )}
           </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-surface/95 backdrop-blur p-1 rounded-lg shadow-md pointer-events-auto self-center border border-border">
          {user?.role === 'donor' ? (
            <>
              <button 
                onClick={() => setOrgFilter('ngo')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-[9px] font-bold tracking-widest transition-system uppercase ${orgFilter === 'ngo' ? 'bg-slate-100 text-text-main' : 'text-text-muted hover:text-text-main'}`}
              >
                NGO
              </button>
              <button 
                onClick={() => setOrgFilter('composter')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-[9px] font-bold tracking-widest transition-system uppercase ${orgFilter === 'composter' ? 'bg-slate-100 text-text-main' : 'text-text-muted hover:text-text-main'}`}
              >
                Composting Organisation
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setReportFilter('food')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-[9px] font-bold tracking-widest transition-system uppercase ${reportFilter === 'food' ? 'bg-slate-100 text-text-main' : 'text-text-muted hover:text-text-main'}`}
              >
                Food
              </button>
              <button 
                onClick={() => setReportFilter('organic')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-[9px] font-bold tracking-widest transition-system uppercase ${reportFilter === 'organic' ? 'bg-slate-100 text-text-main' : 'text-text-muted hover:text-text-main'}`}
              >
                Organic Waste
              </button>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 bg-slate-200" />

      {/* FAB */}
      <div className="absolute bottom-32 right-8 z-10 pointer-events-auto">
        <button 
          onClick={handleCenter}
          className="w-14 h-14 bg-surface shadow-md rounded-xl text-primary flex items-center justify-center hover:bg-slate-50 transition-system active:scale-95 border border-border"
        >
          {loading ? <Loader2 size={24} className="animate-spin text-text-muted/30" /> : <LocateFixed size={24} />}
        </button>
      </div>

      {/* Details Sheet */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-28 left-8 right-8 z-20"
          >
            <div className="bg-surface rounded-xl p-8 shadow-xl border border-border overflow-hidden relative">
              <button 
                onClick={() => setSelectedPin(null)} 
                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-md flex items-center justify-center text-text-muted/40 hover:text-text-main transition-system border border-border/50"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-5 mb-8">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${user?.role === 'donor' ? 'bg-emerald-50 text-primary' : 'bg-amber-50 text-accent'}`}>
                  {user?.role === 'donor' ? <Building2 size={28} /> : <MapPin size={28} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main tracking-tight pr-10">{selectedPin.organisation_name || selectedPin.name || selectedPin.sourceName}</h3>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">
                    {selectedPin.role || selectedPin.type || 'Verified Source'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {selectedPin.foodName && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-border/50">
                    <p className="text-[8px] uppercase font-bold text-text-muted tracking-widest mb-1.5 pl-0.5">Available Supply</p>
                    <p className="text-sm font-bold text-text-main">{selectedPin.foodName || selectedPin.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-border/50 shadow-subtle">
                  <div className="flex items-center gap-4">
                    <div className="text-primary opacity-80">
                      <Phone size={20} />
                    </div>
                    <span className="text-sm font-bold text-text-main tracking-widest">{selectedPin.phone || '+91 00000 00000'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => navigator.clipboard.writeText(selectedPin.phone || '+910000000000')}
                      className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-main transition-system active:scale-95 bg-white border border-border rounded-md shadow-sm"
                      title="Copy phone number"
                    >
                      <Copy size={16} />
                    </button>
                    <a 
                      href={`tel:${selectedPin.phone || '+910000000000'}`} 
                      className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-md transition-system shadow-sm active:scale-95"
                      title="Call directly"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
