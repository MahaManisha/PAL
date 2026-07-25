/**
 * Presentation-only metadata mapping for store cosmetics.
 * Authoritative price, ownership, and inventory rules remain in the database.
 */
export const COSMETIC_PRESENTATION = {
    // Avatars
    avatar_scholar: {
        icon: '🎓',
        previewBg: 'rgba(59,130,246,0.12)',
        label: 'Scholar Avatar'
    },
    avatar_wizard: {
        icon: '🧙',
        previewBg: 'rgba(139,92,246,0.12)',
        label: 'Code Wizard'
    },
    avatar_cyber: {
        icon: '🤖',
        previewBg: 'rgba(6,182,212,0.12)',
        label: 'Cyber Operator'
    },

    // Profile Frames
    frame_silver: {
        icon: '🥈',
        frameStyle: '2px solid #94a3b8',
        boxShadow: '0 0 10px rgba(148,163,184,0.4)',
        label: 'Silver Border'
    },
    frame_gold: {
        icon: '🥇',
        frameStyle: '2px solid #eab308',
        boxShadow: '0 0 14px rgba(234,179,8,0.5)',
        label: 'Gold Honor'
    },
    frame_neon: {
        icon: '✨',
        frameStyle: '2px solid #ec4899',
        boxShadow: '0 0 16px rgba(236,72,153,0.6)',
        label: 'Neon Glow'
    },

    // Theme Accents
    accent_emerald: {
        icon: '🟢',
        color: '#10b981',
        label: 'Emerald Glow'
    },
    accent_amber: {
        icon: '🟠',
        color: '#f59e0b',
        label: 'Amber Flame'
    },
    accent_ruby: {
        icon: '🔴',
        color: '#ef4444',
        label: 'Ruby Surge'
    }
};

/**
 * Get display icon for an avatar item key
 */
export const getAvatarIcon = (itemKey) => {
    if (!itemKey) return '👤';
    return COSMETIC_PRESENTATION[itemKey]?.icon || '👤';
};

/**
 * Get profile frame style object for a profile frame key
 */
export const getFrameStyle = (itemKey) => {
    if (!itemKey || !COSMETIC_PRESENTATION[itemKey]) return {};
    const item = COSMETIC_PRESENTATION[itemKey];
    return {
        border: item.frameStyle || 'none',
        boxShadow: item.boxShadow || 'none'
    };
};

/**
 * Get theme accent color string for a theme accent key
 */
export const getAccentColor = (itemKey) => {
    if (!itemKey || !COSMETIC_PRESENTATION[itemKey]) return null;
    return COSMETIC_PRESENTATION[itemKey].color || null;
};
