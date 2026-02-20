// src/screens/customer/CustomerAppointmentsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { theme } from '../../theme/theme';

// --- MOCK DATA (Replace with API data from your store/query) ---
const seedAppointments = [
  {
    id: '1',
    serviceName: 'Classic Haircut',
    shopName: 'The Classic Cut',
    date: 'Feb 20, 2026',
    time: '10:00 AM',
    barberName: 'Alex',
    price: 25,
    status: 'CONFIRMED',
  },
  {
    id: '2',
    serviceName: 'Beard Trim & Shape',
    shopName: 'Urban Fades',
    date: 'Feb 15, 2026',
    time: '2:30 PM',
    barberName: 'Mike',
    price: 18,
    status: 'PENDING',
  },
  {
    id: '3',
    serviceName: 'Skin Fade',
    shopName: 'The Classic Cut',
    date: 'Feb 10, 2026',
    time: '11:00 AM',
    barberName: 'John',
    price: 30,
    status: 'COMPLETED',
  },
  {
    id: '4',
    serviceName: 'Hair Color',
    shopName: 'Urban Fades',
    date: 'Feb 05, 2026',
    time: '4:00 PM',
    barberName: 'Sarah',
    price: 60,
    status: 'CANCELLED',
  },
];

// --- STATUS STYLES HELPER ---
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return {
        bg: 'rgba(34, 197, 94, 0.1)',
        text: theme.colors.success,
        border: 'rgba(34, 197, 94, 0.2)',
      };
    case 'PENDING':
      return {
        bg: 'rgba(245, 158, 11, 0.1)',
        text: theme.colors.warning,
        border: 'rgba(245, 158, 11, 0.2)',
      };
    case 'COMPLETED':
      return {
        bg: theme.colors.surface,
        text: theme.colors.muted,
        border: theme.colors.border,
      };
    case 'CANCELLED':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: theme.colors.error,
        border: 'rgba(239, 68, 68, 0.2)',
      };
    case 'IN_PROGRESS':
      return {
        bg: 'rgba(212, 175, 55, 0.1)',
        text: theme.colors.primary,
        border: 'rgba(212, 175, 55, 0.2)',
      };
    default:
      return {
        bg: theme.colors.surface,
        text: theme.colors.muted,
        border: theme.colors.border,
      };
  }
};

const CustomerAppointments = () => {
  const upcoming = seedAppointments.filter(
    (a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED'
  );
  const past = seedAppointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>My Appointments</Text>
          <Text style={styles.subtitle}>Manage your upcoming and past bookings</Text>
        </View>

        {/* Upcoming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.listContainer}>
            {upcoming.map((apt) => {
              const statusStyle = getStatusStyle(apt.status);
              return (
                <View key={apt.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.cardTitle}>{apt.serviceName}</Text>
                      <View style={styles.shopRow}>
                        <MapPin size={12} color={theme.colors.muted} />
                        <Text style={styles.shopText}>{apt.shopName}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>{apt.status}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Calendar size={14} color={theme.colors.muted} />
                      <Text style={styles.infoText}>{apt.date}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Clock size={14} color={theme.colors.muted} />
                      <Text style={styles.infoText}>{apt.time}</Text>
                    </View>
                    <Text style={styles.infoText}>with {apt.barberName}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.priceText}>${apt.price}</Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.btnGhost}>
                        <Text style={styles.btnGhostText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnOutline}>
                        <Text style={styles.btnOutlineText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
            {upcoming.length === 0 && (
              <Text style={styles.emptyText}>No upcoming appointments.</Text>
            )}
          </View>
        </View>

        {/* Past Section */}
        {past.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past</Text>
            <View style={styles.listContainer}>
              {past.map((apt) => (
                <View key={apt.id} style={[styles.card, styles.cardPast]}>
                  <View style={styles.pastCardRow}>
                    <View>
                      <Text style={styles.cardTitle}>{apt.serviceName}</Text>
                      <Text style={styles.pastSubtext}>{apt.date} · {apt.shopName}</Text>
                    </View>
                    <Text style={styles.priceText}>${apt.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: theme.spacing.xxl, // space-y-8
  },
  headerSection: {
    // Corresponds to first div
  },
  title: {
    fontSize: 24, // text-2xl
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
    // gap handled by parent contentContainer gap
  },
  sectionTitle: {
    fontSize: 18, // text-lg
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    gap: theme.spacing.sm, // space-y-3
  },
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
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
    marginTop: 4, // mb-4 used above, this acts as footer
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  // Buttons
  btnGhost: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
  },
  btnGhostText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  btnOutline: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'transparent',
  },
  btnOutlineText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  // Past specific
  pastCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastSubtext: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
});

export default CustomerAppointments;