import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator
} from 'react-native';
import { Calendar as CalendarIcon, Clock, Plus, X, CheckCircle, XCircle } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Calendar } from 'react-native-calendars';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applyLeave, getBarberLeaves } from '../../api/leaveService';
import { useAuthStore } from '../../store/authStore';
import type { BarberLeaveDTO, LeaveStatus } from '../../models/models';

// --- Modern Date Picker Component ---
const DatePickerInput = ({ label, value, onChange }: { label: string; value: string; onChange: (date: string) => void }) => {
  const [show, setShow] = useState(false);

  const handleDayPress = (day: { dateString: string }) => {
    onChange(day.dateString);
    setShow(false);
  };

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShow(true)}>
        <Text style={[styles.dateInputText, !value && styles.placeholderText]}>{value || 'Select Date'}</Text>
        <CalendarIcon size={18} color={theme.colors.muted} />
      </TouchableOpacity>

      {show && (
        <Modal transparent animationType="fade" visible={show} onRequestClose={() => setShow(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShow(false)}>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={{ [value]: { selected: true, selectedColor: theme.colors.primary } }}
                theme={{
                  calendarBackground: theme.colors.card,
                  textSectionTitleColor: theme.colors.muted,
                  selectedDayTextColor: '#000',
                  todayTextColor: theme.colors.primary,
                  dayTextColor: theme.colors.text,
                  textDisabledColor: theme.colors.border,
                  monthTextColor: theme.colors.text,
                  arrowColor: theme.colors.primary,
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />
              <TouchableOpacity style={styles.calendarCloseBtn} onPress={() => setShow(false)}>
                 <Text style={styles.calendarCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

// --- Main Screen ---
const BarberLeaveScreen = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'ALL' | LeaveStatus>('ALL');

  // --- API Hooks ---
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['barberLeaves', user?.id],
    queryFn: () => getBarberLeaves(user!.id),
    enabled: !!user?.id,
  });

  const leaves = pageData?.content || [];

  const applyMutation = useMutation({
    mutationFn: () => applyLeave(user!.id, { startDate, endDate, reason }),
    onSuccess: () => {
      Alert.alert('Success', 'Leave request submitted.');
      queryClient.invalidateQueries({ queryKey: ['barberLeaves'] });
      setShowForm(false);
      resetForm();
    },
    onError: (err: any) => Alert.alert('Error', err.message || 'Failed to submit')
  });

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!startDate) errs.startDate = 'Required';
    if (!endDate) errs.endDate = 'Required';
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End date must be after start date';
    if (!reason.trim()) errs.reason = 'Please provide a reason';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    applyMutation.mutate();
  };

  const filtered = leaves.filter(l => filter === 'ALL' || l.status === filter);

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  // FIX: Added 'border' property to the return object
  const getStatusStyle = (status: LeaveStatus) => {
    switch (status) {
      case 'PENDING': return { bg: 'rgba(250, 204, 21, 0.1)', color: '#FACC15', border: 'rgba(250, 204, 21, 0.2)' };
      case 'APPROVED': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { bg: 'transparent', color: theme.colors.text, border: 'transparent' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Leave Management</Text>
          <Text style={styles.subtitle}>Apply for leave and view history</Text>
        </View>
        <TouchableOpacity style={[styles.headerBtn, showForm && styles.headerBtnCancel]} onPress={() => setShowForm(!showForm)}>
          {showForm ? <X size={14} color={theme.colors.text} /> : <Plus size={14} color={theme.colors.primaryText} />}
          <Text style={[styles.headerBtnText, showForm && { color: theme.colors.text }]}>{showForm ? ' Cancel' : ' Apply Leave'}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[ { label: 'Total', value: stats.total }, { label: 'Pending', value: stats.pending, color: '#FACC15' }, { label: 'Approved', value: stats.approved, color: '#10B981' }, { label: 'Rejected', value: stats.rejected, color: '#EF4444' } ].map(s => (
          <View key={s.label} style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color || theme.colors.text }]}>{s.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Leave Request</Text>
          <View style={styles.formRow}>
            <DatePickerInput label="Start Date" value={startDate} onChange={setStartDate} />
            <DatePickerInput label="End Date" value={endDate} onChange={setEndDate} />
          </View>
          {(errors.startDate || errors.endDate) && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: -8, marginBottom: 8 }}>
               {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
               {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </View>
          )}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason</Text>
            <TextInput style={[styles.textarea, errors.reason && styles.inputError]} placeholder="Why do you need leave?" placeholderTextColor={theme.colors.muted} value={reason} onChangeText={setReason} multiline numberOfLines={4} textAlignVertical="top" />
            {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={applyMutation.isPending}>
            {applyMutation.isPending ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
          <TouchableOpacity key={s} style={[styles.filterBtn, filter === s && styles.filterBtnActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterBtnText, filter === s && styles.filterBtnTextActive]}>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} /> : (
        <View style={styles.listContainer}>
          {filtered.length === 0 && <Text style={styles.emptyText}>No leave requests found.</Text>}
          {filtered.map(leave => {
             const sc = getStatusStyle(leave.status);
             const isSingleDay = leave.startDate === leave.endDate;
             return (
              <View key={leave.id} style={styles.leaveCard}>
                <View style={styles.leaveHeader}>
                  <View style={styles.leaveInfoRow}>
                    <View style={styles.leaveIconContainer}><CalendarIcon size={18} color={theme.colors.primary} /></View>
                    <View style={styles.leaveTextContainer}>
                      <Text style={styles.leaveDateText}>{isSingleDay ? leave.startDate : `${leave.startDate} → ${leave.endDate}`}</Text>
                      <Text style={styles.leaveReasonText}>{leave.reason}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border, borderWidth: 1 }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{leave.status}</Text>
                  </View>
                </View>
                <View style={styles.leaveFooter}>
                  <Text style={styles.footerText}>Applied: {leave.requestedAt?.split('T')[0]}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xl },
  title: { fontSize: 24, fontFamily: theme.fonts.sans, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.xs },
  headerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: theme.radius.md },
  headerBtnCancel: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  headerBtnText: { color: theme.colors.primaryText, fontFamily: theme.fonts.sans, fontWeight: '600', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: theme.spacing.xl },
  statCardWrapper: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  statCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg },
  statLabel: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted },
  statValue: { fontSize: 20, fontFamily: theme.fonts.sans, fontWeight: '700', marginTop: 4 },
  formCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: 18, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md },
  formRow: { flexDirection: 'row', gap: theme.spacing.md },
  formGroup: { flex: 1, marginBottom: theme.spacing.md },
  label: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.text, marginBottom: 6 },
  dateInput: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48 },
  dateInputText: { color: theme.colors.text, fontFamily: theme.fonts.sans, fontSize: 14 },
  placeholderText: { color: theme.colors.muted },
  textarea: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, color: theme.colors.text, fontFamily: theme.fonts.sans, minHeight: 100 },
  inputError: { borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: 11, fontFamily: theme.fonts.sans, marginTop: 4 },
  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.sm },
  submitBtnText: { color: '#000', fontFamily: theme.fonts.sans, fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  calendarContainer: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: 10, width: '100%', maxWidth: 360 },
  calendarCloseBtn: { marginTop: 10, alignItems: 'center', padding: 8 },
  calendarCloseText: { color: theme.colors.primary, fontFamily: theme.fonts.sans, fontWeight: '600' },
  filtersContainer: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: theme.radius.md },
  filterBtnActive: { backgroundColor: `${theme.colors.primary}1A` },
  filterBtnText: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.fonts.sans, fontWeight: '500' },
  filterBtnTextActive: { color: theme.colors.primary },
  listContainer: { gap: theme.spacing.md },
  emptyText: { color: theme.colors.muted, fontFamily: theme.fonts.sans, textAlign: 'center', marginTop: theme.spacing.xl },
  leaveCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leaveInfoRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  leaveIconContainer: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: `${theme.colors.primary}1A`, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  leaveTextContainer: { flex: 1 },
  leaveDateText: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '500', color: theme.colors.text },
  leaveReasonText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: theme.fonts.sans, fontWeight: '600', marginLeft: 2 },
  leaveFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerText: { fontSize: 11, fontFamily: theme.fonts.sans, color: theme.colors.muted },
});

export default BarberLeaveScreen;