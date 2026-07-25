import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Lock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { COSMETIC_PRESENTATION } from '../config/cosmeticsConfig';

const RewardStoreModal = ({ isOpen, onClose, userId }) => {
    const { experience, themeConfig } = useTheme();
    const { updateUserStats } = useContext(AuthContext);

    const [catalog, setCatalog] = useState([]);
    const [userTokens, setUserTokens] = useState(0);
    const [userInventory, setUserInventory] = useState([]);
    const [userEquipped, setUserEquipped] = useState({ avatar: '', profile_frame: '', theme_accent: '' });

    const [activeTab, setActiveTab] = useState('all'); // 'all', 'avatar', 'profile_frame', 'theme_accent'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionPendingKey, setActionPendingKey] = useState(null); // Tracks item being bought/equipped

    const fetchStoreData = async () => {
        if (!userId || !isOpen) return;
        setLoading(true);
        setError('');

        try {
            const [catalogRes, userStoreRes] = await Promise.all([
                apiClient.get('/api/store/items'),
                apiClient.get(`/api/store/user/${userId}`)
            ]);

            setCatalog(catalogRes.data || []);
            setUserTokens(userStoreRes.data?.tokens || 0);
            setUserInventory(userStoreRes.data?.inventory || []);
            setUserEquipped(userStoreRes.data?.equipped || { avatar: '', profile_frame: '', theme_accent: '' });

            // Synchronize with global AuthContext
            updateUserStats({
                tokens: userStoreRes.data?.tokens || 0,
                inventory: userStoreRes.data?.inventory || [],
                equipped: userStoreRes.data?.equipped || { avatar: '', profile_frame: '', theme_accent: '' }
            });
        } catch (err) {
            console.error('RewardStoreModal: Failed to fetch store data', err);
            setError('Unable to load store data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, [isOpen, userId]);

    // Handle Escape Key Close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Experience-aware Title
    const getStoreTitle = () => {
        if (experience === 'gamified') return 'Reward Shop';
        if (experience === 'cinematic') return 'Costume & Effects';
        return 'Rewards & Customization';
    };

    // Purchase handler (PURCHASE ≠ EQUIP)
    const handlePurchase = async (item) => {
        if (actionPendingKey) return;
        setActionPendingKey(item.key);
        setError('');

        try {
            const res = await apiClient.post('/api/store/purchase', {
                userId,
                itemKey: item.key
            });

            if (res.data.success) {
                const newTokens = res.data.tokensRemaining;
                const newInventory = res.data.inventory;

                setUserTokens(newTokens);
                setUserInventory(newInventory);

                // Immediately sync AuthContext
                updateUserStats({ tokens: newTokens, inventory: newInventory });
            }
        } catch (err) {
            console.error('Purchase failed', err);
            const errMsg = err.response?.data?.msg || 'Purchase failed. Please try again.';
            setError(errMsg);
        } finally {
            setActionPendingKey(null);
        }
    };

    // Equip handler
    const handleEquip = async (item) => {
        if (actionPendingKey) return;
        setActionPendingKey(item.key);
        setError('');

        try {
            const res = await apiClient.post('/api/store/equip', {
                userId,
                itemKey: item.key
            });

            if (res.data.success) {
                const newEquipped = res.data.equipped;
                setUserEquipped(newEquipped);

                // Immediately sync AuthContext
                updateUserStats({ equipped: newEquipped });
            }
        } catch (err) {
            console.error('Equip failed', err);
            const errMsg = err.response?.data?.msg || 'Equip failed. Please try again.';
            setError(errMsg);
        } finally {
            setActionPendingKey(null);
        }
    };

    // Unequip handler
    const handleUnequip = async (category) => {
        if (actionPendingKey) return;
        setActionPendingKey(`unequip_${category}`);
        setError('');

        try {
            const res = await apiClient.post('/api/store/unequip', {
                userId,
                category
            });

            if (res.data.success) {
                const newEquipped = res.data.equipped;
                setUserEquipped(newEquipped);

                // Immediately sync AuthContext
                updateUserStats({ equipped: newEquipped });
            }
        } catch (err) {
            console.error('Unequip failed', err);
            const errMsg = err.response?.data?.msg || 'Unequip failed. Please try again.';
            setError(errMsg);
        } finally {
            setActionPendingKey(null);
        }
    };

    // Filter items by active tab
    const filteredCatalog = catalog.filter(item => {
        if (activeTab === 'all') return true;
        return item.category === activeTab;
    });

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`glass-card micro-${themeConfig?.micro || 'slide'}`}
                    style={{
                        width: '100%', maxWidth: '750px', maxHeight: '85vh',
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', padding: 0, borderRadius: '1.25rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        border: '1px solid var(--card-border)', background: 'var(--surface)'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--card-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ShoppingBag size={22} color="var(--primary)" />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                                    {getStoreTitle()}
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Customize your profile appearance
                                </span>
                            </div>
                        </div>

                        {/* Token Counter & Close */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                padding: '0.4rem 0.85rem', borderRadius: '9999px',
                                background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
                                color: '#eab308', fontWeight: 700, fontSize: '0.88rem',
                                display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}>
                                <span>🪙</span> {userTokens} Tokens
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close modal"
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--card-border)',
                                    borderRadius: '50%', width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem',
                        borderBottom: '1px solid var(--card-border)', overflowX: 'auto'
                    }}>
                        {[
                            { id: 'all', label: 'All Items' },
                            { id: 'avatar', label: 'Avatars' },
                            { id: 'profile_frame', label: 'Frames' },
                            { id: 'theme_accent', label: 'Accents' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.4rem 0.85rem', borderRadius: '0.5rem',
                                    background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                                    color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                                    border: '1px solid',
                                    borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--card-border)',
                                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                    whiteSpace: 'nowrap', transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div style={{
                            margin: '1rem 1.5rem 0 1.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Modal Scrollable Content */}
                    <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Loading Store Catalog...
                            </div>
                        ) : filteredCatalog.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No items found in this category.
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.25rem'
                            }}>
                                {filteredCatalog.map(item => {
                                    const isOwned = userInventory.some(inv => inv.itemKey === item.key);
                                    const isEquipped = userEquipped[item.category] === item.key;
                                    const canAfford = userTokens >= item.price;
                                    const isPending = actionPendingKey === item.key || actionPendingKey === `unequip_${item.category}`;

                                    const presentation = COSMETIC_PRESENTATION[item.key] || {};

                                    return (
                                        <div
                                            key={item.key}
                                            style={{
                                                padding: '1.1rem', borderRadius: '0.85rem',
                                                background: isEquipped ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                                                border: isEquipped ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                textAlign: 'center', gap: '0.5rem', position: 'relative'
                                            }}
                                        >
                                            {/* Preview Box */}
                                            <div style={{
                                                width: '64px', height: '64px', borderRadius: '50%',
                                                background: presentation.previewBg || 'rgba(255,255,255,0.06)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '2.2rem', marginBottom: '0.2rem',
                                                border: presentation.frameStyle || '1px solid var(--card-border)',
                                                boxShadow: presentation.boxShadow || 'none'
                                            }}>
                                                {item.icon || '🎨'}
                                            </div>

                                            {/* Item Details */}
                                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem' }}>
                                                {item.name}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>
                                                {item.description}
                                            </div>

                                            {/* Price Tag */}
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#eab308', margin: '0.2rem 0' }}>
                                                🪙 {item.price} Tokens
                                            </div>

                                            {/* Action Button Machine */}
                                            <div style={{ width: '100%', marginTop: '0.25rem' }}>
                                                {isEquipped ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                        <span style={{
                                                            fontSize: '0.75rem', fontWeight: 700, color: '#22c55e',
                                                            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                                                            padding: '0.35rem', borderRadius: '0.4rem',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
                                                        }}>
                                                            <Check size={14} /> Equipped
                                                        </span>
                                                        <button
                                                            onClick={() => handleUnequip(item.category)}
                                                            disabled={isPending}
                                                            style={{
                                                                width: '100%', padding: '0.3rem', borderRadius: '0.4rem',
                                                                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)',
                                                                color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600,
                                                                cursor: isPending ? 'default' : 'pointer'
                                                            }}
                                                        >
                                                            Unequip
                                                        </button>
                                                    </div>
                                                ) : isOwned ? (
                                                    <button
                                                        onClick={() => handleEquip(item)}
                                                        disabled={isPending}
                                                        style={{
                                                            width: '100%', padding: '0.45rem', borderRadius: '0.5rem',
                                                            background: 'var(--primary)', border: 'none',
                                                            color: '#ffffff', fontSize: '0.82rem', fontWeight: 700,
                                                            cursor: isPending ? 'default' : 'pointer',
                                                            opacity: isPending ? 0.6 : 1, transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {isPending ? 'Equipping...' : 'Equip'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePurchase(item)}
                                                        disabled={!canAfford || isPending}
                                                        style={{
                                                            width: '100%', padding: '0.45rem', borderRadius: '0.5rem',
                                                            background: canAfford ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.03)',
                                                            border: canAfford ? '1px solid rgba(234,179,8,0.4)' : '1px solid var(--card-border)',
                                                            color: canAfford ? '#eab308' : 'var(--text-muted)',
                                                            fontSize: '0.82rem', fontWeight: 700,
                                                            cursor: canAfford && !isPending ? 'pointer' : 'not-allowed',
                                                            opacity: canAfford && !isPending ? 1 : 0.6, transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {isPending ? 'Buying...' : canAfford ? `Buy for ${item.price} Tokens` : `Need ${item.price} Tokens`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RewardStoreModal;
