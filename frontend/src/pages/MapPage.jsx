import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, Navigation, Phone } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 pb-20 relative flex flex-col">
      {/* Map Header Floating Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/50 to-transparent flex items-start justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30">
          <ArrowLeft size={24} />
        </button>
        <div className="bg-white px-3 py-1.5 rounded-full shadow text-xs font-bold text-primary flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Live Activity
        </div>
      </div>

      {/* Map Placeholder Area (Simulating Google Maps) */}
      <div className="flex-1 bg-gray-200 relative flex items-center justify-center bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=13&size=600x800&scale=2&maptype=roadmap&style=feature:poi|visibility:off&client=gme-dummy')] bg-cover bg-center">
        {/* We would render actual <GoogleMap> here */}
        
        {/* Placeholder marker simulation */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute"></div>
          <div className="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white relative z-10" onClick={() => setSelectedMarker(true)}>
             <MapIcon size={16} />
          </div>
        </div>

        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setSelectedMarker(true)}>
          <div className="w-8 h-8 bg-[#D85A30] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
             <MapIcon size={16} />
          </div>
        </div>
      </div>

      {/* Selected Marker Details Sheet */}
      {selectedMarker && (
        <div className="absolute bottom-20 left-0 right-0 p-4 z-20">
          <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 flex flex-col gap-4 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-primary rounded mb-2 inline-block">COMPOSTER</span>
                <h3 className="text-lg font-bold text-[#1A1A1A]">GreenEarth Composting</h3>
                <p className="text-sm text-gray-500">2.1 km away • Open now</p>
              </div>
              <button onClick={() => setSelectedMarker(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="flex gap-3 mt-2">
              <a 
                href="tel:1234567890" 
                className="flex-1 bg-primary hover:bg-accent text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition"
              >
                <Phone size={18} /> Call
              </a>
              <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition">
                <Navigation size={18} /> Navigate
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
