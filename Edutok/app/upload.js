
import React, { useState } from 'react';
import { 
  Text, View, TextInput, StyleSheet, TouchableOpacity, 
  useWindowDimensions, ScrollView, Alert 
} from 'react-native';
import { colors, fonts, shadowIntensity } from '../src/constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonVideos, addNewVideo } from '../src/mockData';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Upload = () => {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [description, setDescription] = useState('');
  const [localVideos, setLocalVideos] = useState([...commonVideos]);

  // Subject Dropdown
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectValue, setSubjectValue] = useState(null);
  const [subjectItems, setSubjectItems] = useState([
    { label: "CS", value: "CS" },
    { label: "Language", value: "language" },
    { label: "Biology", value: "Biology" },
    { label: "History", value: "History" },
  ]);

  // Difficulty Dropdown
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [difficultyValue, setDifficultyValue] = useState(null);
  const [difficultyItems, setDifficultyItems] = useState([
    { label: "hard", value: "hard" },
    { label: "intermediate", value: "intermediate" },
    { label: "easy", value: "easy" },
  ]);

  function createEmptyQuestion() {
    return { question: '', options: ['', '', ''], answer: '' };
  }

  function handleQuestionInput(index, field, value, opIndex = null) {
    setQuestions(prev => {
      const updated = [...prev];
      if (field === "options" && opIndex !== null) {
        updated[index].options[opIndex] = value;
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  }

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions(prev => [...prev, createEmptyQuestion()]);
    } else {
      Alert.alert("Maximum reached", "You can only add up to 5 questions");
    }
  };

  const handleUpload = async () => {
    // Validation for required fields
    if (questions.length < 3) {
      Alert.alert("Validation Error", "You should post at least 3 questions");
      return;
    }
    
    if (!subjectValue) {
      Alert.alert("Validation Error", "Please choose a subject");
      return;
    }
    
    if (!difficultyValue) {
      Alert.alert("Validation Error", "Please specify the difficulty");
      return;
    }
    
    if (!description || description.trim() === '') {
      Alert.alert("Validation Error", "Please write a description");
      return;
    }

    // Validation for questions, options, and answers
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question || question.question.trim() === '') {
        Alert.alert("Validation Error", `Question ${i + 1} cannot be empty`);
        return;
      }
      
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j] || question.options[j].trim() === '') {
          Alert.alert("Validation Error", `Option ${j + 1} in Question ${i + 1} cannot be empty`);
          return;
        }
      }
      
      if (!question.answer || question.answer.trim() === '') {
        Alert.alert("Validation Error", `Answer for Question ${i + 1} cannot be empty`);
        return;
      }
      
      // Check if answer matches one of the options
      if (!question.options.includes(question.answer)) {
        Alert.alert("Validation Error", `Answer for Question ${i + 1} must match one of the options`);
        return;
      }
    }

    // All validation passed, create and upload the video
    const newVideo = {
      id: (commonVideos.length + 1).toString(),
      title: `New ${subjectValue} Video`,
      uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
      subject: subjectValue,
      difficulty: difficultyValue,
      creator: 'OutdoorJules',
      profile: 'https://randomuser.me/api/portraits/men/11.jpg',
      likes: 0,
      Comments: 0,
      followed: false,
      bio: 'Adventure photographer and nature enthusiast sharing the beauty of the outdoors through stunning visuals and peaceful walking tours.',
      followers: 2500000,
      following: 45,
      description,
      questions
    };

    try {
      // Add to commonVideos array using the function
      addNewVideo(newVideo);
      
      // Save to AsyncStorage for persistence
      const existingVideos = await AsyncStorage.getItem('uploadedVideos');
      let videosArray = existingVideos ? JSON.parse(existingVideos) : [];
      videosArray.push(newVideo);
      await AsyncStorage.setItem('uploadedVideos', JSON.stringify(videosArray));
      
      // Update local state
      setLocalVideos([...commonVideos]);
      
      // Show success message
      Alert.alert("Success", "Video uploaded successfully!");
      
      // Reset form
      setQuestions([createEmptyQuestion()]);
      setDescription('');
      setSubjectValue(null);
      setDifficultyValue(null);
      
      // Navigate back to profile
      router.push('/profile');
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert("Error", "Failed to upload video. Please try again.");
    }
  };

  const renderQuestionBlock = (qIndex) => (
    <View 
      key={qIndex} 
      style={[shadowIntensity.bottomShadow, styles.questionBlock]}
    >
                                                       <TextInput
           placeholder={`Question ${qIndex + 1}`}
           placeholderTextColor={colors.secondary}
           style={[styles.input, {color: colors.secondary}]}
           onChangeText={(text) => handleQuestionInput(qIndex, "question", text)}
           value={questions[qIndex].question}
         />
      {[0, 1, 2].map((optIndex) => (
                                   <TextInput
            key={optIndex}
            placeholder={`Option ${optIndex + 1}`}
            style={styles.input}
            onChangeText={(text) => handleQuestionInput(qIndex, "options", text, optIndex)}
            value={questions[qIndex].options[optIndex]}
          />
      ))}
                                                       <TextInput
           placeholder="Answer"
           placeholderTextColor={colors.secondary}
           style={[styles.input, {color: colors.secondary}]}
           onChangeText={(text) => handleQuestionInput(qIndex, "answer", text)}
           value={questions[qIndex].answer}
         />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push('/profile')}
            >
              <Ionicons 
                name="caret-back-outline" 
                size={22} 
                style={{ alignSelf: "center", marginRight: 8 }} 
              />
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Section */}
          <View style={[styles.uploadSection, { marginBottom: 40 }]}>
            <View>
              <Text style={styles.sectionTitle}>Upload Video</Text>
              <View style={styles.uploadSection2}>
                <View 
                  style={{
                    backgroundColor: "#dcdcdc",
                    borderRadius: 15,
                    width: width * 0.42,
                    height: height * 0.28,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="videocam-outline" size={40} color="#888" />
                  <Text style={{ marginTop: 10, color: '#666' }}>Video Preview</Text>
                </View>
                <View style={{ flexDirection: "column", paddingRight: 20 }}>
                  
                  {/* Subject Dropdown Container */}
                  <View style={[styles.dropdownWrapper, { zIndex: 3000 }]}>
                    <Text style={[styles.label, {color: colors.secondary}]}>Subject*</Text>
                    <DropDownPicker
                      open={subjectOpen}
                      value={subjectValue}
                      items={subjectItems}
                      setOpen={setSubjectOpen}
                      setValue={setSubjectValue}
                      setItems={setSubjectItems}
                                             placeholder="Subject"
                      style={[styles.dropdown, { width: width * 0.35 }]}
                      dropDownContainerStyle={[styles.dropdownContainer, { width: width * 0.35 }]}
                      zIndex={3000}
                      zIndexInverse={1000}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                    />
                  </View>

                  {/* Difficulty Dropdown Container */}
                  <View style={[styles.dropdownWrapper, { zIndex: 2000 }]}>
                    <Text style={[styles.label, { marginTop: 12, color: colors.secondary }]}>Difficulty*</Text>
                    <DropDownPicker
                      open={difficultyOpen}
                      value={difficultyValue}
                      items={difficultyItems}
                      setOpen={setDifficultyOpen}
                      setValue={setDifficultyValue}
                      setItems={setDifficultyItems}
                                             placeholder="Difficulty"
                      style={[styles.dropdown, { width: width * 0.35 }]}
                      dropDownContainerStyle={[styles.dropdownContainer, { width: width * 0.35 }]}
                      zIndex={2000}
                      zIndexInverse={2000}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                    />
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <View style={[styles.button, { width: width * 0.42, marginTop: 12 }]}>
                  <Text style={styles.buttonText}>Choose File</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Video Description */}
          <View style={{ paddingHorizontal: 15, paddingTop: 30 }}>
            <Text style={styles.label}>Video Description*</Text>
                         <TextInput
               placeholder="Please enter video description"
               style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
               multiline
               onChangeText={setDescription}
               value={description}
             />
          </View>

          {/* Quiz Section */}
          <View style={styles.quizHeader}>
            <Text style={styles.quizTitle}>Create Quiz (min 3 questions, max 5)</Text>
            <TouchableOpacity onPress={handleAddQuestion}>
              <Entypo 
                name="plus" 
                size={26} 
                color={colors.iconColor} 
              />
            </TouchableOpacity>
          </View>

          {questions.map((_, index) => renderQuestionBlock(index))}

          {/* Upload Button */}
          <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.initial,
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  headerText: {
    fontFamily: fonts.initial,
    fontSize: 20
  },
  uploadSection: {
    paddingHorizontal: 15,
    paddingTop: 15
  },
  uploadSection2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.initial,
    paddingBottom: 8,
    fontSize: 16
  },
  button: {
    borderRadius: 8,
    backgroundColor: colors.iconColor,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontFamily: fonts.initial,
    color: "white",
  },
  label: {
    fontSize: 14,
    marginBottom: 4
  },
  dropdown: {
    borderColor: "#c0c0c0",
    borderRadius: 10,
    backgroundColor: "white",
  },
  dropdownContainer: {
    borderColor: "#c0c0c0",
  },
  dropdownWrapper: {
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 11,
    marginVertical: 7,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderColor: "#c0c0c0",
    backgroundColor: "#fff",
    fontFamily: fonts.initial
  },
  quizHeader: {
    paddingHorizontal: 15,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  quizTitle: {
    fontSize: 14
  },
  questionBlock: {
    backgroundColor: "white",
    borderRadius: 11,
    margin: 11,
    paddingVertical: 5
  },
  uploadBtn: {
    borderRadius: 8,
    backgroundColor: colors.secondary,
    marginHorizontal: 15,
    marginVertical: 20,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadBtnText: {
    fontFamily: fonts.initial,
    fontSize: 16,
    color: colors.initial,
    fontWeight: 'bold'
  }
});

export default Upload;