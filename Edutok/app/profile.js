import {useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Components
import Footer from '../src/components/footer';

// Constants
import {colors, fonts,shadowIntensity} from '../src/constants';

// Icons
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';

// Mock Data - Will be replaced with API calls
import { user, myVideos, savedVideos, favoriteVideos } from '../src/mockData';

function Profile() {
    // State Management
    // TODO: Replace with actual user data from backend
    const [userRole, setUserRole] = useState(user); // Will be fetched from backend
    const [userName, setUserName] = useState("Jane Joe"); // Will be fetched from backend

    // Layout Calculations
    const { height, width } = useWindowDimensions();
    const spacing = 8; 
    const itemWidthCreator = ((width - spacing * 4) / 3);
    const itemWidthLearner = ((width - spacing * 2) / 2);
    const insets = useSafeAreaInsets();

    // Video Data State
    // TODO: Replace with API fetched data
    const [videos, setVideos] = useState(savedVideos); // Will be fetched from backend
    const [tab, setTab] = useState('saved');
    //for navigation
     const router = useRouter();

    // Icon States
    const [savedIcon, setSavedIcon] = useState('bookmark-alt');
    const [mineIcon, setMineIcon] = useState('video-camera-back');
    const [favoriteIcon, setFavoriteIcon] = useState('hearto');

    // Tab Change Handler
    const handleTabChange = (tab) => {
        if (tab === 'saved') {
            setTab('saved');
            setSavedIcon('bookmark-alt');
            setFavoriteIcon('hearto');
            setMineIcon('video-camera-back');
            setVideos(savedVideos); // TODO: Fetch saved videos from backend
        } else if (tab === 'mine') {
            setTab('mine');
            setSavedIcon('bookmark');
            setFavoriteIcon('hearto');
            setMineIcon('video-camera-front');
            setVideos(myVideos); // TODO: Fetch user's videos from backend
        } else if (tab === 'favorite') {
            setTab('favorite');
            setSavedIcon('bookmark');
            setFavoriteIcon('heart');
            setMineIcon('video-camera-back');
            setVideos(favoriteVideos); // TODO: Fetch favorite videos from backend
        }
    };

    // Handle video selection
    const handleVideoPress = (selectedVideo) => {
        const videoIndex = videos.findIndex(video => video.id === selectedVideo.id);
        router.push({
            pathname: '/fullScreen',
            params: { 
                initialIndex: videoIndex,
                videoList: 'profile',
                profileTab: tab
            }
        });
    };

    // Video Item Renderer
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.videoItem, 
                { width: itemWidthCreator }, 
                { margin: spacing / 2 }
            ]}
            onPress={() => handleVideoPress(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header Section */}
            <View style={[styles.profileHeader,shadowIntensity.bottomShadow, {height: height * 0.3}]}>
                <View style={{
                    width: width,
                    height: height * 0.05,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>  
                    {userRole === "creator" ? 
                        <MaterialCommunityIcons 
                            name="account-tie" 
                            size={24} 
                            style={styles.creatorIcon} 
                        /> : 
                        <FontAwesome5 
                            name="book-reader" 
                            size={20} 
                            style={styles.studentIcon} 
                        />
                    }
                    <Text style={styles.headerText}>
                        {userRole === "creator" ? "Educator " : "Student "}{userName}
                    </Text>
                    <MaterialIcons name="edit-note" size={24} style={styles.editIcon} onPress={() => router.push('/editProfile')}/>
                          {/* TODO: Add menue profile functionality */}
                    <Entypo name="dots-three-vertical" size={14} style={styles.menuIcon}/>
                </View>
                
                <View style={styles.verticalLine}/>
                
                <View style={styles.profileInfoContainer}>
                    {/* TODO: Fetch these values from backend */}
                    <Text style={styles.profileInfoText}>following:</Text>
                    {userRole === "creator" && <Text style={styles.profileInfoText}>followers:</Text>}
                    <Text style={styles.profileInfoText}>Current interests:</Text>
                    <Text style={styles.profileInfoText}>Short bio</Text>
                </View>
            </View>
            
            {/* Filter Buttons Section */}
            <View style={styles.filterButtonsContainer}>
                <TouchableOpacity 
                    style={[
                        styles.filterButton,
                        shadowIntensity.bottomShadow,
                        (userRole === "creator") ? { width: itemWidthCreator } : { width: itemWidthLearner },
                        { marginHorizontal: spacing / 2 }
                    ]}
                    onPress={() => handleTabChange('saved')}
                >
                    <Fontisto name={savedIcon} size={20} style={{color: colors.saveColor}} />
                    <Text style={styles.buttonText}>saved</Text>
                </TouchableOpacity>
                
                {userRole === "creator" && (
                    <TouchableOpacity 
                        style={[
                            styles.filterButton,
                              shadowIntensity.bottomShadow,
                            { width: itemWidthCreator },
                            { marginHorizontal: spacing / 2 }
                        ]}
                        onPress={() => handleTabChange('mine')}
                    >
                        <MaterialIcons name={mineIcon} size={20} color="gray" />
                        <Text style={styles.buttonText}>mine</Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                    style={[
                        styles.filterButton,  
                       shadowIntensity.bottomShadow, 
                        (userRole === "creator") ? { width: itemWidthCreator } : { width: itemWidthLearner },
                        { marginHorizontal: spacing / 2 }         
                    ]}
                    onPress={() => handleTabChange('favorite')}
                >
                    <AntDesign name={favoriteIcon} size={20} style={{color: colors.favColor}} />
                    <Text style={styles.buttonText}>favorite</Text>
                </TouchableOpacity>
            </View>
            
            {/* Videos Grid Section */}
            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={[
                    styles.videosGrid, 
                    { paddingBottom: insets.bottom + 10 }
                ]}
                style={[
                    { height: height * 0.5 }, 
                    { paddingBottom: insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
            />
            
            {/* Footer Component */}
            <Footer/>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenColor,
    },
    profileHeader: {
        backgroundColor: colors.initial,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    creatorIcon: {
        color: colors.iconColor,
        paddingRight: 0,
        paddingLeft: 3,

    },
    studentIcon: {
        color: colors.iconColor,
        marginRight: 5,
        paddingLeft: 5,
          
    },
    headerText: {
        paddingTop: 8,
        paddingBottom: 5,
        paddingRight: 5,
        color: colors.iconColor,
        fontFamily: fonts.initial,
        fontSize: 13,
    },
    menuIcon: {
        position: 'absolute',
        right: 10,
        color: colors.iconColor,
    },
    editIcon: {
        position: 'absolute',
        right: 30,
        color: colors.iconColor,
    },
    verticalLine: {
        width: 2,
        height: '65%',
        backgroundColor: colors.secondary,
        position: 'absolute',
        left: '45%',
        top: '%50',
           transform: [{ translateY: 45 }],
    },
    profileInfoContainer: {
        position:'absolute',
        flexDirection: 'column',
        alignSelf: 'flex-start',
   justifyContent:"center",
      transform: [{ translateY: 50 }],
       left: '45%',
      
  
    },
    profileInfoText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
        fontSize: 11,
        paddingTop: 7,
        paddingLeft: 20,
    },
    filterButtonsContainer: {
        alignSelf: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 4,
        paddingHorizontal:4,
    },
    filterButton: {
        backgroundColor: colors.initial,
        borderWidth: 1,
        borderColor: colors.iconColor,
        borderRadius: 11,
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: "black",
        margin: 3,
        paddingBottom: 5,
    },
    videosGrid: {
        alignItems: 'flex-start', 
        alignSelf: 'center',
        marginVertical: 0,
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
});

export default Profile;