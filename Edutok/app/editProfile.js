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
  Platform
} from 'react-native';
import { colors, fonts, shadowIntensity } from '../src/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { userProfiles } from '../src/mockData';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

function EditProfile() {
  const { height, width } = useWindowDimensions();
  const router = useRouter();

  // -----------------------
  // States
  // -----------------------
  const [userRole] = useState(userProfiles.creator.role);
  const [bio, setBio] = useState(userProfiles.creator.bio);
  const [areasOfInterest, setAreasOfInterest] = useState(userProfiles.creator.subjects);
  const [userName, setUserName] = useState(userProfiles.creator.name);
  const [isInterestVisible, setIsInterestVisible] = useState(false);
  const [userProfileData, setUserProfileData] = useState(userProfiles.creator)

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
                               style={[styles.checkboxContainer, {
                   marginVertical: height * 0.005
                 }]}
               >
                             <Fontisto
                 name={active ? "radio-btn-active" : "radio-btn-passive"}
                 size={20}
                 style={{ marginRight: width * 0.02 }}
                 color={active ? colors.secondary : "#ccc"}
               />
               <Text style={[styles.checkboxLabel, {
                 fontSize: width * 0.033
               }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  // Save profile data to AsyncStorage
  const saveProfileData = async (data) => {
    try {
      await AsyncStorage.setItem('userProfileData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  // Load profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('userProfileData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setUserProfileData(parsedData);
        setUserName(parsedData.name || userProfiles.creator.name);
        setBio(parsedData.bio || userProfiles.creator.bio);
        setAreasOfInterest(parsedData.subjects || userProfiles.creator.subjects);
      } else {
    
        setUserProfileData(userProfiles.creator);
        setUserName(userProfiles.creator.name);
        setBio(userProfiles.creator.bio);
        setAreasOfInterest(userProfiles.creator.subjects);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadProfileData();
  }, []);

  const updateUserName = (newName) => {
    const updated = { ...userProfileData };  // copy object
    updated.name = newName;  // change name
    setUserProfileData(updated);           // trigger re-render
    setUserName(newName);                  // update local userName state
    saveProfileData(updated);              // save to AsyncStorage
  };
  const updateAreasOfInterest = (newInterest) => {
    const updated = { ...userProfileData };  
    updated.subjects = newInterest;  
    setUserProfileData(updated);           
    setAreasOfInterest(newInterest);                
    saveProfileData(updated);  } ;           
  const updateBio = (newBio) => {
    const updated = { ...userProfileData };  
    updated.bio = newBio;  
    setUserProfileData(updated);           
    setBio(newBio);                  
    saveProfileData(updated);              
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
                 {/* Header */}
         <View style={[styles.profileHeader,{ 
           paddingBottom: height * 0.008,
           borderBottomLeftRadius: width * 0.06,
           borderBottomRightRadius: width * 0.06
         }]}>
         <View style={[styles.headerBar, {flexGrow:1 ,flexShrink:1,paddingVertical:3}]}>
             <Ionicons 
               name="caret-back-outline" 
               onPress={() => router.push('/profile')} 
               size={height*0.025} 
               style={[styles.Icon, { marginLeft: width * 0.025 }]} 
             />
             <Text style={[styles.headerText, { 
               paddingRight: width * 0.012,
               fontSize: height * 0.025
             }]} onPress={() => router.push('/profile')}>
               Edit
             </Text>
           </View>

                 {/* Profile Main Section */}
         <View style={[styles.profileMainSection, {
           marginTop: height * 0.02,
           paddingHorizontal: width * 0.02,
         
         }]}>
           <Image 
             source={{ uri: userProfiles.creator.profileImage }} 
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
             width: width * 0.002,
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
               }]}>{userProfiles.creator.following}</Text>
               <Text style={[styles.statLabel, {
                 fontSize: width * 0.025,
                 marginTop: height * 0.002
               }]}>Following</Text>
             </View>
             {userRole === "creator" && (
               <View style={styles.statRow}>
                 <Text style={[styles.statNumber, {
                   fontSize: width * 0.045
                 }]}>{userProfiles.creator.followers > 1000 ? `${(userProfiles.creator.followers / 1000).toFixed(1)}k` : userProfiles.creator.followers}</Text>
                 <Text style={[styles.statLabel, {
                   fontSize: width * 0.025,
                   marginTop: height * 0.002
                 }]}>Followers</Text>
               </View>
             )}
           </View>
         </View>
         
         <View style={{
           marginTop: height * 0.015,
           paddingHorizontal: width * 0.02
         }}>
           <Text style={[styles.profileInfoText, {
             fontSize: height * 0.02,
             marginBottom: height * 0.005,
             lineHeight: width * 0.035,
             paddingTop: height * 0.008,
             paddingLeft: width * 0.05
           }]}>{bio}</Text>
           
           <View style={styles.subjectsContainer}>
             {areasOfInterest.map((subject, index) => (
               <View key={index} style={[styles.subjectTag, {
                 paddingHorizontal: width * 0.02,
                 paddingVertical: height * 0.008,
                 margin: width * 0.01,
                 borderRadius: width * 0.025,
                 padding: width * 0.028,
                 marginHorizontal: width * 0.008
               }]}>
                 <Text style={[styles.subjectTagText, {
                   fontSize: height * 0.015
                 }]}>{subject}</Text>
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

                     <View style={[shadowIntensity.bottomShadow, styles.areaOfInterest, {
             padding: width * 0.05,
             borderRadius: width * 0.045
           }]}>
             <Text style={[styles.popupTitle, {
               fontSize: width * 0.038,
               padding: width * 0.025
             }]}>Choose all that apply</Text>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
                                            <CheckBox
                 options={[
                   { label: "Math", value: "Math" },
                   { label: "Programming", value: "Programming" },
                   { label: "Biology", value: "Biology" },
                   { label: "Language", value: "Language" },
                   { label: "History", value: "History" },
                   { label: "CS", value: "CS" },
                 ]}
                 checkedValues={areasOfInterest}
                 onChange={(newInterests) => {
                
                   updateAreasOfInterest(newInterests)
                 }}
               />
            </ScrollView>
          </View>
        </>
      )}

             {/* Name Input */}
       <View style={[styles.subContainer, {
         marginHorizontal: width * 0.05,
         marginTop: height * 0.024,
         
       }]}>
         <Text style={[styles.title, {
           paddingVertical: height * 0.004,
           fontSize: height * 0.025
         }]}>Name</Text>
                  <TextInput
          maxLength={60}
            placeholder={userName}
            placeholderTextColor="grey"
            style={[styles.textInput, {
              borderRadius: width * 0.028,
              paddingHorizontal: width * 0.015,
              paddingVertical: height * 0.012
            }]}
            onChangeText={(newName) => updateUserName(newName)}
          />
       </View>

             {/* Bio Input */}
       <View style={[styles.subContainer, {
         marginHorizontal: width * 0.05,
         marginTop: height * 0.024
       }]}>
         <Text style={[styles.title, {
           paddingVertical: height * 0.004,
           fontSize: height * 0.025
         }]}>Bio</Text>
                  <TextInput
           maxLength={150}
           minlenght={0}
           placeholder="Tell us about yourself"
           placeholderTextColor="grey"
           style={[styles.textInput, {
             borderRadius: width * 0.028,
             paddingHorizontal: width * 0.015,
             paddingVertical: height * 0.012
           }]}
           onChangeText={(newBio) => updateBio(newBio)}
         />
       </View>

             {/* Areas of Interest Display */}
       <View style={[styles.subContainer, {
         marginHorizontal: width * 0.05,
         marginTop: height * 0.024,
         
       }]}>
         <Text style={[styles.title, {
           paddingVertical: height * 0.004,
           fontSize: height * 0.025
         }]}>Areas of interest:</Text>
         {areasOfInterest.map((item) => (
           <Text key={item} style={[styles.interestItem, {
             fontSize: width * 0.03,
             paddingVertical: height * 0.004,
             fontFamily:fonts.initial,
           }]}>{"- " + item}</Text>
         ))}
         <TouchableOpacity style={[styles.editInterestBtn, {
           marginVertical: height * 0.007,
           borderRadius: width * 0.025,
           paddingHorizontal: width * 0.025
         }]} onPress={() => {
           setIsInterestVisible(true);
         }}>
           <Text style={[ { color:colors.initial,fontSize:width*0.035,padding:width*0.015}]}>edit interests</Text>
         </TouchableOpacity>
       </View>

             {/* Become Creator Button */}
       {userRole === "student" && (
         <TouchableOpacity>
           <View style={[styles.becomeCreatorButton, {
             borderRadius: width * 0.028,
             marginHorizontal: width * 0.05,
             padding: width * 0.008,
             marginTop: height * 0.005
           }]}>
             <Text style={[ {color:colors.initial,fontSize:width*0.035,fontFamily:fonts.initial, padding: width*0.015 }]}>become a creator</Text>
           </View>
         </TouchableOpacity>
       )}

      {/* Save Changes */}
             <TouchableOpacity
         onPress={() => {
           if (areasOfInterest.length === 0) {
             alert('Please select at least one area of interest');
           } else if (!userName){
            alert('username cannot be empty');}else{
             // Create final data with current state values
             const finalData = {
               ...userProfileData,
               name: userName,
               bio: bio,
               subjects: areasOfInterest
             };
             
             // Update the userProfileData state one final time
             setUserProfileData(finalData);
             
             // Save to AsyncStorage
             saveProfileData(finalData);
             
             console.log("Final data being saved:", finalData);
             console.log("userName:", userName);
             console.log("Bio:", bio);
             console.log("subjects:", areasOfInterest);
             
             // Navigate back to profile
             router.push('/profile');
           }
         }}
       >
                 <View style={[styles.submitButton, { 
           width: width * 0.9,
           borderRadius: width * 0.045,
           marginTop: height * 0.016,
           padding: width * 0.03,
           marginHorizontal: width * 0.05
         }]}>
           <Text style={[ {fontFamily:fonts.initial, fontSize:width*0.045,padding: width*0.012, color: colors.initial }]}>
             save changes
           </Text>
         </View>
              </TouchableOpacity>
        </KeyboardAvoidingView>
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
  },
  
  headerBar: {
    width: '100%',
    height: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.initial,
  },
  
  Icon: { 
    color: colors.iconColor, 
    alignItems: 'flex-end', 
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
    color: colors.initial,
    fontFamily: fonts.initial,
  },
  
  statLabel: {
    color: 'rgba(232, 232, 232, 0.9)',
    fontFamily: fonts.initial,
    alignSelf: "center"
  },

  profileInfoText: {
    color: colors.initial,
    fontFamily: fonts.initial,
  },
  
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  subjectTag: {
    backgroundColor: 'rgb(255, 255, 255)',
    color: colors.secondary,
  },
  
  subjectTagText: {
    color: colors.secondary,
  },

  // Text Inputs
  textInput: {
    backgroundColor: "white",
    width: '100%',
    borderWidth: 1,
    borderColor: colors.iconColor,
  },

  title: { 
    color: colors.iconColor, 
    fontFamily: fonts.initial, 
  },
  
  subContainer: { 
    alignItems: "flex-start" 
  },

  // Buttons
  becomeCreatorButton: {
    backgroundColor: colors.secondary,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  
  submitButton: {
    backgroundColor: colors.iconColor,
    alignItems: "center",
    alignSelf: "center",
  },

  // Interests Popup
  areaOfInterest: {
    top: "50%",
    transform: [{ translateY: -100 }],
    zIndex: 100,
    alignSelf: "center",
    justifyContent: "center",
    position: "absolute",
    backgroundColor: "white",
    flexDirection: "column",
    maxHeight: '40%',
  },
  
  popupTitle: { 
    fontFamily: fonts.initial, 
  },
  
  scrollView: { 
    flex: 1 
  },
  
  scrollViewContent: { 
    flexGrow: 1 
  },
  
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },

  // Checkbox
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  
  checkboxLabel: { 
    fontFamily: fonts.initial, 
  },
  
  interestItem: { 
    color: colors.iconColor, 
  },
  
  editInterestBtn: {
    backgroundColor: colors.secondary,
  },
});

export default EditProfile;
