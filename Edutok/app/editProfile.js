import {useWindowDimensions,StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import {colors, fonts} from '../src/constants';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import{ user,} from'../src/mockData';
import { useState } from 'react';
import { TextInput } from 'react-native';

function Profile() {
    // will be used properly when connected to backend 
    const [userRole, setUserRole] = useState(user);
   
    const { height, width } = useWindowDimensions();


const [userName, setUserName] = useState("Jane Joe");
    return (
        
        <SafeAreaView style={styles.container}>
            {/* Profile header */}
            <View style={[styles.profileHeader,{height:height*0.35}]}>
<View style={{
   
    width: width,
    height: height*0.05,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:colors.initial
 
}}>  <Ionicons name="caret-back-outline" size={24} style={styles.Icon} /> : 
 <Text style={styles.headerText}>Edit</Text>
            
                </View>

                <View style={styles.verticalLine}/>
                <View style={styles.profileInfoContainer}>
                    <Text style={styles.profileInfoText}>following:</Text>
                    {userRole === "creator" && <Text style={styles.profileInfoText}>followers:</Text>}
                    <Text style={styles.profileInfoText}>Current interests:</Text>
                    <Text style={styles.profileInfoText}>Short bio</Text>
                </View>
                    
            </View>
            <View style={styles.subContainer}><Text style={styles.title}>Name</Text>
      <TextInput
                                                     placeholder={userName}
                                                     placeholderTextColor="grey"
                                                     style={styles.textInput}
                                                 /></View>
                                                     <View style={styles.subContainer}><Text style={styles.title}>Bio</Text>
      <TextInput
                                                     placeholder='Tell us about yourself'
                                                     placeholderTextColor="grey"
                                                     style={styles.textInput}
                                                 /></View>
                                                  <View style={styles.subContainer}><Text style={styles.title}>Pick areas of Interest</Text>
      <TextInput
                                                     placeholder='subject'
                                                     placeholderTextColor="grey"
                                                     style={styles.textInput}
                                                 /></View>
                              <TouchableOpacity><View style={{borderRadius:11,backgroundColor:colors.secondary,alignItems:"center",width:width*0.5,alignSelf:"flex-start",marginHorizontal:10,marginTop:40}}><Text style={[styles.title,{ padding:10}]}>become a creator </Text></View></TouchableOpacity>      
                <TouchableOpacity><View style={{borderRadius:11,backgroundColor:colors.iconColor,alignItems:"center", width:width*0.9,alignSelf:"center",marginTop:20}}><Text style={[styles.title,{ padding:10,color:colors.secondary}]}>save changes </Text></View></TouchableOpacity>                                 
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.initial,
    },
    profileHeader: {
        backgroundColor: colors.iconColor,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
      
    },
    Icon: {
      color:colors.iconColor,

    paddingRight:0,
    paddingLeft:3,
alignItems:'flex-end',
    },
   
    headerText: {
        paddingTop: 8,
        paddingBottom: 5,
        paddingRight: 5,
        color: colors.iconColor,
        fontFamily: fonts.initial,
        fontSize: 1,
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
        flex:1,
        flexDirection: 'column',
        alignSelf: 'flex-end',
        marginRight:80,
        justifyContent:"center",
      
     
    },
    profileInfoText: {
        color: colors.secondary,
        fontFamily: fonts.initial,
        fontSize: 11,
        paddingTop: 7,
        paddingLeft:20,
        

    },
    textInput:{
        backgroundColor:"white",
        borderRadius:11,
        paddingHorizontal:6,
        paddingVertical:10,
        width: '100%',

    },
    title:{
        color:"white",
        fontFamily:fonts.initial,
           paddingVertical:3,
  
    },
    subContainer:{
        marginHorizontal:10,
        marginTop:20,
        alignItems:"flex-start"
    }
});

export default Profile;