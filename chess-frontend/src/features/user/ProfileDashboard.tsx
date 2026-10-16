import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getMyProfile, 
    updateMyProfile, 
    changeMyPassword, 
    deleteMyAccount, 
    type UserResponse 
} from '../../api/userService';
import { useAuth } from '../../hooks/useAuth';
import { 
    Loader2, ShieldAlert, Trophy, Save, X, Edit2, 
    AlertCircle, CheckCircle2, User, Mail, Eye, EyeOff, Info, ArrowLeft, KeyRound 
} from 'lucide-react';

const Tooltip = ({ title, items }: { title: string, items: string[] }) => (
    <div className="group relative flex items-center">
        <Info className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-help transition-colors" size={14} />
        <div className="hidden group-hover:block absolute right-0 sm:left-6 top-6 sm:top-0 w-56 sm:w-64 p-3 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded-xl shadow-xl z-30 space-y-1 border border-slate-700 pointer-events-none animate-in fade-in duration-150">
            <p className="font-bold border-b border-slate-700 pb-1 mb-1">{title}</p>
            <ul className="list-disc pl-3 space-y-0.5 text-slate-300">
                {items.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        </div>
    </div>
);

const ProfileDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    
    const [initialData, setInitialData] = useState<UserResponse | null>(null);
    const [formData, setFormData] = useState<UserResponse | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showDeletePass, setShowDeletePass] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [deletePassword, setDeletePassword] = useState('');

    const isPasswordStrong = useMemo(() => /^(?=.*\d)(?=.*[a-z]).{8,}$/.test(passwordData.newPassword), [passwordData.newPassword]);
    const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initialData), [formData, initialData]);
    const isValidEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
    const canSave = useMemo(() => isDirty && Boolean(formData?.username?.trim()) && isValidEmail(formData?.email || '') && !loading, [isDirty, formData, loading]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        getMyProfile().then(data => {
            if (isMounted) { setInitialData(data); setFormData(data); }
        }).catch(() => setProfileError("Failed to load profile data."))
          .finally(() => setLoading(false));
        return () => { isMounted = false; };
    }, []);

    const handleInputChange = (field: 'username' | 'email', value: string) => {
        if (profileError) setProfileError(null);
        const processedValue = field === 'username' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : value.toLowerCase();
        setFormData(prev => prev ? ({ ...prev, [field]: processedValue }) : null);
    };

    const handleCancel = () => {
        if (isDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return;
        setFormData(initialData); setIsEditing(false); setProfileError(null); setSuccess(null);
    };

    const handleSave = async () => {
        if (!formData || !canSave) return;
        setLoading(true); setProfileError(null); setSuccess(null);
        try {
            await updateMyProfile({ username: formData.username, email: formData.email });
            alert("Your profile information has been updated. For security reasons, please log in again.");
            localStorage.setItem('profileUpdated', 'true');
            logout(); 
        } catch (err: any) { 
            setProfileError(err.response?.data?.message || "Update failed"); 
        } 
        finally { setLoading(false); }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword || !isPasswordStrong) return;
        setLoading(true); setPasswordError(null); setSuccess(null);
        try {
            await changeMyPassword(passwordData);
            alert("Password updated successfully! Please log in again.");
            logout(); 
        } catch (err: any) { 
            setPasswordError(err.response?.data?.message || "Password update failed"); 
        } 
        finally { setLoading(false); }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword || !window.confirm("CRITICAL: This will permanently delete your account. Are you sure?")) return;
        setLoading(true); setPasswordError(null);
        try {
            await deleteMyAccount({ password: deletePassword });
            logout(); 
        } catch (err: any) { 
            setPasswordError(err.response?.data?.message || "Deletion failed"); 
            setLoading(false); 
        }
    };

    if (loading && !formData) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
    if (!formData) return null;

    return (
        <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
            {/* Header Navigation */}
            <button 
                onClick={() => navigate('/menu')} 
                className="min-h-11 flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors uppercase font-black text-xs tracking-widest cursor-pointer mb-5"
            >
                <ArrowLeft size={16} /> Back to Menu
            </button>

            {/* Header Title */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Profile Settings</h1>
                <div className="h-1.5 w-24 bg-indigo-600 mt-2 rounded-full" />
            </div>

            {(profileError || passwordError || success) && (
                <div className={`flex items-center gap-2.5 p-4 rounded-2xl text-xs font-bold border mb-6 ${profileError || passwordError ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'}`}>
                    {(profileError || passwordError) ? <AlertCircle size={18} className="shrink-0"/> : <CheckCircle2 size={18} className="shrink-0"/>} 
                    <span>{profileError || passwordError || success}</span>
                </div>
            )}

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                
                {/* Left Column: Stats & Account Details */}
                <div className="bg-white dark:bg-[#070b19] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-full">
                    <div className="space-y-6">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                            {[
                                { label: 'ELO', val: formData.eloRating, title: 'ELO Rating', tips: ['Increases based on match results.', 'Determines your rank.'], borderLeft: 'border-l-amber-500', color: 'text-amber-600 dark:text-yellow-400' },
                                { label: 'WINS', val: formData.totalWins, title: 'Total Wins', tips: ['Total number of matches won.'], borderLeft: 'border-l-emerald-500', color: 'text-emerald-700 dark:text-emerald-400' },
                                { label: 'LOSS', val: formData.totalLosses, title: 'Total Losses', tips: ['Total number of matches lost.'], borderLeft: 'border-l-rose-500', color: 'text-rose-700 dark:text-rose-400' },
                                { label: 'DRAW', val: formData.totalDraws, title: 'Draws', tips: ['Total number of matches drawn.'], borderLeft: 'border-l-slate-400', color: 'text-slate-800 dark:text-slate-300' },
                            ].map((stat, i) => (
                                <div key={i} className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-l-4 ${stat.borderLeft} shadow-xs text-center space-y-1`}>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider">{stat.label}</span>
                                        <Tooltip title={stat.title} items={stat.tips} />
                                    </div>
                                    <div className={`text-xl sm:text-2xl font-black tabular-nums ${stat.color}`}>{stat.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Account Details Form */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                                <Trophy size={16} className="text-indigo-600 dark:text-indigo-400" /> Account Details
                            </h3>
                            <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Username</label>
                                        <Tooltip title="Username" items={['Only letters and numbers allowed.', 'Changes require re-login.']} />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 px-4 pl-11 rounded-xl border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600 disabled:opacity-70 transition-colors" disabled={!isEditing} value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Email Address</label>
                                        <Tooltip title="Email Address" items={['Used for account recovery and notifications.']} />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 px-4 pl-11 rounded-xl border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600 disabled:opacity-70 transition-colors" disabled={!isEditing} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex gap-3 pt-6">
                        <button onClick={isEditing ? handleCancel : () => setIsEditing(true)} className="flex-1 min-h-11 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                            {isEditing ? <><X size={15}/> Cancel</> : <><Edit2 size={15}/> Edit Profile</>}
                        </button>
                        {isEditing && (
                            <button onClick={handleSave} disabled={!canSave} className="flex-1 min-h-11 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20">
                                {loading ? <Loader2 className="animate-spin" size={15}/> : <><Save size={15}/> Save Changes</>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Security & Danger Zone */}
                <div className="bg-white dark:bg-[#070b19] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-full">
                    {/* Security Credentials */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400"/>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">Security Credentials</h4>
                            <Tooltip title="Security Policies" items={['Password must be at least 8 characters.', 'Must include at least 1 number and 1 letter.']} />
                        </div>
                        <div className="relative">
                            <input className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 px-4 pr-11 rounded-xl border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600" type={showCurrentPass ? "text" : "password"} placeholder="Current Password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">{showCurrentPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                        <div className="space-y-1.5">
                            <div className="relative">
                                <input className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 px-4 pr-11 rounded-xl border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600" type={showNewPass ? "text" : "password"} placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">{showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                            {passwordData.newPassword && (
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-300 ${isPasswordStrong ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-1/2'}`} />
                                </div>
                            )}
                        </div>
                        <button onClick={handlePasswordChange} disabled={loading || !passwordData.currentPassword || !isPasswordStrong} className="w-full min-h-11 px-4 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors cursor-pointer shadow-sm">
                            Rotate Password
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                        <div className="rounded-2xl p-4 sm:p-5 border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={18} className="text-rose-600 dark:text-rose-400" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Danger Zone</h4>
                                <Tooltip title="Delete Account" items={['This action cannot be undone.', 'All data will be permanently deleted.', 'Password is required to confirm.']} />
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Permanently delete your account, battle records, and ELO rating.</p>
                            <div className="relative">
                                <input className="w-full min-h-11 bg-white dark:bg-slate-950 px-4 pr-11 rounded-xl border border-rose-300 dark:border-rose-900/60 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-rose-600" type={showDeletePass ? "text" : "password"} placeholder="Confirm password to delete" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                                <button type="button" onClick={() => setShowDeletePass(!showDeletePass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">{showDeletePass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                            <button onClick={handleDeleteAccount} disabled={loading || !deletePassword} className="w-full min-h-11 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer shadow-md shadow-rose-600/20">
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileDashboard;
