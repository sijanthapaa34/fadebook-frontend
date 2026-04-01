// src/screens/customer/CustomerProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, 
  Image, Modal 
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Lock, Save, Plus, X, Edit3, User, Phone, Mail, LogOut } from 'lucide-react-native'; 
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme/theme';
import { getCustomerProfile, updateCustomerProfile, changePassword } from '../../api/customerService';
import { uploadProfilePicture } from '../../api/userService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const CustomerProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  // --- State ---
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordCard, setShowPasswordCard] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- Data Fetching ---
  const { data: customer, isLoading: isProfileLoading, error } = useQuery({
    queryKey: ['customerProfile', user?.id],
    queryFn: () => getCustomerProfile(user!.id),
    enabled: !!user?.id,
  });

  // --- Sync State ---
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  // --- Handlers ---
  const handlePickImage = () => {
    const options = { mediaType: 'photo' as const, includeBase64: false, maxHeight: 500, maxWidth: 500, quality: 0.8 as const };
    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      setIsUploadingImage(true);
      try {
        const newImageUrl = await uploadProfilePicture(Number(user!.id), asset.uri);
        
        // 1. Update Global Store (Optimistic Update for immediate UI feedback)
        setUser({ ...user!, profilePicture: newImageUrl });
        
        // 2. Refetch profile to sync everything else
        queryClient.invalidateQueries({ queryKey: ['customerProfile', user!.id] });
        
        Alert.alert('Success', 'Profile picture updated');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to upload image');
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    if (!customer) return;
    setIsUpdatingProfile(true);
    try {
      await updateCustomerProfile(Number(user!.id), { name, phone });
      queryClient.invalidateQueries({ queryKey: ['customerProfile', user!.id] });
      if (name !== user?.name || phone !== user?.phone) setUser({ ...user!, name, phone });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (newPassword.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'New passwords do not match'); return; }
    setIsUpdatingPassword(true);
    try {
      await changePassword(Number(user!.id), { currentPassword, newPassword });
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowPasswordCard(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isProfileLoading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  if (error || !customer) return <View style={styles.centerContainer}><Text style={{ color: theme.colors.error }}>Failed to load profile.</Text></View>;

  // FIX: Prioritize the Global User Store image over the Query image for immediate display
  // This ensures if you just uploaded, it shows instantly.
  const displayProfilePicture = user?.profilePicture || customer.profilePicture;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your personal information</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => displayProfilePicture && setIsModalVisible(true)}>
              <View style={styles.avatar}>
                {displayProfilePicture ? (
                  <Image source={{ uri: displayProfilePicture }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{customer.name?.charAt(0) || 'U'}</Text>
                )}
                {isUploadingImage && <View style={styles.loadingOverlay}><ActivityIndicator color={theme.colors.primary} /></View>}
              </View>
              <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage} disabled={isUploadingImage}>
                <Plus size={14} color="#000" strokeWidth={3} />
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.avatarInfo}>
              <Text style={styles.profileName}>{customer.name}</Text>
              <Text style={styles.profileEmail}>{customer.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details Section */}
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.colors.muted}/>
              </View>
              <View style={[styles.formGroup, { marginBottom: 0 }]}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.colors.muted}/>
              </View>
            </View>
          ) : (
            <View style={styles.viewDetails}>
              <View style={styles.detailRow}>
                <User size={18} color={theme.colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{customer.name}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Mail size={18} color={theme.colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{customer.email}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Phone size={18} color={theme.colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{customer.phone || 'Not set'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity style={[styles.primaryBtn, isUpdatingProfile && styles.btnDisabled]} onPress={handleSaveChanges} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <ActivityIndicator color="#000" /> : (<><Save size={16} color="#000" style={{ marginRight: 8 }} /><Text style={styles.primaryBtnText}>Save Changes</Text></>)}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.outlineBtn} onPress={() => setIsEditing(true)}>
                  <Edit3 size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.outlineBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowPasswordCard(!showPasswordCard)}>
                  <Lock size={16} color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Change Password</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Password Card */}
        {showPasswordCard && (
          <View style={styles.card}>
            <View style={styles.passwordHeader}>
              <Lock size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Update Password</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter current password" placeholderTextColor={theme.colors.muted}/>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="Min 8 characters" placeholderTextColor={theme.colors.muted}/>
            </View>
            <View style={[styles.formGroup, { marginBottom: 0 }]}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" placeholderTextColor={theme.colors.muted}/>
            </View>

            <TouchableOpacity style={[styles.primaryBtn, isUpdatingPassword && styles.btnDisabled]} onPress={handlePasswordUpdate} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
          ])}
        >
          <LogOut size={16} color={theme.colors.error} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}><X size={28} color="#FFF" /></TouchableOpacity>
          {displayProfilePicture && (
            <Image source={{ uri: displayProfilePicture }} style={styles.fullScreenImage} resizeMode="contain"/>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  headerSection: { marginBottom: theme.spacing.xl },
  title: { fontSize: 28, fontFamily: theme.fonts.sans, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: 4 },
  
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.lg },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },

  avatarSection: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 40, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  addImageButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.background },
  avatarInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  profileEmail: { fontSize: 14, color: theme.colors.muted, marginTop: 2 },

  viewDetails: { gap: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 8 },
  detailLabel: { fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  detailValue: { fontSize: 15, color: theme.colors.text, fontWeight: '500' },

  editForm: { gap: 12 },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '500', color: theme.colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14, fontSize: 14, color: theme.colors.text },
  
  actionContainer: { marginTop: 24 },
  primaryBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary, flexDirection: 'row', paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  outlineBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: theme.colors.muted, fontWeight: '600' },
  btnDisabled: { backgroundColor: theme.colors.muted },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },

  passwordHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    marginBottom: theme.spacing.lg,
  },
  logoutBtnText: { color: theme.colors.error, fontWeight: '600', fontSize: 14 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', alignItems: 'center', justifyContent: 'center' },
  fullScreenImage: { width: '90%', height: '80%' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
});

export default CustomerProfileScreen;