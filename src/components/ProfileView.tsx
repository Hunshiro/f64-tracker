import React, { useState } from 'react';
import { User, Shield, Target, BookOpen, Layers, Award, Save } from 'lucide-react';
import { UserProfile, ExamType, PlatformName } from '../types';
import { api } from '../services/api';

interface ProfileViewProps {
  user: UserProfile;
  achievements: Array<{ id: string; title: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string }>;
  onUpdateProfile: (updates: any) => Promise<void>;
}

export default function ProfileView({ user, achievements, onUpdateProfile }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [targetExam, setTargetExam] = useState<ExamType>(user.targetExam);
  const [primaryPlatform, setPrimaryPlatform] = useState<PlatformName>(user.primaryPlatform);
  const [dailyGoal, setDailyGoal] = useState(user.dailyStudyGoal);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Custom upload states
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  const avatarsList = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aniket',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Anya',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Prabhanshu',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || avatarsList[3]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await onUpdateProfile({
        name,
        targetExam,
        primaryPlatform,
        dailyStudyGoal: Number(dailyGoal),
        avatar: selectedAvatar
      });
      setSuccessMsg('Profile configurations successfully committed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Problems occurred whilst updating settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.updatePassword({ currentPassword, newPassword });
      setPassSuccessMsg(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadStatus({ type: 'error', message: 'The selected file is not an image.' });
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
          const maxDim = 200; // Optimal profile picture dimensions
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
            throw new Error('Could not establish Canvas 2D render context.');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);

          const res = await api.uploadImage(resizedBase64);
          setSelectedAvatar(res.url);
          
          if (res.info?.includes('Cloudinary credentials missing') || res.info?.includes('fallback')) {
            setUploadStatus({
              type: 'info',
              message: 'Profile image loaded locally (Cloudinary configuration needed for live cloud hosting).'
            });
          } else {
            setUploadStatus({
              type: 'success',
              message: 'Successfully generated custom live profile avatar!'
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
      setUploadStatus({ type: 'error', message: 'Could not parse selected image.' });
      setImageUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* 1. Header summaries */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">Student profiles & Target metrics</h3>
          <p className="text-slate-500 text-xs mt-0.5">Adapt targeted civil assessments credentials, platform limits and review goals</p>
        </div>
        <span className="px-3.5 py-1 text-xs font-semibold rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center gap-1.5 self-start md:self-auto">
          <User size={14} />
          Profile settings
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Bento: Settings configurations */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Main profile edit form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="font-display font-medium text-base text-slate-850 border-b border-slate-100 pb-2 leading-none font-bold animate-fade-in">Modify Configurations</h3>
            
            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs rounded-xl font-semibold text-center">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-250 text-rose-700 text-xs rounded-xl font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 text-left">
              
              {/* Avatar Selectors */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-505 ml-0.5">Choose Avatar Profile</label>
                <div className="flex flex-wrap gap-3">
                  {avatarsList.map((avUrl, index) => (
                    <button
                      id={`avatar-btn-${index}`}
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(avUrl)}
                      className={`w-12 h-12 rounded-xl bg-slate-50 p-1 border-2 transition cursor-pointer ${
                        selectedAvatar === avUrl ? 'border-blue-600 scale-105 shadow-sm' : 'border-slate-200 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} alt="Avatar Selection" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Upload Dropzone */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <label className="block text-xs font-semibold text-slate-600">Or Upload Custom Avatar Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 bg-white">
                    <img src={selectedAvatar} alt="preview" className="w-full h-full object-cover object-top" />
                    {imageUploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      id="profile-avatar-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="block w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">Fits automatically, resized locally to fit candidate tracking cards.</p>
                  </div>
                </div>
                {uploadStatus.message && (
                  <p className={`text-[11px] font-medium leading-relaxed ${uploadStatus.type === 'error' ? 'text-rose-500' : uploadStatus.type === 'success' ? 'text-emerald-600' : 'text-blue-500'}`}>
                    {uploadStatus.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-505 mb-1 ml-0.5">Full Name</label>
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-505 mb-1 ml-0.5">Contact coordinates</label>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-100/60 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-505 mb-1 ml-0.5">Target civil assessment</label>
                  <select
                    id="profile-exam-select"
                    value={targetExam}
                    onChange={(e: any) => setTargetExam(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-450 font-sans"
                  >
                    <option value="SSC CGL font-bold">SSC CGL</option>
                    <option value="CHSL">CHSL</option>
                    <option value="MTS">MTS</option>
                    <option value="CPO">CPO</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-505 mb-1 ml-0.5">Default Assessment playground</label>
                  <select
                    id="profile-platform-select"
                    value={primaryPlatform}
                    onChange={(e: any) => setPrimaryPlatform(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-450 font-sans"
                  >
                    <option value="F64 Academy">F64 Academy</option>
                    <option value="Oliveboard">Oliveboard</option>
                    <option value="Testbook">Testbook</option>
                    <option value="PracticeMock">PracticeMock</option>
                    <option value="RBE">RBE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-505 mb-1 ml-0.5">Daily study review goal</label>
                <div className="flex items-center gap-3">
                  <input
                    id="profile-goal-slider"
                    type="range"
                    min="2"
                    max="12"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-250 accent-blue-600"
                  />
                  <span className="text-slate-800 font-mono font-bold text-sm w-16 text-right leading-none flex-shrink-0">{dailyGoal} hours</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="profile-save-btn"
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold leading-none tracking-wide transition shadow hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} />
                  {loading ? 'Saving...' : 'Commit Configurations'}
                </button>
              </div>

            </form>
          </div>

          {/* Change Password Form Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base text-slate-850 leading-none">Security Credentials Update</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Keep your access credentials safe. Notice: Passwords can only be rotated <span className="font-semibold text-blue-600">once in seven days</span>.
              </p>
            </div>

            {passSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs rounded-xl font-semibold text-center">
                {passSuccessMsg}
              </div>
            )}

            {passErrorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-250 text-rose-700 text-xs rounded-xl font-semibold text-center">
                {passErrorMsg}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 mb-1 ml-0.5">Current Password</label>
                  <input
                    id="profile-current-password"
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-550 mb-1 ml-0.5">New Password</label>
                  <input
                    id="profile-new-password"
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 mb-1 ml-0.5">Confirm New Password</label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    required
                    placeholder="Retype new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                </div>
                
                <div className="flex items-end justify-end">
                  <button
                    id="profile-password-btn"
                    type="submit"
                    disabled={passLoading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold leading-none tracking-wide transition shadow active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Shield size={14} className="text-slate-300" />
                    {passLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Right Bento: Accomplishments list */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-5 flex flex-col shadow-sm h-fit">
          <div className="border-b border-slate-100 pb-2 leading-none flex justify-between items-center">
            <h3 className="font-display font-medium text-base text-slate-855 font-bold">Gamified Badge Vault</h3>
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {achievements.filter(a => a.unlocked).length} Unlocked
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] lg:max-h-[500px] pr-1">
            {achievements.map((ach) => (
              <div key={ach.id} className={`p-4 rounded-2xl border transition flex gap-3.5 ${
                ach.unlocked 
                  ? 'bg-gradient-to-br from-blue-500/5 via-blue-50/10 to-transparent border-blue-200 shadow shadow-blue-500/5' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-205 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {ach.icon}
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="font-display font-semibold text-slate-800 text-xs tracking-tight flex items-center gap-1.5">
                    {ach.title}
                    {ach.unlocked && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                    )}
                  </h4>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed font-sans">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
