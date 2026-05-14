import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Platform } from 'react-native';
import * as Device from 'expo-device';

import Constants, { ExecutionEnvironment } from 'expo-constants';

import api from './services/api';
import { AuthProvider, AuthContext } from './context/AuthContext';

import IssueFeedScreen from './screens/IssueFeedScreen';
import ReportIssueScreen from './screens/ReportIssueScreen';
import MyReportsScreen from './screens/MyReportsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  try {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (projectId) {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } else {
        console.log('No EAS projectId found, skipping push token');
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
    return token;
  } catch (e) {
    console.log('Push notification setup failed safely:', e.message);
    return null;
  }
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Feed') return <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />;
          if (route.name === 'Report') return <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />;
          if (route.name === 'History') return <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Feed" component={IssueFeedScreen} options={{ title: 'Reported Issues' }} />
      <Tab.Screen name="Report" component={ReportIssueScreen} options={{ title: 'Report New Issue' }} />
      <Tab.Screen name="History" component={MyReportsScreen} options={{ title: 'My Reports' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  React.useEffect(() => {
    if (userToken) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
           api.put('/auth/token', { token }).catch(err => console.log('Silently failed to save push key', err));
        }
      });
    }
  }, [userToken]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
           <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
