import { useWindowDimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

function Login() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    
    // State Management
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Login Handler
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        
        // TODO: Replace with actual authentication API call
        setTimeout(() => {
            setIsLoading(false);
            // Simulate successful login
            router.replace('/profile');
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { height: height * 0.3 }]}>
                <View style={styles.headerContent}>
                    <MaterialIcons name="school" size={60} color={colors.iconColor} />
                    <Text style={styles.appTitle}>EduTok</Text>
                    <Text style={styles.subtitle}>Learn. Create. Share.</Text>
                </View>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Text style={styles.formSubtitle}>Sign in to continue learning</Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={20} color="gray" style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        placeholderTextColor="gray"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color="gray" style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Password"
                        placeholderTextColor="gray"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialIcons 
                            name={showPassword ? "visibility" : "visibility-off"} 
                            size={20} 
                            color="gray" 
                        />
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity 
                    style={[styles.loginButton, shadowIntensity.bottomShadow]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity 
                style={styles.forgotPassword} 
                onPress={() => router.push('/forgotPassword')}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 32,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        marginTop: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: fonts.initial,
        color: 'gray',
        marginTop: 5,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
    },
    formTitle: {
        fontSize: 28,
        fontFamily: fonts.initial,
        color: colors.iconColor,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 16,
        fontFamily: fonts.initial,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.initial,
        color: colors.iconColor,
    },
    loginButton: {
        backgroundColor: colors.iconColor,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignItems: 'center',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: colors.iconColor,
        fontSize: 14,
        fontFamily: fonts.initial,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: 'gray',
        fontSize: 16,
        fontFamily: fonts.initial,
    },
    signUpLink: {
        color: colors.iconColor,
        fontSize: 16,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
    },
});

export default Login;