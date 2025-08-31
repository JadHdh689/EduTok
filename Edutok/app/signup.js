import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
import { colors, fonts, shadowIntensity } from '../src/constants';

// Config (API base URL)
import CONFIG from "../config";

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function SignUp() {
  const { height } = useWindowDimensions();
  const router = useRouter();

  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('student'); // Optional role selector
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Sign Up
  const handleSignUp = async () => {
    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Basic validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      if (!name.trim()) setNameError('Name is required');
      if (!email.trim()) setEmailError('Email is required');
      if (!password) setPasswordError('Password is required');
      if (!confirmPassword) setConfirmPasswordError('Confirm password is required');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const nameTrimmed = name.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized);
    if (!emailOk) {
      setEmailError('Enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${CONFIG.API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameTrimmed,
          email: emailNormalized,
          password,
          preferences: [],
          role: userType === "creator" ? "creator" : "learner",
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { error: "Unexpected server response" };
      }

      setIsLoading(false);

      if (!res.ok) {
        const errMsg = data?.error?.toLowerCase() || "";
        
        if (res.status === 409 && errMsg.includes("user") && errMsg.includes("exist")) {
          setEmailError("Sorry, this user already exists");
        } else {
          setEmailError(data?.error || "Signup failed");
        }
        return;
      }

      // ✅ No token yet → wait for verification
      Alert.alert(
        "Verify Your Email",
        "We sent you a 6-digit OTP. Please check your inbox."
      );

      // ✅ Move user to verification page with email pre-filled
      router.replace({ pathname: "/verifyOtp", params: { email: emailNormalized } });

    } catch (error) {
      console.log("Signup error:", error);
      setIsLoading(false);
      Alert.alert("Error", "Network error. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { height: height * 0.25 }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.iconColor} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <MaterialIcons name="school" size={50} color={colors.iconColor} />
              <Text style={styles.appTitle}>Join EduTok</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Start your learning journey today</Text>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === 'student' && styles.userTypeButtonActive]}
                onPress={() => setUserType('student')}
              >
                <MaterialIcons
                  name="school"
                  size={20}
                  color={userType === 'student' ? 'white' : colors.iconColor}
                />
                <Text style={[styles.userTypeText, userType === 'student' && styles.userTypeTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userTypeButton, userType === 'creator' && styles.userTypeButtonActive]}
                onPress={() => setUserType('creator')}
              >
                <MaterialIcons
                  name="video-camera-front"
                  size={20}
                  color={userType === 'creator' ? 'white' : colors.iconColor}
                />
                <Text style={[styles.userTypeText, userType === 'creator' && styles.userTypeTextActive]}>
                  Creator
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="gray" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="gray"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            {/* Email */}
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
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password */}
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
                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="gray" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="gray" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="gray"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color="gray" />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.signUpButton, shadowIntensity.bottomShadow]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.screenColor 
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.initial,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    zIndex: 1 
  },
  headerContent: { 
    alignItems: 'center' 
  },
  appTitle: {
    fontSize: 28,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    marginTop: 10,
    fontWeight: 'bold',
  },
  subtitle: { 
    fontSize: 14, 
    fontFamily: fonts.initial, 
    color: 'gray', 
    marginTop: 5 
  },
  formContainer: { 
    flex: 1, 
    paddingHorizontal: 30, 
    paddingTop: 30,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: fonts.initial,
    color: colors.iconColor,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: { 
    fontSize: 14, 
    fontFamily: fonts.initial, 
    color: 'gray', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  userTypeContainer: { 
    flexDirection: 'row', 
    marginBottom: 25, 
    gap: 10 
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userTypeButtonActive: { 
    backgroundColor: colors.iconColor, 
    borderColor: colors.iconColor 
  },
  userTypeText: { 
    marginLeft: 8, 
    fontSize: 16, 
    fontFamily: fonts.initial, 
    color: colors.iconColor 
  },
  userTypeTextActive: { 
    color: 'white' 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: { 
    marginRight: 10 
  },
  textInput: { 
    flex: 1, 
    fontSize: 16, 
    fontFamily: fonts.initial, 
    color: colors.iconColor 
  },
  signUpButton: {
    backgroundColor: colors.iconColor,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontFamily: fonts.initial, 
    fontWeight: 'bold' 
  },
  loginContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20 
  },
  loginText: { 
    color: 'gray', 
    fontSize: 16, 
    fontFamily: fonts.initial 
  },
  loginLink: { 
    color: colors.iconColor, 
    fontSize: 16, 
    fontFamily: fonts.initial, 
    fontWeight: 'bold' 
  },
  errorText: {
    color: colors.secondary,
    fontSize: 14,
    fontFamily: fonts.initial,
    marginLeft: 5,
  },
});

export default SignUp;