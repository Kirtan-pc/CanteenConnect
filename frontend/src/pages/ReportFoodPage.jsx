import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ArrowLeft, Plus, Minus, Clock, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportFoodPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [foodName, setFoodName] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [quantity, setQuantity] = useState(2);
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSpoiled, setIsSpoiled] = useState(null); // null = not checked, true = spoiled, false = fresh
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const fileInputRef = useRef(null);

  // Set default prep time to current time
  React.useEffect(() => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setPrepTime(`${hours}:${mins}`);
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);

    // Mock Nyckel AI check
    setIsChecking(true);
    setIsSpoiled(null);
    
    setTimeout(() => {
      setIsChecking(false);
      // Randomly mock fresh or spoiled for demo
      // In real life this calls backend -> Nyckel API
      const randomSpoiled = Math.random() > 0.7; // 30% chance of spoiled
      setIsSpoiled(randomSpoiled);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSpoiled) return; // Block
    
    // In real app, upload to storage, then POST backend
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-primary">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Donation submitted!</h1>
        <p className="text-gray-600">Listing will expire in 3 hours. Nearby NGOs notified.</p>
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
          <div className="inline-flex items-center gap-1.5 bg-[#D85A30] px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm border border-white/10">
            <Utensils size={14} /> COOKED FOOD
          </div>
          <h1 className="text-2xl font-bold mb-1">Food donation details</h1>
          <p className="text-white/70 text-sm">Listing expires 3 hours after prep time</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 border-t border-gray-100 rounded-t-3xl -mt-4 bg-white relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Food Name</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Dal rice, Veg biryani..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Quantity (Servings)</label>
              <div className="flex items-center justify-between border border-gray-200 rounded-xl p-2 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border-transparent"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-[#1A1A1A] text-lg">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Prep Time */}
            <div>
               <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Time Prepared</label>
               <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 h-[60px] bg-gray-50">
                  <Clock size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input 
                    type="time" 
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full bg-transparent outline-none font-medium text-[#1A1A1A]"
                    required
                  />
               </div>
            </div>
          </div>

          {/* Photo Upload & AI Check */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2 border-b border-gray-200 pb-2">Food Safety Verification</label>
            
            {!photoPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:bg-green-50 transition-all cursor-pointer"
              >
                 <Camera size={32} className="mb-2 text-gray-400" />
                 <p className="font-medium">Take a photo of the food</p>
                 <p className="text-xs mt-1">Required for AI freshness check</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                <img src={photoPreview} alt="Food Upload" className="w-full h-48 object-cover" />
                
                {/* Overlay status */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                  {isChecking && (
                    <div className="bg-white/90 p-4 rounded-xl flex items-center gap-3 shadow-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="font-medium text-[#1A1A1A] text-sm">Nyckel AI scanning...</span>
                    </div>
                  )}
                  {isSpoiled === false && (
                    <div className="bg-white/95 p-4 rounded-xl flex items-center gap-2 shadow-lg text-[#1D9E75]">
                      <CheckCircle size={20} />
                      <span className="font-bold text-sm">Food looks fresh!</span>
                    </div>
                  )}
                </div>
                
                {/* Reset button */}
                {!isChecking && (
                  <button 
                    type="button"
                    onClick={() => { setPhotoPreview(null); setIsSpoiled(null); }}
                    className="absolute top-2 right-2 bg-white/50 backdrop-blur text-black p-2 rounded-full hover:bg-white text-xs"
                  >
                    Retake
                  </button>
                )}
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoSelect}
            />

            {/* Warning Message */}
            {isSpoiled === true && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">This food may not be safe to donate. Our AI detected signs of spoilage. Please check before submitting.</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-8">
            <button
              type="submit"
              disabled={!photoPreview || isChecking || isSpoiled === true}
              className="w-full bg-primary disabled:bg-gray-300 disabled:active:scale-100 hover:bg-accent text-white font-semibold py-4 rounded-xl transition-all shadow-md active:scale-95 text-lg"
            >
              Requirements Met? Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
