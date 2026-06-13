import React, { useState, useEffect, useRef } from 'react';
import FormField from '../../components/common/FormField';

interface AuthFormProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string, email: string) => Promise<void> | void;
  onGuestLogin: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, onGuestLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false); 

  const usernameRef = useRef<HTMLInputElement>(null); 

  useEffect(() => {
    usernameRef.current?.focus();
  }, [isRegistering]);

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '' });
    setErrors({ username: '', email: '', password: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = (name === 'username' || name === 'email') 
      ? value.toLowerCase() 
      : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const getPasswordStrength = () => {
    const val = formData.password;
    if (!val) return 0;
    
    let strength = 0;
    if (val.length >= 8) strength++;   
    if (/[a-z]/.test(val)) strength++; 
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++; 
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    
    if (strength <= 1) return 0; 
    if (strength <= 2) return 1; 
    if (strength <= 3) return 2; 
    return 3;                   
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  const validate = () => {
    let isValid = true;
    const newErrors = { username: '', email: '', password: '' };

    if (!formData.username) { 
      newErrors.username = isRegistering ? 'Username is required' : 'Username or Email is required'; 
      isValid = false; 
    }
    if (isRegistering && !formData.email.includes('@')) { 
      newErrors.email = 'Valid email is required'; 
      isValid = false; 
    }
    if (!formData.password) { newErrors.password = 'Password is required'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({ username: '', email: '', password: '' });

    try {
      if (isRegistering) {
        await onRegister(formData.username, formData.password, formData.email);
        setSuccess(true);
        resetForm();
      } else {
        await onLogin(formData.username, formData.password);
      }
    } catch (error: any) {
      setFormData(prev => ({ ...prev, password: '' })); 
      const errData = error.response?.data;
      const errorMessage = typeof errData === 'string' ? errData : (errData?.message || errData?.error || error.message || "Authentication failed");
      const msgLower = errorMessage.toLowerCase();

      if (msgLower.includes("username")) {
        setErrors(prev => ({ ...prev, username: "This username is already taken." }));
      } else if (msgLower.includes("email")) {
        setErrors(prev => ({ ...prev, email: "This email address is already in use." }));
      } else {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      {success ? (
        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl text-center flex flex-col items-center max-w-sm">
          <h3 className="text-emerald-500 font-black uppercase tracking-[0.2em] mb-4">Welcome to the Board!</h3>
          <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
            Your account <span className="text-white font-bold">{formData.username}</span> has been successfully created. 
            You are starting your chess journey with an initial Elo rating of <span className="text-emerald-500 font-bold"> 1200</span>.
          </p>
          <button type="button" onClick={() => { setSuccess(false); setIsRegistering(false); }} className="w-full px-8 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all active:scale-95">
            Sign In & Play
          </button>
        </div>
      ) : (
        <>
          <FormField 
            ref={usernameRef}
            name="username" 
            label={isRegistering ? "Username" : "Username or Email"} 
            type="text" 
            placeholder={isRegistering ? "Enter your username" : "Enter username or email"} 
            value={formData.username} 
            onChange={handleInputChange} 
            error={errors.username} 
          />
          
          {isRegistering && (
            <FormField 
              name="email" 
              label="Email Address" 
              type="email" 
              placeholder="name@chessplatform.com" 
              value={formData.email} 
              onChange={handleInputChange} 
              error={errors.email} 
            />
          )}
          
          <div className="relative">
            <FormField 
              name="password" 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleInputChange} 
              onKeyDown={(e: any) => setCapsLockOn(e.getModifierState("CapsLock"))}
              error={errors.password} 
            />
            {capsLockOn && <p className="text-[10px] text-amber-500 font-bold absolute right-0 -top-1">CAPS LOCK IS ON</p>}
            
            {isRegistering && formData.password && (
              <div className="w-full h-1 mt-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${strengthColors[strength]}`} 
                  style={{ width: `${((strength + 1) / 4) * 100}%` }} 
                />
              </div>
            )}

            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          <button type="submit" className="w-full py-4 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity">
            {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="shrink-0 mx-4 text-[10px] text-slate-400 font-bold uppercase">OR</span>
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <button type="button" onClick={onGuestLogin} className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-500 transition-all">
            Play as Guest
          </button>

          <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Why register?</span>
              Registered players start with a <span className="font-bold text-emerald-600 dark:text-emerald-500 mx-1">1200 ELO</span> rating. 
              Guest accounts start at <span className="font-bold text-slate-900 dark:text-white mx-1">400 ELO</span> and have 
              <span className="text-amber-600 dark:text-amber-500 font-bold ml-1">limited access</span> duration.
            </p>
          </div>

          <div className="text-center mt-2">
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); resetForm(); }} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              {isRegistering ? <>Already have an account? <span className="underline">Sign In</span></> : <>Don't have an account? <span className="underline">Register Now</span></>}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default AuthForm;
