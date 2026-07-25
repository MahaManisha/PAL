const mongoose = require('mongoose');
const StoreItem = require('../models/StoreItem');
const User = require('../models/User');
const storeService = require('../services/storeService');

exports.getStoreItems = async (req, res) => {
    try {
        await storeService.ensureStoreCatalogInitialized();

        // Fetch available items, sorted deterministically by category -> price -> key
        const items = await StoreItem.find({ available: true })
            .sort({ category: 1, price: 1, key: 1 })
            .lean();

        res.json(items);
    } catch (err) {
        console.error('storeController.getStoreItems error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getUserInventory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: 'Invalid user ID format' });
        }

        const user = await User.findById(userId).select('tokens inventory equipped');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const equipped = {
            avatar: (user.equipped && user.equipped.avatar) || '',
            profile_frame: (user.equipped && user.equipped.profile_frame) || '',
            theme_accent: (user.equipped && user.equipped.theme_accent) || ''
        };

        res.json({
            userId,
            tokens: user.tokens || 0,
            inventory: user.inventory || [],
            equipped
        });
    } catch (err) {
        console.error('storeController.getUserInventory error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.purchaseItem = async (req, res) => {
    try {
        const { userId, itemKey } = req.body;

        const purchaseResult = await storeService.executePurchase(userId, itemKey);

        if (!purchaseResult.success) {
            return res.status(purchaseResult.status).json(purchaseResult);
        }

        return res.status(200).json(purchaseResult);
    } catch (err) {
        console.error('storeController.purchaseItem error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.equipItem = async (req, res) => {
    try {
        const { userId, itemKey } = req.body;

        const equipResult = await storeService.equipItem(userId, itemKey);

        if (!equipResult.success) {
            return res.status(equipResult.status).json(equipResult);
        }

        return res.status(200).json(equipResult);
    } catch (err) {
        console.error('storeController.equipItem error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.unequipItem = async (req, res) => {
    try {
        const { userId, category } = req.body;

        const unequipResult = await storeService.unequipItem(userId, category);

        if (!unequipResult.success) {
            return res.status(unequipResult.status).json(unequipResult);
        }

        return res.status(200).json(unequipResult);
    } catch (err) {
        console.error('storeController.unequipItem error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
