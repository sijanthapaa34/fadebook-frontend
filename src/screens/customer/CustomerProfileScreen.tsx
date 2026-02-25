// src/screens/customer/CustomerProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, 
  Image, Modal, Pressable 
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker'; // Native Image Picker
import { Lock, User, Check, Save, Image as ImageIcon, Plus, X } from 'lucide-react-native'; 
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme/theme';
import { updateCustomerProfile, changePassword } from '../../api/customerService';
import { uploadProfilePicture } from '../../api/userService'; // Import the upload function you provided

const CustomerProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading States
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modal State for Enlarged Image
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Sync local state if user store updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!user) return null;

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
        // Use the API function provided
        const newImageUrl = await uploadProfilePicture(Number(user.id), asset.uri);
        
        // Update Global Store
        setUser({ ...user, profilePicture: newImageUrl });
        
        Alert.alert('Success', 'Profile picture updated');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to upload image');
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  // --- Form Submissions ---
  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateCustomerProfile(Number(user.id), { 
        name, 
        phone,
        profilePicture: user.profilePicture
      });
      setUser({ ...user, name: updatedUser.name, phone: updatedUser.phone });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
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
      await changePassword(Number(user.id), { currentPassword, newPassword });
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>

        {/* Profile Details Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            
            {/* Avatar Container with Overlay Button */}
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => user.profilePicture && setIsModalVisible(true)}
              activeOpacity={0.9}
            >
              <View style={styles.avatar}>
                {user.profilePicture ? (
                  <Image 
                    source={{ uri: user.profilePicture }} 
                    style={styles.avatarImage} 
                  />
                ) : (
                  <Text style={styles.avatarText}>{user.name?.charAt(0) || 'U'}</Text>
                )}
                
                {/* Loading Overlay */}
                {isUploadingImage && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={theme.colors.primary} />
                  </View>
                )}
              </View>

              {/* Floating Plus Button */}
              <TouchableOpacity 
                style={styles.addImageButton} 
                onPress={handlePickImage}
                disabled={isUploadingImage}
              >
                <Plus size={14} color="#000" strokeWidth={3} />
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.colors.muted}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email (Read Only)</Text>
            <TextInput 
              style={[styles.input, styles.disabledInput]} 
              value={user.email} 
              editable={false}
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Phone</Text>
            <TextInput 
              style={styles.input} 
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, isUpdatingProfile && styles.btnDisabled]} 
            onPress={handleSaveChanges}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Save size={16} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Update Password Card */}
        <View style={styles.card}>
          <View style={styles.passwordHeader}>
            <Lock size={20} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Update Password</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              placeholder="Enter current password"
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              value={newPassword} 
              onChangeText={setNewPassword} 
              placeholder="Min 8 characters"
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput 
              style={styles.input} 
              secureTextEntry 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              placeholder="Re-enter new password"
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, isUpdatingPassword && styles.btnDisabled]} 
            onPress={handlePasswordUpdate}
            disabled={isUpdatingPassword}
          >
             {isUpdatingPassword ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setIsModalVisible(false)}
          >
            <X size={28} color="#FFF" />
          </TouchableOpacity>
          
          {user.profilePicture && (
            <Image 
              source={{ uri: user.profilePicture }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: 4,
  },
  
  // Card Styles
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  // New Container to handle absolute positioning of the plus button
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The small "+" button
  addImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background, 
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: 2,
  },

  // Password Header
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // Form
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: theme.colors.text,
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', 
    color: theme.colors.muted,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  btnDisabled: {
    backgroundColor: theme.colors.muted,
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});

export default CustomerProfileScreen;