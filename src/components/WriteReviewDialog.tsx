// src/components/WriteReviewDialog.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import { theme } from '../theme/theme';
import  StarRating from './StarRating';

interface WriteReviewDialogProps {
  targetName: string;
  targetType: 'SHOP' | 'BARBER' | 'SERVICE';
  trigger?: React.ReactNode;
  existingRating?: number;
  existingComment?: string;
  onSubmit: (data: { rating: number; comment: string; images: string[] }) => void;
}

const WriteReviewDialog: React.FC<WriteReviewDialogProps> = ({
  targetName,
  targetType,
  trigger,
  existingRating,
  existingComment,
  onSubmit,
}) => {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(existingRating || 0);
  const [comment, setComment] = useState(existingComment || '');
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = () => {
    // Simulate image upload logic from the web version
    const placeholder = `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&q=80`;
    if (images.length < 4) {
      setImages([...images, placeholder]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Error', 'Please write at least 10 characters');
      return;
    }
    onSubmit({ rating, comment: comment.trim(), images });
    Alert.alert('Success', 'Review submitted! Thank you for your feedback.');
    setVisible(false);
    // Reset state
    setRating(0);
    setComment('');
    setImages([]);
  };

  const typeLabel = targetType === 'SHOP' ? 'shop' : targetType === 'BARBER' ? 'barber' : 'service';

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        {trigger || (
          <View style={styles.defaultTrigger}>
            <Text style={styles.defaultTriggerText}>Write a Review</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review {targetName}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <X size={20} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Rating */}
              <View style={styles.section}>
                <Text style={styles.label}>How would you rate this {typeLabel}?</Text>
                <StarRating rating={rating} size={28} interactive onChange={setRating} />
              </View>

              {/* Comment */}
              <View style={styles.section}>
                <Text style={styles.label}>Share your experience</Text>
                <TextInput
                  style={styles.textarea}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Tell others about your experience..."
                  placeholderTextColor={theme.colors.muted}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{comment.length}/500</Text>
              </View>

              {/* Images */}
              <View style={styles.section}>
                <Text style={styles.label}>Add photos (optional)</Text>
                <View style={styles.imageGrid}>
                  {images.map((img, i) => (
                    <View key={i} style={styles.imagePreview}>
                      <Image source={{ uri: img }} style={styles.previewImg} />
                      <TouchableOpacity 
                        style={styles.removeBtn} 
                        onPress={() => removeImage(i)}
                      >
                        <X size={10} color="#000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {images.length < 4 && (
                    <TouchableOpacity 
                      style={styles.addBtn} 
                      onPress={handleImageUpload}
                    >
                      <ImagePlus size={18} color={theme.colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  defaultTrigger: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
  },
  defaultTriggerText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.serif,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  label: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  textarea: {
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    height: 120,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default WriteReviewDialog;