import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import { useFonts, Domine_400Regular } from '@expo-google-fonts/domine';
import { Pressable } from 'react-native';
import ProfileScreen from './src/screens/profile';

export default function App() {

 const Stack = createStackNavigator();
 
 //for fonts
 const [fontsLoaded] = useFonts({
    Domine: Domine_400Regular,
  });

//helps in speeding up when pressing 
Pressable.defaultProps = {
  delayPressIn: 0,
};

  return (
    <NavigationContainer>
    <SafeAreaProvider>

        <Stack.Navigator  screenOptions={{headerShown: false  }}  >
        <Stack.Screen  name="profile" component={ProfileScreen } />

      </Stack.Navigator>
      
    </SafeAreaProvider>
    </NavigationContainer>
  );
}


