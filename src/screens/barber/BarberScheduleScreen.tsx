// src/screens/barber/BarberScheduleScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { theme } from '../../theme/theme';

// Mocking data for demonstration
const seedAppointments = [
  { id: '1', barberId: 'b1', customerName: 'John Doe', serviceName: 'Haircut', date: '2026-02-13', time: '09:00 AM', price: 35 },
  { id: '2', barberId: 'b1', customerName: 'Mike Ross', serviceName: 'Beard Trim', date: '2026-02-13', time: '10:00 AM', price: 25 },
  { id: '3', barberId: 'b1', customerName: 'Alex Kim', serviceName: 'Fade & Lineup', date: '2026-02-14', time: '11:30 AM', price: 45 },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];

const BarberScheduleScreen = () => {
  
  // Helper to render the grid rows
  const renderGrid = () => {
    const rows = [];

    // 1. Header Row (Days)
    rows.push(
      <View key="header" style={styles.gridRow}>
        <View style={styles.timeLabelCell}>
          <Text style={styles.timeLabelText}></Text>
        </View>
        {days.map((d) => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>
    );

    // 2. Hour Rows
    hours.forEach((h) => {
      rows.push(
        <View key={h} style={styles.gridRow}>
          <View style={styles.timeLabelCell}>
            <Text style={styles.timeLabelText}>{h}</Text>
          </View>
          {days.map((d) => {
            // Mock logic for random bookings
            const hasAppt = Math.random() > 0.8;
            return (
              <View
                key={`${d}-${h}`}
                style={[
                  styles.gridCell,
                  hasAppt ? styles.bookedCell : styles.emptyCell,
                ]}
              >
                {hasAppt && <Text style={styles.bookedText}>Booked</Text>}
              </View>
            );
          })}
        </View>
      );
    });

    return rows;
  };

  const upcomingAppointments = seedAppointments
    .filter((a) => a.barberId === 'b1')
    .slice(0, 3);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>Your weekly overview</Text>
      </View>

      {/* Weekly Grid */}
      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {renderGrid()}
          </View>
        </ScrollView>
      </View>

      {/* Upcoming Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.listContainer}>
          {upcomingAppointments.map((apt) => (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.aptIconContainer}>
                <Clock size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.aptInfo}>
                <Text style={styles.aptName}>{apt.customerName}</Text>
                <Text style={styles.aptDetails}>
                  {apt.serviceName} · {apt.date} at {apt.time}
                </Text>
              </View>
              <Text style={styles.aptPrice}>${apt.price}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  
  // Card Style
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },

  // Grid Styles
  gridContainer: {
    // Fixed width container to ensure grid layout inside horizontal scroll
    width: 560, 
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // gap-1 equivalent
  },
  timeLabelCell: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  timeLabelText: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  dayHeaderCell: {
    width: 80, // Fixed width for columns
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  gridCell: {
    width: 80, // Match header
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginHorizontal: 2,
  },
  emptyCell: {
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  bookedCell: {
    borderColor: `${theme.colors.primary}4D`, // ~30% opacity
    backgroundColor: `${theme.colors.primary}1A`, // ~10% opacity
  },
  bookedText: {
    fontSize: 10,
    fontFamily: theme.fonts.sans,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  
  // Appointment Card
  aptCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aptIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  aptInfo: {
    flex: 1,
  },
  aptName: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '500',
    color: theme.colors.text,
  },
  aptDetails: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: 2,
  },
  aptPrice: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default BarberScheduleScreen;