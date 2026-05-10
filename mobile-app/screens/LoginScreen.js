import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/tvarita-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Tvarita</Text>
      <Text style={styles.subtitle}>Log in to report and track neighborhood issues</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          autoCapitalize="none" 
          keyboardType="email-address" 
          value={email} onChangeText={setEmail} 
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          secureTextEntry 
          value={password} onChangeText={setPassword} 
        />
        
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && { backgroundColor: '#9CA3AF' }]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.secondaryText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4F46E5', justifyContent: 'center', padding: 20 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20, borderRadius: 25 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#E0E7FF', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  primaryButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { marginTop: 16, alignItems: 'center' },
  secondaryText: { color: '#4F46E5', fontSize: 14, fontWeight: '600' }
});
