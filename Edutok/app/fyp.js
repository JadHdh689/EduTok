import { useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts,shadowIntensity,getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Mock Data - Will be replaced with API calls
import { GeneralRetrivedVids, FollowedRetrivedVids } from '../src/mockData';

function Fyp() {
    // State Management
    const [fypState, setFypState] = useState("General"); // Tracks current FYP screen state
    const [videos, setVideos] = useState(GeneralRetrivedVids); // TODO: Replace with API fetched data

    // Layout Calculations
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const spacing = 8;
    const itemWidth = ((width - spacing * 3) / 2);

    // Navigation
    const router = useRouter();

    // Tab Change Handler
    const handleTabChange = () => {
        if (fypState == "General") {
            setFypState("Followed");
            setVideos(FollowedRetrivedVids); // TODO: Fetch followed videos from backend
        } else {
            setFypState("General");
            setVideos(GeneralRetrivedVids); // TODO: Fetch general videos from backend
        }
    };

    // Handle video selection
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

    // Video Item Renderer
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.videoItem, 
                { width: itemWidth }, 
                { margin: spacing / 2 }
            ]}
            onPress={() => handleVideoPress(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            
            {/* Difficulty/Subject Badge */}
            <View style={[styles.badgeBox,{backgroundColor:getDifficultyBadgeStyle(item.difficulty)}]}>
                <Text style={[styles.badgeText,{textShadowColor:getDifficultyBadgeStyle(item.difficulty)}]}>
                    {item.subject || "N/A"}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={[styles.header,shadowIntensity.bottomShadow]}>
                <Text style={styles.headerStyle}>
                    {fypState == "General" ? "General" : "Followed"}
                </Text>
                <MaterialCommunityIcons
                    onPress={handleTabChange}
                    name="rotate-3d-variant"
                    size={24}
                    color= {colors.iconColor}
                    style={styles.switchIcon}
                />
            </View>
            
            {/* Videos Grid Section */}
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
            />
            
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
        flexDirection: 'column',
        width: '100%',
        padding: 3,
        paddingLeft:9,
        height: '5%', // Approximately 0.05 of screen height
    },
    headerText: {
        fontSize: 17,
        color: colors.iconColor,
        fontFamily: fonts.initial,
         
    },
    switchIcon: {
        alignSelf: 'flex-end',
        position: 'absolute',
        padding: 6,
    },
    videosGrid: {
        alignItems: 'flex-start',
        alignSelf: 'center',
        marginVertical: 0,
    },
    videosList: {
        height: '50%', // Approximately 0.5 of screen height
    },
    videoItem: {
        height: 250,
        backgroundColor: '#ccc',
        borderRadius: 11,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 11,
    },
  badgeBox:{
        position: 'absolute',
        top: 5,
        left: 5,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 9,
        minWidth: 40,
        alignItems: 'center'
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontFamily: fonts.initial,
        textTransform: 'uppercase',
    textShadowOffset: { width: 0.5, height: 0.5}, 
    textShadowRadius: 0.5,
    }
});

export default Fyp;