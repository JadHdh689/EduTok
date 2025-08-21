import React, { useState } from 'react';
import { 
  TouchableWithoutFeedback,
  useWindowDimensions,
  StyleSheet,  
  View,  
  Text,  
  TouchableOpacity,  
  TextInput,  
  ScrollView,
  Alert
} from 'react-native';
import { colors, fonts, shadowIntensity } from '../src/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CONFIG from "../config"; // ✅ use centralized config
const API_URL = CONFIG.API_URL;
   

function EditProfile() {
  const { height, width } = useWindowDimensions();
  const router = useRouter();

  // -----------------------
  // States
  // -----------------------
  const [bio, setBio] = useState("");
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [userName, setUserName] = useState("");
  const [isInterestVisible, setIsInterestVisible] = useState(false);

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
                  updatedCheckedValues = updatedCheckedValues.filter(val => val !== option.value);
                } else {
                  updatedCheckedValues.push(option.value);
                }
                onChange(updatedCheckedValues);
              }}
              style={styles.checkboxContainer}
            >
              <Fontisto
                name={active ? "radio-btn-active" : "radio-btn-passive"}
                size={20}
                style={{ marginRight: 8 }}
                color={active ? colors.secondary : "#ccc"}
              />
              <Text style={styles.checkboxLabel}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // -----------------------
  // Save Profile Handler
  // -----------------------
  const handleSave = async () => {
    if (areasOfInterest.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one area of interest');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please login again.");
        return;
      }

      await axios.put(
        `${API_URL}/auth/profile`,   // ✅ use config base URL
        {
          name: userName,
          bio,
          preferences: areasOfInterest,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", "Profile updated successfully!");
      router.push('/profile');
    } catch (err) {
      console.error("Profile update failed:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <SafeAreaView style={styles.container}>
     
      {/* Header */}
      <View style={[styles.profileHeader, { height: height * 0.35 }]}>
        <View style={styles.headerBar}>
          <Ionicons 
            name="caret-back-outline" 
            onPress={() => router.push('/profile')} 
            size={24} 
            style={styles.Icon} 
          />
          <Text style={styles.headerText} onPress={() => router.push('/profile')}>
            Edit
          </Text>
        </View>

        <View style={styles.verticalLine} />

        <View style={styles.profileInfoContainer}>
          <Text style={styles.profileInfoText}>following:</Text>
          <Text style={styles.profileInfoText}>followers:</Text>
          <Text style={styles.profileInfoText}>Current interests:</Text>
          <Text style={styles.profileInfoText}>Short bio</Text>
        </View>
      </View>

      {/* Areas of Interest Popup */}
      {isInterestVisible && (
        <>
          <TouchableWithoutFeedback onPress={() => setIsInterestVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[shadowIntensity.bottomShadow, styles.areaOfInterest]}>
            <Text style={styles.popupTitle}>Choose all that apply</Text>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <CheckBox
                options={[
                  { label: "Math", value: "math" },
                  { label: "CS", value: "CS" },
                  { label: "Language", value: "language" },
                  { label: "Biology", value: "Biology" },
                  { label: "History", value: "History" },
                ]}
                checkedValues={areasOfInterest}
                onChange={setAreasOfInterest}
              />
            </ScrollView>
          </View>
        </>
      )}

      {/* Name Input */}
      <View style={styles.subContainer}>
        <Text style={styles.title}>Name</Text>
        <TextInput
          placeholder="Enter your name"
          placeholderTextColor="grey"
          style={styles.textInput}
          value={userName}
          onChangeText={setUserName}
        />
      </View>

      {/* Bio Input */}
      <View style={styles.subContainer}>
        <Text style={styles.title}>Bio</Text>
        <TextInput
          placeholder="Tell us about yourself"
          placeholderTextColor="grey"
          style={styles.textInput}
          value={bio}
          onChangeText={setBio}
        />
      </View>

      {/* Areas of Interest Display */}
      <View style={styles.subContainer}>
        <Text style={styles.title}>Areas of interest:</Text>
        {areasOfInterest.map((item) => (
          <Text key={item} style={styles.interestItem}>{"- " + item}</Text>
        ))}
        <TouchableOpacity style={styles.editInterestBtn} onPress={() => setIsInterestVisible(true)}>
          <Text style={styles.title}>edit interests</Text>
        </TouchableOpacity>
      </View>

      {/* Save Changes */}
      <TouchableOpacity onPress={handleSave}>
        <View style={[styles.submitButton, { width: width * 0.9 }]}>
          <Text style={[styles.title, { padding: 10, color: colors.secondary }]}>
            save changes
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// -----------------------
// Styles
// -----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.initial },

  // Profile Header
  profileHeader: {
    backgroundColor: colors.iconColor,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerBar: {
    width: '100%',
    height: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.initial,
  },
  Icon: { color: colors.iconColor, alignItems: 'flex-end', marginLeft: 10 },
  headerText: { paddingRight: 5, color: colors.iconColor, fontFamily: fonts.initial, fontSize: 16 },

  verticalLine: {
    width: 2,
    height: '65%',
    backgroundColor: colors.secondary,
    position: 'absolute',
    left: '45%',
    transform: [{ translateY: 65 }],
  },
  profileInfoContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: "center",
    transform: [{ translateY: -100 }],
    left: '45%',
    top:"60%",
    alignSelf:"flex-end"
  },
  profileInfoText: { 
    color: colors.secondary, fontFamily: fonts.initial, fontSize: 11, paddingTop: 7, paddingLeft: 20 
  },

  // Text Inputs
  textInput: {
    backgroundColor: "white",
    borderRadius: 11,
    paddingHorizontal: 6,
    paddingVertical: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.iconColor,
  },

  title: { color: colors.iconColor, fontFamily: fonts.initial, paddingVertical: 3 },
  subContainer: { marginHorizontal: 20, marginTop: 20, alignItems: "flex-start" },

  // Buttons
  submitButton: {
    borderRadius: 18,
    backgroundColor: colors.iconColor,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 13,
    padding: 12,
    marginHorizontal: 20,
  },

  // Interests Popup
  areaOfInterest: {
    top: "50%",
    transform: [{ translateY: -100 }],
    padding: 20,
    zIndex: 100,
    alignSelf: "center",
    justifyContent: "center",
    position: "absolute",
    backgroundColor: "white",
    flexDirection: "column",
    borderRadius: 18,
    maxHeight: '40%',
  },
  popupTitle: { fontFamily: fonts.initial, fontSize: 15, padding: 10 },
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1 },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },

  // Checkbox
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  checkboxLabel: { fontFamily: fonts.initial, fontSize: 13 },

  interestItem: { color: colors.iconColor, fontSize: 12, paddingVertical: 3 },
  editInterestBtn: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.iconColor,
    borderRadius: 10,
    paddingHorizontal: 10
  },
});

export default EditProfile;
