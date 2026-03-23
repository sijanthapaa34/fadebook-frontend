import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, FlatList, Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Award, Scissors, MapPin, Clock, DollarSign, X } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { fetchBarberById } from '../../api/barberService';
import { fetchBarbershopById } from '../../api/barbershopService';
import { fetchServicesByShop } from '../../api/serviceService';
import { getReviews } from '../../api/reviewService';
import StarRating from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import WriteReviewDialog from '../../components/WriteReviewDialog';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { BarberDTO, BarbershopDTO, ServiceDTO, ReviewDTO, ReviewType } from '../../models/models';
import { useAuthStore } from '../../store/authStore'; // <--- IMPORT AUTH STORE

interface ExtendedBarberDTO extends BarberDTO {
  barbershopId?: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PLACEHOLDER_PROFILE = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop';
const PLACEHOLDER_GALLERY = [
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop',
];

const BarberDetail = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { barberId } = route.params as { barberId: number };
  
  // Get current logged in user
  const user = useAuthStore((state) => state.user); 

  const [activeTab, setActiveTab] = useState<'about' | 'gallery' | 'reviews'>('about');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // --- API Integration ---

  const { 
    data: barber, 
    isLoading: isBarberLoading, 
    isError: isBarberError 
  } = useQuery<ExtendedBarberDTO>({
    queryKey: ['barber', barberId],
    queryFn: () => fetchBarberById(barberId),
    enabled: !!barberId,
  });

  const shopId = barber?.barbershopId; 

  const { data: shop } = useQuery<BarbershopDTO>({
    queryKey: ['shop', shopId],
    queryFn: () => fetchBarbershopById(shopId!),
    enabled: !!shopId,
  });

  const { data: servicesPage } = useQuery({
    queryKey: ['services', shopId],
    queryFn: () => fetchServicesByShop({ shopId: shopId!, page: 0, size: 20 }),
    enabled: !!shopId,
  });
  const services: ServiceDTO[] = servicesPage?.content || [];

  // Reviews Query
  const { data: reviewsPage, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', ReviewType.BARBER, barberId],
    queryFn: () => getReviews(ReviewType.BARBER, barberId, 0, 20),
    enabled: !!barberId,
  });
  const reviews: ReviewDTO[] = reviewsPage?.content || [];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : barber?.rating?.toFixed(1) ?? '0.0';

  const profilePhoto = barber?.profilePicture || PLACEHOLDER_PROFILE;
  const galleryImages = barber?.workImages?.length ? barber.workImages : PLACEHOLDER_GALLERY;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalVisible(true);
  };

  if (isBarberLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isBarberError || !barber) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={{ color: theme.colors.muted }}>Barber not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <FlatList
            data={activeTab === 'gallery' ? galleryImages : [profilePhoto]}
            horizontal pagingEnabled
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={styles.modalImage} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </Modal>

      {/* Review Write Modal */}
      <WriteReviewDialog 
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        targetId={barberId}
        targetType={ReviewType.BARBER}
        currentUserId={user?.id || 0} // <--- PASS USER ID
        onSuccess={() => {
            refetchReviews();
            setReviewModalVisible(false);
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barber Profile</Text>
        </View>

        {/* Hero Profile */}
        <View style={styles.heroCard}>
          <View style={styles.heroBgContainer}>
            <Image source={{ uri: profilePhoto }} style={styles.heroBgImage} blurRadius={4} />
            <View style={styles.heroOverlay} />
          </View>

          <View style={styles.heroContent}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => openModal(0)}>
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.barberName}>{barber.name}</Text>
              
              {shop && (
                <TouchableOpacity style={styles.locationRow} onPress={() => navigation.navigate('ShopDetail', { shopId: shop.id })}>
                  <MapPin size={12} color={theme.colors.muted} />
                  <Text style={styles.locationText}>{shop.name} — {shop.city}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.ratingRow}>
                <StarRating rating={Number(avgRating)} size={16} />
                <Text style={styles.ratingText}>{avgRating}</Text>
                <Text style={styles.reviewCountText}>({reviews.length} reviews)</Text>
              </View>

              <View style={styles.expRow}>
                <Clock size={12} color={theme.colors.muted} />
                <Text style={styles.expText}>{barber.experienceYears || 0} years experience</Text>
              </View>
            </View>

            {shopId && (
              <TouchableOpacity 
                style={styles.bookBtn}
                onPress={() => navigation.navigate('BookAppointment', { shopId: shopId, shopName: shop?.name || '' })}
              >
                <Text style={styles.bookBtnText}>Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[ 
            { key: 'about', label: 'About' }, 
            { key: 'gallery', label: `Portfolio (${galleryImages.length})` }, 
            { key: 'reviews', label: `Reviews (${reviews.length})` }
          ].map((t) => (
            <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key as any)} style={styles.tabBtn}>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
              {activeTab === t.key && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'about' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.bioText}>{barber.bio || 'No bio available.'}</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Star size={20} color={theme.colors.primary} style={styles.statIcon} />
                <Text style={styles.statValue}>{avgRating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Award size={20} color={theme.colors.primary} style={styles.statIcon} />
                <Text style={styles.statValue}>{barber.experienceYears || 0}yr</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Scissors size={20} color={theme.colors.primary} style={styles.statIcon} />
                <Text style={styles.statValue}>{reviews.length * 47}</Text>
                <Text style={styles.statLabel}>Cuts Done</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Services Offered</Text>
            {services.length === 0 && <Text style={styles.emptyText}>No services listed for this shop.</Text>}
            {services.map((sv) => (
              <TouchableOpacity 
                key={sv.id} 
                style={styles.listItem} 
                onPress={() => navigation.navigate('ServiceDetail', { serviceId: sv.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>{sv.name}</Text>
                  <View style={styles.serviceMeta}>
                    <Clock size={12} color={theme.colors.muted} />
                    <Text style={styles.listItemSub}>{sv.durationMinutes} min</Text>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  {/* <DollarSign size={14} color={theme.colors.primary} /> */}
                  <Text style={styles.priceText}>Rs. {sv.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'gallery' && (
          <View style={styles.section}>
            <View style={styles.galleryGrid}>
              {galleryImages.map((img, i) => (
                <TouchableOpacity key={i} style={styles.galleryItem} onPress={() => openModal(i)}>
                  <Image source={{ uri: img }} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
            </View>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, zIndex: 10 },
  backBtn: { padding: theme.spacing.sm, marginLeft: -theme.spacing.sm },
  headerTitle: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginLeft: theme.spacing.sm },

  heroCard: { marginBottom: theme.spacing.lg },
  heroBgContainer: { height: 180, position: 'relative' },
  heroBgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.background, opacity: 0.6 },
  heroContent: { marginTop: -60, paddingHorizontal: theme.spacing.lg, alignItems: 'center' },
  avatarContainer: { borderWidth: 4, borderColor: theme.colors.background, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  avatarImage: { width: 120, height: 120, borderRadius: 24 },
  infoContainer: { alignItems: 'center', marginTop: theme.spacing.lg, width: '100%' },
  barberName: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs },
  locationText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
  ratingText: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.primary, marginLeft: 6 },
  reviewCountText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 6 },
  expRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md },
  expText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },
  bookBtn: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.radius.md, marginTop: theme.spacing.lg },
  bookBtnText: { color: '#000', fontFamily: theme.fonts.sans, fontWeight: '700', fontSize: 14 },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: theme.spacing.lg },
  tabBtn: { paddingVertical: theme.spacing.md, marginRight: theme.spacing.xl },
  tabText: { color: theme.colors.muted, fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '500' },
  tabTextActive: { color: theme.colors.primary, fontWeight: '600' },
  activeIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: theme.colors.primary },

  section: { padding: theme.spacing.lg },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.lg },
  cardTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
  bioText: { fontSize: 13, fontFamily: theme.fonts.sans, lineHeight: 20, color: theme.colors.muted },
  sectionTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg, gap: theme.spacing.sm },
  statCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, alignItems: 'center' },
  statIcon: { marginBottom: theme.spacing.sm },
  statValue: { fontSize: 16, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  statLabel: { fontSize: 11, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 2 },

  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginBottom: theme.spacing.sm },
  listItemTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  listItemSub: { fontSize: 10, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceText: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '700', color: theme.colors.primary },

  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  galleryItem: { width: '50%', aspectRatio: 1, padding: 4 },
  galleryImage: { width: '100%', height: '100%', borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface },

  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  writeReviewBtn: { backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.md },
  writeReviewBtnText: { color: '#000', fontWeight: '600', fontSize: 12 },
  emptyText: { textAlign: 'center', fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.xl, marginBottom: 20 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  modalImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
});

export default BarberDetail;