import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, Plus, Minus, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QUICK_TAGS = ["Onion peels", "Fruit scraps", "Vegetable peels", "Egg shells", "Tea leaves", "Coconut husk"];

export default function ReportOrganicPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgName = user?.organisation_name || 'VESIT Canteen';

  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(1);
  const [pickupWindow, setPickupWindow] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set default time to +1 hour on mount
  React.useEffect(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setPickupWindow(`${hours}:${mins}`);
  }, []);

  const handleAddTag = (tag) => {
    setDescription(prev => {
      const parts = prev.split(',').map(s => s.trim()).filter(Boolean);
      if (!parts.includes(tag)) {
        return parts.length > 0 ? `${prev}, ${tag}` : tag;
      }
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, POST to /api/reports/organic
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-primary">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Report submitted!</h1>
        <p className="text-gray-600">NGOs within a 5km radius have been notified.</p>
        <p className="text-sm text-gray-500 mt-8">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-8 text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 text-white/80 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 bg-[#1D9E75] px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm border border-white/10">
            <Leaf size={14} /> ORGANIC WASTE
          </div>
          <h1 className="text-2xl font-bold mb-1">Describe your waste</h1>
          <p className="text-white/70 text-sm">Canteen staff • {orgName}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 border-t border-gray-100 rounded-t-3xl -mt-4 bg-white relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Waste Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              rows="3"
              placeholder="e.g. onion peels, fruit waste, egg shells..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>

            {/* Quick Tags Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 mt-3 no-scrollbar -mx-6 px-6">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="whitespace-nowrap bg-[#F4FAF6] border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-medium hover:bg-primary hover:text-white transition-colors flex-shrink-0"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Stepper */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Estimated Weight (kg)</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setWeight(Math.max(1, weight - 1))}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                <Minus size={20} />
              </button>
              <div className="flex-1 text-center text-2xl font-bold text-[#1A1A1A]">
                {weight} <span className="text-sm font-medium text-gray-500">kg</span>
              </div>
              <button
                type="button"
                onClick={() => setWeight(weight + 1)}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Pickup Window */}
          <div>
             <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Pickup By</label>
             <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:bg-white focus-within:border-primary transition-all">
                <Clock size={20} className="text-gray-400 mr-3" />
                <input 
                  type="time" 
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  className="w-full bg-transparent outline-none font-medium text-[#1A1A1A]"
                  required
                />
             </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-white font-semibold py-4 rounded-xl transition-all shadow-md active:scale-95 text-lg"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
