const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    members: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: false // Make username optional initially
        },
        role: { 
            type: String, 
            enum: ['admin', 'member'], 
            default: 'member' 
        }
    }],
    messages: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message' 
    }]
}, {
    timestamps: true
});

// Pre-validate middleware to set usernames
groupSchema.pre('validate', async function(next) {
    try {
        const User = mongoose.model('User');
        for (const member of this.members) {
            if (!member.username) {
                const user = await User.findById(member.user);
                if (user) {
                    member.username = user.name;
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Keep population middleware
groupSchema.pre(['find', 'findOne'], function(next) {
    this.populate({
        path: 'members.user',
        select: 'name email'
    });
    next();
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;