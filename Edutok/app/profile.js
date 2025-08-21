import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
import CONFIG from "../config";
const API_URL = CONFIG.API_URL;

function Profile() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Auth + user state
  const [tokenChecked, setTokenChecked] = useState(false);
  const [user, setUser] = useState(null); // full user data from backend

  // UI state
  const spacing = 8;
  const itemWidthCreator = (width - spacing * 4) / 3;
  const itemWidthLearner = (width - spacing * 2) / 2;

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
          headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
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

  if (!tokenChecked) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.profileHeader, shadowIntensity.bottomShadow, { height: height * 0.3 }]}>
        <View style={{ width: width, height: height * 0.05, flexDirection: 'row', alignItems: 'center' }}>
          {user?.role === 'creator' ? (
            <MaterialCommunityIcons name="account-tie" size={24} style={styles.creatorIcon} />
          ) : (
            <FontAwesome5 name="book-reader" size={20} style={styles.studentIcon} />
          )}
          <Text style={styles.headerText}>
            {user?.role === 'creator' ? 'Educator ' : 'Student '}{user?.name}
          </Text>

          <MaterialIcons
            name="edit-note"
            size={24}
            style={styles.editIcon}
            onPress={() => router.push('/editProfile')}
          />
          <Entypo name="dots-three-vertical" size={14} style={styles.menuIcon} />
        </View>

        <View style={styles.verticalLine} />

        <View style={styles.profileInfoContainer}>
          <Text style={styles.profileInfoText}>following: {user?.following?.length || 0}</Text>
          {user?.role === 'creator' && (
            <Text style={styles.profileInfoText}>followers: {user?.followers?.length || 0}</Text>
          )}
          <Text style={styles.profileInfoText}>Current interests: {user?.interests || '-'}</Text>
          <Text style={styles.profileInfoText}>Bio: {user?.bio || '-'}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            shadowIntensity.bottomShadow,
            user?.role === 'creator' ? { width: itemWidthCreator } : { width: itemWidthLearner },
            { marginHorizontal: spacing / 2 },
          ]}
          onPress={() => handleTabChange('saved')}
        >
          <Fontisto name={activeTab === 'saved' ? 'bookmark-alt' : 'bookmark'} size={20} style={{ color: colors.saveColor }} />
          <Text style={styles.buttonText}>saved</Text>
        </TouchableOpacity>

        {user?.role === 'creator' && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              shadowIntensity.bottomShadow,
              { width: itemWidthCreator, marginHorizontal: spacing / 2 },
            ]}
            onPress={() => handleTabChange('mine')}
          >
            <MaterialIcons name={activeTab === 'mine' ? 'video-camera-front' : 'video-camera-back'} size={20} color="gray" />
            <Text style={styles.buttonText}>mine</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.filterButton,
            shadowIntensity.bottomShadow,
            user?.role === 'creator' ? { width: itemWidthCreator } : { width: itemWidthLearner },
            { marginHorizontal: spacing / 2 },
          ]}
          onPress={() => handleTabChange('favorite')}
        >
          <AntDesign name={activeTab === 'favorite' ? 'heart' : 'hearto'} size={20} style={{ color: colors.favColor }} />
          <Text style={styles.buttonText}>favorite</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={[styles.videosGrid, { paddingBottom: insets.bottom + 10 }]}
          style={[{ height: height * 0.5 }, { paddingBottom: insets.bottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer */}
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screenColor },
  profileHeader: { backgroundColor: colors.initial, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  creatorIcon: { color: colors.iconColor, paddingRight: 0, paddingLeft: 3 },
  studentIcon: { color: colors.iconColor, marginRight: 5, paddingLeft: 5 },
  headerText: { paddingTop: 8, paddingBottom: 5, paddingRight: 5, color: colors.iconColor, fontFamily: fonts.initial, fontSize: 13 },
  menuIcon: { position: 'absolute', right: 10, color: colors.iconColor },
  editIcon: { position: 'absolute', right: 30, color: colors.iconColor },
  verticalLine: { width: 2, height: '65%', backgroundColor: colors.secondary, position: 'absolute', left: '45%', top: 50 },
  profileInfoContainer: { position: 'absolute', flexDirection: 'column', alignSelf: 'flex-start', justifyContent: 'center', left: '45%', transform: [{ translateY: 50 }] },
  profileInfoText: { color: colors.iconColor, fontFamily: fonts.initial, fontSize: 11, paddingTop: 7, paddingLeft: 20 },
  filterButtonsContainer: { alignSelf: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10, marginBottom: 4, paddingHorizontal: 4 },
  filterButton: { backgroundColor: colors.initial, borderWidth: 1, borderColor: colors.iconColor, borderRadius: 11, alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: 'black', margin: 3, paddingBottom: 5 },
  videosGrid: { alignItems: 'flex-start', alignSelf: 'center', marginVertical: 0 },
  videoItem: { height: 250, backgroundColor: '#ccc', borderRadius: 11 },
  thumbnail: { width: '100%', height: '100%', borderRadius: 11 },
});

export default Profile;
