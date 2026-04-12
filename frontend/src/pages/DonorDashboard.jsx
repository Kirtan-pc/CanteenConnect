import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Utensils, TrendingUp, Map } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock data for UI without backend
  const orgName = user?.organisation_name || 'VESIT Canteen';
  const stats = {
    kgReported: 145,
    pickups: 12,
    activeNGOs: 5
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-[#6B7280] text-sm font-medium mb-1">Good morning,</h1>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{orgName}</h2>
      </div>

      <div className="px-6 space-y-6">
        {/* Main Reporting Card */}
        <div className="bg-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none"></div>
          
          <p className="text-white/80 text-sm font-medium mb-1">Today's Waste Report</p>
          <h3 className="text-2xl font-bold mb-6">What are you reporting?</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/report/organic')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 text-left transition-all border border-white/20"
            >
              <div className="bg-[#1D9E75] w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <Leaf size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-white mb-1">Organic<br/>Waste</h4>
              <p className="text-xs text-white/70">Peels, scraps, etc.</p>
            </button>

            <button 
              onClick={() => navigate('/report/food')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 text-left transition-all border border-white/20"
            >
              <div className="bg-[#D85A30] w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <Utensils size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-white mb-1">Cooked<br/>Food</h4>
              <p className="text-xs text-white/70">Leftover meals</p>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-2xl font-bold text-primary mb-1">{stats.kgReported}</p>
            <p className="text-[10px] text-gray-500 font-medium">Kg Reported<br/>This Month</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-2xl font-bold text-primary mb-1">{stats.pickups}</p>
            <p className="text-[10px] text-gray-500 font-medium">Pickups<br/>Done</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <p className="text-2xl font-bold text-primary mb-1">{stats.activeNGOs}</p>
            <p className="text-[10px] text-gray-500 font-medium">Active NGOs<br/>Nearby</p>
          </div>
        </div>

        {/* Map Shortcut */}
        <button 
          onClick={() => navigate('/map')}
          className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-primary">
              <Map size={24} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-[#1A1A1A]">View Activity Map</h4>
              <p className="text-xs text-gray-500">See registered NGOs nearby</p>
            </div>
          </div>
        </button>

        {/* Impact Tracker Context Banner */}
        <button 
          onClick={() => navigate('/impact')}
          className="w-full bg-[#1A1A1A] rounded-2xl p-5 flex items-center justify-between shadow-md active:scale-95 transition-transform group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-full text-accent group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white">View Impact Tracker</h4>
              <p className="text-xs text-gray-400">Track your carbon savings</p>
            </div>
          </div>
        </button>

      </div>

      <BottomNav />
    </div>
  );
}
