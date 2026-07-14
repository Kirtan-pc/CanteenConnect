import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, Lock, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [passcodeArray, setPasscodeArray] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const isRegister = location.pathname === '/register';

  // Step 1: validate phone and go to passcode entry
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setStep(2);
    // Auto-focus first passcode box
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  // Step 2: verify passcode against demo credentials
  const handleVerifyPasscode = async (e) => {
    e.preventDefault();
    if (passcode.length !== 4) return;

    setLoading(true);
    setError('');

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 400));

    const result = login(phone, passcode);

    if (result.success) {
      const dest = (result.role === 'ngo' || result.role === 'composter') ? '/ngo-dashboard' : '/dashboard';
      navigate(dest);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handlePasscodeChange = (index, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newArr = [...passcodeArray];
    newArr[index] = val;
    setPasscodeArray(newArr);
    setPasscode(newArr.join(''));

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasscodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !passcodeArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-surface flex flex-col px-8"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="pt-8 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-primary hover:bg-slate-100 rounded-full transition-system active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-sm mx-auto flex flex-col pt-4">
        <h1 className="text-xl font-bold text-text-main mb-2 tracking-tight">
          {isRegister ? 'Create profile' : 'Sign in'}
        </h1>
        <p className="text-sm text-text-muted mb-10">
          {step === 1 ? 'Enter your demo mobile number' : `Enter the 4-digit passcode for +91 ${phone}`}
        </p>

        {/* Demo hint banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3"
        >
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Demo Credentials</p>
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="font-bold text-text-main">Donor:</span> 9999999999 &nbsp;|&nbsp;
              <span className="font-bold text-text-main">NGO:</span> 8888888888<br />
              Passcode: <span className="font-bold text-text-main">1234</span>
            </p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-danger uppercase tracking-wide"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="phone-step"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleSendOtp}
              className="flex flex-col gap-8"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Mobile Number</label>
                <div className="flex items-center border border-border rounded-lg px-4 py-3.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-system bg-slate-50">
                  <Phone size={18} className="text-text-muted mr-3" />
                  <span className="text-text-main mr-2 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="00000 00000"
                    className="w-full outline-none text-text-main font-bold text-sm bg-transparent placeholder:text-text-muted/40"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length !== 10}
                className="w-full bg-primary disabled:bg-slate-200 disabled:text-text-muted hover:bg-primary-dark text-white font-bold py-4 rounded-lg shadow-sm transition-system active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Continue
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="passcode-step"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleVerifyPasscode}
              className="flex flex-col gap-10"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Lock size={12} /> Demo Passcode
                </label>
                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-14 h-16 text-center text-xl font-bold border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-system bg-slate-50 text-text-main"
                      value={passcodeArray[index]}
                      onChange={(e) => handlePasscodeChange(index, e.target.value)}
                      onKeyDown={(e) => handlePasscodeKeyDown(index, e)}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={passcode.length !== 4 || loading}
                  className="w-full bg-primary disabled:bg-slate-200 disabled:text-text-muted hover:bg-primary-dark text-white font-bold py-4 rounded-lg shadow-sm transition-system active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                </button>
                <p
                  className="text-center text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:opacity-70 transition-system"
                  onClick={() => { setStep(1); setPasscode(''); setPasscodeArray(['', '', '', '']); setError(''); }}
                >
                  Edit number
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
