import React, { useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react-native';
import { theme } from '../theme/theme';
import {
  getNotifications, markAsRead, markAllAsRead,
  type AppNotification,
} from '../api/notificationApi';

const timeAgo = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationsScreen = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const handleTap = useCallback((item: AppNotification) => {
    if (!item.read) readMutation.mutate(item.id);
  }, [readMutation]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.item, !item.read && styles.itemUnread]}
      onPress={() => handleTap(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, item.read && styles.dotRead]} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title || 'Notification'}</Text>
        <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.itemTime}>{timeAgo(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            style={styles.markAllBtn}
          >
            <CheckCheck size={16} color={theme.colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Bell size={48} color={theme.colors.muted} strokeWidth={1} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  markAllText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontFamily: theme.fonts.sans,
  },
  list: { paddingVertical: theme.spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemUnread: { backgroundColor: `${theme.colors.primary}0D` },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },
  dotRead: { backgroundColor: 'transparent' },
  itemContent: { flex: 1 },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.sans,
    marginBottom: 2,
  },
  itemMessage: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.sans,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    color: theme.colors.muted,
    fontFamily: theme.fonts.sans,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.muted,
    fontFamily: theme.fonts.sans,
  },
});

export default NotificationsScreen;
