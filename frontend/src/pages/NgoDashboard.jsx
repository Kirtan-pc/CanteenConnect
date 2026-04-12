import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Phone, MapPin, Check, X, Map } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function NgoDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([
    {
      id: 1,
      type: 'organic',
      sourceName: 'VESIT Main Canteen',
      sourceType: 'canteen',
      distance: '1.2 km away',
      timeAgo: 'Reported 20 min ago',
      weight: '4 kg',
      description: 'Onion peels, vegetable scraps',
      pickupTime: 'Pickup by 11:00 AM'
    },
    {
      id: 2,
      type: 'food',
      sourceName: 'Rahul Sharma',
      sourceType: 'donor',
      distance: '2.5 km away',
      timeAgo: 'Reported 45 min ago',
      foodName: 'Veg Biryani',
      preparedAgo: 'Prepared 2 hrs ago',
      quantity: '10 servings',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  const handleAccept = (id) => {
    setRequests(requests.filter(req => req.id !== id));
    alert('Accepted request! (Mock)');
  };

  const handleDecline = (id) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-6 pt-10 pb-12 rounded-b-3xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div>
            <h1 className="text-white/80 text-sm font-medium mb-1">NGO Dashboard</h1>
            <h2 className="text-2xl font-bold text-white mb-3">Incoming Requests</h2>
          </div>
          <div className="bg-[#D85A30] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {requests.length} New Requests
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        {/* Map Shortcut */}
        <button 
          onClick={() => navigate('/map')}
          className="w-full bg-white border border-gray-100 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-primary">
              <Map size={24} />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-[#1A1A1A]">View Activity Map</h4>
              <p className="text-xs text-gray-500">See reports active near you</p>
            </div>
          </div>
        </button>

        <h3 className="text-[#1A1A1A] font-semibold mb-4 text-lg">Pending pickups near you</h3>
        
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* Header section of Card */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${req.sourceType === 'canteen' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {req.sourceType === 'canteen' ? <Building2 size={20}/> : <User size={20}/>}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{req.sourceName}</h4>
                    <p className="text-xs text-gray-500">{req.distance} • {req.timeAgo}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded w-fit ${
                    req.type === 'organic' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#D85A30]/10 text-[#D85A30]'
                  }`}>
                    {req.type === 'organic' ? 'ORGANIC' : 'FOOD'}
                  </span>
                  <a href="tel:1234567890" className="p-1.5 bg-gray-50 text-primary border border-gray-100 rounded-full hover:bg-green-50 transition" title="Call Donor">
                    <Phone size={14} />
                  </a>
                </div>
              </div>

              {/* Detailed Info */}
              {req.type === 'organic' ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-100">⚖️ {req.weight}</div>
                  <div className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-100">📝 {req.description}</div>
                  <div className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-100">⏰ {req.pickupTime}</div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-gray-100">
                    <img src={req.imageUrl} alt="Food" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-100">🍲 {req.foodName}</div>
                    <div className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-100">⏳ {req.preparedAgo}</div>
                    <div className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-100">📦 {req.quantity}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button 
                  onClick={() => handleAccept(req.id)}
                  className="flex-1 bg-primary hover:bg-accent text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-xl transition-colors text-sm"
                >
                  <Check size={18} /> Accept
                </button>
                <button 
                  onClick={() => handleDecline(req.id)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold flex items-center justify-center gap-2 py-3 rounded-xl transition-colors text-sm"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No new requests at the moment.
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
