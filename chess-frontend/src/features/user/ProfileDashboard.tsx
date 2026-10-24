import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getMyProfile, 
    updateMyProfile, 
    changeMyPassword, 
    deleteMyAccount, 
    uploadAvatar,
    deleteAvatar,
    type UserResponse 
} from '../../api/userService';
import { useAuth } from '../../hooks/useAuth';
import { 
    Loader2, ShieldAlert, Trophy, Save, X, Edit2, 
    AlertCircle, CheckCircle2, User, Mail, Eye, EyeOff, Info, ArrowLeft, KeyRound,
    Camera, Trash2
} from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';
import { getFullAvatarUrl } from '../../utils/avatarUtils';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const validateAvatar = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_AVATAR_SIZE) {
        return { valid: false, error: 'Avatar file size must not exceed 2MB.' };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        return { valid: false, error: 'Only JPG, PNG, and WEBP formats are supported.' };
    }
    return { valid: true };
};

const ProfileDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [initialData, setInitialData] = useState<UserResponse | null>(null);
    const [formData, setFormData] = useState<UserResponse | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
    
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

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfileError(null);
        setSuccess(null);

        const validation = validateAvatar(file);
        if (!validation.valid) {
            setProfileError(validation.error || 'Invalid image file.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => prev ? ({ ...prev, avatarUrl: previewUrl }) : null);

        setAvatarLoading(true);
        try {
            const res = await uploadAvatar(file);
            const cleanUrl = res.avatarUrl.split('?')[0];
            const cacheBustedUrl = `${cleanUrl}?t=${Date.now()}`;

            const updated = { ...formData!, avatarUrl: cacheBustedUrl };
            setFormData(updated);
            setInitialData(updated);
            setSuccess("Avatar updated successfully!");
            window.dispatchEvent(new Event('avatarUpdated'));
        } catch (err: any) { 
            setFormData(initialData);
            setProfileError(err.response?.data?.message || "Failed to upload avatar.");
        } finally {
            setAvatarLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAvatarDelete = async () => {
        if (!formData?.avatarUrl) return;
        if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

        setProfileError(null);
        setSuccess(null);
        setAvatarLoading(true);
        try {
            await deleteAvatar();
            const updated = { ...formData, avatarUrl: null };
            setFormData(updated);
            setInitialData(updated);
            setSuccess("Avatar removed successfully.");
            
            window.dispatchEvent(new Event('avatarUpdated'));
        } catch (err: any) { 
            setProfileError(err.response?.data?.message || "Failed to remove avatar.");
        } finally {
            setAvatarLoading(false);
        }
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

    const userInitial = (formData.username?.charAt(0) || 'U').toUpperCase();

    return (
        <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
            {/* Header Navigation */}
            <button 
                type="button" 
                onClick={() => navigate('/menu')} 
                className="min-h-11 flex items-center gap-2 text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors uppercase font-black text-xs tracking-widest cursor-pointer mb-5"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                
                {/* Left Column: Avatar & Account Details */}
                <div className="bg-white dark:bg-[#070b19] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between h-full">
                    <div className="space-y-6">
                        
                        {/* Avatar Upload Interface */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                            <div className="relative w-24 h-24 rounded-full border-2 border-indigo-600/30 dark:border-indigo-500/30 overflow-hidden shrink-0 shadow-md flex items-center justify-center bg-indigo-600 text-white select-none">
                                {formData.avatarUrl ? (
                                    <img 
                                        src={getFullAvatarUrl(formData.avatarUrl)} 
                                        alt={formData.username} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-black">{userInitial}</span>
                                )}

                                {avatarLoading && (
                                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center sm:items-start gap-2 w-full">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarSelect} 
                                    accept=".jpg,.jpeg,.png,.webp" 
                                    className="hidden" 
                                />
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()} 
                                        disabled={avatarLoading} 
                                        className="min-h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-98 disabled:opacity-50"
                                    >
                                        <Camera size={14} />
                                        <span>Upload Photo</span>
                                    </button>

                                    {formData.avatarUrl && (
                                        <button 
                                            type="button" 
                                            onClick={handleAvatarDelete} 
                                            disabled={avatarLoading} 
                                            className="min-h-10 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 disabled:opacity-50"
                                            title="Remove Avatar"
                                        >
                                            <Trash2 size={14} />
                                            <span className="hidden sm:inline">Remove</span>
                                        </button>
                                    )}
                                </div>

                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center sm:text-left">
                                    JPG, PNG or WEBP. Max 2MB.
                                </span>
                            </div>
                        </div>

                        {/* Account Details Form */}
                        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-950 dark:text-white">
                                <Trophy size={16} className="text-indigo-600 dark:text-indigo-400" /> Account Details
                            </h3>
                            <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-300">Username</label>
                                        <Tooltip content="Only letters and numbers allowed. Modifying username requires re-login." position="top">
                                            <Info className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" size={13} />
                                        </Tooltip>
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
                                        <input 
                                            className={`w-full min-h-11 px-4 pl-11 rounded-xl border text-sm font-bold transition-colors ${
                                                isEditing 
                                                    ? 'bg-white dark:bg-slate-950 border-indigo-500 dark:border-indigo-500 text-slate-950 dark:text-white shadow-xs focus:outline-none' 
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white cursor-default'
                                            }`} 
                                            disabled={!isEditing} 
                                            value={formData.username} 
                                            onChange={(e) => handleInputChange('username', e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-300">Email Address</label>
                                        <Tooltip content="Used for account recovery, notifications, and security alerts." position="top">
                                            <Info className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" size={13} />
                                        </Tooltip>
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
                                        <input 
                                            className={`w-full min-h-11 px-4 pl-11 rounded-xl border text-sm font-bold transition-colors ${
                                                isEditing 
                                                    ? 'bg-white dark:bg-slate-950 border-indigo-500 dark:border-indigo-500 text-slate-950 dark:text-white shadow-xs focus:outline-none' 
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white cursor-default'
                                            }`} 
                                            disabled={!isEditing} 
                                            value={formData.email} 
                                            onChange={(e) => handleInputChange('email', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex gap-3 pt-6">
                        <button 
                            type="button" 
                            onClick={isEditing ? handleCancel : () => setIsEditing(true)} 
                            className={`flex-1 min-h-11 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isEditing 
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent' 
                                    : 'bg-slate-950 hover:bg-slate-800 text-white shadow-sm active:scale-98 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                            }`}
                        >
                            {isEditing ? <><X size={15}/> Cancel</> : <><Edit2 size={15}/> Edit Profile</>}
                        </button>
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={handleSave} 
                                disabled={!canSave} 
                                className="flex-1 min-h-11 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-98"
                            >
                                {loading ? <Loader2 className="animate-spin" size={15}/> : <><Save size={15}/> Save Changes</>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Security & Danger Zone */}
                <div className="bg-white dark:bg-[#070b19] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between h-full">
                    {/* Security Credentials */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400"/>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">Security Credentials</h4>
                            <Tooltip content="Password must be at least 8 characters with at least 1 number and 1 letter." position="top">
                                <Info className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" size={13} />
                            </Tooltip>
                        </div>
                        <div className="relative">
                            <input 
                                className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 px-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors" 
                                type={showCurrentPass ? "text" : "password"} 
                                placeholder="Current Password" 
                                value={passwordData.currentPassword} 
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                            />
                            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer p-1">
                                {showCurrentPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            <div className="relative">
                                <input 
                                    className="w-full min-h-11 bg-slate-50 dark:bg-slate-950 px-4 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors" 
                                    type={showNewPass ? "text" : "password"} 
                                    placeholder="New Password" 
                                    value={passwordData.newPassword} 
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                                />
                                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer p-1">
                                    {showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                            {passwordData.newPassword && (
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-300 ${isPasswordStrong ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-1/2'}`} />
                                </div>
                            )}
                        </div>
                        <button 
                            type="button"
                            onClick={handlePasswordChange} 
                            disabled={loading || !passwordData.currentPassword || !isPasswordStrong} 
                            className="w-full min-h-11 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm active:scale-98"
                        >
                            Change Password
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                        <div className="rounded-2xl p-4 sm:p-5 border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 space-y-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={18} className="text-rose-600 dark:text-rose-400" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">Danger Zone</h4>
                                <Tooltip content="Irreversible action: Permanently deletes your account, match history, and rating records." position="top">
                                    <Info className="text-rose-500 hover:text-rose-700 dark:text-rose-400 cursor-pointer" size={13} />
                                </Tooltip>
                            </div>
                            <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-relaxed font-medium">
                                Permanently delete your account, match history, and rating records.
                            </p>
                            <div className="relative">
                                <input 
                                    className="w-full min-h-11 bg-white dark:bg-slate-950 px-4 pr-11 rounded-xl border border-rose-300 dark:border-rose-900/60 text-sm font-bold text-slate-950 dark:text-white focus:outline-none focus:border-rose-600 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                                    type={showDeletePass ? "text" : "password"} 
                                    placeholder="Confirm password to delete" 
                                    value={deletePassword} 
                                    onChange={(e) => setDeletePassword(e.target.value)} 
                                />
                                <button type="button" onClick={() => setShowDeletePass(!showDeletePass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer p-1">
                                    {showDeletePass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                            <button 
                                type="button"
                                onClick={handleDeleteAccount} 
                                disabled={loading || !deletePassword} 
                                className="w-full min-h-11 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:bg-rose-200 disabled:text-rose-400 dark:disabled:bg-rose-950/40 dark:disabled:text-rose-900/60 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-rose-600/20 active:scale-98"
                            >
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
