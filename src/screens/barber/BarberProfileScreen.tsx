// src/screens/barber/BarberProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, 
  Image, Modal 
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Lock, Save, Plus, X, Briefcase, Star } from 'lucide-react-native'; 
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme/theme';
import { changePassword, fetchBarberById , updateBarberProfile} from '../../api/barberService';
import { uploadProfilePicture } from '../../api/userService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BarberProfile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const { data: barber, isLoading: isProfileLoading, error } = useQuery({
    queryKey: ['barberProfile', user?.id],
    queryFn: () => fetchBarberById(user!.id),
    enabled: !!user?.id,
  });

  // --- 2. Form State ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [skills, setSkills] = useState('');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading States
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- 3. Sync Form State ---
  useEffect(() => {
    if (barber) {
      setName(barber.name || '');
      setPhone(barber.phone || '');
      setBio(barber.bio || '');
      setExperienceYears(String(barber.experienceYears || ''));
      setSkills(barber.skills?.join(', ') || '');
    }
  }, [barber]);

  // --- Image Handling ---
  const handlePickImage = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      setIsUploadingImage(true);
      try {
        const newImageUrl = await uploadProfilePicture(Number(user!.id), asset.uri);
        setUser({ ...user!, profilePicture: newImageUrl });
        queryClient.invalidateQueries({ queryKey: ['barberProfile', user!.id] });
        Alert.alert('Success', 'Profile picture updated');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to upload image');
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  // --- Form Submissions ---
    // --- Form Submissions ---
  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    // Safety check: Ensure barber data is loaded before saving
    if (!barber) {
      Alert.alert('Error', 'Profile data is not loaded.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // Prepare payload matching UpdateBarberRequest
      const payload = {
        name,
        phone,
        bio: bio,
        experienceYears: Number(experienceYears) || 0,
        skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
        active: barber.active, // TypeScript now knows barber is defined
      };

      // Call the API
      await updateBarberProfile(Number(user!.id), payload);
      
      // Refetch data to update UI
      queryClient.invalidateQueries({ queryKey: ['barberProfile', user!.id] });
      
      // Update local auth store if name changed
      if (name !== user?.name) setUser({ ...user!, name });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(Number(user!.id), { currentPassword, newPassword });
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- Render ---
  if (isProfileLoading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }
  
  if (error || !barber) {
    return <View style={styles.centerContainer}><Text style={{ color: theme.colors.error }}>Failed to load profile.</Text></View>;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your professional details</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => barber.profilePicture && setIsModalVisible(true)}>
              <View style={styles.avatar}>
                {barber.profilePicture ? (
                  <Image source={{ uri: barber.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{barber.name?.charAt(0) || 'U'}</Text>
                )}
                {isUploadingImage && <View style={styles.loadingOverlay}><ActivityIndicator color={theme.colors.primary} /></View>}
              </View>
              <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage} disabled={isUploadingImage}>
                <Plus size={14} color="#000" strokeWidth={3} />
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{barber.name}</Text>
              <View style={styles.statsRow}>
                {barber.rating !== undefined && (
                  <View style={styles.statBadge}>
                    <Star size={12} color={theme.colors.primary} fill={theme.colors.primary} />
                    <Text style={styles.statText}>{barber.rating.toFixed(1)}</Text>
                  </View>
                )}
                {barber.shopId && (
                  <View style={[styles.statBadge, { marginLeft: 8 }]}>
                    <Briefcase size={12} color={theme.colors.muted} />
                    <Text style={styles.statText}>Shop #{barber.shopId}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Inputs */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.colors.muted}/>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email (Read Only)</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={barber.email} editable={false} placeholderTextColor={theme.colors.muted}/>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={theme.colors.muted}/>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} multiline placeholder="Tell clients about yourself..." placeholderTextColor={theme.colors.muted}/>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Experience (Years)</Text>
            <TextInput style={styles.input} value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" placeholderTextColor={theme.colors.muted}/>
          </View>

          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Skills (comma separated)</Text>
            <TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholder="Fades, Shaves..." placeholderTextColor={theme.colors.muted}/>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, isUpdatingProfile && styles.btnDisabled]} onPress={handleSaveChanges} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? <ActivityIndicator color="#000" /> : (<><Save size={16} color="#000" style={{ marginRight: 8 }} /><Text style={styles.primaryBtnText}>Save Changes</Text></>)}
          </TouchableOpacity>
        </View>

        {/* Password Card */}
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
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <X size={28} color="#FFF" />
          </TouchableOpacity>
          {barber.profilePicture && (
            <Image source={{ uri: barber.profilePicture }} style={styles.fullScreenImage} resizeMode="contain"/>
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
  title: { fontSize: 24, fontFamily: theme.fonts.sans, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: 4 },
  
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },

  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  addImageButton: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: theme.colors.primary,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.colors.background, 
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: theme.colors.muted, marginLeft: 2 },

  passwordHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },

  formGroup: { marginBottom: theme.spacing.md },
  label: { fontSize: 12, fontWeight: '500', color: theme.colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10, paddingHorizontal: 14,
    fontSize: 14, color: theme.colors.text,
  },
  disabledInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: theme.colors.muted },

  primaryBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row', paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  btnDisabled: { backgroundColor: theme.colors.muted },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', alignItems: 'center', justifyContent: 'center' },
  fullScreenImage: { width: '90%', height: '80%' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
});

export default BarberProfile;