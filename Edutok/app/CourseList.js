// app/courseList.js
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Components
import Footer from "../src/components/footer";

// Constants
import { colors, fonts, shadowIntensity, getDifficultyBadgeStyle } from "../src/constants";

// --- Static Data ---
const mockCourses = [
  {
    id: "c1",
    title: "React Native Basics",
    difficulty: "easy",
    thumbnail: "https://placekitten.com/400/250",
  },
  {
    id: "c2",
    title: "Advanced JavaScript",
    difficulty: "hard",
    thumbnail: "https://placekitten.com/401/250",
  },
  {
    id: "c3",
    title: "UI/UX Design Principles",
    difficulty: "medium",
    thumbnail: "https://placekitten.com/402/250",
  },
];

export default function CourseList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const spacing = 8;
  const itemWidth = (360 - spacing * 3) / 2; // Adjust width for grid

  const renderCourse = ({ item }) => (
    <TouchableOpacity 
    style={[styles.courseCard, { width: itemWidth }]}
    onPress={() => router.push(`/courseDetail?id=${item.id}`)}
  >
      <Image source={{ uri: item.thumbnail }} style={styles.courseImage} />
      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.badgeBox, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}>
          <Text style={styles.badgeText}>{item.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, shadowIntensity.bottomShadow]}>
        <Text style={styles.headerText}>Available Courses</Text>
        <MaterialCommunityIcons name="book-open-page-variant" size={22} color={colors.iconColor} />
      </View>

      {/* Course Grid */}
      <FlatList
        data={mockCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screenColor, paddingHorizontal: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.initial,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  headerText: { fontFamily: fonts.initial, fontSize: 18, color: colors.iconColor },
  courseCard: { borderRadius: 10, backgroundColor: "#ccc", marginBottom: 10, overflow: "hidden" },
  courseImage: { width: "100%", height: 120 },
  cardContent: { padding: 6 },
  courseTitle: { fontFamily: fonts.initial, fontSize: 14, color: colors.iconColor, marginBottom: 4 },
  badgeBox: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: fonts.initial, textTransform: "uppercase" },
});
