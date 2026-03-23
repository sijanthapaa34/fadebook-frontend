import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, DollarSign, Tag, Star, X } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { fetchServiceById } from '../../api/serviceService';
import { fetchBarbersByShop } from '../../api/barberService';
import { getReviews } from '../../api/reviewService'; 
import StarRating from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import WriteReviewDialog from '../../components/WriteReviewDialog';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { ServiceDTO, BarberDTO, ReviewDTO, ReviewType } from '../../models/models';
import { useAuthStore } from '../../store/authStore'; 

interface ExtendedServiceDTO extends ServiceDTO {
  barbershopId?: number; 
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=500&fit=crop';

const ServiceDetail = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { serviceId } = route.params as { serviceId: number };
  
  const user = useAuthStore((state) => state.user); 

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const { 
    data: service, 
    isLoading: isServiceLoading, 
    isError: isServiceError 
  } = useQuery<ExtendedServiceDTO>({
    queryKey: ['service', serviceId],
    queryFn: () => fetchServiceById({ serviceId }),
    enabled: !!serviceId,
  });

  const shopId = service?.barbershopId; 

  const { data: barbersPage, isLoading: isBarbersLoading } = useQuery({
    queryKey: ['barbers', shopId],
    queryFn: () => fetchBarbersByShop({ shopId: shopId!, page: 0, size: 10 }),
    enabled: !!shopId,
  });
  const barbers: BarberDTO[] = barbersPage?.content || [];

  const { data: reviewsPage, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', ReviewType.SERVICE, serviceId],
    queryFn: () => getReviews(ReviewType.SERVICE, serviceId, 0, 10),
    enabled: !!serviceId,
  });
  const reviews: ReviewDTO[] = reviewsPage?.content || [];

  const openModal = (index: number) => { 
    setSelectedImageIndex(index); 
    setIsModalVisible(true); 
  };

  if (isServiceLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isServiceError || !service) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={{ color: theme.colors.muted }}>Service not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = [PLACEHOLDER_IMAGE];

  return (
    <View style={styles.container}>
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <FlatList 
            data={images} 
            horizontal 
            pagingEnabled 
            initialScrollIndex={selectedImageIndex} 
            // FIX: Corrected syntax for getItemLayout
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index
            })}
            // FIX: Added renderItem
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={styles.modalImage} resizeMode="contain" />
              </View>
            )} 
            keyExtractor={(item) => item} 
          />
        </View>
      </Modal>

      <WriteReviewDialog 
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        targetId={serviceId}
        targetType={ReviewType.SERVICE}
        currentUserId={user?.id || 0}
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
          <Text style={styles.headerTitle}>Service Details</Text>
        </View>

        {/* Featured Image */}
        <TouchableOpacity onPress={() => openModal(0)} activeOpacity={0.9}>
          <Image source={{ uri: images[0] }} style={styles.featuredImage} />
        </TouchableOpacity>

        {/* Service Card */}
        <View style={styles.card}>
          <View style={styles.serviceHeader}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description || 'No description available'}</Text>
            </View>
            <Text style={styles.servicePrice}>Rs. {service.price}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={theme.colors.muted} />
              <Text style={styles.metaText}>{service.durationMinutes} min</Text>
            </View>
             <View style={styles.metaItem}>
              <Tag size={14} color={theme.colors.muted} />
              <Text style={styles.metaText}>Service</Text>
            </View>
          </View>

          {shopId && (
            <TouchableOpacity 
              style={styles.bookBtn} 
              onPress={() => navigation.navigate('BookAppointment', { 
                shopId: shopId, 
                shopName: service.barbershop || 'Barbershop' 
              })}
            >
              <Text style={styles.bookBtnText}>Select Service & Book</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Barbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Barbers</Text>
          
          {isBarbersLoading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 10 }} />
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
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{b.name}</Text>
                    <Text style={styles.listItemSub}>{b.bio || 'Barber'}</Text>
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

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewModalVisible(true)}>
                <Text style={styles.writeReviewBtnText}>Write a Review</Text>
            </TouchableOpacity>
          </View>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet.</Text>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} canReply={false} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
  backBtn: { padding: theme.spacing.sm, marginLeft: -theme.spacing.sm },
  headerTitle: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginLeft: theme.spacing.sm },
  
  featuredImage: { width: '100%', height: 220, backgroundColor: theme.colors.surface },

  card: { backgroundColor: theme.colors.card, marginHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  serviceName: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  serviceDescription: { fontSize: 13, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 4 },
  servicePrice: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  
  metaRow: { flexDirection: 'row', marginBottom: theme.spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 6 },
  
  bookBtn: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center' },
  bookBtnText: { color: '#000', fontFamily: theme.fonts.sans, fontWeight: '700', fontSize: 14 },

  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl },
  sectionTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md },

  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  barberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  barberAvatarImage: { width: '100%', height: '100%' },
  barberInitial: { fontSize: 16, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary },
  listItemContent: { flex: 1, marginLeft: 12 },
  listItemTitle: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text },
  listItemSub: { fontSize: 10, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: theme.radius.sm },
  ratingBadgeText: { fontSize: 12, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 },

  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  writeReviewBtn: { backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.md },
  writeReviewBtnText: { color: '#000', fontWeight: '600', fontSize: 12 },
  emptyText: { textAlign: 'center', fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.lg },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  modalImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
});

export default ServiceDetail;