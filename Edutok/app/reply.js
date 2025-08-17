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

// Mock Reply Data
const mockReplies = [
    {
        id: '1',
        user: 'OriginalCommenter',
        comment: 'This is exactly what I needed! Great explanation of the concepts.',
        timestamp: '2h ago',
        likes: 12,
        isOriginal: true,
    },
    {
        id: '2',
        user: 'VideoCreator',
        comment: 'Thanks for the feedback! I\'m glad it helped you understand the concepts better.',
        timestamp: '1h ago',
        likes: 8,
        isCreator: true,
    },
    {
        id: '3',
        user: 'AnotherViewer',
        comment: 'I agree! This tutorial saved me hours of research.',
        timestamp: '45m ago',
        likes: 5,
    },
];

function Reply() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // State Management
    const [replies, setReplies] = useState(mockReplies);
    const [newReply, setNewReply] = useState('');
    const [likedReplies, setLikedReplies] = useState({});

    // Add Reply Handler
    const handleAddReply = () => {
        if (!newReply.trim()) return;

        const reply = {
            id: Date.now().toString(),
            user: 'You',
            comment: newReply.trim(),
            timestamp: 'now',
            likes: 0,
        };

        setReplies([...replies, reply]);
        setNewReply('');
    };

    // Like Reply Handler
    const handleLikeReply = (replyId) => {
        setLikedReplies(prev => ({
            ...prev,
            [replyId]: !prev[replyId]
        }));
    };

    // Reply Item Renderer
    const renderReply = ({ item, index }) => {
        const isLiked = likedReplies[item.id] || false;
        const isOriginalComment = index === 0;
        
        return (
            <View style={[
                styles.replyItem,
                isOriginalComment && styles.originalComment
            ]}>
                <View style={styles.replyHeader}>
                    <View style={[
                        styles.userAvatar,
                        item.isCreator && styles.creatorAvatar
                    ]}>
                        <MaterialIcons name="person" size={16} color="white" />
                        {item.isCreator && (
                            <View style={styles.creatorBadge}>
                                <MaterialIcons name="verified" size={12} color={colors.secondary} />
                            </View>
                        )}
                    </View>
                    <View style={styles.replyContent}>
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{item.user}</Text>
                            {item.isCreator && (
                                <Text style={styles.creatorLabel}>Creator</Text>
                            )}
                        </View>
                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                    </View>
                </View>
                
                <Text style={styles.replyText}>{item.comment}</Text>
                
                <View style={styles.replyActions}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleLikeReply(item.id)}
                    >
                        <AntDesign 
                            name={isLiked ? "heart" : "hearto"} 
                            size={14} 
                            color={isLiked ? colors.favColor : "gray"} 
                        />
                        <Text style={styles.actionText}>
                            {isLiked ? item.likes + 1 : item.likes}
                        </Text>
                    </TouchableOpacity>
                    
                    {!isOriginalComment && (
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialIcons name="reply" size={14} color="gray" />
                            <Text style={styles.actionText}>Reply</Text>
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
                <Text style={styles.headerTitle}>Replies</Text>
                <Text style={styles.replyCount}>{replies.length - 1} replies</Text>
            </View>

            <KeyboardAvoidingView 
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Replies List */}
                <FlatList
                    data={replies}
                    renderItem={renderReply}
                    keyExtractor={(item) => item.id}
                    style={styles.repliesList}
                    contentContainerStyle={[
                        styles.repliesContainer,
                        { paddingBottom: insets.bottom + 80 }
                    ]}
                    showsVerticalScrollIndicator={false}
                />

                {/* Reply Input */}
                <View style={[styles.inputSection, { paddingBottom: insets.bottom }]}>
                    <View style={styles.replyInputContainer}>
                        <View style={styles.inputAvatar}>
                            <MaterialIcons name="person" size={14} color="white" />
                        </View>
                        <TextInput
                            style={styles.replyInput}
                            placeholder="Write a reply..."
                            placeholderTextColor="gray"
                            value={newReply}
                            onChangeText={setNewReply}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity 
                            style={[
                                styles.sendButton,
                                newReply.trim() && styles.sendButtonActive
                            ]}
                            onPress={handleAddReply}
                            disabled={!newReply.trim()}
                        >
                            <MaterialIcons 
                                name="send" 
                                size={18} 
                                color={newReply.trim() ? colors.iconColor : "gray"} 
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
    replyCount: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    repliesList: {
        flex: 1,
    },
    repliesContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    replyItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginLeft: 20,
    },
    originalComment: {
        marginLeft: 0,
        backgroundColor: '#f8f9fa',
        borderColor: colors.secondary,
        borderWidth: 2,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.iconColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        position: 'relative',
    },
    creatorAvatar: {
        backgroundColor: colors.secondary,
    },
    creatorBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: 'white',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyContent: {
        flex: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: 13,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
    },
    creatorLabel: {
        fontSize: 10,
        fontFamily: fonts.initial,
        color: colors.secondary,
        backgroundColor: colors.iconColor,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 6,
    },
    timestamp: {
        fontSize: 11,
        fontFamily: fonts.initial,
        color: 'gray',
    },
    replyText: {
        fontSize: 13,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        lineHeight: 18,
        marginBottom: 8,
    },
    replyActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    actionText: {
        fontSize: 11,
        fontFamily: fonts.initial,
        color: 'gray',
        marginLeft: 3,
    },
    repliesText: {
        fontSize: 11,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
    },
    inputSection: {
        backgroundColor: colors.initial,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 15,
        paddingTop: 8,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.iconColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    replyInput: {
        flex: 1,
        fontSize: 13,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        maxHeight: 60,
    },
    sendButton: {
        marginLeft: 8,
        padding: 4,
    },
    sendButtonActive: {
        backgroundColor: colors.secondary,
        borderRadius: 12,
    },
});

export default Reply;