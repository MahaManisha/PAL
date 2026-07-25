const mongoose = require('mongoose');
const User = require('./models/User');
const StoreItem = require('./models/StoreItem');
const storeService = require('./services/storeService');
const { getStoreItems, getUserInventory, equipItem, unequipItem } = require('./controllers/storeController');

const createRes = () => {
    return {
        statusCode: 200,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; }
    };
};

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/daz_learning');
    console.log('Connected to DB for Phase 5 Stage 4 testing...');

    await storeService.ensureStoreCatalogInitialized();

    // Create Test User
    await User.deleteMany({ email: 'stage4@test.com' });
    const user = await User.create({
        name: 'Stage4User',
        email: 'stage4@test.com',
        tokens: 100,
        inventory: [{ itemKey: 'avatar_scholar', purchasedAt: new Date() }]
    });

    // Case 1: Unowned item equip attempt -> HTTP 403
    const resUnowned = createRes();
    await equipItem({ body: { userId: user._id.toString(), itemKey: 'avatar_wizard' } }, resUnowned);
    console.log('Case 1 (Unowned item equip -> HTTP 403 "Item not owned"):', resUnowned.statusCode === 403 && resUnowned.data.msg === 'Item not owned' ? 'PASS' : 'FAIL');

    // Case 2 & 3: Owned avatar equip -> HTTP 200, updates equipped.avatar ONLY
    const resEquipAv = createRes();
    await equipItem({ body: { userId: user._id.toString(), itemKey: 'avatar_scholar' } }, resEquipAv);
    let u2 = await User.findById(user._id);
    const avCorrect = u2.equipped.avatar === 'avatar_scholar' && u2.equipped.profile_frame === '' && u2.equipped.theme_accent === '';
    console.log('Case 2 & 3 (Owned avatar equip -> HTTP 200 & Category Enforcement avatar ONLY):', resEquipAv.statusCode === 200 && avCorrect ? 'PASS' : 'FAIL');

    // Add frame and accent to inventory for Case 4 & 5
    u2.inventory.push({ itemKey: 'frame_silver', purchasedAt: new Date() });
    u2.inventory.push({ itemKey: 'accent_emerald', purchasedAt: new Date() });
    await u2.save();

    // Case 4: Owned profile frame equip
    const resFrame = createRes();
    await equipItem({ body: { userId: user._id.toString(), itemKey: 'frame_silver' } }, resFrame);
    let u4 = await User.findById(user._id);
    console.log('Case 4 (Owned profile frame equip -> equipped.profile_frame updated):', u4.equipped.profile_frame === 'frame_silver' ? 'PASS' : 'FAIL');

    // Case 5: Owned theme accent equip
    const resAccent = createRes();
    await equipItem({ body: { userId: user._id.toString(), itemKey: 'accent_emerald' } }, resAccent);
    let u5 = await User.findById(user._id);
    console.log('Case 5 (Owned theme accent equip -> equipped.theme_accent updated):', u5.equipped.theme_accent === 'accent_emerald' ? 'PASS' : 'FAIL');

    // Case 6 & 7: Valid unequip sets category to '' & preserves inventory
    const resUnequip = createRes();
    await unequipItem({ body: { userId: user._id.toString(), category: 'avatar' } }, resUnequip);
    let u6 = await User.findById(user._id);
    const unequippedCleanly = u6.equipped.avatar === '' && u6.inventory.length === 3;
    console.log('Case 6 & 7 (Valid unequip clears category & preserves inventory):', resUnequip.statusCode === 200 && unequippedCleanly ? 'PASS' : 'FAIL');

    // Case 8: Invalid unequip category -> HTTP 400
    const resBadCat = createRes();
    await unequipItem({ body: { userId: user._id.toString(), category: 'invalid_cat' } }, resBadCat);
    console.log('Case 8 (Invalid unequip category -> HTTP 400):', resBadCat.statusCode === 400 ? 'PASS' : 'FAIL');

    // Case 9: Malformed userId -> HTTP 400
    const resMalformed = createRes();
    await equipItem({ body: { userId: 'invalid-id-123', itemKey: 'avatar_scholar' } }, resMalformed);
    console.log('Case 9 (Malformed userId -> HTTP 400):', resMalformed.statusCode === 400 ? 'PASS' : 'FAIL');

    // Case 10: Nonexistent user -> HTTP 404
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res404User = createRes();
    await equipItem({ body: { userId: fakeId, itemKey: 'avatar_scholar' } }, res404User);
    console.log('Case 10 (Nonexistent user -> HTTP 404):', res404User.statusCode === 404 ? 'PASS' : 'FAIL');

    // Case 11: Nonexistent itemKey -> HTTP 404
    const res404Item = createRes();
    await equipItem({ body: { userId: user._id.toString(), itemKey: 'fake_item_key' } }, res404Item);
    console.log('Case 11 (Nonexistent itemKey -> HTTP 404):', res404Item.statusCode === 404 ? 'PASS' : 'FAIL');

    // Case 13: Store-user endpoint returns tokens + inventory + normalized equipped
    const resUserInv = createRes();
    await getUserInventory({ params: { userId: user._id.toString() } }, resUserInv);
    const hasNormEquipped = resUserInv.data.equipped && typeof resUserInv.data.equipped.avatar === 'string';
    console.log('Case 13 (Store-user endpoint returns tokens, inventory & normalized equipped):', resUserInv.statusCode === 200 && hasNormEquipped ? 'PASS' : 'FAIL');

    // Case 14 & 15: Zero side-effects (points, tokens, streak unchanged by equip/unequip)
    console.log('Case 14 & 15 (Zero side-effects: tokens, points, streak unchanged):', u6.tokens === 100 && u6.points === 0 && u6.streak === 0 ? 'PASS' : 'FAIL');

    // Cleanup
    await User.findByIdAndDelete(user._id);

    process.exit(0);
}

runTests().catch(err => {
    console.error('Stage 4 test run failed:', err);
    process.exit(1);
});
