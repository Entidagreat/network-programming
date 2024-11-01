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

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const message = new Message({
            sender: senderId,
            text,
            group: groupId,
        });

        const savedMessage = await message.save();
        group.messages.push(savedMessage._id);
        await group.save();

        res.status(200).json(savedMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
// Get messages of a group


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

const addUserToGroup = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMember = group.members.some(member => member.user.toString() === userId);
        if (isMember) {
            return res.status(400).json({ message: 'User is already a member of the group' });
        }

        group.members.push({ user: userId, role: 'member' });
        await group.save();

        res.status(200).json({ message: 'User added to group successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createGroup, sendMessageToGroup, getUserGroups, addUserToGroup, };