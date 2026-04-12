import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-6">
      <div className="flex-1 flex flex-col justify-center items-center text-center w-full max-w-md">
        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Leaf size={48} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-3">
          CanteenConnect
        </h1>
        
        <p className="text-xl text-[#6B7280] mb-10 font-medium">
          Connecting waste to purpose.
        </p>

        <button 
          onClick={() => navigate('/select-role')}
          className="w-full bg-primary hover:bg-accent text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-all active:scale-95 text-lg"
        >
          Get Started
        </button>
      </div>

      <div className="pb-6 w-full text-center">
        <p className="text-[#6B7280]">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
