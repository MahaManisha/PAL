const mongoose = require('mongoose');
const StoreItem = require('../models/StoreItem');
const User = require('../models/User');

const CANONICAL_STORE_ITEMS = [
    {
        key: 'avatar_scholar',
        name: 'Scholar Avatar',
        description: 'Classic academic profile avatar',
        category: 'avatar',
        price: 10,
        icon: '🎓',
        available: true
    },
    {
        key: 'avatar_wizard',
        name: 'Code Wizard',
        description: 'Mystical developer profile avatar',
        category: 'avatar',
        price: 20,
        icon: '🧙',
        available: true
    },
    {
        key: 'avatar_cyber',
        name: 'Cyber Operator',
        description: 'Futuristic tech profile avatar',
        category: 'avatar',
        price: 30,
        icon: '🤖',
        available: true
    },
    {
        key: 'frame_silver',
        name: 'Silver Border',
        description: 'Sleek metallic profile border',
        category: 'profile_frame',
        price: 15,
        icon: '🥈',
        available: true
    },
    {
        key: 'frame_gold',
        name: 'Gold Honor',
        description: 'Radiant gold profile frame',
        category: 'profile_frame',
        price: 25,
        icon: '🥇',
        available: true
    },
    {
        key: 'frame_neon',
        name: 'Neon Glow',
        description: 'Animated neon border frame',
        category: 'profile_frame',
        price: 35,
        icon: '✨',
        available: true
    },
    {
        key: 'accent_emerald',
        name: 'Emerald Glow',
        description: 'Vibrant emerald theme highlights',
        category: 'theme_accent',
        price: 15,
        icon: '🟢',
        available: true
    },
    {
        key: 'accent_amber',
        name: 'Amber Flame',
        description: 'Warm amber theme highlights',
        category: 'theme_accent',
        price: 25,
        icon: '🟠',
        available: true
    },
    {
        key: 'accent_ruby',
        name: 'Ruby Surge',
        description: 'Intense ruby theme highlights',
        category: 'theme_accent',
        price: 35,
        icon: '🔴',
        available: true
    }
];

/**
 * Non-destructive catalog initialization.
 * Upserts canonical catalog items without deleting existing records.
 */
const ensureStoreCatalogInitialized = async () => {
    try {
        for (const item of CANONICAL_STORE_ITEMS) {
            await StoreItem.updateOne(
                { key: item.key },
                { $setOnInsert: item },
                { upsert: true }
            );
        }
    } catch (err) {
        console.error('storeService.ensureStoreCatalogInitialized error:', err);
    }
};

/**
 * Atomic, concurrency-safe token purchase operation.
 */
const executePurchase = async (userId, itemKey) => {
    // 1. Strict validation of userId and itemKey
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, status: 400, msg: 'Invalid user ID format' };
    }

    if (!itemKey || typeof itemKey !== 'string' || itemKey.trim() === '') {
        return { success: false, status: 400, msg: 'Invalid itemKey parameter' };
    }

    const normalizedKey = itemKey.trim();

    // 2. Fetch authoritative StoreItem to distinguish missing vs unavailable
    const storeItem = await StoreItem.findOne({ key: normalizedKey });
    if (!storeItem) {
        return { success: false, status: 404, msg: 'Store item not found' };
    }

    if (storeItem.available === false) {
        return { success: false, status: 400, msg: 'Item currently unavailable' };
    }

    const price = storeItem.price;

    // 3. Single atomic conditional update directly on MongoDB
    const updateResult = await User.updateOne(
        {
            _id: userId,
            tokens: { $gte: price },
            'inventory.itemKey': { $ne: normalizedKey }
        },
        {
            $inc: { tokens: -price },
            $push: {
                inventory: {
                    itemKey: normalizedKey,
                    purchasedAt: new Date()
                }
            }
        }
    );

    // 4. Handle atomic failure cases if modifiedCount === 0
    if (updateResult.modifiedCount === 0) {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, status: 404, msg: 'User not found' };
        }

        const alreadyOwned = user.inventory && user.inventory.some(inv => inv.itemKey === normalizedKey);
        if (alreadyOwned) {
            return { success: false, status: 400, msg: 'Item already owned' };
        }

        if ((user.tokens || 0) < price) {
            return {
                success: false,
                status: 400,
                msg: 'Insufficient tokens',
                required: price,
                current: user.tokens || 0
            };
        }

        return { success: false, status: 400, msg: 'Purchase operation could not be completed' };
    }

    // 5. Successful purchase — return updated user token state & inventory
    const updatedUser = await User.findById(userId).select('tokens inventory');

    return {
        success: true,
        status: 200,
        msg: 'Item purchased successfully',
        purchasedItem: {
            key: storeItem.key,
            name: storeItem.name,
            category: storeItem.category,
            price: storeItem.price,
            icon: storeItem.icon
        },
        pricePaid: price,
        tokensRemaining: updatedUser ? updatedUser.tokens : 0,
        inventory: updatedUser ? updatedUser.inventory : []
    };
};

/**
 * Secure, server-authoritative item equip function.
 */
const equipItem = async (userId, itemKey) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, status: 400, msg: 'Invalid user ID format' };
    }

    if (!itemKey || typeof itemKey !== 'string' || itemKey.trim() === '') {
        return { success: false, status: 400, msg: 'Invalid itemKey parameter' };
    }

    const normalizedKey = itemKey.trim();

    const storeItem = await StoreItem.findOne({ key: normalizedKey });
    if (!storeItem) {
        return { success: false, status: 404, msg: 'Store item not found' };
    }

    if (storeItem.available === false) {
        return { success: false, status: 400, msg: 'Item currently unavailable' };
    }

    const user = await User.findById(userId);
    if (!user) {
        return { success: false, status: 404, msg: 'User not found' };
    }

    const isOwned = user.inventory && user.inventory.some(inv => inv.itemKey === normalizedKey);
    if (!isOwned) {
        return { success: false, status: 403, msg: 'Item not owned' };
    }

    const category = storeItem.category;
    if (!['avatar', 'profile_frame', 'theme_accent'].includes(category)) {
        return { success: false, status: 400, msg: 'Invalid item category' };
    }

    if (!user.equipped) {
        user.equipped = { avatar: '', profile_frame: '', theme_accent: '' };
    }

    user.equipped[category] = normalizedKey;
    await user.save();

    return {
        success: true,
        status: 200,
        msg: 'Item equipped successfully',
        equipped: {
            avatar: user.equipped.avatar || '',
            profile_frame: user.equipped.profile_frame || '',
            theme_accent: user.equipped.theme_accent || ''
        }
    };
};

/**
 * Server-authoritative item unequip function.
 */
const unequipItem = async (userId, category) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, status: 400, msg: 'Invalid user ID format' };
    }

    if (!category || !['avatar', 'profile_frame', 'theme_accent'].includes(category)) {
        return { success: false, status: 400, msg: 'Invalid category parameter' };
    }

    const user = await User.findById(userId);
    if (!user) {
        return { success: false, status: 404, msg: 'User not found' };
    }

    if (!user.equipped) {
        user.equipped = { avatar: '', profile_frame: '', theme_accent: '' };
    }

    user.equipped[category] = '';
    await user.save();

    return {
        success: true,
        status: 200,
        msg: 'Item unequipped successfully',
        equipped: {
            avatar: user.equipped.avatar || '',
            profile_frame: user.equipped.profile_frame || '',
            theme_accent: user.equipped.theme_accent || ''
        }
    };
};

module.exports = {
    ensureStoreCatalogInitialized,
    executePurchase,
    equipItem,
    unequipItem,
    CANONICAL_STORE_ITEMS
};
