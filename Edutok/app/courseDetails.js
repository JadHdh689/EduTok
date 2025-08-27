import { useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts, shadowIntensity, getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock Data - Will be replaced with API calls
import { getCourseById, getVideosByChapter } from '../src/mockData';

function CourseDetails() {
    // Navigation and params
    const router = useRouter();
    const { courseId } = useLocalSearchParams();

    // State Management
    const [course, setCourse] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [chapterVideos, setChapterVideos] = useState([]);
    const [expandedChapters, setExpandedChapters] = useState({});

    // Layout Calculations
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Load course data
    useEffect(() => {
        if (courseId) {
            const courseData = getCourseById(courseId);
            setCourse(courseData);
        }
    }, [courseId]);

    // Handle chapter selection
    const handleChapterPress = (chapter) => {
        if (selectedChapter?.id === chapter.id) {
            // Close if same chapter is pressed
            setSelectedChapter(null);
            setChapterVideos([]);
        } else {
            // Load new chapter
            setSelectedChapter(chapter);
            const videos = getVideosByChapter(chapter.id);
            setChapterVideos(videos);
        }
    };

    // Handle video selection
    const handleVideoPress = (video) => {
        const videoIndex = chapterVideos.findIndex(v => v.id === video.id);
        router.push({
            pathname: '/fullScreen',
            params: {
                initialIndex: videoIndex,
                videoList: 'course',
                chapterId: selectedChapter.id
            }
        });
    };

    // Chapter Item Renderer
    const renderChapterItem = ({ item, index }) => {
        const isCompleted = item.completed;
        const isSelected = selectedChapter?.id === item.id;

        return (
            <View style={styles.chapterContainer}>
                <TouchableOpacity
                    style={[
                        styles.chapterItem,
                        isCompleted && styles.completedChapter,
                        isSelected && styles.selectedChapter
                    ]}
                    onPress={() => handleChapterPress(item)}
                >
                    <View style={styles.chapterHeader}>
                        <View style={styles.chapterInfo}>
                            <View style={styles.chapterTitleRow}>
                                <Text style={styles.chapterNumber}>
                                    Chapter {item.chapterNumber}
                                </Text>
                                {isCompleted && (
                                    <MaterialIcons
                                        name="check-circle"
                                        size={16}
                                        color="#4CAF50"
                                        style={styles.completedIcon}
                                    />
                                )}
                            </View>
                            <Text style={styles.chapterTitle} numberOfLines={2}>
                                {item.title}
                            </Text>
                            <Text style={styles.chapterDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                            <Text style={styles.chapterStats}>
                                {item.totalVideos} videos
                            </Text>
                        </View>
                        <View style={styles.chapterActions}>
                            <MaterialIcons
                                name={isSelected ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={24}
                                color={colors.iconColor}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Chapter Videos List */}
                {isSelected && (
                    <View style={styles.videosContainer}>
                        <FlatList
                            data={chapterVideos}
                            renderItem={renderVideoItem}
                            keyExtractor={(video) => video.id}
                            scrollEnabled={false}
                        />

                        {/* Chapter Quiz Button */}
                        <TouchableOpacity
                            style={styles.chapterQuizButton}
                            onPress={() => router.push({
                                pathname: '/quiz',
                                params: {
                                    chapterId: item.id, // Pass chapter ID instead of video ID
                                    type: 'chapter'     // Specify that this is a chapter quiz
                                }
                            })}
                        >
                            <MaterialIcons name="quiz" size={20} color="white" />
                            <Text style={styles.chapterQuizText}>Chapter Quiz</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    // Video Item Renderer
    const renderVideoItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.videoListItem}
            onPress={() => handleVideoPress(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.videoThumbnail} />
            <View style={styles.videoItemInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={1}>
                    {item.description}
                </Text>
                <View style={styles.videoItemFooter}>
                    <View style={[styles.videoDifficultyBadge, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                        <Text style={styles.videoDifficultyText}>{item.difficulty}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.videoQuizButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            router.push({
                                pathname: '/quiz',
                                params: {
                                    videoId: item.id,
                                    type: 'video'
                                }
                            });
                        }}
                    >
                        <MaterialIcons name="quiz" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (!course) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading course...</Text>
                <Footer />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, shadowIntensity.bottomShadow]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.iconColor} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {course.title}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Course Info Section */}
                <View style={styles.courseInfoSection}>
                    <Image source={{ uri: course.thumbnailUrl }} style={styles.courseBanner} />

                    <View style={styles.courseDetails}>
                        <View style={styles.courseHeader}>
                            <Text style={styles.courseTitle}>{course.title}</Text>
                            <Text style={styles.courseCreator}>by {course.creator}</Text>
                        </View>

                        <Text style={styles.courseDescription}>
                            {course.description}
                        </Text>

                        <View style={styles.courseStats}>
                            <View style={[styles.courseDifficultyBadge, { backgroundColor: getDifficultyBadgeStyle(course.difficulty) }]}>
                                <Text style={styles.courseDifficultyText}>{course.difficulty}</Text>
                            </View>
                            <Text style={styles.courseStatsText}>
                                {course.totalChapters} chapters • {course.enrolledStudents} students • {course.rating} ★
                            </Text>
                        </View>

                        {/* Overall Progress */}
                        <View style={styles.overallProgressContainer}>
                            <Text style={styles.progressLabel}>Overall Progress: {course.progress}%</Text>
                            <View style={styles.progressBarBackground}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${course.progress}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Chapters Section */}
                <View style={styles.chaptersSection}>
                    <Text style={styles.sectionTitle}>Course Chapters</Text>
                    <FlatList
                        data={course.chapters}
                        renderItem={renderChapterItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>

            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenColor,
    },
    header: {
        backgroundColor: colors.initial,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    headerSpacer: {
        width: 34, // Same width as back button for centering
    },
    content: {
        flex: 1,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 50,
    },

    // Course Info Section
    courseInfoSection: {
        backgroundColor: 'white',
        marginBottom: 10,
    },
    courseBanner: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    courseDetails: {
        padding: 15,
    },
    courseHeader: {
        marginBottom: 10,
    },
    courseTitle: {
        fontSize: 20,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    courseCreator: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: colors.secondary,
    },
    courseDescription: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: 'gray',
        lineHeight: 20,
        marginBottom: 15,
    },
    courseStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    courseDifficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 10,
    },
    courseDifficultyText: {
        color: 'white',
        fontSize: 12,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    courseStatsText: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: 'gray',
        flex: 1,
    },
    overallProgressContainer: {
        marginTop: 10,
    },
    progressLabel: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginBottom: 8,
        fontWeight: '500',
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 3,
    },

    // Chapters Section
    chaptersSection: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    chapterContainer: {
        marginBottom: 10,
    },
    chapterItem: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    completedChapter: {
        borderColor: '#4CAF50',
        backgroundColor: '#f1f8e9',
    },
    selectedChapter: {
        borderColor: colors.secondary,
        backgroundColor: 'rgba(250, 13, 13, 0.05)',
    },
    chapterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    chapterInfo: {
        flex: 1,
        marginRight: 10,
    },
    chapterTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    chapterNumber: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: colors.secondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    completedIcon: {
        marginLeft: 8,
    },
    chapterTitle: {
        fontSize: 16,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    chapterDescription: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: 'gray',
        marginBottom: 5,
    },
    chapterStats: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: 'gray',
    },
    chapterActions: {
        justifyContent: 'center',
    },

    // Videos Container
    videosContainer: {
        marginTop: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
    },
    videoListItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    videoThumbnail: {
        width: 60,
        height: 45,
        borderRadius: 6,
        marginRight: 12,
    },
    videoItemInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    videoTitle: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: '500',
        marginBottom: 4,
    },
    videoDescription: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: 'gray',
        marginBottom: 6,
    },
    videoItemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    videoDifficultyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    videoDifficultyText: {
        color: 'white',
        fontSize: 10,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    videoQuizButton: {
        padding: 4,
    },
    chapterQuizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    chapterQuizText: {
        color: 'white',
        fontSize: 14,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default CourseDetails;