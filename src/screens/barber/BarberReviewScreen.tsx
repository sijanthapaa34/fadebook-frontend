import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { ReviewDTO, ReviewType } from '../../models/models';
import { getReviews } from '../../api/reviewService';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import ReviewCard from '../../components/ReviewCard';

const BarberReviewsScreen = () => {
  const user = useAuthStore((s) => s.user);
  const barberId = user?.id;

  const { data: reviewsPage, refetch, isLoading } = useQuery({
    queryKey: ['reviews', ReviewType.BARBER, barberId],
    queryFn: () => getReviews(ReviewType.BARBER, barberId!, 0, 20),
    enabled: !!barberId,
  });

  const reviews: ReviewDTO[] = reviewsPage?.content || [];

  // Calculate Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
  }

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
          <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
        </View>
        <View style={styles.summaryRight}>
           <Text style={styles.statLabel}>Based on customer feedback</Text>
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
            <ReviewCard 
                key={r.id} 
                review={r}         // FIX: Changed 'item' to 'review'
                canReply={true} 
                onReplied={() => refetch()} 
            />
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  
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
  statLabel: { fontSize: 11, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 2 },

  listContainer: {
    gap: theme.spacing.md,
  },

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