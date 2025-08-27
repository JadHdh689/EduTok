export const user = "creator";

// Enhanced User Profile Data
export const userProfiles = {
  creator: {
    id: 'creator_001',
    name: 'Sarah Chen',
    role: 'creator',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Computer Science Professor & Tech Educator with 8+ years of experience. Passionate about making complex programming concepts accessible to everyone.',
    subjects: ['Math', 'Programming'],
    followers: 12450,
    following: 89,
  },
  student: {
    id: 'student_001',
    name: 'Alex Rodriguez',
    role: 'student',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Computer Science student passionate about learning new technologies. Currently exploring React Native and mobile app development.',
    subjects: [ 'Programming', 'Biology'],
    following: 234,
  }
};

// Course Data Structure
export const subscribedCourses = [
  {
    id: 'course_1',
    title: 'React Native Masterclass',
    creator: 'Alice Dev',
    creatorProfile: 'https://randomuser.me/api/portraits/women/44.jpg',
    subject: 'Programming',
    difficulty: 'hard',
    description: 'Complete React Native course from basics to advanced concepts',
    thumbnailUrl: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    totalChapters: 5,
    enrolledStudents: 1250,
    rating: 4.8,
    progress: 65, // User's overall progress in the course
    chapters: [
      {
        id: 'chapter_1_1',
        courseId: 'course_1',
        chapterNumber: 1,
        title: 'Introduction to React Native',
        description: 'Learn the fundamentals of React Native development',
        totalVideos: 3,
        completed: true,
        videos: ['video_1_1_1', 'video_1_1_2', 'video_1_1_3']
      },
      {
        id: 'chapter_1_2',
        courseId: 'course_1',
        chapterNumber: 2,
        title: 'Components and Navigation',
        description: 'Building components and implementing navigation',
        totalVideos: 4,
        completed: false,
        videos: ['video_1_2_1', 'video_1_2_2', 'video_1_2_3', 'video_1_2_4']
      },
      {
        id: 'chapter_1_3',
        courseId: 'course_1',
        chapterNumber: 3,
        title: 'State Management',
        description: 'Managing state in React Native apps',
        totalVideos: 3,
        completed: false,
        videos: ['video_1_3_1', 'video_1_3_2', 'video_1_3_3']
      },
      {
        id: 'chapter_1_4',
        courseId: 'course_1',
        chapterNumber: 4,
        title: 'API Integration',
        description: 'Working with APIs and external services',
        totalVideos: 4,
        completed: false,
        videos: ['video_1_4_1', 'video_1_4_2', 'video_1_4_3', 'video_1_4_4']
      },
      {
        id: 'chapter_1_5',
        courseId: 'course_1',
        chapterNumber: 5,
        title: 'Deployment and Publishing',
        description: 'Deploy your React Native app to app stores',
        totalVideos: 2,
        completed: false,
        videos: ['video_1_5_1', 'video_1_5_2']
      }
    ]
  },
  {
    id: 'course_2',
    title: 'Fitness Fundamentals',
    creator: 'FitWithLena',
    creatorProfile: 'https://randomuser.me/api/portraits/women/68.jpg',
    subject: 'Fitness',
    difficulty: 'intermediate',
    description: 'Complete fitness course covering all aspects of health and wellness',
    thumbnailUrl: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    totalChapters: 4,
    enrolledStudents: 850,
    rating: 4.6,
    progress: 30,
    chapters: [
      {
        id: 'chapter_2_1',
        courseId: 'course_2',
        chapterNumber: 1,
        title: 'Workout Basics',
        description: 'Foundation exercises and proper form',
        totalVideos: 3,
        completed: true,
        videos: ['video_2_1_1', 'video_2_1_2', 'video_2_1_3']
      },
      {
        id: 'chapter_2_2',
        courseId: 'course_2',
        chapterNumber: 2,
        title: 'Cardio Training',
        description: 'Cardiovascular exercises and routines',
        totalVideos: 4,
        completed: false,
        videos: ['video_2_2_1', 'video_2_2_2', 'video_2_2_3', 'video_2_2_4']
      },
      {
        id: 'chapter_2_3',
        courseId: 'course_2',
        chapterNumber: 3,
        title: 'Strength Building',
        description: 'Weight training and muscle building',
        totalVideos: 5,
        completed: false,
        videos: ['video_2_3_1', 'video_2_3_2', 'video_2_3_3', 'video_2_3_4', 'video_2_3_5']
      },
      {
        id: 'chapter_2_4',
        courseId: 'course_2',
        chapterNumber: 4,
        title: 'Nutrition and Recovery',
        description: 'Diet planning and recovery techniques',
        totalVideos: 3,
        completed: false,
        videos: ['video_2_4_1', 'video_2_4_2', 'video_2_4_3']
      }
    ]
  },
  {
    id: 'course_3',
    title: 'Digital Photography Mastery',
    creator: 'OutdoorJules',
    creatorProfile: 'https://randomuser.me/api/portraits/men/11.jpg',
    subject: 'Photography',
    difficulty: 'intermediate',
    description: 'Learn professional photography techniques and editing',
    thumbnailUrl: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    totalChapters: 3,
    enrolledStudents: 2100,
    rating: 4.9,
    progress: 80,
    chapters: [
      {
        id: 'chapter_3_1',
        courseId: 'course_3',
        chapterNumber: 1,
        title: 'Camera Fundamentals',
        description: 'Understanding your camera settings and basics',
        totalVideos: 4,
        completed: true,
        videos: ['video_3_1_1', 'video_3_1_2', 'video_3_1_3', 'video_3_1_4']
      },
      {
        id: 'chapter_3_2',
        courseId: 'course_3',
        chapterNumber: 2,
        title: 'Composition and Lighting',
        description: 'Advanced composition techniques and lighting setup',
        totalVideos: 3,
        completed: true,
        videos: ['video_3_2_1', 'video_3_2_2', 'video_3_2_3']
      },
      {
        id: 'chapter_3_3',
        courseId: 'course_3',
        chapterNumber: 3,
        title: 'Post-Processing',
        description: 'Photo editing and post-processing workflows',
        totalVideos: 4,
        completed: false,
        videos: ['video_3_3_1', 'video_3_3_2', 'video_3_3_3', 'video_3_3_4']
      }
    ]
  }
];

// Course Videos Data (extending the existing commonVideos with course-specific data)
export const courseVideos = [
  // Course 1 - React Native Masterclass Videos
  {
    id: 'video_1_1_1',
    courseId: 'course_1',
    chapterId: 'chapter_1_1',
    chapterNumber: 1,
    courseName: 'React Native Masterclass',
    courseProgress: 65,
    title: 'What is React Native?',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'easy',
    creator: 'Alice Dev',
    profile: 'https://randomuser.me/api/portraits/women/44.jpg',
    likes: 120,
    Comments: 45,
    followed: true,
    bio: 'Computer Science Professor & Tech Educator with 8+ years of experience.',
    followers: 12450,
    following: 89,
    description: 'Introduction to React Native framework and its core concepts',
    questions: [
      { 
        question: 'What is React Native primarily used for?', 
        options: ['Web development', 'Mobile app development', 'Desktop applications'], 
        answer: 'Mobile app development' 
      },
      { 
        question: 'React Native is developed by which company?', 
        options: ['Google', 'Facebook', 'Microsoft'], 
        answer: 'Facebook' 
      }
    ]
  },
  {
    id: 'video_1_1_2',
    courseId: 'course_1',
    chapterId: 'chapter_1_1',
    chapterNumber: 1,
    courseName: 'React Native Masterclass',
    courseProgress: 65,
    title: 'Setting up Development Environment',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'intermediate',
    creator: 'Alice Dev',
    profile: 'https://randomuser.me/api/portraits/women/44.jpg',
    likes: 95,
    Comments: 32,
    followed: true,
    bio: 'Computer Science Professor & Tech Educator with 8+ years of experience.',
    followers: 12450,
    following: 89,
    description: 'Complete setup guide for React Native development environment',
    questions: [
      { 
        question: 'Which tool is recommended for React Native development?', 
        options: ['Expo CLI', 'Vue CLI', 'Angular CLI'], 
        answer: 'Expo CLI' 
      },
      { 
        question: 'What is required to run React Native apps on iOS simulator?', 
        options: ['Android Studio', 'Xcode', 'Visual Studio'], 
        answer: 'Xcode' 
      }
    ]
  },
  {
    id: 'video_1_2_1',
    courseId: 'course_1',
    chapterId: 'chapter_1_2',
    chapterNumber: 2,
    courseName: 'React Native Masterclass',
    courseProgress: 65,
    title: 'Building Your First Component',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'intermediate',
    creator: 'Alice Dev',
    profile: 'https://randomuser.me/api/portraits/women/44.jpg',
    likes: 150,
    Comments: 68,
    followed: true,
    bio: 'Computer Science Professor & Tech Educator with 8+ years of experience.',
    followers: 12450,
    following: 89,
    description: 'Learn to create reusable components in React Native',
    questions: [
      { 
        question: 'What is the basic building block of React Native apps?', 
        options: ['Functions', 'Components', 'Classes'], 
        answer: 'Components' 
      },
      { 
        question: 'Which method is used to render components?', 
        options: ['render()', 'display()', 'show()'], 
        answer: 'render()' 
      }
    ]
  },
  // Course 2 - Fitness Fundamentals Videos
  {
    id: 'video_2_1_1',
    courseId: 'course_2',
    chapterId: 'chapter_2_1',
    chapterNumber: 1,
    courseName: 'Fitness Fundamentals',
    courseProgress: 30,
    title: 'Proper Push-up Form',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Fitness',
    difficulty: 'easy',
    creator: 'FitWithLena',
    profile: 'https://randomuser.me/api/portraits/women/68.jpg',
    likes: 300,
    Comments: 85,
    followed: true,
    bio: 'Certified fitness trainer helping people achieve their health goals.',
    followers: 8900,
    following: 156,
    description: 'Master the perfect push-up technique for maximum effectiveness',
    questions: [
      { 
        question: 'What muscles do push-ups primarily target?', 
        options: ['Legs', 'Chest and arms', 'Back'], 
        answer: 'Chest and arms' 
      },
      { 
        question: 'How should your body be positioned during a push-up?', 
        options: ['Curved', 'Straight line', 'Arched'], 
        answer: 'Straight line' 
      }
    ]
  },
  {
    id: 'video_2_2_1',
    courseId: 'course_2',
    chapterId: 'chapter_2_2',
    chapterNumber: 2,
    courseName: 'Fitness Fundamentals',
    courseProgress: 30,
    title: 'HIIT Cardio Basics',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Fitness',
    difficulty: 'intermediate',
    creator: 'FitWithLena',
    profile: 'https://randomuser.me/api/portraits/women/68.jpg',
    likes: 450,
    Comments: 120,
    followed: true,
    bio: 'Certified fitness trainer helping people achieve their health goals.',
    followers: 8900,
    following: 156,
    description: 'Introduction to High-Intensity Interval Training for maximum fat burn',
    questions: [
      { 
        question: 'What does HIIT stand for?', 
        options: ['High Impact Intense Training', 'High Intensity Interval Training', 'Heavy Interval Intensive Training'], 
        answer: 'High Intensity Interval Training' 
      },
      { 
        question: 'How long should a typical HIIT workout be?', 
        options: ['10-30 minutes', '45-60 minutes', '1-2 hours'], 
        answer: '10-30 minutes' 
      }
    ]
  },
  // Course 3 - Photography Videos
  {
    id: 'video_3_1_1',
    courseId: 'course_3',
    chapterId: 'chapter_3_1',
    chapterNumber: 1,
    courseName: 'Digital Photography Mastery',
    courseProgress: 80,
    title: 'Understanding Aperture',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Photography',
    difficulty: 'intermediate',
    creator: 'OutdoorJules',
    profile: 'https://randomuser.me/api/portraits/men/11.jpg',
    likes: 280,
    Comments: 95,
    followed: true,
    bio: 'Adventure photographer sharing the beauty of the outdoors.',
    followers: 2500000,
    following: 45,
    description: 'Master aperture settings for perfect depth of field control',
    questions: [
      { 
        question: 'What does a lower f-number (like f/1.4) create?', 
        options: ['Deep focus', 'Shallow depth of field', 'Darker image'], 
        answer: 'Shallow depth of field' 
      },
      { 
        question: 'Which aperture setting would you use for landscape photography?', 
        options: ['f/1.4', 'f/8-f/11', 'f/22'], 
        answer: 'f/8-f/11' 
      }
    ]
  },
  {
    id: 'video_3_2_1',
    courseId: 'course_3',
    chapterId: 'chapter_3_2',
    chapterNumber: 2,
    courseName: 'Digital Photography Mastery',
    courseProgress: 80,
    title: 'Rule of Thirds Composition',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Photography',
    difficulty: 'easy',
    creator: 'OutdoorJules',
    profile: 'https://randomuser.me/api/portraits/men/11.jpg',
    likes: 520,
    Comments: 140,
    followed: true,
    bio: 'Adventure photographer sharing the beauty of the outdoors.',
    followers: 2500000,
    following: 45,
    description: 'Learn the fundamental rule of thirds for better photo composition',
    questions: [
      { 
        question: 'The rule of thirds divides your frame into how many sections?', 
        options: ['6 sections', '9 sections', '12 sections'], 
        answer: '9 sections' 
      },
      { 
        question: 'Where should you place your subject using the rule of thirds?', 
        options: ['Center of frame', 'Along the grid lines or intersections', 'Bottom corner'], 
        answer: 'Along the grid lines or intersections' 
      }
    ]
  }
];

// Function to get a random video from subscribed courses
export const getRandomCourseVideo = () => {
  if (courseVideos.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * courseVideos.length);
  return courseVideos[randomIndex];
};

// Function to get videos by course ID
export const getVideosByCourse = (courseId) => {
  return courseVideos.filter(video => video.courseId === courseId);
};

// Function to get videos by chapter ID
export const getVideosByChapter = (chapterId) => {
  return courseVideos.filter(video => video.chapterId === chapterId);
};

// Function to get course by ID
export const getCourseById = (courseId) => {
  return subscribedCourses.find(course => course.id === courseId);
};

// Function to get chapter by ID
export const getChapterById = (chapterId) => {
  for (let course of subscribedCourses) {
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (chapter) return chapter;
  }
  return null;
};

// Enhanced Video Data with More Details (original commonVideos for non-course content)
export const commonVideos = [
  {
    id: '1',
    title: 'React Native Tutorial',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'hard',
    creator: 'Alice Dev',
    profile: 'https://randomuser.me/api/portraits/women/44.jpg',
    likes: 120,
    Comments: 0,
    followed: true,
    bio: 'Computer Science Professor & Tech Educator with 8+ years of experience. Passionate about making complex programming concepts accessible to everyone.',
    followers: 12450,
    following: 89,
    description: 'Learn how to build a full-stack app using React Native and Node.js with best practices.',
    questions: [
      { 
        question: 'What is React Native?', 
        options: ['A mobile framework', 'A web framework', 'A desktop framework'], 
        answer: 'A mobile framework' 
      },
      { 
        question: 'Which language does React Native use?', 
        options: ['JavaScript', 'Python', 'Java'], 
        answer: 'JavaScript' 
      },
      { 
        question: 'What is the main advantage of React Native?', 
        options: ['Cross-platform development', 'Better performance', 'Easier debugging'], 
        answer: 'Cross-platform development' 
      }
    ]
  },
  {
    id: '2',
    title: 'Expo Explained',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'easy',
    creator: 'Alice Dev',
    profile: 'https://randomuser.me/api/portraits/men/46.jpg',
    likes: 0,
    Comments: 100,
    followed: false,
    bio: 'Computer Science Professor & Tech Educator with 8+ years of experience. Passionate about making complex programming concepts accessible to everyone.',
    followers: 12450,
    following: 89,
    description: 'Getting started with Expo â€" the easiest way to build and deploy mobile apps using JavaScript.',
    questions: [
      { 
        question: 'What is Expo?', 
        options: ['A development tool', 'A programming language', 'A database'], 
        answer: 'A development tool' 
      },
      { 
        question: 'Which platform does Expo support?', 
        options: ['iOS only', 'Android only', 'Both iOS and Android'], 
        answer: 'Both iOS and Android' 
      },
      { 
        question: 'What is the main benefit of using Expo?', 
        options: ['Faster development', 'Better performance', 'Lower cost'], 
        answer: 'Faster development' 
      }
    ]
  },
  {
    id: '3',
    title: 'Fitness Routine',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Fitness',
    difficulty: 'intermediate',
    creator: 'FitWithLena',
    profile: 'https://randomuser.me/api/portraits/women/68.jpg',
    likes: 500,
    Comments: 25,
    followed: false,
    bio: 'Certified fitness trainer and wellness coach helping people achieve their health goals through effective workouts.',
    followers: 8900,
    following: 156,
    description: 'Follow this 30-minute full-body workout to stay energized and healthy at home.',
    questions: [
      { 
        question: 'How long is this fitness routine?', 
        options: ['15 minutes', '30 minutes', '45 minutes'], 
        answer: '30 minutes' 
      },
      { 
        question: 'What type of workout is this?', 
        options: ['Cardio only', 'Strength only', 'Full-body workout'], 
        answer: 'Full-body workout' 
      },
      { 
        question: 'What is the main goal of this routine?', 
        options: ['Build muscle', 'Lose weight', 'Stay energized and healthy'], 
        answer: 'Stay energized and healthy' 
      }
    ]
  },
  {
    id: '4',
    title: 'Nature Walk',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Nature',
    difficulty: 'easy',
    creator: 'OutdoorJules',
    profile: 'https://randomuser.me/api/portraits/men/11.jpg',
    likes: 10000000,
    Comments: 10000,
    followed: true,
    bio: 'Adventure photographer and nature enthusiast sharing the beauty of the outdoors through stunning visuals and peaceful walking tours.',
    followers: 2500000,
    following: 45,
    description: 'A peaceful walking tour through lush forests and scenic trails to clear your mind.',
    questions: [
      { 
        question: 'What type of content is this video?', 
        options: ['Fitness workout', 'Nature walk', 'Cooking tutorial'], 
        answer: 'Nature walk' 
      },
      { 
        question: 'What is the main purpose of this video?', 
        options: ['Exercise', 'Relaxation', 'Education'], 
        answer: 'Relaxation' 
      },
      { 
        question: 'What environment is featured in this video?', 
        options: ['Urban city', 'Lush forests', 'Desert landscape'], 
        answer: 'Lush forests' 
      }
    ]
  },
  {
    id: '5',
    title: 'Cooking Pasta',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Cooking',
    difficulty: 'hard',
    creator: 'Chef Marco',
    profile: 'https://randomuser.me/api/portraits/men/22.jpg',
    likes: 9,
    Comments: 10,
    followed: false,
    bio: 'Professional chef and culinary instructor sharing authentic Italian recipes and cooking techniques.',
    followers: 3200,
    following: 78,
    description: 'Master the art of Italian pasta with this detailed recipe and step-by-step cooking guide.',
    questions: [
      { 
        question: 'What cuisine is featured in this video?', 
        options: ['Italian', 'French', 'Asian'], 
        answer: 'Italian' 
      },
      { 
        question: 'What dish is being prepared?', 
        options: ['Pizza', 'Pasta', 'Risotto'], 
        answer: 'Pasta' 
      },
      { 
        question: 'What is the difficulty level of this recipe?', 
        options: ['Easy', 'Intermediate', 'Hard'], 
        answer: 'Hard' 
      }
    ]
  },
  {
    id: '6',
    title: 'Deep Focus Music',
    uri: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg',
    subject: 'Music',
    difficulty: 'easy',
    creator: 'LoFiVibes',
    profile: 'https://randomuser.me/api/portraits/women/12.jpg',
    likes: 25000,
    Comments: 500,
    followed: false,
    bio: 'Music producer and curator creating ambient sounds and lofi beats for focus and relaxation.',
    followers: 15600,
    following: 234,
    description: 'Relax and focus with this curated playlist of calming lofi beats and ambient sounds.',
    questions: [
      { 
        question: 'What type of music is featured?', 
        options: ['Rock', 'Lofi', 'Classical'], 
        answer: 'Lofi' 
      },
      { 
        question: 'What is the main purpose of this music?', 
        options: ['Dancing', 'Focus and relaxation', 'Exercise'], 
        answer: 'Focus and relaxation' 
      },
      { 
        question: 'What genre best describes this content?', 
        options: ['Ambient', 'Electronic', 'Jazz'], 
        answer: 'Ambient' 
      }
    ]
  },
  {
    id: '7',
    title: 'Backpacking Nepal',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Travel',
    difficulty: 'intermediate',
    creator: 'WanderWithRay',
    profile: 'https://randomuser.me/api/portraits/men/71.jpg',
    likes: 1200,
    Comments: 85,
    followed: false,
    bio: 'Travel vlogger and adventure seeker exploring the world\'s most beautiful destinations and sharing authentic experiences.',
    followers: 8900,
    following: 189,
    description: 'Explore the majestic landscapes and hidden trails of Nepal in this travel vlog series.',
    questions: [
      { 
        question: 'What country is featured in this video?', 
        options: ['India', 'Nepal', 'Tibet'], 
        answer: 'Nepal' 
      },
      { 
        question: 'What type of travel content is this?', 
        options: ['City tour', 'Backpacking adventure', 'Luxury travel'], 
        answer: 'Backpacking adventure' 
      },
      { 
        question: 'What landscapes are shown?', 
        options: ['Desert', 'Mountains', 'Beach'], 
        answer: 'Mountains' 
      }
    ]
  },
  {
    id: '8',
    title: 'Calm Coding Stream',
    uri: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'easy',
    creator: 'CodeFlow',
    profile: 'https://randomuser.me/api/portraits/men/33.jpg',
    likes: 800,
    Comments: 42,
    followed: false,
    bio: 'Software developer and coding instructor creating peaceful coding environments for focused learning and development.',
    followers: 6700,
    following: 123,
    description: 'Join a calm and productive coding session designed to help you stay focused and inspired.',
    questions: [
      { 
        question: 'What type of coding session is this?', 
        options: ['Fast-paced', 'Calm and productive', 'Competitive'], 
        answer: 'Calm and productive' 
      },
      { 
        question: 'What is the main goal of this stream?', 
        options: ['Entertainment', 'Focus and inspiration', 'Speed coding'], 
        answer: 'Focus and inspiration' 
      },
      { 
        question: 'What programming concept is emphasized?', 
        options: ['Speed', 'Productivity', 'Calm focus'], 
        answer: 'Calm focus' 
      }
    ]
  }
];

// Function to add new videos to the commonVideos array
export const addNewVideo = (newVideo) => {
  commonVideos.push(newVideo);
  return commonVideos;
};

// Getter functions to always return fresh copies of the arrays
export const getGeneralVideos = () => [...commonVideos];
export const getFollowedVideos = () => [...commonVideos];
export const getSavedVideos = () => [...commonVideos];
export const getFavoriteVideos = () => [...commonVideos];
export const getMyVideos = () => [...commonVideos];

// Comments data
export const mockComments = [
    {
        id: '1',
        user: 'TechLearner23',
        comment: 'This is exactly what I needed! Great explanation of the concepts.',
        timestamp: '2h ago',
        likes: 12,
        replies: 3, // This comment has 3 replies
    },
    {
        id: '2',
        user: 'CodeNewbie',
        comment: 'Could you make a follow-up video about advanced topics?',
        timestamp: '4h ago',
        likes: 8,
        replies: 1, // This comment has 1 reply
    },
    {
        id: '3',
        user: 'DevMaster',
        comment: 'Really well structured tutorial. The examples were super helpful!',
        timestamp: '6h ago',
        likes: 25,
        replies: 0, // This comment has no replies
    },
];

export const mockReplies = [
    // Replies for comment with id '1'
    {
        id: 'r1',
        user: 'VideoCreator',
        comment: 'Thanks for the feedback! I\'m glad it helped you understand the concepts better.',
        timestamp: '1h ago',
        likes: 8,
        parentCommentId: '1', // This matches comment id '1'
        isCreator: true,
    },
    {
        id: 'r2',
        user: 'AnotherViewer',
        comment: 'I agree! This tutorial saved me hours of research.',
        timestamp: '45m ago',
        likes: 5,
        parentCommentId: '1', // This matches comment id '1'
    },
    {
        id: 'r3',
        user: 'StudyBuddy',
        comment: 'The part about recursion was especially helpful!',
        timestamp: '30m ago',
        likes: 3,
        parentCommentId: '1', // This matches comment id '1'
    },
    
    // Reply for comment with id '2'
    {
        id: 'r4',
        user: 'VideoCreator',
        comment: 'Great suggestion! I\'ll add that to my content calendar.',
        timestamp: '2h ago',
        likes: 4,
        parentCommentId: '2', // This matches comment id '2'
        isCreator: true,
    },
];

// Different video categories can reuse the same base data
export const GeneralRetrivedVids = [...commonVideos];
export const FollowedRetrivedVids = [...commonVideos];
export const savedVideos = [...commonVideos];
export const favoriteVideos = [...commonVideos];
export const myVideos = [...commonVideos];

// Course-specific utility functions
export const updateCourseProgress = (courseId, newProgress) => {
    const course = subscribedCourses.find(c => c.id === courseId);
    if (course) {
        course.progress = newProgress;
    }
};

export const markChapterComplete = (chapterId) => {
    for (let course of subscribedCourses) {
        const chapter = course.chapters.find(ch => ch.id === chapterId);
        if (chapter) {
            chapter.completed = true;
            break;
        }
    }
};

export const getNextChapterVideo = (currentVideoId) => {
    const currentVideo = courseVideos.find(v => v.id === currentVideoId);
    if (!currentVideo) return null;
    
    const chapterVideos = courseVideos.filter(v => v.chapterId === currentVideo.chapterId);
    const currentIndex = chapterVideos.findIndex(v => v.id === currentVideoId);
    
    if (currentIndex < chapterVideos.length - 1) {
        return chapterVideos[currentIndex + 1];
    }
    
    // If last video in chapter, get first video of next chapter
    const course = getCourseById(currentVideo.courseId);
    if (!course) return null;
    
    const currentChapterIndex = course.chapters.findIndex(ch => ch.id === currentVideo.chapterId);
    if (currentChapterIndex < course.chapters.length - 1) {
        const nextChapter = course.chapters[currentChapterIndex + 1];
        const nextChapterVideos = courseVideos.filter(v => v.chapterId === nextChapter.id);
        return nextChapterVideos.length > 0 ? nextChapterVideos[0] : null;
    }
    
    return null; // End of course
};