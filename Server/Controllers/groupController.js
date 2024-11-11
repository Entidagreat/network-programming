const Group = require('../Models/GroupModel');
const User = require('../Models/userModel');
const Message = require('../Models/messageModel');

// Create a new group
const createGroup = async (req, res) => {
    const { name, members } = req.body;

    // Validate input
    if (!name || !members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        // Fetch all user details for members
        const users = await User.find({ _id: { $in: members } });
        
        // Map members with their names
        const membersWithNames = users.map(user => ({
            user: user._id,
            role: 'member',
            userName: user.name // Add user name
        }));

        const group = new Group({
            name,
            members: membersWithNames,
        });

        const savedGroup = await group.save();

        // Update group reference for all members
        await User.updateMany(
            { _id: { $in: members } },
            { $push: { group: savedGroup._id } }
        );

        // Return populated group data
        const populatedGroup = await Group.findById(savedGroup._id)
            .populate('members.user', 'name email');

        res.status(200).json(populatedGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Send a message to a group
// Server-side (groupController.js)
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

        // Emit the new message to all users in the group
        req.app.get('io').to(groupId).emit('newGroupMessage', {
            message: savedMessage,
            groupId: groupId
        });

        res.status(200).json(savedMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// Get messages of a group
const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId).populate('messages');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(group.messages);
    } catch (error) {
        res.status(500).json(error);
    }
};

// groupController.js
const getUserGroups = async (req, res) => {
  const { userId } = req.params;

  try {
    // Tìm người dùng theo userId
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    // Tìm tất cả các nhóm mà người dùng tham gia
    const groups = await Group.find({ _id: { $in: user.group } })
      .populate('members.user', 'name email'); // Populate thông tin người dùng trong thành viên

    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Internal server error' });
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

        // Update user's group attribute
        const userUpdateResult = await User.findByIdAndUpdate(userId, { $addToSet: { group: groupId } });

        if (!userUpdateResult) {
            return res.status(500).json({ message: 'Failed to update user group attribute' });
        }

        res.status(200).json({ message: 'User added to group successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Update each user's group attribute
        await User.updateMany(
            { _id: { $in: group.members.map(member => member.user) } },
            { $pull: { group: groupId } }
        );

        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createGroup, sendMessageToGroup, getUserGroups, addUserToGroup, deleteGroup, getGroupMessages };