import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content : {
        type: String,
        required: true,
        maxlength: 280
    },
    video : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    }
},{timestamps: true});

export const Comment = mongoose.model('Comment',commentSchema);