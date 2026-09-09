const StudyGroup = require('../models/StudyGroup');
const StudyGroupPost = require('../models/StudyGroupPost');
const Subject = require('../models/Subject');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Get all study groups
exports.getGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.find()
            .populate('subjectId', 'name subjectName')
            .populate('creatorId', 'name avatarUrl')
            .sort('-createdAt');
            
        // We might want to send member count instead of full array to save bandwidth
        const groupsData = groups.map(g => ({
            _id: g._id,
            name: g.name,
            description: g.description,
            subject: g.subjectId,
            creator: g.creatorId,
            memberCount: g.members.length,
            createdAt: g.createdAt
        }));

        res.json(groupsData);
    } catch (err) {
        console.error('getGroups Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Create a new study group
exports.createGroup = async (req, res) => {
    try {
        const { name, description, subjectId } = req.body;

        if (!name || !description || !subjectId) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ msg: 'Subject not found' });
        }

        const newGroup = new StudyGroup({
            name,
            description,
            subjectId,
            creatorId: req.user.id,
            members: [req.user.id] // Creator is automatically a member
        });

        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (err) {
        console.error('createGroup Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get single group details along with posts
exports.getGroupById = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id)
            .populate('subjectId', 'name subjectName')
            .populate('creatorId', 'name avatarUrl')
            .populate('members', 'name avatarUrl points'); // We get points to act as member XP

        if (!group) {
            return res.status(404).json({ msg: 'Study group not found' });
        }

        const posts = await StudyGroupPost.find({ groupId: group._id })
            .populate('authorId', 'name avatarUrl')
            .populate('replies.authorId', 'name avatarUrl')
            .sort('-createdAt');

        res.json({
            group,
            posts
        });
    } catch (err) {
        console.error('getGroupById Error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Study group not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
};

// Join a study group
exports.joinGroup = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ msg: 'Study group not found' });
        }

        // Check if already a member
        if (group.members.some(member => member.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'You are already a member of this group' });
        }

        group.members.push(req.user.id);
        await group.save();

        res.json(group);
    } catch (err) {
        console.error('joinGroup Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Leave a study group
exports.leaveGroup = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ msg: 'Study group not found' });
        }

        // Check if actually a member
        if (!group.members.some(member => member.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'You are not a member of this group' });
        }

        group.members = group.members.filter(member => member.toString() !== req.user.id);
        await group.save();

        res.json(group);
    } catch (err) {
        console.error('leaveGroup Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Create a post in a study group
exports.createPost = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ msg: 'Study group not found' });
        }

        // Must be a member to post
        if (!group.members.some(member => member.toString() === req.user.id)) {
            return res.status(403).json({ msg: 'You must be a member to post' });
        }

        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ msg: 'Post content cannot be empty' });
        }

        const newPost = new StudyGroupPost({
            groupId: group._id,
            authorId: req.user.id,
            content
        });

        const savedPost = await newPost.save();
        
        // Populate author before returning so frontend has user details
        await savedPost.populate('authorId', 'name avatarUrl');

        // Notify other group members
        const otherMembers = group.members.filter(m => m.toString() !== req.user.id);
        if (otherMembers.length > 0) {
            const author = await User.findById(req.user.id);
            await notificationService.notifyStudyGroupPost(
                otherMembers, 
                author.name || 'A member', 
                group.name, 
                group._id
            );
        }

        res.status(201).json(savedPost);
    } catch (err) {
        console.error('createPost Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Reply to a post
exports.replyToPost = async (req, res) => {
    try {
        const post = await StudyGroupPost.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Verify group exists and user is a member
        const group = await StudyGroup.findById(post.groupId);
        if (!group || !group.members.some(member => member.toString() === req.user.id)) {
            return res.status(403).json({ msg: 'You must be a member to reply' });
        }

        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ msg: 'Reply content cannot be empty' });
        }

        post.replies.push({
            authorId: req.user.id,
            content
        });

        await post.save();
        
        // Populate the specific reply we just added
        await post.populate('replies.authorId', 'name avatarUrl');

        res.status(201).json(post);
    } catch (err) {
        console.error('replyToPost Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
