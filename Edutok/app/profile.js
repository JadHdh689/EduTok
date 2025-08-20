import {TouchableWithoutFeedback,useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
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
import { myVideos, savedVideos, favoriteVideos ,userProfiles} from '../src/mockData';

function Profile() {
    // State Management
    // TODO: Replace with actual user data from backend
    const [userRole, setUserRole] = useState(userProfiles.creator.role); // Will be fetched from backend
    const [userName, setUserName] = useState(userProfiles.creator.name); // Will be fetched from backend

    // Layout Calculations
    const { height, width } = useWindowDimensions();
    const spacing = 8; 
    const itemWidthCreator = ((width - spacing * 4) / 3);
    const itemWidthLearner = ((width - spacing * 2) / 2);
    const insets = useSafeAreaInsets();

    // Video Data State
    // TODO: Replace with API fetched data
    const [videos, setVideos] = useState(savedVideos); // Will be fetched from backend

    //for navigation
     const router = useRouter();

    // Icon States
    const [savedIcon, setSavedIcon] = useState('bookmark-alt');
    const [mineIcon, setMineIcon] = useState('video-camera-back');
    const [favoriteIcon, setFavoriteIcon] = useState('hearto');
       const [tab, setTab] = useState('saved');
       const[isPopupVisible,setIsPopupVisible] = useState(false);

    // Tab Change Handler
    const handleTabChange = (tab) => {
        if (tab === 'saved') {
            setTab("saved");
            setSavedIcon('bookmark-alt');
            setFavoriteIcon('hearto');
            setMineIcon('video-camera-back');
            setVideos(savedVideos); // TODO: Fetch saved videos from backend
        } else if (tab === 'mine') {
                setTab("mine");
            setSavedIcon('bookmark');
            setFavoriteIcon('hearto');
            setMineIcon('video-camera-front');
            setVideos(myVideos); // TODO: Fetch user's videos from backend
        } else if (tab === 'favorite') {
                setTab("favorite");
            setSavedIcon('bookmark');
            setFavoriteIcon('heart');
            setMineIcon('video-camera-back');
            setVideos(favoriteVideos); // TODO: Fetch favorite videos from backend
        }
    };

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
            <TouchableWithoutFeedback onPress={()=>setIsPopupVisible(false)}>
                <View style={{ flex: 1 }}>
                    {/* Popup Menu */}
                    {isPopupVisible && (
                        <View style={[styles.popupContainer, shadowIntensity.bottomShadow, {
                            position: 'absolute',
                            right: width * 0.02,
                            top: height * 0.05,
                            zIndex: 1000,
                        }]}>
                            <TouchableOpacity style={[styles.popupItem, {
                                paddingVertical: height * 0.0015,
                                paddingHorizontal: width * 0.02,
                                borderRadius: width * 0.025,
                                marginVertical: height * 0.0002,
                            }]}>
                                <MaterialIcons 
                                    name="logout" 
                                    size={width * 0.04} 
                                    color={colors.iconColor} 
                                    style={[styles.popupIcon, {
                                        marginRight: width * 0.03,
                                    }]}
                                />
                                <Text style={[styles.popupText, {
                                    fontSize: width * 0.032,
                                    fontWeight: '500',
                                }]}>Log Out</Text>
                            </TouchableOpacity>
                            
                            <View style={[styles.popupDivider, {
                                marginVertical: height * 0.01,
                                marginHorizontal: width * 0.02,
                            }]} />
                            
                            <TouchableOpacity style={[styles.popupItem, {
                                paddingVertical: height * 0.0015,
                                paddingHorizontal: width * 0.02,
                                borderRadius: width * 0.025,
                                marginVertical: height * 0.0002,
                            }]}>
                                <MaterialIcons 
                                    name="delete-forever" 
                                    size={width * 0.04} 
                                    color={colors.iconColor} 
                                    style={[styles.popupIcon, {
                                        marginRight: width * 0.03,
                                    }]}
                                />
                                <Text style={[styles.popupText, {
                                    fontSize: width * 0.032,
                                    fontWeight: '500',
                                }]}>Delete Account</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {/* Profile Header Section */}
                    <View style={[styles.profileHeader,shadowIntensity.bottomShadow]}>
                        <View style={{
                            width: width,
                            flexDirection: 'row',
                            alignItems: 'center',
                           flexShrink: 1, flexGrow: 1 
                           
                        }}>  
                            {userRole === "creator" ? 
                                <MaterialCommunityIcons 
                                    name="account-tie" 
                                    size={width*0.044} 
                                    style={[styles.creatorIcon,{ 
                                        padding: width*0.005,
                                        borderRadius: width*0.008,
                                        marginHorizontal: width*0.007
                                    }]} 
                                /> : 
                                <FontAwesome5 
                                    name="book-reader" 
                                    size={width*0.044} 
                                    style={[styles.studentIcon,{ 
                                        padding: width*0.005,
                                        borderRadius: width*0.008,
                                        marginHorizontal: width*0.007
                                    }]} 
                                />
                            }
                            <Text style={[styles.headerText,{
                                fontSize: width * 0.036,
                                marginLeft: width * 0.02,
                                flex: 1
                            }]}>
                                {userRole === "creator" ? "Educator " : "Student "}{userName}
                            </Text>
                            <MaterialIcons 
                                name="edit-note"  
                                size={width*0.044}  
                                style={[styles.editIcon,{
                                    right: width*0.05,
                                    marginRight: width * 0.05
                                }]} 
                                onPress={() => router.push('/editProfile')}
                            />
                            <Entypo 
                                name="dots-three-vertical" 
                                size={width*0.023} 
                                style={[styles.menuIcon,{
                                    right: width*0.02,
                                    marginRight: width * 0.02
                                }]}
                                onPress={()=>setIsPopupVisible(true)}
                            />

                        </View>
                        <View style={[styles.profileMainSection, {
                            marginTop:  height* 0.02,
                            paddingHorizontal: width * 0.02
                        }]}>
                            <Image 
                                source={{ uri: userProfiles.creator.profileImage }} 
                                style={[styles.profileImage, {
                                    width: width * 0.24,
                                    height: width * 0.24,
                                    borderRadius: (width * 0.025)
                                }]}
                            />
                            
                            <View style={[styles.verticalLine, {
                                width: width * 0.003,
                                height: width * 0.2,
                                marginLeft: width * 0.02
                            }]}/>
                            
                            <View style={[styles.profileStatsContainer, {
                                paddingHorizontal: width * 0.15,
                                paddingVertical: height * 0.02, 
                                flex: 1,
                                marginLeft: width * 0.05
                            }]}>
                                <View style={styles.statRow}>
                                    <Text style={[styles.statNumber, {
                                        fontSize: width * 0.045
                                    }]}>{userProfiles.creator.following}</Text>
                                    <Text style={[styles.statLabel, {
                                        fontSize: width * 0.025
                                    }]}>Following</Text>
                                </View>
                                {userRole === "creator" && (
                                    <View style={styles.statRow}>
                                        <Text style={[styles.statNumber, {
                                            fontSize: width * 0.045
                                        }]}>{userProfiles.creator.followers > 1000 ? `${(userProfiles.creator.followers / 1000).toFixed(1)}k` : userProfiles.creator.followers}</Text>
                                        <Text style={[styles.statLabel, {
                                            fontSize: width * 0.025
                                        }]}>Followers</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={ {
                            marginTop: height * 0.015,
                            paddingHorizontal: width * 0.02
                        }}>

                            <Text style={[styles.profileInfoText, {
                                fontSize: width * 0.03,
                                marginBottom: height * 0.005,
                                lineHeight: width * 0.035
                            }]}>{userProfiles.creator.bio}</Text>
                            
                            <View style={styles.subjectsContainer}>
                                {userProfiles.creator.subjects.map((subject, index) => (
                                    <View key={index} style={[styles.subjectTag, {
                                        paddingHorizontal: width * 0.02,
                                        paddingVertical: height * 0.008,
                                        margin: width * 0.01,
                                        borderRadius: width * 0.015
                                    }]}>
                                        <Text style={[styles.subjectTagText, {
                                            fontSize: width * 0.025
                                        }]}>{subject}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    
                    
                        {/* Filter Buttons Section */}
                        <View style={[styles.filterButtonsContainer,{
                        
                            marginTop: height * 0.005,
                           
                        }]}>
                            <TouchableOpacity 
                                style={[
                                    styles.filterButton,
                                    {borderBottomLeftRadius: 25},
                                    tab === 'saved' && styles.filterButtonActive
                                ]}
                                onPress={() => handleTabChange('saved')}
                            >
                                <Fontisto 
                                    name={savedIcon} 
                                    size={width * 0.045} 
                                    style={[
                                        {color: colors.saveColor},
                                      
                                    ]} 
                                />
                                <Text style={[
                                    styles.buttonText,
                                    {fontSize: width * 0.03},
                                
                                ]}>saved</Text>
                            </TouchableOpacity>
                            
                            {userRole === "creator" && (
                                <TouchableOpacity 
                                    style={[
                                        styles.filterButton,
                                        tab === 'mine' && styles.filterButtonActive
                                    ]}
                                    onPress={() => handleTabChange('mine')}
                                >
                                    <MaterialIcons 
                                        name={mineIcon} 
                                        size={width * 0.045} 
                                        style={[
                                            {color: "gray"},
                                        ]} 
                                    />
                                    <Text style={[
                                        styles.buttonText,
                                        {fontSize: width * 0.03},
                                      
                                    ]}>mine</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity 
                                style={[
                                    styles.filterButton,
                                    {borderBottomRightRadius:25},
                                    tab === 'favorite' && styles.filterButtonActive
                                ]}
                                onPress={() => handleTabChange('favorite')}
                            >
                                <AntDesign 
                                    name={favoriteIcon} 
                                    size={width * 0.045} 
                                    style={[
                                        {color: colors.favColor},
                                    
                                       
                                    ]} 
                                />
                                <Text style={[
                                    styles.buttonText,
                                    {fontSize: width * 0.03},
                                ]}>favorite</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Videos Grid Section */}
                    <FlatList
                        data={videos}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        contentContainerStyle={[
                            styles.videosGrid, 
                            { 
                                paddingBottom: insets.bottom + height * 0.02, 
                                marginHorizontal: width * 0.02 
                            }
                        ]}
                        style={[
                            { height: height * 0.5 }, 
                            { paddingBottom: insets.bottom }
                        ]}
                        showsVerticalScrollIndicator={false}
                    />
                    
                    {/* Footer Component */}
                    <Footer/>
                </View>
            </TouchableWithoutFeedback>
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
        marginBottom:5,
    },
    creatorIcon: {
        color: colors.secondary,
        backgroundColor: 'rgba(250, 13, 13, 0.1)',
        borderRadius: 5,
        padding: 1,
      marginHorizontal:3,
       
    },
    studentIcon: {
        color: colors.secondary,
        backgroundColor: 'rgba(250, 13, 13, 0.1)',
        borderRadius: 5,
        padding: 1,
        marginHorizontal:3,
       
    },
    headerText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
      
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
        width: 1,
        height: 80,
        backgroundColor: colors.secondary,
     
    },
    profileMainSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileImage:{
        shadowColor: '#000000ff',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    profileStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statRow: {
        alignItems: 'center',
        justifyContent: 'center',

    },
    statNumber: {
        fontWeight: 'bold',
        color: colors.iconColor,
        fontFamily: fonts.initial,
    },
    statLabel: {
        color: 'rgba(138, 138, 138, 0.9)',
        fontFamily: fonts.initial,
        marginTop: 2,
        alignSelf:"center"
    },

    profileInfoText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
       
    },
    subjectTag: {
        backgroundColor: 'rgba(250, 13, 13, 0.1)',
        borderRadius: 13,
        padding: 11,
        marginHorizontal: 3,
        color: colors.secondary,
        fontSize: 15,
    },
    subjectTagText: {
        color: colors.secondary,
        fontSize: 15,
    },

    filterButtonsContainer: {
         borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        flexDirection: 'row',
        backgroundColor: colors.initial,
    },
    filterButton: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        
    },
   
    buttonText: {
        color:colors.iconColor,
        margin: 3,
        paddingBottom: 5,
    },
    videosGrid: {
        alignItems: 'flex-start', 
        marginVertical: 0,
    },
    videoItem: {
        height: 230,
        backgroundColor: '#ccc',
        borderRadius: 11,
     
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 11,
      
    },
    popupContainer: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
       
       
    },
    popupItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    popupIcon: {
        opacity: 0.8,
    },
    popupText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
        flex: 1,
    },
    popupDivider: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
});

export default Profile;