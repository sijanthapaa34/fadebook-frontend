import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TimeSlot } from '../../utils/bookingHelper';
import { Clock, Lock, Coffee } from 'lucide-react-native';
import { format, isSameDay } from 'date-fns';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  selectedDate: Date;
}

export const TimeSlotSelector = ({ slots, selectedTime, onSelectTime, selectedDate }: TimeSlotSelectorProps) => {
  const isToday = isSameDay(selectedDate, new Date());

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Lock size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>No available slots for this date</Text>
      </View>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Time</Text>
        <View style={styles.availableCount}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.availableText}>{availableSlots.length} slots available</Text>
        </View>
      </View>

      {isToday && (
        <View style={styles.currentTimeContainer}>
          <Clock size={16} color="#3b82f6" />
          <Text style={styles.currentTimeText}>
            Current time: <Text style={styles.currentTimeBold}>{format(new Date(), 'HH:mm')}</Text>
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.slotsGrid}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot.time}
              style={[
                styles.slotButton,
                selectedTime === slot.time && styles.slotButtonSelected,
                !slot.available && styles.slotButtonDisabled,
                slot.isBreak && styles.slotButtonBreak,
              ]}
              onPress={() => slot.available && onSelectTime(slot.time)}
              disabled={!slot.available}
              activeOpacity={0.7}
            >
              {slot.isBreak ? (
                <View style={styles.slotContent}>
                  <Coffee size={12} color="#6b7280" />
                  <Text style={[styles.slotTime, styles.slotTimeSmall]}>{slot.time}</Text>
                </View>
              ) : slot.isPast ? (
                <View style={styles.slotContent}>
                  <Lock size={12} color="#6b7280" />
                  <Text style={[styles.slotTime, styles.slotTimeSmall, styles.slotTimePast]}>
                    {slot.time}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.slotTime,
                    selectedTime === slot.time && styles.slotTimeSelected,
                    !slot.available && styles.slotTimeDisabled,
                  ]}
                >
                  {slot.time}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendBoxAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendBoxSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendBoxBreak]} />
          <Text style={styles.legendText}>Break</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendBoxDisabled]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  availableCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableText: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  currentTimeText: {
    fontSize: 14,
    color: '#000',
  },
  currentTimeBold: {
    fontWeight: '600',
  },
  scrollView: {
    width: '100%',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    width: '31%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  slotButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  slotButtonDisabled: {
    opacity: 0.4,
  },
  slotButtonBreak: {
    backgroundColor: '#f9fafb',
  },
  slotContent: {
    alignItems: 'center',
    gap: 4,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  slotTimeSelected: {
    color: '#fff',
  },
  slotTimeDisabled: {
    color: '#9ca3af',
  },
  slotTimeSmall: {
    fontSize: 10,
  },
  slotTimePast: {
    textDecorationLine: 'line-through',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendBoxAvailable: {
    backgroundColor: '#fff',
  },
  legendBoxSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  legendBoxBreak: {
    backgroundColor: '#f9fafb',
    opacity: 0.4,
  },
  legendBoxDisabled: {
    backgroundColor: '#fff',
    opacity: 0.4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});