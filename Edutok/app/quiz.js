import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { commonVideos } from '../src/mockData';
import { Radio } from '../src/components/Report';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors,fonts,shadowIntensity} from '../src/constants';

export default function Quiz() {
  const { videoId } = useLocalSearchParams();
  const router = useRouter();
  const [answerMap, setAnswerMap] = useState({});
  const [questionResults, setQuestionResults] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  // Find the video data by ID
  const video = commonVideos.find(v => v.id === videoId);

  const handleSubmit = () => {
    if (video.questions) {
      const results = {};
      video.questions.forEach((q) => {
        const userAnswer = answerMap[q.question];
        const correctAnswer = q.answer;
        results[q.question] = {
          correct: userAnswer === correctAnswer,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer
        };
      });
      setQuestionResults(results);
      setSubmitted(true);
    }
  };

  const getQuestionColor = (questionText) => {
    if (!submitted) return 'white';
    const result = questionResults[questionText];
    if (result) {
      return result.correct ? 'lightgreen' : 'lightcoral';
    }
    return 'white';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="caret-back-outline" 
          onPress={() => router.push('/profile')} 
          size={24} 
          style={styles.Icon} 
        />
        <TouchableOpacity onPress={()=>{router.back();}} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
        
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Test Your Knowledge!</Text>
          {video.questions && video.questions.length > 0 ? (
            video.questions.map((question, index) => (
              <View key={index} style={[styles.questionContainer, { backgroundColor: getQuestionColor(question.question) },shadowIntensity.bottomShadow]}>
                <Text style={styles.questionText}>{question.question}</Text>
                <Radio
                  options={question.options.map(opt => ({ label: opt, value: opt }))}
                  checkedValue={answerMap[question.question] || ''}
                  onChange={(val) =>
                    setAnswerMap(prev => ({ ...prev, [question.question]: val }))
                  }
                  disabled={submitted}
                />
                {submitted && questionResults[question.question] && (
                  <View style={styles.resultContainer}>
                    {questionResults[question.question].correct ? (
                      <></>
                    ) : (
                      <View>
                        <Text style={styles.answerText}>
                          Correct answer: {questionResults[question.question].correctAnswer}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noQuestionsText}>No questions available for this video</Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton]}
            onPress={submitted ? () => {
              setAnswerMap({});
              setQuestionResults({});
              setSubmitted(false);
            } : handleSubmit}
            disabled={false}
          >
            <Text style={styles.submitText}>
              {submitted ? 'Retake' : 'Submit'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.iconColor,
    fontFamily:fonts.initial,
    fontSize:20,
  },
  title: {
    fontSize: 20,
    paddingBottom:7,
    fontWeight: 'bold',
   color: colors.iconColor,
     fontFamily:fonts.initial,
  },
  content: {
    flex: 1,
    padding: 11,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  questionContainer: {
    marginVertical: 5,
    borderRadius: 11,
    padding: 20,
    backgroundColor: 'white',
  },
  questionText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: colors.iconColor,
     fontFamily:fonts.initial,
  },
  noQuestionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  submitButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },

  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
     fontFamily:fonts.initial,
  },
  resultContainer: {
    marginTop: 10,
    paddingTop: 10,
  },

  answerText: {
    fontSize: 13,
    color: colors.iconColor,
    fontFamily:fonts.initial,
  },

});