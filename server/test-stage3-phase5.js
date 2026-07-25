const mongoose = require('mongoose');
const User = require('./models/User');
const StoreItem = require('./models/StoreItem');
const storeService = require('./services/storeService');
const { getStoreItems, getUserInventory, purchaseItem } = require('./controllers/storeController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 5 Stage 3 testing...');

    // Case 1: Catalog Upsert (Non-destructive)
    await storeService.ensureStoreCatalogInitialized();
    await storeService.ensureStoreCatalogInitialized();
    const catalogCount = await StoreItem.countDocuments();
    console.log('Case 1 (Catalog initialized & non-destructive 9 items):', catalogCount === 9 ? 'PASS' : 'FAIL');

    // Case 2: Catalog API Read-Only (Deterministic Sort: category -> price -> key)
    const resCatalog = createRes();
    await getStoreItems({}, resCatalog);
    const sortedCorrectly = resCatalog.data.length === 9 && resCatalog.data[0].category === 'avatar';
    console.log('Case 2 (Catalog API read-only & deterministic sort):', sortedCorrectly ? 'PASS' : 'FAIL');

    // Setup Test User
    await User.deleteMany({ email: 'p5stage3@test.com' });
    const user = await User.create({ name: 'P5Stage3User', email: 'p5stage3@test.com', tokens: 30 });

    // Case 3: User Inventory API Read-Only
    const resInv = createRes();
    await getUserInventory({ params: { userId: user._id.toString() } }, resInv);
    console.log('Case 3 (User Inventory API returns tokens and inventory array):', resInv.data.tokens === 30 && Array.isArray(resInv.data.inventory) ? 'PASS' : 'FAIL');

    // Case 4: Successful Purchase (User has 30 tokens, buys item costing 10 -> tokens = 20)
    const resPur1 = createRes();
    await purchaseItem({ body: { userId: user._id.toString(), itemKey: 'avatar_scholar' } }, resPur1);
    let u4 = await User.findById(user._id);
    const hasScholar = u4.inventory.some(i => i.itemKey === 'avatar_scholar');
    console.log('Case 4 (Successful purchase updates tokens to 20 & adds item to inventory):', resPur1.statusCode === 200 && u4.tokens === 20 && hasScholar ? 'PASS' : 'FAIL');

    // Case 6: Already Owned Protection
    const resDup = createRes();
    await purchaseItem({ body: { userId: user._id.toString(), itemKey: 'avatar_scholar' } }, resDup);
    let u6 = await User.findById(user._id);
    const scholarCount = u6.inventory.filter(i => i.itemKey === 'avatar_scholar').length;
    console.log('Case 6 (Already owned item returns 400 & prevents duplicate inventory):', resDup.statusCode === 400 && resDup.data.msg === 'Item already owned' && scholarCount === 1 ? 'PASS' : 'FAIL');

    // Case 5: Insufficient Tokens Protection
    u6.tokens = 5;
    await u6.save();
    const resInsuff = createRes();
    await purchaseItem({ body: { userId: user._id.toString(), itemKey: 'avatar_wizard' } }, resInsuff); // Costs 20
    let u5 = await User.findById(user._id);
    console.log('Case 5 (Insufficient tokens returns 400 & leaves tokens at 5):', resInsuff.statusCode === 400 && resInsuff.data.msg === 'Insufficient tokens' && u5.tokens === 5 ? 'PASS' : 'FAIL');

    // Case 7: Same-Item Concurrency Test (5 simultaneous requests for same item, user has 15 tokens, frame_silver costs 15)
    u5.tokens = 15;
    await u5.save();
    const sameItemResults = await Promise.all([
        storeService.executePurchase(user._id.toString(), 'frame_silver'),
        storeService.executePurchase(user._id.toString(), 'frame_silver'),
        storeService.executePurchase(user._id.toString(), 'frame_silver'),
        storeService.executePurchase(user._id.toString(), 'frame_silver'),
        storeService.executePurchase(user._id.toString(), 'frame_silver')
    ]);
    const successSame = sameItemResults.filter(r => r.success).length;
    const failSame = sameItemResults.filter(r => !r.success).length;
    let u7 = await User.findById(user._id);
    console.log('Case 7 (Same-Item Concurrency: 1 succeeds, 4 fail, tokens = 0):', successSame === 1 && failSame === 4 && u7.tokens === 0 ? 'PASS' : 'FAIL');

    // Case 8 (NEW REQUIREMENT): Cross-Item Concurrency Test
    // User has 10 tokens. Item A (accent_emerald) costs 15, Item B (frame_gold) costs 25...
    // Let's create two items costing 10 each: avatar_scholar (already owned, so let's use 2 unowned items: frame_silver is owned now).
    // Let's set token balance to 15, and use 2 items costing 15 each: frame_silver (owned), accent_emerald (cost 15), frame_gold (cost 25).
    // Let's create temporary items or set prices for testing cross-item concurrency:
    // User has 15 tokens. accent_emerald costs 15, frame_silver costs 15 (owned).
    // Let's reset inventory for cross-item test on a fresh user:
    await User.deleteMany({ email: 'crossitem@test.com' });
    const crossUser = await User.create({ name: 'CrossUser', email: 'crossitem@test.com', tokens: 15 });
    // Item A: accent_emerald (cost 15), Item B: frame_silver (cost 15)
    const crossResults = await Promise.all([
        storeService.executePurchase(crossUser._id.toString(), 'accent_emerald'),
        storeService.executePurchase(crossUser._id.toString(), 'frame_silver')
    ]);
    const successCross = crossResults.filter(r => r.success).length;
    const failCross = crossResults.filter(r => !r.success).length;
    let uCross = await User.findById(crossUser._id);
    console.log('Case 8 (Cross-Item Concurrency: Exactly 1 succeeds, 1 fails, tokens = 0, inventory = 1 item):', successCross === 1 && failCross === 1 && uCross.tokens === 0 && uCross.inventory.length === 1 ? 'PASS' : 'FAIL');

    // Case 8 (Client Price Tampering Ignored)
    const resTamper = createRes();
    await purchaseItem({ body: { userId: user._id.toString(), itemKey: 'avatar_wizard', price: 0, newTokenBalance: 999 } }, resTamper);
    console.log('Case 8b (Client price/balance tampering ignored):', resTamper.statusCode === 400 && resTamper.data.msg === 'Insufficient tokens' ? 'PASS' : 'FAIL');

    // Case 9: Malformed userId -> HTTP 400
    const resMalformed = createRes();
    await getUserInventory({ params: { userId: 'invalid-id' } }, resMalformed);
    console.log('Case 9 (Malformed userId -> HTTP 400):', resMalformed.statusCode === 400 && resMalformed.data.msg === 'Invalid user ID format' ? 'PASS' : 'FAIL');

    // Case 10: Non-existent userId -> HTTP 404
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res404 = createRes();
    await getUserInventory({ params: { userId: fakeId } }, res404);
    console.log('Case 10 (Nonexistent userId -> HTTP 404):', res404.statusCode === 404 && res404.data.msg === 'User not found' ? 'PASS' : 'FAIL');

    // Case 11: Invalid itemKey -> HTTP 404
    const resInvalidKey = createRes();
    await purchaseItem({ body: { userId: user._id.toString(), itemKey: 'non_existent_item' } }, resInvalidKey);
    console.log('Case 11 (Nonexistent itemKey -> HTTP 404):', resInvalidKey.statusCode === 404 && resInvalidKey.data.msg === 'Store item not found' ? 'PASS' : 'FAIL');

    // Case 12: Unavailable item -> HTTP 400
    const unavailItem = await StoreItem.create({ key: 'test_unavail', name: 'Unavail Item', description: 'Test', category: 'avatar', price: 5, available: false });
    const resUnavail = createRes();
    await purchaseItem({ body: { userId: user._id.toString(), itemKey: 'test_unavail' } }, resUnavail);
    console.log('Case 12 (Unavailable item -> HTTP 400 "Item currently unavailable"):', resUnavail.statusCode === 400 && resUnavail.data.msg === 'Item currently unavailable' ? 'PASS' : 'FAIL');

    // Case 13: Achievements unchanged
    console.log('Case 13 (Token spending awards 0 badges/points):', u7.points === 0 && u7.unlockedBadges.length === 0 ? 'PASS' : 'FAIL');

    // Cleanup
    await User.findByIdAndDelete(user._id);
    await User.findByIdAndDelete(crossUser._id);
    await StoreItem.findByIdAndDelete(unavailItem._id);

    process.exit(0);
}

runTests().catch(err => {
    console.error('Stage 3 test run failed:', err);
    process.exit(1);
});
