// src/screens/barber/BarberScheduleScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Clock, Bell } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchBarberAppointments, 
  fetchBarberUpcoming, 
  fetchBarberPast,
  notifyCustomer 
} from '../../api/appointmentService';
import { AppointmentDetailsResponse } from '../../models/models';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];

const BarberScheduleScreen = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  // Mutation for notifying customer
  const notifyMutation = useMutation({
    mutationFn: notifyCustomer,
    onSuccess: (data) => {
      Alert.alert(
        'Notification Sent',
        `${data.customerName} has been notified about their appointment.`,
        [{ text: 'OK' }]
      );
      setNotifyingId(null);
    },
    onError: (error: any) => {
      Alert.alert(
        'Failed to Send',
        error.response?.data?.message || 'Could not send notification. Please try again.',
        [{ text: 'OK' }]
      );
      setNotifyingId(null);
    },
  });

  const handleNotifyCustomer = (appointmentId: number, customerName: string) => {
    Alert.alert(
      'Notify Customer',
      `Send a reminder notification to ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            setNotifyingId(appointmentId);
            notifyMutation.mutate(appointmentId);
          },
        },
      ]
    );
  };

  // --- 1. Calculate Current Week Dates ---
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5); // Mon to Sat

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    return {
      start: formatDate(monday),
      end: formatDate(saturday)
    };
  };

  const weekDates = getWeekDates();

  // --- 2. API Queries ---

  // Weekly Data for Grid
  const { data: weekData, isLoading: isWeekLoading } = useQuery({
    queryKey: ['barberWeekSchedule', user?.id, weekDates.start],
    queryFn: () => fetchBarberAppointments(user!.id, weekDates.start, weekDates.end, 0, 100),
    enabled: !!user?.id,
  });

  // Upcoming Appointments
  const { data: upcomingData, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['barberUpcoming', user?.id],
    queryFn: () => fetchBarberUpcoming(user!.id, 0, 100),
    enabled: !!user?.id,
  });

  // Past Appointments
  const { data: pastData, isLoading: isPastLoading } = useQuery({
    queryKey: ['barberPast', user?.id],
    queryFn: () => fetchBarberPast(user!.id, 0, 100),
    enabled: !!user?.id,
  });

  // --- 3. Helper Functions ---

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const calculateEndTime = (startStr: string, duration: number) => {
    const date = new Date(startStr);
    date.setMinutes(date.getMinutes() + (duration || 0));
    return formatTime(date.toISOString());
  };

  const getServiceNames = (services: { name: string }[]) => {
    return services?.map(s => s.name).join(', ') || 'N/A';
  };

  const getDateFromString = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // --- 4. Grid Rendering Logic ---

  const weekAppointments = weekData?.content || [];
  
  // Create a map for faster lookup: "DayIndex-HourIndex" -> Appointment
  // Note: This is a simplified grid match logic for demonstration
  const appointmentMap: Record<string, AppointmentDetailsResponse> = {};
  
  weekAppointments.forEach(apt => {
    const date = new Date(apt.scheduledTime);
    let dayIndex = date.getDay(); // 0=Sun, 1=Mon...
    if (dayIndex === 0) dayIndex = 6; // Adjust for our Mon-Sat array (index 0-5)
    else dayIndex -= 1; 

    const hour = date.getHours(); // 9, 10, 11...
    const hourIndex = hour - 9; // Map 9AM to index 0

    // Only map if within our grid bounds
    if (dayIndex >= 0 && dayIndex < 6 && hourIndex >= 0 && hourIndex < hours.length) {
      appointmentMap[`${dayIndex}-${hourIndex}`] = apt;
    }
  });

  const renderGrid = () => {
    const rows = [];

    // Header Row
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

    // Hour Rows
    hours.forEach((h, hIndex) => {
      rows.push(
        <View key={h} style={styles.gridRow}>
          <View style={styles.timeLabelCell}>
            <Text style={styles.timeLabelText}>{h}</Text>
          </View>
          {days.map((d, dIndex) => {
            const key = `${dIndex}-${hIndex}`;
            const apt = appointmentMap[key];
            
            return (
              <View
                key={key}
                style={[
                  styles.gridCell,
                  apt ? styles.bookedCell : styles.emptyCell,
                ]}
              >
                {apt && <Text style={styles.bookedText}>Booked</Text>}
              </View>
            );
          })}
        </View>
      );
    });

    return rows;
  };

  const renderAppointmentCard = (apt: AppointmentDetailsResponse) => (
    <View key={apt.appointmentId} style={styles.aptCard}>
      <View style={styles.aptIconContainer}>
        <Clock size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.aptInfo}>
        <Text style={styles.aptName}>{apt.customerName}</Text>
        <Text style={styles.aptDetails}>
          {getServiceNames(apt.services)} · {formatTime(apt.scheduledTime)}-{calculateEndTime(apt.scheduledTime, apt.totalDurationMinutes)}
        </Text>
      </View>
      <View style={styles.aptActions}>
        <Text style={styles.aptPrice}>Rs. {apt.totalPrice}</Text>
        <TouchableOpacity
          style={styles.notifyButton}
          onPress={() => handleNotifyCustomer(apt.appointmentId, apt.customerName)}
          disabled={notifyingId === apt.appointmentId}
        >
          {notifyingId === apt.appointmentId ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Bell size={16} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isWeekLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
          {isUpcomingLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            upcomingData?.content.map(renderAppointmentCard)
          )}
          {upcomingData?.content.length === 0 && (
            <Text style={styles.emptyText}>No upcoming appointments.</Text>
          )}
        </View>
      </View>

       {/* Past Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past</Text>
        <View style={styles.listContainer}>
          {isPastLoading ? (
             <ActivityIndicator color={theme.colors.primary} />
          ) : (
            pastData?.content.map(renderAppointmentCard)
          )}
          {pastData?.content.length === 0 && (
            <Text style={styles.emptyText}>No past appointments.</Text>
          )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 560, 
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, 
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
    width: 80, 
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
    width: 80, 
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
    borderColor: `${theme.colors.primary}4D`, 
    backgroundColor: `${theme.colors.primary}1A`, 
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
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 10,
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
  aptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
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
  notifyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BarberScheduleScreen;