import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { User, MessageCircle, Send, X } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { ReviewDTO } from '../models/models';
import StarRating from './StarRating';
import { replyToReview } from '../api/reviewService';
import { useAuthStore } from '../store/authStore';

interface Props {
  review: ReviewDTO;
  canReply?: boolean; // True if current user is the owner
  onReplied?: () => void;
}

const ReviewCard: React.FC<Props> = ({ review, canReply = false, onReplied }) => {
  const user = useAuthStore((s) => s.user);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!user) return Alert.alert('Error', 'You must be logged in to reply.');

    setLoading(true);
    try {
      await replyToReview(review.id, user.id, { comment: replyText });
      setReplyText('');
      setIsReplying(false);
      onReplied?.(); // Trigger refresh
    } catch (e) {
      Alert.alert('Error', 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {review.customerProfilePic ? (
            <Image source={{ uri: review.customerProfilePic }} style={styles.avatarImg} />
          ) : (
            <User size={20} color={theme.colors.muted} />
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{review.customerName}</Text>
          <View style={styles.row}>
             {review.rating !== null && <StarRating rating={review.rating} size={12} />}
             <Text style={styles.date}> • {new Date(review.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      {/* Comment */}
      <Text style={styles.comment}>{review.comment}</Text>
      
      {review.imageUrl && <Image source={{ uri: review.imageUrl }} style={styles.image} />}

      {/* Replies */}
      {review.replies && review.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {review.replies.map((rep) => (
            <View key={rep.id} style={styles.replyItem}>
              <View style={styles.replyHeader}>
                 <Text style={styles.replyName}>{rep.userName} ({rep.userRole})</Text>
                 <Text style={styles.replyDate}>{new Date(rep.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.replyText}>{rep.comment}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reply Action */}
      {canReply && !isReplying && (
        <TouchableOpacity style={styles.replyBtn} onPress={() => setIsReplying(true)}>
          <MessageCircle size={14} color={theme.colors.primary} />
          <Text style={styles.replyBtnText}>Reply</Text>
        </TouchableOpacity>
      )}

      {isReplying && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.input}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply..."
            placeholderTextColor={theme.colors.muted}
            multiline
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setIsReplying(false)} style={styles.cancelBtn}>
              <X size={16} color={theme.colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReply} disabled={loading} style={styles.sendBtn}>
              {loading ? <ActivityIndicator size="small" color="#000" /> : <Send size={16} color="#000" />}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginBottom: theme.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  headerInfo: { marginLeft: 10, flex: 1 },
  name: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  date: { fontSize: 10, color: theme.colors.muted, marginLeft: 6 },
  comment: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 18 },
  image: { width: '100%', height: 150, borderRadius: theme.radius.md, marginTop: 10 },
  
  repliesContainer: { marginTop: 10, borderLeftWidth: 2, borderLeftColor: theme.colors.border, paddingLeft: 10 },
  replyItem: { marginBottom: 6 },
  replyHeader: { flexDirection: 'row', marginBottom: 2 },
  replyName: { fontWeight: '600', fontSize: 11, color: theme.colors.text },
  replyDate: { fontSize: 9, color: theme.colors.muted, marginLeft: 6 },
  replyText: { fontSize: 12, color: theme.colors.textSecondary },
  
  replyBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  replyBtnText: { color: theme.colors.primary, fontSize: 12, marginLeft: 4 },
  
  replyInputContainer: { marginTop: 10, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 10 },
  input: { minHeight: 40, color: theme.colors.text, fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { padding: 4 },
  sendBtn: { backgroundColor: theme.colors.primary, padding: 6, borderRadius: 6 },
});

export default ReviewCard;