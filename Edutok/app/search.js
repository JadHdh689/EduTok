import { useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts, shadowIntensity, getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// Mock Data - Will be replaced with API calls
import { GeneralRetrivedVids, subscribedCourses } from '../src/mockData';

function Search() {
    // State Management
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Navigation
    const router = useRouter();

    // Layout Calculations
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const spacing = 8;
    const itemWidth = ((width - spacing * 3) / 2);
    const courseItemWidth = width - 20; // Full width minus padding

    // Search Handler
    const handleSearch = (query) => {
        setSearchQuery(query);
        setIsSearching(true);
        
        // TODO: Replace with actual API call
        setTimeout(() => {
            if (query.trim()) {
                const filtered = GeneralRetrivedVids.filter(video => 
                    video.creator.toLowerCase().includes(query.toLowerCase()) ||
                    video.description.toLowerCase().includes(query.toLowerCase()) ||
                    video.subject.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(filtered);
            } else {
                setSearchResults([]);
            }
            setIsSearching(false);
        }, 500);
    };

    // Course Item Renderer
    const renderCourseItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.courseItem}
            onPress={() => router.push({
                pathname: '/courseDetails',
                params: { courseId: item.id }
            })}
        >
            <Image source={{ uri: item.thumbnailUrl }} style={styles.courseThumbnail} />
            
            {/* Course Info */}
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.courseCreator} numberOfLines={1}>
                    by {item.creator}
                </Text>
                <Text style={styles.courseDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                
                {/* Course Stats */}
                <View style={styles.courseStats}>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                        <Text style={styles.difficultyText}>{item.difficulty}</Text>
                    </View>
                    <Text style={styles.courseStatsText}>
                        {item.totalChapters} chapters • {item.enrolledStudents} students
                    </Text>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Progress: {item.progress}%</Text>
                    <View style={styles.progressBarBackground}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { width: `${item.progress}%` }
                            ]} 
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Video Item Renderer (for search results)
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity style={[
            styles.videoItem, 
            { width: itemWidth }, 
            { margin: spacing / 2 }
        ]}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            
            {/* Difficulty/Subject Badge */}
            <View style={[styles.badgeBox, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                <Text style={[styles.badgeText, { textShadowColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                    {item.subject || "N/A"}
                </Text>
            </View>

            {/* Video Info */}
            <View style={styles.videoInfo}>
                <Text style={styles.creatorName} numberOfLines={1}>
                    {item.creator}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={[styles.header, shadowIntensity.bottomShadow]}>
                <Text style={styles.headerTitle}>Search</Text>
                
                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses, creators, subjects..."
                        placeholderTextColor="gray"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <AntDesign name="close" size={16} color="gray" style={styles.clearIcon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {isSearching ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                ) : searchQuery.trim() === '' ? (
                    // Show subscribed courses when not searching
                    <View style={styles.coursesSection}>
                        <Text style={styles.sectionTitle}>My Courses</Text>
                        <FlatList
                            data={subscribedCourses}
                            renderItem={renderCourseItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={[
                                styles.coursesList,
                                { paddingBottom: insets.bottom + 60 }
                            ]}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                ) : searchResults.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search-off" size={60} color="gray" />
                        <Text style={styles.emptyText}>No results found</Text>
                        <Text style={styles.emptySubtext}>Try different keywords</Text>
                    </View>
                ) : (
                    // Show search results
                    <FlatList
                        data={searchResults}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        contentContainerStyle={[
                            styles.videosGrid,
                            { paddingBottom: insets.bottom + 60 }
                        ]}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Footer Component */}
            <Footer />
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenColor,
    },
    header: {
        backgroundColor: colors.initial,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginBottom: 10,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.initial,
        color: colors.iconColor,
    },
    clearIcon: {
        marginLeft: 10,
    },
    content: {
        flex: 1,
        paddingTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: fonts.initial,
        color: 'gray',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 8,
        textAlign: 'center',
    },
    
    // Courses Section Styles
    coursesSection: {
        flex: 1,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
    },
    coursesList: {
        paddingHorizontal: 5,
    },
    courseItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    courseThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    courseTitle: {
        fontSize: 16,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    courseCreator: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: colors.secondary,
        marginBottom: 4,
    },
    courseDescription: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: 'gray',
        marginBottom: 8,
    },
    courseStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    difficultyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    difficultyText: {
        color: 'white',
        fontSize: 10,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    courseStatsText: {
        fontSize: 10,
        fontFamily: fonts.initial,
        color: 'gray',
    },
    progressContainer: {
        marginTop: 4,
    },
    progressText: {
        fontSize: 10,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginBottom: 4,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 2,
    },
    
    // Video Grid Styles (for search results)
    videosGrid: {
        alignItems: 'flex-start',
        alignSelf: 'center',
        paddingHorizontal: 8,
    },
    videoItem: {
        height: 200,
        backgroundColor: '#ccc',
        borderRadius: 11,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '70%',
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11,
    },
    badgeBox: {
        position: 'absolute',
        top: 5,
        left: 5,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 9,
        minWidth: 40,
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontFamily: fonts.initial,
        textTransform: 'uppercase',
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowRadius: 0.5,
    },
    videoInfo: {
        padding: 8,
        height: '30%',
        justifyContent: 'space-between',
    },
    creatorName: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
    },
    videoDescription: {
        fontSize: 10,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 2,
    },
});

export default Search;