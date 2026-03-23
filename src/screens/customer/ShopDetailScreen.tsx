import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Clock, Star, Scissors, User } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { fetchBarbershopById } from '../../api/barbershopService';
import { fetchBarbersByShop } from '../../api/barberService';
import { fetchServicesByShop } from '../../api/serviceService';
import { getReviews } from '../../api/reviewService';
import StarRating from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import WriteReviewDialog from '../../components/WriteReviewDialog';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { ReviewType } from '../../models/models';
import { useAuthStore } from '../../store/authStore'; // <--- IMPORT AUTH STORE

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1585747860019-8e4b67e3149c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
];

const ShopDetail = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { shopId } = route.params as { shopId: number };

  // Get current logged in user
  const user = useAuthStore((state) => state.user); 

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'barbers' | 'reviews' | 'photos'>('overview');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const { 
    data: shop, 
    isLoading: isShopLoading, 
    isError: isShopError 
  } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => fetchBarbershopById(shopId),
    enabled: !!shopId,
  });

  const { data: barbersPage, isLoading: isBarbersLoading } = useQuery({
    queryKey: ['barbers', shopId],
    queryFn: () => fetchBarbersByShop({ shopId, page: 0, size: 20 }),
    enabled: !!shopId,
  });
  const barbers = barbersPage?.content || [];

  const { data: servicesPage, isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', shopId],
    queryFn: () => fetchServicesByShop({ shopId, page: 0, size: 20 }),
    enabled: !!shopId,
  });
  const services = servicesPage?.content || [];

  const { data: reviewsPage, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', ReviewType.BARBER_SHOP, shopId],
    queryFn: () => getReviews(ReviewType.BARBER_SHOP, shopId, 0, 20),
    enabled: !!shopId,
  });
  const reviews = reviewsPage?.content || [];

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) 
    : shop?.rating?.toFixed(1) || '0.0';

  if (isShopLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isShopError || !shop) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={{ color: theme.colors.muted }}>Shop not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayImages = shop.shopImages && shop.shopImages.length > 0 
    ? shop.shopImages 
    : PLACEHOLDER_IMAGES;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'services', label: `Services (${services.length})` },
    { key: 'barbers', label: `Barbers (${barbers.length})` },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
    { key: 'photos', label: `Photos (${displayImages.length})` },
  ] as const;

  return (
    <View style={styles.container}>
       <WriteReviewDialog 
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        targetId={shopId}
        targetType={ReviewType.BARBER_SHOP}
        currentUserId={user?.id || 0} // <--- PASS USER ID
        onSuccess={() => {
            refetchReviews();
            setReviewModalVisible(false);
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
            <View style={styles.addressRow}>
              <MapPin size={12} color={theme.colors.muted} />
              <Text style={styles.addressText} numberOfLines={1}>{shop.address}, {shop.city}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bookNowBtn} 
            onPress={() => navigation.navigate('BookAppointment', { shopId: shop.id, shopName: shop.name })}
          >
            <Text style={styles.bookNowText}>Book</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.avatar}>
              {shop.profilePicture ? (
                <Image source={{ uri: shop.profilePicture }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{shop.name.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.ratingRow}>
                <StarRating rating={Number(avgRating)} size={16} />
                <Text style={styles.ratingText}>{avgRating}</Text>
                <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}><Clock size={12} color={theme.colors.muted} /><Text style={styles.infoText}>{shop.operatingHours || 'N/A'}</Text></View>
                <View style={styles.infoItem}><Phone size={12} color={theme.colors.muted} /><Text style={styles.infoText}>{shop.phone || 'N/A'}</Text></View>
                <View style={styles.infoItem}><Scissors size={12} color={theme.colors.muted} /><Text style={styles.infoText}>{services.length} services</Text></View>
                <View style={styles.infoItem}><User size={12} color={theme.colors.muted} /><Text style={styles.infoText}>{barbers.length} barbers</Text></View>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabs.map((t) => (
              <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={styles.tabBtn}>
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
                {activeTab === t.key && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{shop.description || 'No description available'}</Text>
            </View>
            <View style={styles.galleryGrid}>
              {displayImages.slice(0, 4).map((img, i) => (
                <View key={i} style={styles.galleryItem}>
                  <Image source={{ uri: img }} style={styles.galleryImage} />
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.section}>
            {isServicesLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                {services.length === 0 && <Text style={styles.emptyText}>No services listed.</Text>}
                {services.map((s) => (
                  <TouchableOpacity 
                    key={s.id} 
                    style={styles.listItem} 
                    onPress={() => navigation.navigate('ServiceDetail', { serviceId: s.id })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{s.name}</Text>
                      <Text style={styles.itemSub} numberOfLines={1}>{s.description}</Text>
                    </View>
                    <Text style={styles.itemPrice}>Rs. {s.price}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === 'barbers' && (
          <View style={styles.section}>
            {isBarbersLoading ? (
               <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                {barbers.length === 0 && <Text style={styles.emptyText}>No barbers listed.</Text>}
                {barbers.map((b) => (
                  <TouchableOpacity 
                    key={b.id} 
                    style={styles.listItem} 
                    onPress={() => navigation.navigate('BarberDetail', { barberId: b.id })}
                  >
                    <View style={styles.barberAvatar}>
                       {b.profilePicture ? (
                         <Image source={{ uri: b.profilePicture }} style={styles.barberAvatarImage} />
                       ) : (
                         <Text style={styles.barberInitial}>{b.name.charAt(0)}</Text>
                       )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.itemTitle}>{b.name}</Text>
                      <Text style={styles.itemSub}>{b.bio || 'Barber'}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color={theme.colors.primary} fill={theme.colors.primary} />
                      <Text style={styles.ratingBadgeText}>{b.rating?.toFixed(1) || '0.0'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCountText}>{reviews.length} reviews</Text>
              <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewModalVisible(true)}>
                  <Text style={styles.writeReviewBtnText}>Write a Review</Text>
              </TouchableOpacity>
            </View>
            {reviews.length === 0 ? <Text style={styles.emptyText}>No reviews yet.</Text> : reviews.map((r) => <ReviewCard key={r.id} review={r} canReply={false} />)}
          </View>
        )}

        {activeTab === 'photos' && (
          <View style={styles.section}>
            {displayImages.length === 0 ? (
               <Text style={styles.emptyText}>No photos available.</Text>
            ) : (
              <View style={styles.photosGrid}>
                {displayImages.map((img, i) => (
                  <View key={i} style={styles.photoItem}>
                    <Image source={{ uri: img }} style={styles.photoImage} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backBtn: { padding: theme.spacing.sm, marginLeft: -theme.spacing.sm },
  headerContent: { flex: 1, marginLeft: theme.spacing.sm },
  shopName: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  addressText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },
  bookNowBtn: { backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.md },
  bookNowText: { color: '#000', fontFamily: theme.fonts.sans, fontWeight: '700', fontSize: 13 },

  heroCard: { margin: theme.spacing.lg, padding: theme.spacing.lg, backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 64, height: 64, borderRadius: theme.radius.lg, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  heroInfo: { flex: 1, marginLeft: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.primary, marginLeft: 6 },
  reviewCount: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 6 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginTop: 4 },
  infoText: { fontSize: 11, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },

  tabsContainer: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tabsScrollContent: { paddingHorizontal: theme.spacing.lg },
  tabBtn: { paddingVertical: theme.spacing.md, marginRight: theme.spacing.lg },
  tabText: { color: theme.colors.muted, fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '500' },
  tabTextActive: { color: theme.colors.primary, fontWeight: '600' },
  activeIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: theme.colors.primary },

  section: { padding: theme.spacing.lg },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
  description: { fontSize: 13, fontFamily: theme.fonts.sans, lineHeight: 20, color: theme.colors.muted },

  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  galleryItem: { width: '50%', padding: 4 },
  galleryImage: { width: '100%', height: 120, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  photoItem: { width: '33.33%', aspectRatio: 1, padding: 4 },
  photoImage: { width: '100%', height: '100%', borderRadius: theme.radius.md, backgroundColor: theme.colors.surface },

  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.md },
  itemTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text },
  itemSub: { fontSize: 10, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '700', color: theme.colors.primary, marginLeft: 12 },
  
  barberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  barberAvatarImage: { width: '100%', height: '100%' },
  barberInitial: { fontSize: 16, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: theme.radius.sm },
  ratingBadgeText: { fontSize: 12, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 },

  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  reviewCountText: { fontSize: 13, fontFamily: theme.fonts.sans, color: theme.colors.muted },
  writeReviewBtn: { backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.md },
  writeReviewBtnText: { color: '#000', fontWeight: '600', fontSize: 12 },
  emptyText: { textAlign: 'center', fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.xl, marginBottom: 20 },
});

export default ShopDetail;