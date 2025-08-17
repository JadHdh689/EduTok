export const user = "creator";

const commonVideos = [
  {
    id: '1',
    title: 'React Native Tutorial',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'hard',
    creator: 'Alice Dev',
    likes: 120,
    Comments: 0,
    followed: true,
    description: 'Learn how to build a full-stack app using React Native and Node.js with best practices.'
  },
  {
    id: '2',
    title: 'Expo Explained',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'easy',
    creator: 'Bob Coder',
    likes: 0,
    Comments: 100,
    description: 'Getting started with Expo — the easiest way to build and deploy mobile apps using JavaScript.'
  },
  {
    id: '3',
    title: 'Fitness Routine',
    uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg',
    subject: 'Fitness',
    difficulty: 'intermediate',
    creator: 'FitWithLena',
    likes: 500,
    Comments: 25,
    description: 'Follow this 30-minute full-body workout to stay energized and healthy at home.'
  },
  {
    id: '4',
    title: 'Nature Walk',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Nature',
    difficulty: 'easy',
    creator: 'OutdoorJules',
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
    likes: 800,
    Comments: 42,
    description: 'Join a calm and productive coding session designed to help you stay focused and inspired.'
  }
];

// Different video categories can reuse the same base data with slight modifications
export const GeneralRetrivedVids = [...commonVideos];
export const FollowedRetrivedVids = [...commonVideos];
export const savedVideos = [...commonVideos];
export const favoriteVideos = [...commonVideos];
export const myVideos = [...commonVideos];