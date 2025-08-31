import {useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Components
import Footer from '../src/components/footer';

// Constants
import {colors, fonts,shadowIntensity} from '../src/constants';

// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Mock Data - Will be replaced with API calls
import { commonVideos} from '../src/mockData';

function CreatorPage() {
    // State Management
    // TODO: Replace with actual user data from backend
      const { creator } = useLocalSearchParams();
        const { profile } = useLocalSearchParams();
        const{followers}=useLocalSearchParams();
        const{following}=useLocalSearchParams();
        const{bio}=useLocalSearchParams();
          const { followed } = useLocalSearchParams();
   const [follow,setFollow]=useState(followed);
   const Videos = commonVideos.filter(v => v.creator === creator);

    // Layout Calculations
    const { height, width } = useWindowDimensions();
    const spacing = 8; 
    const itemWidthCreator = ((width - spacing * 4) / 3);
    const insets = useSafeAreaInsets();

    // Video Data State
    // TODO: Replace with API fetched data
    const [videos, setVideos] = useState(commonVideos); // creator's videos Will be fetched from backend

    //for navigation
     const router = useRouter();

    const handleVideoPress = (selectedVideo) => {
        const videoIndex = videos.findIndex(video => video.id === selectedVideo.id);
        router.push({
            pathname: '/fullScreen',
            params: { 
                initialIndex: videoIndex,
                videoList: 'profile',
                profileTab: 'mine'
            }
        });
    };

    // Video Item Renderer
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.videoItem, 
                { 
                    width: itemWidthCreator, 
                    height: height * 0.25,
                    margin: spacing / 2,
                    borderRadius: 11,
                }
            ]}
                onPress={() => handleVideoPress(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header Section */}
            <View style={[styles.profileHeader, shadowIntensity.bottomShadow]}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <MaterialCommunityIcons 
                        name="account-tie" 
                        size={width*0.044} 
                        style={styles.creatorIcon}
                    />
                    <Text style={[styles.headerText, { fontSize: width * 0.048 }]}>
                        Educator {creator}
                    </Text>
                </View>

                {/* Profile Main Section */}
                <View style={[styles.profileMainSection, {
                    marginTop: height * 0.02,
                    paddingHorizontal: width * 0.02
                }]}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImageBorder} />
                        <Image 
                            source={{ uri: profile }} 
                            style={[styles.profileImage, {
                                width: width * 0.24,
                                height: width * 0.24,
                                borderRadius: (width * 0.24) / 2,
                            }]}
                        />
                    </View>
                    
                    <View style={[styles.profileStatsContainer, {
                        paddingHorizontal: width * 0.15,
                        paddingVertical: height * 0.02, 
                        flex: 1,
                        marginLeft: width * 0.05
                    }]}>
                        <View style={styles.statRow}>
                            <Text style={[styles.statNumber, {
                                fontSize: width * 0.045
                            }]}>{following}</Text>
                            <Text style={[styles.statLabel, {
                                fontSize: width * 0.025,
                                marginTop: height * 0.002
                            }]}>Following</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={[styles.statNumber, {
                                fontSize: width * 0.045
                            }]}>{followers > 1000 ? `${(followers / 1000).toFixed(1)}k` : followers}</Text>
                            <Text style={[styles.statLabel, {
                                fontSize: width * 0.025,
                                marginTop: height * 0.002
                            }]}>Followers</Text>
                        </View>
                    </View>
                </View>

                {/* Bio Section */}
                <View style={{
                    marginTop: height * 0.015,
                    paddingHorizontal: width * 0.02
                }}>
                    <Text style={[styles.profileInfoText, {
                        fontSize: width * 0.03,
                        marginBottom: height * 0.005,
                        lineHeight: width * 0.035
                    }]}>{bio}</Text>
                </View>

                {/* Follow Button Section */}
                <View style={[styles.filterButtonsContainer, {
                    marginTop: height * 0.005
                }]}>
                    <TouchableOpacity 
                        onPress={() => {
                            setFollow(!follow);
                        }} 
                        style={[styles.followButton, {
                            backgroundColor: follow ? 'rgba(93, 131, 202, 0.15)' : colors.secondary,
                            borderColor: follow ? colors.secondary : 'transparent',
                            borderWidth: follow ? 1 : 0,
                        }]}
                    >
                        <Text style={[styles.followButtonText, {
                            color: follow ? colors.secondary : colors.initial,
                            fontSize: height * 0.025,
                        }]}>{follow ? "Unfollow" : "Follow"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Videos Grid Section */}
            <FlatList
                data={Videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={[
                    styles.videosGrid, 
                    {
                        paddingBottom: insets.bottom + height * 0.04,
                        marginHorizontal: width * 0.02,
                        marginBottom: height * 0.03,
                        marginTop: height * 0.005,
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
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 1,
    },
    creatorIcon: {
        color: colors.secondary,
        backgroundColor: 'rgba(93, 131, 202, 0.15)',
        borderRadius: 20,
        padding: 8,
        marginRight: 10,
    },
    headerText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
        fontWeight: '600',
        flex: 1,
        marginLeft: 5,
    },
    profileImageContainer: {
        position: "relative"
    },
    profileImageBorder: {
        position: "absolute",
        top: -6,
        left: -6,
        right: -6,
        bottom: -6,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: colors.secondary
    },
    profileMainSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileImage: {
        borderWidth: 1,
        borderColor: "transparent",
    },
    profileStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(24, 90, 214, 0.08)',
        borderRadius: 250,
        marginLeft: 20,
    },
    statRow: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
    },
    statNumber: {
        fontWeight: 'bold',
        color: colors.iconColor,
        fontFamily: fonts.initial,
        fontSize: 18,
    },
    statLabel: {
        color: 'rgba(138, 138, 138, 0.9)',
        fontFamily: fonts.initial,
        marginTop: 4,
        alignSelf: "center",
        fontSize: 12,
        fontWeight: '500',
    },
    profileInfoText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
        lineHeight: 22,
    },
    filterButtonsContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        backgroundColor: colors.initial,
        paddingTop: 8,
        paddingBottom: 4,
        shadowColor: '#000000ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    followButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 20,
        borderRadius: 25,
        marginBottom: 8,
    },
    followButtonText: {
        fontFamily: fonts.initial,
        fontWeight: '600',
    },
    videosGrid: {
        alignItems: 'flex-start',
    },
    videoItem: {
        backgroundColor: '#ccc',
        borderRadius: 11,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 11,
    },
});

export default CreatorPage;