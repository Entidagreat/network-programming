const Group = require('../Models/GroupModel');
const User = require('../Models/userModel');
const Message = require('../Models/messageModel');

// Create a new group
const createGroup = async (req, res) => {
    const { name, members } = req.body;

    const group = new Group({
        name,
        members: members.map(member => ({ user: member, role: 'member' })),
    });

    try {
        const savedGroup = await group.save();
        res.status(200).json(savedGroup);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Send a message to a group
const sendMessageToGroup = async (req, res) => {
    const { groupId, senderId, text } = req.body;

    const message = new Message({
        sender: senderId,
        text,
        group: groupId,
    });

    try {
        const savedMessage = await message.save();
        await Group.findByIdAndUpdate(groupId, {
            $push: { messages: savedMessage._id }
        });
        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).json(error);
    }
};
const getUserGroups = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId).populate({
            path: 'groups',
            populate: {
                path: 'messages',
                model: 'Message'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.groups);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { createGroup, sendMessageToGroup, getUserGroups };