import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  
  const isRegister = location.pathname === '/register';
  const role = localStorage.getItem('selectedRole') || 'donor';

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      setStep(2); // Mock sending OTP
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      // Mock successful auth
      const mockUser = {
        uid: 'user123',
        phone: '+91' + phone,
        role: role,
        name: isRegister ? 'New User' : 'Existing User',
        organisation_name: 'Test Org'
      };
      setUser(mockUser);
      
      if (role === 'ngo') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1); // in case they paste, just take last char for simplicity, or handle paste
    const newOtp = [...otpArray];
    newOtp[index] = val;
    setOtpArray(newOtp);
    setOtp(newOtp.join(''));

    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      // Focus previous input
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="pt-4 pb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-sm mx-auto flex flex-col pt-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          {isRegister ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-[#6B7280] mb-8">
          {step === 1 ? 'Enter your mobile number to continue' : `Enter the 6-digit code sent to +91 ${phone}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Phone size={20} className="text-gray-400 mr-3" />
              <span className="text-gray-500 mr-2 font-medium">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full outline-none text-[#1A1A1A] text-lg bg-transparent"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={phone.length !== 10}
              className="w-full bg-primary disabled:bg-gray-300 hover:bg-accent text-white font-semibold py-4 rounded-xl transition-all"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
             <div className="flex justify-between gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={otpArray[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
            <button 
              type="submit"
              disabled={otp.length !== 6}
              className="w-full bg-primary disabled:bg-gray-300 hover:bg-accent text-white font-semibold py-4 rounded-xl transition-all"
            >
              Verify & Proceed
            </button>
            <p className="text-center text-sm text-primary font-semibold mt-4 cursor-pointer" onClick={() => setStep(1)}>
              Change Mobile Number
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
