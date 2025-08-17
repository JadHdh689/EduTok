import { useWindowDimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// Mock Comments Data
const mockComments = [
    {
        id: '1',
        user: 'TechLearner23',
        comment: 'This is exactly what I needed! Great explanation of the concepts.',
        timestamp: '2h ago',
        likes: 12,
        replies: 3,
    },
    {
        id: '2',
        user: 'CodeNewbie',
        comment: 'Could you make a follow-up video about advanced topics?',
        timestamp: '4h ago',
        likes: 8,
        replies: 1,
    },
    {
        id: '3',
        user: 'DevMaster',
        comment: 'Really well structured tutorial. The examples were super helpful!',
        timestamp: '6h ago',
        likes: 25,
        replies: 0,
    },
    {
        id: '4',
        user: 'StudentLife',
        comment: 'Thanks for making this free! Helped me with my project.',
        timestamp: '1d ago',
        likes: 15,
        replies: 2,
    },
    {
        id: '5',
        user: 'QuickLearner',
        comment: 'The pace was perfect for beginners. More content like this please!',
        timestamp: '2d ago',
        likes: 7,
        replies: 0,
    },
];

function Comments() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // State Management
    const [comments, setComments] = useState(mockComments);
    const [newComment, setNewComment] = useState('');
    const [likedComments, setLikedComments] = useState({});

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
    };

    // Like Comment Handler
    const handleLikeComment = (commentId) => {
        setLikedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // Comment Item Renderer
    const renderComment = ({ item }) => {
        const isLiked = likedComments[item.id] || false;

        return (
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
                        onPress={() => router.push('/reply')}
                    >
                        <MaterialIcons name="reply" size={16} color="gray" />
                        <Text style={styles.actionText}>Reply</Text>
                    </TouchableOpacity>


                    {item.replies > 0 && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/reply')}
                        >
                            <Text style={styles.repliesText}>
                                View {item.replies} {item.replies === 1 ? 'reply' : 'replies'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, shadowIntensity.bottomShadow]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.iconColor} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comments</Text>
                <Text style={styles.commentCount}>{comments.length} comments</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                />

                {/* Comment Input */}
                <View style={[styles.inputSection, { paddingBottom: insets.bottom }]}>
                    <View style={styles.commentInputContainer}>
                        <View style={styles.inputAvatar}>
                            <MaterialIcons name="person" size={16} color="white" />
                        </View>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            placeholderTextColor="gray"
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            maxLength={500}
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
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenColor,
    },
    header: {
        backgroundColor: colors.initial,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 15,
        top: 15,
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
        marginTop: 2,
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
    inputSection: {
        backgroundColor: colors.initial,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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