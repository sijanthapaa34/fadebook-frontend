// src/components/ReviewCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { UserCircle, Trash2, Pencil } from 'lucide-react-native';
import { theme } from '../theme/theme';
import StarRating  from './StarRating';
import { Review } from '../models/models';

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (id: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, isOwn, onEdit, onDelete }) => {
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <UserCircle size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{review.customerName}</Text>
            <Text style={styles.dateText}>{formatDate(review.date)}</Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      {review.images && review.images.length > 0 && (
        <View style={styles.imageGrid}>
          {review.images.map((img, i) => (
            <View key={i} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
            </View>
          ))}
        </View>
      )}

      {isOwn && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => onEdit?.(review)}
          >
            <Pencil size={12} color={theme.colors.muted} />
            <Text style={styles.actionText}> Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => onDelete?.(review.id)}
          >
            <Trash2 size={12} color={theme.colors.error} />
            <Text style={[styles.actionText, { color: theme.colors.error }]}> Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTextContainer: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 2,
  },
  comment: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
    gap: 8,
  },
  imageWrapper: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
});

export default ReviewCard;