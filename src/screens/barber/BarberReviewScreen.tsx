// src/screens/barber/BarberReviewsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Star, MessageSquare } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Review } from '../../models/models';

// --- Local Type Extension ---
// The provided DTO doesn't have a 'reply' field, but the UI needs it.
// We create a local type that extends the DTO for state management.
type ReviewWithReply = Review & {
  reply?: {
    id: string;
    message: string;
    barberName: string;
    createdAt: string;
  };
};

// --- Mock Data (Compatible with Review DTO) ---
const seedReviews: ReviewWithReply[] = [
  { id: 1, customerId: 101, customerName: 'John Doe', rating: 5, comment: 'Great cut, very professional. The fade was perfect.', targetType: 'BARBER', targetId: 1, date: '2026-02-20' },
  { id: 2, customerId: 102, customerName: 'Mike Ross', rating: 4, comment: 'Good service, nice atmosphere.', targetType: 'BARBER', targetId: 1, date: '2026-02-19' },
  { id: 3, customerId: 103, customerName: 'Alex Kim', rating: 5, comment: 'Best barber in town. Highly recommend.', targetType: 'BARBER', targetId: 1, date: '2026-02-18' },
  { id: 4, customerId: 104, customerName: 'Sarah Lee', rating: 3, comment: 'It was okay, had to wait a bit long.', targetType: 'BARBER', targetId: 1, date: '2026-02-17' },
];

// --- Sub-Component: Review Item ---
const ReviewItem = ({ 
  item, 
  onReply 
}: { 
  item: ReviewWithReply; 
  onReply: (id: number, message: string) => void 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSend = () => {
    if (replyText.trim().length === 0) return;
    onReply(item.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.customerName?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewerName}>{item.customerName}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} size={14} />
            {/* Changed createdAt to date */}
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.commentText}>{item.comment}</Text>

      {/* Reply Section */}
      {item.reply ? (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Your Reply:</Text>
          <Text style={styles.replyText}>{item.reply.message}</Text>
        </View>
      ) : (
        <View style={styles.replyActionContainer}>
          {!isReplying ? (
            <TouchableOpacity onPress={() => setIsReplying(true)}>
              <Text style={styles.replyButton}>Reply</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.replyInputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Write a reply..."
                placeholderTextColor={theme.colors.muted}
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <View style={styles.replyActions}>
                <TouchableOpacity onPress={() => setIsReplying(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                  <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// --- Helper Component: Star Rating ---
const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color={theme.colors.primary}
          fill={i <= rating ? theme.colors.primary : 'transparent'}
        />
      ))}
    </View>
  );
};

// --- Main Screen Component ---
const BarberReviewsScreen = () => {
  // Use the extended type for state
  const [reviews, setReviews] = useState<ReviewWithReply[]>(seedReviews);

  // Calculate Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  // Updated ID type to number
  const handleReply = (reviewId: number, message: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: {
                id: `rep-${Date.now()}`,
                message,
                barberName: 'Marcus Johnson', // Current barber
                createdAt: new Date().toISOString(),
              },
            }
          : r
      )
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>My Reviews</Text>
        <Text style={styles.subtitle}>
          See what clients say and respond to their feedback
        </Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avgRatingText}>{avgRating}</Text>
          <StarRating rating={Number(avgRating)} />
          <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
        </View>

        <View style={styles.summaryRight}>
          {ratingDist.map((d) => {
            const percentage = reviews.length > 0 ? (d.count / reviews.length) * 100 : 0;
            return (
              <View key={d.star} style={styles.distRow}>
                <Text style={styles.distStarLabel}>{d.star}</Text>
                <Star size={10} color={theme.colors.muted} style={{ marginRight: 6 }} />
                <View style={styles.distBarBg}>
                  <View 
                    style={[
                      styles.distBarFill, 
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.distCount}>{d.count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageSquare size={40} color={theme.colors.muted} />
          <Text style={styles.emptyText}>No reviews yet.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {reviews.map((r) => (
            <ReviewItem key={r.id} item={r} onReply={handleReply} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  
  // Header
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  summaryLeft: {
    alignItems: 'center',
    marginRight: theme.spacing.xl,
    width: 80,
  },
  avgRatingText: {
    fontSize: 48,
    fontFamily: theme.fonts.sans,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  summaryRight: {
    flex: 1,
    gap: 6,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distStarLabel: {
    width: 10,
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'right',
    marginRight: 4,
  },
  distBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  distCount: {
    width: 20,
    fontSize: 12,
    color: theme.colors.muted,
    marginLeft: 8,
    textAlign: 'right',
  },

  // List
  listContainer: {
    gap: theme.spacing.md,
  },

  // Review Item
  reviewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginLeft: theme.spacing.sm,
  },
  commentText: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textSecondary || theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },

  // Reply Logic
  replyContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary,
  },
  replyLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.muted,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 13,
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  replyActionContainer: {
    marginTop: theme.spacing.sm,
  },
  replyButton: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    fontSize: 13,
  },
  replyInputWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    minHeight: 60,
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.sm,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  cancelBtn: {
    padding: 6,
  },
  cancelText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
  },
  sendText: {
    color: '#000',
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.sans,
    marginTop: theme.spacing.md,
  },
});

export default BarberReviewsScreen;