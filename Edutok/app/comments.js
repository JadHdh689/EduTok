import {
  useWindowDimensions,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// Mock Comments Data - Import from mockData.js
import { mockComments, mockReplies } from '../src/mockData';

function Comments({ visible, onClose, videoBackground }) {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State Management
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyTexts, setReplyTexts] = useState({}); // Store reply text for each comment
  
  // Refs
  const textInputRef = useRef(null);
  const keyboardHeight = useRef(0);
  const replyInputRefs = useRef({}); // Refs for reply text inputs
  
  // Animation values for the draggable sheet
  const translateY = useRef(new Animated.Value(height)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const inputTranslateY = useRef(new Animated.Value(0)).current;

  // Load comments from mockData
  useEffect(() => {
    setComments(mockComments);
    
    // Initialize empty reply text for each comment
    const initialReplyTexts = {};
    mockComments.forEach(comment => {
      initialReplyTexts[comment.id] = '';
    });
    setReplyTexts(initialReplyTexts);
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        keyboardHeight.current = e.endCoordinates.height;
        
        // Smoothly move input up with keyboard
        Animated.timing(inputTranslateY, {
          toValue: -keyboardHeight.current + insets.bottom,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        
        // Smoothly move input back down
        Animated.timing(inputTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Open/close animation
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: height,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90
      }).start();
      // Dismiss keyboard when closing comments
      Keyboard.dismiss();
      // Collapse any expanded comments
      setExpandedCommentId(null);
    }
  }, [visible]);

  // PanResponder for drag gestures (only on the handle)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture vertical drags on the handle
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow vertical dragging, prevent dragging above initial position
        if (gestureState.dy > 0) {
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Swipe down to close
          closeSheet();
        } else {
          // Return to original position
          resetSheet();
        }
      },
    })
  ).current;

  const closeSheet = () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    // Use a single animation for better performance
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(inputTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      pan.setValue({ x: 0, y: 0 });
      onClose();
    });
  };

  const resetSheet = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  // Add Comment Handler
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: 'You',
      comment: newComment.trim(),
      timestamp: 'now',
      likes: 0,
      replies: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
    // Dismiss keyboard after sending
    Keyboard.dismiss();
  };

  // Handle keyboard return key press
  const handleSubmitEditing = () => {
    if (newComment.trim()) {
      handleAddComment();
      
      // Immediately move input back down when comment is submitted
      inputTranslateY.setValue(0);
    }
  };

  // Like Comment Handler
  const handleLikeComment = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Toggle replies visibility for a comment
  const toggleReplies = (commentId) => {
    if (expandedCommentId === commentId) {
      // Collapse if already expanded
      setExpandedCommentId(null);
    } else {
      // Expand and load replies if not already loaded
      setExpandedCommentId(commentId);
      if (!replies[commentId]) {
        // Simulate loading replies from mock data
        const commentReplies = mockReplies.filter(reply => reply.parentCommentId === commentId);
        setReplies(prev => ({
          ...prev,
          [commentId]: commentReplies
        }));
      }
    }
  };

  // Update reply text for a specific comment
  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: text
    }));
  };

  // Add Reply Handler
  const handleAddReply = (commentId) => {
    const replyText = replyTexts[commentId] || '';
    
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now().toString(),
      user: 'You',
      comment: replyText.trim(),
      timestamp: 'now',
      likes: 0,
      parentCommentId: commentId,
    };

    // Add the reply to the replies state
    setReplies(prev => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), reply]
    }));

    // Clear the reply input
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: ''
    }));

    // Update the comment's reply count
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: (comment.replies || 0) + 1 }
          : comment
      )
    );
    
    // Dismiss keyboard
    Keyboard.dismiss();
  };

  // Handle reply input submit
  const handleReplySubmit = (commentId) => {
    handleAddReply(commentId);
  };

  // Reply Item Renderer
  const renderReply = ({ item }) => {
    const isLiked = likedComments[item.id] || false;

    return (
      <View style={styles.replyItem}>
        <View style={styles.replyHeader}>
          <View style={styles.userAvatar}>
            <MaterialIcons name="person" size={14} color="white" />
          </View>
          <View style={styles.replyContent}>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>

        <Text style={styles.replyText}>{item.comment}</Text>

        <View style={styles.replyActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikeComment(item.id)}
          >
            <AntDesign
              name={isLiked ? "heart" : "hearto"}
              size={12}
              color={isLiked ? colors.favColor : "gray"}
            />
            <Text style={styles.actionText}>
              {isLiked ? item.likes + 1 : item.likes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Comment Item Renderer
  const renderComment = ({ item }) => {
    const isLiked = likedComments[item.id] || false;
    const isExpanded = expandedCommentId === item.id;
    const commentReplies = replies[item.id] || [];
    const replyText = replyTexts[item.id] || '';

    return (
      <View>
        <View style={styles.commentItem}>
          <View style={styles.commentHeader}>
            <View style={styles.userAvatar}>
              <MaterialIcons name="person" size={20} color="white" />
            </View>
            <View style={styles.commentContent}>
              <Text style={styles.username}>{item.user}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>

          <Text style={styles.commentText}>{item.comment}</Text>

          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLikeComment(item.id)}
            >
              <AntDesign
                name={isLiked ? "heart" : "hearto"}
                size={16}
                color={isLiked ? colors.favColor : "gray"}
              />
              <Text style={styles.actionText}>
                {isLiked ? item.likes + 1 : item.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleReplies(item.id)}
            >
              <MaterialIcons name="reply" size={16} color="gray" />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            {item.replies > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleReplies(item.id)}
              >
                <Text style={styles.repliesText}>
                  {isExpanded ? 'Hide' : 'View'} {item.replies} {item.replies === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Replies Section */}
        {isExpanded && (
          <View style={styles.repliesContainer}>
            {/* Reply Input for this comment */}
            <View style={styles.replyInputContainer}>
              <View style={styles.inputAvatar}>
                <MaterialIcons name="person" size={14} color="white" />
              </View>
              <TextInput
                ref={ref => replyInputRefs.current[item.id] = ref}
                style={styles.replyInput}
                placeholder="Write a reply..."
                placeholderTextColor="gray"
                value={replyText}
                onChangeText={(text) => handleReplyTextChange(item.id, text)}
                onSubmitEditing={() => handleReplySubmit(item.id)}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.replySendButton,
                  replyText.trim() && styles.replySendButtonActive
                ]}
                onPress={() => handleAddReply(item.id)}
                disabled={!replyText.trim()}
              >
                <MaterialIcons
                  name="send"
                  size={16}
                  color={replyText.trim() ? colors.iconColor : "gray"}
                />
              </TouchableOpacity>
            </View>

            {/* Replies List */}
            {commentReplies.length > 0 ? (
              <FlatList
                data={commentReplies}
                renderItem={renderReply}
                keyExtractor={(reply) => reply.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noRepliesText}>No replies yet</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeSheet}
    >
      <View style={styles.modalContainer}>
        {/* Semi-transparent background that closes the modal when tapped */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.background} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [
                { translateY: Animated.add(translateY, pan.y) },
              ],
              height: height * 0.7,
            }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Drag handle - only this area is draggable */}
            <View 
              style={styles.dragHandleContainer}
              {...panResponder.panHandlers}
            >
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={[styles.header, shadowIntensity.bottomShadow]}>
              <Text style={styles.headerTitle}>Comments</Text>
              <Text style={styles.commentCount}>{comments.length} comments</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeSheet}
              >
                <Ionicons name="close" size={24} color={colors.iconColor} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              style={styles.content}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
              {/* Comments List */}
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                style={styles.commentsList}
                contentContainerStyle={[
                  styles.commentsContainer,
                  { paddingBottom: insets.bottom + 80 }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={Platform.OS === 'android'}
              />

              {/* Comment Input - positioned based on keyboard visibility */}
              <Animated.View 
                style={[
                  styles.inputSection, 
                  { 
                    paddingBottom: insets.bottom,
                    transform: [{ translateY: inputTranslateY }]
                  }
                ]}
              >
                <View style={styles.commentInputContainer}>
                  <View style={styles.inputAvatar}>
                    <MaterialIcons name="person" size={16} color="white" />
                  </View>
                  <TextInput
                    ref={textInputRef}
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="gray"
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    maxLength={500}
                    onSubmitEditing={handleSubmitEditing}
                    returnKeyType="send"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      newComment.trim() && styles.sendButtonActive
                    ]}
                    onPress={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <MaterialIcons
                      name="send"
                      size={20}
                      color={newComment.trim() ? colors.iconColor : "gray"}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.screenColor,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  header: {
    backgroundColor: colors.initial,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    fontWeight: 'bold',
  },
  commentCount: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: 'gray',
  },
  content: {
    flex: 1,
  },
  commentsList: {
    flex: 1,
  },
  commentsContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  commentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.iconColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: 'gray',
  },
  commentText: {
    fontSize: 14,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    lineHeight: 20,
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: 'gray',
    marginLeft: 4,
  },
  repliesText: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    fontWeight: 'bold',
  },
  repliesContainer: {
    marginLeft: 42, // Indent to align with comment content
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 10,
  },
  replyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  replyContent: {
    flex: 1,
  },
  replyText: {
    fontSize: 13,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    lineHeight: 18,
    marginBottom: 5,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  replyInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    maxHeight: 60,
    padding: 0,
    margin: 0,
  },
  replySendButton: {
    marginLeft: 8,
    padding: 4,
  },
  replySendButtonActive: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  noRepliesText: {
    fontSize: 12,
    fontFamily: fonts.initial,
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  inputSection: {
    backgroundColor: colors.initial,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingTop: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 50,
  },
  inputAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.iconColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    maxHeight: 80,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
  sendButtonActive: {
    backgroundColor: colors.secondary,
    borderRadius: 15,
  },
});

export default Comments;