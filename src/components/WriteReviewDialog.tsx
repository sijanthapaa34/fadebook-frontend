import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, 
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { X, Star, Camera } from 'lucide-react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { theme } from '../theme/theme';
import { createReview } from '../api/reviewService';
import type { ReviewType } from '../models/models';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetId: number;
  targetType: ReviewType;
  currentUserId: number; // ADDED: Required by backend
  onSuccess: () => void;
}

const WriteReviewDialog: React.FC<Props> = ({ visible, onClose, targetId, targetType, currentUserId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isService = targetType === 'SERVICE';

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets[0].uri) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment.');
      return;
    }
    
    if (!isService && rating === 0) {
      Alert.alert('Error', 'Please select a rating.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        targetType: targetType,
        targetId: targetId,
        comment: comment,
        rating: isService ? null : rating,
        imageUrl: imageUri, 
      };

      // FIX: Pass currentUserId to the API call
      await createReview(currentUserId, payload);

      Alert.alert('Success', 'Review submitted!');
      resetState();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Submit Review Error:", error);
      const msg = error?.response?.data?.message || error.message || "Failed to submit review.";
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setRating(0);
    setComment('');
    setImageUri(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Write a Review</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{top:10, bottom:10, left:10, right:10}}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {!isService && (
            <View style={styles.ratingContainer}>
              <Text style={styles.label}>Rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Star 
                      size={32} 
                      color={theme.colors.primary} 
                      fill={i <= rating ? theme.colors.primary : 'transparent'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comment</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share your experience..."
              placeholderTextColor={theme.colors.muted}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <Camera size={20} color={theme.colors.primary} />
            <Text style={styles.imagePickerText}>
              {imageUri ? 'Change Photo' : 'Add Photo (Optional)'}
            </Text>
          </TouchableOpacity>
          
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  label: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    color: theme.colors.text,
    height: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePickerText: {
    color: theme.colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default WriteReviewDialog;