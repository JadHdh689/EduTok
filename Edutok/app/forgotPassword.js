import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CONFIG from "../config";
import { colors } from "../src/constants";

const API_URL = CONFIG.API_URL;

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }
    
    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateStep1()) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { error: "Unexpected server response" };
      }

      setIsLoading(false);

      if (!res.ok) {
        setErrors({ general: data.error || "Failed to send code" });
        return;
      }
      
      setErrors({});
      setStep(2);
    } catch {
      setIsLoading(false);
      setErrors({ general: "Network error. Please try again." });
    }
  };

  const handleResetPassword = async () => {
    if (!validateStep2()) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { error: "Unexpected server response" };
      }

      setIsLoading(false);

      if (!res.ok) {
        setErrors({ general: data.error || "Reset failed" });
        return;
      }
      
      setErrors({});
      router.replace("/login");
    } catch {
      setIsLoading(false);
      setErrors({ general: "Network error. Please try again." });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              {step === 1 ? (
                <>
                  <Text style={styles.title}>Forgot Password</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address and we'll send you a code to reset your password.
                  </Text>
                  
                  {errors.general && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{errors.general}</Text>
                    </View>
                  )}
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({...errors, email: null});
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {errors.email && (
                      <Text style={styles.fieldErrorText}>{errors.email}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Sending..." : "Send Code"}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                  >
                    <Text style={styles.backButtonText}>Back to Login</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>
                    Enter the code sent to your email and your new password.
                  </Text>
                  
                  {errors.general && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{errors.general}</Text>
                    </View>
                  )}
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, errors.otp && styles.inputError]}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        if (errors.otp) setErrors({...errors, otp: null});
                      }}
                      maxLength={6}
                      keyboardType="number-pad"
                    />
                    {errors.otp && (
                      <Text style={styles.fieldErrorText}>{errors.otp}</Text>
                    )}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, errors.newPassword && styles.inputError]}
                      placeholder="Enter new password"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (errors.newPassword) setErrors({...errors, newPassword: null});
                        if (errors.confirmPassword && confirmPassword && text === confirmPassword) {
                          setErrors({...errors, confirmPassword: null});
                        }
                      }}
                    />
                    {errors.newPassword && (
                      <Text style={styles.fieldErrorText}>{errors.newPassword}</Text>
                    )}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirm new password"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                      }}
                      onSubmitEditing={handleResetPassword}
                    />
                    {errors.confirmPassword && (
                      <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep(1)}
                  >
                    <Text style={styles.backButtonText}>Back to Email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  formContainer: { 
    marginTop: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: "center",
    color: colors.primary 
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    paddingHorizontal: 20,
    lineHeight: 22
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9"
  },
  inputError: {
    borderColor: "#ff3b30"
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  buttonDisabled: {
    backgroundColor: "#ccc"
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  backButton: {
    padding: 10,
    alignItems: "center"
  },
  backButtonText: {
    color: colors.secondary,
    fontSize: 16
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff3b30"
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14
  },
  fieldErrorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5
  }
});

export default ForgotPassword;