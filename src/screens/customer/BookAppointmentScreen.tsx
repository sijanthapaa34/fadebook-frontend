// src/screens/customer/BookAppointmentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
// 1. Import useSafeAreaInsets
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Clock, DollarSign, User, CalendarDays } from 'lucide-react-native';
import { format, addDays } from 'date-fns';
import { theme } from '../../theme/theme';

// --- MOCK DATA ---
type Step = 'service' | 'barber' | 'time' | 'confirm';

interface Shop { id: string; name: string; address: string; }
interface Service { id: string; shopId: string; name: string; description: string; price: number; duration: number; }
interface Barber { id: string; shopId: string; name: string; specialties: string[]; rating: number; }

const seedShops: Shop[] = [
  { id: 's1', name: 'The Classic Cut', address: '123 Main St' },
  { id: 'default', name: 'Selected Barbershop', address: '123 Style Ave' },
];

const seedServices: Service[] = [
  { id: 'sv1', shopId: 's1', name: 'Haircut', description: 'Classic scissor cut', price: 25, duration: 30 },
  { id: 'sv2', shopId: 's1', name: 'Beard Trim', description: 'Shape and trim', price: 15, duration: 20 },
  { id: 'sv3', shopId: 's1', name: 'Hot Towel Shave', description: 'Luxury shave', price: 30, duration: 45 },
];

const seedBarbers: Barber[] = [
  { id: 'b1', shopId: 's1', name: 'John Doe', specialties: ['Fades', 'Beards'], rating: 4.8 },
  { id: 'b2', shopId: 's1', name: 'Mike Ross', specialties: ['Coloring', 'Styling'], rating: 4.9 },
];

const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'];

// --- COMPONENT ---

const BookAppointment = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // 2. Get insets to handle status bar height
  const insets = useSafeAreaInsets();
  
  const { shopId } = route.params as { shopId: string };

  let shop = seedShops.find((s) => s.id === shopId);
  if (!shop) {
      shop = seedShops[0]; 
  }

  const services = seedServices.filter((s) => s.shopId === shop.id || shopId === 's1');
  const barbers = seedBarbers.filter((b) => b.shopId === shop.id || shopId === 's1');

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const selectedDate = selectedDay === 'today' ? today : tomorrow;

  const service = services.find((s) => s.id === selectedService);
  const barber = barbers.find((b) => b.id === selectedBarber);

  const goBack = () => navigation.goBack();
  
  const handleConfirm = () => {
    // @ts-ignore
    navigation.navigate('CustomerAppointments'); 
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'service', label: 'Service' },
    { key: 'barber', label: 'Barber' },
    { key: 'time', label: 'Time' },
    { key: 'confirm', label: 'Confirm' },
  ];

  if (!shop) {
    return (
      <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Shop not found.</Text>
        <TouchableOpacity onPress={goBack} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // 3. Apply top padding dynamically
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <ArrowLeft size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <Text style={styles.shopAddress}>{shop.address}</Text>
          </View>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          {steps.map((s, i) => {
            const isActive = steps.findIndex((x) => x.key === step) >= i;
            return (
              <View key={s.key} style={styles.stepWrapper}>
                <View style={[styles.stepCircle, isActive && styles.stepCircleActive]}>
                  <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>{i + 1}</Text>
                </View>
                <Text style={styles.stepLabel}>{s.label}</Text>
                {i < steps.length - 1 && <View style={styles.stepLine} />}
              </View>
            );
          })}
        </View>

        {/* Step: Service */}
        {step === 'service' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a Service</Text>
            {services.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => { setSelectedService(s.id); setStep('barber'); }}
                style={[styles.card, selectedService === s.id && styles.cardSelected]}
              >
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{s.name}</Text>
                    <Text style={styles.cardDesc}>{s.description}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.priceText}>${s.price}</Text>
                    <Text style={styles.durationText}>{s.duration} min</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step: Barber */}
        {step === 'barber' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Barber</Text>
            {barbers.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => { setSelectedBarber(b.id); setStep('time'); }}
                style={[styles.card, selectedBarber === b.id && styles.cardSelected]}
              >
                <View style={styles.barberRow}>
                  <View style={styles.avatarPlaceholder}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.barberInfo}>
                    <Text style={styles.cardTitle}>{b.name}</Text>
                    <Text style={styles.cardDesc}>{b.specialties.join(' · ')}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {b.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setStep('service')} style={styles.backTextBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Time */}
        {step === 'time' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pick a Day & Time</Text>

            <View style={styles.dayRow}>
              {[
                { key: 'today' as const, date: today },
                { key: 'tomorrow' as const, date: tomorrow },
              ].map(({ key, date }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => { setSelectedDay(key); setSelectedTime(null); }}
                  style={[styles.dayBtn, selectedDay === key && styles.dayBtnActive]}
                >
                  <CalendarDays size={18} color={selectedDay === key ? theme.colors.primary : theme.colors.text} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.dayLabel, selectedDay === key && styles.dayLabelActive]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={styles.dateSubText}>{format(date, 'EEE, MMM d')}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.slotsHeader}>
              Available slots for {format(selectedDate, 'EEEE, MMMM d')}
            </Text>

            <View style={styles.timeGrid}>
              {timeSlots.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => { setSelectedTime(t); setStep('confirm'); }}
                  style={[styles.timeSlot, selectedTime === t && styles.timeSlotActive]}
                >
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setStep('barber')} style={styles.backTextBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && service && barber && selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirm Booking</Text>
            
            <View style={[styles.card, { padding: 24 }]}>
              <View style={styles.confirmRow}>
                <CalendarDays size={16} color={theme.colors.primary} />
                <Text style={styles.confirmText}>{format(selectedDate, 'EEE, MMM d')} at {selectedTime}</Text>
              </View>
              <View style={styles.confirmRow}>
                <User size={16} color={theme.colors.primary} />
                <Text style={styles.confirmText}>{barber.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Check size={16} color={theme.colors.primary} />
                <Text style={styles.confirmText}>{service.name} ({service.duration} min)</Text>
              </View>
              <View style={styles.confirmRow}>
                <DollarSign size={16} color={theme.colors.primary} />
                <Text style={[styles.confirmText, { fontWeight: '700' }]}>${service.price}</Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity 
                style={[styles.confirmBtn, styles.backBtnOutline]} 
                onPress={() => setStep('time')}
              >
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmBtn, styles.payBtn]} 
                onPress={handleConfirm}
              >
                <Text style={styles.payBtnText}>Confirm & Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // 4. Updated container structure
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  errorText: {
    color: theme.colors.muted,
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backBtn: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  shopName: {
    fontSize: 20,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
  },
  shopAddress: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepNumber: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: '#000',
  },
  stepLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: theme.colors.muted,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  durationText: {
    fontSize: 12,
    color: theme.colors.muted,
  },

  // Barber Card
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  barberInfo: {
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Time Selection
  dayRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  dayLabel: {
    color: theme.colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  dayLabelActive: {
    color: theme.colors.primary,
  },
  dateSubText: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  slotsHeader: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeSlot: {
    width: (Dimensions.get('window').width - theme.spacing.lg * 2 - theme.spacing.sm * 2) / 3,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  timeSlotActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  timeText: {
    color: theme.colors.text,
    fontSize: 13,
  },
  timeTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Confirm
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  confirmText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  confirmBtn: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backText: {
    color: theme.colors.muted,
    fontWeight: '600',
  },
  backTextBtn: {
    marginTop: theme.spacing.md,
  },
  payBtn: {
    backgroundColor: theme.colors.primary,
  },
  payBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default BookAppointment;