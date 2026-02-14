// CustomerDashboard.tsx
// React Native version of ShopFinder component

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, MapPin, Star, Clock } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import type { RootStackParamList } from '../../navigation/NavigationService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data for shops
const seedShops = [
  {
    id: '1',
    name: 'The Classic Cut',
    address: '123 Main Street',
    city: 'New York',
    rating: 4.9,
    reviewCount: 245,
    openingHours: '9:00 AM - 8:00 PM',
  },
  {
    id: '2',
    name: 'Urban Fades',
    address: '456 Broadway',
    city: 'Brooklyn',
    rating: 4.7,
    reviewCount: 189,
    openingHours: '10:00 AM - 9:00 PM',
  },
  {
    id: '3',
    name: "Gentleman's Quarters",
    address: '789 Park Ave',
    city: 'Manhattan',
    rating: 4.8,
    reviewCount: 312,
    openingHours: '8:00 AM - 7:00 PM',
  },
  {
    id: '4',
    name: 'Precision Cuts',
    address: '321 Oak Lane',
    city: 'Queens',
    rating: 4.6,
    reviewCount: 156,
    openingHours: '9:00 AM - 6:00 PM',
  },
];

const CustomerDashboard = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const filtered = seedShops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleShopPress = (shopId: string) => {
    // navigation.navigate('BookShop', { shopId });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Find Barbershops</Text>
        <Text style={styles.subtitle}>Discover top-rated shops near you</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name or city..."
          placeholderTextColor={theme.colors.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <MapPin size={32} color={theme.colors.primary} />
        <Text style={styles.mapTitle}>Google Maps integration placeholder</Text>
        <Text style={styles.mapSubtitle}>Connect API key to enable live map</Text>
      </View>

      {/* Shop List */}
      <View style={styles.shopList}>
        {filtered.map((shop) => (
          <TouchableOpacity
            key={shop.id}
            style={styles.shopCard}
            onPress={() => handleShopPress(shop.id)}
            activeOpacity={0.7}
          >
            <View style={styles.shopHeader}>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <View style={styles.addressRow}>
                  <MapPin size={12} color={theme.colors.muted} />
                  <Text style={styles.addressText}>
                    {shop.address}, {shop.city}
                  </Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Star size={14} color={theme.colors.primary} fill={theme.colors.primary} />
                <Text style={styles.ratingText}>{shop.rating}</Text>
              </View>
            </View>

            <View style={styles.shopFooter}>
              <View style={styles.hoursRow}>
                <Clock size={12} color={theme.colors.muted} />
                <Text style={styles.hoursText}>{shop.openingHours}</Text>
              </View>
              <Text style={styles.reviewCount}>{shop.reviewCount} reviews</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State */}
      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No shops found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search</Text>
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
  headerSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.serif,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.text,
  },
  mapPlaceholder: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    height: 180,
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
  },
  mapSubtitle: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  shopList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  shopCard: {
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  shopInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  shopName: {
    fontSize: 16,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addressText: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  hoursText: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.sans,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    color: theme.colors.muted,
  },
});

export default CustomerDashboard;