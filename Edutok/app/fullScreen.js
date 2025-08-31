import { Image, FlatList, useWindowDimensions, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, Audio } from 'expo-av';

// Components
import Footer from '../src/components/footer';
import Report from '../src/components/Report';
import Comments from './comments'; // Import the Comments component

// Constants
import { colors, fonts, maxCharacters, getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';

// Mock Data - Will be replaced with API calls
import { user, getGeneralVideos, getFollowedVideos, getSavedVideos, getFavoriteVideos, getMyVideos } from '../src/mockData';

// Video source mapping function
const getVideoSource = (subject) => {
  const subjectLower = subject?.toLowerCase() || '';
  
  const videoMap = {
    'physics': require('../src/mockVideos/physics.mp4'),
    'engineering': require('../src/mockVideos/engineer.mp4'),
    'engineer': require('../src/mockVideos/engineer.mp4'),
    'computer science': require('../src/mockVideos/computer science.mp4'),
    'biology': require('../src/mockVideos/biology.mp4'),
    'medicine': require('../src/mockVideos/premed.mp4'),
    'premed': require('../src/mockVideos/premed.mp4'),
    'pre-med': require('../src/mockVideos/premed.mp4'),
  };
  
  // Find the best match
  for (const [key, value] of Object.entries(videoMap)) {
    if (subjectLower.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default fallback
  return require('../src/mockVideos/physics.mp4');
};

function FullScreen() {
    // State Management
    const [fypState, setFypState] = useState("General");
    const [videos, setVideos] = useState(getGeneralVideos()); // TODO: Replace with API fetched data
    const [isCommentsVisible, setIsCommentsVisible] = useState(false); // State for comments visibility
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [pausedVideos, setPausedVideos] = useState({}); // Track manually paused videos

    // Navigation
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialIndex = parseInt(params.initialIndex) || 0;
    const videoListType = params.videoList || 'general';
    const profileTab = params.profileTab || 'saved';

    // Refs
    const flatListRef = useRef(null);
    const videoRefs = useRef(new Map());
    const currentPlayingIndex = useRef(null);
    const pausedVideosRef = useRef({});

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
    const numPadding = user === 'creator' ? height * 0.06 : height * 0.02;
    
    // Responsive calculations
    const isSmallPhone = height < 700;
    const isMediumPhone = height >= 700 && height < 800;
    const isLargePhone = height >= 800;
    
    // Responsive dimensions
    const profileImageSize = isSmallPhone ? 32 : isMediumPhone ? 36 : 40;
    const actionButtonSpacing = isSmallPhone ? 25 : isMediumPhone ? 30 : 35;
    const videoDetailsHeight = isSmallPhone ? height * 0.12 : isMediumPhone ? height * 0.14 : height * 0.15;
    const videoDetailsWidth = isSmallPhone ? width * 0.75 : isMediumPhone ? width * 0.78 : width * 0.8;
    const actionBarMarginRight = isSmallPhone ? 15 : isMediumPhone ? 18 : 20;
    const videoInfoBottom = isSmallPhone ? insets.bottom + 60 : isMediumPhone ? insets.bottom + 70 : insets.bottom + 80;

    // Configure audio mode for video playback
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            staysActiveInBackground: false,
            playThroughEarpieceAndroid: false,
        });
    }, []);

    // Initialize videos based on navigation params and scroll to initial index
    useEffect(() => {
        if (videoListType === 'followed') {
            setVideos(getFollowedVideos());
            setFypState("Followed");
        } else if (videoListType === 'profile') {
            // Handle different profile tabs
            if (profileTab === 'saved') {
                setVideos(getSavedVideos());
            } else if (profileTab === 'favorite') {
                setVideos(getFavoriteVideos());
            } else if (profileTab === 'mine') {
                setVideos(getMyVideos());
            } else {
                setVideos(getSavedVideos()); // Default to saved
            }
            setFypState("Profile");
        } else {
            setVideos(getGeneralVideos());
            setFypState("General");
        }
    }, [videoListType, profileTab]);

    // Scroll to initial video when component mounts
    useEffect(() => {
        if (flatListRef.current && initialIndex > 0) {
            setTimeout(() => {
                flatListRef.current.scrollToIndex({
                    index: initialIndex,
                    animated: false
                });
            }, 100);
        }
    }, [initialIndex]);

    // Keep ref in sync with state
    useEffect(() => {
        pausedVideosRef.current = pausedVideos;
    }, [pausedVideos]);

    // Handle viewable items changed - auto play/pause videos
    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            
            // Stop currently playing video
            if (currentPlayingIndex.current !== null && currentPlayingIndex.current !== newIndex) {
                const currentVideoRef = videoRefs.current.get(currentPlayingIndex.current);
                if (currentVideoRef) {
                    currentVideoRef.pauseAsync();
                    // Don't reset to beginning when scrolling away
                }
            }
            
            // Play the new visible video only if it's not manually paused
            const newVideoRef = videoRefs.current.get(newIndex);
            if (newVideoRef && !pausedVideosRef.current[newIndex]) {
                newVideoRef.playAsync();
                currentPlayingIndex.current = newIndex;
                setCurrentVideoIndex(newIndex);
            } else {
                currentPlayingIndex.current = newIndex;
                setCurrentVideoIndex(newIndex);
            }
        }
    }, []);

    // Clean up video refs when component unmounts
    useEffect(() => {
        return () => {
            // Pause all videos on unmount
            videoRefs.current.forEach((ref) => {
                if (ref) {
                    ref.pauseAsync();
                }
            });
        };
    }, []);

    // Handle video end
    const handleVideoEnd = async (videoId, index) => {
        // For FullScreen component, we might not need the quiz logic
        // Just play the next video if available
        if (index < videos.length - 1) {
            // Auto-scroll to next video after a short delay
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: index + 1,
                        animated: true
                    });
                }
            }, 1000);
        }
    };

    // Handle video tap (play/pause)
    const handleVideoTap = async (index) => {
        const videoRef = videoRefs.current.get(index);
        if (videoRef) {
            const status = await videoRef.getStatusAsync();
            
            if (status.isPlaying) {
                // Pause the video
                await videoRef.pauseAsync();
                setPausedVideos(prev => ({ ...prev, [index]: true }));
            } else {
                // Play the video
                await videoRef.playAsync();
                setPausedVideos(prev => ({ ...prev, [index]: false }));
                
                // Update current playing index
                if (currentPlayingIndex.current !== null && currentPlayingIndex.current !== index) {
                    const currentVideoRef = videoRefs.current.get(currentPlayingIndex.current);
                    if (currentVideoRef) {
                        currentVideoRef.pauseAsync();
                    }
                }
                currentPlayingIndex.current = index;
            }
        }
    };

    // Viewability config
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 90, // Higher threshold for better TikTok-like experience
    });

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

    // Handlers
    const handleTabChange = () => {
        if (fypState == "General") {
            setFypState("Followed");
            setVideos(getFollowedVideos()); // TODO: Fetch followed videos from backend
        } else {
            setFypState("General");
            setVideos(getGeneralVideos()); // TODO: Fetch general videos from backend
        }
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
            <View style={[styles.videoItem, { height: height }]}>
                {/* Video Content with Tap Handler */}
                <TouchableOpacity 
                    style={styles.videoContainer}
                    activeOpacity={1} // Prevents opacity change on tap
                    onPress={() => handleVideoTap(index)}
                >
                    <Video
                        ref={(ref) => {
                            videoRefs.current.set(index, ref);
                        }}
                        source={getVideoSource(item.subject)}
                        style={[styles.videoPlayer, { width: width, height: height }]}
                        resizeMode="cover"
                        shouldPlay={index === currentVideoIndex && !pausedVideos[index]} // Auto-play current video
                        isLooping={false}
                        useNativeControls={false}
                        onPlaybackStatusUpdate={(status) => {
                            if (status.didJustFinish && !status.isLooping) {
                                handleVideoEnd(id, index);
                            }
                        }}
                    />
                    
                    {/* Play/Pause Overlay Icon */}
                    {pausedVideos[index] && (
                        <View style={styles.playPauseOverlay}>
                            <MaterialIcons 
                                name="play-circle-filled" 
                                size={70} 
                                color="rgba(255, 255, 255, 0.7)" 
                            />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Video Info Overlay */}
                <View style={[styles.videoInfoContainer, { 
                    width: width, 
                    bottom: videoInfoBottom,
                    paddingHorizontal: isSmallPhone ? 8 : isMediumPhone ? 10 : 11
                }]}>
                    {/* Left Side - Video Details */}
                    <View style={[styles.videoDetails, { 
                        minHeight: videoDetailsHeight, 
                        width: videoDetailsWidth, 
                        backgroundColor: 'rgba(0, 0, 0, 0.42)', 
                        borderRadius: isSmallPhone ? 8 : 11, 
                        padding: isSmallPhone ? 10 : isMediumPhone ? 11 : 12 
                    }]}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>   
                            <TouchableOpacity onPress={() => router.push({
                                pathname: 'creatorPage',
                                params: { creator: item.creator, profile: item.profile, followed: item.followed,followers:item.followers,following:item.following,bio:item.bio }
                            })}>
                                <View style={{position:"relative"}}>
                                    {/* Outer colored border */}
                                    <View style={{
                                        position:"absolute",
                                        top: isSmallPhone ? -4 : -6,
                                        left: isSmallPhone ? -4 : -6,
                                        right: isSmallPhone ? -4 : -6,
                                        bottom: isSmallPhone ? -4 : -6,
                                        borderRadius: profileImageSize + 6,
                                        borderWidth: isSmallPhone ? 2 : 3,
                                        borderColor: colors.secondary
                                    }} />
                                   
                                    <Image
                                        source={{ uri: item.profile }}
                                        style={[styles.profileImage, { 
                                            width: profileImageSize, 
                                            height: profileImageSize, 
                                            borderRadius: profileImageSize / 2 
                                        }]}/>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setFollowedMap(prev => ({ ...prev, [id]: !isFollowed }))}
                                style={[styles.followButton, isFollowed ? styles.followingButton : styles.notFollowingButton]}
                            >
                                <Text style={[styles.followButtonText, isFollowed ? styles.followingText : styles.notFollowingText]}>
                                    {isFollowed ? "Following" : "Follow"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.creatorText, { 
                            fontSize: isSmallPhone ? 10 : isMediumPhone ? 10.5 : 11,
                            marginTop: isSmallPhone ? 3 : 4,
                            marginBottom: isSmallPhone ? 1 : 2
                        }]}>{item.creator}</Text>
                        <Text
                            style={[styles.descriptionText, { 
                                fontSize: isSmallPhone ? 13 : isMediumPhone ? 14 : 15,
                                lineHeight: isSmallPhone ? 18 : isMediumPhone ? 19 : 20
                            }]}
                            onPress={() => setExpandMap(prev => ({ ...prev, [id]: !isExpanded }))}
                        >
                            {textSlice(item.description, needsExpansion, isExpanded)}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: isSmallPhone ? 2 : 3 }}>
                            <View style={[styles.difficultyBadge, { 
                                backgroundColor: getDifficultyBadgeStyle(item.difficulty),
                                width: isSmallPhone ? 8 : 10,
                                height: isSmallPhone ? 8 : 10,
                                borderRadius: isSmallPhone ? 10 : 13
                            }]}></View>
                            <Text style={[styles.tagsText, { 
                                fontSize: isSmallPhone ? 10 : isMediumPhone ? 11 : 12
                            }]}>
                                {" #" + item.subject}
                            </Text>
                        </View>
                    </View>

                    {/* Right Side - Action Bar */}
                    <View style={[styles.actionBar, { marginRight: actionBarMarginRight }]}>
                        {/* Like Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: actionButtonSpacing }]}
                            onPress={() => {
                                setLikedMap(prev => ({ ...prev, [id]: !isLiked }));
                                setLikesMap(prev => ({ ...prev, [id]: isLiked ? likesCount - 1 : likesCount + 1 }));
                            }}
                        >
                            <AntDesign
                                name={isLiked ? "heart" : "hearto"}
                                size={isSmallPhone ? 18 : isMediumPhone ? 19 : 20}
                                color={isLiked ? colors.favColor : "white"}
                            />
                            <Text style={[styles.actionCount, { 
                                fontSize: isSmallPhone ? 10 : isMediumPhone ? 10.5 : 11,
                                paddingTop: isSmallPhone ? 8 : isMediumPhone ? 9 : 10
                            }]}>
                                {handleLikesAndComments(likesMap[id] ?? item.likes)}
                            </Text>
                        </TouchableOpacity>

                        {/* Comment Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: actionButtonSpacing }]}
                            onPress={() => setIsCommentsVisible(true)} // Updated to open comments modal
                        >
                            <MaterialCommunityIcons
                                name="comment-outline"
                                size={isSmallPhone ? 18 : isMediumPhone ? 19 : 20}
                                color="white"
                            />
                            <Text style={[styles.actionCount, { 
                                fontSize: isSmallPhone ? 10 : isMediumPhone ? 10.5 : 11,
                                paddingTop: isSmallPhone ? 8 : isMediumPhone ? 9 : 10
                            }]}>
                                {handleLikesAndComments(item.Comments)}
                            </Text>
                        </TouchableOpacity>

                        {/* Quiz Button */}
                        <TouchableOpacity style={[styles.actionButton, { marginTop: actionButtonSpacing }]}
                        onPress={() => router.push({
                             pathname: 'quiz',
                             params: { videoId: item.id }
                           })} >
                            <MaterialIcons 
                                name="quiz" 
                                size={isSmallPhone ? 18 : isMediumPhone ? 19 : 20} 
                                color="white" 
                                
                            />
                        </TouchableOpacity>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: actionButtonSpacing }]}
                            onPress={() => setSavedMap(prev => ({ ...prev, [id]: !isSaved }))}
                        >
                            <Fontisto
                                name={isSaved ? "bookmark-alt" : "bookmark"}
                                size={isSmallPhone ? 18 : isMediumPhone ? 19 : 20}
                                color={isSaved ? colors.saveColor : "white"}
                            />
                        </TouchableOpacity>

                        {/* Report Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: actionButtonSpacing }]}
                            onPress={() => setIsReportPopupVisibleMap(prev => ({ ...prev, [id]: !isReportPopupVisible }))}
                        >
                            <MaterialIcons
                                name="report-gmailerrorred"
                                size={isSmallPhone ? 22 : isMediumPhone ? 23 : 24}
                                color="white"
                            />
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
            </View>
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
                    keyExtractor={(item) => item.id}
                    style={styles.videoList}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    decelerationRate="fast"
                    initialScrollIndex={initialIndex}
                    snapToInterval={height}
                    snapToAlignment="start"
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig.current}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={2}
                    initialNumToRender={1}
                    windowSize={3}
                    getItemLayout={(data, index) => ({
                        length: height,
                        offset: height * index,
                        index,
                    })}
                />
                {/* Header */}
                <View style={[styles.header, { 
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    paddingVertical: isSmallPhone ? 2 : 3,
                    paddingHorizontal: isSmallPhone ? 5 : 6
                }]}>
                    <Text style={[styles.title, { 
                        fontSize: isSmallPhone ? 17 : isMediumPhone ? 18 : 19
                    }]}>
                        {fypState === "General" ? "General" :
                            fypState === "Followed" ? "Followed" :
                                fypState === "Profile" ? profileTab.charAt(0).toUpperCase() + profileTab.slice(1) : "Profile"}
                    </Text>
                   
                    {fypState !== "Profile" && (
                        <MaterialCommunityIcons
                            onPress={handleTabChange}
                            name="rotate-3d-variant"
                            size={isSmallPhone ? 22 : isMediumPhone ? 23 : 24}
                            color="white"
                            style={styles.switchIcon}
                        />
                    )}
                </View>
            </View>

            {/* Footer */}
            <Footer />
            
            {/* Comments Modal */}
            <Comments
                visible={isCommentsVisible}
                onClose={() => setIsCommentsVisible(false)}
            />
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    videoList: {
        flex: 1,
    },
    videoItem: {
        width: '100%',
        position: 'relative',
    },
    videoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    videoInfoContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 11,
        justifyContent: 'space-between',
        zIndex: 1000,
    },
    videoDetails: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginRight: 10,
    },
    followButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
         marginHorizontal: 20,
    },
    followButtonText: {
        fontSize: 11,
        fontFamily: fonts.initial,
        fontWeight: '700',
        marginHorizontal: 40,
    },
    creatorText: {
        color: 'white',
        fontSize: 11,
        fontWeight: "600",
        marginTop: 4,
        marginBottom: 2,
    },
    descriptionText: {
        color: 'white',
        paddingRight: 5,
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 20,
    },
    tagsText: {
        color: '#efefefff',
        fontSize: 12,
        flexWrap: 'wrap',
        fontWeight: "400",
    },
    notFollowingButton: {
        backgroundColor: colors.secondary,
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: "#FFFFFF"
    },
    notFollowingText: {
        color: '#ffffff',
    },
    followingText: {
        color: '#ffffff',
    },
    actionBar: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingHorizontal: 5,
        marginRight: 20,
    },
    actionButton: {
        marginTop: 35,
        alignItems: 'center',
    },
    actionCount: {
        color: "white",
        fontFamily: fonts.initial,
        fontSize: 11,
        fontWeight: "500",
        paddingTop:10,
    },
    header: {
        position: 'absolute',
        flexDirection: 'row',
        zIndex: 200,
        paddingVertical:3,
        paddingHorizontal: 6,
        justifyContent: 'space-between',
        width: '100%',
    },
    title: {
        fontSize: 19,
        color: "white",
        fontFamily: fonts.initial,
        fontWeight: "600",
        alignSelf: 'flex-start',
        
    },
    switchIcon: {
       alignSelf: 'flex-end',
    },
    difficultyBadge: {
        width: 10,
        height: 10,
        borderRadius: 13,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#ffffff",
    },
    playPauseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
});

export default FullScreen;