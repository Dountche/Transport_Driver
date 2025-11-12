import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import Dashboard from '../screens/Dashboard/Home';
import Notifications from '../screens/Dashboard/Notifications';
import TicketList from '../screens/Tickets/TicketList';
import TicketDetail from '../screens/Tickets/TicketDetail';
import TicketScanner from '../screens/Tickets/TicketScanner';
import ReservationList from '../screens/Reservations/ReservationList';
import ReservationDetail from '../screens/Reservations/ReservationDetail';
import MapView from '../screens/Map/MapView';
import VehicleSelectionScreen from '../screens/Map/VehicleSelectionScreen';
import GetProfil from '../screens/Profil/GetProfil';
import EditProfil from '../screens/Profil/EditProfil';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack pour Dashboard
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={Dashboard} 
      options={{ title: 'Tableau de bord' }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={Notifications} 
      options={{ title: 'Notifications' }}
    />
  </Stack.Navigator>
);

// Stack pour Tickets
const TicketsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TicketList" 
      component={TicketList} 
      options={{ title: 'Tickets validés' }}
    />
    <Stack.Screen 
      name="TicketDetail" 
      component={TicketDetail} 
      options={{ title: 'Détails du ticket' }}
    />
    <Stack.Screen 
      name="TicketScanner" 
      component={TicketScanner} 
      options={{ title: 'Scanner QR' }}
    />
  </Stack.Navigator>
);

// Stack pour Réservations
const ReservationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ReservationList" 
      component={ReservationList} 
      options={{ title: 'Réservations' }}
    />
    <Stack.Screen 
      name="ReservationDetail" 
      component={ReservationDetail} 
      options={{ title: 'Détails de la réservation' }}
    />
  </Stack.Navigator>
);

// Stack pour Carte
const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MapView" 
      component={MapView} 
      options={{ title: 'Carte' }}
    />
    <Stack.Screen 
      name="VehicleSelection" 
      component={VehicleSelectionScreen} 
      options={{ title: 'Sélection de véhicule' }}
    />
  </Stack.Navigator>
);

// Stack pour Profil
const ProfilStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="GetProfil" 
      component={GetProfil} 
      options={{ title: 'Profil' }}
    />
    <Stack.Screen 
      name="EditProfil" 
      component={EditProfil} 
      options={{ title: 'Modifier le profil' }}
    />
  </Stack.Navigator>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Tickets') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Tickets" 
        component={TicketsStack}
        options={{ title: 'Tickets' }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationsStack}
        options={{ title: 'Réservations' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapStack}
        options={{ title: 'Carte' }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfilStack}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
