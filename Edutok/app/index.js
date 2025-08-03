// app/index.js
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Welcome to EduTok!</Text>

      <Pressable onPress={() => router.push('/profile')}>
        <Text style={{ color: 'blue', marginTop: 10 }}>
          Go to Profile
        </Text>
      </Pressable>
    </View>
  );
}
