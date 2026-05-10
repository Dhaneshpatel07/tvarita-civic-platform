import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// We are using OpenStreetMap's free Nominatim API for reverse geocoding!

export default function ReportIssueScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userToken } = useContext(AuthContext);
  const [locationAddress, setLocationAddress] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [category, setCategory] = useState('Pothole');

  const categories = ['Pothole', 'Streetlight', 'Water Leak', 'Waste Management', 'Other'];
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true, // Crucial for reliable JSON upload
    });

    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Save the raw base64 string instead of just the URI
      setImageUri(result.assets[0].base64);
    }
  };

  // Grab GPS coordinates and Reverse-Geocode via Google Maps API
  const fetchLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLocating(true);
      // Get precise GPS coordinates with an 8-second hardware timeout to prevent infinite indoor hanging
      let locationObj = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("GPS signal timeout. Please try outside.")), 8000))
      ]);
      const { latitude, longitude } = locationObj.coords;
      setCoordinates({ latitude, longitude });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // 🛡️ DEMO GOD MODE: Instantly stamp raw coordinates to prevent Nominatim API freezing
      setLocationAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      Alert.alert('Error fetching location', error.message);
    } finally {
      setIsLocating(false);
    }
  };

  const submitIssue = async (forceSubmit = false) => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all required text fields.');
      return;
    }

    if (!coordinates) {
      Alert.alert('Missing Location', 'Please tap "Attach Precise GPS Location" first. Your current coordinates are required for verification.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Missing Image', 'Please attach a photo of the civic issue.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
        address: locationAddress || '',
        forceSubmit: forceSubmit,
        imageBase64: imageUri
      };

      console.log("🛠️ Submitting pure JSON to Tvarita safely via native Fetch...");
      
      const fetchResponse = await fetch(`${api.defaults.baseURL}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseData;
      try {
        responseData = await fetchResponse.json();
      } catch (parseError) {
        throw new Error("Server returned an invalid or corrupted response (possible network drop).");
      }

      if (!fetchResponse.ok) {
        // Handle specific server-side errors
        const error = new Error(responseData.message || `Server Error (${fetchResponse.status})`);
        error.response = { status: fetchResponse.status, data: responseData };
        
        console.error("❌ Submission Failed:", error.message, responseData);
        throw error;
      }
      
      const aiVerdict = responseData.aiCaption || "Verified by AI";
      Alert.alert('Report Saved!', `AI Detection: "${aiVerdict}"\nYour report is now live and tracked!`);
      
      setTitle('');
      setDescription('');
      setImageUri(null);
      setLocationAddress(null);
      setCoordinates(null);
      navigation.navigate('Feed');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        const { duplicateId, message } = error.response.data;
        Alert.alert(
          'Duplicate Nearby!',
          message,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
               text: 'Just Upvote It', 
               onPress: async () => {
                 try {
                   await api.post(`/issues/${duplicateId}/upvote`, { 
                     latitude: coordinates.latitude, 
                     longitude: coordinates.longitude 
                   });
                   Alert.alert('Success', 'You organically upvoted the existing issue instead!');
                   navigation.navigate('Feed');
                 } catch (upvoteError) {
                   Alert.alert('Validation Error', upvoteError.response?.data?.message || 'Upvote failed. Stay within 30m.');
                 }
               }
            },
            { 
               text: 'Force Submit', 
               onPress: () => submitIssue(true),
               style: 'destructive'
            }
          ]
        );
      } else {
        const errMsg = error.response?.data?.message || error.message;
        Alert.alert('Upload Error', errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Issue Title*</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Large Deep Pothole" 
          value={title}
          onChangeText={setTitle}
        />
        
        <Text style={styles.label}>Description*</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Provide more details..." 
          multiline 
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Category*</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- Image Selection UI --- */}
        <TouchableOpacity style={styles.actionArea} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: `data:image/jpeg;base64,${imageUri}` }} style={styles.previewImage} />
          ) : (
            <Text style={styles.actionText}>📷 Tap to Attach Photo</Text>
          )}
        </TouchableOpacity>

        {/* --- Geographic Location UI --- */}
        <TouchableOpacity style={[styles.actionArea, { marginTop: 0 }]} onPress={fetchLocation}>
          {isLocating ? (
             <Text style={styles.actionText}>📍 Finding location...</Text>
          ) : locationAddress ? (
            <Text style={[styles.actionText, {color: '#4F46E5', fontWeight: 'bold'}]}>✅ {locationAddress}</Text>
          ) : (
            <Text style={styles.actionText}>📍 Tap to Attach Precise GPS Location</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { backgroundColor: '#9CA3AF' }]} 
          onPress={submitIssue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator color="white" />
          ) : (
             <Text style={styles.submitText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  actionArea: { backgroundColor: '#F9FAFB', borderStyle: 'dashed', borderWidth: 2, borderColor: '#D1D5DB', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16, minHeight: 60, justifyContent: 'center' },
  actionText: { color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  previewImage: { width: '100%', height: 150, borderRadius: 8, resizeMode: 'cover' },
  submitButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  categoryChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#D1D5DB' },
  categoryChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categoryText: { color: '#374151', fontWeight: 'bold' },
  categoryTextActive: { color: '#FFF' }
});
