import React, { useState, useEffect, useMemo } from 'react';
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
    AlertCircle, CheckCircle2, Lock, User, Mail, Eye, EyeOff, Info 
} from 'lucide-react';

const Tooltip = ({ title, items }: { title: string, items: string[] }) => (
    <div className="group relative flex items-center">
        <Info className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" size={14} />
        <div className="absolute left-6 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 space-y-1">
            <p className="font-bold border-b border-slate-700 pb-1 mb-1">{title}</p>
            <ul className="list-disc pl-3 space-y-0.5">
                {items.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        </div>
    </div>
);

const ProfileDashboard: React.FC = () => {
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
    const canSave = useMemo(() => isDirty && (formData?.username?.trim() !== '') && isValidEmail(formData?.email || '') && !loading, [isDirty, formData, loading]);

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
        let processedValue = field === 'username' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : value.toLowerCase();
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
        } catch (err: any) { setPasswordError(err.response?.data?.message || "Deletion failed"); setLoading(false); }
    };

    if (loading && !formData) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;
    if (!formData) return null;

    return (
        <div className="max-w-3xl mx-auto pt-36 pb-12 px-4 text-slate-900 dark:text-slate-100">
            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-12 animate-in fade-in duration-500">
                <h1 className="text-4xl font-extrabold text-center uppercase tracking-tighter">Profile Settings</h1>
                
                {(profileError || passwordError || success) && (
                    <div className={`flex items-center gap-2 p-4 border rounded-xl text-sm ${profileError || passwordError ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'}`}>
                        {(profileError || passwordError) ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>} 
                        {profileError || passwordError || success}
                    </div>
                )}

                <div className="grid grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
                    {[
                        { label: 'ELO', val: formData.eloRating, title: 'ELO Rating', tips: ['Increases based on match results.', 'Determines your rank.'] },
                        { label: 'WINS', val: formData.totalWins, title: 'Total Wins', tips: ['Total number of matches won.'] },
                        { label: 'LOSS', val: formData.totalLosses, title: 'Total Losses', tips: ['Total number of matches lost.'] },
                        { label: 'DRAW', val: formData.totalDraws, title: 'Draws', tips: ['Total number of matches drawn.'] },
                    ].map((stat, i) => (
                        <div key={i} className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1">
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{stat.label}</div>
                                <Tooltip title={stat.title} items={stat.tips} />
                            </div>
                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{stat.val}</div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-500"><Trophy size={18} /> Account Details</h3>
                    <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Username</label>
                                <Tooltip title="Username" items={['Only letters and numbers allowed.', 'Changes are permanent.']} />
                            </div>
                            <User className="absolute left-4 top-11 text-slate-400" size={20} />
                            <input className={`w-full bg-slate-50 dark:bg-slate-950 p-4 pl-12 rounded-2xl border ${profileError && formData.username === '' ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-blue-500 outline-none`} disabled={!isEditing} value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                                <Tooltip title="Email Address" items={['Used for notifications.', 'Provides access for password reset.']} />
                            </div>
                            <Mail className="absolute left-4 top-11 text-slate-400" size={20} />
                            <input className={`w-full bg-slate-50 dark:bg-slate-950 p-4 pl-12 rounded-2xl border ${formData.email && !isValidEmail(formData.email) ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-blue-500 outline-none`} disabled={!isEditing} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button onClick={isEditing ? handleCancel : () => setIsEditing(true)} className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                            {isEditing ? <><X size={14} className="inline mr-1"/> Cancel</> : <><Edit2 size={14} className="inline mr-1"/> Edit Profile</>}
                        </button>
                        {isEditing && (
                            <button onClick={handleSave} disabled={!canSave} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-colors cursor-pointer">
                                {loading ? <Loader2 className="animate-spin inline mr-1" size={14}/> : <><Save size={14} className="inline mr-1"/> Save Changes</>}
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2"><Lock size={18}/> Security</h4>
                        <Tooltip title="Security Policies" items={['Password must be at least 8 characters.', 'Must include at least 1 number and 1 letter.']} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" type={showCurrentPass ? "text" : "password"} placeholder="Current Password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                        <button onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer">{showCurrentPass ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                    </div>
                    <div className="space-y-2">
                        <div className="relative">
                            <input className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" type={showNewPass ? "text" : "password"} placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                            <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer">{showNewPass ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                        </div>
                        {passwordData.newPassword && (
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-300 ${isPasswordStrong ? 'bg-emerald-500 w-full' : 'bg-red-500 w-1/2'}`} />
                            </div>
                        )}
                    </div>
                    <button onClick={handlePasswordChange} disabled={loading || !passwordData.currentPassword || !isPasswordStrong} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-colors cursor-pointer">Change Password</button>
                </div>

                <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-sm font-black uppercase text-rose-600 flex items-center gap-2"><ShieldAlert size={18} /> Danger Zone</h4>
                        <Tooltip title="Delete Account" items={['This action cannot be undone.', 'All data will be permanently deleted.', 'Password is required to confirm.']} />
                    </div>
                    <div className="relative">
                        <input className="w-full bg-slate-50 dark:bg-slate-950 p-4 pr-14 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm mb-4 focus:ring-2 focus:ring-rose-500 outline-none" type={showDeletePass ? "text" : "password"} placeholder="Confirm password to delete" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                        <button onClick={() => setShowDeletePass(!showDeletePass)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{showDeletePass ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                    </div>
                    <button onClick={handleDeleteAccount} disabled={loading || !deletePassword} className="w-full py-4 border-2 border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-30 cursor-pointer">
                        Delete My Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
