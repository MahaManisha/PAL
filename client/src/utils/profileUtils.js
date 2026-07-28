// Preset Avatars for "Picture Edition"
export const PRESET_AVATARS = [
    { id: 'avatar_hero', label: 'Hero', emoji: '🦸', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Hero' },
    { id: 'avatar_wizard', label: 'Wizard', emoji: '🧙', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wizard' },
    { id: 'avatar_cyber', label: 'Cyberpunk', emoji: '🤖', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber' },
    { id: 'avatar_scholar', label: 'Scholar', emoji: '🎓', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Scholar' },
    { id: 'avatar_ninja', label: 'Ninja', emoji: '⚡', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ninja' },
    { id: 'avatar_astro', label: 'Astronaut', emoji: '🚀', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Astro' },
    { id: 'avatar_creator', label: 'Creator', emoji: '🎨', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Creator' },
    { id: 'avatar_owl', label: 'Wise Owl', emoji: '🦉', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Owl' },
];

/**
 * Calculates profile completion percentage and breakdown items
 * @param {Object} user 
 * @returns {{ percentage: number, items: Array, ringColor: string, isComplete: boolean }}
 */
export const calculateProfileCompletion = (user) => {
    if (!user) {
        return { percentage: 0, items: [], ringColor: '#ef4444', isComplete: false };
    }

    const hasAvatar = !!(user.avatarUrl || user.equipped?.avatar);
    const hasBio = !!(user.bio && user.bio.trim().length > 0);
    const hasTargetGoal = !!(user.targetGoal && user.targetGoal.trim().length > 0);
    const hasDetails = !!((user.institution && user.institution.trim().length > 0) || (user.socialLink && user.socialLink.trim().length > 0) || (user.preferredStudyHours && user.preferredStudyHours.trim().length > 0));

    const items = [
        { id: 'account', label: 'Account Registered', required: true, completed: true, weight: 20 },
        { id: 'avatar', label: 'Profile Picture / Avatar Selected', required: false, completed: hasAvatar, weight: 20 },
        { id: 'bio', label: 'Bio / Tagline Written', required: false, completed: hasBio, weight: 20 },
        { id: 'goal', label: 'Learning Target Goal Set', required: false, completed: hasTargetGoal, weight: 20 },
        { id: 'details', label: 'Study Details / Institution Added', required: false, completed: hasDetails, weight: 20 },
    ];

    const completedWeight = items.reduce((acc, item) => item.completed ? acc + item.weight : acc, 0);
    const percentage = Math.min(100, Math.max(0, completedWeight));

    // Dynamic ring colors based on completion:
    // 100% -> Full Glowing Emerald Green (#22c55e)
    // 80% -> Vibrant Blue (#3b82f6)
    // 60% -> Purple (#8b5cf6)
    // 40% -> Amber Gold (#f59e0b)
    // <40% -> Red Coral (#ef4444)
    let ringColor = '#ef4444';
    if (percentage >= 100) ringColor = '#22c55e';
    else if (percentage >= 80) ringColor = '#3b82f6';
    else if (percentage >= 60) ringColor = '#8b5cf6';
    else if (percentage >= 40) ringColor = '#f59e0b';

    return {
        percentage,
        items,
        ringColor,
        isComplete: percentage >= 100
    };
};
