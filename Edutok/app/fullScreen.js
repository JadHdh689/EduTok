import { Image, FlatList, useWindowDimensions, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
import { user, GeneralRetrivedVids, FollowedRetrivedVids, myVideos, myVideos } from '../src/mockData';

function FullScreen() {
    // State Management
    const [fypState, setFypState] = useState("General");
    const [videos, setVideos] = useState(GeneralRetrivedVids); // TODO: Replace with API fetched data
    const [isCommentsVisible, setIsCommentsVisible] = useState(false); // State for comments visibility

    // Navigation
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialIndex = parseInt(params.initialIndex) || 0;
    const videoListType = params.videoList || 'general';
    const profileTab = params.profileTab || 'saved';

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
    const numPadding = user === 'creator' ? height*0.06: height*0.02;

    // Initialize videos based on navigation params and scroll to initial index
    useEffect(() => {
        if (videoListType === 'followed') {
            setVideos(FollowedRetrivedVids);
            setFypState("Followed");
        } else if (videoListType === 'profile') {
            setVideos(myVideos);
            setFypState("Profile");
        } else {
            setVideos(GeneralRetrivedVids);
            setFypState("General");
        }
    }, [videoListType]);

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
            setVideos(FollowedRetrivedVids); // TODO: Fetch followed videos from backend
        } else {
            setFypState("General");
            setVideos(GeneralRetrivedVids); // TODO: Fetch general videos from backend
        }
    };

    // Video Item Renderer
    const renderVideoItem = ({ item }) => {
        const id = item.id;
        const isLiked = likedMap[id] || false;
        const likesCount = likesMap[id] ?? item.likes;
        const isSaved = savedMap[id] || false;
        const isFollowed = followedMap[id] ?? item.followed;
        const needsExpansion = item.description && item.description.length > maxCharacters;
        const isExpanded = expandMap[id] || false;
        const isReportPopupVisible = isReportPopupVisibleMap[id] || false;

        return (
            <SafeAreaView style={{ flex: 1, height: height}}>
                {/* Video Content */}
                <Image
                    source={{ uri: item.uri }}
                    style={[styles.thumbnail, { width: width, height: height * 0.97 }]}
                    resizeMode="contain"
                />

                {/* Video Info Overlay */}
                <View style={[styles.videoInfoContainer, { width: width, bottom: insets.bottom + numPadding }]}>
                    {/* Left Side - Video Details */}

                    <View style={[styles.videoDetails, { minHeight: height * 0.15, width: width * 0.8, }]}>
                        <View style={{ flexDirection: "row", alignContent: "flex-start" }}>   
                            <TouchableOpacity onPress={() => router.push({
                                pathname: 'creatorPage',
                                params: { creator: item.creator, profile: item.profile, followed: item.followed,followers:item.followers,following:item.following,bio:item.bio }
                            })}>
                                <Image
                                    source={{ uri: item.profile }}
                                    style={styles.profileImage}
                                />
                            </TouchableOpacity>
                            <View>
                                <TouchableOpacity onPress={() => setFollowedMap(prev => ({ ...prev, [id]: !isFollowed }))}>
                                    <View style={styles.followButton}>
                                        <Text style={styles.followButtonText}>
                                            {isFollowed ? "unfollow" : "follow"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.creatorText}>{item.creator}</Text></View></View>
                        <Text
                            style={styles.descriptionText}
                            onPress={() => setExpandMap(prev => ({ ...prev, [id]: !isExpanded }))}
                        >
                            {textSlice(item.description, needsExpansion, isExpanded)}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 3 }}>
                            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}></View>
                            <Text style={styles.tagsText}>
                                {" #" + item.subject}
                            </Text>
                        </View>
                    </View>

                    {/* Right Side - Action Bar */}
                    <View style={styles.actionBar}>
                        {/* Like Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                setLikedMap(prev => ({ ...prev, [id]: !isLiked }));
                                setLikesMap(prev => ({ ...prev, [id]: isLiked ? likesCount - 1 : likesCount + 1 }));
                            }}
                        >
                            <AntDesign
                                name={isLiked ? "heart" : "hearto"}
                                size={20}
                                color={isLiked ? colors.favColor : "white"}
                            />
                            <Text style={styles.actionCount}>
                                {handleLikesAndComments(likesMap[id] ?? item.likes)}
                            </Text>
                        </TouchableOpacity>

                        {/* Comment Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsCommentsVisible(true)} // Updated to open comments modal
                        >
                            <MaterialCommunityIcons
                                name="comment-outline"
                                size={20}
                                color="white"
                            />
                            <Text style={styles.actionCount}>
                                {handleLikesAndComments(item.Comments)}
                            </Text>
                        </TouchableOpacity>


                        {/* Quiz Button */}
                        <TouchableOpacity style={styles.actionButton}
                        onPress={() => router.push({
                             pathname: 'quiz',
                             params: { videoId: item.id }
                           })} >
                            <MaterialIcons 
                                name="quiz" 
                                size={20} 
                                color="white" 
                                
                            />
                        </TouchableOpacity>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setSavedMap(prev => ({ ...prev, [id]: !isSaved }))}
                        >
                            <Fontisto
                                name={isSaved ? "bookmark-alt" : "bookmark"}
                                size={20}
                                color={isSaved ? colors.saveColor : "white"}
                            />
                        </TouchableOpacity>

                        {/* Report Button */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsReportPopupVisibleMap(prev => ({ ...prev, [id]: !isReportPopupVisible }))}
                        >
                            <MaterialIcons
                                name="report-gmailerrorred"
                                size={24}
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
                    keyExtractor={(item) => item.id}
                    style={styles.videoList}
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    decelerationRate="fast"
                    initialScrollIndex={initialIndex}
                    getItemLayout={(data, index) => ({
                        length: height,
                        offset: height * index,
                        index,
                    })}

                />
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {fypState === "General" ? "General" :
                            fypState === "Followed" ? "Followed" :
                                fypState === "Profile" ? profileTab.charAt(0).toUpperCase() + profileTab.slice(1) : "Profile"}
                    </Text>
                    {fypState !== "Profile" && (
                        <MaterialCommunityIcons
                            onPress={handleTabChange}
                            name="rotate-3d-variant"
                            size={24}
                            color="white"
                            style={styles.switchIcon}
                        />
                    )}
                    {fypState !== "Profile" && (
                        <MaterialCommunityIcons
                            onPress={handleTabChange}
                            name="rotate-3d-variant"
                            size={24}
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
        height: '100%',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 11,
        resizeMode: 'contain',
    },
    videoInfoContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 11,
        justifyContent: 'space-between',
    },
    videoDetails: {
        paddingTop: 4,
        paddingLeft: 11,
        flexDirection: 'column',
        borderRadius: 11,
   
        marginRight: 10,
        width: '80%',
        justifyContent: 'space-evenly',
    },
    followButton: {
        marginLeft: 10,
        marginLeft: 10,
        maxWidth: 100,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 9,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.initial,
    },
    followButtonText: {
        color: colors.initial,
        fontSize: 14,
        fontFamily: fonts.initial,
        fontWeight: "bold",
    },
    creatorText: {
        color: 'white',
        paddingLeft: 10,
        paddingLeft: 10,
        fontSize: 12,

    },
    descriptionText: {
        color: 'white',
        paddingRight: 5,
        fontSize: 13,
        fontWeight: "bold",
    },
    tagsText: {
        color: '#efefefff',
        fontSize: 10,
        flexWrap: 'wrap',
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
    },
    header: {
        position: 'absolute',
        flexDirection: 'column',
        zIndex: 200,
        justifyContent: 'flex-start',
        width: '100%',
    },
    title: {
        fontSize: 17,
        color: "white",
        paddingLeft: 9,
        fontFamily: fonts.initial,
    },
    switchIcon: {
        position: 'absolute',
        padding: 6,
        paddingTop: 4,
        right: 0,
    },
    difficultyBadge: {
        width: 10,
        height: 10,
        borderRadius: 13,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 11,
   

    },

});

export default FullScreen;