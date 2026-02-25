// src/screens/barber/BarberDashboardScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Clock,
  DollarSign,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { fetchBarberAppointments, fetchBarberEarnings } from '../../api/appointmentService';

const BarberDashboard = () => {
  const user = useAuthStore((state) => state.user);
  
  // --- Date Helpers ---
  const todayObj = new Date();
  const today = todayObj.toISOString().split('T')[0];

  const tomorrowObj = new Date();
  tomorrowObj.setDate(todayObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];

  // Week Calculation (Mon-Sun)
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    // Calculate diff to Monday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };
  const weekDates = getWeekDates();

  // --- Queries ---

  // 1. Today's Appointments
  const { 
    data: todayData, 
    isLoading: isTodayLoading, 
    isError: isTodayError 
  } = useQuery({
    queryKey: ['barberAppointments', user?.id, today],
    queryFn: () => fetchBarberAppointments(user!.id, today, today, 0, 50),
    enabled: !!user?.id,
  });

  // 2. Tomorrow's Appointments
  const { 
    data: tomorrowData, 
  } = useQuery({
    queryKey: ['barberAppointments', user?.id, tomorrow],
    queryFn: () => fetchBarberAppointments(user!.id, tomorrow, tomorrow, 0, 50),
    enabled: !!user?.id,
  });

  // 3. Weekly Earnings
  const { data: weeklyEarnings = 0 } = useQuery({
    queryKey: ['barberEarnings', user?.id, weekDates.start],
    queryFn: () => fetchBarberEarnings(user!.id, weekDates.start, weekDates.end),
    enabled: !!user?.id,
  });

  const todayAppointments = todayData?.content || [];
  const tomorrowAppointments = tomorrowData?.content || [];

  // --- Calculations ---

  const clientCount = todayData?.totalElements || 0;
  const todayEarnings = todayAppointments.reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);

  // Next Appointment Logic
  const now = new Date();
  const upcomingAppointments = todayAppointments
    .filter((apt) => new Date(apt.scheduledTime) > now)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  
  const nextAppointment = upcomingAppointments[0];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const nextAppointmentTime = nextAppointment ? formatTime(nextAppointment.scheduledTime) : 'None';

  // --- Stats Data ---
  const stats = [
    { label: "Today's Clients", value: clientCount.toString(), icon: User, color: theme.colors.primary },
    { label: "Today's Earnings", value: `$${todayEarnings.toFixed(2)}`, icon: DollarSign, color: theme.colors.success },
    { label: 'This Week', value: `$${weeklyEarnings.toFixed(2)}`, icon: TrendingUp, color: theme.colors.primary },
    { label: 'Next Appointment', value: nextAppointmentTime, icon: Clock, color: theme.colors.warning },
  ];

  const getTimeString = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (isTodayLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isTodayError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: theme.colors.error }}>Failed to load dashboard data.</Text>
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
        <Text style={styles.greeting}>Good Morning, {user?.name || 'Barber'}</Text>
        <Text style={styles.subGreeting}>Here's your day at a glance</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCardWrapper}>
             <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Today's Schedule Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.listContainer}>
          {todayAppointments.length === 0 ? (
             <Text style={styles.emptyText}>No appointments today.</Text>
          ) : (
            todayAppointments.map((apt) => (
              <View key={apt.appointmentId} style={styles.appointmentCard}>
                <View style={styles.aptLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {apt.customerName?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptName}>{apt.customerName}</Text>
                    <Text style={styles.aptDetails}>
                      {apt.services?.map(s => s.name).join(', ')} · {apt.totalDurationMinutes} min
                    </Text>
                  </View>
                </View>
                <View style={styles.aptRight}>
                  <Text style={styles.aptTime}>{getTimeString(apt.scheduledTime)}</Text>
                  <Text style={styles.aptPrice}>${apt.totalPrice}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Tomorrow's Schedule Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tomorrow's Schedule</Text>
        <View style={styles.listContainer}>
          {tomorrowAppointments.length === 0 ? (
             <Text style={styles.emptyText}>No appointments tomorrow.</Text>
          ) : (
            tomorrowAppointments.map((apt) => (
              <View key={apt.appointmentId} style={styles.appointmentCard}>
                <View style={styles.aptLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {apt.customerName?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptName}>{apt.customerName}</Text>
                    <Text style={styles.aptDetails}>
                      {apt.services?.map(s => s.name).join(', ')} · {apt.totalDurationMinutes} min
                    </Text>
                  </View>
                </View>
                <View style={styles.aptRight}>
                  <Text style={styles.aptTime}>{getTimeString(apt.scheduledTime)}</Text>
                  <Text style={styles.aptPrice}>${apt.totalPrice}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Commission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commission Breakdown (Today)</Text>
        <View style={styles.commissionCard}>
          {[
            { label: 'Your Share (60%)', amount: `$${(todayEarnings * 0.6).toFixed(2)}`, percent: 60 },
            { label: 'Shop Admin (30%)', amount: `$${(todayEarnings * 0.3).toFixed(2)}`, percent: 30 },
            { label: 'Platform Fee (10%)', amount: `$${(todayEarnings * 0.1).toFixed(2)}`, percent: 10 },
          ].map((item) => (
            <View key={item.label} style={styles.commissionItem}>
              <View style={styles.commissionRow}>
                <Text style={styles.commissionLabel}>{item.label}</Text>
                <Text style={styles.commissionAmount}>{item.amount}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${item.percent}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ... styles remain the same

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: 24,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: theme.spacing.xl,
  },
  statCardWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    flex: 1,
    marginRight: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
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
  appointmentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  aptInfo: {
    justifyContent: 'center',
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
  aptRight: {
    alignItems: 'flex-end',
  },
  aptTime: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
  },
  aptPrice: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.primary,
    marginTop: 2,
  },
  emptyText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.sans,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  commissionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  commissionItem: {
    // Gap handles spacing
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  commissionLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  commissionAmount: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '500',
    color: theme.colors.text,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
});

export default BarberDashboard;