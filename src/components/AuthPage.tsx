import React, { useState, useRef } from 'react';
import { Mail, Lock, User, Target, Layers, ArrowRight, ArrowLeft, Upload, Loader2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformName, ExamType } from '../types';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
  apiCall: (endpoint: string, form: any) => Promise<any>;
  initialIsLogin?: boolean;
  onBackToLanding?: () => void;
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop', label: 'Classic Pro' },
  { id: '2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop', label: 'Active Indigo' },
  { id: '3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', label: 'Casual Emerald' },
  { id: '4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop', label: 'Academic Sage' },
  { id: '5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucky', label: 'Adventurer Teal' },
  { id: '6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sparky', label: 'Adventurer Amber' },
];

export default function AuthPage({ onAuthSuccess, apiCall, initialIsLogin = true, onBackToLanding }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  
  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2: Onboarding Details
  const [name, setName] = useState('');
  const [targetExam, setTargetExam] = useState<ExamType>('SSC CGL');
  const [primaryPlatform, setPrimaryPlatform] = useState<PlatformName>('F64 Academy');
  const [avatar, setAvatar] = useState<string>('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop'); // defaults to Classic Pro
  
  // Wizards state
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'info' | '', message: string }>({ type: '', message: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger registration or login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      setLoading(true);
      try {
        const data = await apiCall('/api/auth/login', { email, password });
        onAuthSuccess(data.token, data.user);
      } catch (err: any) {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      if (signupStep === 1) {
        // Validate credentials and go to onboarding step
        if (!email || !password) {
          setError('Please provide an email and password to proceed.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        setSignupStep(2);
      } else {
        // Step 2: Register user
        if (!name.trim()) {
          setError('Please enter your full name to complete onboarding.');
          return;
        }
        setLoading(true);
        try {
          const data = await apiCall('/api/auth/register', {
            email,
            password,
            name: name.trim(),
            targetExam,
            primaryPlatform,
            avatar
          });
          onAuthSuccess(data.token, data.user);
        } catch (err: any) {
          setError(err.message || 'Registration failed. Check details.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Handle upload of file to backend proxy targeting Cloudinary
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'Profile avatar image must be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => {
      setImageUploading(true);
      setUploadStatus({ type: '', message: '' });
    };

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 200; // Optimal profile circle dimension
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxDim) {
              height = Math.round(height * (maxDim / width));
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round(width * (maxDim / height));
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not establish Canvas 2D render contexts.');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);

          const res = await apiCall('/api/upload', { image: resizedBase64 });
          setAvatar(res.url);
          
          if (res.info?.includes('Cloudinary credentials missing') || res.info?.includes('fallback')) {
            setUploadStatus({
              type: 'info',
              message: 'Profile image loaded locally (configure Cloudinary keys in Settings for live cloud storage).'
            });
          } else {
            setUploadStatus({
              type: 'success',
              message: 'Successfully generated profile avatar on Cloudinary!'
            });
          }
        } catch (err: any) {
          console.error(err);
          setUploadStatus({
            type: 'error',
            message: err.message || 'Image conversion sequence crashed.'
          });
        } finally {
          setImageUploading(false);
        }
      };

      img.onerror = () => {
        setUploadStatus({ type: 'error', message: 'Selected binary file is corrupted or not a valid image format.' });
        setImageUploading(false);
      };
    };

    reader.onerror = () => {
      setUploadStatus({ type: 'error', message: 'Failed to read media source file.' });
      setImageUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Switch tabs
  const handleTabSwitch = (isToLogin: boolean) => {
    setIsLogin(isToLogin);
    setSignupStep(1);
    setError('');
    setUploadStatus({ type: '', message: '' });
  };

  // Demo user preset credentials for fast preview onboarding
  const handleQuickDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/api/auth/login', {
        email: 'prabhanshut67@gmail.com',
        password: 'f64academy'
      });
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Demo onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-8 relative overflow-hidden font-sans">
      
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card container */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl relative z-10 border border-slate-200 font-sans">
        
        {onBackToLanding && (
          <button
            id="auth-back-to-landing"
            onClick={onBackToLanding}
            className="absolute top-6 left-6 flex items-center gap-1 text-[11px] font-bold text-slate-405 text-slate-400 hover:text-blue-600 transition cursor-pointer"
          >
            <ArrowLeft size={12} /> Back to Home
          </button>
        )}

        {/* Upper Brand Branding */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-display font-extrabold text-white text-xl shadow-md mb-3 animate-bounce">
            F64
          </div>
          <h2 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">F64 Academy Tracker</h2>
          <p className="text-slate-500 text-xs mt-1 font-sans">Advanced Analytics, Real-time Leaderboards, & Smart Coaching Ecosystem</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
          <button
            id="tab-select-login"
            onClick={() => handleTabSwitch(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-select-register"
            onClick={() => handleTabSwitch(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              !isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dynamic Register
          </button>
        </div>

        {/* Action Error Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Primary Auth Wizard Container */}
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <AnimatePresence mode="wait">
            
            {/* SIGN IN view OR SIGNUP STEP 1 (Email / Password) */}
            {(isLogin || (!isLogin && signupStep === 1)) ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-150 mb-2">
                    <Sparkles size={13} className="text-blue-500 animate-spin" />
                    Step 1 of 2: Create Login Credentials
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Email Address</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500/50 rounded-xl px-3 py-2.5 transition">
                    <Mail size={16} className="text-slate-400 mr-2.5" />
                    <input
                      id="auth-input-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Password</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500/50 rounded-xl px-3 py-2.5 transition">
                    <Lock size={16} className="text-slate-400 mr-2.5" />
                    <input
                      id="auth-input-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <button
                  id="btn-auth-submit-step1"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold tracking-wide shadow-sm hover:shadow active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5"><Loader2 size={16} className="animate-spin" /> Authenticating...</span>
                  ) : isLogin ? (
                    'Sign In'
                  ) : (
                    'Next Step: Personalize Profile'
                  )}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </motion.div>
            ) : (
              
              /* SIGNUP STEP 2: ONBOARDING VIEW */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-150 mb-2">
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                    <Sparkles size={13} className="text-blue-500 animate-spin" />
                    Step 2 of 2: Profile Onboarding & Avatar
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSignupStep(1); setError(''); }}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>

                {/* Profile Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Full Name</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500/50 rounded-xl px-3 py-2.5 transition">
                    <User size={16} className="text-slate-400 mr-2.5" />
                    <input
                      id="reg-input-name"
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* Exams & Platform Selection Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-0.5">Target Exam</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
                      <Target size={14} className="text-blue-500 mr-1.5 flex-shrink-0" />
                      <select
                        id="reg-select-exam"
                        value={targetExam}
                        onChange={(e: any) => setTargetExam(e.target.value)}
                        className="bg-transparent text-xs text-slate-800 focus:outline-none w-full cursor-pointer"
                      >
                        <option value="SSC CGL">SSC CGL</option>
                        <option value="CHSL">CHSL</option>
                        <option value="MTS">MTS</option>
                        <option value="CPO">CPO</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-0.5">Main Platform</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
                      <Layers size={14} className="text-blue-500 mr-1.5 flex-shrink-0" />
                      <select
                        id="reg-select-platform"
                        value={primaryPlatform}
                        onChange={(e: any) => setPrimaryPlatform(e.target.value)}
                        className="bg-transparent text-xs text-slate-800 focus:outline-none w-full cursor-pointer"
                      >
                        <option value="F64 Academy">F64 Academy</option>
                        <option value="Oliveboard">Oliveboard</option>
                        <option value="Testbook">Testbook</option>
                        <option value="PracticeMock">PracticeMock</option>
                        <option value="RBE">RBE</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Profile Image Cloudinary Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Profile Photo Upload</label>
                  
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 transition hover:border-blue-400">
                    
                    {/* Circle Avatar Preview Area */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border-2 border-white shadow-md">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      {imageUploading && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <Loader2 size={16} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Trigger Actions */}
                    <div className="flex-1 text-center md:text-left space-y-1">
                      <p className="text-xs text-slate-700 font-semibold">Upload media to Cloudinary cloud storage</p>
                      <p className="text-[10px] text-slate-400">Supports PNG, JPG up to 5MB.</p>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={imageUploading}
                          className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-xs text-slate-600 font-semibold shadow-sm cursor-pointer hover:bg-slate-50 transition"
                        >
                          <Upload size={12} className="text-blue-500" />
                          Choose Image File
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cloudinary Upload Status Banner */}
                  {uploadStatus.message && (
                    <div className={`mt-2 p-2 rounded-lg text-[10px] text-center font-medium border ${
                      uploadStatus.type === 'success' ? 'bg-emerald-50 border-emerald-155 text-emerald-700' :
                      uploadStatus.type === 'error' ? 'bg-rose-50 border-rose-155 text-rose-700' :
                      'bg-sky-50 border-sky-155 text-sky-850 text-blue-800'
                    }`}>
                      {uploadStatus.message}
                    </div>
                  )}

                  {/* Preset Choice Segment */}
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Or choose a High-Quality Default Preset Portrait</p>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = avatar === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setAvatar(preset.url);
                              setUploadStatus({ type: 'success', message: `Selected default portrait preset: ${preset.label}` });
                            }}
                            className={`relative rounded-xl overflow-hidden aspect-square border-2 transition transform hover:scale-105 cursor-pointer ${
                              isSelected ? 'border-blue-600 scale-102 ring-2 ring-blue-400/20' : 'border-slate-200 hover:border-slate-400'
                            }`}
                            title={preset.label}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.label} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute right-0.5 bottom-0.5 bg-blue-600 rounded-full p-0.5 shadow-sm">
                                <Check size={8} className="text-white font-black" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    id="btn-auth-register-submit"
                    type="submit"
                    disabled={loading || imageUploading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold tracking-wide shadow-md active:scale-98 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5"><Loader2 size={16} className="animate-spin" /> Provisioning Account...</span>
                    ) : (
                      'Complete Dynamic Onboarding & Enroll'
                    )}
                    {!loading && <Check size={16} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {isLogin && (
          <>
            <div className="relative flex py-3 items-center mt-5">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-mono tracking-widest font-semibold">Quick Sandbox Presets</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Demo Fast Access Option */}
            <button
              id="btn-onboard-demo"
              onClick={handleQuickDemo}
              disabled={loading || imageUploading}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-blue-200 rounded-xl text-xs font-semibold tracking-wide hover:border-blue-300 transition active:scale-98 cursor-pointer"
            >
              Explore instantly with dynamic Demo credentials
            </button>

            <p className="text-center text-[10px] text-slate-400 mt-4 font-mono">
              On-track preset profile: prabhanshut67@gmail.com / f64academy
            </p>
          </>
        )}

      </div>
    </div>
  );
}
