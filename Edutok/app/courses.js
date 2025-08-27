import { Image, FlatList, useWindowDimensions, View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';

// Components
import Footer from '../src/components/footer';
import Report from '../src/components/Report';

// Constants
import { colors, fonts, maxCharacters, getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock Data - Will be replaced with API calls
import { subscribedCourses, getRandomCourseVideo } from '../src/mockData';

function Courses() {
    // State Management
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [watchedVideos, setWatchedVideos] = useState(new Set());
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResults, setQuizResults] = useState({});

    // Navigation
    const router = useRouter();

    // Refs
    const flatListRef = useRef(null);

    // Interaction States
    const [expandMap, setExpandMap] = useState({});
    const [likedMap, setLikedMap] = useState({});
    const [likesMap, setLikesMap] = useState({});
    const [savedMap, setSavedMap] = useState({});
    const [followedMap, setFollowedMap] = useState({});
    const [isReportPopupVisibleMap, setIsReportPopupVisibleMap] = useState({});

    // Layout Calculations
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Initialize videos from subscribed courses
    useEffect(() => {
        const initialVideos = [];
        for (let i = 0; i < 10; i++) { // Load 10 random videos initially
            const video = getRandomCourseVideo();
            if (video) {
                initialVideos.push(video);
            }
        }
        setVideos(initialVideos);
    }, []);

    // Memoized callback for viewable items changed
    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentVideoIndex(viewableItems[0].index);
        }
    }, []);

    // Viewability config
    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    // Handle video end - trigger forced quiz
    const handleVideoEnd = (videoId) => {
        if (watchedVideos.has(videoId)) return; // Already watched

        setWatchedVideos(prev => new Set([...prev, videoId]));

        const currentVideo = videos.find(v => v.id === videoId);
        if (currentVideo && currentVideo.questions && currentVideo.questions.length > 0) {
            setCurrentQuiz(currentVideo);
            setShowQuizModal(true);
            setQuizAnswers({});
            setQuizSubmitted(false);
            setQuizResults({});
        } else {
            // No quiz for this video, load next video
            loadNextVideo();
        }
    };

    // Load next video in sequence
    const loadNextVideo = () => {
        const nextVideo = getRandomCourseVideo();
        if (nextVideo) {
            setVideos(prev => [...prev, nextVideo]);
        }
    };

    // Handle quiz submission
    const handleQuizSubmit = () => {
        if (!currentQuiz) return;

        const results = {};
        let correctCount = 0;

        currentQuiz.questions.forEach((q) => {
            const userAnswer = quizAnswers[q.question];
            const correctAnswer = q.answer;
            const isCorrect = userAnswer === correctAnswer;

            results[q.question] = {
                correct: isCorrect,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer
            };

            if (isCorrect) correctCount++;
        });

        setQuizResults(results);
        setQuizSubmitted(true);

        // Update course progress (this would be an API call in real app)
        console.log(`Course progress updated for video ${currentQuiz.id}`);
        console.log(`Quiz score: ${correctCount}/${currentQuiz.questions.length}`);
    };

    // Close quiz and continue
    const closeQuiz = () => {
        setShowQuizModal(false);
        setCurrentQuiz(null);
        loadNextVideo();
    };

    // Text Utilities
    const textSlice = (text, needsExpansion, isExpanded) => {
        if (needsExpansion) {
            return !isExpanded ? text.slice(0, maxCharacters) + "..." : text;
        }
        return text;
    };

    const handleLikesAndComments = (num) => {
        if (num > 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        } else if (num > 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        } else if (num === 0) {
            return;
        }
        return num;
    };

    // Video Item Renderer
    const renderVideoItem = ({ item, index }) => {
        const id = item.id;
        const isLiked = likedMap[id] || false;
        const likesCount = likesMap[id] ?? item.likes;
        const isSaved = savedMap[id] || false;
        const isFollowed = followedMap[id] ?? item.followed;
        const needsExpansion = item.description && item.description.length > maxCharacters;
        const isExpanded = expandMap[id] || false;
        const isReportPopupVisible = isReportPopupVisibleMap[id] || false;

        return (
            <SafeAreaView style={{ flex: 1, height: height }}>
                {/* Video Content with Overlay */}
                <TouchableOpacity
                    onPress={() => {
                        // Simulate video end after 3 seconds for demo
                        setTimeout(() => {
                            handleVideoEnd(id);
                        }, 3000);
                    }}
                    activeOpacity={1}
                    style={styles.videoContainer}
                >
                    <Image
                        source={{ uri: item.uri }}
                        style={[styles.thumbnail, { width: width, height: height * 0.97 }]}
                        resizeMode="cover"
                    />
                    {/* Dark overlay for better text readability */}
                    <View style={[styles.darkOverlay, { width: width, height: height * 0.97 }]} />
                </TouchableOpacity>

                {/* Modern Course Progress Card */}
                <View style={[styles.courseProgressCard, { width: width - 30 }]}>
                    <View style={styles.courseProgressContent}>
                        <View style={styles.courseInfoRow}>
                            <View style={styles.courseIconContainer}>
                                <MaterialIcons name="school" size={16} color="#ffffff" />
                            </View>
                            <Text style={styles.courseProgressText}>
                                {item.courseName} - Chapter {item.chapterNumber}
                            </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${item.courseProgress || 0}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressPercentage}>{item.courseProgress || 0}%</Text>
                        </View>
                    </View>
                </View>

                {/* Enhanced Video Info Container */}
                <View style={[styles.videoInfoContainer, { width: width, bottom: insets.bottom + 20 }]}>
                    {/* Left Side - Video Details */}
                    <View style={[styles.videoDetails, { minHeight: height * 0.15, width: width * 0.75 }]}>
                        <View style={styles.creatorRow}>
                            <TouchableOpacity 
                                onPress={() => router.push({
                                    pathname: 'creatorPage',
                                    params: {
                                        creator: item.creator,
                                        profile: item.profile,
                                        followed: item.followed,
                                        followers: item.followers,
                                        following: item.following,
                                        bio: item.bio
                                    }
                                })}
                                style={styles.profileContainer}
                            >
                                <Image
                                    source={{ uri: item.profile }}
                                    style={styles.profileImage}
                                />
                                <View style={styles.onlineIndicator} />
                            </TouchableOpacity>
                            
                            <View style={styles.creatorInfo}>
                                <Text style={styles.creatorText}>{item.creator}</Text>
                                <TouchableOpacity 
                                    onPress={() => setFollowedMap(prev => ({ ...prev, [id]: !isFollowed }))}
                                    style={[styles.followButton, isFollowed ? styles.followingButton : styles.notFollowingButton]}
                                >
                                    <Text style={[styles.followButtonText, isFollowed ? styles.followingText : styles.notFollowingText]}>
                                        {isFollowed ? "Following" : "+ Follow"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={() => setExpandMap(prev => ({ ...prev, [id]: !isExpanded }))}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.descriptionText}>
                                {textSlice(item.description, needsExpansion, isExpanded)}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.tagsContainer}>
                            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                                <Text style={styles.difficultyText}>{item.difficulty}</Text>
                            </View>
                            <Text style={styles.tagsText}>
                                #{item.subject}
                            </Text>
                        </View>
                    </View>

                    {/* Enhanced Action Bar */}
                    <View style={styles.actionBar}>
                        {/* Like Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                setLikedMap(prev => ({ ...prev, [id]: !isLiked }));
                                setLikesMap(prev => ({ ...prev, [id]: isLiked ? likesCount - 1 : likesCount + 1 }));
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, isLiked && styles.likedContainer]}>
                                <AntDesign
                                    name={isLiked ? "heart" : "hearto"}
                                    size={22}
                                    color="#ffffff"
                                />
                            </View>
                            <Text style={styles.actionCount}>
                                {handleLikesAndComments(likesCount)}
                            </Text>
                        </TouchableOpacity>

                        {/* Course Info Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push({
                                pathname: '/courseDetails',
                                params: { courseId: item.courseId }
                            })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.actionIconContainer}>
                                <MaterialIcons
                                    name="school"
                                    size={22}
                                    color="#ffffff"
                                />
                            </View>
                            <Text style={styles.actionCount}>Course</Text>
                        </TouchableOpacity>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setSavedMap(prev => ({ ...prev, [id]: !isSaved }))}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, isSaved && styles.savedContainer]}>
                                <Fontisto
                                    name={isSaved ? "bookmark-alt" : "bookmark"}
                                    size={20}
                                    color="#ffffff"
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Report Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsReportPopupVisibleMap(prev => ({ ...prev, [id]: !isReportPopupVisible }))}
                            activeOpacity={0.7}
                        >
                            <View style={styles.actionIconContainer}>
                                <MaterialIcons
                                    name="report-gmailerrorred"
                                    size={22}
                                    color="#ffffff"
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Report Popup */}
                {isReportPopupVisible && (
                    <Report
                        isVisible={isReportPopupVisible}
                        onClose={() => setIsReportPopupVisibleMap(prev => ({ ...prev, [id]: false }))}
                    />
                )}
            </SafeAreaView>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Video List */}
                <FlatList
                    ref={flatListRef}
                    data={videos}
                    renderItem={renderVideoItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.videoList}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={height}
                    snapToAlignment="start"
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={2}
                    initialNumToRender={1}
                    windowSize={3}
                />

                {/* Modern Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.titleContainer}>
                            <Ionicons name="library" size={20} color="#ffffff" />
                            <Text style={styles.title}>My Courses</Text>
                        </View>
                    </View>
                </View>

                {/* Enhanced Quiz Modal */}
                <Modal
                    visible={showQuizModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.quizModalOverlay}>
                        <View style={styles.quizContainer}>
                            <View style={styles.quizHeader}>
                                <View style={styles.quizIconContainer}>
                                    <MaterialIcons name="quiz" size={24} color="#6366f1" />
                                </View>
                                <Text style={styles.quizTitle}>Complete Quiz to Continue</Text>
                                <Text style={styles.quizSubtitle}>Answer all questions to unlock the next lesson</Text>
                            </View>

                            {currentQuiz && currentQuiz.questions.map((question, index) => (
                                <View key={index} style={styles.questionContainer}>
                                    <View style={styles.questionHeader}>
                                        <Text style={styles.questionNumber}>Question {index + 1}</Text>
                                        <Text style={styles.questionText}>{question.question}</Text>
                                    </View>
                                    
                                    <View style={styles.optionsContainer}>
                                        {question.options.map((option, optionIndex) => (
                                            <TouchableOpacity
                                                key={option}
                                                style={[
                                                    styles.optionButton,
                                                    quizAnswers[question.question] === option && styles.selectedOption,
                                                    quizSubmitted && question.answer === option && styles.correctOption,
                                                    quizSubmitted &&
                                                    quizAnswers[question.question] === option &&
                                                    question.answer !== option && styles.wrongOption
                                                ]}
                                                onPress={() => {
                                                    if (!quizSubmitted) {
                                                        setQuizAnswers(prev => ({
                                                            ...prev,
                                                            [question.question]: option
                                                        }));
                                                    }
                                                }}
                                                disabled={quizSubmitted}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.optionContent}>
                                                    <View style={styles.optionLetterContainer}>
                                                        <Text style={styles.optionLetter}>
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </Text>
                                                    </View>
                                                    <Text style={[
                                                        styles.optionText,
                                                        quizAnswers[question.question] === option && styles.selectedOptionText
                                                    ]}>
                                                        {option}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {quizSubmitted && quizResults[question.question] && !quizResults[question.question].correct && (
                                        <View style={styles.correctAnswerContainer}>
                                            <Ionicons name="information-circle" size={16} color="#10b981" />
                                            <Text style={styles.correctAnswerText}>
                                                Correct answer: {question.answer}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity
                                style={[
                                    styles.quizActionButton,
                                    !quizSubmitted ? styles.submitButton : styles.continueButton
                                ]}
                                onPress={quizSubmitted ? closeQuiz : handleQuizSubmit}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.quizActionText}>
                                    {quizSubmitted ? "Continue Course →" : "Submit Quiz"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>

            {/* Footer */}
            <Footer />
        </SafeAreaView>
    );
}

// Mobile-Friendly Enhanced Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    videoContainer: {
        position: 'relative',
    },
    videoList: {
        height: '100%',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        resizeMode: 'cover',
    },
    darkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    courseProgressCard: {
        position: 'absolute',
        top: 70,
        left: 15,
        backgroundColor: 'rgba(99, 102, 241, 0.95)',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    courseProgressContent: {
        gap: 12,
    },
    courseInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    courseIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    courseProgressText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: fonts.initial,
        flex: 1,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 3,
    },
    progressPercentage: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: fonts.initial,
        minWidth: 35,
        textAlign: 'right',
    },
    videoInfoContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 15,
        justifyContent: 'space-between',
        paddingRight: 15,
    },
     videoDetails: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: 'column',
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    profileContainer: {
        position: 'relative',
    },
   profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    creatorInfo: {
        flex: 1,
        gap: 4,
    },
    creatorText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: fonts.initial,
    },
    followButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    notFollowingButton: {
        backgroundColor: '#6366f1',
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    followButtonText: {
        fontSize: 11,
        fontFamily: fonts.initial,
        fontWeight: '700',
    },
    notFollowingText: {
        color: '#ffffff',
    },
    followingText: {
        color: '#ffffff',
    },
    descriptionText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        fontFamily: fonts.initial,
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    difficultyText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: '800',
        fontFamily: fonts.initial,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagsText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: fonts.initial,
    },
    actionBar: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        paddingVertical: 16,
    },
    actionButton: {
        alignItems: 'center',
        gap: 6,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    likedContainer: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    savedContainer: {
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
    },
    actionCount: {
        color: '#ffffff',
        fontFamily: fonts.initial,
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
     header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        paddingTop: 45,
        paddingBottom: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
   headerContent: {
        paddingHorizontal: 16,
    },
     titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
     title: {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: fonts.initial,
        fontWeight: '800',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    // Enhanced Quiz Modal Styles (Mobile-Friendly)
    quizModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    quizContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        maxHeight: '85%',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
    },
    quizHeader: {
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    quizIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quizTitle: {
        fontSize: 20,
        fontWeight: '800',
        fontFamily: fonts.initial,
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    quizSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        fontFamily: fonts.initial,
        fontWeight: '500',
    },
    questionContainer: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    questionHeader: {
        marginBottom: 16,
    },
    questionNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366f1',
        textTransform: 'uppercase',
        fontFamily: fonts.initial,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: fonts.initial,
        color: '#1f2937',
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 10,
    },
    optionButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedOption: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        shadowColor: '#6366f1',
        shadowOpacity: 0.2,
        elevation: 3,
    },
    correctOption: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        shadowColor: '#10b981',
        shadowOpacity: 0.2,
        elevation: 3,
    },
    wrongOption: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        shadowColor: '#ef4444',
        shadowOpacity: 0.2,
        elevation: 3,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionLetterContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionLetter: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: fonts.initial,
    },
    optionText: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: '#374151',
        flex: 1,
        lineHeight: 20,
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#6366f1',
        fontWeight: '700',
    },
    correctAnswerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    correctAnswerText: {
        fontSize: 12,
        color: '#10b981',
        fontFamily: fonts.initial,
        fontWeight: '600',
        flex: 1,
    },
    quizActionButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    submitButton: {
        backgroundColor: '#6366f1',
    },
    continueButton: {
        backgroundColor: '#10b981',
    },
    quizActionText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
        fontFamily: fonts.initial,
        letterSpacing: 0.5,
    },
});

export default Courses;