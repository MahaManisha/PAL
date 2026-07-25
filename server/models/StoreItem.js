const mongoose = require('mongoose');

const StoreItemSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['avatar', 'profile_frame', 'theme_accent'],
        required: true
    },
    price: { type: Number, required: true, min: 0 },
    icon: { type: String, default: '🎨' },
    available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('StoreItem', StoreItemSchema);
