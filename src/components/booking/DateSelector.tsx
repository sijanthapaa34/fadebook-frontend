import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { isDateAvailable, BarberSchedule } from '../../utils/bookingHelper';
import { addDays, startOfDay, format } from 'date-fns';

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  barberSchedule: BarberSchedule;
}

export const DateSelector = ({ selectedDate, onSelectDate, barberSchedule }: DateSelectorProps) => {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 3);

  const markedDates = {
    ...(selectedDate && {
      [format(selectedDate, 'yyyy-MM-dd')]: {
        selected: true,
        selectedColor: '#3b82f6',
      },
    }),
  };

  // Create disabled dates object
  const disabledDates: { [key: string]: { disabled: boolean; disableTouchEvent: boolean } } = {};
  
  // Disable dates outside the 3-day window and based on barber schedule
  for (let i = -30; i <= 30; i++) {
    const date = addDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    if (date < today || date > maxDate || !isDateAvailable(date, barberSchedule)) {
      disabledDates[dateString] = {
        disabled: true,
        disableTouchEvent: true,
      };
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date</Text>
      
      <View style={styles.calendarContainer}>
        <Calendar
          current={format(today, 'yyyy-MM-dd')}
          minDate={format(today, 'yyyy-MM-dd')}
          maxDate={format(maxDate, 'yyyy-MM-dd')}
          onDayPress={(day) => {
            const selectedDate = new Date(day.timestamp);
            if (!disabledDates[day.dateString]) {
              onSelectDate(selectedDate);
            }
          }}
          markedDates={{
            ...markedDates,
            ...disabledDates,
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#6b7280',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            dayTextColor: '#000000',
            textDisabledColor: '#d1d5db',
            dotColor: '#3b82f6',
            selectedDotColor: '#ffffff',
            arrowColor: '#3b82f6',
            monthTextColor: '#000000',
            textDayFontWeight: '400',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
          style={styles.calendar}
        />
      </View>

      <Text style={styles.helperText}>
        Booking available for the next 3 days
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});