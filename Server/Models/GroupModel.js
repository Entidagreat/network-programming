const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
    }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;