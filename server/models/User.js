const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.password || !this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function(password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
