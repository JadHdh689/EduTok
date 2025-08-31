import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, getDifficultyBadgeStyle } from '../constants';

const CourseCard = ({ course, onPress }) => {
  // Create a simple course thumbnail with course name
  const createCourseThumbnail = (courseName, subject) => {
    const subjectColors = {
      'Engineering': '#3b82f6',
      'Medicine': '#ef4444',
      'Physics': '#8b5cf6',
      'Biology': '#10b981',
      'Computer Science': '#f59e0b'
    };
    
    return (
      <View style={[styles.courseThumbnailText, { backgroundColor: subjectColors[subject] || '#6b7280' }]}>
        <Text style={styles.courseThumbnailTitle} numberOfLines={2}>
          {courseName}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress}>
      {/* Course Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {createCourseThumbnail(course.title, course.subject)}
      </View>
      
      {/* Course Info */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.courseCreator} numberOfLines={1}>
          by {course.creator}
        </Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>
        
        {/* Course Stats */}
        <View style={styles.courseStats}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyBadgeStyle(course.difficulty) }]}>
            <Text style={styles.difficultyText}>{course.difficulty}</Text>
          </View>
          <Text style={styles.courseStatsText}>
            {course.totalChapters} chapters • {course.enrolledStudents} students
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Progress: {course.progress}%</Text>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${course.progress}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnailContainer: {
    width: 110,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  courseThumbnailText: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  courseThumbnailTitle: {
    color: 'white',
    fontSize: 12,
    fontFamily: fonts.initial,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseCreator: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: colors.secondary,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: 'gray',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 8,
    fontFamily: fonts.initial,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  courseStatsText: {
    fontSize: 10,
    fontFamily: fonts.initial,
    color: 'gray',
    flex: 1,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
});

export default CourseCard;