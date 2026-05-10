import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    try {
      if (!name || !email || !password) return Alert.alert('Validation Error', 'Please fill all fields');
      setIsLoading(true);
      await register(name, email, password);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          value={name} onChangeText={setName} 
        />
        
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
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Register & Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4F46E5', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  primaryButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { marginTop: 16, alignItems: 'center' },
  secondaryText: { color: '#6B7280', fontSize: 14, fontWeight: '600' }
});
