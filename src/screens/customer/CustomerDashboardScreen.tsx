import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Calendar, MapPin, Gift, MessageSquare } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { RootStackParamList } from '../../navigation/NavigationService';

export default function CustomerDashboard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);

  const menuItems: Array<{
    icon: typeof Calendar;
    title: string;
    description: string;
    route: keyof RootStackParamList;
  }> = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule your next visit',
      route: 'BookAppointment',
    },
    {
      icon: Calendar,
      title: 'My Appointments',
      description: 'View upcoming bookings',
      route: 'CustomerAppointments',
    },
    {
      icon: Gift,
      title: 'Loyalty Points',
      description: 'Track your rewards',
      route: 'CustomerLoyalty',
    },
    {
      icon: MapPin,
      title: 'Find Shops',
      description: 'Discover barbers near you',
      route: 'Shops',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back, {user?.email}!</Text>
          <Text style={styles.subtitle}>
            Manage your appointments and discover new barbers
          </Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuCard}
                onPress={() => {
                  const route = item.route;
                  navigation.navigate(route as never);
                }}
              >
                <Icon size={32} color="#D4AF37" />
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Upcoming Appointments Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          
          <View style={styles.appointmentItem}>
            <View style={styles.appointmentHeader}>
              <View style={styles.appointmentInfo}>
                <Text style={styles.barberName}>Marcus Johnson</Text>
                <Text style={styles.shopName}>Elite Barbers Downtown</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
            <Text style={styles.appointmentTime}>Today at 2:00 PM</Text>
            <Text style={styles.appointmentService}>
              Haircut + Beard Trim
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('CustomerAppointments')}
          >
            <Text style={styles.viewAllButtonText}>
              View All Appointments
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loyalty Points Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loyalty Points</Text>
          
          <View style={styles.loyaltyContainer}>
            <View style={styles.giftIconContainer}>
              <Gift size={48} color="#D4AF37" />
            </View>
            <Text style={styles.pointsValue}>250</Text>
            <Text style={styles.pointsLabel}>Points Available</Text>
            
            <TouchableOpacity
              style={styles.rewardsButton}
              onPress={() => navigation.navigate('CustomerLoyalty')}
            >
              <Text style={styles.rewardsButtonText}>View Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  menuCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#A0A0A0',
    lineHeight: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  appointmentItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appointmentInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  viewAllButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  loyaltyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  giftIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 16,
  },
  rewardsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  rewardsButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
});