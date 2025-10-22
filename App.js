import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { TicketProvider } from './src/context/TicketContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { GpsProvider } from './src/context/GpsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <NotificationProvider>
          <GpsProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </GpsProvider>
        </NotificationProvider>
      </TicketProvider>
    </AuthProvider>
  );
}