// Defines a quiz, optionally tied to a course, chapter, or video

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        maxlength: 255
    },
    video_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null
    },
    chapter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        default: null
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    }
}, {
    timestamps: true
});

quizSchema.index({ video_id: 1 });
quizSchema.index({ chapter_id: 1 });
quizSchema.index({ course_id: 1 });

module.exports = mongoose.model('Quiz', quizSchema);