import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  useWindowDimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { colors, fonts, shadowIntensity } from '../src/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import CONFIG from '../config';
const API_URL = CONFIG.API_URL;

function EditProfile() {
  const { height, width } = useWindowDimensions();
  const router = useRouter();

  // -----------------------
  // States
  // -----------------------
  const [bio, setBio] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [userName, setUserName] = useState('');
  const [isInterestVisible, setIsInterestVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [userRole, setUserRole] = useState('student');

  // -----------------------
  // Load current user data
  // -----------------------
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          router.replace('/login');
          return;
        }

        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.user) {
          const u = res.data.user;
          setUserName(u.name || '');
          setBio(u.bio || '');
          setAreasOfInterest(u.subjects || []);
          setProfileImage(u.profileImage || null);
          setFollowing(u.following || 0);
          setFollowers(u.followers || 0);
          setUserRole(u.role || 'student');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err.message);
        Alert.alert('Error', 'Could not load profile');
        router.replace('/login');
      }
    })();
  }, [router]);

  // -----------------------
  // Checkbox Component
  // -----------------------
  const CheckBox = ({ options, checkedValues, onChange }) => {
    let updatedCheckedValues = [...checkedValues];

    return (
      <View>
        {options.map((option) => {
          const active = updatedCheckedValues.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                if (active) {
                  updatedCheckedValues = updatedCheckedValues.filter(
                    (val) => val !== option.value
                  );
                } else {
                  updatedCheckedValues.push(option.value);
                }
                onChange(updatedCheckedValues);
              }}
              style={[styles.checkboxContainer, { marginVertical: height * 0.005 }]}
            >
              <Fontisto
                name={active ? 'radio-btn-active' : 'radio-btn-passive'}
                size={20}
                style={{ marginRight: width * 0.02 }}
                color={active ? colors.secondary : '#ccc'}
              />
              <Text style={[styles.checkboxLabel, { fontSize: width * 0.033 }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // -----------------------
  // Image Selection Handler
  // -----------------------
  const handleImageSelect = () => {
    // TODO: Implement image picker functionality
    Alert.alert('Image Selection', 'Image picker functionality will be implemented here');
  };

  // -----------------------
  // Save Profile Handler
  // -----------------------
  const handleSave = async () => {
    if (areasOfInterest.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one area of interest');
      return;
    }

    if (!userName.trim()) {
      Alert.alert('Validation Error', 'Username cannot be empty');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please login again.');
        return;
      }

      await axios.put(
        `${API_URL}/api/auth/profile`,
        {
          name: userName,
          bio,
          subjects: areasOfInterest,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Profile updated successfully!');
      router.push('/profile');
    } catch (err) {
      console.error('Profile update failed:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={[
              styles.profileHeader,
              {
                borderBottomLeftRadius: width * 0.06,
                borderBottomRightRadius: width * 0.06,
              },
            ]}
          >
          {/* Fixed header row with proper spacing */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Ionicons
                name="caret-back-outline"
                size={width * 0.044}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={[styles.headerText, { fontSize: width * 0.048 }]}>
              Edit
            </Text>
          </View>

          {/* Profile Main Section */}
          <View
            style={[
              styles.profileMainSection,
              { marginTop: height * 0.02, paddingHorizontal: width * 0.02 },
            ]}
          >
            <View style={styles.profileImageContainer}>           
              <View style={styles.profileImageBorder} />
              <TouchableOpacity style={styles.profileImageWrapper} onPress={handleImageSelect}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={[
                      styles.profileImage,
                      {
                        width: width * 0.24,
                        height: width * 0.24,
                        borderRadius: (width * 0.24) / 2,
                      },
                    ]}
                    onError={() => console.log('Profile image failed to load')}
                  />
                ) : (
                  <View style={styles.defaultProfileImage}>
                    <Ionicons name="person" size={width * 0.12} color={colors.secondary} />
                  </View>
                )}
                <View style={styles.editImageOverlay}>
                  <Ionicons name="camera" size={width * 0.04} color="#ffffff" />
                </View>
              </TouchableOpacity>
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

          {/* Bio and Subjects Section */}
          <View style={{ marginTop: height * 0.015, paddingHorizontal: width * 0.02 }}>
            <Text
              style={[
                styles.profileInfoText,
                { fontSize: width * 0.03, marginBottom: height * 0.005, lineHeight: width * 0.035 },
              ]}
            >
              {bio}
            </Text>

            <View style={styles.subjectsContainer}>
              {areasOfInterest.map((subject, index) => (
                <View
                  key={index}
                  style={[
                    styles.subjectTag,
                    {
                      paddingHorizontal: width * 0.028,
                      paddingVertical: height * 0.008,
                      marginHorizontal: width * 0.008,
                      borderRadius: width * 0.025,
                    },
                  ]}
                >
                  <Text style={[styles.subjectTagText, { fontSize: height * 0.015 }]}>
                    {subject}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Areas of Interest Popup */}
        {isInterestVisible && (
          <>
            <TouchableWithoutFeedback onPress={() => setIsInterestVisible(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <View
              style={[
                shadowIntensity.bottomShadow,
                styles.areaOfInterest,
                { padding: width * 0.05, borderRadius: width * 0.045 },
              ]}
            >
              <Text
                style={[styles.popupTitle, { fontSize: width * 0.038, padding: width * 0.025 }]}
              >
                Choose all that apply
              </Text>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                <CheckBox
                  options={[
                    { label: 'Math', value: 'Math' },
                    { label: 'Programming', value: 'Programming' },
                    { label: 'Biology', value: 'Biology' },
                    { label: 'Language', value: 'Language' },
                    { label: 'History', value: 'History' },
                    { label: 'CS', value: 'CS' },
                  ]}
                  checkedValues={areasOfInterest}
                  onChange={(newInterests) => setAreasOfInterest(newInterests)}
                />
              </ScrollView>
            </View>
          </>
        )}

        {/* Name Input */}
        <View style={[styles.inputCard, { marginHorizontal: width * 0.05, marginTop: height * 0.024 }]}>
          <View style={styles.inputHeader}>
            <Ionicons name="person-outline" size={20} color={colors.secondary} />
            <Text style={[styles.title, { paddingVertical: height * 0.004, fontSize: height * 0.025, marginLeft: 10 }]}>
              Full Name
            </Text>
          </View>
          <TextInput
            maxLength={60}
            value={userName}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            style={[
              styles.enhancedTextInput,
              {
                borderRadius: width * 0.028,
                paddingHorizontal: width * 0.015,
                paddingVertical: height * 0.012,
              },
            ]}
            onChangeText={(newName) => setUserName(newName)}
          />
          <Text style={styles.characterCount}>{userName.length}/60</Text>
        </View>

        {/* Bio Input */}
        <View style={[styles.inputCard, { marginHorizontal: width * 0.05, marginTop: height * 0.024 }]}>
          <View style={styles.inputHeader}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.secondary} />
            <Text style={[styles.title, { paddingVertical: height * 0.004, fontSize: height * 0.025, marginLeft: 10 }]}>
              Bio
            </Text>
          </View>
          <TextInput
            maxLength={150}
            value={bio}
            placeholder="Tell us about yourself, your interests, and what you're passionate about..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.enhancedTextInput,
              styles.bioInput,
              {
                borderRadius: width * 0.028,
                paddingHorizontal: width * 0.015,
                paddingVertical: height * 0.012,
                minHeight: 100,
              },
            ]}
            onChangeText={(newBio) => setBio(newBio)}
          />
          <Text style={styles.characterCount}>{bio.length}/150</Text>
        </View>

        {/* Areas of Interest Display */}
        <View style={[styles.inputCard, { marginHorizontal: width * 0.05, marginTop: height * 0.024 }]}>
          <View style={styles.inputHeader}>
            <Ionicons name="bookmark-outline" size={20} color={colors.secondary} />
            <Text style={[styles.title, { paddingVertical: height * 0.004, fontSize: height * 0.025, marginLeft: 10 }]}>
              Areas of Interest
            </Text>
          </View>
          
          {areasOfInterest.length > 0 ? (
            <View style={styles.interestsDisplay}>
              {areasOfInterest.map((item, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noInterestsText}>No interests selected yet</Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.editInterestBtn,
              { marginTop: height * 0.015, borderRadius: width * 0.025, paddingHorizontal: width * 0.025 },
            ]}
            onPress={() => setIsInterestVisible(true)}
          >
            <Text style={{alignSelf:'center', color: colors.initial, fontSize: width * 0.035, padding: width * 0.015 }}>
 Edit Interests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Become Creator Button */}
        {userRole === 'student' && (
          <View style={[styles.inputCard, { marginHorizontal: width * 0.05, marginTop: height * 0.024 }]}>
            <View style={styles.inputHeader}>
              <Ionicons name="star-outline" size={20} color={colors.secondary} />
              <Text style={[styles.title, { paddingVertical: height * 0.004, fontSize: height * 0.025, marginLeft: 10 }]}>
                Creator Program
              </Text>
            </View>
            <Text style={styles.creatorDescription}>
              Ready to share your knowledge? Join our creator program and start creating educational content for students worldwide.
            </Text>
            <TouchableOpacity 
              style={styles.becomeCreatorButton}
              onPress={() => {
                // TODO: Implement creator application logic
                Alert.alert('Creator Program', 'Creator application functionality will be implemented here');
              }}
            >
              <Ionicons name="rocket-outline" size={18} color={colors.initial} style={{ marginRight: 8 }} />
              <Text style={styles.becomeCreatorButtonText}>
                Become a Creator
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save Changes */}
        <View style={{ marginHorizontal: width * 0.05, marginTop: height * 0.024, marginBottom: height * 0.02 }}>
          <TouchableOpacity onPress={handleSave} style={styles.saveButtonContainer}>
            <View style={styles.saveButton}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" style={{ marginRight: 10 }} />
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.cancelButtonContainer}>
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -----------------------
// Styles
// -----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.initial },
  profileHeader: {
    backgroundColor: '#2c2c2c',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 1,   
  },
  // New header row style
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    color: '#ffffff',
    fontFamily: fonts.initial,
    fontWeight: '600',
    marginLeft: 15,
  },
  backIcon: {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 8,
  },
  profileMainSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileImageContainer: {
    position: "relative",
      margin: 7,
  },
  profileImageBorder: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: colors.secondary,
  
  },
  profileImage: {
    borderWidth: 1,
    borderColor: "transparent",
  },
  profileImageWrapper: {
    position: 'relative',
  },
  defaultProfileImage: {
    backgroundColor: 'rgba(93, 131, 202, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileStatsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statRow: { alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontWeight: 'bold', color: "white", fontFamily: fonts.initial },
  statLabel: { color: 'rgba(216, 216, 216, 1)', fontFamily: fonts.initial, alignSelf: 'center',padding:3, },
  profileInfoText: { margin:7,color: "white", fontFamily: fonts.initial },
  subjectsContainer: {marginVertical:10, flexDirection: 'row', flexWrap: 'wrap' },
  subjectTag: { backgroundColor: 'rgb(255, 255, 255)', color: colors.secondary },
  subjectTagText: { color: colors.secondary },
  // Enhanced Input Styles
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  enhancedTextInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.iconColor,
    fontFamily: fonts.initial,
  },
  bioInput: {
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 8,
    fontFamily: fonts.initial,
  },
  title: { 
    color: colors.iconColor, 
    fontFamily: fonts.initial,
    fontWeight: '600',
  },
  subContainer: { alignItems: 'flex-start' },
  
  // Interests Display
  interestsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(93, 131, 202, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(93, 131, 202, 0.2)',
  },
  interestTagText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts.initial,
  },
  noInterestsText: {
    color: '#6c757d',
    marginTop: 8,
    fontFamily: fonts.initial,
  },
  
  // Creator Section
  creatorDescription: {
    color: '#6c757d',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: fonts.initial,
  },
  becomeCreatorButton: { 
    backgroundColor: colors.secondary, 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  becomeCreatorButtonText: {
    color: colors.initial,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.initial,
  },
  
  // Save Button Styles
  saveButtonContainer: {
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fonts.initial,
  },
  cancelButtonContainer: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontFamily: fonts.initial,
    textDecorationLine: 'underline',
  },
  areaOfInterest: {
    top: '50%',
    zIndex: 100,
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'white',
    flexDirection: 'column',
    maxHeight: '40%',
    marginTop: -100,
  },
  popupTitle: { fontFamily: fonts.initial },
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxLabel: { fontFamily: fonts.initial },
  interestItem: { color: colors.iconColor },
  editInterestBtn: { backgroundColor: colors.secondary },
});

export default EditProfile;
