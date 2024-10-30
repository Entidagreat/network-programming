const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, minlength: 3, maxlength: 200, unique: true },
    password: { type: String, required: true, minlength: 3, maxlength: 1024 },
    role: {
        type: String,
        enum: ['user',
            'high user', 'moderator'],
        default: 'user'
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    group: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], // New attribute
},
    { timestamps: true }
);

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;