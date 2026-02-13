import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { DateSelector } from '../../components/booking/DateSelector';
import { TimeSlotSelector } from '../../components/booking/TimeSlotSelector';
import { ServiceSelector } from '../../components/booking/ServiceSelector';
import { BarberSelector } from '../../components/booking/BarberSelector';
import { generateTimeSlots, defaultSchedule } from '../../utils/bookingHelper';
import { mockShops, mockBarbers, mockServices, mockAppointments } from '../../data/mockData';
import {
  ChevronLeft,
  Calendar,
  Scissors,
  User,
  Clock,
  CheckCircle,
} from 'lucide-react-native';

type BookingStep = 'barber' | 'services' | 'datetime' | 'confirm';

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { shopId = mockShops[0].id } = route.params || {};

  const shop = mockShops.find((s) => s.id === shopId) || mockShops[0];

  const [step, setStep] = useState<BookingStep>('barber');
  const [selectedBarberId, setSelectedBarberId] = useState<string | undefined>();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shopBarbers = mockBarbers.filter((b) => b.shopId === shopId);
  const recommendedBarber = shopBarbers.find((b) => (b.rating ?? 0) >= 4.8);

  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedBarberId) return [];
    const barberAppointments = mockAppointments.filter(
      (apt) => apt.barberId === selectedBarberId && apt.status !== 'cancelled'
    );
    return generateTimeSlots(selectedDate, defaultSchedule, barberAppointments);
  }, [selectedDate, selectedBarberId]);

  const selectedBarber = shopBarbers.find((b) => b.id === selectedBarberId);
  const selectedServicesData = mockServices.filter((s) => selectedServices.includes(s.id));
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesData.reduce((sum, s) => sum + s.duration, 0);

  const handleToggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleNext = () => {
    if (step === 'barber' && !selectedBarberId) {
      Alert.alert('Error', 'Please select a barber');
      return;
    }
    if (step === 'services' && selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }
    if (step === 'datetime' && (!selectedDate || !selectedTime)) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    const steps: BookingStep[] = ['barber', 'services', 'datetime', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['barber', 'services', 'datetime', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 1500));

    Alert.alert(
      'Appointment Booked!',
      `Your appointment is confirmed for ${format(selectedDate!, 'PPP')} at ${selectedTime}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Appointments'),
        },
      ]
    );

    setIsSubmitting(false);
  };

  const canProceed = () => {
    if (step === 'barber') return !!selectedBarberId;
    if (step === 'services') return selectedServices.length > 0;
    if (step === 'datetime') return !!selectedDate && !!selectedTime;
    return true;
  };

  const renderStepIndicator = () => {
    const stepConfig = [
      { key: 'barber', icon: User, label: 'Barber' },
      { key: 'services', icon: Scissors, label: 'Services' },
      { key: 'datetime', icon: Calendar, label: 'Date & Time' },
      { key: 'confirm', icon: CheckCircle, label: 'Confirm' },
    ];

    const steps: BookingStep[] = ['barber', 'services', 'datetime', 'confirm'];
    const currentIdx = steps.indexOf(step);

    return (
      <View style={styles.progressContainer}>
        {stepConfig.map((s, idx) => {
          const isActive = s.key === step;
          const isCompleted = idx < currentIdx;
          const IconComponent = s.icon;

          return (
            <View key={s.key} style={styles.progressStepWrapper}>
              <View
                style={[
                  styles.progressStep,
                  isActive && styles.progressStepActive,
                  isCompleted && styles.progressStepCompleted,
                ]}
              >
                <IconComponent
                  size={16}
                  color={isActive || isCompleted ? '#3b82f6' : '#9ca3af'}
                />
              </View>
              {idx < 3 && (
                <View
                  style={[
                    styles.progressLine,
                    isCompleted && styles.progressLineCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'barber':
        return (
          <BarberSelector
            barbers={shopBarbers}
            selectedBarberId={selectedBarberId}
            onSelectBarber={setSelectedBarberId}
            recommendedBarberId={recommendedBarber?.id}
          />
        );

      case 'services':
        return (
          <ServiceSelector
            services={mockServices}
            selectedServices={selectedServices}
            onToggleService={handleToggleService}
          />
        );

      case 'datetime':
        return (
          <View style={styles.datetimeContainer}>
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              barberSchedule={defaultSchedule}
            />

            {selectedDate && (
              <View style={styles.timeslotContainer}>
                <TimeSlotSelector
                  slots={timeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  selectedDate={selectedDate}
                />
              </View>
            )}
          </View>
        );

      case 'confirm':
        return (
          <View style={styles.confirmContainer}>
            <View style={styles.confirmHeader}>
              <CheckCircle size={64} color="#3b82f6" />
              <Text style={styles.confirmTitle}>Confirm Your Booking</Text>
              <Text style={styles.confirmSubtitle}>
                Please review your appointment details
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Calendar size={20} color="#3b82f6" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailValue}>
                    {format(selectedDate!, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <User size={20} color="#3b82f6" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Barber</Text>
                  <Text style={styles.detailValue}>{selectedBarber?.name}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Scissors size={20} color="#3b82f6" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Services</Text>
                  <View>
                    {selectedServicesData.map((service) => (
                      <Text key={service.id} style={styles.serviceItem}>
                        {service.name} - ${service.price}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Clock size={20} color="#3b82f6" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{totalDuration} minutes</Text>
                </View>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${totalPrice}</Text>
              </View>
            </View>

            <View style={styles.reminderBox}>
              <Text style={styles.reminderText}>
                <Text style={styles.reminderBold}>Reminder:</Text> Please arrive 5
                minutes before your appointment. Cancellations must be made at least 2
                hours in advance.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Book Appointment</Text>
            <Text style={styles.headerSubtitle}>{shop.name}</Text>
          </View>
        </View>

        {renderStepIndicator()}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>{renderContent()}</View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {step !== 'confirm' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalSmallLabel}>Total</Text>
            <Text style={styles.totalSmallValue}>${totalPrice}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (!canProceed() || isSubmitting) && styles.actionButtonDisabled,
          ]}
          onPress={step === 'confirm' ? handleConfirm : handleNext}
          disabled={!canProceed() || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>
              {step === 'confirm' ? 'Confirm Booking' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  progressStepCompleted: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  datetimeContainer: {
    gap: 24,
  },
  timeslotContainer: {
    marginTop: 24,
  },
  confirmContainer: {
    gap: 24,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsCard: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  serviceItem: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  reminderBox: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  reminderText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  reminderBold: {
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  totalContainer: {
    flex: 1,
  },
  totalSmallLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalSmallValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});