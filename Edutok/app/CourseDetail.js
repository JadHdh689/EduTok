// app/courseDetail.js
import { 
  SafeAreaView, 
  useSafeAreaInsets 
} from "react-native-safe-area-context";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Components
import Footer from "../src/components/footer";

// Constants
import { colors, fonts, shadowIntensity, getDifficultyBadgeStyle } from "../src/constants";

// --- Static Data (Mock) ---
const mockCourse = {
  id: "c1",
  title: "Introduction to React Native",
  instructor: "Jane Doe",
  description: "Learn to build beautiful mobile apps using React Native. This course covers components, navigation, styling, and more.",
  difficulty: "easy",
  thumbnail: "https://placekitten.com/600/300",
  lessons: [
    { id: "l1", title: "Setting up the environment" },
    { id: "l2", title: "Understanding Components" },
    { id: "l3", title: "Navigation Basics" },
  ],
};

export default function CourseDetail() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Image */}
        <Image source={{ uri: mockCourse.thumbnail }} style={styles.courseImage} />

        {/* Title & Difficulty */}
        <View style={[styles.headerBox, shadowIntensity.bottomShadow]}>
          <Text style={styles.courseTitle}>{mockCourse.title}</Text>
          <View style={[styles.badgeBox, { backgroundColor: getDifficultyBadgeStyle(mockCourse.difficulty) }]}>
            <Text style={styles.badgeText}>{mockCourse.difficulty}</Text>
          </View>
        </View>

        {/* Instructor */}
        <Text style={styles.instructorText}>By {mockCourse.instructor}</Text>

        {/* Description */}
        <Text style={styles.description}>{mockCourse.description}</Text>

        {/* Lessons */}
        <Text style={styles.sectionTitle}>Lessons</Text>
        {mockCourse.lessons.map((lesson) => (
          <TouchableOpacity key={lesson.id} style={styles.lessonItem}>
            <MaterialCommunityIcons name="play-circle-outline" size={22} color={colors.iconColor} />
            <Text style={styles.lessonText}>{lesson.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <Footer />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenColor,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 14,
  },
  courseImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.initial,
    padding: 10,
    borderRadius: 8,
  },
  courseTitle: {
    fontFamily: fonts.initial,
    fontSize: 18,
    color: colors.iconColor,
    flexShrink: 1,
  },
  badgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: fonts.initial,
    textTransform: "uppercase",
  },
  instructorText: {
    fontFamily: fonts.initial,
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.initial,
    fontSize: 14,
    color: colors.iconColor,
    lineHeight: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.initial,
    fontSize: 16,
    color: colors.iconColor,
    marginBottom: 8,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  lessonText: {
    fontFamily: fonts.initial,
    fontSize: 14,
    marginLeft: 8,
    color: colors.iconColor,
  },
});
