import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Award, ShieldCheck, Leaf, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';

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

export default function ImpactPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [impact, setImpact] = useState({ kg_diverted: 0, pickups_count: 0, co2_saved: 0 });
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [impactRes, histRes] = await Promise.all([
          fetch(`${API_BASE}/impact/${user?.uid || 'mock'}`),
          fetch(`${API_BASE}/impact/historical/${user?.uid || 'mock'}`)
        ]);
        
        const iData = await impactRes.json();
        const hData = await histRes.json();
        
        if (iData.success) setImpact(iData.impact);
        if (hData.success) setHistoricalData(hData.data);
      } catch (err) {
        console.error('Impact fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const orgName = user?.organisation_name || 'VESIT Canteen';
    const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    doc.setDrawColor(21, 128, 61); //Emerald-700
    doc.setLineWidth(5);
    doc.rect(5, 5, 287, 200);
    doc.setLineWidth(1);
    doc.rect(10, 10, 277, 190);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(21, 128, 61);
    doc.text('CANTEEN CONNECT', 148.5, 45, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(100);
    doc.text('SUSTAINABILITY CONTRIBUTION CERTIFICATE', 148.5, 60, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('This certificate is formally presented to', 148.5, 90, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(orgName.toUpperCase(), 148.5, 105, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`For verified environmental redirection in ${date}, successfully diverting`, 148.5, 125, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(`${impact.kg_diverted} KG OF ORGANIC WASTE`, 148.5, 140, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`Preventing approximately ${impact.co2_saved} kg of CO2 equivalent emissions.`, 148.5, 155, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Clean Earth Initiative - Official Record', 148.5, 180, { align: 'center' });
    
    doc.save(`CanteenConnect_Certificate_${date.replace(' ', '_')}.pdf`);
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="bg-surface px-8 pt-12 pb-10 sticky top-0 z-50">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-text-muted hover:bg-slate-100 rounded-full transition-system active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Performance</p>
            <h1 className="text-xl font-bold text-text-main tracking-tight italic">Impact Metrics</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-50 text-primary rounded-lg flex items-center justify-center border border-primary/10">
            <Award size={24} />
          </div>
          <div>
             <p className="text-xs font-bold text-text-main uppercase tracking-tight">Authenticated Record</p>
             <p className="text-[10px] text-text-muted font-medium mt-0.5">Tracking since join date</p>
          </div>
        </div>
      </header>

      <motion.div 
        className="px-8 mt-10 space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="bg-surface rounded-xl p-6 shadow-subtle border border-border flex flex-col items-center justify-center text-center">
             <div className="bg-slate-50 p-2.5 rounded-lg text-text-muted mb-4 border border-border/50">
                <Leaf size={18} />
             </div>
             <p className="text-xl font-bold text-text-main tracking-tighter">{loading ? '...' : impact.kg_diverted}</p>
             <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1.5">Kg Diverted</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-surface rounded-xl p-6 shadow-subtle border border-border flex flex-col items-center justify-center text-center">
             <div className="bg-slate-50 p-2.5 rounded-lg text-text-muted mb-4 border border-border/50">
                <ShieldCheck size={18} />
             </div>
             <p className="text-xl font-bold text-text-main tracking-tighter">{loading ? '...' : impact.pickups_count}</p>
             <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1.5">Collections</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-surface rounded-xl p-6 shadow-subtle border border-border flex flex-col items-center justify-center text-center col-span-2">
             <div className="flex items-center gap-6 w-full">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-text-muted border border-border/50">
                   <TrendingUp size={22} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-xl font-bold text-text-main tracking-tighter">{loading ? '...' : impact.co2_saved} <span className="text-[10px] font-bold text-text-muted uppercase ml-1">kg</span></p>
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5">CO2 Offset Equivalent</p>
                </div>
             </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-surface rounded-xl p-8 shadow-subtle border border-border">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Redirection Trends</h3>
             <span className="text-[8px] font-bold bg-emerald-50 text-primary px-3 py-1 rounded-full border border-primary/10 uppercase tracking-widest">Active growth</span>
          </div>
          
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '8px' }}
                />
                <Bar dataKey="kg" radius={[4, 4, 0, 0]} barSize={24}>
                  {historicalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === historicalData.length - 1 ? 'var(--color-primary)' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pb-12">
           <button 
             onClick={generateCertificate}
             className="w-full bg-text-main hover:bg-slate-800 text-white p-6 rounded-xl flex items-center justify-between shadow-md transition-system active:scale-[0.98]"
           >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1">Documentation</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verify Redirected Totals</p>
              </div>
              <Download size={20} className="text-primary" />
           </button>
           <p className="text-center text-[8px] text-text-muted font-bold uppercase tracking-widest mt-6 opacity-40">System Record #CC-IMP-001</p>
        </motion.div>
      </motion.div>

      <BottomNav />
    </motion.div>
  );
}
