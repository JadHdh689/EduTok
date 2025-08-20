import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '../config';

export default function VerifyOtp() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      Alert.alert('Error', 'OTP must be exactly 6 digits');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: trimmedOtp }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Unexpected server response' };
      }

      setLoading(false);

      if (!res.ok) {
        Alert.alert('Error', data.error || 'Verification failed');
        return;
      }

      Alert.alert('Success', 'Account verified. Please sign in.');
      router.replace('/login');
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Network error. Try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Unexpected server response' };
      }

      setResending(false);

      if (!res.ok) {
        Alert.alert('Error', data.error || 'Failed to resend code');
        return;
      }

      Alert.alert('Success', 'A new code has been sent to your email');
    } catch {
      setResending(false);
      Alert.alert('Error', 'Network error. Try again.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        Enter the 6-digit code sent to {email}
      </Text>

      <TextInput
        placeholder="123456"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading || resending}
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 10,
          backgroundColor: loading ? 'gray' : 'black',
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Verifying…' : 'Verify'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResendOtp}
        disabled={loading || resending}
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          backgroundColor: resending ? 'gray' : '#444',
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {resending ? 'Resending…' : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
