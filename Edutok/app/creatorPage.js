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
                profileTab: tab
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
                    margin: width * 0.001,
                    borderRadius: width * 0.011,
                    margin:spacing,
                }
            ]}
                onPress={() => handleVideoPress(item)}
        >
            <Image source={{ uri: item.uri }} style={[styles.thumbnail, {
                borderRadius: width * 0.011
            }]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header Section */}
            <View style={[styles.profileHeader,shadowIntensity.bottomShadow, {
                borderBottomLeftRadius: 25,
                borderBottomRightRadius:25,
                marginBottom:height*0.01,
            }]}>
                <View style={{
                    width: width,
                    flexDirection: 'row',
                    alignItems: 'center',
                   flexShrink: 1, flexGrow: 1, 
                   paddingVertical:3,
                 
                   
                }}>  
                    <MaterialCommunityIcons 
                        name="account-tie" 
                        size={width*0.044} 
                        style={[styles.creatorIcon,{ 
                            padding: width*0.005,
                            borderRadius: width*0.008,
                            marginHorizontal: width*0.007
                        }]} 
                    />
                    <Text style={[styles.headerText,{
                        fontSize: width * 0.036,
                        marginLeft: width * 0.02,
                        flex: 1
                    }]}>
                        Educator {creator}
                    </Text>
                </View>
                <View style={[styles.profileMainSection, {
                    marginTop:  height* 0.02,
                    paddingHorizontal: width * 0.02
                }]}>
                    <Image 
                        source={{ uri:profile }} 
                        style={[styles.profileImage, {
                            width: width * 0.24,
                            height: width * 0.24,
                            borderRadius: width * 0.025,
                            shadowOffset: {
                                width: 0,
                                height: height * 0.005,
                            },
                            shadowRadius: width * 0.02
                        }]}
                    />
                    
                    <View style={[styles.verticalLine, {
                        width: width * 0.003,
                        height: height * 0.1,
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
                <View style={ {
                    marginTop: height * 0.015,
                    paddingHorizontal: width * 0.02
                }}>
                    <Text style={[styles.profileInfoText, {
                        fontSize: width * 0.03,
                        marginBottom: height * 0.005,
                        lineHeight: width * 0.035
                    }]}>{bio}</Text>
                      {/* Filter Buttons Section */}
            <View style={[styles.filterButtonsContainer, {
                marginTop: height * 0.015,
               
            }]}>
                <TouchableOpacity 
                onPress={()=>{
                    setFollow(!follow);
                }} style={{backgroundColor:colors.secondary,
                    borderBottomLeftRadius:25,
                    borderBottomRightRadius:25,
                    width:width,
                }}>
                    <Text style={[styles.buttonText, {
                        alignSelf:"center",
                        margin: width * 0.003,
                        padding: height * 0.005,
                        fontSize:height*0.025,
                    }]}>{follow?"unfollow":"follow"}</Text>
                </TouchableOpacity>
                
            </View>
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
                    {paddingHorizontal: width * 0.001},
                    { paddingBottom: insets.bottom + height * 0.01 },
                ]}
                style={[
                    { height: height * 0.5 }, 
                    { paddingBottom: insets.bottom },
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
    },
    creatorIcon: {
        color: colors.secondary,
        backgroundColor: 'rgba(250, 13, 13, 0.1)',
    },

    headerText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
    },
    
    profileMainSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    
    profileImage: {
        shadowColor: '#000000ff',
        shadowOffset: {
            width: 0,
        },
        shadowOpacity: 0.3,
        elevation: 8,
    },
    
    verticalLine: {
        backgroundColor: colors.secondary,
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
        color: 'rgba(118, 118, 118, 0.9)',
        fontFamily: fonts.initial,
        alignSelf: "center"
    },

    profileInfoText: {
        color: colors.iconColor,
        fontFamily: fonts.initial,
    },
    filterButtonsContainer: {
        alignSelf: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    filterButton: {
        backgroundColor: colors.initial,
        borderWidth: 1,
        borderColor: colors.iconColor,
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: colors.initial,
    },
    videosGrid: {
        alignItems: 'flex-start', 
        marginVertical: 0,
    },
    videoItem: {
        backgroundColor: '#ccc',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },

});

export default CreatorPage;