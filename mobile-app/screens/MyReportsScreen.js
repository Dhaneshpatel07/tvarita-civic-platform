import React, { useState, useCallback, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function MyReportsScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout, userData } = useContext(AuthContext);

  const fetchMyIssues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/issues/my');
      setIssues(data);
    } catch (err) {
      console.warn("Fetch Error:", err.message);
      Alert.alert('Sync Error', 'Could not retrieve your reporting history from the cloud.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyIssues();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[styles.badge, styles[`badge_${(item.status || 'Open').replace(' ', '')}`]]}>
           <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Reported on: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={{fontSize: 12, color: '#9CA3AF', paddingHorizontal: 20, paddingBottom: 15}}>Reference ID: {item._id.substring(0, 8)}...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.dashHeader}>
         <Text style={{fontWeight: 'bold', fontSize: 16}}>Citizen: {userData?.name || 'Anonymous'}</Text>
         <TouchableOpacity onPress={logout}><Text style={{color: '#EF4444', fontWeight: 'bold'}}>Log Out</Text></TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 10, color: '#6B7280' }}>Fetching your records...</Text>
        </View>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={fetchMyIssues}
          refreshing={loading}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>📂</Text>
              <Text style={{ textAlign: 'center', fontWeight: '800', fontSize: 16, color: '#374151' }}>No Records Found</Text>
              <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 8 }}>Your successfully submitted reports will appear here in chronological order.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'},
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  subtitle: { fontSize: 14, color: '#6B7280', paddingHorizontal: 20, marginBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badge_Open: { backgroundColor: '#FEE2E2' },
  badge_InProgress: { backgroundColor: '#FEF3C7' },
  badge_Resolved: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#111' },
});
