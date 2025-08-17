import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '../config'; // ✅ use centralized config

export default function VerifyOtp() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the code');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
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
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />
      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 10,
          backgroundColor: 'black',
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Verifying…' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
