import { useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts, shadowIntensity, getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock Data - Will be replaced with API calls
import { GeneralRetrivedVids, FollowedRetrivedVids } from '../src/mockData';

function Fyp() {
    // ========== STATE MANAGEMENT ==========
    const [fypState, setFypState] = useState("General"); // Tracks current FYP screen state
    const [videos, setVideos] = useState(GeneralRetrivedVids); // TODO: Replace with API fetched data
    const [isLoading, setIsLoading] = useState(false); // Loading state for better UX

    // ========== ANIMATION REFS ==========
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(1)).current;

    // ========== LAYOUT CALCULATIONS ==========
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const spacing = 8;
    const itemWidth = ((width - spacing * 3) / 2);

    // ========== NAVIGATION ==========
    const router = useRouter();

    // ========== SCROLL HANDLERS ==========
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    // ========== ANIMATED VALUES ==========
    // Remove headerOpacity since we want the header to stay visible

    const titleOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const subtitleOpacity = scrollY.interpolate({
        inputRange: [0, 30],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const headerHeightAnimated = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [120, 60],
        extrapolate: 'clamp',
    });




    // ========== EVENT HANDLERS ==========
    const handleTabChange = () => {
        setIsLoading(true);
        if (fypState == "General") {
            setFypState("Followed");
            setVideos(FollowedRetrivedVids); // TODO: Fetch followed videos from backend
        } else {
            setFypState("General");
            setVideos(GeneralRetrivedVids); // TODO: Fetch general videos from backend
        }
        // Simulate loading delay
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleVideoPress = (selectedVideo) => {
        const videoIndex = videos.findIndex(video => video.id === selectedVideo.id);
        router.push({
            pathname: '/fullScreen',
            params: {
                initialIndex: videoIndex,
                videoList: fypState === "General" ? "general" : "followed"
            }
        });
    };

    // ========== COMPONENT RENDERERS ==========
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.videoItem,
                { width: itemWidth },
                { margin: spacing / 2 }
            ]}
            onPress={() => handleVideoPress(item)}
            activeOpacity={0.8}
        >
            {/* Thumbnail Container */}
            <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            </View>

                         {/* Video Info */}
             <View style={styles.videoInfo}>
                 <View style={styles.creatorInfo}>
                     <Image source={{ uri: item.profile }} style={styles.creatorProfile} />
                     <Text style={styles.creatorName} numberOfLines={1}>
                         {item.creator}
                     </Text>
                 </View>
                 
                 <View style={styles.videoMetaRow}>
                     <View style={styles.subjectBadge}>
                         <Text style={styles.badgeText}>
                             {item.subject || "N/A"}
                         </Text>
                     </View>
                     
                     <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]} />
                 </View>
             </View>
        </TouchableOpacity>
    );

    // ========== MAIN COMPONENT RENDER ==========
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.initial} />
            
            {/* Enhanced Header Section */}
            <Animated.View style={[
                styles.header, 
                shadowIntensity.bottomShadow,
                {
                    height: headerHeightAnimated,
                }
            ]}>
                <View style={styles.headerContent}>
                    <Animated.View style={[
                        styles.headerLeft,
                        { opacity: titleOpacity }
                    ]}>
                        <Animated.Text style={[
                            styles.headerTitle,
                            { opacity: titleOpacity }
                        ]}>
                            For You
                        </Animated.Text>
                        <Animated.Text style={[
                            styles.headerSubtitle,
                            { opacity: subtitleOpacity }
                        ]}>
                            {fypState === "General" 
                                ? "Discover content that interests you" 
                                : "Content from creators  you follow"}
                        </Animated.Text>
                    </Animated.View>

                    <Animated.View>
                        <TouchableOpacity
                        onPress={handleTabChange}
                        style={[styles.switchButton, isLoading && styles.switchButtonLoading,
                           
                        ]}
                        activeOpacity={0.7}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Ionicons name="refresh" size={20} color={colors.initial} />
                        ) : (
                            <MaterialCommunityIcons
                                name="rotate-3d-variant"
                                size={24}
                                color={colors.initial}
                            />
                        )}
                        <Animated.Text style={[styles.switchButtonText,]}>
                            {isLoading ? "Loading..." : (fypState === "General" ? "Followed" : "General")}
                        </Animated.Text>
                    </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Tab Indicator */}
                <Animated.View style={[
                    styles.tabIndicator,
                    { opacity: titleOpacity }
                ]}>
                    <View style={[styles.tabLine, { backgroundColor: colors.secondary }]} />
                </Animated.View>
            </Animated.View>

            {/* Videos Grid Section */}
            {videos.length > 0 ? (
                <FlatList
                    data={videos}
                    renderItem={renderVideoItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={[
                        styles.videosGrid,
                        { paddingBottom: insets.bottom }
                    ]}
                    style={[
                        styles.videosList,
                        { paddingBottom: insets.bottom + 60 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.columnWrapper}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="videocam-outline" size={64} color={colors.iconColor} opacity={0.3} />
                    <Text style={styles.emptyStateTitle}>No videos found</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        {fypState === "General" 
                            ? "Check back later for trending content" 
                            : "Follow creators to see their content here"}
                    </Text>
                </View>
            )}

            {/* Footer Component */}
            <Footer />
        </SafeAreaView>
    );
}

// ========== STYLESHEET ==========
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenColor,
    },
    header: {
        backgroundColor: colors.initial,
        paddingTop: 2,
        paddingBottom: 0,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        minHeight: 60,
        maxHeight: 120,
        overflow: 'hidden',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
       
        flex: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.iconColor,
        fontFamily: fonts.initial,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.iconColor,
        opacity: 0.7,
        fontFamily: fonts.initial,
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        alignSelf: 'flex-end',
    },
    switchButtonText: {
        color: colors.initial,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: fonts.initial,
    },
    switchButtonLoading: {
        opacity: 0.7,
    },
    tabIndicator: {
        alignItems: 'center',
        marginTop: 5,
    },
    tabLine: {
        width: 40,
        height: 3,
        borderRadius: 2,
        marginBottom: 6,
    },
    videosGrid: {
        paddingTop: 5,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    videosList: {
        flex: 1,
        alignSelf:'center',
    },
    videoItem: {
        backgroundColor: colors.initial,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: colors.iconColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        borderBottomWidth: 2,
        borderColor: colors.secondary,
    },
    thumbnailContainer: {
        position: 'relative',
        height: 190,
        
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    badgeText: {
        color: colors.iconColor,
        fontSize: 10,
        fontWeight: '400',
        fontFamily: fonts.initial,
        textTransform: 'uppercase',
    },
         videoInfo: {
         padding: 12,
     },
     creatorInfo: {
         flexDirection: 'row',
         alignItems: 'center',
         marginBottom: 10,
     },
     videoMetaRow: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
     },
    creatorProfile: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
         creatorName: {
         fontSize: 14,
         color: colors.iconColor,
         opacity: 0.8,
         fontFamily: fonts.initial,
         flex: 1,
     },
     difficultyIndicator: {
         width: 16,
         height: 16,
         borderRadius: 8,
         borderWidth: 2,
         borderColor: colors.initial,
     },
     subjectBadge: {
         backgroundColor: 'rgba(0, 0, 0, 0.05)',
         paddingHorizontal: 12,
         paddingVertical: 6,
         borderRadius: 20,
         borderWidth: 1,
         borderColor: 'rgba(0, 0, 0, 0.1)',
     },
    videoStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: colors.iconColor,
        opacity: 0.7,
        marginLeft: 4,
        fontFamily: fonts.initial,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.iconColor,
        fontFamily: fonts.initial,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: colors.iconColor,
        opacity: 0.6,
        fontFamily: fonts.initial,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default Fyp;