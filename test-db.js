// test-db.js – Seeds and validates all models with basic test data

const connectDB = require('./config/connect-db');

const User = require('./models/user');
const Course = require('./models/course');
const Chapter = require('./models/chapter');
const Video = require('./models/video');
const Quiz = require('./models/quiz');
const Question = require('./models/question');
const Answer = require('./models/answer');
const QuizAttempt = require('./models/quiz-attempt');
const Subscription = require('./models/subscription');
const Comment = require('./models/comment');
const WatchedVideo = require('./models/watched-video');
const UserQuizStats = require('./models/user-quiz-stats');

(async () => {
  try {
    await connectDB();
    console.log('🧪 Running DB test...');

    // 1. Create a user
    const user = await User.create({
      name: 'Test Creator',
      email: 'creator@test.com',
      password_hash: 'hashed_pw',
      role: 'creator',
      is_admin: true
    });

    // 2. Create a course
    const course = await Course.create({
      title: 'Test Course',
      description: 'Just a sample course',
      creator_id: user._id
    });

    // 3. Add a chapter
    const chapter = await Chapter.create({
      title: 'Chapter 1',
      sequence_number: 1,
      course_id: course._id
    });

    // 4. Upload a video
    const video = await Video.create({
      title: 'Intro Video',
      description: 'Welcome!',
      url: 'https://example.com/video.mp4',
      duration_seconds: 60,
      category: 'Math',
      creator_id: user._id,
      course_id: course._id,
      chapter_id: chapter._id
    });

    // 5. Add a quiz
    const quiz = await Quiz.create({
      video_id: video._id,
      creator_id: user._id
    });

    // 6. Add a question
    const question = await Question.create({
      quiz_id: quiz._id,
      text: 'What is 2 + 2?'
    });

    // 7. Add answers
    await Answer.create([
      { question_id: question._id, text: '3', is_correct: false },
      { question_id: question._id, text: '4', is_correct: true }
    ]);

    // 8. Simulate a learner
    const learner = await User.create({
      name: 'Learner One',
      email: 'learner@test.com',
      password_hash: 'pw123',
      role: 'learner'
    });

    // 9. Quiz attempt
    await QuizAttempt.create({
      user_id: learner._id,
      quiz_id: quiz._id,
      score: 100
    });

    // 10. Subscription
    await Subscription.create({
      follower_id: learner._id,
      creator_id: user._id
    });

    // 11. Comment
    await Comment.create({
      user_id: learner._id,
      video_id: video._id,
      text: 'Great video!'
    });

    // 12. Watch log
    await WatchedVideo.create({
      user_id: learner._id,
      video_id: video._id
    });

    // 13. Quiz stats
    await UserQuizStats.create({
      user_id: learner._id,
      course_id: course._id,
      total_attempts: 1,
      avg_score: 100
    });

    console.log('✅ All models tested successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
})();
