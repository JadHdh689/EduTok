// Defines a quiz, optionally tied to a course, chapter, or video

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Quiz', quizSchema);
