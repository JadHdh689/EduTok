export const user = "creator";

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
    creator: 'Bob Coder',
    profile: 'https://randomuser.me/api/portraits/men/46.jpg',
    likes: 0,
    Comments: 100,
    description: 'Getting started with Expo — the easiest way to build and deploy mobile apps using JavaScript.',
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
    description: 'A peaceful walking tour through lush forests and scenic trails to clear your mind.'
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
    description: 'Master the art of Italian pasta with this detailed recipe and step-by-step cooking guide.'
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
    description: 'Relax and focus with this curated playlist of calming lofi beats and ambient sounds.'
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
    description: 'Explore the majestic landscapes and hidden trails of Nepal in this travel vlog series.'
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
    description: 'Join a calm and productive coding session designed to help you stay focused and inspired.'
  }
];

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
    // ... other comments
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