import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { commonVideos } from '../src/mockData';
import { Radio } from '../src/components/Report';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts, shadowIntensity } from '../src/constants';

// Mock function to get chapter data - you'll need to implement this properly
const getChapterById = (chapterId) => {
  // This is a placeholder - you need to implement this based on your data structure
  // For now, return a mock chapter with questions
  return {
    id: chapterId,
    title: `Chapter ${chapterId}`,
    questions: [
      {
        question: "What is the main topic of this chapter?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A"
      },
      {
        question: "Which concept is most important in this chapter?",
        options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
        answer: "Concept 2"
      }
    ]
  };
};

export default function Quiz() {
  const { videoId, chapterId, type } = useLocalSearchParams();
  const router = useRouter();
  const [answerMap, setAnswerMap] = useState({});
  const [questionResults, setQuestionResults] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  // Find the appropriate data based on type
  let content;
  let title = "Test Your Knowledge!";
  
  if (type === 'chapter') {
    // Get chapter data
    content = getChapterById(chapterId);
    title = "Chapter Quiz";
  } else {
    // Default to video
    content = commonVideos.find(v => v.id === videoId);
    title = "Video Quiz";
  }

  // Handle case where content is not found
  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons 
            name="caret-back-outline" 
            onPress={() => router.back()} 
            size={24} 
            style={styles.Icon} 
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>
            {type === 'chapter' ? 'Chapter' : 'Video'} not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safely access questions with fallback
  const questions = content?.questions || [];

  const handleSubmit = () => {
    if (questions.length > 0) {
      // Check if user has answered at least one question
      if (Object.keys(answerMap).length === 0) {
        Alert.alert("Please answer at least one question before submitting");
        return;
      }
      
      const results = {};
      let correctCount = 0;
      
      questions.forEach((q) => {
        const userAnswer = answerMap[q.question];
        const correctAnswer = q.answer;
        const isCorrect = userAnswer === correctAnswer;
        
        results[q.question] = {
          correct: isCorrect,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer
        };

        if (isCorrect) correctCount++;
      });

      setQuestionResults(results);
      setSubmitted(true);

    
     
    } else {
      Alert.alert('No Questions', 'There are no questions available for this content.');
    }
  };

  const getQuestionColor = (questionText) => {
    if (!submitted) return 'white';
    const result = questionResults[questionText];
    if (result) {
      return result.correct ? '#e6f7ee' : '#fde8e8';
    }
    return 'white';
  };

  const calculateScore = () => {
    if (!submitted) return 0;
    const correctCount = Object.values(questionResults).filter(result => result.correct).length;
    return Math.round((correctCount / questions.length) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="caret-back-outline" 
          onPress={() => router.back()} 
          size={24} 
          style={styles.Icon} 
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
        
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.titlesub}>Test Your Knowledge!</Text>
          
          {submitted && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: {calculateScore()}%
              </Text>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreProgress, 
                    { width: `${calculateScore()}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          {questions.length > 0 ? (
            questions.map((question, index) => (
              <View key={index} style={[styles.questionContainer, { backgroundColor: getQuestionColor(question.question) }, shadowIntensity.bottomShadow]}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
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
                      <View style={styles.correctAnswerContainer}>
                        <Text style={styles.correctText}>Correct!</Text>
                      </View>
                    ) : (
                      <View style={styles.incorrectAnswerContainer}>
                        <Text style={styles.incorrectText}>
                          Your answer: {questionResults[question.question].userAnswer || "Not answered"}
                        </Text>
                        <Text style={styles.correctAnswerText}>
                          Correct answer: {questionResults[question.question].correctAnswer}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noQuestionsContainer}>
              <Ionicons name="help-circle-outline" size={50} color="#9ca3af" />
              <Text style={styles.noQuestionsText}>No questions available</Text>
              <Text style={styles.noQuestionsSubtext}>
                {type === 'chapter' ? 'This chapter doesn\'t have any questions yet.' : 'This video doesn\'t have any questions yet.'}
              </Text>
            </View>
          )}

          {questions.length > 0 && (
            <TouchableOpacity
              style={[styles.submitButton, submitted && styles.retakeButton]}
                             onPress={submitted ? () => {
                 setAnswerMap({});
                 setQuestionResults({});
                 setSubmitted(false);
               } : handleSubmit}
              disabled={submitted && Object.keys(answerMap).length === 0}
            >
              
              <Text style={styles.submitText}>
                {submitted ? 'Retake Quiz' : 'Submit Answers'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginLeft: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.iconColor,
    fontFamily: fonts.initial,
  },
  Icon: {
    color: colors.iconColor,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.iconColor,
    fontFamily: fonts.initial,
    textAlign: 'center',
    marginBottom: 15,
  },
  titlesub:{
    fontSize: 19,
    fontWeight: 'bold',
    color: "grey",
    fontFamily: fonts.initial,
    textAlign: 'center',
    marginBottom: 17,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scoreContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    ...shadowIntensity.bottomShadow,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.iconColor,
    fontFamily: fonts.initial,
    marginBottom: 10,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  questionContainer: {
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    backgroundColor: 'white',
    ...shadowIntensity.bottomShadow,
  },
  questionNumber: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: fonts.initial,
    marginBottom: 4,
  },
  questionText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
    color: colors.iconColor,
    fontFamily: fonts.initial,
    lineHeight: 22,
  },
  resultContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  correctAnswerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctText: {
    fontSize: 14,
    color: '#10b981',
    fontFamily: fonts.initial,
    marginLeft: 8,
    fontWeight: '500',
  },
  incorrectAnswerContainer: {
    flexDirection: 'column',
  },
  incorrectText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: fonts.initial,
    marginTop: 4,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#10b981',
    fontFamily: fonts.initial,
    marginTop: 4,
    fontWeight: '500',
  },
  noQuestionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    ...shadowIntensity.bottomShadow,
  },
  noQuestionsText: {
    fontSize: 18,
    color: '#374151',
    fontFamily: fonts.initial,
    marginTop: 16,
    textAlign: 'center',
  },
  noQuestionsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: fonts.initial,
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    alignItems: 'center',
    ...shadowIntensity.bottomShadow,
  },
  retakeButton: {
    backgroundColor: '#374151',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.initial,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: fonts.initial,
  },
});