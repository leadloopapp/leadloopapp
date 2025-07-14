import React from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }) {


const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } else {
    alert('Logout failed: ' + error.message);
  }
 };

  const isWeb = Platform.OS === 'web';

  const showAlert = (title, message) => {
    if (isWeb) {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('Logout error:', error);
      showAlert('Logout Failed', error.message);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
  <Text style={styles.title}>Welcome to Leadloop 👋</Text>

  <Button
    title="Go to DM Tracker"
    onPress={() => navigation.navigate('DMs')}
  />
  <View style={styles.spacer} />
  <Button title="Log Out" onPress={logout} color="#FF5252" />
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  spacer: {
    height: 16,
  },
});
