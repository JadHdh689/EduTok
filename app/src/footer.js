import { colors } from './constants';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
// Icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function Footer() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const user = "creator"; // Will be changed once we connect to the backend

    return (
        <View style={{
            paddingBottom: insets.bottom,
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
        }}>
            <View style={styles.container}>
                <MaterialCommunityIcons
                    name="home-outline"
                    size={24}
                    style={styles.icons}
                />

                <Entypo
                    name="graduation-cap"
                    size={24}
                    style={styles.icons}
                />

                {user === "creator" && (
                    <View style={styles.plusIconContainer}>
                        <FontAwesome
                            name="circle"
                            size={42}
                            style={styles.circleBackground}
                        />
                        <AntDesign
                            name="pluscircle"
                            size={30}
                            style={styles.plusIcon}
                        />
                    </View>
                )}

                <MaterialCommunityIcons
                    name="text-search"
                    size={24}
                    style={styles.icons}
                />

                <MaterialCommunityIcons
                    onPress={() => navigation.navigate('profile')}
                    name="account-outline"
                    size={24}
                    style={styles.icons}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.initial,
        alignSelf: 'stretch',
        justifyContent: 'space-evenly',
    },

    icons: {
        paddingHorizontal: 5,
        paddingVertical: 7,
        margin: 3,
        color: colors.backGround,
    },

    plusIconContainer: {
        position: "relative",
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    circleBackground: {
        position: 'absolute',
        color: colors.initial,
        top: -19,
    },

    plusIcon: {
        position: 'absolute',
        top: -14,
        color: colors.backGround,
    }
});

export default Footer;