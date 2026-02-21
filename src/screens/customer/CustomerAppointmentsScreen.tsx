// src/screens/customer/CustomerAppointmentsScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, RefreshCw, XCircle } from 'lucide-react-native';
import { parseISO, format } from 'date-fns';
import { theme } from '../../theme/theme';
import { 
  fetchUpcomingAppointments, 
  fetchPastAppointments, 
  cancelAppointment 
} from '../../api/appointmentService';
import { AppointmentDetailsResponse, ServiceItemDTO } from '../../models/models';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- Status Styles Helper ---
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return { bg: 'rgba(34, 197, 94, 0.1)', text: theme.colors.success, border: 'rgba(34, 197, 94, 0.2)' };
    case 'PENDING':
      return { bg: 'rgba(245, 158, 11, 0.1)', text: theme.colors.warning, border: 'rgba(245, 158, 11, 0.2)' };
    case 'COMPLETED':
      return { bg: theme.colors.surface, text: theme.colors.muted, border: theme.colors.border };
    case 'CANCELLED':
      return { bg: 'rgba(239, 68, 68, 0.1)', text: theme.colors.error, border: 'rgba(239, 68, 68, 0.2)' };
    default:
      return { bg: theme.colors.surface, text: theme.colors.muted, border: theme.colors.border };
  }
};

const CustomerAppointments = () => {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  // Fetch Upcoming
  const { 
    data: upcomingData, 
    isLoading: loadingUpcoming, 
    refetch: refetchAll 
  } = useQuery({
    queryKey: ['upcomingAppointments'],
    queryFn: () => fetchUpcomingAppointments(0, 20),
  });

  // Fetch Past
  const { 
    data: pastData, 
    isLoading: loadingPast 
  } = useQuery({
    queryKey: ['pastAppointments'],
    queryFn: () => fetchPastAppointments(0, 20),
  });

  // Cancel Mutation
  const { mutate: mutateCancel, isPending: isCanceling } = useMutation({
    mutationFn: (appointmentId: number) => cancelAppointment(appointmentId),
    onSuccess: () => {
      Alert.alert('Success', 'Appointment cancelled successfully.');
      // Refetch both lists to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['pastAppointments'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel appointment.');
    }
  });

  const upcoming = upcomingData?.content ?? [];
  const past = pastData?.content ?? [];

    const handleReschedule = (apt: AppointmentDetailsResponse) => {
    if (!apt.services || apt.services.length === 0) {
        Alert.alert("Error", "No services found for this appointment.");
        return;
    }

    const serviceItems: ServiceItemDTO[] = apt.services.map(s => ({
        serviceId: s.id,
        name: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes
    }));

    navigation.navigate('BookAppointment', {
      shopId: apt.barbershopId.toString(),
      shopName: apt.barbershopName,
      reschedule: {
        appointmentId: apt.appointmentId,
        shopId: apt.barbershopId,
        shopName: apt.barbershopName,
        services: serviceItems, 
        barberId: apt.barberId,
        barberName: apt.barberName,
        price: apt.totalPrice,
        duration: apt.totalDurationMinutes,
      },
    });
  };

  const handleCancel = (apt: AppointmentDetailsResponse) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => mutateCancel(apt.appointmentId)
        }
      ]
    );
  };

  if (loadingUpcoming || loadingPast) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loadingUpcoming} onRefresh={refetchAll} />}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>My Appointments</Text>
        <Text style={styles.subtitle}>Manage your upcoming and past bookings</Text>
      </View>

      {/* Upcoming Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.listContainer}>
          {upcoming.length === 0 && (
            <Text style={styles.emptyText}>No upcoming appointments.</Text>
          )}
          {upcoming.map((apt) => {
            const statusStyle = getStatusStyle(apt.status);
            const serviceNames = apt.services?.map(s => s.name).join(', ') || 'Service';
            
            return (
              <View key={apt.appointmentId} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{serviceNames}</Text>
                    <View style={styles.shopRow}>
                      <MapPin size={12} color={theme.colors.muted} />
                      <Text style={styles.shopText}>{apt.barbershopName}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{apt.status}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Calendar size={14} color={theme.colors.muted} />
                    <Text style={styles.infoText}>{format(parseISO(apt.scheduledTime), 'MMM d, yyyy')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Clock size={14} color={theme.colors.muted} />
                    <Text style={styles.infoText}>{format(parseISO(apt.scheduledTime), 'h:mm a')}</Text>
                  </View>
                </View>
                <Text style={[styles.infoText, { marginBottom: 10 }]}>with {apt.barberName}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.priceText}>${apt.totalPrice.toFixed(2)}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.rescheduleBtn} onPress={() => handleReschedule(apt)}>
                      <RefreshCw size={13} color={theme.colors.text} />
                      <Text style={styles.rescheduleText}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelBtn} 
                      onPress={() => handleCancel(apt)}
                      disabled={isCanceling}
                    >
                      <XCircle size={13} color={theme.colors.error} />
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Past Section */}
      {past.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past</Text>
          <View style={styles.listContainer}>
            {past.map((apt) => {
              const serviceNames = apt.services?.map(s => s.name).join(', ') || 'Service';
              return (
                <View key={apt.appointmentId} style={[styles.card, styles.cardPast]}>
                  <View style={styles.pastRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.cardTitle}>{serviceNames}</Text>
                      <Text style={styles.pastSubtext}>
                        {format(parseISO(apt.scheduledTime), 'MMM d')} · {apt.barbershopName}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>${apt.totalPrice.toFixed(2)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: 4,
  },
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
    marginTop: 20,
    fontSize: 14,
  },
  // Card Styles
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  cardPast: {
    opacity: 0.6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  cardTopLeft: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  shopText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  priceText: {
    fontSize: 15,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  rescheduleText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cancelText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  pastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastSubtext: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
});

export default CustomerAppointments;