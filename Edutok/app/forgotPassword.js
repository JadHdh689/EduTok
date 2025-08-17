import { useWindowDimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function ForgotPassword() {
    const { height } = useWindowDimensions();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setIsLoading(true);

        // TODO: Replace with actual password reset API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Password reset link sent to your email.');
            router.replace('/login');
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { height: height * 0.3 }]}>
                <View style={styles.headerContent}>
                    <MaterialIcons name="lock-reset" size={60} color={colors.iconColor} />
                    <Text style={styles.appTitle}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
                </View>
            </View>

            <View style={styles.formContainer}>
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

                {/* Reset Button */}
                <TouchableOpacity 
                    style={[styles.resetButton, shadowIntensity.bottomShadow]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    <Text style={styles.resetButtonText}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backToLogin}>
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
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
        fontSize: 28,
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
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
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
    resetButton: {
        backgroundColor: colors.iconColor,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: fonts.initial,
        fontWeight: 'bold',
    },
    backToLogin: {
        alignItems: 'center',
    },
    backToLoginText: {
        color: colors.iconColor,
        fontSize: 14,
        fontFamily: fonts.initial,
    },
});

export default ForgotPassword;
