import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Edit3, Save, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || 'VESIT Administrator',
    orgName: user?.organisation_name || 'VESIT Main Canteen',
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('selectedRole');
    navigate('/');
  };

  const handleSave = () => {
    setUser({
      ...user,
      name: editForm.name,
      organisation_name: editForm.orgName
    });
    setIsEditing(false);
  };

  const roleLabel = localStorage.getItem('selectedRole') === 'ngo' ? 'NGO / Composter' : 'Canteen / Donor';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary px-6 pt-12 pb-24 text-white relative rounded-b-3xl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-b-3xl pointer-events-none">
           <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        <h1 className="text-2xl font-bold relative z-10 text-center">My Profile</h1>
      </div>

      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 rounded-full border-4 border-white shadow flex items-center justify-center text-primary -mt-16 mb-4">
            <User size={40} />
          </div>

          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">{editForm.orgName}</h2>
              <p className="text-gray-500 font-medium mb-1">{editForm.name}</p>
              <div className="bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-1 rounded-full text-xs font-bold mb-6">
                {roleLabel.toUpperCase()}
              </div>

              <div className="w-full space-y-4 mb-8">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                   <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><Phone size={18}/></div>
                   <div>
                     <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                     <p className="text-sm font-semibold text-[#1A1A1A]">{user?.phone || '+91 9876543210'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                   <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><MapPin size={18}/></div>
                   <div>
                     <p className="text-xs text-gray-400 font-medium">Location</p>
                     <p className="text-sm font-semibold text-[#1A1A1A] truncate max-w-[200px]">Chembur, Mumbai</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="w-full border border-gray-200 text-gray-700 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl mb-3 hover:bg-gray-50 transition"
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            </>
          ) : (
            <div className="w-full space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">Organisation Name</label>
                <input 
                  type="text" 
                  value={editForm.orgName} 
                  onChange={e => setEditForm({...editForm, orgName: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">Contact Person Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-primary transition"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-gray-600 font-bold border rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-accent flex justify-center items-center gap-2"><Save size={18}/> Save</button>
              </div>
            </div>
          )}

          {!isEditing && (
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
