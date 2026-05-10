import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';
import api from '../services/api';

// Using require for assets is safer for bundling compatibility
const logo = require('../assets/tvarita-logo.png');

export default function IssueFeedScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locatingId, setLocatingId] = useState(null);
  const [viewMode, setViewMode] = useState('100m'); 

  const fetchIssues = async (mode = viewMode) => {
    setLoading(true);
    setViewMode(mode);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to see nearby issues.');
        setLoading(false);
        return;
      }
      let locationObj = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = locationObj.coords;

      let endpoint = `/issues/nearby?lat=${latitude}&lng=${longitude}&radius=${mode === 'global' ? 100000 : 100}`;
      const { data } = await api.get(endpoint);
      setIssues(data);
    } catch (err) {
      Alert.alert('Connection Error', 'Could not fetch issues from the server.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchIssues(viewMode);
    }, [viewMode])
  );

  const handleUpvote = async (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLocatingId(id);
    try {
      let locationObj = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = locationObj.coords;

      await api.post(`/issues/${id}/upvote`, { latitude, longitude });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Verified!', 'Your physical upvote has been securely counted.');
      fetchIssues(viewMode); 
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg = error.response && error.response.data.message ? error.response.data.message : error.message;
      Alert.alert('Validation Failed', errorMsg);
    } finally {
      setLocatingId(null);
    }
  };

  const AnimatedCard = ({ children }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, [fadeAnim]);
    return <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>{children}</Animated.View>;
  };

  const renderItem = ({ item }) => (
    <AnimatedCard>
      <View style={styles.card}>
      {!!item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.imageHeader} />
      )}
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[styles.badge, styles[`badge_${(item.status || 'Open').replace(' ', '')}`]]}>
           <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{item.category || 'Other'} - Priority: <Text style={{fontWeight: 'bold', color: item.priority === 'Critical' ? 'red' : 'gray'}}>{item.priority || 'Low'}</Text></Text>

      <TouchableOpacity 
         style={[styles.upvoteButton, locatingId === item._id && {backgroundColor: '#D1D5DB'}]} 
         onPress={() => handleUpvote(item._id)}
         disabled={locatingId === item._id}
      >
        {locatingId === item._id ? (
          <Text style={styles.upvoteText}>ðŸ“ Triangulating Hardware GPS...</Text>
        ) : (
          <Text style={styles.upvoteText}>ðŸ‘ Verify & Upvote (+15pts) â€¢ {item.upvotes?.length || 0}</Text>
        )}
      </TouchableOpacity>
    </View>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.brandingHeader}>
         <Image source={logo} style={styles.mobileLogo} />
         <Text style={styles.mobileTagline}>à¤¤à¥à¤µà¤°à¤¿à¤¤à¤‚ à¤¸à¤®à¤¾à¤§à¤¾à¤¨à¤®à¥ â€¢ à¤ªà¤¾à¤°à¤¦à¤°à¥à¤¶à¤•à¤¤à¤¾</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="large" color="#4F46E5" />
           <Text style={{ marginTop: 10, color: 'gray', fontWeight: 'bold' }}>Retrieving Tvarita Cloud Data...</Text>
        </View>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={() => fetchIssues(viewMode)}
          refreshing={loading}
          ListEmptyComponent={
             <View style={{alignItems: 'center', marginTop: 40, paddingHorizontal: 20}}>
               <Text style={{fontSize: 50, marginBottom: 10}}>[Map]</Text>
               <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#374151'}}>No civic logs within 100 meters.</Text>
               <Text style={{textAlign: 'center', color: '#6B7280', marginTop: 8}}>You are currently in Restricted Privacy Mode (Local Only).</Text>
               <TouchableOpacity 
                  onPress={() => fetchIssues('global')}
                  style={{marginTop: 20, backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10}}
               >
                  <Text style={{color: 'white', fontWeight: 'bold'}}>View All City Issues</Text>
               </TouchableOpacity>
             </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  brandingHeader: { backgroundColor: '#FFF', alignItems: 'center', paddingTop: 10, paddingBottom: 5 },
  mobileLogo: { height: 45, width: 120, resizeMode: 'contain' },
  mobileTagline: { fontSize: 13, color: '#4F46E5', fontWeight: 'bold', marginTop: 2 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
  imageHeader: { width: '100%', height: 160, resizeMode: 'cover' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, paddingHorizontal: 20 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginLeft: 10 },
  badge_Open: { backgroundColor: '#FEE2E2' },
  badge_InProgress: { backgroundColor: '#FEF3C7' },
  badge_Resolved: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#111', textTransform: 'uppercase' },
  upvoteButton: { backgroundColor: '#EEF2FF', padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  upvoteText: { color: '#4F46E5', fontWeight: '800', fontSize: 15 }
});
