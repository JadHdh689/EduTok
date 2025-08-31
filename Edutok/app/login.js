import { useWindowDimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, fonts, shadowIntensity } from '../src/constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CONFIG from '../config';

function Login() {
  const { height } = useWindowDimensions();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    
    if (!email || !password) {
      if (!email) setEmailError('Email is required');
      if (!password) setPasswordError('Password is required');
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized);
    if (!emailOk) {
      setEmailError('Enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      console.log("👉 Sending login request to:", `${CONFIG.API_URL}/api/auth/login`);

      const res = await fetch(`${CONFIG.API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNormalized, password }),
      });

      console.log("👉 Got response status:", res.status);

      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        console.log("👉 Failed to parse JSON:", err);
        data = { error: "Unexpected server response" };
      }

      console.log("👉 Response body:", data);
      setIsLoading(false);

      if (!res.ok) {
        const errMsg = data?.error?.toLowerCase() || "";
        console.log("👉 Login API returned error:", errMsg);

        // redirect to verifyOtp ONLY if backend said "verify your email"
        if (res.status === 400 && errMsg.includes("verify")) {
          Alert.alert("Email Not Verified", "Please check your inbox for the OTP.");
          router.replace({ pathname: "/verifyOtp", params: { email: emailNormalized } });
        } else if (res.status === 404 && errMsg.includes("user") && errMsg.includes("exist")) {
          setEmailError("No user exists with this email");
        } else {
          setPasswordError(data?.error || "Login failed");
        }
        return;
      }

      // ✅ Save token
      await AsyncStorage.setItem("auth_token", data.token);

      // ✅ Fetch user info from /me
      let userInfo = data.user || null;
      try {
        const meRes = await fetch(`${CONFIG.API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        console.log("👉 /auth/me response status:", meRes.status);

        if (meRes.ok) {
          const meData = await meRes.json();
          console.log("👉 /auth/me response body:", meData);
          userInfo = meData.user;
        }
      } catch (err) {
        console.log("👉 Error fetching /auth/me:", err);
      }

      if (userInfo) {
        await AsyncStorage.setItem("user_info", JSON.stringify(userInfo));
      }

      Alert.alert("Success", "Login successful ✅");
      router.replace("/profile");

    } catch (err) {
      setIsLoading(false);
      console.error("👉 Login request failed:", err);
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
            <View style={styles.headerContent}>
              <MaterialIcons name="school" size={50} color={colors.iconColor} />
              <Text style={styles.appTitle}>EduTok</Text>
              <Text style={styles.subtitle}>Learn. Create. Share.</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue learning</Text>

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
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Submit */}
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
              onPress={() => router.push('/forgotPassword')}
            >
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
    marginTop: 5,
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
    marginBottom: 30,
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
    fontSize: 16,
    fontFamily: fonts.initial,
    fontWeight: 'bold',
  },
  forgotPassword: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  forgotPasswordText: { 
    color: colors.iconColor, 
    fontSize: 14, 
    fontFamily: fonts.initial 
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 10,
  },
  signUpText: { 
    color: 'gray', 
    fontSize: 14, 
    fontFamily: fonts.initial 
  },
  signUpLink: {
    color: colors.iconColor,
    fontSize: 14,
    fontFamily: fonts.initial,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fonts.initial,
    marginLeft: 5,
    marginTop: 5,
  },
});

export default Login;