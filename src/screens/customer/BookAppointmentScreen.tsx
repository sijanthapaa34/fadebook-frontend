// src/screens/customer/BookAppointmentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check, Clock, DollarSign, User, CalendarDays, AlertCircle, MapPin, CheckCircle, RefreshCw } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { theme } from '../../theme/theme';
import { 
  fetchServicesByShop, fetchBarbersByShop, fetchAvailableSlots, rescheduleAppointment 
} from '../../api/appointmentService';
import { ServiceDTO, BarberDTO, AppointmentDetailsResponse, RescheduleData } from '../../models/models';
import type { RootStackParamList } from '../../navigation/AppNavigator'; 

type Step = 'service' | 'barber' | 'time' | 'confirm' | 'rescheduled';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 

const BookAppointment = () => {
  const route = useRoute();
  // ✅ Apply Type to useNavigation
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  // ... rest of your code remains exactly the same
  
  const params = route.params as { shopId: string; shopName?: string; reschedule?: RescheduleData };
  const { shopId, shopName, reschedule: rescheduleData } = params;
  
  const isReschedule = !!rescheduleData;
  const effectiveShopId = isReschedule ? rescheduleData.shopId : shopId;

  const [step, setStep] = useState<Step>(isReschedule ? 'time' : 'service');
  const [selectedServices, setSelectedServices] = useState<ServiceDTO[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<BarberDTO | null>(null);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<AppointmentDetailsResponse | null>(null);

  useEffect(() => {
    if (isReschedule && rescheduleData) {
      const bId = Number(rescheduleData.barberId);

      const mappedServices: ServiceDTO[] = rescheduleData.services.map(s => ({
        id: s.serviceId,       
        name: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
        barberShop: rescheduleData.shopName,
        description: ''       
      }));

      if (mappedServices.some(s => !s.id || isNaN(s.id))) {
         Alert.alert("Error", "One or more services have invalid IDs.");
         return;
      }

      setSelectedServices(mappedServices);
      setSelectedBarber({
        id: bId,
        name: rescheduleData.barberName,
        bio: '',
        rating: 0
      } as BarberDTO);
    }
  }, [rescheduleData]);

  // --- Queries ---

  const { data: servicesData, isLoading: loadingServices, isError: errorServices, refetch: refetchServices } = useQuery({
    queryKey: ['services', effectiveShopId],
    queryFn: () => fetchServicesByShop({ shopId: effectiveShopId }),
    enabled: step === 'service' && !!effectiveShopId,
  });

  const { data: barbersData, isLoading: loadingBarbers, isError: errorBarbers } = useQuery({
    queryKey: ['barbers', effectiveShopId],
    queryFn: () => fetchBarbersByShop({ shopId: effectiveShopId }),
    enabled: step === 'barber' && !!effectiveShopId,
  });

  const services = servicesData?.content ?? [];
  const barbers = barbersData?.content ?? [];

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const selectedDate = selectedDay === 'today' ? today : tomorrow;
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: slotsData, isLoading: loadingSlots, isError: errorSlots } = useQuery({
    queryKey: ['availability', selectedBarber?.id, selectedServices.map(s => s.id), dateStr],
    queryFn: () => fetchAvailableSlots(selectedBarber!.id, selectedServices.map(s => s.id), dateStr),
    enabled: step === 'time' && !!selectedBarber && selectedServices.length > 0,
  });

  // --- Mutations ---

  // Removed bookAppointment mutation from here; moved to CheckoutScreen
  
  const { mutate: handleReschedule, isPending: isRescheduling } = useMutation({
    mutationFn: () => rescheduleAppointment(Number(rescheduleData?.appointmentId), selectedTime!),
    onSuccess: () => setStep('rescheduled'),
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to reschedule'),
  });

  // --- Handlers ---

  const goBack = () => {
    if (step === 'barber') setStep('service');
    else if (step === 'time') setStep(isReschedule ? 'service' : 'barber'); 
    else if (step === 'confirm') setStep('time');
    else navigation.goBack();
  };

  const handleConfirm = () => {
    if (!selectedTime) return;
    
    if (isReschedule) {
      // RESCHEDULE: Direct API call
      handleReschedule();
    } else {
      // NEW BOOKING: Navigate to Checkout
      if (selectedServices.length === 0 || !selectedBarber) return;
      

      navigation.navigate('Checkout', {
        // Display Data
        amount: totalPrice,
        serviceName: selectedServices.map(s => s.name).join(', '),
        barberName: selectedBarber.name,
        shopName: displayShopName || '',
        date: format(selectedDate, 'EEE, MMM d'),
        time: format(parseISO(selectedTime), 'h:mm a'),
        
        // API Data (needed for booking inside Checkout)
        barberId: selectedBarber.id,
        barbershopId: Number(effectiveShopId),
        serviceIds: selectedServices.map(s => s.id),
        scheduledTime: selectedTime,
      });
    }
  };

  const handleFinish = () => {
    // @ts-ignore
    navigation.navigate('CustomerAppointments');
  };

  const toggleService = (service: ServiceDTO) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const renderTimeSlots = () => {
    if (loadingSlots) return <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />;
    if (errorSlots) return <Text style={styles.emptyText}>Error loading slots.</Text>;
    
    const slots = slotsData?.availableSlots ?? [];

    if (slots.length === 0) return <Text style={styles.emptyText}>No slots available for this date</Text>;

    return slots.map((slot: any, index: number) => {
      const bookingTime = `${dateStr}T${slot.startTime}`;
      const label = slot.displayTime ? slot.displayTime.split(' - ')[0] : format(parseISO(bookingTime), 'h:mm a');
      return (
        <TouchableOpacity
          key={index}
          onPress={() => { setSelectedTime(bookingTime); setStep('confirm'); }}
          style={[styles.timeSlot, selectedTime === bookingTime && styles.timeSlotActive]}
        >
          <Text style={[styles.timeText, selectedTime === bookingTime && styles.timeTextActive]}>{label}</Text>
        </TouchableOpacity>
      );
    });
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const displayShopName = isReschedule ? rescheduleData?.shopName : shopName;

  const bookingSteps: { key: Step; label: string }[] = isReschedule
    ? [{ key: 'time', label: 'Time' }, { key: 'confirm', label: 'Confirm' }]
    : [
        { key: 'service', label: 'Service' },
        { key: 'barber', label: 'Barber' },
        { key: 'time', label: 'Time' },
        { key: 'confirm', label: 'Confirm' },
      ];

  if (!effectiveShopId) {
    return (
      <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
        <AlertCircle size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Invalid Shop</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ArrowLeft size={18} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.shopName}>{displayShopName || 'Book Appointment'}</Text>
            {isReschedule && (
              <View style={styles.rescheduleBadge}>
                <RefreshCw size={10} color={theme.colors.primary} />
                <Text style={styles.rescheduleBadgeText}>Reschedule</Text>
              </View>
            )}
          </View>
          <Text style={styles.shopAddress}>Step {bookingSteps.findIndex(s => s.key === step) + 1} of {bookingSteps.length}</Text>
        </View>
      </View>

      {/* Progress Stepper */}
      <View style={styles.stepperContainer}>
        {bookingSteps.map((s, i) => {
          const isActive = bookingSteps.findIndex((x) => x.key === step) >= i;
          return (
            <View key={s.key} style={styles.stepWrapper}>
              <View style={[styles.stepCircle, isActive && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>{i + 1}</Text>
              </View>
              <Text style={styles.stepLabel}>{s.label}</Text>
              {i < bookingSteps.length - 1 && <View style={styles.stepLine} />}
            </View>
          );
        })}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        {/* Reschedule Context Bar */}
        {isReschedule && step !== 'rescheduled' && selectedBarber && selectedServices.length > 0 && (
          <View style={styles.contextBar}>
            <User size={14} color={theme.colors.primary} />
            <Text style={styles.contextText}>
              Keeping <Text style={{ fontWeight: '700' }}>{selectedBarber?.name}</Text> for <Text style={{ fontWeight: '700' }}>{selectedServices[0]?.name}</Text> — just pick a new time.
            </Text>
          </View>
        )}

        {/* Step: Service (Booking Only) */}
        {step === 'service' && !isReschedule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Services</Text>
            {loadingServices && <ActivityIndicator color={theme.colors.primary} size="large" />}
            {errorServices && <TouchableOpacity onPress={() => refetchServices()}><Text style={styles.errorText}>Tap to retry</Text></TouchableOpacity>}
            
            {!loadingServices && services.map((s, index) => {
              const isSelected = selectedServices.some(sel => sel.id === s.id);
              return (
                <TouchableOpacity key={s.id || index} onPress={() => toggleService(s)} style={[styles.card, isSelected && styles.cardSelected]}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{s.name}</Text>
                      <Text style={styles.cardDesc}>{s.description}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.priceText}>${s.price}</Text>
                      <Text style={styles.durationText}>{s.durationMinutes} min</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Check size={14} color="#000" />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity 
              style={[styles.nextButton, selectedServices.length === 0 && styles.nextButtonDisabled]} 
              onPress={() => setStep('barber')}
            >
              <Text style={styles.nextButtonText}>Next ({selectedServices.length} selected)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Barber (Booking Only) */}
        {step === 'barber' && !isReschedule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Barber</Text>
            {loadingBarbers && <ActivityIndicator color={theme.colors.primary} />}
            {barbers.map((b) => (
              <TouchableOpacity key={b.id} onPress={() => { setSelectedBarber(b); setStep('time'); }} style={[styles.card, selectedBarber?.id === b.id && styles.cardSelected]}>
                <View style={styles.barberRow}>
                  <View style={styles.avatarPlaceholder}><User size={20} color={theme.colors.primary} /></View>
                  <View style={styles.barberInfo}>
                    <Text style={styles.cardTitle}>{b.name}</Text>
                    <Text style={styles.cardDesc}>{b.bio || 'Professional Barber'}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {b.rating?.toFixed(1)}</Text>
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
              {[{ key: 'today', date: today }, { key: 'tomorrow', date: tomorrow }].map(({ key, date }) => (
                <TouchableOpacity key={key} onPress={() => setSelectedDay(key as any)} style={[styles.dayBtn, selectedDay === key && styles.dayBtnActive]}>
                  <CalendarDays size={18} color={selectedDay === key ? theme.colors.primary : theme.colors.text} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.dayLabel, selectedDay === key && styles.dayLabelActive]}>{key}</Text>
                    <Text style={styles.dateSubText}>{format(date, 'EEE, MMM d')}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.slotsHeader}>Available slots for {format(selectedDate, 'EEEE, MMMM d')}</Text>
            <View style={styles.timeGrid}>{renderTimeSlots()}</View>

            <TouchableOpacity onPress={() => isReschedule ? navigation.goBack() : setStep('barber')} style={styles.backTextBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isReschedule ? 'Confirm Reschedule' : 'Confirm Booking'}</Text>
            
            <View style={[styles.card, { padding: 24 }]}>
              <View style={styles.confirmRow}>
                <CalendarDays size={16} color={theme.colors.primary} />
                <Text style={styles.confirmText}>{format(selectedDate, 'EEE, MMM d')} at {selectedTime ? format(parseISO(selectedTime), 'h:mm a') : ''}</Text>
              </View>
              <View style={styles.confirmRow}>
                <User size={16} color={theme.colors.primary} />
                <Text style={styles.confirmText}>{selectedBarber?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Check size={16} color={theme.colors.primary} />
                <Text style={styles.confirmText}>{selectedServices.map(s => s.name).join(', ')} ({totalDuration} min)</Text>
              </View>
              <View style={styles.confirmRow}>
                <DollarSign size={16} color={theme.colors.primary} />
                <Text style={[styles.confirmText, { fontWeight: '700' }]}>${totalPrice.toFixed(2)}</Text>
                {isReschedule && (
                   <Text style={styles.paidBadge}>Already paid — no charge</Text>
                )}
              </View>
            </View>

            {isReschedule && (
              <View style={styles.rescheduleInfoBox}>
                <RefreshCw size={12} color={theme.colors.primary} />
                <Text style={styles.rescheduleInfoText}>Your appointment will be moved. The barber and service remain the same.</Text>
              </View>
            )}

            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.confirmBtn, styles.backBtnOutline]} onPress={() => setStep('time')}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, styles.payBtn]} onPress={handleConfirm} disabled={isRescheduling}>
                {isRescheduling ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>{isReschedule ? 'Confirm Reschedule' : 'Confirm & Pay'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step: Rescheduled Success */}
        {step === 'rescheduled' && (
           <View style={styles.successContainer}>
             <CheckCircle size={64} color={theme.colors.success} />
             <Text style={styles.successTitle}>Appointment Rescheduled!</Text>
             <Text style={styles.successSubtext}>Your booking has been updated.</Text>

             <View style={[styles.card, { marginTop: 20, width: '100%' }]}>
               <View style={styles.confirmRow}><Text style={styles.confirmTextLabel}>Service</Text><Text style={styles.confirmTextValue}>{selectedServices[0]?.name}</Text></View>
               <View style={styles.confirmRow}><Text style={styles.confirmTextLabel}>Barber</Text><Text style={styles.confirmTextValue}>{selectedBarber?.name}</Text></View>
               <View style={styles.confirmRow}><Text style={styles.confirmTextLabel}>Shop</Text><Text style={styles.confirmTextValue}>{displayShopName}</Text></View>
               <View style={styles.confirmRow}><Text style={styles.confirmTextLabel}>New Date</Text><Text style={styles.confirmTextValue}>{format(selectedDate, 'EEE, MMM d')}</Text></View>
               <View style={styles.confirmRow}><Text style={styles.confirmTextLabel}>New Time</Text><Text style={styles.confirmTextValue}>{selectedTime ? format(parseISO(selectedTime), 'h:mm a') : ''}</Text></View>
             </View>

             <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
               <Text style={styles.doneButtonText}>View My Appointments</Text>
             </TouchableOpacity>
           </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  scrollView: { flex: 1 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  contentContainer: { padding: theme.spacing.lg, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  backBtn: { padding: theme.spacing.sm, marginRight: theme.spacing.sm },
  headerTextContainer: { flex: 1 },
  shopName: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  shopAddress: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  rescheduleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, gap: 4 },
  rescheduleBadgeText: { color: theme.colors.primary, fontSize: 10, fontWeight: '700' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl, paddingHorizontal: theme.spacing.sm },
  stepWrapper: { flex: 1, alignItems: 'center', flexDirection: 'row' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepNumber: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  stepNumberActive: { color: '#000' },
  stepLabel: { marginLeft: 8, fontSize: 11, color: theme.colors.muted },
  stepLine: { flex: 1, height: 1, backgroundColor: theme.colors.border, marginHorizontal: 4 },
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md },
  contextBar: { backgroundColor: 'rgba(39, 39, 42, 0.3)', padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  contextText: { color: theme.colors.muted, fontSize: 13, flex: 1 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: 'transparent', padding: theme.spacing.lg, marginBottom: theme.spacing.sm },
  cardSelected: { borderColor: theme.colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', marginLeft: 16 },
  priceText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  durationText: { fontSize: 12, color: theme.colors.muted },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  nextButton: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 20 },
  nextButtonDisabled: { backgroundColor: theme.colors.muted },
  nextButtonText: { color: '#000', fontWeight: '700', fontSize: 14 },
  barberRow: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  barberInfo: { flex: 1 },
  ratingBadge: { backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  ratingText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  dayRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  dayBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  dayBtnActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  dayLabel: { color: theme.colors.text, fontWeight: '500', fontSize: 14 },
  dayLabelActive: { color: theme.colors.primary },
  dateSubText: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  slotsHeader: { fontSize: 14, color: theme.colors.muted, marginBottom: theme.spacing.md },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  timeSlot: { width: (Dimensions.get('window').width - theme.spacing.lg * 2 - theme.spacing.sm * 2) / 3, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', backgroundColor: theme.colors.surface },
  timeSlotActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  timeText: { color: theme.colors.text, fontSize: 13 },
  timeTextActive: { color: theme.colors.primary, fontWeight: '600' },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md, justifyContent: 'space-between' },
  confirmText: { color: theme.colors.text, fontSize: 14, flex: 1 },
  confirmTextLabel: { color: theme.colors.muted, fontSize: 14 },
  confirmTextValue: { color: theme.colors.text, fontSize: 14, fontWeight: '500' },
  paidBadge: { fontSize: 10, color: theme.colors.success, backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  rescheduleInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, marginBottom: 16 },
  rescheduleInfoText: { fontSize: 12, color: theme.colors.muted, flex: 1 },
  confirmActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg },
  confirmBtn: { flex: 1, padding: theme.spacing.lg, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', height: 50 },
  backBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
  backText: { color: theme.colors.muted, fontWeight: '600' },
  backTextBtn: { marginTop: theme.spacing.md },
  payBtn: { backgroundColor: theme.colors.primary },
  payBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  successContainer: { alignItems: 'center', paddingHorizontal: theme.spacing.md },
  successTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.text, marginTop: 16, marginBottom: 4 },
  successSubtext: { fontSize: 14, color: theme.colors.muted, marginBottom: 20, textAlign: 'center' },
  doneButton: { marginTop: 30, backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: theme.radius.md, width: '100%', alignItems: 'center' },
  doneButtonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  emptyText: { color: theme.colors.muted, textAlign: 'center', marginTop: 20, fontSize: 15 },
  errorTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 10 },
  errorText: { color: theme.colors.error, textAlign: 'center', marginTop: 5 },
});

export default BookAppointment;