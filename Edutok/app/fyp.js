import {useWindowDimensions,StyleSheet, View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {colors, fonts} from '../src/constants';
import Footer from '../src/components/footer';
import {useState} from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const GeneralRetrivedVids = [
  { id: '1', title: 'React Native Tutorial', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '2', title: 'Expo Explained', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg'},
  { id: '3', title: 'Fitness Routine', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '4', title: 'Nature Walk', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg' },
  { id: '5', title: 'Cooking Pasta', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '6', title: 'Deep Focus Music', uri: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg' },
  { id: '7', title: 'Backpacking Nepal', uri: 'https://img.youtube.com/vi/0-S5a0eXPoc/mqdefault.jpg' },
  { id: '8', title: 'Calm Coding Stream', uri: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg' },
];
const FollowedRetrivedVids = [
  { id: '1', title: 'React Native Tutorial', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Programming', difficulty: 'hard' },
  { id: '2', title: 'Expo Explained', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Programming', difficulty: 'easy'},
  { id: '3', title: 'Fitness Routine', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Fitness', difficulty: 'intermediate' },
  { id: '4', title: 'Nature Walk', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Nature', difficulty: 'easy' },
  { id: '5', title: 'Cooking Pasta', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Cooking', difficulty: 'hard' },
  { id: '6', title: 'Deep Focus Music', uri:  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Music', difficulty: 'easy' },
  { id: '7', title: 'Backpacking Nepal', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Travel', difficulty: 'intermediate' },
  { id: '8', title: 'Calm Coding Stream', uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg', subject: 'Programming', difficulty: 'easy' },
];

function Fyp(){
    const [fypState,setFypState]=useState("General"); //to keep track of the current state of fyp screen
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const screenHeight = height;
    const screenWidth = width;
    const spacing = 8;
    const itemWidth = ((screenWidth - spacing*3) / 2);
    const [videos, setVideos] = useState(GeneralRetrivedVids); //by default the screen will show saved vids

    //for showing the vids grid form
    const renderVideoItem = ({ item }) => (
        <TouchableOpacity style={[styles.videoItem, { width: itemWidth }, { margin: spacing / 2}]}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            {/* Difficulty/Subject Badge */}
            <View style={{
                position: 'absolute',
                top: 5,
                left: 5,
                backgroundColor: handleColorDifficulty(item.difficulty),
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 9,
                minWidth: 40,
                alignItems: 'center'
            }}>
                <Text style={{
                    color: 'white',
                    fontSize: 10,
                 fontFamily: fonts.initial,
                    textTransform: 'uppercase'
                }}>
                    {item.subject || "N/A"}
                </Text>
            </View>
        </TouchableOpacity>
    );

     const handleTabChange=()=>{
        if(fypState=="General"){
            setFypState("Followed");
            setVideos(FollowedRetrivedVids);
        }else{
            setFypState("General");
            setVideos(GeneralRetrivedVids);
        }
     }
     const handleColorDifficulty=(level)=>{
         switch(level){
             case "easy":
                 return "#44b548ff";  // Green
             case "intermediate":
                 return "#ff9900ff";  // Orange
             case "hard":
                 return "#f44336ff";  // Red
             default:
                 return "#9E9E9E";  // Gray
         }
     }
    return (
        <SafeAreaView style={[{flex:1},{  backgroundColor: colors.backGround}]}>
        <View style={[styles.header,{ height:screenHeight*0.05}]}>
          <Text style={[styles.headerStyle]}>{fypState=="General"?"General":"Followed"}</Text>
          <MaterialCommunityIcons
           onPress={handleTabChange}
            name="rotate-3d-variant" size={24} color="white" style={[{alignSelf:'flex-end'},{position:'absolute'},{padding:6}]} />
        </View>
        
              <FlatList

                          data={videos}
                          renderItem={renderVideoItem}
                          keyExtractor={(item) => item.id}
                          numColumns={2}
                            contentContainerStyle={[styles.videosGrid, { paddingBottom: insets.bottom }]}
                 style={[{ height: screenHeight * 0.5 }, { paddingBottom: insets.bottom+60 }]}
                  showsVerticalScrollIndicator={false}
                
                         />
                         <Footer />

    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor:colors.initial,
        flexDirection:'column',
        width:'100%',
        padding:3,

    },
    headerStyle:{
        fontSize: 17,
        color: "white",
     
     
        fontFamily:fonts.initial,
    },
    
    videosGrid: {
        alignItems: 'flex-start', 
        alignSelf:'center',
        marginVertical:0,
     
    
    },
  videoItem: {
    height: 250,
    backgroundColor: '#ccc',
    borderRadius: 11,
         
    
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
  },

});

export default Fyp;