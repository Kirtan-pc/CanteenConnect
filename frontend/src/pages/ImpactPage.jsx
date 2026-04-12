import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Award } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const MOCK_DATA = [
  { name: 'Oct', kg: 120 },
  { name: 'Nov', kg: 150 },
  { name: 'Dec', kg: 110 },
  { name: 'Jan', kg: 180 },
  { name: 'Feb', kg: 145 },
  { name: 'Mar', kg: 210 },
];

export default function ImpactPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgName = user?.organisation_name || 'VESIT Canteen';

  const stats = {
    divertedMonth: 210,
    pickups: 24,
    co2: 105, // 210 * 0.5
    ngoPartners: 4
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Simple PDF Generation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(29, 106, 71); // Primary color
    doc.text("Sustainability Contribution Certificate", 105, 30, null, null, "center");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("This certificate represents the environmental impact of", 105, 50, null, null, "center");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(orgName, 105, 65, null, null, "center");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Total Organic Waste Diverted this month:", 105, 90, null, null, "center");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(24, 158, 117); // Green variant
    doc.text(`${stats.divertedMonth} kg`, 105, 105, null, null, "center");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`CO₂ Equivalent Saved: ${stats.co2} kg`, 105, 125, null, null, "center");
    doc.text(`Completed Pickups: ${stats.pickups}`, 105, 135, null, null, "center");

    const dateStr = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated continuously by CanteenConnect on ${dateStr}`, 105, 270, null, null, "center");

    doc.save("CanteenConnect_Impact_Certificate.pdf");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12 pb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#1A1A1A]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold ml-2">Your Impact</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Large Stat */}
        <div className="bg-primary rounded-3xl p-6 text-white text-center shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="bg-white/20 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 text-white">
            <Award size={24} />
          </div>
          <h2 className="text-4xl font-extrabold mb-1">{stats.divertedMonth} <span className="text-xl font-normal opacity-80">kg</span></h2>
          <p className="text-sm font-medium opacity-90">Total Waste Diverted (This Month)</p>
        </div>

        {/* Small Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-[#D85A30] mb-1">{stats.co2}</p>
            <p className="text-xs text-gray-500 font-medium">kg CO₂ Saved</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-[#1D9E75] mb-1">{stats.pickups}</p>
            <p className="text-xs text-gray-500 font-medium">Total Pickups</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#1A1A1A] font-bold mb-4">6-Month Trend (kg)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="kg" radius={[4, 4, 0, 0]}>
                  {MOCK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === MOCK_DATA.length - 1 ? '#1D6A47' : '#9CA3AF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Download Button */}
        <button 
          onClick={handleDownload}
          className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-4 px-6 rounded-xl shadow-md active:scale-95 transition-all flex justify-center items-center gap-3"
        >
          <Download size={20} />
          Download Monthly Certificate
        </button>
      </div>
      
      <BottomNav />
    </div>
  );
}
