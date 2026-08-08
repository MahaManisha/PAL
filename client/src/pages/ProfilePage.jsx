import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Target, Award, Sparkles, Check, Save, Flame,
    BookOpen, ExternalLink, Camera, Image, ShieldCheck, CheckCircle2,
    Clock, GraduationCap, Palette
} from 'lucide-react';
import ProfileAvatarRing from '../components/ProfileAvatarRing';
import { calculateProfileCompletion, PRESET_AVATARS } from '../utils/profileUtils';

const ProfilePage = () => {
    const { user, updateUserProfile } = useContext(AuthContext);
    const { themeConfig, experience, subTheme } = useTheme();

    const terminology = themeConfig?.terminology || { chapter: 'Chapter', level: 'Level' };

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatarUrl: user?.avatarUrl || '',
        bio: user?.bio || '',
        targetGoal: user?.targetGoal || '',
        institution: user?.institution || '',
        preferredStudyHours: user?.preferredStudyHours || 'Evening',
        socialLink: user?.socialLink || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'avatar'

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                avatarUrl: user.avatarUrl || '',
                bio: user.bio || '',
                targetGoal: user.targetGoal || '',
                institution: user.institution || '',
                preferredStudyHours: user.preferredStudyHours || 'Evening',
                socialLink: user.socialLink || '',
            });
        }
    }, [user]);

    const { percentage, items, ringColor, isComplete } = calculateProfileCompletion({
        ...user,
        ...formData
    });

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        const result = await updateUserProfile(formData);
        setIsSaving(false);

        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
        } else {
            alert(result.error || 'Failed to save profile changes');
        }
    };

    const handleSelectPresetAvatar = (url) => {
        setFormData(prev => ({ ...prev, avatarUrl: url }));
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '5rem', maxWidth: '1080px' }}>
            {/* ─── Header Card ─── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    padding: '2.5rem',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(139,92,246,0.15) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)'
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left: Avatar & User info */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <ProfileAvatarRing user={{ ...user, avatarUrl: formData.avatarUrl }} size={96} strokeWidth={5} showBadge={true} />
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text, #ffffff)' }}>
                                {user?.name || 'Learner'}
                            </h1>
                            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                                {user?.email}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                                    background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                                    fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                                }}>
                                    {themeConfig?.experienceCfg?.emoji} {themeConfig?.subThemeCfg?.label || experience}
                                </span>
                                {isComplete && (
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '999px',
                                        background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                                        fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                                    }}>
                                        <CheckCircle2 size={14} /> 100% Profile Complete
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Stats */}
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: '90px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>⭐ {user?.points || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>Points</div>
                        </div>
                        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: '90px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>🔥 {user?.streak || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>Days Streak</div>
                        </div>
                        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: '90px' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>🎟️ {user?.tokens || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>Tokens</div>
                        </div>
                    </div>
                </div>

                {/* Profile Completion Bar */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #ffffff)' }}>
                            Profile Setup Progress
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: ringColor }}>
                            {percentage}% {isComplete ? '✨ Complete!' : ''}
                        </span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                height: '100%',
                                background: isComplete
                                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                                    : `linear-gradient(90deg, ${ringColor}, #3b82f6)`,
                                borderRadius: '999px',
                                boxShadow: `0 0 10px ${ringColor}`
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* ─── Navigation Tabs ─── */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.5rem 1.25rem', fontSize: '1rem', fontWeight: activeTab === 'profile' ? 700 : 500,
                        color: activeTab === 'profile' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                        borderBottom: activeTab === 'profile' ? '2.5px solid var(--primary, #3b82f6)' : '2.5px solid transparent',
                        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <User size={18} /> Edit Profile Datas
                </button>
                <button
                    onClick={() => setActiveTab('avatar')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.5rem 1.25rem', fontSize: '1rem', fontWeight: activeTab === 'avatar' ? 700 : 500,
                        color: activeTab === 'avatar' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                        borderBottom: activeTab === 'avatar' ? '2.5px solid var(--primary, #3b82f6)' : '2.5px solid transparent',
                        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <Camera size={18} /> Picture Edition & Presets
                </button>
            </div>

            {/* ─── Main Content Grid ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Left Column: Forms */}
                <div style={{ flex: 1 }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handleSave}
                                className="glass-card"
                                style={{ padding: '2rem' }}
                            >
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={20} color="var(--primary, #3b82f6)" /> Personal Details
                                </h3>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted, #94a3b8)' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your name"
                                        required
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                                        Email Address (Registered)
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.95rem', cursor: 'not-allowed', opacity: 0.7 }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                                        Bio / About Me
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell us a little bit about yourself or your learning journey..."
                                        rows={3}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '0.95rem', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                                        Target Learning Goal
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.targetGoal}
                                        onChange={e => setFormData({ ...formData, targetGoal: e.target.value })}
                                        placeholder="e.g. Master Web Development & Maintain 30-Day Streak"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                                            Institution / School
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.institution}
                                            onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                            placeholder="e.g. University / Self-Taught"
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                                            Preferred Study Time
                                        </label>
                                        <select
                                            value={formData.preferredStudyHours}
                                            onChange={e => setFormData({ ...formData, preferredStudyHours: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '0.95rem' }}
                                        >
                                            <option value="Morning">Morning 🌅</option>
                                            <option value="Afternoon">Afternoon ☀️</option>
                                            <option value="Evening">Evening 🌆</option>
                                            <option value="Night Owl">Night Owl 🌙</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                                        Social / Portfolio Link
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.socialLink}
                                        onChange={e => setFormData({ ...formData, socialLink: e.target.value })}
                                        placeholder="https://github.com/yourusername"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.85rem 2.5rem',
                                            borderRadius: '999px',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {isSaving ? 'Saving Changes...' : <><Save size={18} /> Save Profile</>}
                                    </button>

                                    {saveSuccess && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                        >
                                            <CheckCircle2 size={18} /> Profile updated!
                                        </motion.span>
                                    )}
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="avatar"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="glass-card"
                                style={{ padding: '2rem' }}
                            >
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Camera size={20} color="var(--primary, #3b82f6)" /> Profile Picture Edition
                                </h3>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted, #94a3b8)' }}>
                                        Custom Image URL / Photo Link
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.avatarUrl}
                                        onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                                        placeholder="https://example.com/my-photo.png"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text, #ffffff)', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted, #94a3b8)' }}>
                                    Or Pick A Preset Avatar:
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    {PRESET_AVATARS.map(avatar => {
                                        const isSelected = formData.avatarUrl === avatar.url;
                                        return (
                                            <div
                                                key={avatar.id}
                                                onClick={() => handleSelectPresetAvatar(avatar.url)}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '0.85rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                                                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative'
                                                }}
                                            >
                                                {isSelected && (
                                                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#3b82f6', color: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Check size={12} />
                                                    </div>
                                                )}
                                                <img src={avatar.url} alt={avatar.label} style={{ width: '48px', height: '48px', margin: '0 auto 0.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text, #ffffff)' }}>
                                                    {avatar.emoji} {avatar.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.85rem 2.5rem',
                                        borderRadius: '999px',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isSaving ? 'Applying Avatar...' : <><Save size={18} /> Apply Picture</>}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Profile Checklist & Status */}
                <div style={{ width: '100%', maxWidth: '360px' }}>
                    <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={20} color={ringColor} /> Profile Completion Checklist
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justify: 'space-between',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '0.65rem',
                                        background: item.completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                        border: item.completed ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: item.completed ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#ffffff'
                                        }}>
                                            {item.completed ? <Check size={12} /> : null}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: item.completed ? 'var(--text, #ffffff)' : 'var(--text-muted, #94a3b8)' }}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.completed ? '#4ade80' : 'var(--text-muted, #64748b)' }}>
                                        +{item.weight}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {!isComplete && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '1.25rem', lineHeight: 1.5, textAlign: 'center' }}>
                                💡 Complete all optional details to reach 100% and unlock your full green glowing ring!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
