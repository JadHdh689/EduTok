import { useWindowDimensions, StyleSheet, View, Text, Image, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

// Components
import Footer from '../src/components/footer';

// Constants
import { colors, fonts, shadowIntensity, getDifficultyBadgeStyle } from '../src/constants';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// Mock Data - Will be replaced with API calls
import { GeneralRetrivedVids } from '../src/mockData';

function Search() {
    // State Management
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Layout Calculations
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const spacing = 8;
    const itemWidth = ((width - spacing * 3) / 2);

    // Search Handler
    const handleSearch = (query) => {
        setSearchQuery(query);
        setIsSearching(true);
        
        // TODO: Replace with actual API call
        setTimeout(() => {
            if (query.trim()) {
                const filtered = GeneralRetrivedVids.filter(video => 
                    video.creator.toLowerCase().includes(query.toLowerCase()) ||
                    video.description.toLowerCase().includes(query.toLowerCase()) ||
                    video.subject.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(filtered);
            } else {
                setSearchResults([]);
            }
            setIsSearching(false);
        }, 500);
    };

    // Video Item Renderer
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity style={[
            styles.videoItem, 
            { width: itemWidth }, 
            { margin: spacing / 2 }
        ]}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            
            {/* Difficulty/Subject Badge */}
            <View style={[styles.badgeBox, { backgroundColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                <Text style={[styles.badgeText, { textShadowColor: getDifficultyBadgeStyle(item.difficulty) }]}>
                    {item.subject || "N/A"}
                </Text>
            </View>

            {/* Video Info */}
            <View style={styles.videoInfo}>
                <Text style={styles.creatorName} numberOfLines={1}>
                    {item.creator}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={[styles.header, shadowIntensity.bottomShadow]}>
                <Text style={styles.headerTitle}>Search</Text>
                
                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search videos, creators, subjects..."
                        placeholderTextColor="gray"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <AntDesign name="close" size={16} color="gray" style={styles.clearIcon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Search Results */}
            <View style={styles.content}>
                {isSearching ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                ) : searchQuery.trim() === '' ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search" size={60} color="gray" />
                        <Text style={styles.emptyText}>Start typing to search</Text>
                        <Text style={styles.emptySubtext}>Find videos, creators, and subjects</Text>
                    </View>
                ) : searchResults.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search-off" size={60} color="gray" />
                        <Text style={styles.emptyText}>No results found</Text>
                        <Text style={styles.emptySubtext}>Try different keywords</Text>
                    </View>
                ) : (
                    <FlatList
                        data={searchResults}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        contentContainerStyle={[
                            styles.videosGrid,
                            { paddingBottom: insets.bottom + 60 }
                        ]}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Footer Component */}
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
    header: {
        backgroundColor: colors.initial,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginBottom: 10,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.initial,
        color: colors.iconColor,
    },
    clearIcon: {
        marginLeft: 10,
    },
    content: {
        flex: 1,
        paddingTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: fonts.initial,
        color: 'gray',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 8,
        textAlign: 'center',
    },
    videosGrid: {
        alignItems: 'flex-start',
        alignSelf: 'center',
        paddingHorizontal: 8,
    },
    videoItem: {
        height: 200,
        backgroundColor: '#ccc',
        borderRadius: 11,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '70%',
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11,
    },
    badgeBox: {
        position: 'absolute',
        top: 5,
        left: 5,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 9,
        minWidth: 40,
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontFamily: fonts.initial,
        textTransform: 'uppercase',
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowRadius: 0.5,
    },
    videoInfo: {
        padding: 8,
        height: '30%',
        justifyContent: 'space-between',
    },
    creatorName: {
        fontSize: 12,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
    },
    videoDescription: {
        fontSize: 10,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 2,
    },
});

export default Search;