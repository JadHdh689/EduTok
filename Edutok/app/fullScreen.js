import {Image,FlatList, useWindowDimensions,View, Text, StyleSheet, TouchableOpacity, TextInput,TouchableWithoutFeedback } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { colors, fonts } from '../src/constants';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Footer from '../src/components/footer';
import { SafeAreaView } from 'react-native-safe-area-context';


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
  {
    id: '1',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'hard',
    creator: 'Alice Dev',
    likes:120,
    Comments:0,
    followed:true,
    description: 'Learn how to build a full-stack app using React Native and Node.js with best practices.'
  },
  {
    id: '2',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'easy',
    creator: 'Bob Coder',
    likes:0,
    Comments:100,
    description: 'Getting started with Expo — the easiest way to build and deploy mobile apps using JavaScript.'
  },
  {
    id: '3',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Fitness',
    difficulty: 'intermediate',
    creator: 'FitWithLena',
    description: 'Follow this 30-minute full-body workout to stay energized and healthy at home.'
  },
  {
    id: '4',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Nature',
    difficulty: 'easy',
    creator: 'OutdoorJules',
    likes: 10000000,
    Comments: 10000,
    followed: true,
    // This creator is followed by the user
    description: 'A peaceful walking tour through lush forests and scenic trails to clear your mind.'
  },
  {
    id: '5',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Cooking',
    difficulty: 'hard',
    creator: 'Chef Marco',
     likes:9,
    Comments:10,
    description: 'Master the art of Italian pasta with this detailed recipe and step-by-step cooking guide.'
  },
  {
    id: '6',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Music',
    difficulty: 'easy',
    creator: 'LoFiVibes',
    description: 'Relax and focus with this curated playlist of calming lofi beats and ambient sounds.'
  },
  {
    id: '7',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Travel',
    difficulty: 'intermediate',
    creator: 'WanderWithRay',
    description: 'Explore the majestic landscapes and hidden trails of Nepal in this travel vlog series.'
  },
  {
    id: '8',
    uri: 'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
    subject: 'Programming',
    difficulty: 'easy',
    creator: 'CodeFlow',
    description: 'Join a calm and productive coding session designed to help you stay focused and inspired.'
  }
];


function FullScreen() {

    const [fypState, setFypState] = useState("General");
    const [videos, setVideos] = useState(GeneralRetrivedVids);//by default the screen will show general vids
    const { width, height } = useWindowDimensions();


const[expandMap, setExpandMap] = useState({});
const[likedMap, setLikedMap] = useState({});
const[likesMap, setLikesMap] = useState({});
const[savedMap, setSavedMap] = useState({});
const[followedMap, setFollowedMap] = useState({});

const [isReportPopupVisibleMap, setIsReportPopupVisibleMap] = useState({});



const maxCharacters=85;
const textSlice=(text,needsExpansion,isExpanded)=>{

    if(needsExpansion ){
         return !isExpanded?text.slice(0,maxCharacters)+"...":text;
    }
     
    return text;
}


    const handleTabChange = () => {
        if(fypState == "General"){
            setFypState("Followed");
            setVideos(FollowedRetrivedVids);
        } else {
            setFypState("General");
            setVideos(GeneralRetrivedVids);
        }
    };
    const handleLikesAndComments=(num)=>{
        if(num>1000000){
            return (num/1000000).toFixed(1).replace(/\.0$/,"")+"M";
        }else if(num>1000){
            return (num/1000).toFixed(1).replace(/\.0$/,"")+"K";
        }else if(num===0){return;}
        return num;
    };

    
    //for displaying vids full screen
        const renderVideoItem = ({ item }) => {
             const id=item.id;
             const isLiked= likedMap[id] || false;
             const likesCount = likesMap[id] ??item.likes;
             const isSaved = savedMap[id] || false;
             const isFollowed = followedMap[id] ?? item.followed;
             const needsExpansion = item.description && item.description.length > maxCharacters ? true : false;
             const isExpanded = expandMap[id] || false;
             const isReportPopupVisible=isReportPopupVisibleMap[id]||false;

             return (
           
         <SafeAreaView  style={{flex:1,height:height}}>

                <Image source={{ uri: item.uri }} style={{...styles.thumbnail}} />

              <View style={{alignItems: 'flex-end', width:width, flexDirection: 'row', position: 'absolute', bottom: 100, left: 11,  justifyContent: 'space-between' }}>
                 <View style={{ minHeight: height * 0.15, paddingTop:10,paddingLeft:11,flexDirection:'column',borderRadius:11,backgroundColor:'#ffffff25',  marginRight: 10,width: width*0.8,justifyContent:'space-evenly'}}>
                   <TouchableOpacity onPress={() =>{
                    {/* we will need to remove or add the creator into the followed list accordingly*/ }
                    setFollowedMap(prev => ({ ...prev, [id]: !isFollowed })); }}>  <View style={{
           marginLeft:90,
          maxWidth:100,
                  paddingHorizontal: 10,     
    paddingVertical: 3, 
             
                borderRadius: 5,
                alignItems: 'center',
                backgroundColor:'white',
                
            }}>
                <Text style={{
                    color: colors.secondary,
                    fontSize: 15,
                 fontFamily: fonts.initial,
                
                }}>{isFollowed?"unfollow":"follow"}</Text></View></TouchableOpacity>
                 <Text style={{color: 'white',paddingLeft:90, fontSize: 13,}}>{item.creator}</Text>
                 <Text style={{color: 'white',paddingRight:5}} onPress={() => setExpandMap(prev => ({ ...prev, [id]: !isExpanded }))}>{textSlice(item.description,needsExpansion,isExpanded)}</Text>
                  <Text style={{color: '#efefefff',fontSize: 13,   paddingBottom: 5,  flexWrap: 'wrap',}}>{"#"+item.subject+" #"+item.difficulty}</Text>
                 </View>
                  <View style={styles.actionBar}>
                 <AntDesign name={isLiked ? "heart" : "hearto"} size={20} color="white" style={styles.actionIcon} onPress={()=> {
setLikedMap(prev => ({ ...prev, [id]: !isLiked }));
setLikesMap(prev => ({ ...prev, [id]: isLiked ? likesCount - 1 : likesCount + 1 }));
{/* liked videos will be added to the liked list */}
                 }} />
                 <Text style={{color:"white",fontFamily:fonts.initial}}>{handleLikesAndComments(likesMap[id] ?? item.likes)}</Text>
                 <MaterialCommunityIcons name="comment-outline" size={24} color="white" style={styles.actionIcon} />
                  <Text style={{color:"white",fontFamily:fonts.initial}}>{handleLikesAndComments(item.Comments)}</Text>
                 <MaterialIcons name="quiz" size={24} color="white" style={styles.actionIcon} />
                 <Fontisto name={isSaved ? "bookmark-alt" : "bookmark"} size={20} color="white" style={styles.actionIcon} onPress={() => {
                    {/* liked videos will be added to the liked list */}
                    setSavedMap(prev=>({...prev,[id]:!isSaved}))
                 }} />
                 <MaterialIcons name="report-gmailerrorred" size={24} color="white" style={styles.actionIcon}    onPress={()=> setIsReportPopupVisibleMap(prev=>({...prev,[id]:!isReportPopupVisible}))}/>
             </View></View>
 {
  isReportPopupVisible && (
    <TouchableWithoutFeedback onPress={() => setIsReportPopupVisibleMap(prev => ({ ...prev, [id]: !isReportPopupVisible }))}>
      <View style={{ position:'absolute', backgroundColor:"#ffffff6a", width:width, height:height, zIndex:5 }}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={[styles.reportContainer, { paddingHorizontal: width*0.02, paddingVertical: height*0.02 }]}>
            <MaterialIcons name="report-gmailerrorred" size={30} color={colors.secondary} style={{ alignSelf:'center' }} />
            <Text style={{ alignSelf:'center', fontFamily:fonts.initial, paddingBottom:5, fontSize:20 }}>Report</Text>

            <View style={styles.reportSubContainer}>
              <Fontisto name="radio-btn-passive" style={styles.ReportradioButtons} />
              <Text style={{ fontFamily:fonts.initial }}>missleading and wrong information</Text>
            </View>

            <View style={styles.reportSubContainer}>
              <Fontisto name="radio-btn-passive" style={styles.ReportradioButtons} />
              <Text style={{ fontFamily:fonts.initial }}>Inappropriate content</Text>
            </View>

            <View style={styles.reportSubContainer}>
              <Fontisto name="radio-btn-passive" style={styles.ReportradioButtons} />
              <Text style={{ fontFamily:fonts.initial }}>Spam</Text>
            </View>

            <View style={styles.reportSubContainer}>
              <Fontisto name="radio-btn-passive" style={styles.ReportradioButtons} />
              <Text style={{ fontFamily:fonts.initial }}>Other</Text>
            </View>

            <TextInput
              placeholder='Please Specify'
              placeholderTextColor="grey"
              style={{ borderWidth: 1, borderColor: "grey", borderRadius: 5, padding: 5, margin: 5 }}
            />

            <TouchableOpacity>
              <View style={{
                backgroundColor: colors.secondary,
                margin: 5,
                padding: 10,
                alignSelf: 'center',
                alignItems: 'center',
                borderRadius: 6
              }}>
                <Text style={{ color: 'white', fontFamily: fonts.initial }}>submit</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  )
}

              
              </SafeAreaView>
        
        );}

    return (
      <SafeAreaView style={{flex:1}}>
        <View style={styles.container}>
             <FlatList
             
                                       data={videos}
                                       renderItem={renderVideoItem}
                                       keyExtractor={(item) => item.id}

                  style={[{ height: height - 85 }]}
                                       pagingEnabled  
                               showsVerticalScrollIndicator={false}
                               decelerationRate="fast"
                                
                                      />
            <View style={styles.header}>
       
                <Text style={styles.title}>{fypState == "General" ? "General" : "Followed"}</Text>
                <MaterialCommunityIcons
                    onPress={handleTabChange}
                    name="rotate-3d-variant" 
                    size={24} 
                    color="white" 
                  style={[{position:'absolute'},{padding:6},{paddingTop:4},{right:0}]}

                />
            </View>
          

           
                                    
          
            </View>
              <Footer/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
       
    },
    header: {
      position:'absolute',
        flexDirection: 'column',
        zIndex:200,
        justifyContent:'flex-start',
       width:'100%'
   
     
    },

    title: {
        fontSize: 17,
        color: "white",
        padding:9,
        paddingTop:8,
        fontFamily:fonts.initial,
  
       
      
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentText: {
        color: 'white',
        fontSize: 18,
    },
    actionBar: {
     
      
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      alignSelf: 'flex-end',
        paddingHorizontal: 5,
       marginRight: 20,

    },
    actionIcon: {
       
        marginTop: 48,
    },


   thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
    resizeMode:'contain',
    paddingBottom:100,
  },
  ReportradioButtons:{
    size: 15,
    color: colors.secondary,
    padding: 5,
  },
  reportSubContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  reportContainer: {
    flexDirection:'column',
    backgroundColor:'white',
    position:'absolute',
    alignSelf:'center',
    top:'50%',
    transform: [{ translateY: -100 }],
    zIndex:100,
    borderRadius:11,

  },

});

export default FullScreen;