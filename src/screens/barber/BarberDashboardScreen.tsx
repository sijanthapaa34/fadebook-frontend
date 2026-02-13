import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { mockAppointments } from '../../data/mockData';
import { Appointment } from '../../models/models';

export default function BarberDashboard() {
  const user = useAuthStore((state) => state.user);

  const todayAppointments = mockAppointments.filter(
    (apt) => apt.date === new Date().toISOString().split('T')[0]
  );

  const statsData = [
    {
      id: '1',
      icon: Calendar,
      value: todayAppointments.length,
      label: "Today's Appointments",
    },
    {
      id: '2',
      icon: Users,
      value: '156',
      label: 'Total Clients',
    },
    {
      id: '3',
      icon: TrendingUp,
      value: '4.9',
      label: 'Average Rating',
    },
    {
      id: '4',
      icon: Clock,
      value: '09:00-18:00',
      label: 'Working Hours',
    },
  ];

  const renderStatCard = ({ item }: { item: typeof statsData[0] }) => {
    const Icon = item.icon;
    return (
      <View style={styles.statCard}>
        <Icon size={32} color="#D4AF37" />
        <Text style={styles.statValue}>{item.value}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </View>
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.appointmentTime}>{item.time}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.serviceText}>Services: Haircut + Beard Trim</Text>
      <Text style={styles.priceText}>${item.totalPrice}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome, {user?.email}!</Text>
          <Text style={styles.subtitle}>Here's your schedule for today</Text>
        </View>

        {/* Stats Grid */}
        <FlatList
          data={statsData}
          renderItem={renderStatCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.statsGrid}
          columnWrapperStyle={styles.statsRow}
        />

        {/* Today's Schedule */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Today's Schedule</Text>
          
          {todayAppointments.length > 0 ? (
            <FlatList
              data={todayAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.appointmentList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyStateText}>
                No appointments scheduled for today
              </Text>
            </View>
          )}
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
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  scheduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  appointmentList: {
    gap: 12,
  },
  appointmentItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appointmentTime: {
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
    textTransform: 'capitalize',
  },
  serviceText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 16,
  },
});