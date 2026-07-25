const express = require('express');
const router = express.Router();
const { getStoreItems, getUserInventory, purchaseItem, equipItem, unequipItem } = require('../controllers/storeController');
const { authenticate, authorizeParamUser, authorizeBodyUser } = require('../middleware/auth');

// GET /api/store/items - Read-only catalog of available items (public)
router.get('/items', getStoreItems);

// GET /api/store/user/:userId - Read-only user tokens, inventory & equipped state (protected)
router.get('/user/:userId', authenticate, authorizeParamUser('userId'), getUserInventory);

// POST /api/store/purchase - Server-authoritative atomic purchase (protected)
router.post('/purchase', authenticate, authorizeBodyUser('userId'), purchaseItem);

// POST /api/store/equip - Secure item equip endpoint (protected)
router.post('/equip', authenticate, authorizeBodyUser('userId'), equipItem);

// POST /api/store/unequip - Category unequip endpoint (protected)
router.post('/unequip', authenticate, authorizeBodyUser('userId'), unequipItem);

module.exports = router;
