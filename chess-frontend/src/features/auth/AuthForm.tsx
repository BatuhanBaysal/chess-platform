import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent, type SyntheticEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Info, Loader2 } from 'lucide-react';
import FormField from '../../components/common/FormField';
import SignUpSuccessCard from './SignUpSuccessCard';

interface AuthFormProps {
  readonly onLogin: (username: string, password: string) => void | Promise<void>;
  readonly onRegister: (username: string, password: string, email: string) => Promise<void> | void;
  readonly onSuccessChange?: (isSuccess: boolean) => void;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    } | string;
  };
  message?: string;
}

export const AuthForm = ({ onLogin, onRegister, onSuccessChange }: Readonly<AuthFormProps>) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSignUp = location.pathname === '/sign-up' || location.pathname === '/register';

  const [registeredUsername, setRegisteredUsername] = useState<string>('');
  const [success, setSuccess] = useState(false); 
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null); 
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    onSuccessChange?.(success);
  }, [success, onSuccessChange]);

  useEffect(() => {
    if (success) return;

    const timer = setTimeout(() => {
      if (
        document.activeElement &&
        document.activeElement !== document.body &&
        document.activeElement.tagName === 'INPUT'
      ) {
        return;
      }

      if (!isSignUp && formDataRef.current.username.trim().length > 0) {
        passwordRef.current?.focus();
      } else {
        usernameRef.current?.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isSignUp, success]);

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '' });
    formDataRef.current = { username: '', email: '', password: '' };
    setErrors({ username: '', email: '', password: '' });
  };

  const handleToggleMode = () => {
    resetForm();
    if (isSignUp) {
      void navigate('/sign-in');
    } else {
      void navigate('/sign-up');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = (name === 'username' || name === 'email') 
      ? value.toLowerCase() 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateUsername = (): boolean => {
    const val = formData.username.trim();
    if (!val) {
      setErrors(prev => ({ 
        ...prev, 
        username: isSignUp ? 'Username is required' : 'Username or email is required' 
      }));
      return false;
    }
    if (isSignUp && (val.length < 3 || val.length > 20)) {
      setErrors(prev => ({ 
        ...prev, 
        username: 'Username must be between 3 and 20 characters' 
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, username: '' }));
    return true;
  };

  const validateEmail = (): boolean => {
    if (!isSignUp) return true;
    const val = formData.email.trim();
    if (!val) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(val)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (): boolean => {
    const val = formData.password;
    if (!val) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (isSignUp) {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z]).{8,}$/;
      if (!passwordRegex.test(val)) {
        setErrors(prev => ({ 
          ...prev, 
          password: 'Password must be at least 8 characters with letters and numbers' 
        }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const getPasswordStrength = () => {
    const val = formData.password;
    if (!val) return 0;
    
    let strengthCount = 0;
    if (val.length >= 8) strengthCount++;   
    if (/[a-z]/.test(val)) strengthCount++; 
    if (/[A-Z]/.test(val)) strengthCount++; 
    if (/\d/.test(val)) strengthCount++; 
    if (/[^A-Za-z0-9]/.test(val)) strengthCount++; 
    
    if (strengthCount <= 1) return 0; 
    if (strengthCount <= 2) return 1; 
    if (strengthCount <= 3) return 2; 
    return 3;            
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500'];

  const validateAll = () => {
    const isUValid = validateUsername();
    const isEValid = validateEmail();
    const isPValid = validatePassword();
    return isUValid && isEValid && isPValid;
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll() || isSubmitting) return;

    setErrors({ username: '', email: '', password: '' });
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const usernameSubmitted = formData.username;
        await onRegister(formData.username, formData.password, formData.email);
        setRegisteredUsername(usernameSubmitted);
        setSuccess(true);
        resetForm();
      } else {
        await onLogin(formData.username, formData.password);
      }
    } catch (err: unknown) {
      setFormData(prev => ({ ...prev, password: '' })); 
      
      const error = err as ApiErrorResponse;
      const errData = error.response?.data;
      const errorMessage = typeof errData === 'string' 
        ? errData 
        : (errData?.message || errData?.error || error.message || 'Authentication failed');
      const msgLower = errorMessage.toLowerCase();

      if (msgLower.includes('username')) {
        setErrors(prev => ({ ...prev, username: 'This username is already taken.' }));
      } else if (msgLower.includes('email')) {
        setErrors(prev => ({ ...prev, email: 'This email address is already in use.' }));
      } else {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <SignUpSuccessCard 
        username={registeredUsername} 
        onProceedToSignIn={() => {
          const prefillData = { username: registeredUsername, email: '', password: '' };
          formDataRef.current = prefillData;
          setFormData(prefillData);
          setSuccess(false);
          void navigate('/sign-in');
        }} 
      />
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="w-full flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
            {isSignUp ? 'SIGN UP' : 'SIGN IN'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium">
            {isSignUp 
              ? 'Create an account to start playing rated matches.' 
              : 'Welcome back. Sign in to access your profile.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5">
          <FormField 
            ref={usernameRef}
            name="username" 
            label={isSignUp ? "Username" : "Username or Email"} 
            type="text" 
            placeholder={isSignUp ? "batuchess" : "username or email"} 
            value={formData.username} 
            onChange={handleInputChange} 
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (validateUsername()) {
                  if (isSignUp) {
                    emailRef.current?.focus();
                  } else {
                    passwordRef.current?.focus();
                  }
                }
              }
            }} 
            error={errors.username} 
          />
          
          {isSignUp && (
            <FormField 
              ref={emailRef}
              name="email" 
              label="Email Address" 
              type="email" 
              placeholder="player@chessplatform.com" 
              value={formData.email} 
              onChange={handleInputChange} 
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (validateEmail()) {
                    passwordRef.current?.focus();
                  }
                }
              }} 
              error={errors.email} 
            />
          )}
          
          <div className="relative">
            <FormField 
              ref={passwordRef}
              name="password" 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleInputChange} 
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                setCapsLockOn(e.getModifierState("CapsLock"));
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSubmit(e as unknown as SyntheticEvent<HTMLFormElement>);
                }
              }} 
              error={errors.password} 
            />
            
            {capsLockOn && (
              <p className="text-[11px] text-amber-400 font-bold absolute right-0 -top-1">
                CAPS LOCK IS ON
              </p>
            )}

            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3.5 top-9.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {isSignUp && (
              <div className="mt-1.5 space-y-1">
                {formData.password ? (
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strengthColors[strength]}`} 
                      style={{ width: `${((strength + 1) / 4) * 100}%` }} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Info size={12} className="shrink-0 text-indigo-400" />
                    <span>Min 8 characters, including letters & numbers</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button with Loading State */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-3.5 mt-5 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin text-slate-900" />}
          <span>{isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
        </button>

        {/* Mode Switch */}
        <div className="text-center mt-5 sm:mt-6">
          <button 
            type="button" 
            onClick={handleToggleMode} 
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isSignUp ? (
              <>Already have an account? <span className="underline font-bold text-white ml-1">Sign In</span></>
            ) : (
              <>Don't have an account? <span className="underline font-bold text-white ml-1">Sign Up</span></>
            )}
          </button>
        </div>
      </div>

      {/* Footer Signature */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>CHESS PLATFORM</span>
        </div>
        <span>BATUHAN BAYSAL • 2026</span>
      </div>
    </form>
  );
};

export default AuthForm;
