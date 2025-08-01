import {Dimensions,StyleSheet, View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import Footer from '../components/footer';
import {colors, fonts} from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import  {useState} from 'react';


const screenWidth = Dimensions.get('window').width;
const spacing = 8;
const itemWidth = ((screenWidth - spacing ) / 3)-5;

//will be removed just cheking how the app will look with scrolling
const savedVideos = [
  { id: '1', title: 'React Native Tutorial', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '2', title: 'Expo Explained', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg'},
  { id: '3', title: 'Fitness Routine', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '4', title: 'Nature Walk', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '5', title: 'Cooking Pasta', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '6', title: 'Deep Focus Music', uri: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg' },
  { id: '7', title: 'Backpacking Nepal', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '8', title: 'Calm Coding Stream', uri: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg' },
];
const favoriteVideos = [
  { id: '1', title: 'React Native Tutorial', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '2', title: 'Expo Explained', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg'},
  { id: '3', title: 'Fitness Routine', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '4', title: 'Nature Walk', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '5', title: 'Cooking Pasta', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '6', title: 'Deep Focus Music', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '7', title: 'Backpacking Nepal', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg'  },
  { id: '8', title: 'Calm Coding Stream', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
];

const myVideos = [
  { id: '1', title: 'React Native Tutorial', uri:  'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg' },
  { id: '2', title: 'Expo Explained', uri:  'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg'},
  { id: '3', title: 'Fitness Routine', uri: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg' },
  { id: '4', title: 'Nature Walk', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '5', title: 'Cooking Pasta', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '6', title: 'Deep Focus Music', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '7', title: 'Backpacking Nepal', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg'  },
  { id: '8', title: 'Calm Coding Stream', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
];




function Profile() {
    // will be used properly when connected to backend 
    const [userRole, setUserRole] = useState("creator"); 
    const [userName, setUserName] = useState("Jane Joe");


    const insets = useSafeAreaInsets();
    const [videos, setVideos] = useState(savedVideos); //by default the screen will show saved vids
    
    // for switching icons 
    const [savedIcon, setSavedIcon] = useState('bookmark-alt');
    const [mineIcon, setMineIcon] = useState('video-camera-back');
    const [favoriteIcon, setFavoriteIcon] = useState('hearto');


    //for icon switching 
    const handleTabChange = (tab) => {
        if (tab === 'saved') {
            setSavedIcon('bookmark-alt');
            setFavoriteIcon('hearto');
            setMineIcon('video-camera-back');
            setVideos(savedVideos);
        } else if (tab === 'mine') {
            setSavedIcon('bookmark');
            setFavoriteIcon('hearto');
            setMineIcon('video-camera-front');
            setVideos(myVideos);
        } else if (tab === 'favorite') {
            setSavedIcon('bookmark');
            setFavoriteIcon('heart');
            setMineIcon('video-camera-back');
            setVideos(favoriteVideos);
        }
    };
//for showing the vids grid form
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity style={styles.videoItem}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Profile header */}
            <View style={[styles.profileHeader, {marginTop: insets.top + 3}]}>
                {userRole === "creator" ? 
                    <MaterialCommunityIcons name="account-tie" size={24} style={styles.creatorIcon} /> : 
                    <FontAwesome5 name="book-reader" size={20} style={styles.studentIcon} />
                }
                <Text style={styles.headerText}>
                    {userRole === "creator" ? "Educator " : "Student "}{userName}
                </Text>
                <MaterialIcons name="edit-note" size={24} color="#FFFFFF" style={styles.editIcon} />
                <Entypo name="dots-three-vertical" size={14} color="#FFFF" style={styles.menuIcon}/>
                <View style={styles.verticalLine}/>
                <View style={styles.profileInfoContainer}>
                    <Text style={styles.profileInfoText}>following:</Text>
                    {userRole === "creator" && <Text style={styles.profileInfoText}>followers:</Text>}
                    <Text style={styles.profileInfoText}>Current interests:</Text>
                    <Text style={styles.profileInfoText}>Short bio</Text>
                </View>
            </View>
            
            {/* buttons*/}
            <View style={styles.filterButtonsContainer}>
                <TouchableOpacity 
                    style={[
                        styles.filterButton
                    ]}
                    onPress={() => handleTabChange('saved')}
                >
                    <Fontisto name={savedIcon} size={20} style={{color: colors.saveColor}} />
                    <Text style={styles.buttonText}>saved</Text>
                </TouchableOpacity>
                
                {userRole === "creator" && (
                    <TouchableOpacity 
                        style={[
                            styles.filterButton
                        ]}
                        onPress={() => handleTabChange('mine')}
                    >
                        <MaterialIcons name={mineIcon} size={20} color="gray" />
                        <Text style={styles.buttonText}>mine</Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                    style={[
                        styles.filterButton             
                    ]}
                    onPress={() => handleTabChange('favorite')}
                >
                    <AntDesign name={favoriteIcon} size={20} style={{color: colors.secondary}} />
                    <Text style={styles.buttonText}>favorite</Text>
                </TouchableOpacity>
            </View>
            
            {/* grid for videos*/}
                     <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={[styles.videosGrid, { paddingBottom: insets.bottom }]}
                style={styles.videosContainer}
                showsVerticalScrollIndicator={false}
            />
          
          
            
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backGround,
    },
    profileHeader: {
        backgroundColor: colors.initial,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        height: '35%',
        flexDirection: 'row',
        position: 'relative',
    },
    creatorIcon: {
      color:colors.backGround,
 paddingTop:2,
    paddingRight:0,
    paddingLeft:3,

    },
    studentIcon: {
        color:colors.backGround,
    paddingTop:3.5,
   marginRight:3,
    paddingLeft:5,

    },
    headerText: {
        paddingTop: 8,
        paddingBottom: 5,
        paddingRight: 5,
        color: colors.backGround,
        fontFamily: fonts.initial,
        fontSize: 13,
    },
    menuIcon: {
        position: 'absolute',
        right: 10,
        top: 11,
    },
    editIcon:{
        position: 'absolute',
        right: 30,
        top: 5.5,

    },

    verticalLine: {
        width: 2,
        height: '65%',
        backgroundColor: colors.secondary,
        position: 'absolute',
        left: '45%',
        top: 50,
    },
    profileInfoContainer: {
        flexDirection: 'column',
        alignSelf: 'center',
        left: 5,
        justifyContent: 'space-around',
        alignContent:'center',
    },
    profileInfoText: {
        color: colors.backGround,
        fontFamily: fonts.initial,
        fontSize: 11,
        paddingTop: 7,
        paddingLeft:20,

    },
    filterButtonsContainer: {
        marginHorizontal: 3,
        gap: 10,
        alignSelf: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 5,
        marginBottom:4,
    },
    filterButton: {
        backgroundColor: colors.backGround,
        borderWidth: 1.5,
        borderColor: colors.secondary,
        borderRadius: 11,
        alignItems: 'center',
        minWidth: "30%",
      
        flex: 1,
        maxWidth: '50%',
        flexDirection: 'row',
        justifyContent: 'center',
    },

    buttonText: {
        color: colors.secondary,
        margin: 3,
        paddingBottom: 5,
    },
  
    videosContainer: {
        marginBottom: 60, 
        
        
    },
    videosGrid: {
        alignItems: 'flex-start', 
        alignSelf:'center',
        marginHorizontal:0,
     
    
    },
  videoItem: {
    width: itemWidth,
    height: 250,
   marginTop:0,
margin:4,
    marginBottom:4,
    backgroundColor: '#ccc',
    borderRadius: 11,
    
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
  },
});

export default Profile;