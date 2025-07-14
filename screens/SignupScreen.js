import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isWeb = Platform.OS === 'web';
  const showAlert = (title, message) => {
    if (isWeb) {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = async () => {
    console.log('🔥 Signing up with:', email, password);

    if (!email || !password) {
      console.log('⚠️ Missing fields');
      showAlert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      console.log('⚠️ Password too short');
      showAlert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.log('❌ Signup error:', error);
      showAlert('Signup Failed', error.message);
    } else {
      console.log('✅ Signup success:', data);
      showAlert('Success', 'Account created! Please log in.');
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
        value={email}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />

      <Button title="Sign Up" onPress={handleSignUp} color="#2196F3" />

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#999',
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  link: {
    color: '#2196F3',
    marginTop: 16,
    textAlign: 'center',
  },
});
