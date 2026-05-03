const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'model'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
