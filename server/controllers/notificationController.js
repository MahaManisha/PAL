const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        // Fetch up to 20 most recent notifications
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        console.error('getNotifications Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, read: false });
        res.json({ count });
    } catch (err) {
        console.error('getUnreadCount Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: { read: true } },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        console.error('markAsRead Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.json({ msg: 'All marked as read' });
    } catch (err) {
        console.error('markAllAsRead Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
