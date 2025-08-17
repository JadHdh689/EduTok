import React, { useState } from 'react';
import { 
  Text, View, TextInput, StyleSheet, TouchableOpacity, 
  useWindowDimensions, ScrollView 
} from 'react-native';
import { colors, fonts, shadowIntensity } from '../src/constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonVideos } from '../src/mockData';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const Upload = () => {
      const router = useRouter();
  const { height, width } = useWindowDimensions();
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [description, setDescription] = useState();
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
      if (field === "options" && opIndex != null) {
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
    }
  };

  const handleUpload = () => {
    if (questions.length < 3) {
      alert("You should post at least 3 questions");
    } else if (!subjectValue) {
      alert("Please choose a subject");
    } else if (!difficultyValue) {
      alert("Please specify the difficulty");
    } else if (!description) {
      alert("Please write a description");
    } else {
      const newVideo = {
        id: commonVideos.length + 1,
        uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
        subject: subjectValue,
        difficulty: difficultyValue,
        creator: 'OutdoorJules',
        questions,
        description
      };
      commonVideos.push(newVideo);
      setLocalVideos([...commonVideos]);
      console.log("Uploaded video:", newVideo);
      alert("Video uploaded successfully!");
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
        style={styles.input}
        onChangeText={(text) => handleQuestionInput(qIndex, "question", text)}
      />
      {[0, 1, 2].map((optIndex) => (
        <TextInput
          key={optIndex}
          placeholder={`Option ${optIndex + 1}`}
          style={styles.input}
          onChangeText={(text) => handleQuestionInput(qIndex, "options", text, optIndex)}
        />
      ))}
      <TextInput
        placeholder="Answer"
        placeholderTextColor={colors.secondary}
        style={styles.input}
        onChangeText={(text) => handleQuestionInput(qIndex, "answer", text)}
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons 
            name="caret-back-outline" 
            size={22} 
            style={{ alignSelf: "center", marginRight: 8 }} 
             onPress={() => router.push('/profile')}
          />
          <Text style={styles.headerText}
               onPress={() => router.push('/profile')}>Back</Text>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <View>
            <Text style={styles.sectionTitle}>Upload Video</Text>
            <View style={styles.uploadSection2}>
              <View 
                style={{
                  backgroundColor: "#dcdcdc",
                  borderRadius: 15,
                  width: width * 0.42,
                  height: height * 0.28
                }}
              />
              <View style={{ flexDirection: "column", paddingRight: 20 }}>
                
                {/* Subject Dropdown */}
                <Text style={styles.label}>Subject*</Text>
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
                />

                {/* Difficulty Dropdown */}
                <Text style={[styles.label, { marginTop: 12 }]}>Difficulty*</Text>
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
                />
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
        <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
          <Text style={styles.label}>Video Description</Text>
          <TextInput
            placeholder="Please enter video description"
            style={styles.input}
            multiline
            onChangeText={setDescription}
          />
        </View>

        {/* Quiz Section */}
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>Create Quiz (min 3 questions, max 5)</Text>
          <Entypo 
            name="plus" 
            size={26} 
            color={colors.iconColor} 
            onPress={handleAddQuestion} 
          />
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
    paddingVertical: 8
  },
  buttonText: {
    alignSelf: "center",
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
    marginBottom: 10,
  },
  dropdownContainer: {
    borderColor: "#c0c0c0"
  },
  input: {
    borderWidth: 1,
    borderRadius: 11,
    marginVertical: 7,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingTop:12,
    paddingBottom:12,
    borderColor: "#c0c0c0",
    backgroundColor: "#fff"
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
    padding: 12
  },
  uploadBtnText: {
    fontFamily: fonts.initial,
    alignSelf: "center",
    fontSize: 16,
    color: colors.iconColor,
  }
});

export default Upload;
