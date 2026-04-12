import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Building2, ArrowLeft } from 'lucide-react';

export default function SelectRolePage() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    // In a real app we might put this in context or local storage 
    // before directing to register
    localStorage.setItem('selectedRole', role);
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="pt-4 pb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto flex flex-col">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Choose your role</h1>
        <p className="text-[#6B7280] mb-8">How do you want to use CanteenConnect?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Canteen / Donor Card */}
          <button 
            onClick={() => handleSelectRole('donor')}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary hover:bg-green-50 transition-all text-left group"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 text-organic flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Leaf size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 text-center">Canteen / Donor</h2>
            <p className="text-[#6B7280] text-center text-sm">Report organic waste or donate food</p>
          </button>

          {/* NGO / Organisation Card */}
          <button 
            onClick={() => handleSelectRole('ngo')}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary hover:bg-green-50 transition-all text-left group"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 text-center">NGO / Organisation</h2>
            <p className="text-[#6B7280] text-center text-sm">Accept pickups and collect waste</p>
          </button>
        </div>
      </div>
    </div>
  );
}
