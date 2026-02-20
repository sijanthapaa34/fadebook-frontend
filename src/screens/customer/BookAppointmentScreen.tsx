// src/screens/customer/BookAppointmentScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check, Clock, DollarSign, User, CalendarDays, AlertCircle, MapPin, CheckCircle } from 'lucide-react-native';
import { format, parseISO, isValid } from 'date-fns';
import { theme } from '../../theme/theme';
import { 
  fetchServicesByShop, 
  fetchBarbersByShop, 
  fetchAvailableSlots, 
  bookAppointment 
} from '../../api/appointmentService';
import { ServiceDTO, BarberDTO, TimeSlotDTO, AppointmentDetailsResponse } from '../../models/models';

type Step = 'service' | 'barber' | 'time' | 'confirm';

const BookAppointment = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const { shopId, shopName } = route.params as { shopId: string; shopName?: string };
  
  const [step, setStep] = useState<Step>('service');
  const [selectedServices, setSelectedServices] = useState<ServiceDTO[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<BarberDTO | null>(null);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // NEW: State to hold booking response for the success screen
  const [bookingResponse, setBookingResponse] = useState<AppointmentDetailsResponse | null>(null);

  // --- Queries ---
  
  const { 
    data: servicesData, 
    isLoading: loadingServices,
    isError: errorServices,
    refetch: refetchServices
  } = useQuery({
    queryKey: ['services', shopId],
    queryFn: () => fetchServicesByShop({ shopId }),
    enabled: !!shopId,
    retry: 1,
  });

  const { 
    data: barbersData, 
    isLoading: loadingBarbers,
    isError: errorBarbers 
  } = useQuery({
    queryKey: ['barbers', shopId],
    queryFn: () => fetchBarbersByShop({ shopId }),
    enabled: step === 'barber' && !!shopId,
  });

  const services = servicesData?.content ?? [];
  const barbers = barbersData?.content ?? [];

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  const selectedDate = selectedDay === 'today' ? today : tomorrow;
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { 
    data: slotsData, 
    isLoading: loadingSlots,
  } = useQuery({
    queryKey: ['availability', selectedBarber?.id, selectedServices.map(s => s.id), dateStr],
    queryFn: () => fetchAvailableSlots(selectedBarber!.id, selectedServices.map(s => s.id), dateStr),
    enabled: step === 'time' && !!selectedBarber && selectedServices.length > 0,
  });

  // 4. Mutation for Booking
  const { mutate: handleBooking, isPending: isBooking } = useMutation({
    mutationFn: bookAppointment,
    onSuccess: (data) => {
      // NEW: Save response to state instead of navigating immediately
      setBookingResponse(data);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment');
    }
  });

  // --- Handlers ---

  const goBack = () => {
    if (step === 'barber') setStep('service');
    else if (step === 'time') setStep('barber');
    else if (step === 'confirm') setStep('time');
    else navigation.goBack();
  };

  const toggleService = (service: ServiceDTO) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleProceedToBarber = () => {
    if (selectedServices.length === 0) {
      Alert.alert("Select Service", "Please select at least one service to continue.");
      return;
    }
    setStep('barber');
  };

  const handleBarberSelect = (barber: BarberDTO) => {
    setSelectedBarber(barber);
    setStep('time');
  };

  const handleTimeSelect = (timeIso: string) => {
    setSelectedTime(timeIso);
    setStep('confirm');
    setBookingResponse(null); // Reset response when re-selecting time
  };

  const handleConfirm = () => {
    if (selectedServices.length === 0 || !selectedBarber || !selectedTime) return;
    
    handleBooking({
      barberId: selectedBarber.id,
      barbershopId: Number(shopId), // Required by backend
      serviceIds: selectedServices.map(s => s.id),
      scheduledTime: selectedTime,
    });
  };

  const handleFinish = () => {
    // Navigate to the appointments list or dashboard
    // @ts-ignore
    navigation.navigate('CustomerAppointments');
  };

  const renderTimeSlots = () => {
    if (loadingSlots) return <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />;
    
    const slots = slotsData?.availableSlots ?? [];
    
    if (slots.length === 0) {
      return <Text style={styles.emptyText}>No slots available for this date</Text>;
    }

    return slots.map((slot: any, index: number) => {
      const bookingTime = `${dateStr}T${slot.startTime}`;
      const label = slot.displayTime ? slot.displayTime.split(' - ')[0] : format(parseISO(bookingTime), 'h:mm a');
      
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleTimeSelect(bookingTime)}
          style={[styles.timeSlot, selectedTime === bookingTime && styles.timeSlotActive]}
        >
          <Text style={[styles.timeText, selectedTime === bookingTime && styles.timeTextActive]}>{label}</Text>
        </TouchableOpacity>
      );
    });
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const steps: { key: Step; label: string }[] = [
    { key: 'service', label: 'Service' },
    { key: 'barber', label: 'Barber' },
    { key: 'time', label: 'Time' },
    { key: 'confirm', label: 'Confirm' },
  ];

  if (!shopId) {
    return (
      <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
        <AlertCircle size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Invalid Shop</Text>
        <Text style={styles.errorText}>No Shop ID provided.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
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
          <Text style={styles.shopName}>{shopName || 'Book Appointment'}</Text>
          <Text style={styles.shopAddress}>Step {steps.findIndex(s => s.key === step) + 1} of 4</Text>
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        {/* Step: Service */}
        {step === 'service' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Services</Text>
            
            {loadingServices && <ActivityIndicator color={theme.colors.primary} size="large" />}
            
            {errorServices && (
              <View style={styles.errorContainer}>
                <AlertCircle size={24} color={theme.colors.error} />
                <Text style={styles.errorText}>Failed to load services.</Text>
                <TouchableOpacity onPress={() => refetchServices()} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loadingServices && !errorServices && services.length === 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.emptyText}>No Services Found</Text>
              </View>
            )}

            {!loadingServices && !errorServices && services.map((s, index) => {
               const isSelected = selectedServices.some(sel => sel.id === s.id);
               return (
                <TouchableOpacity
                  key={s.id ? s.id.toString() : `service-${index}`}
                  onPress={() => toggleService(s)}
                  style={[styles.card, isSelected && styles.cardSelected]}
                >
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

            {!loadingServices && services.length > 0 && (
              <TouchableOpacity 
                style={[styles.nextButton, selectedServices.length === 0 && styles.nextButtonDisabled]} 
                onPress={handleProceedToBarber}
              >
                <Text style={styles.nextButtonText}>
                  {selectedServices.length > 0 ? `Next (${selectedServices.length} selected)` : 'Select Services to Continue'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Step: Barber */}
        {step === 'barber' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Barber</Text>
            {loadingBarbers && <ActivityIndicator color={theme.colors.primary} />}
            
            {errorBarbers && (
              <Text style={styles.errorText}>Failed to load barbers.</Text>
            )}

            {!loadingBarbers && !errorBarbers && barbers.length === 0 && (
               <Text style={styles.emptyText}>No Barbers available for this shop.</Text>
            )}

            {barbers.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => handleBarberSelect(b)}
                style={[styles.card, selectedBarber?.id === b.id && styles.cardSelected]}
              >
                <View style={styles.barberRow}>
                  <View style={styles.avatarPlaceholder}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.barberInfo}>
                    <Text style={styles.cardTitle}>{b.name}</Text>
                    <Text style={styles.cardDesc}>{b.bio || 'Professional Barber'}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {b.rating?.toFixed(1) || 'N/A'}</Text>
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
                  onPress={() => setSelectedDay(key)}
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
              {renderTimeSlots()}
            </View>

            <TouchableOpacity onPress={() => setStep('barber')} style={styles.backTextBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedServices.length > 0 && selectedBarber && selectedTime && (
          <View style={styles.section}>
            
            {/* SUCCESS VIEW */}
            {bookingResponse ? (
              <View style={styles.successContainer}>
                <CheckCircle size={64} color={theme.colors.success} />
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <Text style={styles.successSubtext}>Your appointment has been successfully booked.</Text>

                <View style={[styles.card, { marginTop: 20, width: '100%' }]}>
                  <View style={styles.confirmRow}>
                    <MapPin size={16} color={theme.colors.primary} />
                    <Text style={styles.confirmText}>{bookingResponse.barbershopName}</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <User size={16} color={theme.colors.primary} />
                    <Text style={styles.confirmText}>Barber: {bookingResponse.barberName}</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <CalendarDays size={16} color={theme.colors.primary} />
                    <Text style={styles.confirmText}>
                      {format(parseISO(bookingResponse.scheduledTime), 'EEE, MMM d')} at {format(parseISO(bookingResponse.scheduledTime), 'h:mm a')}
                    </Text>
                  </View>
                  
                  <View style={styles.divider} />

                  <Text style={styles.servicesLabel}>Services:</Text>
                  {bookingResponse.services.map((srv, idx) => (
                    <View key={idx} style={styles.serviceSummaryRow}>
                      <Text style={styles.serviceSummaryName}>{srv.name}</Text>
                      <Text style={styles.serviceSummaryPrice}>${srv.price.toFixed(2)}</Text>
                    </View>
                  ))}

                  <View style={styles.divider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Paid</Text>
                    <Text style={styles.totalAmount}>${bookingResponse.totalPrice.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{bookingResponse.status}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
                  <Text style={styles.doneButtonText}>View My Appointments</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* CONFIRMATION FORM (Before Booking) */
              <>
                <Text style={styles.sectionTitle}>Confirm Booking</Text>
                
                <View style={[styles.card, { padding: 24 }]}>
                  <View style={styles.confirmRow}>
                    <CalendarDays size={16} color={theme.colors.primary} />
                    <Text style={styles.confirmText}>
                      {format(parseISO(selectedTime), 'EEE, MMM d')} at {format(parseISO(selectedTime), 'h:mm a')}
                    </Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <User size={16} color={theme.colors.primary} />
                    <Text style={styles.confirmText}>{selectedBarber.name}</Text>
                  </View>
                  
                  <View style={styles.confirmServiceList}>
                    <Text style={styles.confirmServiceTitle}>Services:</Text>
                    {selectedServices.map((s, idx) => (
                      <View key={idx} style={styles.confirmServiceItem}>
                        <Check size={14} color={theme.colors.muted} />
                        <Text style={styles.confirmText}>{s.name} ({s.durationMinutes} min)</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.confirmRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10 }]}>
                    <Clock size={16} color={theme.colors.primary} />
                    <Text style={[styles.confirmText, { fontWeight: '700' }]}>Total Duration: {totalDuration} min</Text>
                  </View>
                  <View style={styles.confirmRow}>
                    <DollarSign size={16} color={theme.colors.primary} />
                    <Text style={[styles.confirmText, { fontWeight: '700', color: theme.colors.primary }]}>Total Price: ${totalPrice.toFixed(2)}</Text>
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
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.payBtnText}>Confirm & Pay</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 5,
  },
  retryBtn: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  retryText: {
    color: '#000',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
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
    fontSize: 11,
    color: theme.colors.muted,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1, 
    borderColor: 'transparent',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.05)', 
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  nextButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
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
    borderColor: 'transparent',
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
  confirmServiceList: {
    marginVertical: 10,
    paddingLeft: 4,
  },
  confirmServiceTitle: {
    color: theme.colors.muted,
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 13,
  },
  confirmServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
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
    height: 50,
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
  // Success Styles
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
    width: '100%',
  },
  servicesLabel: {
    color: theme.colors.muted,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 13,
  },
  serviceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  serviceSummaryName: {
    color: theme.colors.text,
    fontSize: 14,
  },
  serviceSummaryPrice: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  doneButton: {
    marginTop: 30,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: theme.radius.md,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default BookAppointment;