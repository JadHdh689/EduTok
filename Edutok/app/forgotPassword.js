import { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { API_URL } from "../config"; // ✅ use centralized config

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Step 1 → Request reset code
  const handleSendCode = async () => {
    if (!email) return Alert.alert("Error", "Please enter your email");
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

      if (!res.ok) return Alert.alert("Error", data.error || "Failed to send code");
      Alert.alert("Success", "A reset code has been sent to your email");
      setStep(2);
    } catch {
      setIsLoading(false);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  // Step 2 → Reset password with OTP
  const handleResetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert("Error", "Fill all fields");
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

      if (!res.ok) return Alert.alert("Error", data.error || "Reset failed");
      Alert.alert("Success", "Password reset successful. Please log in.");
      router.replace("/login");
    } catch {
      setIsLoading(false);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Sending..." : "Send Code"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#fff", padding: 20 },
  formContainer: { marginTop: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default ForgotPassword;
