import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ArrowLeft, Plus, Minus, Clock, Camera, AlertCircle, CheckCircle, Bug, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

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

export default function ReportFoodPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [foodName, setFoodName] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [quantity, setQuantity] = useState(2);
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [aiDecision, setAiDecision] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setPrepTime(`${hours}:${mins}`);
  }, []);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setPhotoPreview(URL.createObjectURL(file));
      setIsChecking(true);
      setAiDecision(null);

      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      setCompressedBlob(compressed);

      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result);
      reader.readAsDataURL(compressed);

      const formData = new FormData();
      formData.append('photo', compressed);

      const res = await fetch(`${API_BASE}/nyckel/check-image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      setIsChecking(false);
      if (data.success) {
        setAiDecision(data);
      } else {
        setAiDecision({ 
          safe: false, 
          message: "Standard quality analysis failed.", 
          confidence_percent: 0, 
          label: 'Inconclusive' 
        });
      }
    } catch (err) {
      setIsChecking(false);
      setAiDecision({ 
        safe: false, 
        message: "Network Error. AI service unreachable.", 
        confidence_percent: 0, 
        label: 'Offline' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aiDecision?.safe) return;
    
    setIsSubmitting(true);
    try {
      let userLocation = { lat: 19.0460, lng: 72.8910 };
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (geoErr) {
        console.warn("Location fallback used");
      }

      let imageUrl = null;

      const payload = {
        foodName,
        prepTime,
        quantity_servings: quantity,
        sourceName: user?.organisation_name || user?.name || 'Individual Donor',
        sourceType: 'donor',
        user_id: user?.uid || 'mock',
        imageUrl: imageUrl || base64Image || photoPreview,
        coordinates: userLocation
      };

      const res = await fetch(`${API_BASE}/reports/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSubmitted(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Network Error during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-primary rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-300">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-xl font-bold text-text-main mb-2">Report Submitted</h1>
        <p className="text-sm text-text-muted max-w-[240px]">Nearby organizations have been notified. Your listing is live for 3 hours.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-surface flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className="bg-surface px-8 pt-12 pb-8 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-text-muted hover:bg-slate-100 rounded-full transition-system active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Reports</p>
            <h1 className="text-xl font-bold text-text-main tracking-tight italic">Food Donation</h1>
          </div>
        </div>
        <div className="bg-amber-50 text-accent p-2.5 rounded-lg border border-accent/10">
          <Utensils size={20} />
        </div>
      </header>

      <motion.div 
        className="flex-1 px-8 py-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Main Inputs */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Dish details</label>
              <input
                type="text"
                className="w-full border border-border rounded-lg p-4 text-sm bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-system font-bold text-text-main placeholder:text-text-muted/40 shadow-subtle"
                placeholder="e.g. Vegetable Pulao"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Servings</label>
                <div className="flex items-center justify-between border border-border rounded-lg p-2 bg-slate-50 shadow-subtle">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-md hover:bg-white transition-system flex items-center justify-center text-text-muted active:scale-90"><Minus size={16} /></button>
                  <span className="font-bold text-text-main text-base">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-md hover:bg-white transition-system flex items-center justify-center text-text-muted active:scale-90"><Plus size={16} /></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Prepared at</label>
                <div className="flex items-center border border-border rounded-lg px-4 bg-slate-50 h-[58px] shadow-subtle focus-within:bg-white transition-system">
                    <Clock size={16} className="text-text-muted/40 mr-3" />
                    <input type="time" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full bg-transparent outline-none text-sm font-bold text-text-main" required />
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Safety Context */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Quality Assurance</label>
              {aiDecision?.debug && (
                <button type="button" onClick={() => setShowDebug(!showDebug)} className="text-text-muted/40 hover:text-text-main transition-system">
                  <Bug size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              {!photoPreview ? (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center text-text-muted hover:border-primary hover:bg-emerald-50/30 transition-system group"
                >
                   <Camera size={32} className="mb-3 text-text-muted/20 group-hover:text-primary transition-system" />
                   <p className="font-bold text-[10px] uppercase tracking-widest">Upload Food Photo</p>
                   <p className="text-[8px] mt-1 text-text-muted/40 uppercase tracking-tighter italic">Mandatory AI verification</p>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border shadow-md aspect-video">
                  <img src={photoPreview} alt="Safety Check" className="w-full h-full object-cover" />
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-text-main/20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    {isChecking ? (
                      <div className="bg-surface/95 px-6 py-4 rounded-lg flex items-center gap-3 shadow-xl">
                        <Loader2 size={18} className="animate-spin text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-main italic">Analyzing Integrity</span>
                      </div>
                    ) : aiDecision && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-6 py-4 rounded-lg flex flex-col items-center gap-1 shadow-xl border border-white/20
                        ${aiDecision.safe ? 'bg-primary' : 'bg-danger text-white'}`}
                      >
                        <div className="flex items-center gap-2 text-white">
                          {aiDecision.safe ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                          <span className="text-[10px] font-bold uppercase tracking-widest italic">{aiDecision.safe ? 'Verified Quality' : 'Integrity Issue'}</span>
                        </div>
                        <span className="text-[8px] font-bold text-white/70 uppercase tracking-tighter">Confidence: {aiDecision.confidence_percent}%</span>
                      </motion.div>
                    )}
                  </div>

                  {!isChecking && (
                    <button type="button" onClick={() => { setPhotoPreview(null); setBase64Image(null); setAiDecision(null); }} className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur text-text-main px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-surface transition-system border border-border">Retake</button>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoSelect} />
            </div>

            {/* AI Summary Card */}
            <AnimatePresence>
              {!isChecking && aiDecision && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className={`p-5 rounded-xl border border-transparent shadow-subtle flex flex-col gap-2 
                  ${aiDecision.safe ? 'bg-emerald-50/50 border-emerald-100 text-primary' : 'bg-red-50/50 border-red-100 text-danger'}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest italic">System Feedback</p>
                  <p className="text-xs font-bold leading-relaxed">{aiDecision.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {showDebug && aiDecision?.debug && (
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[9px] rounded-lg overflow-x-auto shadow-inner border border-slate-800">
                <pre>{JSON.stringify(aiDecision.debug, null, 2)}</pre>
              </div>
            )}
          </motion.div>

          {/* Submit Action */}
          <motion.div variants={itemVariants} className="pt-6 pb-12 text-center">
            <button
              type="submit"
              disabled={!aiDecision?.safe || isSubmitting}
              className={`w-full ${aiDecision?.safe ? 'bg-primary hover:bg-primary-dark' : 'bg-slate-100 text-text-muted cursor-not-allowed'} text-white font-bold py-5 rounded-xl transition-system shadow-md active:scale-[0.98] text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2`}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Register Report'}
            </button>
            <p className="text-[9px] text-text-muted/40 mt-5 font-bold uppercase tracking-widest leading-relaxed">
              Technical verification by AI is required for all public food listings.
            </p>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
