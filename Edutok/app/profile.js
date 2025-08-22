import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';

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

  // Videos
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('saved');

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
      let endpoint = '';
      if (type === 'saved') endpoint = '/api/videos/saved';
      if (type === 'mine') endpoint = '/api/videos/mine';
      if (type === 'favorite') endpoint = '/api/videos/favorites';

      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();

      setVideos(data.videos || []);
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
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
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

  const userRole = user.role || 'student';
  const userName = user.name || '';
  const userBio = user.bio || '';
  const userSubjects = user.subjects || [];
  const userProfileImage = user.profileImage || null;
  const following = user.following || 0;
  const followers = user.followers || 0;

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
                  right: width * 0.02,
                  top: height * 0.05,
                  zIndex: 1000,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.popupItem,
                  {
                    paddingVertical: height * 0.0015,
                    paddingHorizontal: width * 0.02,
                    borderRadius: width * 0.025,
                    marginVertical: height * 0.0002,
                  },
                ]}
              >
                <MaterialIcons
                  name="logout"
                  size={width * 0.04}
                  color={colors.iconColor}
                  style={[styles.popupIcon, { marginRight: width * 0.03 }]}
                />
                <Text style={[styles.popupText, { fontSize: width * 0.032, fontWeight: '500' }]}>
                  Log Out
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.popupDivider,
                  { marginVertical: height * 0.01, marginHorizontal: width * 0.02 },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.popupItem,
                  {
                    paddingVertical: height * 0.0015,
                    paddingHorizontal: width * 0.02,
                    borderRadius: width * 0.025,
                    marginVertical: height * 0.0002,
                  },
                ]}
              >
                <MaterialIcons
                  name="delete-forever"
                  size={width * 0.04}
                  color={colors.iconColor}
                  style={[styles.popupIcon, { marginRight: width * 0.03 }]}
                />
                <Text style={[styles.popupText, { fontSize: width * 0.032, fontWeight: '500' }]}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Profile Header Section */}
          <View style={[styles.profileHeader, shadowIntensity.bottomShadow]}>
            <View
              style={{
                width: width,
                flexDirection: 'row',
                alignItems: 'center',
                flexShrink: 1,
                flexGrow: 1,
                paddingVertical: 3,
              }}
            >
              {userRole === 'creator' ? (
                <MaterialCommunityIcons
                  name="account-tie"
                  size={width * 0.044}
                  style={[
                    styles.creatorIcon,
                    { padding: width * 0.005, borderRadius: width * 0.008, marginHorizontal: width * 0.007 },
                  ]}
                />
              ) : (
                <FontAwesome5
                  name="book-reader"
                  size={width * 0.044}
                  style={[
                    styles.studentIcon,
                    { padding: width * 0.005, borderRadius: width * 0.008, marginHorizontal: width * 0.007 },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.headerText,
                  { fontSize: width * 0.036, marginLeft: width * 0.02, flex: 1 },
                ]}
              >
                {userRole === 'creator' ? 'Educator ' : 'Student '}
                {userName}
              </Text>
              <MaterialIcons
                name="edit-note"
                size={width * 0.044}
                style={[styles.editIcon, { right: width * 0.05, marginRight: width * 0.05 }]}
                onPress={() => router.push('/editProfile')}
              />
              <Entypo
                name="dots-three-vertical"
                size={width * 0.023}
                style={[styles.menuIcon, { right: width * 0.02, marginRight: width * 0.02 }]}
                onPress={() => setIsPopupVisible(true)}
              />
            </View>

            <View
              style={[
                styles.profileMainSection,
                { marginTop: height * 0.02, paddingHorizontal: width * 0.02 },
              ]}
            >
              <Image
                source={{ uri: userProfileImage }}
                style={[
                  styles.profileImage,
                  {
                    width: width * 0.24,
                    height: width * 0.24,
                    borderRadius: width * 0.025,
                  },
                ]}
              />

              <View
                style={[
                  styles.verticalLine,
                  { width: width * 0.003, height: width * 0.2, marginLeft: width * 0.02 },
                ]}
              />

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
                style={[styles.filterButton, { borderBottomLeftRadius: 25 }]}
                onPress={() => handleTabChange('saved')}
              >
                <Fontisto name="bookmark" size={width * 0.045} style={{ color: colors.saveColor }} />
                <Text style={[styles.buttonText, { fontSize: width * 0.03 }]}>saved</Text>
              </TouchableOpacity>

              {userRole === 'creator' && (
                <TouchableOpacity style={styles.filterButton} onPress={() => handleTabChange('mine')}>
                  <MaterialIcons
                    name="video-library"
                    size={width * 0.045}
                    style={{ color: 'gray' }}
                  />
                  <Text style={[styles.buttonText, { fontSize: width * 0.03 }]}>mine</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.filterButton, { borderBottomRightRadius: 25 }]}
                onPress={() => handleTabChange('favorite')}
              >
                <AntDesign name="heart" size={width * 0.045} style={{ color: colors.favColor }} />
                <Text style={[styles.buttonText, { fontSize: width * 0.03 }]}>favorite</Text>
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
                marginHorizontal: width * 0.02,
                marginBottom: height * 0.03,
                marginTop: height * 0.005,
              },
            ]}
            style={[{ height: height * 0.5 }, { paddingBottom: insets.bottom }]}
            showsVerticalScrollIndicator={false}
          />

          {/* Footer Component */}
          <Footer />
        </View>
      </TouchableWithoutFeedback>
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 5,
  },
  creatorIcon: {
    color: colors.secondary,
    backgroundColor: 'rgba(250, 13, 13, 0.1)',
    borderRadius: 5,
    padding: 1,
    marginHorizontal: 3,
  },
  studentIcon: {
    color: colors.secondary,
    backgroundColor: 'rgba(250, 13, 13, 0.1)',
    borderRadius: 5,
    padding: 1,
    marginHorizontal: 3,
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
  profileImage: {
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
    alignSelf: 'center',
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
    color: colors.iconColor,
    margin: 3,
    paddingBottom: 5,
  },
  videosGrid: {
    alignItems: 'flex-start',
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
    backgroundColor: 'white',
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