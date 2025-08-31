import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';
// Import video data functions
import { getSavedVideos, getFavoriteVideos, getMyVideos } from '../src/mockData';

// Icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Config
import CONFIG from '../config';
const API_URL = CONFIG.API_URL;

function Profile() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Auth + user state
  const [tokenChecked, setTokenChecked] = useState(false);
  const [user, setUser] = useState(null); // full user data from backend
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // UI state
  const spacing = 8;
  const itemWidthCreator = (width - spacing * 4) / 3;

  // Report popup state
  const [isReportPopupVisibleMap, setIsReportPopupVisibleMap] = useState({});

  // Videos
  const [videos, setVideos] = useState(getSavedVideos());
  const [loading, setLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('saved');

  // ========== SCROLL ANIMATION REFS ==========
  const scrollY = useRef(new Animated.Value(0)).current;

  // Require login: if no token, redirect to login
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          router.replace('/login');
          return;
        }

        // Fetch user profile
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setUser(data.user);

        // Load saved videos by default
        await fetchVideos('saved', token);

        setTokenChecked(true);
      } catch (err) {
        Alert.alert('Error', 'Auth check failed');
        router.replace('/login');
      }
    })();
  }, [router]);

  const fetchVideos = async (type, token) => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      let videoData = [];
      if (type === 'saved') videoData = getSavedVideos();
      if (type === 'mine') videoData = getMyVideos();
      if (type === 'favorite') videoData = getFavoriteVideos();

      setVideos(videoData);
      setActiveTab(type);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Could not load videos');
    }
  };

  const handleTabChange = async (tab) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    await fetchVideos(tab, token);
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoItem, { width: itemWidthCreator, margin: spacing / 2 }]}
      onPress={() => {
        const videoIndex = videos.findIndex(video => video.id === item.id);
        router.push({
          pathname: '/fullScreen',
          params: {
            initialIndex: videoIndex,
            videoList: 'profile',
            profileTab: activeTab
          }
        });
      }}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      
      {/* Video overlay info */}
      <View style={styles.videoOverlay}>
        <Text style={styles.videoOverlayText} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // While checking token, show loader
  if (!tokenChecked) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.iconColor, margin: 20 }}>No user data found</Text>
      </SafeAreaView>
    );
  }

  /*  const userRole = user.role || 'student';
    const userName = user.name || '';
    const userBio = user.bio || '';
    const userSubjects = user.subjects || [];
    const userProfileImage = user.profileImage || null;
    const following = user.following || 0;
    const followers = user.followers || 0;*/
    
  // TEMPORARY: Sample profile data for visual testing - Remove when implementing real data
  const userRole = user.role || 'creator';
  const userName = user.name || 'Dr. Sarah Johnson';
  const userBio = user.bio || 'Passionate mathematics educator with 8+ years of experience. Specializing in calculus, linear algebra, and mathematical modeling. 📚✨';
  const userSubjects = user.subjects || ['Mathematics', 'Calculus', 'Linear Algebra', 'Statistics', 'Physics'];
  // TEMPORARY: Profile image - Using mock data image for visual testing
  const userProfileImage = user.profileImage || 'https://randomuser.me/api/portraits/women/44.jpg';
  const following = user.following || 45;
  const followers = user.followers || 1234;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setIsPopupVisible(false)}>
        <View style={{ flex: 1 }}>
          {/* Popup Menu */}
          {isPopupVisible && (
            <View
              style={[
                styles.popupContainer,
                shadowIntensity.bottomShadow,
                                 {
                   position: 'absolute',
                   right: 20,
                   top: insets.top + 80,
                   zIndex: 1000,
                   maxWidth: width * 0.45,
                   minWidth: 220,
                 },
              ]}
            >
                             <TouchableOpacity
                 style={styles.popupItem}
               >
                                   <MaterialIcons
                    name="logout"
                    size={18}
                    color={colors.iconColor}
                    style={styles.popupIcon}
                  />
                 <Text style={styles.popupText}>
                   Log Out
                 </Text>
               </TouchableOpacity>

                             <View style={styles.popupDivider} />

                             <TouchableOpacity
                 style={styles.popupItem}
               >
                                   <MaterialIcons
                    name="delete-forever"
                    size={18}
                    color={colors.iconColor}
                    style={styles.popupIcon}
                  />
                 <Text style={styles.popupText}>
                   Delete Account
                 </Text>
               </TouchableOpacity>
            </View>
          )}

          {/* Profile Header Section */}
          {/* TEMPORARY: Using sample data for visual testing - Replace with real user data */}
          <View style={[styles.profileHeader]}>
            {/* Fixed header row with proper spacing */}
            <View style={styles.headerRow}>
              {userRole === 'creator' ? (
                <MaterialCommunityIcons
                  name="account-tie"
                  size={width * 0.044}
                  style={styles.creatorIcon}
                />
              ) : (
                <FontAwesome5
                  name="book-reader"
                  size={width * 0.044}
                  style={styles.studentIcon}
                />
              )}
              <Text style={[styles.headerText, { fontSize: width * 0.048 }]}>
                {userRole === 'creator' ? 'Educator ' : 'Student '}
                {userName}
              </Text>
              <View style={styles.headerIconsContainer}>
                <MaterialIcons
                  name="edit-note"
                  size={width * 0.044}
                  style={styles.editIcon}
                  onPress={() => router.push('/editProfile')}
                />
                <Entypo
                  name="dots-three-vertical"
                  size={width * 0.044}
                  style={styles.menuIcon}
                  onPress={() => setIsPopupVisible(true)}
                />
              </View>
            </View>
 
            <View
              style={[
                styles.profileMainSection,
                { marginTop: height * 0.02, paddingHorizontal: width * 0.02 },
              ]}
            >
              <View style={styles.profileImageContainer}>           
                <View style={styles.profileImageBorder} />
                <Image
                  source={{ uri: userProfileImage }}
                  style={[
                    styles.profileImage,
                    {
                      width: width * 0.24,
                      height: width * 0.24,
                      borderRadius: (width * 0.24) / 2,
                    },
                  ]}
                  defaultSource={require('../assets/images/icon.png')}
                  onError={() => console.log('Profile image failed to load')}
                />
              </View>

              <View
                style={[
                  styles.profileStatsContainer,
                  {
                    paddingHorizontal: width * 0.15,
                    paddingVertical: height * 0.02,
                    flex: 1,
                    marginLeft: width * 0.05,
                  },
                ]}
              >
                <View style={styles.statRow}>
                  <Text style={[styles.statNumber, { fontSize: width * 0.045 }]}>{following}</Text>
                  <Text style={[styles.statLabel, { fontSize: width * 0.025 }]}>Following</Text>
                </View>
                {userRole === 'creator' && (
                  <View style={styles.statRow}>
                    <Text style={[styles.statNumber, { fontSize: width * 0.045 }]}>
                      {followers > 1000 ? `${(followers / 1000).toFixed(1)}k` : followers}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: width * 0.025 }]}>Followers</Text>
                  </View>
                )}
              </View>
            </View>

            {/* TEMPORARY: Bio and Subjects Section - Replace with real user data */}
            <View style={{ marginTop: height * 0.015, paddingHorizontal: width * 0.02 }}>
              <Text
                style={[
                  styles.profileInfoText,
                  { fontSize: width * 0.03, marginBottom: height * 0.005, lineHeight: width * 0.035 },
                ]}
              >
                {userBio}
              </Text>

              <View style={styles.subjectsContainer}>
                {userSubjects.map((subject, index) => (
                  <View
                    key={index}
                    style={[
                      styles.subjectTag,
                      {
                        paddingHorizontal: width * 0.02,
                        paddingVertical: height * 0.008,
                        margin: width * 0.01,
                        borderRadius: width * 0.015,
                      },
                    ]}
                  >
                    <Text style={[styles.subjectTagText, { fontSize: width * 0.025 }]}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Filter Buttons Section */}
            <View style={[styles.filterButtonsContainer, { marginTop: height * 0.005 }]}>
              <TouchableOpacity
                style={[
                  styles.filterButton, 
                  { borderBottomLeftRadius: 25 },
                  activeTab === 'saved' && styles.activeFilterButton
                ]}
                onPress={() => handleTabChange('saved')}
              >
                <Fontisto 
                  name="bookmark-alt" 
                  size={width * 0.045} 
                  style={{ 
                    color: '#f59e0b' 
                  }} 
                />
                <Text style={[
                  styles.buttonText, 
                  { fontSize: width * 0.03 },
                  activeTab === 'saved' && styles.activeButtonText
                ]}>saved</Text>
              </TouchableOpacity>

              {userRole === 'creator' && (
                <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    activeTab === 'mine' && styles.activeFilterButton
                  ]} 
                  onPress={() => handleTabChange('mine')}
                >
                  <MaterialIcons
                    name="video-library"
                    size={width * 0.045}
                    style={{ 
                      color: 'gray' 
                    }}
                  />
                  <Text style={[
                    styles.buttonText, 
                    { fontSize: width * 0.03 },
                    activeTab === 'mine' && styles.activeButtonText
                  ]}>mine</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.filterButton, 
                  { borderBottomRightRadius: 25 },
                  activeTab === 'favorite' && styles.activeFilterButton
                ]}
                onPress={() => handleTabChange('favorite')}
              >
                <AntDesign 
                  name="heart" 
                  size={width * 0.045} 
                  style={{ 
                    color: '#ef4444' 
                  }} 
                />
                <Text style={[
                  styles.buttonText, 
                  { fontSize: width * 0.03 },
                  activeTab === 'favorite' && styles.activeButtonText
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
                paddingBottom: insets.bottom + height * 0.04,
                marginHorizontal: width * 0.02,
                marginBottom: height * 0.03,
                marginTop: height * 0.005,
              },
            ]}
            style={[{ height: height * 0.5 }, { paddingBottom: insets.bottom }]}
            showsVerticalScrollIndicator={false}
          />

         
        </View>
      </TouchableWithoutFeedback>
      <Footer />
    </SafeAreaView>
  );
}

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
  // New header row style
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 1,
  },
  // Container for header icons
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorIcon: {
    color: colors.secondary,
    backgroundColor: 'rgba(93, 131, 202, 0.15)',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  studentIcon: {
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
  menuIcon: {
    color: colors.secondary,
    backgroundColor: 'rgba(93, 131, 202, 0.15)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  editIcon: {
    color: colors.secondary,
    backgroundColor: 'rgba(93, 131, 202, 0.15)',
    borderRadius: 20,
    padding: 8,
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
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  profileInfoText: {
    color: colors.iconColor,
    fontFamily: fonts.initial,
    lineHeight: 22,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 1,
  },
  subjectTag: {
    backgroundColor: 'rgba(93, 131, 202, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(93, 131, 202, 0.2)',
  },
  subjectTagText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonsContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    backgroundColor: colors.initial,
    paddingTop: 8,
    paddingBottom: 4,
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 15,
    backgroundColor: 'rgba(93, 131, 202, 0.05)',
  },
  buttonText: {
    color: colors.iconColor,
    margin: 4,
    paddingBottom: 2,
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterButton: {
    backgroundColor: 'rgba(93, 131, 202, 0.15)',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  activeButtonText: {
    color: colors.secondary,
    fontWeight: '600',
  },
  videosGrid: {
    alignItems: 'center',
  },
  videoItem: {
    height: 180,
    backgroundColor: '#ccc',
    borderRadius: 11,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
  videoOverlayText: {
    color: 'white',
    fontSize: 10,
    fontFamily: fonts.initial,
    fontWeight: '500',
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 131, 202, 0.1)',
  },
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginVertical: 2,
    backgroundColor: 'rgba(93, 131, 202, 0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  popupIcon: {
    opacity: 0.9,
    marginRight: 12,
  },
  popupText: {
    color: colors.iconColor,
    fontFamily: fonts.initial,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  popupDivider: {
    height: 1,
    backgroundColor: 'rgba(93, 131, 202, 0.15)',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default Profile;