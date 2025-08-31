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

// Real Video Data from mockVideos folder
export const realVideos = [
  {
    id: 'engineer_1',
    title: 'Engineering Fundamentals',
    videoPath: '/mockVideos/engineer.mp4',
    uri: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Engineering',
    difficulty: 'intermediate',
    creator: 'Dr. Michael Torres',
    profile: 'https://randomuser.me/api/portraits/men/45.jpg',
    likes: 1850,
    Comments: 234,
    followed: false,
    bio: 'Mechanical Engineering Professor with 15+ years in automotive design and manufacturing.',
    followers: 8900,
    following: 156,
    description: 'Comprehensive introduction to engineering principles, problem-solving methodologies, and real-world applications in modern technology.',
    questions: [
      { 
        question: 'What is the engineering design process?', 
        options: ['A random approach', 'A systematic problem-solving method', 'A creative art form'], 
        answer: 'A systematic problem-solving method' 
      },
      { 
        question: 'Which is the first step in engineering design?', 
        options: ['Build a prototype', 'Identify the problem', 'Test the solution'], 
        answer: 'Identify the problem' 
      },
      { 
        question: 'What does CAD stand for in engineering?', 
        options: ['Computer Aided Design', 'Creative Art Development', 'Complex Algorithm Design'], 
        answer: 'Computer Aided Design' 
      }
    ]
  },
  {
    id: 'premed_1',
    title: 'Pre-Medical Studies Overview',
    videoPath: '/mockVideos/premed.mp4',
    uri: 'https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Medicine',
    difficulty: 'hard',
    creator: 'Dr. Emily Watson',
    profile: 'https://randomuser.me/api/portraits/women/67.jpg',
    likes: 2100,
    Comments: 189,
    followed: true,
    bio: 'Medical Doctor and educator helping pre-med students navigate their journey to medical school.',
    followers: 15600,
    following: 78,
    description: 'Essential guide for pre-medical students covering MCAT preparation, medical school applications, and career pathways in medicine.',
    questions: [
      { 
        question: 'What is the MCAT?', 
        options: ['Medical Career Assessment Test', 'Medical College Admission Test', 'Medical Certification Aptitude Test'], 
        answer: 'Medical College Admission Test' 
      },
      { 
        question: 'How long is medical school in the US?', 
        options: ['3 years', '4 years', '5 years'], 
        answer: '4 years' 
      },
      { 
        question: 'What GPA is typically competitive for medical school?', 
        options: ['2.5+', '3.0+', '3.7+'], 
        answer: '3.7+' 
      }
    ]
  },
  {
    id: 'physics_1',
    title: 'Physics Principles Explained',
    videoPath: '/mockVideos/physics.mp4',
    uri: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Physics',
    difficulty: 'hard',
    creator: 'Prof. David Kim',
    profile: 'https://randomuser.me/api/portraits/men/28.jpg',
    likes: 3200,
    Comments: 445,
    followed: true,
    bio: 'Physics Professor specializing in quantum mechanics and theoretical physics. Making complex concepts accessible.',
    followers: 25600,
    following: 34,
    description: 'Deep dive into fundamental physics principles including mechanics, thermodynamics, and electromagnetic theory with practical examples.',
    questions: [
      { 
        question: 'What is Newton\'s First Law of Motion?', 
        options: ['F = ma', 'An object at rest stays at rest unless acted upon', 'For every action there is an equal reaction'], 
        answer: 'An object at rest stays at rest unless acted upon' 
      },
      { 
        question: 'What is the speed of light in vacuum?', 
        options: ['3 × 10^8 m/s', '3 × 10^6 m/s', '3 × 10^10 m/s'], 
        answer: '3 × 10^8 m/s' 
      },
      { 
        question: 'What does E=mc² represent?', 
        options: ['Energy equals mass times velocity squared', 'Energy equals mass times speed of light squared', 'Energy equals momentum times acceleration'], 
        answer: 'Energy equals mass times speed of light squared' 
      }
    ]
  },
  {
    id: 'biology_1',
    title: 'Cell Biology Fundamentals',
    videoPath: '/mockVideos/biology.mp4',
    uri: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Biology',
    difficulty: 'intermediate',
    creator: 'Dr. Lisa Park',
    profile: 'https://randomuser.me/api/portraits/women/55.jpg',
    likes: 1650,
    Comments: 298,
    followed: false,
    bio: 'Molecular Biologist and researcher with expertise in cell biology, genetics, and biotechnology applications.',
    followers: 11200,
    following: 145,
    description: 'Explore the fascinating world of cells, from basic structure to complex cellular processes and their role in living organisms.',
    questions: [
      { 
        question: 'What is the powerhouse of the cell?', 
        options: ['Nucleus', 'Mitochondria', 'Ribosome'], 
        answer: 'Mitochondria' 
      },
      { 
        question: 'What process do plants use to make food?', 
        options: ['Respiration', 'Photosynthesis', 'Digestion'], 
        answer: 'Photosynthesis' 
      },
      { 
        question: 'What contains the genetic material in a cell?', 
        options: ['Cytoplasm', 'Cell membrane', 'Nucleus'], 
        answer: 'Nucleus' 
      }
    ]
  },
  {
    id: 'cs_1',
    title: 'Computer Science Essentials',
    videoPath: '/mockVideos/computer science.mp4',
    uri: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    creator: 'Prof. James Liu',
    profile: 'https://randomuser.me/api/portraits/men/62.jpg',
    likes: 2800,
    Comments: 567,
    followed: true,
    bio: 'Computer Science Professor and software architect with expertise in algorithms, data structures, and system design.',
    followers: 18900,
    following: 67,
    description: 'Comprehensive overview of computer science fundamentals including algorithms, data structures, and programming paradigms.',
    questions: [
      { 
        question: 'What is an algorithm?', 
        options: ['A programming language', 'A step-by-step procedure to solve a problem', 'A type of computer'], 
        answer: 'A step-by-step procedure to solve a problem' 
      },
      { 
        question: 'Which data structure follows LIFO principle?', 
        options: ['Queue', 'Stack', 'Array'], 
        answer: 'Stack' 
      },
      { 
        question: 'What does OOP stand for?', 
        options: ['Object Oriented Programming', 'Open Online Platform', 'Optimal Operation Process'], 
        answer: 'Object Oriented Programming' 
      }
    ]
  }
];

// Course Data Structure with Real Videos
export const subscribedCourses = [
  {
    id: 'course_engineering',
    title: 'Engineering Fundamentals',
    creator: 'Dr. Michael Torres',
    creatorProfile: 'https://randomuser.me/api/portraits/men/45.jpg',
    subject: 'Engineering',
    difficulty: 'intermediate',
    description: 'Complete engineering course covering design principles, problem-solving, and practical applications',
    thumbnailUrl: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=800',
    totalChapters: 3,
    enrolledStudents: 1850,
    rating: 4.7,
    progress: 45,
    chapters: [
      {
        id: 'chapter_eng_1',
        courseId: 'course_engineering',
        chapterNumber: 1,
        title: 'Engineering Design Process',
        description: 'Learn systematic approach to engineering problem solving',
        totalVideos: 1,
        completed: false,
        videos: ['engineer_1']
      },
      {
        id: 'chapter_eng_2',
        courseId: 'course_engineering',
        chapterNumber: 2,
        title: 'Materials and Manufacturing',
        description: 'Understanding materials science and manufacturing processes',
        totalVideos: 1,
        completed: false,
        videos: ['engineer_1']
      },
      {
        id: 'chapter_eng_3',
        courseId: 'course_engineering',
        chapterNumber: 3,
        title: 'Project Management',
        description: 'Engineering project planning and execution',
        totalVideos: 1,
        completed: false,
        videos: ['engineer_1']
      }
    ]
  },
  {
    id: 'course_premed',
    title: 'Pre-Medical Studies',
    creator: 'Dr. Emily Watson',
    creatorProfile: 'https://randomuser.me/api/portraits/women/67.jpg',
    subject: 'Medicine',
    difficulty: 'hard',
    description: 'Comprehensive pre-medical preparation including MCAT prep and medical school guidance',
    thumbnailUrl: 'https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&cs=tinysrgb&w=800',
    totalChapters: 4,
    enrolledStudents: 2100,
    rating: 4.9,
    progress: 25,
    chapters: [
      {
        id: 'chapter_premed_1',
        courseId: 'course_premed',
        chapterNumber: 1,
        title: 'MCAT Preparation',
        description: 'Complete MCAT study guide and test strategies',
        totalVideos: 1,
        completed: false,
        videos: ['premed_1']
      },
      {
        id: 'chapter_premed_2',
        courseId: 'course_premed',
        chapterNumber: 2,
        title: 'Medical School Applications',
        description: 'Navigate the medical school application process',
        totalVideos: 1,
        completed: false,
        videos: ['premed_1']
      },
      {
        id: 'chapter_premed_3',
        courseId: 'course_premed',
        chapterNumber: 3,
        title: 'Clinical Experience',
        description: 'Gaining valuable clinical and research experience',
        totalVideos: 1,
        completed: false,
        videos: ['premed_1']
      },
      {
        id: 'chapter_premed_4',
        courseId: 'course_premed',
        chapterNumber: 4,
        title: 'Interview Preparation',
        description: 'Medical school interview tips and practice',
        totalVideos: 1,
        completed: false,
        videos: ['premed_1']
      }
    ]
  },
  {
    id: 'course_physics',
    title: 'Physics Mastery',
    creator: 'Prof. David Kim',
    creatorProfile: 'https://randomuser.me/api/portraits/men/28.jpg',
    subject: 'Physics',
    difficulty: 'hard',
    description: 'Advanced physics concepts from classical mechanics to quantum theory',
    thumbnailUrl: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=800',
    totalChapters: 5,
    enrolledStudents: 3200,
    rating: 4.8,
    progress: 60,
    chapters: [
      {
        id: 'chapter_physics_1',
        courseId: 'course_physics',
        chapterNumber: 1,
        title: 'Classical Mechanics',
        description: 'Newton\'s laws and motion principles',
        totalVideos: 1,
        completed: true,
        videos: ['physics_1']
      },
      {
        id: 'chapter_physics_2',
        courseId: 'course_physics',
        chapterNumber: 2,
        title: 'Thermodynamics',
        description: 'Heat, energy, and thermal processes',
        totalVideos: 1,
        completed: false,
        videos: ['physics_1']
      },
      {
        id: 'chapter_physics_3',
        courseId: 'course_physics',
        chapterNumber: 3,
        title: 'Electromagnetism',
        description: 'Electric and magnetic fields and forces',
        totalVideos: 1,
        completed: false,
        videos: ['physics_1']
      },
      {
        id: 'chapter_physics_4',
        courseId: 'course_physics',
        chapterNumber: 4,
        title: 'Wave Physics',
        description: 'Sound, light, and wave phenomena',
        totalVideos: 1,
        completed: false,
        videos: ['physics_1']
      },
      {
        id: 'chapter_physics_5',
        courseId: 'course_physics',
        chapterNumber: 5,
        title: 'Quantum Mechanics',
        description: 'Introduction to quantum theory and applications',
        totalVideos: 1,
        completed: false,
        videos: ['physics_1']
      }
    ]
  },
  {
    id: 'course_biology',
    title: 'Biology Comprehensive',
    creator: 'Dr. Lisa Park',
    creatorProfile: 'https://randomuser.me/api/portraits/women/55.jpg',
    subject: 'Biology',
    difficulty: 'intermediate',
    description: 'Complete biology course from cellular level to ecosystem dynamics',
    thumbnailUrl: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    totalChapters: 4,
    enrolledStudents: 1650,
    rating: 4.6,
    progress: 75,
    chapters: [
      {
        id: 'chapter_bio_1',
        courseId: 'course_biology',
        chapterNumber: 1,
        title: 'Cell Biology',
        description: 'Structure and function of cells',
        totalVideos: 1,
        completed: true,
        videos: ['biology_1']
      },
      {
        id: 'chapter_bio_2',
        courseId: 'course_biology',
        chapterNumber: 2,
        title: 'Genetics',
        description: 'DNA, RNA, and heredity principles',
        totalVideos: 1,
        completed: true,
        videos: ['biology_1']
      },
      {
        id: 'chapter_bio_3',
        courseId: 'course_biology',
        chapterNumber: 3,
        title: 'Evolution',
        description: 'Natural selection and evolutionary biology',
        totalVideos: 1,
        completed: false,
        videos: ['biology_1']
      },
      {
        id: 'chapter_bio_4',
        courseId: 'course_biology',
        chapterNumber: 4,
        title: 'Ecology',
        description: 'Ecosystems and environmental interactions',
        totalVideos: 1,
        completed: false,
        videos: ['biology_1']
      }
    ]
  },
  {
    id: 'course_cs',
    title: 'Computer Science Fundamentals',
    creator: 'Prof. James Liu',
    creatorProfile: 'https://randomuser.me/api/portraits/men/62.jpg',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    description: 'Essential computer science concepts including algorithms, data structures, and programming',
    thumbnailUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    totalChapters: 6,
    enrolledStudents: 2800,
    rating: 4.8,
    progress: 40,
    chapters: [
      {
        id: 'chapter_cs_1',
        courseId: 'course_cs',
        chapterNumber: 1,
        title: 'Programming Basics',
        description: 'Introduction to programming concepts and logic',
        totalVideos: 1,
        completed: true,
        videos: ['cs_1']
      },
      {
        id: 'chapter_cs_2',
        courseId: 'course_cs',
        chapterNumber: 2,
        title: 'Data Structures',
        description: 'Arrays, linked lists, stacks, and queues',
        totalVideos: 1,
        completed: false,
        videos: ['cs_1']
      },
      {
        id: 'chapter_cs_3',
        courseId: 'course_cs',
        chapterNumber: 3,
        title: 'Algorithms',
        description: 'Sorting, searching, and optimization algorithms',
        totalVideos: 1,
        completed: false,
        videos: ['cs_1']
      },
      {
        id: 'chapter_cs_4',
        courseId: 'course_cs',
        chapterNumber: 4,
        title: 'Object-Oriented Programming',
        description: 'Classes, objects, inheritance, and polymorphism',
        totalVideos: 1,
        completed: false,
        videos: ['cs_1']
      },
      {
        id: 'chapter_cs_5',
        courseId: 'course_cs',
        chapterNumber: 5,
        title: 'Database Systems',
        description: 'SQL, database design, and data management',
        totalVideos: 1,
        completed: false,
        videos: ['cs_1']
      },
      {
        id: 'chapter_cs_6',
        courseId: 'course_cs',
        chapterNumber: 6,
        title: 'Software Engineering',
        description: 'Development methodologies and best practices',
        totalVideos: 1,
        completed: false,
        videos: ['cs_1']
      }
    ]
  }
];

// Course Videos Data (mapped from real videos)
export const courseVideos = [
  // Engineering Course Videos
  {
    id: 'video_eng_1_1',
    courseId: 'course_engineering',
    chapterId: 'chapter_eng_1',
    chapterNumber: 1,
    courseName: 'Engineering Fundamentals',
    courseProgress: 45,
    title: 'Engineering Design Process',
    videoPath: '/mockVideos/engineer.mp4',
    uri: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Engineering',
    difficulty: 'intermediate',
    creator: 'Dr. Michael Torres',
    profile: 'https://randomuser.me/api/portraits/men/45.jpg',
    likes: 1850,
    Comments: 234,
    followed: false,
    bio: 'Mechanical Engineering Professor with 15+ years in automotive design.',
    followers: 8900,
    following: 156,
    description: 'Learn the systematic approach to engineering problem solving and design methodology.',
    questions: [
      { 
        question: 'What is the first step in engineering design?', 
        options: ['Build prototype', 'Identify problem', 'Test solution'], 
        answer: 'Identify problem' 
      }
    ]
  },
  // Pre-Med Course Videos
  {
    id: 'video_premed_1_1',
    courseId: 'course_premed',
    chapterId: 'chapter_premed_1',
    chapterNumber: 1,
    courseName: 'Pre-Medical Studies',
    courseProgress: 25,
    title: 'MCAT Preparation Strategy',
    videoPath: '/mockVideos/premed.mp4',
    uri: 'https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Medicine',
    difficulty: 'hard',
    creator: 'Dr. Emily Watson',
    profile: 'https://randomuser.me/api/portraits/women/67.jpg',
    likes: 2100,
    Comments: 189,
    followed: true,
    bio: 'Medical Doctor helping pre-med students succeed.',
    followers: 15600,
    following: 78,
    description: 'Comprehensive MCAT preparation strategy and study techniques for medical school admission.',
    questions: [
      { 
        question: 'How long should you study for the MCAT?', 
        options: ['1-2 months', '3-6 months', '1 year'], 
        answer: '3-6 months' 
      }
    ]
  },
  // Physics Course Videos
  {
    id: 'video_physics_1_1',
    courseId: 'course_physics',
    chapterId: 'chapter_physics_1',
    chapterNumber: 1,
    courseName: 'Physics Mastery',
    courseProgress: 60,
    title: 'Classical Mechanics Fundamentals',
    videoPath: '/mockVideos/physics.mp4',
    uri: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Physics',
    difficulty: 'hard',
    creator: 'Prof. David Kim',
    profile: 'https://randomuser.me/api/portraits/men/28.jpg',
    likes: 3200,
    Comments: 445,
    followed: true,
    bio: 'Physics Professor specializing in quantum mechanics.',
    followers: 25600,
    following: 34,
    description: 'Master the fundamental principles of classical mechanics and motion.',
    questions: [
      { 
        question: 'What is Newton\'s Second Law?', 
        options: ['F = ma', 'E = mc²', 'v = d/t'], 
        answer: 'F = ma' 
      }
    ]
  },
  // Biology Course Videos
  {
    id: 'video_bio_1_1',
    courseId: 'course_biology',
    chapterId: 'chapter_bio_1',
    chapterNumber: 1,
    courseName: 'Biology Comprehensive',
    courseProgress: 75,
    title: 'Cell Structure and Function',
    videoPath: '/mockVideos/biology.mp4',
    uri: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Biology',
    difficulty: 'intermediate',
    creator: 'Dr. Lisa Park',
    profile: 'https://randomuser.me/api/portraits/women/55.jpg',
    likes: 1650,
    Comments: 298,
    followed: false,
    bio: 'Molecular Biologist and researcher.',
    followers: 11200,
    following: 145,
    description: 'Explore cellular structure and the fundamental processes of life.',
    questions: [
      { 
        question: 'What controls cell activities?', 
        options: ['Mitochondria', 'Nucleus', 'Cytoplasm'], 
        answer: 'Nucleus' 
      }
    ]
  },
  // Computer Science Course Videos
  {
    id: 'video_cs_1_1',
    courseId: 'course_cs',
    chapterId: 'chapter_cs_1',
    chapterNumber: 1,
    courseName: 'Computer Science Fundamentals',
    courseProgress: 40,
    title: 'Programming Logic and Algorithms',
    videoPath: '/mockVideos/computer science.mp4',
    uri: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    creator: 'Prof. James Liu',
    profile: 'https://randomuser.me/api/portraits/men/62.jpg',
    likes: 2800,
    Comments: 567,
    followed: true,
    bio: 'Computer Science Professor and software architect.',
    followers: 18900,
    following: 67,
    description: 'Master programming logic and fundamental algorithms for software development.',
    questions: [
      { 
        question: 'What is computational thinking?', 
        options: ['Using computers', 'Problem-solving approach', 'Programming language'], 
        answer: 'Problem-solving approach' 
      }
    ]
  }
];

// Enhanced Video Data with Real Videos (for FYP and other feeds)
export const commonVideos = [
  ...realVideos,
  // Mix of different videos for variety
  {
    id: 'mix_1',
    title: 'Study Tips for STEM',
    videoPath: '/mockVideos/premed.mp4',
    uri: 'https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Education',
    difficulty: 'easy',
    creator: 'StudyGuru',
    profile: 'https://randomuser.me/api/portraits/women/23.jpg',
    likes: 950,
    Comments: 156,
    followed: false,
    bio: 'Academic coach helping students excel in STEM subjects.',
    followers: 5600,
    following: 234,
    description: 'Effective study strategies and time management techniques for science and engineering students.',
    questions: [
      { 
        question: 'What is the most effective study technique?', 
        options: ['Passive reading', 'Active recall', 'Highlighting'], 
        answer: 'Active recall' 
      },
      { 
        question: 'How often should you review material?', 
        options: ['Once', 'Daily', 'Spaced intervals'], 
        answer: 'Spaced intervals' 
      }
    ]
  },
  {
    id: 'mix_2',
    title: 'Lab Safety Protocols',
    videoPath: '/mockVideos/biology.mp4',
    uri: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    subject: 'Safety',
    difficulty: 'easy',
    creator: 'SafetyFirst',
    profile: 'https://randomuser.me/api/portraits/men/41.jpg',
    likes: 720,
    Comments: 89,
    followed: false,
    bio: 'Laboratory safety specialist ensuring safe research environments.',
    followers: 3400,
    following: 67,
    description: 'Essential laboratory safety protocols and procedures for all science students and researchers.',
    questions: [
      { 
        question: 'What should you wear in a chemistry lab?', 
        options: ['Casual clothes', 'Safety goggles and lab coat', 'Just gloves'], 
        answer: 'Safety goggles and lab coat' 
      },
      { 
        question: 'What do you do if chemicals spill?', 
        options: ['Ignore it', 'Clean immediately following protocol', 'Leave the lab'], 
        answer: 'Clean immediately following protocol' 
      }
    ]
  }
];

// Different video combinations for profile tabs
export const savedVideos = [
  realVideos[0], // Engineering
  realVideos[2], // Physics
  realVideos[4], // Computer Science
  commonVideos[5], // Study Tips
];

export const favoriteVideos = [
  realVideos[1], // Pre-med
  realVideos[3], // Biology
  realVideos[4], // Computer Science
  commonVideos[6], // Lab Safety
];

export const myVideos = [
  realVideos[0], // Engineering
  realVideos[1], // Pre-med
  realVideos[2], // Physics
];

// Function to get a random video from course videos
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

// Comments data
export const mockComments = [
    {
        id: '1',
        user: 'TechLearner23',
        comment: 'This is exactly what I needed! Great explanation of the concepts.',
        timestamp: '2h ago',
        likes: 12,
        replies: 3,
    },
    {
        id: '2',
        user: 'CodeNewbie',
        comment: 'Could you make a follow-up video about advanced topics?',
        timestamp: '4h ago',
        likes: 8,
        replies: 1,
    },
    {
        id: '3',
        user: 'DevMaster',
        comment: 'Really well structured tutorial. The examples were super helpful!',
        timestamp: '6h ago',
        likes: 25,
        replies: 0,
    },
];

export const mockReplies = [
    {
        id: 'r1',
        user: 'VideoCreator',
        comment: 'Thanks for the feedback! I\'m glad it helped you understand the concepts better.',
        timestamp: '1h ago',
        likes: 8,
        parentCommentId: '1',
        isCreator: true,
    },
    {
        id: 'r2',
        user: 'AnotherViewer',
        comment: 'I agree! This tutorial saved me hours of research.',
        timestamp: '45m ago',
        likes: 5,
        parentCommentId: '1',
    },
    {
        id: 'r3',
        user: 'StudyBuddy',
        comment: 'The part about recursion was especially helpful!',
        timestamp: '30m ago',
        likes: 3,
        parentCommentId: '1',
    },
    {
        id: 'r4',
        user: 'VideoCreator',
        comment: 'Great suggestion! I\'ll add that to my content calendar.',
        timestamp: '2h ago',
        likes: 4,
        parentCommentId: '2',
        isCreator: true,
    },
];

// Different video categories with varied combinations
export const GeneralRetrivedVids = [
  ...realVideos,
  ...commonVideos.slice(5) // Mix in the additional videos
];

export const FollowedRetrivedVids = [
  realVideos[1], // Pre-med (followed)
  realVideos[2], // Physics (followed)
  realVideos[4], // Computer Science (followed)
  commonVideos[5], // Study Tips
];

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
    
    const course = getCourseById(currentVideo.courseId);
    if (!course) return null;
    
    const currentChapterIndex = course.chapters.findIndex(ch => ch.id === currentVideo.chapterId);
    if (currentChapterIndex < course.chapters.length - 1) {
        const nextChapter = course.chapters[currentChapterIndex + 1];
        const nextChapterVideos = courseVideos.filter(v => v.chapterId === nextChapter.id);
        return nextChapterVideos.length > 0 ? nextChapterVideos[0] : null;
    }
    
    return null;
};

// Getter functions for different video feeds
export const getGeneralVideos = () => [...GeneralRetrivedVids];
export const getFollowedVideos = () => [...FollowedRetrivedVids];
export const getSavedVideos = () => [...savedVideos];
export const getFavoriteVideos = () => [...favoriteVideos];
export const getMyVideos = () => [...myVideos];