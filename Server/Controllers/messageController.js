const messageModel = require('../Models/messageModel');
const Group = require('../Models/GroupModel');

// Create message
const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  if (!chatId || !senderId || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const message = new messageModel({
    chatId,
    senderId,
    text,
  });

  try {
    const response = await message.save();
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get messages
const getMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required' });
  }

  try {
    const messages = await messageModel.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createMessage, getMessages };